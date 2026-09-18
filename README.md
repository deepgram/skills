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
- **Flux STT** (`/v2/listen`, `model=flux-general-en`) — conversational STT with built-in turn detection. Use for voice agents and interactive assistants. See the `api` skill for the full Nova vs Flux STT decision guide.

It ships two text-to-speech families on separate endpoints — the voices do not overlap:

- **Aura** (`/v1/speak`) — the broadest voice catalog (English, Spanish, German, Dutch, French, Italian, Japanese) plus compressed and containerized output. Use for one-shot synthesis and non-English voices.
- **Flux TTS** (`/v2/speak`, `model=flux-{voice}-{language}`) — streaming-first, turn-based synthesis with barge-in and cross-turn voice consistency. Use for voice agents. `model` is required, and only `flux-*` voices are accepted. See the `api` skill for the full Aura vs Flux TTS decision guide.

Some skills are hand-written, others are generated from Deepgram's [OpenAPI](https://dpgr.am/openapi.yml) and [AsyncAPI](https://dpgr.am/asyncapi.yml) specs.

## Skills

- [./skills](./skills): All Deepgram skills
- [./template](./template): Skill template for creating new skills
- [./scripts](./scripts): Scripts for fetching specs and generating skills

# Skills

| Skill | Description |
|-------|-------------|
| [speech-to-text](./skills/speech-to-text) | Start here for transcription: Nova on `/v1/listen` or Flux STT on `/v2/listen`, a first request, and where to go next |
| [text-to-speech](./skills/text-to-speech) | Start here for synthesis: Aura on `/v1/speak` or Flux TTS on `/v2/speak`, a first request, and where to go next |
| [voice-agent](./skills/voice-agent) | Start here for a voice agent: the Voice Agent API over one WebSocket, function calling, telephony wiring, and when to use an orchestrator instead |
| [audio-intelligence](./skills/audio-intelligence) | Analyze audio, not just transcribe it: `summarize`, `sentiment`, `topics`, `intents`, and `detect_entities` as parameters on `/v1/listen` |
| [text-intelligence](./skills/text-intelligence) | Analyze text you already have with the Read API: one `POST /v1/read` with `summarize`, `sentiment`, `topics`, and `intents` |
| [browser-agent](./skills/browser-agent) | Run a voice agent in the browser with the Browser Agent SDK: `@deepgram/agents`, `@deepgram/react`, `@deepgram/ui`, and `@deepgram/agents-widget` |
| [api](./skills/api) | Full API reference for all Deepgram REST and WebSocket APIs, generated from OpenAPI and AsyncAPI specs |
| [docs](./skills/docs) | Find the right Deepgram documentation for any task |
| [starters](./skills/starters) | Clone a ready-to-run demo app in your language and start building — 13 frameworks, 8 features |
| [recipes](./skills/recipes) | Focused runnable recipes for one feature × one language — minimal working code (< 50 lines) |
| [examples](./skills/examples) | Integration examples with third-party platforms (Twilio, LiveKit, LangChain, Vercel AI SDK, etc.) |
| [cli](./skills/cli) | Drive Deepgram from the terminal with `deepctl`: install, auth, `dg listen`, `dg speak`, `dg init`, and where to reach for the API instead |
| [setup-mcp](./skills/setup-mcp) | Set up the Deepgram MCP server for querying docs directly from your AI coding tool |
| [self-hosted](./skills/self-hosted) | Run Deepgram on your own GPUs: licensing, container credentials, and per-target guidance for Docker/Podman, Kubernetes, and Amazon SageMaker |

## SDK-Specific Skills

Each Deepgram SDK repository publishes its own set of language-idiomatic skills under `.agents/skills/`:

```bash
npx skills add deepgram/deepgram-python-sdk     # Python
npx skills add deepgram/deepgram-js-sdk         # JavaScript / TypeScript
npx skills add deepgram/deepgram-java-sdk       # Java
npx skills add deepgram/deepgram-go-sdk         # Go
npx skills add deepgram/deepgram-rust-sdk       # Rust
npx skills add deepgram/deepgram-dotnet-sdk     # C# / .NET
```

The Swift and Kotlin SDK repositories are not public, so `npx skills add`
cannot reach them; their skills will be listed here once the repositories open.

For browser work, use the `browser-agent` skill listed above. It covers the
four Browser Agent SDK packages published on npm:
`@deepgram/agents`, `@deepgram/react`, `@deepgram/ui`, and
`@deepgram/agents-widget`.

