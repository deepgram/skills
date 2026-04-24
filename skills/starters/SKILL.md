---
name: starters
description: >
  Clone a ready-to-run Deepgram demo app and start building on top of it. Use whenever someone
  wants a quick working demo, needs to prototype with Deepgram, or is starting a new project
  that uses speech-to-text, text-to-speech, voice agents, audio intelligence, or live streaming.
  Match the user's language, framework, and desired Deepgram feature to the right starter.
---

# Deepgram Starter Apps

Clone a working demo and start building. Every starter is a minimal, runnable app you can extend.

## 1. Pick Your Feature

What do you want to build?

- **Transcribe a file** → `transcription` — send audio/video, get text back (REST, Nova)
- **Transcribe a live stream** → `live-transcription` — real-time speech-to-text (WebSocket, Nova)
- **Generate speech** → `text-to-speech` — send text, get audio back (REST)
- **Stream speech** → `live-text-to-speech` — real-time text-to-audio (WebSocket)
- **Analyze text or audio** → `text-intelligence` — sentiment, topics, intents, summaries (REST)
- **Build a voice agent** → `voice-agent` — conversational AI agent (WebSocket, agent.deepgram.com)
- **Conversational STT with turn detection** → `flux` — Deepgram Flux for voice agents and interactive assistants (WebSocket, `/v2/listen`)

**Nova vs Flux for speech-to-text:** use `transcription` or `live-transcription` (Nova, `/v1/listen`) for general-purpose transcription, captions, and batch workloads. Use `flux` (Flux, `/v2/listen`) when you need built-in turn detection for conversational audio. See the `api` skill for a full comparison.

## 2. Pick Your Stack

| Language | Frameworks |
|----------|------------|
| JavaScript | `node` |
| TypeScript | `bun`, `deno` |
| Python | `fastapi`, `flask`, `django` |
| Go | `go` |
| Java | `java` |
| C# | `csharp` |
| Rust | `rust` |
| Ruby | `ruby` |
| PHP | `php` |
| C++ | `cpp` |

## 3. Clone and Run

Every starter lives at `https://github.com/deepgram-starters/{framework}-{feature}`:

```sh
git clone https://github.com/deepgram-starters/{framework}-{feature}.git
cd {framework}-{feature}
```

Set your API key and follow the README:

```sh
export DEEPGRAM_API_KEY=your_key_here
```

Get an API key at <https://console.deepgram.com>.

## Examples

**"I want to build a voice agent in Python"**
→ `git clone https://github.com/deepgram-starters/fastapi-voice-agent.git`

**"I need live transcription in my Node app"**
→ `git clone https://github.com/deepgram-starters/node-live-transcription.git`

**"I want to add text-to-speech to my Go service"**
→ `git clone https://github.com/deepgram-starters/go-text-to-speech.git`

**"I want to analyze audio for sentiment in C#"**
→ `git clone https://github.com/deepgram-starters/csharp-text-intelligence.git`

## All Starters

