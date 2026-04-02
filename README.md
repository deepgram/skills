# Deepgram Skills

Skills are folders of instructions and resources that AI coding tools load to help you build with Deepgram faster. Each skill teaches your tool how to use a specific part of the Deepgram platform — from API reference to finding the right starter app.

For more information, check out:
- [Deepgram Documentation](https://developers.deepgram.com)
- [Deepgram API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)
- [Ask Deepgram AI](https://developers.deepgram.com/ask-ai)

# About This Repository

This repository contains skills for building with Deepgram's speech-to-text, text-to-speech, voice agent, and audio intelligence APIs. Skills are agent-agnostic — plain markdown that any AI coding tool can consume.

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
| [setup-mcp](./skills/setup-mcp) | Set up the Deepgram MCP server for querying docs directly from your AI coding tool |

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
- `/deepgram:setup-mcp` — Set up the Deepgram MCP server

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
