---
name: api
description: >
  Deepgram API reference for speech-to-text, text-to-speech, voice agents, audio intelligence,
  and account management. Use whenever building with Deepgram APIs — REST or WebSocket. Covers
  authentication, all endpoints, query parameters, request/response schemas, and WebSocket
  message formats. Reference files are organized by domain: listen (STT), speak (TTS), agent
  (voice agents), read (text/audio intelligence), models, projects, auth, and self-hosted.
---

# Deepgram API

Build with Deepgram's speech-to-text, text-to-speech, voice agent, and audio intelligence APIs.

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
  ┌──────────────┬──────────────┼──────────────┬──────────────┐
  ▼              ▼              ▼              ▼              ▼
/v1/listen   /v2/listen     /v1/speak      /v1/read    /v1/projects/*
 Nova — ASR   Flux — conv.   TTS            Text AI     Management
REST or WSS   WSS only       REST or WSS    REST only   REST only

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
   └─ Flux models via /v2/listen
      └─ Live stream          →  WSS   wss://api.deepgram.com/v2/listen?model=flux-general-en

Text → audio?
├─ One-shot                   →  REST POST /v1/speak
└─ Low-latency stream         →  WSS  wss://api.deepgram.com/v1/speak

Full conversational voice agent (audio in, audio out)?
└─ WSS wss://agent.deepgram.com/v1/agent/converse
   Deepgram handles STT + your configured LLM + TTS internally

Analyze text for insights?
└─ REST POST /v1/read
   (summaries, sentiment, topics, intents)
```

## Speech-to-Text: Nova (`/v1/listen`) vs Flux (`/v2/listen`)

Both model families are actively maintained and industry-leading. They solve different problems — pick the one that matches your use case.

| | Nova (`/v1/listen`) | Flux (`/v2/listen`) |
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

**Pick Flux (`/v2/listen`, `model=flux-general-en`) when:**
- Building an interactive voice agent or assistant
- You want end-of-turn detection handled for you
- You need low-latency turn signals and barge-in support
- You want to update EOT thresholds or keyterms mid-session without reconnecting

Migrating from Nova 3 to Flux? See the official [Nova 3 → Flux migration guide](https://developers.deepgram.com/docs/flux/nova-3-migration).

## API Domains

| Domain | REST | WebSocket | Reference |
|--------|------|-----------|-----------|
| Listen v1 — STT, Nova models | `POST /v1/listen` | `wss://api.deepgram.com/v1/listen` | [listen.md](references/listen.md) |
| Listen v2 — STT, Flux (conversational) | — | `wss://api.deepgram.com/v2/listen` | [listen.md](references/listen.md) |
| Speak (TTS) | `POST /v1/speak` | `wss://api.deepgram.com/v1/speak` | [speak.md](references/speak.md) |
| Voice Agent | `GET /v1/agent/settings/think/models` | `wss://agent.deepgram.com/v1/agent/converse` | [agent.md](references/agent.md) |
| Read (Intelligence) | `POST /v1/read` | — | [read.md](references/read.md) |
| Models | `GET /v1/models` | — | [models.md](references/models.md) |
| Projects | `/v1/projects/*` | — | [projects.md](references/projects.md) |
| Auth | `POST /v1/auth/grant` | — | [auth.md](references/auth.md) |
| Self-Hosted | `/v1/projects/*/selfhosted/*` | — | [self-hosted.md](references/self-hosted.md) |

## Common Mistakes to Avoid

### All APIs

1. **Feature flags are query params — except for Voice Agent and Flux mid-session updates.** For `/v1/listen`, `/v2/listen`, and `/v1/speak`, initial options go on the URL. The request body carries only audio data (REST) or audio frames (WebSocket). Two exceptions: `/v1/agent/converse` has no URL query params at all (all config goes in the `Settings` message); and `/v2/listen` supports a `Configure` message after connection to update EOT thresholds and keyterms mid-session. Also note that `/v2/listen` has a much smaller param set than `/v1/listen` — flags like `smart_format`, `diarize`, and `punctuate` are not available.

2. **Rate limits are concurrent connections, not total requests.** A 429 means too many simultaneous open connections, not too high a request volume. Diarization and other compute-heavy features reduce your concurrency allowance further.

### STT WebSocket (`/v1/listen`)

3. **Send KeepAlive as a text frame, not binary.** The connection closes after 10 seconds of no audio. Send `{"type":"KeepAlive"}` as a text (JSON) frame every 3–5 seconds during silence. Sending it as a binary frame causes transcription delays — the audio pipeline chokes — not a silent no-op.

4. **Never send empty byte payloads.** Sending a zero-length binary frame to `/v1/listen` is treated as a close — it terminates the connection. Always check that your audio packet has length before sending.

5. **`encoding` must match the actual audio format.** If `encoding=linear16` but you're sending opus, you'll get a DATA-0000 error or garbled output. Omit `encoding` entirely when sending containerized formats (mp3, wav, ogg) — Deepgram detects them automatically.

6. **Timestamps reset on reconnect.** Each new WebSocket connection restarts timestamps at 00:00:00. For real-time apps, maintain a timestamp offset across reconnections or you'll silently corrupt your transcript timeline.

### TTS WebSocket (`/v1/speak`)

7. **Don't send empty text.** A `Speak` message with an empty `text` field returns a 400 error. Always validate input before sending.

8. **Character rate limiting (DATA-0001) means slow down, not retry.** If you hit this, reduce how fast you're submitting text chunks — don't immediately retry or you'll compound the problem.

### Voice Agent (`/v1/agent/converse`)

9. **Send the `Settings` message before any audio.** The agent ignores everything until it receives and acknowledges the Settings configuration. Message ordering is strictly required.

### Flux model

10. **Use `/v2/listen` and `model=flux-general-en`.** `/v1/listen` does not support Flux. `model=flux` alone is not a valid value. Do not include `language` or `encoding` params for containerized audio.

11. **Use `Configure` to update EOT thresholds and keyterms mid-session.** Unlike `/v1/listen`, Flux supports live reconfiguration after connection — no need to reconnect to change turn detection sensitivity or boost new keyterms:
    ```json
    { "type": "Configure", "thresholds": { "eot_threshold": "0.8", "eot_timeout_ms": "3000" }, "keyterms": ["Deepgram"] }
    ```
    The server responds with `ConfigureSuccess` (echoing back applied values) or `ConfigureFailure`. Omitted threshold fields keep their current values.

### Authentication

12. **JWT TTL applies only to the initial handshake.** Tokens default to 30 seconds. Once the WebSocket connection is established, the token expiring does not close it — tokens are only needed for the upgrade request.

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
- [Text-to-Speech Docs](https://developers.deepgram.com/docs/tts-rest)
- [Voice Agent Docs](https://developers.deepgram.com/docs/voice-agent)
- [Audio Intelligence](https://developers.deepgram.com/docs/audio-intelligence)
- [Self-Hosted Deployments](https://developers.deepgram.com/docs/self-hosted-introduction)
