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
| [deepgram-api](./skills/deepgram-api) | Full API reference for all Deepgram REST and WebSocket APIs, generated from OpenAPI and AsyncAPI specs |
| [deepgram-docs](./skills/deepgram-docs) | Find the right Deepgram documentation, plus MCP server setup for querying docs from your AI tool |
| [deepgram-starters](./skills/deepgram-starters) | Clone a ready-to-run demo app in your language and start building — 13 frameworks, 7 features |

# Try in Claude Code

You can register this repository as a Claude Code Plugin marketplace:

```
/plugin marketplace add deepgram/skills
```

Then browse and install individual plugins:

```
/plugin install deepgram-api@deepgram-agent-skills
/plugin install deepgram-docs@deepgram-agent-skills
/plugin install deepgram-starters@deepgram-agent-skills
```

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

Or trigger the [Generate Skills workflow](./.github/workflows/fetch-specs.yml) from GitHub Actions.
