---
name: examples
description: >
  Find working Deepgram integration examples with third-party platforms and frameworks.
  Use whenever someone wants to integrate Deepgram with Twilio, LiveKit, LangChain,
  Vercel AI SDK, Discord, Vonage, Pipecat, Expo, FastAPI, Cloudflare Workers, Slack,
  Telegram, LlamaIndex, Zoom, Next.js, Nuxt, Django, SvelteKit, NestJS, Spring Boot,
  CrewAI, Riverside, SignalWire, and more. Examples are full runnable integration
  demos, not minimal feature snippets.
---

# Deepgram Examples

Working examples showing how to use Deepgram with popular platforms, frameworks, and ecosystems.

## When to use examples

- You're integrating Deepgram with a specific third-party service (telephony, video, LLM frameworks, bots, cloud platforms)
- You want a runnable demo of a complete integration, not just SDK-level code
- You want to see Deepgram slotted into a real-world architecture

**Use a different skill when:**
- You want a minimal feature snippet (one product, one language, < 50 lines) → `recipes` skill
- You want a clean starter app to extend with no third-party service → `starters` skill
- You want the raw API contract → `api` skill

## Browse examples

Repository: <https://github.com/deepgram/examples>

Examples are numbered (010, 020, ...) and each is a self-contained integration.

## Category map

| Category | Integrations |
|---|---|
| **Telephony** | Twilio, Vonage, SignalWire, Daily.co, Asterisk/FreeSWITCH |
| **Voice AI frameworks** | LiveKit Agents, Pipecat, OpenAI Agents SDK, CrewAI |
| **LLM frameworks** | LangChain, LlamaIndex, Vercel AI SDK |
| **Chat platforms** | Discord, Slack, Telegram |
| **Web frameworks** | Next.js, Nuxt, Django, SvelteKit, NestJS, Express + React, FastAPI, Spring Boot |
| **Mobile / desktop** | Expo, Flutter, Swift iOS, Kotlin Android, Tauri, Electron |
| **Cloud / serverless** | AWS Lambda, Cloudflare Workers |
| **Recording platforms** | Zoom, Riverside.fm |
| **Browser / no-bundler** | Vanilla JavaScript |
| **Low-code / automation** | n8n community nodes |

## Install the related SDK skills

If your integration uses a specific Deepgram SDK, install its skills for language-idiomatic patterns:

```bash
npx skills add deepgram/deepgram-python-sdk     # Python
npx skills add deepgram/deepgram-js-sdk         # Node.js / TypeScript
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
- `recipes` — focused feature snippets (one feature, one language)
- `starters` — starter apps without third-party integrations
- `docs` — documentation finder
- `setup-mcp` — Deepgram MCP server installation
