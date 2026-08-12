---
name: api
description: >
  Deepgram API reference for speech-to-text, text-to-speech, voice agents, audio intelligence,
  and account management. Use whenever building with Deepgram APIs — REST or WebSocket. Covers
  authentication, all endpoints, query parameters, request/response schemas, and WebSocket
  message formats. Reference files are organized by domain: listen (STT — Nova and Flux STT), speak
  (TTS — Aura and Flux TTS), agent (voice agents), read (text/audio intelligence), models,
  projects, auth, and self-hosted.
---

# Deepgram API

Build with Deepgram's speech-to-text, text-to-speech, voice agent, and audio intelligence APIs.

> **"Flux" names two separate products.** **Flux STT** is conversational speech-to-text on `/v2/listen` (`model=flux-general-en`). **Flux TTS** is turn-based speech synthesis on `/v2/speak` (`model=flux-{voice}-{language}`). They share a name and a design philosophy — turn-aware, built for voice agents — but they are different endpoints with different models, params, and messages. When a request just says "Flux", check whether it is about transcribing audio or producing it.

## Getting Started

All API requests require authentication via API key or JWT:

- **API Key**: `Authorization: Token <API_KEY>`
- **JWT**: `Authorization: Bearer <JWT>`

Base servers:

- REST & STT/TTS WebSocket: `https://api.deepgram.com`
- Voice Agent WebSocket: `https://agent.deepgram.com`

## How Deepgram's APIs Fit Together

```
                   ┌──────────────────────────────┐
                   │       api.deepgram.com        │
                   └──────────────────────────────┘
                                │
  ┌───────────┬───────────┬─────┴─────┬───────────┬───────────┐
  ▼           ▼           ▼           ▼           ▼           ▼
  /v1/listen  /v2/listen  /v1/speak   /v2/speak   /v1/read    /v1/projects/*
  Nova — STT  Flux — STT  Aura — TTS  Flux — TTS  Text AI     Management
  REST + WSS  WSS only    REST + WSS  REST + WSS  REST only   REST only

                   ┌──────────────────────────────┐
                   │      agent.deepgram.com       │
                   └──────────────────────────────┘
                                │
                                ▼
                   /v1/agent/converse
                   WebSocket only
                   audio ──▶ STT ──▶ LLM ──▶ TTS ──▶ audio
                   (Deepgram orchestrates the full pipeline)
```

## Which API Should I Use?

```
Audio → text (transcription)?
├─ General-purpose transcription (captions, batch, call logs, live streams with custom turn logic)
│  └─ Nova models via /v1/listen
│     ├─ Pre-recorded file    →  REST  POST https://api.deepgram.com/v1/listen?model=nova-3
│     └─ Live stream          →  WSS   wss://api.deepgram.com/v1/listen?model=nova-3
│
└─ Conversational audio / voice-agent-style turn detection
   └─ Flux STT models via /v2/listen
      └─ Live stream          →  WSS   wss://api.deepgram.com/v2/listen?model=flux-general-en

Text → audio (speech synthesis)?
├─ General-purpose TTS (broadest voice catalog, compressed/containerized audio)
│  └─ Aura models via /v1/speak
│     ├─ One-shot             →  REST  POST https://api.deepgram.com/v1/speak?model=aura-2-thalia-en
│     └─ Low-latency stream   →  WSS   wss://api.deepgram.com/v1/speak?model=aura-2-thalia-en
│
└─ Voice-agent TTS (turn-based lifecycle, barge-in, cross-turn consistency)
   └─ Flux TTS models via /v2/speak  — model is REQUIRED, and must be flux-*
      ├─ Pre-render a block   →  REST  POST https://api.deepgram.com/v2/speak?model=flux-alexis-en
      └─ Live conversation    →  WSS   wss://api.deepgram.com/v2/speak?model=flux-alexis-en

Full conversational voice agent (audio in, audio out)?
└─ WSS wss://agent.deepgram.com/v1/agent/converse
   Deepgram handles STT + your configured LLM + TTS internally

Analyze text for insights?
└─ REST POST /v1/read
   (summaries, sentiment, topics, intents)
```

