---
name: voice-agent
description: >
  Build a real-time voice agent on Deepgram's Voice Agent API: one WebSocket at
  wss://agent.deepgram.com/v1/agent/converse that runs speech-to-text, a language model
  (Deepgram-hosted or your own endpoint), and text-to-speech, with barge-in, mid-call
  updates, and function calling that your own client executes. Use when someone says
  "voice agent", "voice bot", "speech-to-speech", "talk to an AI on the phone",
  "agent.deepgram.com", "Settings message", "FunctionCallRequest", "barge-in",
  "reusable agent configuration", "defer_until_eot",
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

For the orchestrator path, load the `examples` skill (LiveKit, Pipecat) and the SDK `conversational-stt` and `text-to-speech` skills. Deepgram's Pipecat guide runs Flux STT and Flux TTS (`flux-alexis-en`) underneath. The LiveKit guide runs three stages: LiveKit Inference (`deepgram/aura-2` voice `thalia`, hosted and billed through LiveKit Cloud with no Deepgram API key), the Deepgram plugin with your own key on `nova-3` and `aura-2-thalia-en`, then `STTv2` `flux-general-en` and `TTSv2` `flux-alexis-en` as the Flux STT and Flux TTS swap. [14] The rest of this skill covers the Voice Agent API path.

## First request

The agent host is `agent.deepgram.com`; `api.deepgram.com` serves the other APIs. This call lists the LLM models Deepgram can run for you; check a `think.provider.model` value here before it goes into `Settings`. The endpoint is public: the `Authorization` header is optional and the call answers 200 without it, so it also confirms the host is reachable before you spend a key on the socket. [6]

```bash
curl -s https://agent.deepgram.com/v1/agent/settings/think/models \
  -H "Authorization: Token $DEEPGRAM_API_KEY"   # header optional on this endpoint
# 200 {"models":[{"id":"gpt-4o-mini","name":"...","provider":"open_ai"}, ...]}
```

Then open the WebSocket to `wss://agent.deepgram.com/v1/agent/converse` with the same `Authorization: Token <key>` header. The URL takes no query parameters; all configuration goes in the `Settings` message. [1][3][41] Regional endpoints are `wss://api.eu.deepgram.com`, `wss://api.au.deepgram.com`, and `wss://api.in.deepgram.com`, each on the same `/v1/agent/converse` path. [1][37] A browser cannot set headers on a WebSocket, so mint a short-lived JWT server-side with `POST https://api.deepgram.com/v1/auth/grant` (needs a Member-scope key; the TTL defaults to 30 seconds and `ttl_seconds` sets it longer; tokens from this endpoint do not work with the Manage APIs) and pass the token as the `Sec-WebSocket-Protocol` value on the handshake, the way the Browser Agent SDK does. The token only has to be valid at the handshake. [4]

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

- `listen`: Flux STT (`flux-general-en`, or `flux-general-multi` with `language_hints`) requires `"version": "v2"` and gives model-integrated end-of-turn detection. Nova (`nova-3`) uses `v1`, the default, and adds `smart_format` and `language`. Drop `version` with a Flux STT model and the agent falls back to the v1 endpoint, where `flux-general-en` is not a valid model. The top-level `agent.language` is deprecated; set `listen.provider.language` (and, for third-party TTS, `speak.provider.language`) instead. [7][20][3]
- `think`: `provider.type` is `open_ai`, `anthropic`, `google`, or `nvidia` (managed; `endpoint` optional) or `groq` or `aws_bedrock` (bring your own; `endpoint` required). [6]
  - `google`: `provider.version` picks the API: `ai-studio-v1beta` (AI Studio; `v1beta` is an alias) or `gemini-enterprise-agent-v1` (Gemini Enterprise Agent, regional endpoints, fewer models). Omitted, it defaults to `ai-studio-v1beta` on `agent.deepgram.com`, `api.au.deepgram.com`, and `api.in.deepgram.com`, and to `gemini-enterprise-agent-v1` on `api.eu.deepgram.com`. [37]
  - `aws_bedrock` authenticates with `provider.credentials` (`type` `iam`, or `sts` plus `session_token`, with `region`, `access_key_id`, and `secret_access_key`) and points `endpoint.url` at `https://bedrock-runtime.{region}.amazonaws.com/`. [6]
  - Bring your own LLM by keeping `type: open_ai` and setting `endpoint.url` to any OpenAI Chat Completions-compatible URL, with `endpoint.headers` for its auth. [6]
  - Pass an array of providers to get an ordered fallback chain: a request that fails or times out produces a `THINK_REQUEST_FAILED` warning and goes to the next provider, every turn starts again from the first, and when all of them fail the session gets a `FAILED_TO_THINK` error and the turn produces no reply. Managed-LLM prompts are limited to 25,000 characters; a longer prompt is truncated with a `PROMPT_TOO_LONG` warning, not rejected. [6][13]
  - `nvidia`: the LLM models page lists `nemotron-3-nano-30B-A3B` while the models endpoint above returns `nvidia/nemotron-3.5-lightning-30b-a3b`; the endpoint is what the API accepts, so send the string it returns. [6]
