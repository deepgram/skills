---
name: recipes
description: >
  Find focused, runnable Deepgram recipes for a specific feature × language. Use whenever
  someone wants a minimal working code snippet for ONE feature (transcribe URL, diarize,
  smart-format, voice agent connect, etc.) rather than a full starter app. Recipes are
  under 50 lines, read DEEPGRAM_API_KEY from env, and ship with a runnable example_test.
  Covers Python, JavaScript, Go, .NET, Java, Rust, and the Deepgram CLI.
---

# Deepgram Recipes

Agent-maintained micro-recipes showing how to use every Deepgram SDK feature across every supported language. Each recipe is a focused, runnable snippet — not a full app.

## When to use recipes

- You know the product and feature; you want the shortest working code
- You want `example.py` / `example.js` / `example.go` / etc. you can copy into your project
- You want a language-specific answer to "how do I call `{feature}` with the Deepgram SDK?"

**Use a different skill when:**
- You want a full starter app with a web UI, deploy config, etc. → `starters` skill
- You want integration with a third-party platform (Twilio, LiveKit, Vercel AI SDK, Discord, etc.) → `examples` skill
- You want the full API contract (params, responses, message shapes) → `api` skill

## Browse recipes

Repository: <https://github.com/deepgram/recipes>

Coverage matrix: <https://github.com/deepgram/recipes/blob/main/COVERAGE.md>

## Recipe structure

```
recipes/{language}/{product}/{version}/{recipe}/
  example.{ext}       # runnable, < 50 lines, reads DEEPGRAM_API_KEY from env
  example_test.{ext}  # runs the example as a subprocess, asserts output
  README.md           # feature explanation, params, sample output, how to run
```

## Products covered

| Product | Recipe examples |
|---|---|
| Speech-to-Text — Nova (`/v1/listen`) | transcribe-url, transcribe-file, paragraphs, diarize, smart-format, utterances, summarize, sentiment, topics, intents, detect-entities, detect-language, redact, search, keywords, streaming |
| Speech-to-Text — Flux (`/v2/listen`) | streaming conversational transcription, EOT / eager-EOT, mid-session `Configure`, keyterms |
| Text-to-Speech | generate-audio, stream-audio, websocket-streaming, select-model, select-encoding |
| Audio Intelligence | summarize, sentiment, topics, intents, entities |
| Voice Agents | connect, custom-llm, custom-tts, function-calling |

Nova is the general-purpose STT family; Flux is designed for conversational audio and voice agents. Both are actively maintained — see the `api` skill's "Nova vs Flux" section for the decision guide.

## Languages

Python, JavaScript, Go, .NET, Java, Rust, plus the Deepgram CLI (`dg` / `deepctl`).

## Install the related SDK skills

For language-idiomatic patterns beyond a single recipe (full quick-starts, common patterns, gotchas), install the SDK-specific skills:

```bash
npx skills add deepgram/deepgram-python-sdk     # Python
npx skills add deepgram/deepgram-js-sdk         # JavaScript / TypeScript
npx skills add deepgram/deepgram-java-sdk       # Java
npx skills add deepgram/deepgram-go-sdk         # Go
npx skills add deepgram/deepgram-rust-sdk       # Rust
npx skills add deepgram/deepgram-dotnet-sdk     # C# / .NET
npx skills add deepgram/deepgram-swift-sdk      # Swift
npx skills add deepgram/deepgram-kotlin-sdk     # Kotlin
npx skills add deepgram/deepgram-browser-sdk    # Browser TypeScript
```

## Related Deepgram skills

- `api` — consolidated REST + WebSocket API reference
- `examples` — third-party platform integrations (Twilio, LiveKit, LangChain, etc.)
- `starters` — runnable starter apps (framework × feature matrix)
- `docs` — documentation finder
- `setup-mcp` — Deepgram MCP server installation
