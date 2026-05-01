# Deepgram Skills

Skills are folders of instructions and resources that AI coding tools load to help you build with Deepgram faster. Each skill teaches your tool how to use a specific part of the Deepgram platform — from API reference to finding the right starter app.

For more information, check out:
- [Deepgram Documentation](https://developers.deepgram.com)
- [Deepgram API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)
- [Ask Deepgram AI](https://developers.deepgram.com/ask-ai)

# About This Repository

This repository contains skills for building with Deepgram's speech-to-text, text-to-speech, voice agent, and audio intelligence APIs. Skills are agent-agnostic — plain markdown that any AI coding tool can consume.

Deepgram ships two actively maintained, industry-leading speech-to-text model families:

- **Nova** (`/v1/listen`) — general-purpose transcription with a rich intelligence feature set (diarize, summarize, sentiment, topics, intents). Use for captions, subtitles, batch, and general live streaming.
- **Flux** (`/v2/listen`, `model=flux-general-en`) — conversational STT with built-in turn detection. Use for voice agents and interactive assistants. See the `api` skill for the full Nova vs Flux decision guide.

Some skills are hand-written, others are generated from Deepgram's [OpenAPI](https://dpgr.am/openapi.yml) and [AsyncAPI](https://dpgr.am/asyncapi.yml) specs.

## Skills

- [./skills](./skills): All Deepgram skills
- [./template](./template): Skill template for creating new skills
- [./scripts](./scripts): Scripts for fetching specs and generating skills

# Skills

| Skill | Description |
|-------|-------------|
| [api](./skills/api) | Full API reference for all Deepgram REST and WebSocket APIs, generated from OpenAPI and AsyncAPI specs |
| [docs](./skills/docs) | Find the right Deepgram documentation for any task |
| [starters](./skills/starters) | Clone a ready-to-run demo app in your language and start building — 13 frameworks, 7 features |
| [recipes](./skills/recipes) | Focused runnable recipes for one feature × one language — minimal working code (< 50 lines) |
| [examples](./skills/examples) | Integration examples with third-party platforms (Twilio, LiveKit, LangChain, Vercel AI SDK, etc.) |
| [setup-mcp](./skills/setup-mcp) | Set up the Deepgram MCP server for querying docs directly from your AI coding tool |

## SDK-Specific Skills

Each Deepgram SDK repository publishes its own set of language-idiomatic skills under `.agents/skills/`:

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

Each SDK ships 7 product skills named `deepgram-{lang}-{product}` plus a maintainer skill `deepgram-{lang}-maintaining-sdk`. Example names for the Python SDK:

- `deepgram-python-speech-to-text`
- `deepgram-python-text-to-speech`
- `deepgram-python-text-intelligence`
- `deepgram-python-audio-intelligence`
- `deepgram-python-voice-agent`
- `deepgram-python-conversational-stt`
- `deepgram-python-management-api`
- `deepgram-python-maintaining-sdk`

The `deepgram-{lang}-` prefix keeps names globally unique so installing skills from multiple SDKs never overwrites another SDK's skills.

This `deepgram/skills` repo covers product contracts (API reference, docs, starters, recipes, integrations, MCP). The SDK repos cover language-specific usage.

# Install

## Any AI coding tool

Works with Claude Code, Cursor, Windsurf, GitHub Copilot, Gemini CLI, and [30+ others](https://github.com/vercel-labs/skills):

```bash
npx skills add deepgram/skills
```

## Claude Code (native plugin system)

Register this repository as a plugin marketplace:

```
/plugin marketplace add deepgram/skills
```

Then install the Deepgram plugin:

```
/plugin install deepgram@deepgram-agent-skills
```

This gives you the following slash commands:

- `/deepgram:api` — Deepgram API reference
- `/deepgram:docs` — Find the right documentation
- `/deepgram:starters` — Clone a starter app
- `/deepgram:recipes` — Focused runnable recipes for one feature × one language
- `/deepgram:examples` — Integration examples with third-party platforms
- `/deepgram:setup-mcp` — Set up the Deepgram MCP server

You can also install SDK-specific skill plugins from the same marketplace:

```
/plugin install deepgram-js-sdk@deepgram-agent-skills
/plugin install deepgram-python-sdk@deepgram-agent-skills
/plugin install deepgram-java-sdk@deepgram-agent-skills
/plugin install deepgram-go-sdk@deepgram-agent-skills
/plugin install deepgram-rust-sdk@deepgram-agent-skills
/plugin install deepgram-dotnet-sdk@deepgram-agent-skills
```

Each SDK plugin installs the 7 language-idiomatic skills from that SDK's repository.

# Creating a Skill

Skills are a folder with a `SKILL.md` file containing YAML frontmatter and instructions. Use the [template](./template/SKILL.md) as a starting point:

```markdown
---
name: my-skill-name
description: A clear description of what this skill does and when to use it.
---

# My Skill Name

[Instructions that your AI tool will follow when this skill is active]
```

The frontmatter requires two fields:
- `name` — A unique identifier for your skill (lowercase, hyphens for spaces)
- `description` — What the skill does and when to use it

## Generating API Reference Skills

The API reference skills are generated from Deepgram's specs. To regenerate:

```sh
# Fetch the latest specs
bun run scripts/fetch-specs.ts https://dpgr.am/openapi.yml https://dpgr.am/asyncapi.yml

# Generate reference markdown
bun install && bun run scripts/generate-skills.ts
```