- `speak`: `"version": "v2"` selects Flux TTS (`flux-{voice}-{language}`); `v1`, the default when you name a provider, selects Aura (`aura-2-thalia-en`). Omit `agent.speak` entirely and you get Flux TTS with `flux-kit-en`. [8][3]
  - Flux TTS streams raw audio only: `encoding` must be `linear16`, `mulaw`, or `alaw` and `container` must be `none`. The full `audio.output.encoding` enum is `linear16`, `mulaw`, `alaw`, `mp3`, `opus`, `flac`, or `aac`, `container` is `none`, `wav`, or `ogg`, and `audio.output.bitrate` is bits per second; the compressed encodings, a container such as `wav`, and `bitrate` are Aura only, and Flux TTS answers any of them with `INVALID_SETTINGS`. [38][3]
  - `provider.speed` (default `1.0`) is `0.5` to `1.5` in `0.05` steps on Flux TTS and any value from `0.7` to `1.5` on Aura; a value the family does not accept ends the session with `FAILED_TO_SPEAK`. `provider.expressivity` (whole numbers `-2` to `2`, default `0`) is Flux TTS (`v2`) only and fixed for the session; it is beta and `0` is the only value validated for production. [34]
  - Third-party TTS (`open_ai`, `eleven_labs`, `cartesia`, `aws_polly`) takes an `endpoint` with `url` and `headers`, and `wss` URLs are accepted for Eleven Labs only; `aws_polly` also requires `credentials` (`type` `sts` or `iam`, with `region`, `access_key_id`, `secret_access_key`, and `session_token` for STS). Deepgram-managed Cartesia (`type: cartesia` with no `endpoint`) is the exception. [8][12]
  - `provider.language` is for Cartesia and Eleven Labs; Deepgram voices carry their language in the model name (`flux-kit-en`, `aura-2-sirio-es`) and a Deepgram provider given `language` is rejected with `UNPARSABLE_CLIENT_MESSAGE`. [3][8]
  - `speak` also takes an array of providers as an ordered fallback chain: a failed request produces a `SPEAK_REQUEST_FAILED` warning and goes to the next provider, and when all of them fail the session ends with `FAILED_TO_SPEAK`. [8][12]
- `agent.context.messages` replays earlier turns as `{"type":"History","role":"user","content":"..."}` or `{"type":"History","function_calls":[{"id","name","client_side","arguments","response"}]}` so a new session continues an old one. While `Settings.flags.history` is `true` (the default) the server sends `History` messages in the same two shapes; set it to `false` to turn them off. [3][35]
- Other knobs, with ranges in `references/agent.md` in the `api` skill: `think.context_length` (`max` or a character count; custom `think.endpoint` only), `think.provider.reasoning_mode` (`none`, `minimal`, `low`, `medium`, or `high` in the AsyncAPI reference [12], on `open_ai` and `groq`; the configure page lists only `low`, `medium`, and `high`, for OpenAI reasoning models such as `gpt-5` and `gpt-5-mini` [3]), and the top-level `tags`, `experimental`, and `mip_opt_out`. [3][12]
- Conversational Mode (`agent.think_conversational.provider`: backchanneling, presence checks, frustration detection) is invite-only Early Access; a `Settings` message that names it from an unenrolled project is rejected with `UNPARSABLE_CLIENT_MESSAGE`. [36]

