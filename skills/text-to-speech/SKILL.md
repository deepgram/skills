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
| A voice agent that streams LLM output and must survive barge-in | Flux TTS | `wss://api.deepgram.com/v2/speak` |
| One-shot English audio: a file, an IVR prompt, a notification | Flux TTS batch | `POST https://api.deepgram.com/v2/speak` |
| Spanish, German, French, Dutch, Italian, or Japanese, one-shot | Aura-2 | `POST https://api.deepgram.com/v1/speak` |
| Spanish, German, French, Dutch, Italian, or Japanese, streamed with manual flush control | Aura-2 | `wss://api.deepgram.com/v1/speak` |
| An existing `aura-{voice}-en` voice you must keep | Aura-1 | `/v1/speak` |

Rule of thumb: Flux TTS is the recommended family for all new English builds: voice agents, customer service,
IVR, and general-purpose synthesis. Pick Aura-2 when you need a language Flux TTS does not cover;
Flux TTS voices are English only, and Aura-2 serves Spanish, German, French, Dutch, Italian,
and Japanese. Aura-1 is the first-generation family, English only. Inside a Voice Agent, compressed
or containerized output needs an Aura (`v1`) voice (see mistake 7).

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
- Aura-2 `speed` accepts `0.7` to `1.5` and works for English and Spanish voices only. Use `0.9` to
  `1.5` for Spanish voices; values below `0.9` may introduce disfluencies.
- Aura-2 pronunciation control is GA on `/v1/speak` with the same escaped
  `\{"word":"...","pronounce":"<IPA>"\}` syntax Flux TTS uses, for English and Spanish voices, with a
  2000-character input limit. Aura-2 has no pause control.

## Aura over WebSocket

Connect to `wss://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=linear16&sample_rate=24000`
with the same `Authorization: Token` header. Send JSON text frames: `{"type":"Speak","text":"..."}` to
queue text, `{"type":"Flush"}` to force audio out, `{"type":"Clear"}` to drop the buffer, and
`{"type":"Close"}` to end. Audio arrives as binary frames; `Metadata`, `Flushed`, `Cleared`, and
`Warning` arrive as JSON. Send `Flush` when the LLM finishes a response. `Flush` is limited to 20
sends per 60 seconds. Streaming output is raw `linear16` (default), `mulaw`, or `alaw` only.

Limits on the Aura socket: 2000 characters of text per request (close `1009`, payload `BIG-0001`), 2400
characters per minute into the socket counted across all `Speak` messages (close `1008`, `DATA-0001`),
and 60 minutes per connection from the initial connect (close `1011`, `NET-0003`); open a new socket for
a longer conversation. The close-frame codes and the `dg-error` header on a failed upgrade are listed at
https://developers.deepgram.com/docs/tts-troubleshooting-websocket-net-and-data-errors. Regional hosts
`api.eu.deepgram.com`, `api.au.deepgram.com`, and `api.in.deepgram.com` serve `/v1/speak`,
REST and WebSocket, with the same key.

## Flux TTS for voice agents

Connect to `wss://api.deepgram.com/v2/speak?model=flux-haley-en`. `model` is required and must be a
`flux-*` voice. There is no default, and an Aura string is rejected. For in-region processing use
`wss://api.eu.deepgram.com/v2/speak`, `wss://api.au.deepgram.com/v2/speak`, or
`wss://api.in.deepgram.com/v2/speak`; a region that is unavailable fails the request rather than
routing elsewhere.

A session is a sequence of turns. Stream tokens in, then end the turn:

```json
{"type": "Speak", "text": "Sure, I can "}
{"type": "Speak", "text": "help you cancel your subscription."}
{"type": "Flush"}
```

- Audio starts streaming before you `Flush`. `Flush` ends the turn; the server then sends `Flushed` and
  `SpeechMetadata` with billing and timing. Treat `SpeechMetadata` as the end of the turn; `Flushed` arrives earlier.
- The server assigns `speech_id` per turn in `SpeechStarted` and `SpeechMetadata`. Never send one.
- The first message is `Connected`, with `request_id`, `model_name`, `model_version`, and `model_uuids`.
  The last message on a normal close is `SessionMetadata`, with cumulative session totals; an `Interrupt` rebases its
  `total_audio_duration_ms` onto the audio the client actually played.
