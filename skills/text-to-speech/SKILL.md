---
name: text-to-speech
description: >
  Turn text into spoken audio with Deepgram. Use when someone asks for text-to-speech, TTS,
  speech synthesis, a synthetic voice, a voice for a voice agent, an IVR prompt, or an audio
  version of some text, and whenever they mention Aura, Aura-2, Flux TTS, /v1/speak or /v2/speak.
  Trigger phrases: "text to speech", "TTS", "speak endpoint", "generate speech", "synthesize
  audio", "read this aloud", "which Deepgram voice", "Aura vs Flux TTS", "TTS with barge-in".
  Gets an agent to a correct first request, then routes to the api, docs, starters,
  recipes, examples, setup-mcp and per-language SDK text-to-speech skills.
---

# Deepgram Text-to-Speech

Deepgram serves two text-to-speech families on separate endpoints, and the voices do not overlap.
Aura voices run only on `/v1/speak`. Flux TTS voices run only on `/v2/speak`. `/v2/speak` is an
additional endpoint. `/v1/speak` is unchanged and remains supported.

## Pick the family first

| Need | Family | Endpoint |
|---|---|---|
| One-shot audio: a file, an IVR prompt, a notification | Aura | `POST https://api.deepgram.com/v1/speak` |
| Any language other than English | Aura-2 | `/v1/speak` |
| Low-latency stream with manual flush control | Aura | `wss://api.deepgram.com/v1/speak` |
| A voice agent that streams LLM output and must survive barge-in | Flux TTS | `wss://api.deepgram.com/v2/speak` |
| Pre-rendered audio in a Flux voice | Flux TTS batch | `POST https://api.deepgram.com/v2/speak` |

Rule of thumb: Aura for one-shot and non-English, Flux TTS for voice agents. Flux TTS voices are
English only today; for other languages use Aura-2.

## First request: Aura over REST

```bash
curl --request POST \
  --url "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=linear16&container=wav" \
  --header "Authorization: Token $DEEPGRAM_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{"text": "Hello, how can I help you today?"}' \
  --output hello.wav \
  --fail-with-body --silent || echo "Request failed"
```

What to expect:

- A 2xx body is binary audio. Errors are JSON. Check the HTTP status before you parse.
- Options go on the query string. The JSON body carries only `text`.
- With no `encoding`, REST returns `mp3`. For WAV send `encoding=linear16&container=wav`. Other REST
  encodings: `opus`, `flac`, `aac`, `mulaw`, `alaw`, with `container`, `bit_rate`, `sample_rate`.
- If you omit `model`, `/v1/speak` uses `aura-asteria-en`, an Aura-1 voice. Always set `model`.
- Aura-2 `speed` accepts `0.7` to `1.5` and works for English and Spanish voices only.

## Aura over WebSocket

Connect to `wss://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=linear16&sample_rate=24000`
with the same `Authorization: Token` header. Send JSON text frames: `{"type":"Speak","text":"..."}` to
queue text, `{"type":"Flush"}` to force audio out, `{"type":"Clear"}` to drop the buffer, and
`{"type":"Close"}` to end. Audio arrives as binary frames; `Metadata`, `Flushed`, `Cleared`, and
`Warning` arrive as JSON. Send `Flush` when the LLM finishes a response. `Flush` is limited to 20
sends per 60 seconds. Streaming output is raw `linear16` (default), `mulaw`, or `alaw` only.

## Flux TTS for voice agents

Connect to `wss://api.deepgram.com/v2/speak?model=flux-haley-en`. `model` is required and must be a
`flux-*` voice. There is no default, and an Aura string is rejected.

A session is a sequence of turns. Stream tokens in, then end the turn:

```json
{"type": "Speak", "text": "Sure, I can "}
{"type": "Speak", "text": "help you cancel your subscription."}
{"type": "Flush"}
```

- Audio starts streaming before you `Flush`. `Flush` ends the turn; the server then sends `Flushed` and
  `SpeechMetadata` with billing and timing. Treat `SpeechMetadata` as the end of the turn; `Flushed` arrives earlier.