## Reusable agent configurations

`Settings.agent` is either the full `agent` object above or a Reusable Agent Configuration UUID string, the same `agent: "YOUR_AGENT_ID"` form the Browser Agent SDK takes. Create one with `POST https://api.deepgram.com/v1/projects/{project_id}/agents` and a body whose `config` is the JSON string of the `agent` block (plus optional `metadata`); the response's `agent_id` is the UUID. `GET .../agents` lists them, `GET .../agents/{agent_id}` reads one, `PUT .../agents/{agent_id}` changes `metadata` only (`config` is immutable; delete and recreate to change it), and `DELETE .../agents/{agent_id}` removes it. Deleting a configuration that a running service still references breaks that service, so move its sessions to a new UUID first. A `Settings` message with a UUID that does not resolve ends the session with `INVALID_AGENT_ID`; `AGENT_ID_NOT_SUPPORTED` means the server does not resolve UUIDs at all (a self-hosted build in unauthenticated mode). [32][13]

Template variables, at `POST/GET /v1/projects/{project_id}/agent-variables` and `GET/PATCH/DELETE .../agent-variables/{variable_id}`, hold values a `config` references by key in the `DG_<NAME>` form (uppercase letters, digits, `_`, `-`), written unquoted inside the JSON string. A variable can stand in for any JSON value, a whole provider object included, and `is_sensitive` must be `false`. Every project member can read configurations and variables, so keep API keys and passwords out of them. Full request and response schemas: `references/agent.md` in the `api` skill. [32]

## Message lifecycle

There is no separate logging API. For per-session observability, persist every non-audio frame in both directions, keyed to the `request_id` from `Welcome`. [40][41]

| From | Message | What to do |
|---|---|---|
| server | `Welcome` | Send `Settings`. [5] |
| server | `SettingsApplied` | Start streaming audio. [5] |
| server | `UserStartedSpeaking` | Barge-in. Stop playback now and discard every buffered agent audio frame. [11] |
| server | `ConversationText` (`role` is `user` or `assistant`, `content`; with `flux-general-multi`, user-role messages also carry `languages_hinted` and `languages`, BCP-47 arrays, the second sorted by word count descending) | Show the transcript. [11] |
| server | `AgentThinking` (`content`) | Optional status. The LLM is working, possibly choosing a function. [11] |
| server | `FunctionCallRequest` | See the next section. [9] |
| server | `FunctionCallCancelled` (`functions[]` with `id`, `name`) | The user started speaking again. Stop work on each `id` and do not send a `FunctionCallResponse` for it; a late one is dropped. [33] |
| server | `AgentStartedSpeaking` | The reply's audio is starting. [12] |
| server | `LatencyReport` | Per-turn latency breakdown, sent automatically after each turn: `stt_latency`, `ttt_token_latency`, `ttt_text_latency`, `ttt_tool_latency`, `ttt_thinking_latency`, `tts_latency`, `total_latency`. All are floats in seconds and each is optional, so read them defensively. [31] |
| server | binary frames | Agent audio. Queue it for playback. [5] |
| server | `AgentAudioDone` | Last chunk sent. The user may still be hearing buffered audio, so treat your output queue as the end-of-playback signal rather than this event. [11] |
| server | `Error` / `Warning` (`code`, `description`) | `Error` ends the session; reconnect. `MAXIMUM_SESSION_LENGTH_REACHED` is the 2-hour close; `FAILED_TO_THINK` and `FAILED_TO_SPEAK` mean every provider in the chain failed. `Warning` is informational: `MAXIMUM_SESSION_LENGTH_APPROACHING` at 1:55, `PROMPT_TOO_LONG`, `THINK_REQUEST_FAILED`, and `SPEAK_REQUEST_FAILED`; the `think` and `speak` field notes give each one's meaning. [13] |
| client | `KeepAlive` | Only while you are not sending audio, one every 8 seconds. It does not extend the 2-hour session limit. [15] |

