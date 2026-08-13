---
name: docs
description: >
  Find the right Deepgram documentation for any task. Use whenever someone needs help locating
  docs, understanding which API to use, or wants to ask questions about Deepgram. Covers all
  product areas: speech-to-text (Nova, Flux STT), text-to-speech (Aura, Flux TTS), voice agents,
  audio intelligence, and self-hosted deployments.
---

# Deepgram Documentation

Find the right docs for what you're building with Deepgram.

## Ask AI

Have a question? Get answers from Deepgram's AI assistant at <https://developers.deepgram.com/ask-ai>.

## Documentation by Topic

### Speech-to-Text (STT)

Transcribe audio and video into text. Deepgram ships two actively maintained, next-gen model families — pick the one that matches your use case.

- **Nova** (`/v1/listen`) — general-purpose transcription (captions, subtitles, batch files, live streams). Rich feature set including intelligence overlays (diarize, summarize, sentiment, topics, intents).
- **Flux STT** (`/v2/listen`) — conversational-audio transcription for voice agents and interactive assistants. Built-in turn-taking (EOT events, mid-session reconfig).

Docs:
- [STT Getting Started (Nova)](https://developers.deepgram.com/docs/stt/getting-started)
- [Flux STT Quickstart](https://developers.deepgram.com/docs/flux/quickstart)
- [Nova 3 → Flux STT migration](https://developers.deepgram.com/docs/flux/nova-3-migration)
- [Flux STT language prompting](https://developers.deepgram.com/docs/flux/language-prompting)

### Text-to-Speech (TTS)

Convert text into natural-sounding speech. Deepgram ships two TTS model families on separate endpoints — the voices do not overlap.

- **Aura** (`/v1/speak`) — the broadest voice catalog (English, Spanish, German, Dutch, French, Italian, Japanese) and compressed/containerized output. Use for one-shot synthesis and any non-English voice.
- **Flux TTS** (`/v2/speak`) — streaming-first, voice-agent-first synthesis. Turn-based lifecycle, barge-in with spoken-text feedback, and prosody that carries across turns. English at launch.

Docs:
- [Text-to-Speech Docs (Aura)](https://developers.deepgram.com/docs/tts-rest)
- [Aura voices and languages](https://developers.deepgram.com/docs/tts-models)
- [Flux TTS Overview](https://developers.deepgram.com/docs/flux-tts/overview)
- [Flux TTS Streaming Quickstart](https://developers.deepgram.com/docs/flux-tts/quickstart)
- [Flux TTS Batch (REST) Quickstart](https://developers.deepgram.com/docs/flux-tts/batch)
- [Flux TTS batch vs streaming](https://developers.deepgram.com/docs/flux-tts/batch-vs-streaming)
- [Flux TTS voices](https://developers.deepgram.com/docs/flux-tts/voices)
- [Aura → Flux TTS migration](https://developers.deepgram.com/docs/flux-tts/migrating)

### Voice Agent

Build conversational voice agents powered by Deepgram.

- [Voice Agent Docs](https://developers.deepgram.com/docs/voice-agent)
- [Voice Agent TTS models (Aura vs Flux TTS)](https://developers.deepgram.com/docs/voice-agent-tts-models)
- [Build a Flux TTS voice agent](https://developers.deepgram.com/docs/flux-tts/voice-agent)

### Text and Audio Intelligence

Analyze text and audio for sentiment, topics, intents, summaries, and more.

- [Audio Intelligence Docs](https://developers.deepgram.com/docs/audio-intelligence)

### Self-Hosted Deployments

Run Deepgram on your own infrastructure.

- [Self-Hosted Introduction](https://developers.deepgram.com/docs/self-hosted-introduction)

### API Reference

Full reference for all Deepgram REST and WebSocket APIs.

- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)

## SDK-Specific Skills

For language-idiomatic code patterns (imports, async idioms, error handling, type shapes), install the Deepgram SDK's own skills. Every Deepgram SDK publishes 7 product skills plus a maintainer skill:

```bash
npx skills add deepgram/deepgram-python-sdk     # Python
npx skills add deepgram/deepgram-js-sdk         # JavaScript / TypeScript
npx skills add deepgram/deepgram-java-sdk       # Java
npx skills add deepgram/deepgram-go-sdk         # Go
npx skills add deepgram/deepgram-rust-sdk       # Rust
npx skills add deepgram/deepgram-swift-sdk      # Swift
npx skills add deepgram/deepgram-kotlin-sdk     # Kotlin
npx skills add deepgram/deepgram-dotnet-sdk     # C# / .NET
npx skills add deepgram/deepgram-browser-sdk    # Browser TypeScript
```

## Related Deepgram skills

- `api` — consolidated REST + WebSocket API reference
- `recipes` — minimal runnable feature snippets per language
- `examples` — full integration examples with third-party platforms
- `starters` — runnable starter apps (framework × feature)
- `setup-mcp` — Deepgram MCP server installation

## MCP Server

For direct documentation querying from your AI coding tool, use the `setup-mcp` skill to install the Deepgram MCP server.