## Speech-to-Text: Nova (`/v1/listen`) vs Flux STT (`/v2/listen`)

Both model families are actively maintained and industry-leading. They solve different problems — pick the one that matches your use case.

| | Nova (`/v1/listen`) | Flux STT (`/v2/listen`) |
|---|---|---|
| Endpoint | `/v1/listen` | `/v2/listen` |
| Available models | `nova-3`, `nova-2`, `nova`, `enhanced`, `base` | `flux-general-en` |
| Best for | General transcription — captions, subtitles, call logs, batch | Conversational audio — voice agents, interactive assistants, turn-taking UIs |
| Output | Continuous transcript stream | Structured turn events + transcripts (built-in turn state machine) |
| Turn detection | Manual (`utterance_end_ms`, VAD events) | Built-in (EOT, eager-EOT, turn_index) |
| Transports | REST + WebSocket | WebSocket only |
| Intelligence overlays | Yes — `summarize`, `sentiment`, `topics`, `intents`, `diarize`, `redact`, etc. | No — smaller focused param set; no `smart_format` / `diarize` / `punctuate` |
| Mid-session reconfig | No (reconnect to change) | Yes (`Configure` message updates EOT thresholds + keyterms live) |

**Pick Nova (`/v1/listen`, `model=nova-3`) when:**
- Generating captions, subtitles, or transcripts for recorded media
- Running batch transcription over files (REST)
- You need analytics overlays (`summarize`, `sentiment`, `topics`, `intents`, `diarize`, `redact`)
- You want WebSocket streaming with your own turn-detection logic

**Pick Flux STT (`/v2/listen`, `model=flux-general-en`) when:**
- Building an interactive voice agent or assistant
- You want end-of-turn detection handled for you
- You need low-latency turn signals and barge-in support
- You want to update EOT thresholds or keyterms mid-session without reconnecting