- The server assigns `speech_id` per turn in `SpeechStarted` and `SpeechMetadata`. Never send one.
- On barge-in, stop local playback first, then send
  `{"type":"Interrupt","playback_offset":{"type":"time_ms","value":2340}}`. `SpeechInterrupted` returns
  `text_spoken` and `text_remaining`; feed `text_spoken` back into the LLM context. Without a
  `playback_offset` the split is omitted.
- `{"type":"Configure","speed":1.15}` changes speed mid-session. The live docs give the accepted range
  as `0.5` to `1.5` in `0.05` steps. The `api` skill's generated reference still lists seven values from
  `0.85` to `1.15`. The range has changed once already, so confirm it on the client-messages page
  before hard-coding values. Errors: `SPEED_OUT_OF_RANGE`, `SPEED_INCREMENT_INVALID`,
  `SPEED_NOT_SUPPORTED`.
- `expressivity` runs `-2` (calm) to `2` (animated), default `0`. It is beta, fixed per connection, and
  only `0` is validated for production.
- The socket emits raw `linear16` (default), `mulaw`, or `alaw`. Batch-only parameters (`container`,
  `bit_rate`, `callback`, `callback_method`, `priority`) and any unknown parameter fail the connection.
- Idle sessions close after 60 seconds (`NET-0004`). Send a WebSocket Ping between quiet turns.
- Batch: `POST https://api.deepgram.com/v2/speak?model=flux-haley-en` with `{"text": "..."}` returns one
  audio response, `mp3` by default, and accepts `opus`, `flac`, `aac`, `container`, `bit_rate`.
- SDKs: the Python, JavaScript, and Java SDKs ship a `speak.v2` client. Other languages use the
  WebSocket directly.

## Voices

- Aura: `aura-2-{voice}-{lang}` in English, Spanish, German, French, Dutch, Italian, and Japanese, plus
  twelve Aura-1 English voices named `aura-{voice}-en`. Catalog: https://developers.deepgram.com/docs/tts-models
- Flux TTS: `flux-{voice}-en`, English only, in American, British, Irish, Australian, Indian,
  Singaporean, and Filipino accents. Featured voices include `flux-haley-en`, `flux-alexis-en`, and
  `flux-kit-en`. Catalog: https://developers.deepgram.com/docs/flux-tts/voices

## Pricing

Text-to-speech is billed per 1,000 characters of input text, for Flux TTS, Aura-2, and Aura-1 alike.
Rates differ by model and plan and change over time. Read them at https://deepgram.com/pricing; do not
quote figures from memory.

## Common mistakes

1. Wrong auth scheme. API keys go in `Authorization: Token <key>`. `Bearer` is only for the short-lived
   JWT from `POST https://api.deepgram.com/v1/auth/grant`. A key sent with `Bearer` returns 401.
2. Misreading a 403. The body `{"err_code":"INSUFFICIENT_PERMISSIONS","err_msg":"Project does not have
   access to the requested model."}` is documented for a model the project cannot use, and a live test on
   2026-09-03 returned the same body for a misspelled model name. Before asking for access, check the
   name against the catalogs above and against `GET https://api.deepgram.com/v1/models`, whose `tts`
   list shows the models your key can use.
3. Parsing audio as JSON. Success bodies are bytes on both endpoints. Branch on status first.
4. Crossing the families. An Aura voice on `/v2/speak` and a Flux voice on `/v1/speak` both fail, and
   `/v2/speak` also rejects a missing `model`.
5. Asking a WebSocket for `mp3`. Streaming is raw audio on both endpoints. Use REST for compressed output.
6. Dropping the space between LLM generations on Flux TTS. `Speak` texts are concatenated verbatim, so
   `"Hello world."` then `"How are you?"` becomes `"Hello world.How are you?"`. Insert a space when you
   stitch a reply, a tool result, and another reply. SSML is stripped with an `INPUT_MARKUP_STRIPPED`
   warning; send plain text.
