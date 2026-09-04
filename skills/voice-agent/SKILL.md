---
name: voice-agent
description: >
  Build a real-time voice agent on Deepgram's Voice Agent API: one WebSocket at
  wss://agent.deepgram.com/v1/agent/converse that runs speech-to-text, a language model
  (Deepgram-hosted or your own endpoint), and text-to-speech, with barge-in, mid-call
  updates, and function calling that your own client executes. Use when someone says
  "voice agent", "voice bot", "speech-to-speech", "talk to an AI on the phone",
  "agent.deepgram.com", "Settings message", "FunctionCallRequest", "barge-in",
  "Twilio voice agent", or asks whether to build on Deepgram directly or through
  LiveKit Agents, Pipecat, Vapi, or Retell. Routes to the api, docs, starters, recipes,
  examples, and per-language SDK skills for the full reference.
---

# Deepgram Voice Agent API

Audio in, audio out, one connection. Deepgram runs the listen, think, and speak stages and the turn-taking between them. Your code streams the user's audio, plays the agent's audio, and answers function calls. [1][2]

## Decide first: the Voice Agent API or an orchestrator

Both paths are supported; Deepgram publishes guides for LiveKit Agents and Pipecat. Choose by who should own the pipeline.

| Build on the Voice Agent API when | Use an orchestrator (LiveKit Agents, Pipecat, Vapi, Retell) with Deepgram STT and TTS underneath when |
|---|---|
| You want one WebSocket and no pipeline code. End-of-turn detection, barge-in, and the handoffs between stages are handled in-process. [2] | You already run that framework, or you need its transport (for example WebRTC rooms) and client libraries. |
| A Deepgram-managed LLM (OpenAI, Anthropic, Google, NVIDIA) billed through your Deepgram account is fine, or you point `think.endpoint` at your own OpenAI-compatible endpoint. [6] | You need per-stage control the agent does not expose: your own LLM loop, a TTS vendor Deepgram does not proxy, custom voice activity detection, or your own turn logic. |
| Your tools can run in your client or behind an HTTP endpoint you own (`FunctionCallRequest` / `FunctionCallResponse`). [9][10] | Your tools live inside the framework's agent runtime. |

For the orchestrator path, load the `examples` skill (LiveKit, Pipecat) and the SDK `conversational-stt` and `text-to-speech` skills. Deepgram's Pipecat guide runs Flux STT and Flux TTS (`flux-alexis-en`) underneath; the LiveKit guide starts on `nova-3` and `aura-2-thalia-en` and shows `flux-general-en` and `flux-alexis-en` as the Flux swap. [14] The rest of this skill covers the Voice Agent API path.

## First request

The agent host is `agent.deepgram.com`; `api.deepgram.com` serves the other APIs. This call lists the LLM models Deepgram can run for you; check a `think.provider.model` value here before it goes into `Settings`. [6]

```bash
curl -s https://agent.deepgram.com/v1/agent/settings/think/models \
  -H "Authorization: Token $DEEPGRAM_API_KEY"
# 200 {"models":[{"id":"gpt-4o-mini","name":"...","provider":"open_ai"}, ...]}
```

This catalog endpoint answers without a key; the key is first checked at the WebSocket handshake below.

Then open the WebSocket to `wss://agent.deepgram.com/v1/agent/converse` with the same `Authorization: Token <key>` header. The URL takes no query parameters; all configuration goes in the `Settings` message. [1][3] EU and AU regional hosts are listed on the Build a Voice Agent page. [1] A browser cannot set headers on a WebSocket, so mint a short-lived JWT server-side with `POST https://api.deepgram.com/v1/auth/grant` (needs a Member-scope key; 30-second TTL by default, up to 3,600 with `ttl_seconds`) and pass the token as the `Sec-WebSocket-Protocol` value on the handshake, the way the Browser Agent SDK does. The token only has to be valid at the handshake. [4]

## Connect, configure, stream

1. Connect. Wait for `{"type":"Welcome","request_id":"..."}`. Send nothing before it. [5]
2. Send one `Settings` message. Wait for `{"type":"SettingsApplied"}`. Send no audio and no inject messages before it. [5]
3. Stream raw audio as binary WebSocket frames. Play the binary frames you receive. JSON events arrive as text frames on the same socket, so branch on frame type first. [5]