Migrating from Nova 3 to Flux STT? See the official [Nova 3 → Flux migration guide](https://developers.deepgram.com/docs/flux/nova-3-migration).

## Text-to-Speech: Aura (`/v1/speak`) vs Flux TTS (`/v2/speak`)

Both TTS families are actively maintained. `/v2/speak` is a **new endpoint, not a replacement** — `/v1/speak` is unchanged, and there is no aliasing, redirect, or deprecation. The families do not overlap: Aura voices are served only on `/v1/speak`, Flux TTS voices only on `/v2/speak`.

| | Aura (`/v1/speak`) | Flux TTS (`/v2/speak`) |
|---|---|---|
| Endpoint | `/v1/speak` | `/v2/speak` |
| Models | `aura-2-*` (en, es, de, nl, fr, it, ja), `aura-*` | `flux-{voice}-{language}`, e.g. `flux-alexis-en` — English at launch |
| `model` param | Optional (defaults to `aura-asteria-en`) | **Required**; an `aura-*` string is rejected |
| Best for | Broadest voice catalog, multilingual, compressed audio, one-shot synthesis | Voice agents — streaming LLM output, barge-in, multi-turn conversations |
| Mental model | Text buffer → audio stream | Streaming-first, turn-based conversation |
| Turn lifecycle | None | `SpeechStarted` → audio → `Flushed` → `SpeechMetadata` per turn (server-assigned `speech_id`) |
| Cross-turn context | None (reconnect to reset) | Prosody persists across turns automatically — no API surface |
| Transports | REST + WebSocket | REST (batch) + WebSocket (streaming) |
| Streaming encodings | `linear16`, `mulaw`, `alaw` | `linear16`, `mulaw`, `alaw` — raw audio only |
| Batch encodings | `mp3`, `opus`, `flac`, `aac`, `linear16`, `mulaw`, `alaw` + `container` / `bit_rate` | Same — but batch-only; the socket rejects them |
| Interruption | `Clear` discards the buffer, no feedback | `Interrupt` → `SpeechInterrupted` with `text_spoken` / `text_remaining` |
| Mid-stream reconfig | No (fixed at connection) | Yes — `Configure` updates `speed` only |
| `speed` | `0.7`–`1.5` — Aura-2, English and Spanish only | Seven values, `0.85`–`1.15` in `0.05` steps |
| `expressivity` | Not supported | `-2`…`2`, default `0` (beta; fixed for the connection) |
| Voice Agent `provider.version` | `v1` (the default when a provider is specified) | `v2` (required) |

**Pick Aura (`/v1/speak`) when:**
- You need a language other than English, or a specific Aura voice
- You want compressed or containerized output (`mp3`, `opus`, `flac`, `aac`) from a stream
- You're doing one-shot synthesis and don't need a turn lifecycle
- You're already on Aura and nothing in Flux TTS is pulling you over — v1 is unchanged

**Pick Flux TTS (`/v2/speak`) when:**
- Building a voice agent, phone assistant, or customer-service bot
- You're streaming LLM tokens to a speaker in real time and want the lowest time-to-first-audio
- The user may barge in mid-response and you need to know what they actually heard
- You want tone to carry across turns without managing state yourself
- You're pre-rendering fixed audio (IVR prompts, notifications) with a Flux TTS voice — use the batch REST transport

Migrating from Aura? See the official [Migrating from Aura to Flux TTS](https://developers.deepgram.com/docs/flux-tts/migrating) guide and [Batch vs Streaming](https://developers.deepgram.com/docs/flux-tts/batch-vs-streaming).

## API Domains

| Domain | REST | WebSocket | Reference |
|--------|------|-----------|-----------|
| Listen v1 — STT, Nova models | `POST /v1/listen` | `wss://api.deepgram.com/v1/listen` | [listen.md](references/listen.md) |
| Listen v2 — STT, Flux STT (conversational) | — | `wss://api.deepgram.com/v2/listen` | [listen.md](references/listen.md) |
| Speak v1 — TTS, Aura models | `POST /v1/speak` | `wss://api.deepgram.com/v1/speak` | [speak.md](references/speak.md) |
| Speak v2 — TTS, Flux TTS (turn-based) | `POST /v2/speak` | `wss://api.deepgram.com/v2/speak` | [speak.md](references/speak.md) |
| Voice Agent | `GET /v1/agent/settings/think/models` | `wss://agent.deepgram.com/v1/agent/converse` | [agent.md](references/agent.md) |
| Read (Intelligence) | `POST /v1/read` | — | [read.md](references/read.md) |
| Models | `GET /v1/models` | — | [models.md](references/models.md) |
| Projects | `/v1/projects/*` | — | [projects.md](references/projects.md) |
| Auth | `POST /v1/auth/grant` | — | [auth.md](references/auth.md) |
| Self-Hosted | `/v1/projects/*/selfhosted/*` | — | [self-hosted.md](references/self-hosted.md) |

## Common Mistakes to Avoid

### All APIs

1. **Feature flags are query params — except for Voice Agent and the v2 mid-session updates.** For `/v1/listen`, `/v2/listen`, `/v1/speak`, and `/v2/speak`, initial options go on the URL. The request body carries only audio data (REST) or audio frames (WebSocket). Exceptions: `/v1/agent/converse` has no URL query params at all (all config goes in the `Settings` message); `/v2/listen` supports a `Configure` message after connection to update EOT thresholds and keyterms mid-session; and `/v2/speak` supports a `Configure` message that updates `speed` only. Also note that `/v2/listen` has a much smaller param set than `/v1/listen` — flags like `smart_format`, `diarize`, and `punctuate` are not available.

2. **Rate limits are concurrent connections, not total requests.** A 429 means too many simultaneous open connections, not too high a request volume. Diarization and other compute-heavy features reduce your concurrency allowance further.

### STT WebSocket (`/v1/listen`)

3. **Send KeepAlive as a text frame, not binary.** The connection closes after 10 seconds of no audio. Send `{"type":"KeepAlive"}` as a text (JSON) frame every 3–5 seconds during silence. Sending it as a binary frame causes transcription delays — the audio pipeline chokes — not a silent no-op.

4. **Never send empty byte payloads.** Sending a zero-length binary frame to `/v1/listen` is treated as a close — it terminates the connection. Always check that your audio packet has length before sending.

5. **`encoding` must match the actual audio format.** If `encoding=linear16` but you're sending opus, you'll get a DATA-0000 error or garbled output. Omit `encoding` entirely when sending containerized formats (mp3, wav, ogg) — Deepgram detects them automatically.

6. **Timestamps reset on reconnect.** Each new WebSocket connection restarts timestamps at 00:00:00. For real-time apps, maintain a timestamp offset across reconnections or you'll silently corrupt your transcript timeline.

### TTS WebSocket (`/v1/speak`)

7. **Don't send empty text.** A `Speak` message with an empty `text` field returns a 400 error. Always validate input before sending.

8. **Character rate limiting (DATA-0001) means slow down, not retry.** If you hit this, reduce how fast you're submitting text chunks — don't immediately retry or you'll compound the problem.

### Flux TTS (`/v2/speak`)

9. **`model` is required, and must be a `flux-*` voice.** Unlike `/v1/speak` there is no default — a connection or request without `model` is rejected. Aura strings are rejected on `/v2/speak`, and Flux voices are not served by `/v1/speak`; the two families never mix. Model strings are `flux-{voice}-{language}`, e.g. `flux-alexis-en`. There is no version segment — generations roll forward behind a stable name, as with Flux STT.

10. **`Flush` ends the turn — it is not a v1-style buffer flush.** There is no `Finalize`; it's folded into `Flush`. Audio starts streaming on its own before you flush, so don't wait to send text. Use the turn's `SpeechMetadata` (not `Flushed`) as your end-of-turn signal — it arrives once all of the turn's audio has been sent, and carries the billing and timing counts, so you can drop client-side character or duration tracking. The server assigns the turn's `speech_id`; never send one yourself.

11. **Streaming is raw audio only, and rejects anything it doesn't recognize.** The WebSocket emits non-containerized audio, so `encoding` is limited to `linear16` (default), `mulaw`, or `alaw`. The compressed and containerized encodings (`mp3`, `opus`, `flac`, `aac`) and the `container`, `bit_rate`, `callback`, `callback_method`, and `priority` params are **batch-only** — sending them to the socket fails the connection, as does any unknown or misspelled param. Use the batch REST transport when you need compressed output.

12. **Insert whitespace between separate generations — the server won't.** Text normalization runs before synthesis, but successive `Speak` messages are concatenated verbatim. Sending `"Hello world."` then `"How are you?"` is processed as `"Hello world.How are you?"`, which causes sentence-boundary artifacts. Add a single space (or the right separator for non-whitespace languages) when you stitch a reply, a tool-call result, and another reply together. Send plain text: SSML and other markup is stripped, with an `INPUT_MARKUP_STRIPPED` warning.

### Voice Agent (`/v1/agent/converse`)

13. **Send the `Settings` message before any audio.** The agent ignores everything until it receives and acknowledges the Settings configuration. Message ordering is strictly required.

14. **`agent.speak.provider.version` selects the TTS family — and omitting `agent.speak` now gives you Flux TTS.** Set `version` to `v2` for Flux TTS or `v1` for Aura; when you specify a provider but omit `version`, it defaults to `v1`. But if you omit `agent.speak` entirely, the agent defaults to Flux TTS with the `flux-kit-en` voice. Switch families by changing `version` and `model` together — a `flux-*` model under `v1`, or an `aura-*` model under `v2`, is invalid:
    ```json
    { "agent": { "speak": { "provider": { "type": "deepgram", "version": "v2", "model": "flux-alexis-en" } } } }
    ```

### Flux STT model (`/v2/listen`)

15. **Use `/v2/listen` and `model=flux-general-en`.** `/v1/listen` does not support Flux STT. `model=flux` alone is not a valid value. Do not include `language` or `encoding` params for containerized audio.

16. **Use `Configure` to update EOT thresholds and keyterms mid-session.** Unlike `/v1/listen`, Flux STT supports live reconfiguration after connection — no need to reconnect to change turn detection sensitivity or boost new keyterms:
    ```json
    { "type": "Configure", "thresholds": { "eot_threshold": "0.8", "eot_timeout_ms": "3000" }, "keyterms": ["Deepgram"] }
    ```
    The server responds with `ConfigureSuccess` (echoing back applied values) or `ConfigureFailure`. Omitted threshold fields keep their current values.

### Authentication

17. **JWT TTL applies only to the initial handshake.** Tokens default to 30 seconds. Once the WebSocket connection is established, the token expiring does not close it — tokens are only needed for the upgrade request.

## SDK-Specific Skills

This `api` skill covers the product contracts (endpoints, query params, message shapes) that are identical across SDKs. For **language-idiomatic code** — imports, async patterns, builder APIs, common errors — install the SDK-specific skills. Each Deepgram SDK publishes 7 product skills named `deepgram-{lang}-{product}` (e.g. `deepgram-python-speech-to-text`, `deepgram-js-voice-agent`) plus a maintainer skill `deepgram-{lang}-maintaining-sdk`. The `deepgram-{lang}-` prefix avoids collisions when you install skills from multiple SDKs.

```bash
# Install all skills from a specific SDK
npx skills add deepgram/deepgram-python-sdk     # Python
npx skills add deepgram/deepgram-js-sdk         # JavaScript / TypeScript
npx skills add deepgram/deepgram-java-sdk       # Java
npx skills add deepgram/deepgram-go-sdk         # Go
npx skills add deepgram/deepgram-rust-sdk       # Rust
npx skills add deepgram/deepgram-swift-sdk      # Swift
npx skills add deepgram/deepgram-kotlin-sdk     # Kotlin
npx skills add deepgram/deepgram-dotnet-sdk     # C# / .NET
npx skills add deepgram/deepgram-browser-sdk    # Browser TypeScript

# Or install a specific product skill from one SDK (note the deepgram-{lang}- prefix)
npx skills add deepgram/deepgram-python-sdk --skill deepgram-python-speech-to-text
npx skills add deepgram/deepgram-js-sdk     --skill deepgram-js-voice-agent
```

## Related Deepgram skills

| Skill | Purpose |
|---|---|
| `recipes` | Minimal runnable snippets per feature per language |
| `examples` | Full integration examples with third-party platforms (Twilio, LiveKit, etc.) |
| `starters` | Runnable starter apps (framework × feature matrix) |
| `docs` | Navigate Deepgram documentation |
| `setup-mcp` | Install the Deepgram MCP server |

## Documentation

- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)
- [Speech-to-Text Getting Started](https://developers.deepgram.com/docs/stt/getting-started)
- [Text-to-Speech Docs (Aura)](https://developers.deepgram.com/docs/tts-rest)
- [Flux TTS Overview](https://developers.deepgram.com/docs/flux-tts/overview)
- [Voice Agent Docs](https://developers.deepgram.com/docs/voice-agent)
- [Voice Agent TTS Models](https://developers.deepgram.com/docs/voice-agent-tts-models)
- [Audio Intelligence](https://developers.deepgram.com/docs/audio-intelligence)
- [Self-Hosted Deployments](https://developers.deepgram.com/docs/self-hosted-introduction)