7. Pointing a Voice Agent at api.deepgram.com. The Voice Agent API lives at `wss://agent.deepgram.com`
   and picks the TTS family from `agent.speak.provider.version`: `v2` for Flux TTS, `v1` for Aura.
   Omitting `agent.speak` gives Flux TTS with `flux-kit-en`.
8. Using Aura `speed` on a German, French, Dutch, Italian, or Japanese voice. Aura-2 speed control
   covers English and Spanish only.

## Use a different skill when

- You need every parameter, enum, or message schema: `api` skill, file `references/speak.md`.
- You need a docs page you cannot name: `docs` skill.
- You want a runnable app: `starters` skill. Features are `text-to-speech` (Aura REST),
  `live-text-to-speech` (Aura WebSocket), and `flux-tts` (node, flask, fastapi, django, java only).
- You want a snippet under 50 lines: `recipes` skill. Recipes cover Aura on `/v1/speak` only; there
  are no Flux TTS recipes yet.
- You are wiring a third-party platform: `examples` skill (Aura today). For Twilio with Flux TTS,
  follow https://developers.deepgram.com/docs/twilio-and-deepgram-tts.
- You want the docs inside your coding tool: `setup-mcp` skill.
- You want idiomatic code in one language: the `deepgram-{js,python,java,go,rust,dotnet}-text-to-speech`
  skills from the SDK repositories (`npx skills add deepgram/deepgram-python-sdk`, and so on). Only the
  Python, JavaScript, and Java SDKs expose `speak.v2` for Flux TTS.
- You want Deepgram to run speech-to-text, the LLM, and TTS in one connection: `voice-agent` skill and
  `deepgram-{lang}-voice-agent`.
- You are transcribing rather than synthesizing: `speech-to-text` skill. Note that "Flux" names both a
  speech-to-text product on `/v2/listen` and this text-to-speech product on `/v2/speak`.

## Sources

All pages fetched September 2026 as Markdown (append `.md` to any URL); index at https://developers.deepgram.com/llms.txt.

- Aura: https://developers.deepgram.com/docs/text-to-speech https://developers.deepgram.com/docs/streaming-text-to-speech https://developers.deepgram.com/docs/tts-models https://developers.deepgram.com/docs/tts-voice-controls https://developers.deepgram.com/docs/tts-encoding https://developers.deepgram.com/docs/tts-media-output-settings https://developers.deepgram.com/docs/tts-ws-flush https://developers.deepgram.com/docs/tts-ws-clear
- Flux TTS: https://developers.deepgram.com/docs/flux-tts/overview https://developers.deepgram.com/docs/flux-tts/quickstart https://developers.deepgram.com/docs/flux-tts/batch https://developers.deepgram.com/docs/flux-tts/batch-vs-streaming https://developers.deepgram.com/docs/flux-tts/voices https://developers.deepgram.com/docs/flux-tts/client-messages https://developers.deepgram.com/docs/flux-tts/server-messages https://developers.deepgram.com/docs/flux-tts/interrupt-handling https://developers.deepgram.com/docs/flux-tts/migrating https://developers.deepgram.com/docs/flux-tts/voice-agent https://developers.deepgram.com/docs/flux-tts/template-apps https://developers.deepgram.com/docs/tts-expressivity
- API reference: https://developers.deepgram.com/reference/text-to-speech/speak-request https://developers.deepgram.com/reference/text-to-speech/speak-streaming https://developers.deepgram.com/reference/text-to-speech/speak-flux https://developers.deepgram.com/reference/speak/v-2/audio/generate https://developers.deepgram.com/reference/manage/models/list
- Auth, errors, agent, pricing: https://developers.deepgram.com/reference/authentication https://developers.deepgram.com/reference/auth/tokens/grant https://developers.deepgram.com/docs/errors https://developers.deepgram.com/docs/voice-agent-tts-models https://developers.deepgram.com/reference/voice-agent/voice-agent https://deepgram.com/pricing