```json
{
  "type": "Settings",
  "audio": {
    "input":  { "encoding": "linear16", "sample_rate": 16000 },
    "output": { "encoding": "linear16", "sample_rate": 24000, "container": "none" }
  },
  "agent": {
    "listen": { "provider": { "type": "deepgram", "version": "v2", "model": "flux-general-en" } },
    "think": {
      "provider": { "type": "open_ai", "model": "gpt-4o-mini", "temperature": 0.7 },
      "prompt": "You are a concise phone assistant. Reply in one or two sentences.",
      "functions": [ { "name": "get_weather", "description": "Current weather for a location",
        "parameters": { "type": "object", "properties": { "location": { "type": "string" } }, "required": ["location"] } } ]
    },
    "speak": { "provider": { "type": "deepgram", "version": "v2", "model": "flux-alexis-en" } },
    "greeting": "Hi, how can I help?"
  }
}
```

Field notes, from the configure and model pages [3][6][7][8]:

- `listen`: Flux (`flux-general-en`, or `flux-general-multi` with `language_hints`) requires `"version": "v2"` and gives model-integrated end-of-turn detection. Nova (`nova-3`) uses `v1`, the default, and adds `smart_format` and `language`. Drop `version` with a Flux model and the agent falls back to the v1 endpoint, where `flux-general-en` is not a valid model. [7][20]
- `think`: `provider.type` is `open_ai`, `anthropic`, `google`, or `nvidia` (managed; `endpoint` optional) or `groq` or `aws_bedrock` (`endpoint` required). Bring your own LLM by keeping `type: open_ai` and setting `endpoint.url` to any OpenAI Chat Completions-compatible URL, with `endpoint.headers` for its auth. Pass an array of providers to get an ordered fallback chain. Managed-LLM prompts are limited to 25,000 characters. [6]
- `speak`: `"version": "v2"` selects Flux TTS (`flux-{voice}-{language}`); `v1`, the default when you name a provider, selects Aura (`aura-2-thalia-en`). Omit `agent.speak` entirely and you get Flux TTS with `flux-kit-en`. Flux TTS streams raw audio only: `encoding` must be `linear16`, `mulaw`, or `alaw`, `container` must be `none`, and `mp3` or `wav` returns `INVALID_SETTINGS`. Third-party TTS (`open_ai`, `eleven_labs`, `cartesia`, `aws_polly`) takes an `endpoint`, except Deepgram-managed Cartesia, which needs none. [8]
- `agent.context.messages` replays earlier turns as `{"type":"History","role":"user","content":"..."}` so a new session continues an old one. [3]

## Message lifecycle

| From | Message | What to do |
|---|---|---|
| server | `Welcome` | Send `Settings`. [5] |
| server | `SettingsApplied` | Start streaming audio. [5] |
| server | `UserStartedSpeaking` | Barge-in. Stop playback now and discard every buffered agent audio frame. [11] |
| server | `ConversationText` (`role` is `user` or `assistant`, `content`) | Show the transcript. [11] |
| server | `AgentThinking` (`content`) | Optional status. The LLM is working, possibly choosing a function. [11] |
| server | `FunctionCallRequest` | See the next section. [9] |
| server | `AgentStartedSpeaking` (`total_latency`, `tts_latency`, `ttt_latency`) | The reply's audio is starting; the fields are seconds. [12] |
| server | binary frames | Agent audio. Queue it for playback. [5] |
| server | `AgentAudioDone` | Last chunk sent. The user may still be hearing buffered audio, so treat your output queue as the end-of-playback signal rather than this event. [11] |
| server | `Error` / `Warning` (`code`, `description`) | `Error` ends the session; reconnect. `Warning` is informational. [13] |
| client | `KeepAlive` | Only while you are not sending audio, one every 8 seconds. It does not extend the 2-hour session limit. [15] |

Mid-call updates, each acknowledged by a matching `*Updated` event [16]:

- `UpdatePrompt` `{"type":"UpdatePrompt","prompt":"..."}` adds to the current prompt; it does not replace it. Ack: `PromptUpdated`. [16]
- `UpdateSpeak` `{"type":"UpdateSpeak","speak":{"provider":{...}}}` changes the voice. With Flux TTS the new voice starts on the next turn. Ack: `SpeakUpdated`. [16]
- `UpdateListen` adjusts Flux end-of-turn thresholds, keyterms, and language hints. `UpdateThink` replaces the whole think block, functions included. Acks: `ListenUpdated`, `ThinkUpdated`. `ForceEndTurn` ends the user's turn now and needs a Flux (`v2`) listen provider. [16][17]
- `InjectAgentMessage` `{"type":"InjectAgentMessage","message":"...","behavior":"default"}` makes the agent speak. `default` and `queue` are refused with `InjectionRefused` while the user is speaking; `queue` waits behind the agent's own turn; only `interrupt` is never refused. `InjectUserMessage` `{"type":"InjectUserMessage","content":"..."}` sends typed user text. [18][5]

## Function calling: your client runs the call