- The server's JSON messages are `Connected`, `SpeechStarted`, `Flushed`, `SpeechMetadata`,
  `SpeechInterrupted`, `ConfigureSuccess`, `ConfigureFailure`, `Warning`, `Error`, and `SessionMetadata`.
  A `Warning` carries `code` and `description` and leaves the session open. An `Error` is fatal: every
  `DOMAIN-NNNN` code (`MESSAGE-0000`, `DATA-0000`, `DATA-0002`, `BIG-0000`, `NET-0000` through
  `NET-0004`) is followed by a WebSocket close.
- On barge-in, stop local playback first, then send
  `{"type":"Interrupt","playback_offset":{"type":"time_ms","value":2340}}`.
  - `SpeechInterrupted` returns `text_spoken` and `text_remaining`; feed `text_spoken` back into the LLM
    context. Without a `playback_offset` the split is omitted.
  - `value` is milliseconds played since the session started, not since this turn, and each `Interrupt`
    must exceed the previous offset or it is ignored with `INVALID_INTERRUPT_OFFSET`. Read
    `audio_played_ms` from `SpeechInterrupted` as the baseline for the next offset.
- `{"type":"Configure","speed":1.15}` changes speed mid-session; the change applies at the next segment
  boundary. `speed` runs `0.5` to `1.5` in `0.05` increments, default `1.0`.
  - The server answers `ConfigureSuccess` with the `applied` configuration, or `ConfigureFailure` with
    `code` and `description` (plus `field` and `value` when the failure is tied to one) and keeps the
    prior configuration.
  - `0.45` and `1.55` return `'speed' must be between 0.5 and 1.5`, and `1.07` returns `'speed' must be
    provided in increments of 0.05`.
  - `ConfigureFailure` codes: `SPEED_OUT_OF_RANGE`, `SPEED_INCREMENT_INVALID`, `SPEED_NOT_SUPPORTED`,
    `CONTROL_COMBINATION_INVALID` (a queued turn still carries a pronunciation control; `Flush` that
    turn first), and `INTERNAL_ERROR`, for an acceptable configuration the server could not apply.
- `expressivity` runs `-2` (calm) to `2` (animated), default `0`. Values must be whole numbers. An
  invalid value is rejected with an HTTP 400 before the WebSocket upgrade completes, so no `Connected`
  message arrives: `EXPRESSIVITY_INCREMENT_INVALID` for a fraction such as `1.5`,
  `EXPRESSIVITY_OUT_OF_RANGE` for a value outside `-2` to `2`. It is beta, fixed per connection
  (`Configure` cannot change it), and only `0` is validated for production.
- Pronunciation control is Early Access on Flux TTS `/v2/speak` (it is GA on Aura-2 `/v1/speak`, see the
  Aura REST section). It is an escaped JSON object in the text, on the socket and on batch:
  `\{"word":"dupilumab","pronounce":"duːˈpɪljuːmæb"\}`.
  - Limits: at most 500 per request; IPA at most 128 characters and at most 10 times the length of the
    source word, with a floor of 15.
  - It works only with `speed` `1.0`: on the socket, a pronunciation sent on a session opened with
    another speed, or after a `Configure` that set one, fails the connection with `DATA-0002`; on batch
    the request is a 400 `CONTROL_COMBINATION_INVALID`.
  - Invalid IPA is still applied best-effort and reported as a `PRONUNCIATION_WARNINGS` warning on the
    socket and in the `dg-warnings` header on batch.
  - Syntax and IPA guidance: https://developers.deepgram.com/docs/tts-voice-controls
- Pause control `\{pause:500ms\}` is batch only.
  - Limits: 500 to 3000 ms in 100 ms steps, at most 8 per request, text between adjacent pauses, and
    `speed` capped at `1.15` while a pause is present (`PAUSE_SPEED_CAP_EXCEEDED`). Pauses land within
    about 100 ms of the requested duration.
  - A pause marker on the socket fails the connection with `DATA-0002`, and a pause combined with a
    pronunciation is rejected with `CONTROL_COMBINATION_INVALID`.
  - Other batch 400 codes: `BREAK_OUT_OF_RANGE`, `BREAK_INCREMENT_INVALID`, `BREAKS_LIMIT_EXCEEDED`, and
    `BREAK_SYNTAX_INVALID`, which has two triggers: a simple marker without the backslashes, or a
    structured marker with them.
  - Accepted forms are `\{pause:500\}` (a bare number is milliseconds), `\{pause:500ms\}`,
    `\{pause:1.5s\}`, and the unescaped structured form `{pause:{duration_ms:500}}`.