Mid-call updates, each acknowledged by a matching `*Updated` event [16]:

- `UpdatePrompt` `{"type":"UpdatePrompt","prompt":"..."}` adds to the current prompt; it does not replace it. To replace the prompt, send `UpdateThink`. The update-prompt page, which owns the message, says it adds; the conversation-context page says it replaces. Ack: `PromptUpdated`. [16][39]
- `UpdateSpeak` `{"type":"UpdateSpeak","speak":{"provider":{...}}}` changes the voice. With Flux TTS the new voice starts on the next turn. Ack: `SpeakUpdated`. [16]
- `UpdateListen` changes the listen `model` and `language` mid-session and, on a Flux STT (`v2`) provider, the end-of-turn thresholds and language hints; keyterms update mid-session on Flux STT models only. It is a partial update, with one exception: `language_hints` is cleared when omitted, so re-send it on every `UpdateListen` that should keep language biasing. Ack: `ListenUpdated`. [16][17]
- `UpdateThink` replaces the whole think block, functions included. Ack: `ThinkUpdated`. [16]
- `ForceEndTurn` ends the user's turn now and needs a Flux STT (`v2`) listen provider: with any other listen provider the server sends a `FORCE_END_TURN_UNSUPPORTED` warning and the turn does not end, and with no turn in progress it is ignored silently. [17]
- `InjectAgentMessage` `{"type":"InjectAgentMessage","message":"...","behavior":"default"}` makes the agent speak. `default` and `queue` are refused with `InjectionRefused` while the user is speaking; `queue` waits behind the agent's own turn; only `interrupt` is never refused. `InjectUserMessage` `{"type":"InjectUserMessage","content":"..."}` sends typed user text. [18][5]

## Function calling: your client runs the call

Define functions under `agent.think.functions` with `name`, `description`, and JSON-schema `parameters`. Leave out `endpoint` and the function is client-side. Add `endpoint` (`url`, `method`, `headers`) and Deepgram calls that HTTP endpoint itself. [3][12][19]

The server sends one `FunctionCallRequest` with a `functions` array. Each item has `id`, `name`, `arguments` (a JSON string; parse it), `client_side`, and sometimes `thought_signature`. [9]

- `client_side: true`: run the function, then send `{"type":"FunctionCallResponse","id":"<same id>","name":"get_weather","content":"<result text or JSON string>"}`. Pass `thought_signature` back unchanged when present. The agent speaks once your response arrives. [9][10]
- `client_side: false`: the server ran it (an `endpoint` function). No client action; the server's own `FunctionCallResponse` is informational. [10]

Calls dispatch speculatively. The agent starts thinking as soon as speech-to-text is moderately confident the user has stopped, and a function call goes out the moment the LLM emits it, before the turn is confirmed. If the user keeps talking, the turn resumes and the server sends `FunctionCallCancelled` for every call you already received. Set `defer_until_eot: true` on a function whose side effect cannot be undone (ending a call, booking, charging a card): a deferred call is held until the turn is confirmed and discarded if the turn resumes, and deferring one function does not delay the others. An `endpoint` function that already reached your server is not rolled back, which is the reason to defer rather than rely on cancellation. [33]

During a slow call, send `InjectAgentMessage` with `behavior: "queue"` ("One moment while I look that up"). [18] A call to a name you did not define ends the session with `NON_EXISTENT_FUNCTION_CALLED`. [13]

## Telephony

Twilio Media Streams: answer the call with TwiML `<Connect><Stream url="wss://your-host/media"/>`. It is bidirectional; `<Start><Stream>` cannot carry the agent's voice. Set both `audio.input` and `audio.output` to `mulaw` at `8000` with `container: none`, base64-decode each Twilio `media` payload and send it as a binary frame, base64-encode agent audio back into Twilio `media` frames, and on `UserStartedSpeaking` send Twilio `{"event":"clear","streamSid":...}` so it drops its buffered audio. Reference bridges: `deepgram-devs/twilio-voice-agent` (Python SDK, last updated August 2026) and `deepgram-devs/sts-twilio` (raw WebSocket, last updated May 2025 — read it for the protocol, not as a current dependency). [20] The examples repository, which the `examples` skill routes to, has the Node version, `021-twilio-voice-agent-node`. [21]