Define functions under `agent.think.functions` with `name`, `description`, and JSON-schema `parameters`. Leave out `endpoint` and the function is client-side. Add `endpoint` (`url`, `method`, `headers`) and Deepgram calls that HTTP endpoint itself. [3][12][19]

The server sends one `FunctionCallRequest` with a `functions` array. Each item has `id`, `name`, `arguments` (a JSON string; parse it), `client_side`, and sometimes `thought_signature`. [9]

- `client_side: true`: run the function, then send `{"type":"FunctionCallResponse","id":"<same id>","name":"get_weather","content":"<result text or JSON string>"}`. Pass `thought_signature` back unchanged when present. The agent speaks once your response arrives. [9][10]
- `client_side: false`: the server ran it (an `endpoint` function). No client action; the server's own `FunctionCallResponse` is informational. [10]

During a slow call, send `InjectAgentMessage` with `behavior: "queue"` ("One moment while I look that up"). [18] A call to a name you did not define ends the session with `NON_EXISTENT_FUNCTION_CALLED`. [13]

## Telephony

Twilio Media Streams: answer the call with TwiML `<Connect><Stream url="wss://your-host/media"/>`. It is bidirectional; `<Start><Stream>` cannot carry the agent's voice. Set both `audio.input` and `audio.output` to `mulaw` at `8000` with `container: none`, base64-decode each Twilio `media` payload and send it as a binary frame, base64-encode agent audio back into Twilio `media` frames, and on `UserStartedSpeaking` send Twilio `{"event":"clear","streamSid":...}` so it drops its buffered audio. Working bridges: `deepgram-devs/twilio-voice-agent` (Python SDK) and `deepgram-devs/sts-twilio` (raw WebSocket). [20] The examples repository, which the `examples` skill routes to, has the Node version, `021-twilio-voice-agent-node`. [21]

Other platforms with Deepgram guides: Genesys Cloud CX (Audio Connector), Amazon Connect, AudioCodes LiveHub, plus inbound and outbound reference apps. [2][22] The documentation index lists no SIP guide; bring SIP calls through one of those platforms or a gateway that yields a WebSocket audio stream. [23]

## Pricing

The Voice Agent API is billed per minute of WebSocket connection time, and a Deepgram-managed LLM is billed through the same account. Speech-to-text alone is per minute of audio; text-to-speech alone is per 1,000 characters. Rates change; read <https://deepgram.com/pricing>. [1][24]

## Common mistakes