- Each turn's `SpeechMetadata.controls_applied` counts `pronunciations_applied`, `breaks_applied`, and
  `pronunciation_warnings`; batch returns `dg-pronunciations-applied` and `dg-breaks-applied` response
  headers.
- The socket streams raw audio only, `linear16` by default (see mistake 5). Batch-only parameters
  (`container`, `bit_rate`, `callback`, `callback_method`, `priority`) and any unknown parameter fail
  the connection.
- Idle sessions close after 60 seconds (`NET-0004`); send a WebSocket Ping between quiet turns. Every
  session closes at 1 hour (`NET-0003`).
- Batch: `POST https://api.deepgram.com/v2/speak?model=flux-haley-en` with `{"text": "..."}` returns one
  audio response, `mp3` by default, accepts `opus`, `flac`, `aac`, `container`, `bit_rate`, and is the
  only transport that honors inline pauses.
- SDKs: every Deepgram SDK ships a Flux TTS client. Python, JavaScript, and Java name it `speak.v2`;
  .NET ships `FluxSpeakRESTClient` and `FluxSpeakWebSocketClient`; Rust ships `speak::flux`; Go ships
  `pkg/client/speak/v2` from v3.8.0. Only the Rust SDK skill documents Flux TTS; the JS, Python, Java,
  Go, and .NET `text-to-speech` SDK skills cover `/v1/speak` only, so take `/v2/speak` message shapes
  from this skill.

## Voices

- Aura: `aura-2-{voice}-{lang}` in English, Spanish, German, French, Dutch, Italian, and Japanese, plus
  twelve Aura-1 English voices named `aura-{voice}-en`. Five Spanish voices switch between English and
  Spanish within one request: `aura-2-aquila-es`, `aura-2-carina-es`, `aura-2-diana-es`,
  `aura-2-javier-es`, and `aura-2-selena-es`. Catalog: https://developers.deepgram.com/docs/tts-models
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
2. Misreading a model error. A model name that does not exist, including a misspelling, is a 400
   `{"err_code":"Bad Request","err_msg":"Bad Request: No such model/language/tier combination found."}`.
   A model that exists but your project cannot use is a 403
   `{"err_code":"INSUFFICIENT_PERMISSIONS","err_msg":"Project does not have access to the requested
   model."}`. Fix a 400 by checking the name against the catalogs above; ask for access only on a 403.

   `GET https://api.deepgram.com/v1/models` returns the public catalog, not the models your key can
   use, and its `tts` list holds Aura voices only with no `flux-*` entries, so check Flux TTS voice
   names at https://developers.deepgram.com/docs/flux-tts/voices.
3. Parsing audio as JSON. Success bodies are bytes on both endpoints. Branch on status first.
4. Crossing the families. An Aura voice on `/v2/speak` and a Flux TTS voice on `/v1/speak` both fail, and
   `/v2/speak` also rejects a missing `model`.
5. Asking a WebSocket for `mp3`. Streaming is raw audio on both endpoints. Use REST for compressed output.
6. Expecting Flux TTS to clean up your text. `Speak` texts are concatenated verbatim, so `"Hello world."`
   then `"How are you?"` becomes `"Hello world.How are you?"`. Insert a space when you stitch a reply, a
   tool result, and another reply.

   Send plain text. SSML is not interpreted; the only markup Flux TTS honors is its own escaped
   controls, pronunciation on both transports and pause on batch. Recognized SSML, ElevenLabs, and
   Cartesia tags are stripped, with one `INPUT_MARKUP_STRIPPED` warning per `Speak`; markup the
   detector does not match (Markdown, HTML, custom XML) is forwarded verbatim and may be spoken. See
   https://developers.deepgram.com/docs/flux-tts/client-messages.