| | transcription | live-transcription | text-to-speech | live-text-to-speech | text-intelligence | voice-agent | flux |
|---|---|---|---|---|---|---|---|
| **node** | [repo](https://github.com/deepgram-starters/node-transcription) | [repo](https://github.com/deepgram-starters/node-live-transcription) | [repo](https://github.com/deepgram-starters/node-text-to-speech) | [repo](https://github.com/deepgram-starters/node-live-text-to-speech) | [repo](https://github.com/deepgram-starters/node-text-intelligence) | [repo](https://github.com/deepgram-starters/node-voice-agent) | [repo](https://github.com/deepgram-starters/node-flux) |
| **bun** | [repo](https://github.com/deepgram-starters/bun-transcription) | [repo](https://github.com/deepgram-starters/bun-live-transcription) | [repo](https://github.com/deepgram-starters/bun-text-to-speech) | [repo](https://github.com/deepgram-starters/bun-live-text-to-speech) | [repo](https://github.com/deepgram-starters/bun-text-intelligence) | [repo](https://github.com/deepgram-starters/bun-voice-agent) | [repo](https://github.com/deepgram-starters/bun-flux) |
| **deno** | [repo](https://github.com/deepgram-starters/deno-transcription) | [repo](https://github.com/deepgram-starters/deno-live-transcription) | [repo](https://github.com/deepgram-starters/deno-text-to-speech) | [repo](https://github.com/deepgram-starters/deno-live-text-to-speech) | [repo](https://github.com/deepgram-starters/deno-text-intelligence) | [repo](https://github.com/deepgram-starters/deno-voice-agent) | [repo](https://github.com/deepgram-starters/deno-flux) |
| **fastapi** | [repo](https://github.com/deepgram-starters/fastapi-transcription) | [repo](https://github.com/deepgram-starters/fastapi-live-transcription) | [repo](https://github.com/deepgram-starters/fastapi-text-to-speech) | [repo](https://github.com/deepgram-starters/fastapi-live-text-to-speech) | [repo](https://github.com/deepgram-starters/fastapi-text-intelligence) | [repo](https://github.com/deepgram-starters/fastapi-voice-agent) | [repo](https://github.com/deepgram-starters/fastapi-flux) |
| **flask** | [repo](https://github.com/deepgram-starters/flask-transcription) | [repo](https://github.com/deepgram-starters/flask-live-transcription) | [repo](https://github.com/deepgram-starters/flask-text-to-speech) | [repo](https://github.com/deepgram-starters/flask-live-text-to-speech) | [repo](https://github.com/deepgram-starters/flask-text-intelligence) | [repo](https://github.com/deepgram-starters/flask-voice-agent) | [repo](https://github.com/deepgram-starters/flask-flux) |
| **django** | [repo](https://github.com/deepgram-starters/django-transcription) | [repo](https://github.com/deepgram-starters/django-live-transcription) | [repo](https://github.com/deepgram-starters/django-text-to-speech) | [repo](https://github.com/deepgram-starters/django-live-text-to-speech) | [repo](https://github.com/deepgram-starters/django-text-intelligence) | [repo](https://github.com/deepgram-starters/django-voice-agent) | [repo](https://github.com/deepgram-starters/django-flux) |
| **go** | [repo](https://github.com/deepgram-starters/go-transcription) | [repo](https://github.com/deepgram-starters/go-live-transcription) | [repo](https://github.com/deepgram-starters/go-text-to-speech) | [repo](https://github.com/deepgram-starters/go-live-text-to-speech) | [repo](https://github.com/deepgram-starters/go-text-intelligence) | [repo](https://github.com/deepgram-starters/go-voice-agent) | [repo](https://github.com/deepgram-starters/go-flux) |
| **java** | [repo](https://github.com/deepgram-starters/java-transcription) | [repo](https://github.com/deepgram-starters/java-live-transcription) | [repo](https://github.com/deepgram-starters/java-text-to-speech) | [repo](https://github.com/deepgram-starters/java-live-text-to-speech) | [repo](https://github.com/deepgram-starters/java-text-intelligence) | [repo](https://github.com/deepgram-starters/java-voice-agent) | [repo](https://github.com/deepgram-starters/java-flux) |
| **csharp** | [repo](https://github.com/deepgram-starters/csharp-transcription) | [repo](https://github.com/deepgram-starters/csharp-live-transcription) | [repo](https://github.com/deepgram-starters/csharp-text-to-speech) | [repo](https://github.com/deepgram-starters/csharp-live-text-to-speech) | [repo](https://github.com/deepgram-starters/csharp-text-intelligence) | [repo](https://github.com/deepgram-starters/csharp-voice-agent) | [repo](https://github.com/deepgram-starters/csharp-flux) |
| **rust** | [repo](https://github.com/deepgram-starters/rust-transcription) | [repo](https://github.com/deepgram-starters/rust-live-transcription) | [repo](https://github.com/deepgram-starters/rust-text-to-speech) | [repo](https://github.com/deepgram-starters/rust-live-text-to-speech) | [repo](https://github.com/deepgram-starters/rust-text-intelligence) | [repo](https://github.com/deepgram-starters/rust-voice-agent) | [repo](https://github.com/deepgram-starters/rust-flux) |
| **ruby** | [repo](https://github.com/deepgram-starters/ruby-transcription) | [repo](https://github.com/deepgram-starters/ruby-live-transcription) | [repo](https://github.com/deepgram-starters/ruby-text-to-speech) | [repo](https://github.com/deepgram-starters/ruby-live-text-to-speech) | [repo](https://github.com/deepgram-starters/ruby-text-intelligence) | [repo](https://github.com/deepgram-starters/ruby-voice-agent) | [repo](https://github.com/deepgram-starters/ruby-flux) |
| **php** | [repo](https://github.com/deepgram-starters/php-transcription) | [repo](https://github.com/deepgram-starters/php-live-transcription) | [repo](https://github.com/deepgram-starters/php-text-to-speech) | [repo](https://github.com/deepgram-starters/php-live-text-to-speech) | [repo](https://github.com/deepgram-starters/php-text-intelligence) | [repo](https://github.com/deepgram-starters/php-voice-agent) | [repo](https://github.com/deepgram-starters/php-flux) |
| **cpp** | [repo](https://github.com/deepgram-starters/cpp-transcription) | [repo](https://github.com/deepgram-starters/cpp-live-transcription) | [repo](https://github.com/deepgram-starters/cpp-text-to-speech) | [repo](https://github.com/deepgram-starters/cpp-live-text-to-speech) | [repo](https://github.com/deepgram-starters/cpp-text-intelligence) | [repo](https://github.com/deepgram-starters/cpp-voice-agent) | [repo](https://github.com/deepgram-starters/cpp-flux) |

## Need something more specific?

- **Focused feature snippets** (one feature, one language, < 50 lines) → `recipes` skill → <https://github.com/deepgram/recipes>
- **Third-party integrations** (Twilio, LiveKit, LangChain, Vercel AI SDK, Discord, etc.) → `examples` skill → <https://github.com/deepgram/examples>
- **SDK-specific code skills** (idiomatic imports, async patterns, gotchas) → `npx skills add deepgram/deepgram-{lang}-sdk` — see the `api` skill for the full list of 9 SDKs.

## Related Deepgram skills

- `api` — consolidated REST + WebSocket API reference
- `recipes` — minimal runnable feature snippets per language
- `examples` — full integration examples with third-party platforms
- `docs` — documentation finder
- `setup-mcp` — Deepgram MCP server installation