Other platforms with Deepgram guides: Genesys Cloud CX (Audio Connector), Amazon Connect, AudioCodes LiveHub, plus inbound and outbound reference apps. [2][22] The documentation index lists no SIP guide; bring SIP calls through one of those platforms or a gateway that yields a WebSocket audio stream. [23]

## Pricing

The Voice Agent API is billed per minute of WebSocket connection time, and a Deepgram-managed LLM is billed through the same account. Speech-to-text alone is per minute of audio; text-to-speech alone is per 1,000 characters. Rates change; read <https://deepgram.com/pricing>. [1][24]

## Common mistakes

1. `Authorization: Bearer <api key>` returns 401. API keys use the `Token` scheme. `Bearer` is only for JWTs from `/v1/auth/grant`. [4][25]
2. REST calls sent to `agent.deepgram.com`, or the agent socket opened on `api.deepgram.com`. Only `/v1/agent/*` lives on the agent host; the published OpenAPI lists the agent host first, so generated clients need an explicit base URL. [1][26]
3. Any message before `Welcome`, audio before `SettingsApplied`, or a second `Settings`: `NON_SETTINGS_MESSAGE_BEFORE_SETTINGS` or `SETTINGS_ALREADY_APPLIED`. One `Settings` per connection; reconnect to change it. [5][13]
4. A model name that does not exist. On `/v1/listen` and `/v1/speak` it returns the same 403 body as a model your project cannot use, `{"err_code":"INSUFFICIENT_PERMISSIONS",...}`. Check `GET https://api.deepgram.com/v1/models` first. There is no model named `nova-3-conversational`; conversational STT is `flux-general-en` with `version: v2`. [27][7]
5. A declared audio format that does not match the bytes: `USER_AUDIO_FORMAT`. Encoding and sample rate in `Settings` must match what you stream. [13]
6. Parsing every frame as JSON. Agent audio is binary. The same applies to `/v1/speak` and `/v2/speak`, whose success body is audio, so branch on frame type or HTTP status before parsing. [5][26]
7. Not stopping playback on `UserStartedSpeaking`. Deepgram already stopped generating; the leftover in your buffer (or Twilio's) is what talks over the caller. [11][20]
8. Expecting `UpdatePrompt` to replace the prompt. It appends (caveat in the `UpdatePrompt` bullet under Message lifecycle). Use `UpdateThink` to replace. [16][17]
9. Leaning on `KeepAlive` past two hours. Sessions close at 2:00:00 with `MAXIMUM_SESSION_LENGTH_REACHED` after a `MAXIMUM_SESSION_LENGTH_APPROACHING` warning at 1:55; start a new session and pass the old turns in `agent.context`. [13][15]

## Use a different skill when

- You need the full message schema (every `Settings` field, every client and server message): the `api` skill's `references/agent.md`, or the AsyncAPI-derived reference. [12]
- You want a runnable app to clone: `starters` skill, feature `voice-agent` (node, bun, deno, flask, django, fastapi, go, java, csharp, ruby, php, cpp, rust). [28]
- You want a minimal snippet for one feature (`connect`, `custom-llm`, `custom-tts`, `function-calling`): `recipes` skill. [29]
- You are wiring a third-party platform (Twilio, LiveKit, Pipecat, Vonage, SignalWire, CrewAI, OpenAI Agents SDK): `examples` skill. [21]
- The agent runs in a browser: `browser-agent` skill, for the four Browser Agent SDK packages on npm (`@deepgram/agents`, `@deepgram/react`, `@deepgram/ui`, `@deepgram/agents-widget`). They wrap the same socket this skill documents, including the `Sec-WebSocket-Protocol` token handshake above.
- You want language-idiomatic code: `deepgram-js-voice-agent`, `deepgram-python-voice-agent`, `deepgram-java-voice-agent`, `deepgram-rust-voice-agent`, `deepgram-dotnet-voice-agent`, or `deepgram-go-voice-agent`. The Go SDK v3 ships an agent WebSocket client under `pkg/client/agent/v1/websocket`. [30] The SDKs carry `FunctionCallCancelled` and `defer_until_eot` from JS 5.12.0, Python 7.10.0, and Java 0.10.1, but their voice-agent skills do not describe them, so take the message shapes from this skill. Go 3.8.0 and .NET 7.1.1 have no typed `FunctionCallCancelled` or `defer_until_eot`: parse the raw message and send the field as plain JSON. The raw protocol above works in any language. [30][42]
- You want the reusable-configuration and variable REST clients from an SDK: `client.voiceAgent` (JS), `client.voice_agent` (Python), `client.voiceAgent()` (Java), and the `AgentManage` client (.NET); Go has them only on `main` after 3.8.0, and Rust has none. [42]
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
12. https://developers.deepgram.com/reference/voice-agent/voice-agent (AsyncAPI; client and server message list)
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
23. https://developers.deepgram.com/llms.txt (full docs index; no SIP entry)
24. https://deepgram.com/pricing (Voice Agent "calculated based on websocket connection time"; TTS "per 1,000 characters of input text")
25. https://developers.deepgram.com/reference/authentication
26. https://developers.deepgram.com/openapi.yaml (top-level `servers` lists `https://agent.deepgram.com` before `https://api.deepgram.com`) and the `api` skill's "Common Mistakes" section
27. https://developers.deepgram.com/reference/manage/models/list (live catalog; no `nova-3-conversational`)
28. https://developers.deepgram.com/docs/voice-agent-template-apps and https://github.com/deepgram-starters (the docs page omits Java; `java-voice-agent` exists in the org)
29. https://github.com/deepgram/recipes/blob/main/COVERAGE.md
30. https://github.com/deepgram/deepgram-go-sdk (`.agents/skills/deepgram-go-voice-agent`, module `github.com/deepgram/deepgram-go-sdk/v3`, agent client at `pkg/client/agent/v1/websocket`)
31. https://developers.deepgram.com/docs/voice-agent-latency-report
32. https://developers.deepgram.com/docs/reusable-agent-configurations (base URL `https://api.deepgram.com/v1`, `config` as a JSON string, immutable `config`, delete warning, `DG_<VARIABLE_NAME>` variables, no secrets)
33. https://developers.deepgram.com/docs/voice-agent-speculative-replies and https://developers.deepgram.com/docs/voice-agent-function-call-cancelled
34. https://developers.deepgram.com/docs/voice-agent-tts-controls (`speed` ranges per family, `expressivity` on Flux TTS only)
35. https://developers.deepgram.com/docs/voice-agent-history
36. https://developers.deepgram.com/docs/voice-agent-conversational-mode (invite-only Early Access; the page is not listed in llms.txt)
37. https://developers.deepgram.com/reference/regional-endpoints (`/v1/agent/converse` on the EU, AU, and IN hosts; Google `think.provider.version` values and the default per endpoint)
38. https://developers.deepgram.com/docs/voice-agent-media-inputs-outputs (Flux TTS streams raw audio with no container or bit rate; compressed output and containers are Aura only)
39. https://developers.deepgram.com/docs/voice-agent-conversation-context (says `UpdatePrompt` replaces the system prompt; the Update Prompt page says it adds to it)
40. https://developers.deepgram.com/docs/voice-agent-observability (no logging API; persist every non-audio frame keyed to `request_id`; `LatencyReport` fields)
41. https://developers.deepgram.com/docs/voice-agent-settings, https://developers.deepgram.com/docs/voice-agent-inputs, and https://developers.deepgram.com/docs/voice-agent-outputs (the `Settings` message and the client and server message indexes)
42. https://github.com/deepgram/deepgram-dotnet-sdk (`AgentManage` client, 7.1.1) for the agent configuration REST clients; Go carries them on `main` after 3.8.0 (repository in [30]); JS `client.voiceAgent`, Python `client.voice_agent`, Java `client.voiceAgent()`