Each SDK ships 7 product skills named `deepgram-{lang}-{product}`. The full set for the Python SDK:

- `deepgram-python-speech-to-text`
- `deepgram-python-text-to-speech`
- `deepgram-python-text-intelligence`
- `deepgram-python-audio-intelligence`
- `deepgram-python-voice-agent`
- `deepgram-python-conversational-stt`
- `deepgram-python-management-api`

The `deepgram-{lang}-` prefix keeps names globally unique so installing skills from multiple SDKs never overwrites another SDK's skills.

This `deepgram/skills` repo covers product contracts (API reference, docs, starters, recipes, integrations, MCP). The SDK repos cover language-specific usage.

# Install

## Any AI coding tool

Works with Claude Code, OpenAI Codex, Cursor, Windsurf, GitHub Copilot, Gemini CLI, and [70+ others](https://github.com/vercel-labs/skills).

Install the skill for what you are building:

```bash
npx skills add deepgram/skills --skill speech-to-text
npx skills add deepgram/skills --skill text-to-speech
npx skills add deepgram/skills --skill voice-agent
```

Or install every skill in this repository:

```bash
npx skills add deepgram/skills
```

The installer detects the agents on your machine. To target agents explicitly, pass `-a` with the agent name (`claude-code`, `codex`, `cursor`), and `--skill` to install one skill:

```bash
npx skills add deepgram/skills -a codex -a cursor --skill api
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

- `/deepgram:speech-to-text`: Start here for transcription
- `/deepgram:text-to-speech`: Start here for synthesis
- `/deepgram:voice-agent`: Start here for a voice agent
- `/deepgram:audio-intelligence`: Analyze audio on `/v1/listen`
- `/deepgram:text-intelligence`: Analyze text with the Read API
- `/deepgram:browser-agent`: Run a voice agent in the browser
- `/deepgram:api`: Deepgram API reference
- `/deepgram:docs`: Find the right documentation
- `/deepgram:starters`: Clone a starter app
- `/deepgram:recipes`: Focused runnable recipes for one feature × one language
- `/deepgram:examples`: Integration examples with third-party platforms
- `/deepgram:cli`: Drive Deepgram from the terminal with `deepctl`
- `/deepgram:setup-mcp`: Set up the Deepgram MCP server
- `/deepgram:self-hosted`: Run Deepgram on your own GPUs

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

## OpenAI Codex

Codex loads skills from `.agents/skills/` in your working directory and every directory up to the repository root. Install the Deepgram skills into a project:

```bash
npx skills add deepgram/skills -a codex
```

This writes `.agents/skills/<skill>/` for each skill you select. Codex also reads `~/.agents/skills/` for user-wide skills, so add `-g` to install there instead of into the project:

```bash
npx skills add deepgram/skills -a codex -g
```

Inside Codex, run `/skills` to browse and apply a skill, or type `$speech-to-text`, `$text-to-speech`, `$voice-agent`, `$audio-intelligence`, `$text-intelligence`, `$browser-agent`, `$api`, `$docs`, `$starters`, `$recipes`, `$examples`, `$cli`, `$setup-mcp`, or `$self-hosted` to invoke one by name. Codex also picks a skill on its own when your task matches its description. Codex reads a project's `AGENTS.md` before working. Use it to tell Codex when to use the Deepgram skills already installed in `.agents/skills/`.

To give Codex the live documentation as well, add the Deepgram docs MCP server.
`api.dx.deepgram.com/kapa/mcp` rejects an unauthenticated request with HTTP 401
and accepts a Deepgram API key as a bearer token, so pass the key through
`--bearer-token-env-var`:

```bash
codex mcp add deepgram-docs --url https://api.dx.deepgram.com/kapa/mcp \
  --bearer-token-env-var DEEPGRAM_API_KEY
```

`https://developers.deepgram.com/_mcp/server` needs no credential at all. The
`setup-mcp` skill covers every path and the tools each one exposes.

See [Build skills](https://learn.chatgpt.com/docs/build-skills) and [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) in the Codex documentation.

## Cursor

The same installer targets Cursor, writing each skill to `.agents/skills/<skill>/` in the project:

```bash
npx skills add deepgram/skills -a cursor
```

# Creating a Skill

Skills are a folder with a `SKILL.md` file containing YAML frontmatter and instructions. Use the [template](./template/SKILL.md) as a starting point, and read [CONTRIBUTING.md](./CONTRIBUTING.md) for the folder layout, local testing, the review checklist, and the release process:

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