7. Pointing a Voice Agent at api.deepgram.com. The Voice Agent API lives at `wss://agent.deepgram.com`
   and picks the TTS family from `agent.speak.provider.version`: `v2` for Flux TTS, `v1` for Aura.
   Omitting `agent.speak` gives Flux TTS with `flux-kit-en`.
   - Speed and `expressivity` inside an agent go on `agent.speak.provider`; see
     https://developers.deepgram.com/docs/voice-agent-tts-controls.
   - An inline pause marker is not spoken and no error is returned, so text containing one goes
     silent; keep pacing to punctuation and digit grouping.
   - A compressed encoding (`mp3`, `opus`, `flac`, `aac`) or a container such as `wav` in `audio.output`
     returns `INVALID_SETTINGS`, so configure an Aura (`v1`) voice for those formats, including when
     `agent.speak` is omitted.
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
  follow https://developers.deepgram.com/docs/twilio-and-deepgram-tts, which needs `deepgram-sdk`
  7.6.0 or later.
- You want the docs inside your coding tool: `setup-mcp` skill.
- You want idiomatic code in one language: the `deepgram-{js,python,java,go,rust,dotnet}-text-to-speech`
  skills from the SDK repositories (`npx skills add deepgram/deepgram-python-sdk`, and so on). Only the
  Rust SDK skill documents Flux TTS; see the SDKs bullet in the Flux TTS section.
- You want Deepgram to run speech-to-text, the LLM, and TTS in one connection: `voice-agent` skill and
  `deepgram-{lang}-voice-agent`.
- You are transcribing rather than synthesizing: `speech-to-text` skill. Note that "Flux" names both a
  speech-to-text product on `/v2/listen` and this text-to-speech product on `/v2/speak`.

## Sources

Every page is available as Markdown (append `.md` to any URL); index at https://developers.deepgram.com/llms.txt.

- Model families and regions: https://developers.deepgram.com/docs/tts-models-languages-overview https://developers.deepgram.com/reference/regional-endpoints
- Aura: https://developers.deepgram.com/docs/text-to-speech https://developers.deepgram.com/docs/streaming-text-to-speech https://developers.deepgram.com/docs/tts-models https://developers.deepgram.com/docs/tts-voice-controls https://developers.deepgram.com/docs/tts-encoding https://developers.deepgram.com/docs/tts-media-output-settings https://developers.deepgram.com/docs/tts-ws-flush https://developers.deepgram.com/docs/tts-ws-clear https://developers.deepgram.com/docs/tts-ws-close https://developers.deepgram.com/docs/tts-troubleshooting-websocket-net-and-data-errors https://developers.deepgram.com/docs/text-to-speech-prompting
- Flux TTS: https://developers.deepgram.com/docs/flux-tts/overview https://developers.deepgram.com/docs/flux-tts/feature-overview https://developers.deepgram.com/docs/flux-tts/quickstart https://developers.deepgram.com/docs/flux-tts/batch https://developers.deepgram.com/docs/flux-tts/batch-vs-streaming https://developers.deepgram.com/docs/flux-tts/voices https://developers.deepgram.com/docs/flux-tts/client-messages https://developers.deepgram.com/docs/flux-tts/server-messages https://developers.deepgram.com/docs/flux-tts/state https://developers.deepgram.com/docs/flux-tts/context https://developers.deepgram.com/docs/flux-tts/interrupt-handling https://developers.deepgram.com/docs/flux-tts/migrating https://developers.deepgram.com/docs/flux-tts/voice-agent https://developers.deepgram.com/docs/flux-tts/template-apps https://developers.deepgram.com/docs/tts-expressivity
- API reference: https://developers.deepgram.com/reference/text-to-speech/speak-request https://developers.deepgram.com/reference/text-to-speech/speak-streaming https://developers.deepgram.com/reference/text-to-speech/speak-flux https://developers.deepgram.com/reference/speak/v-2/audio/generate https://developers.deepgram.com/reference/manage/models/list
- Auth, errors, agent, integrations, pricing: https://developers.deepgram.com/reference/authentication https://developers.deepgram.com/reference/auth/tokens/grant https://developers.deepgram.com/docs/errors https://developers.deepgram.com/docs/voice-agent-tts-models https://developers.deepgram.com/docs/voice-agent-tts-controls https://developers.deepgram.com/reference/voice-agent/voice-agent https://developers.deepgram.com/docs/twilio-and-deepgram-tts https://deepgram.com/pricing