1. `Authorization: Bearer <api key>` returns 401. API keys use the `Token` scheme. `Bearer` is only for JWTs from `/v1/auth/grant`. [4][25]
2. REST calls sent to `agent.deepgram.com`, or the agent socket opened on `api.deepgram.com`. Only `/v1/agent/*` lives on the agent host; the published OpenAPI lists the agent host first, so generated clients need an explicit base URL. [1][26]
3. Any message before `Welcome`, audio before `SettingsApplied`, or a second `Settings`: `NON_SETTINGS_MESSAGE_BEFORE_SETTINGS` or `SETTINGS_ALREADY_APPLIED`. One `Settings` per connection; reconnect to change it. [5][13]
4. A model name that does not exist. On `/v1/listen` and `/v1/speak` it returns the same 403 body as a model your project cannot use, `{"err_code":"INSUFFICIENT_PERMISSIONS",...}` (verified live 2026-09-03). Check `GET https://api.deepgram.com/v1/models` first. There is no model named `nova-3-conversational`; conversational STT is `flux-general-en` with `version: v2`. [27][7]
5. A declared audio format that does not match the bytes: `USER_AUDIO_FORMAT`. Encoding and sample rate in `Settings` must match what you stream. [13]
6. Parsing every frame as JSON. Agent audio is binary. The same applies to `/v1/speak` and `/v2/speak`, whose success body is audio, so branch on frame type or HTTP status before parsing. [5][26]
7. Not stopping playback on `UserStartedSpeaking`. Deepgram already stopped generating; the leftover in your buffer (or Twilio's) is what talks over the caller. [11][20]
8. Expecting `UpdatePrompt` to replace the prompt. It appends. Use `UpdateThink` to replace. [16][17]
9. Leaning on `KeepAlive` past two hours. Sessions close at 2:00:00 after a warning at 1:55; start a new session and pass the old turns in `agent.context`. [13][15]

## Use a different skill when

- You need the full message schema (every `Settings` field, every client and server message): `api` skill, `references/agent.md`, or the AsyncAPI-derived reference. [12]
- You want a runnable app to clone: `starters` skill, feature `voice-agent` (node, bun, deno, flask, django, fastapi, go, java, csharp, ruby, php, cpp, rust). [28]
- You want a minimal snippet for one feature (`connect`, `custom-llm`, `custom-tts`, `function-calling`): `recipes` skill. [29]
- You are wiring a third-party platform (Twilio, LiveKit, Pipecat, Vonage, SignalWire, CrewAI, OpenAI Agents SDK): `examples` skill. [21]
- You want language-idiomatic code: `deepgram-js-voice-agent`, `deepgram-python-voice-agent`, `deepgram-java-voice-agent`, `deepgram-rust-voice-agent`, `deepgram-dotnet-voice-agent`, or `deepgram-go-voice-agent`. The Go SDK v3 ships an agent WebSocket client under `pkg/client/agent/v1/websocket`, even though its open issue #321 (filed automatically in March 2026) still asks for one; check the package before relying on it, and the raw protocol above always works. [30]
- You only need transcription with turn detection, or only synthesis: the SDK `conversational-stt`, `speech-to-text`, or `text-to-speech` skills.
- You want to find a docs page: `docs` skill. You want the MCP server: `setup-mcp` skill.

## Sources

1. https://developers.deepgram.com/docs/build-a-voice-agent (endpoint, regional hosts, usage by connection time)
2. https://developers.deepgram.com/docs/voice-agent-architecture
3. https://developers.deepgram.com/docs/configure-voice-agent
4. https://developers.deepgram.com/guides/fundamentals/token-based-authentication and https://developers.deepgram.com/reference/auth/tokens/grant
5. https://developers.deepgram.com/docs/voice-agent-message-flow
6. https://developers.deepgram.com/docs/voice-agent-llm-models
7. https://developers.deepgram.com/docs/voice-agent-stt-models
8. https://developers.deepgram.com/docs/voice-agent-tts-models
9. https://developers.deepgram.com/docs/voice-agent-function-call-request
10. https://developers.deepgram.com/docs/voice-agent-function-call-response
11. Server event pages: https://developers.deepgram.com/docs/voice-agent-user-started-speaking, https://developers.deepgram.com/docs/voice-agent-conversation-text, https://developers.deepgram.com/docs/voice-agent-agent-thinking, https://developers.deepgram.com/docs/voice-agent-agent-audio-done
12. https://developers.deepgram.com/reference/voice-agent/voice-agent (AsyncAPI; `AgentStartedSpeaking` fields)
13. https://developers.deepgram.com/docs/voice-agent-errors-warnings
14. https://developers.deepgram.com/docs/livekit-integration and https://developers.deepgram.com/docs/pipecat-integration
15. https://developers.deepgram.com/docs/agent-keep-alive
16. https://developers.deepgram.com/docs/voice-agent-acknowledgements, https://developers.deepgram.com/docs/voice-agent-update-listen, https://developers.deepgram.com/docs/voice-agent-update-prompt, https://developers.deepgram.com/docs/voice-agent-update-speak
17. https://developers.deepgram.com/docs/voice-agent-update-think and https://developers.deepgram.com/docs/voice-agent-force-end-turn
18. https://developers.deepgram.com/docs/voice-agent-inject-agent-message and https://developers.deepgram.com/docs/voice-agent-inject-user-message
19. https://developers.deepgram.com/docs/build-a-function-call
20. https://developers.deepgram.com/docs/twilio-and-deepgram-voice-agent
21. https://github.com/deepgram/examples (directories `021-twilio-voice-agent-node`, `030-livekit-agents-python`, `080-pipecat-voice-pipeline-python`)
22. https://developers.deepgram.com/docs/inbound-telephony-agent and https://developers.deepgram.com/docs/genesys-and-deepgram-voice-agent
23. https://developers.deepgram.com/llms.txt (full docs index; no SIP entry as of 2026-09-03)
24. https://deepgram.com/pricing (Voice Agent "calculated based on websocket connection time"; TTS "per 1,000 characters of input text")
25. https://developers.deepgram.com/reference/authentication
26. https://developers.deepgram.com/openapi.yaml (top-level `servers` lists `https://agent.deepgram.com` before `https://api.deepgram.com`, checked 2026-09-03) and the `api` skill's "Common Mistakes" section
27. https://developers.deepgram.com/reference/manage/models/list (live catalog checked 2026-09-03: no `nova-3-conversational`)
28. https://developers.deepgram.com/docs/voice-agent-template-apps and https://github.com/deepgram-starters (the docs page omits Java; `java-voice-agent` exists in the org, checked 2026-09-03)
29. https://github.com/deepgram/recipes/blob/main/COVERAGE.md
30. https://github.com/deepgram/deepgram-go-sdk (`.agents/skills/deepgram-go-voice-agent`, module `github.com/deepgram/deepgram-go-sdk/v3`) and https://github.com/deepgram/deepgram-go-sdk/issues/321
