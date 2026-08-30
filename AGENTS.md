# deepgram/skills

Instructions for AI coding agents working in this repository. Read this file
before writing any code.

Agent-agnostic skills for building with Deepgram: plain-markdown instruction
folders that AI coding tools (Claude Code, Cursor, Windsurf, GitHub Copilot,
Gemini CLI, and others) load to use Deepgram's speech-to-text, text-to-speech,
voice agent, and audio intelligence APIs correctly.

## Layout

| Path | Purpose |
|------|---------|
| `skills/` | The six shipped skills: `api`, `docs`, `starters`, `recipes`, `examples`, `setup-mcp` |
| `template/` | Starting point for a new skill (`SKILL.md` with YAML frontmatter) |
| `scripts/` | `fetch-specs.ts` and `generate-skills.ts` — regenerate the `api` skill from the public OpenAPI and AsyncAPI specs |
| `.claude-plugin/` | Claude Code plugin-marketplace manifest |

## Install (consumer side)

```bash
npx skills add deepgram/skills          # any AI coding tool
```

Claude Code plugin route: `/plugin marketplace add deepgram/skills`, then
`/plugin install deepgram@deepgram-agent-skills`.

## Regenerate and check headlessly (maintainer side)

Requires [bun](https://bun.sh). There is no test suite; regeneration
completing and a clean `git diff` (or an intended one) is the check.

```bash
bun run scripts/fetch-specs.ts https://dpgr.am/openapi.yml https://dpgr.am/asyncapi.yml
bun install && bun run scripts/generate-skills.ts
```

## Versions and conventions (as of 2026-08-24)

- The generated `api` skill tracks the hourly-mirrored public specs at
  `https://dpgr.am/openapi.yml` and `https://dpgr.am/asyncapi.yml`.
- SDK-specific skills do NOT live here: each public SDK repository ships its
  own under `.agents/skills/` (JavaScript, Python, Java, Go, Rust, .NET).
- Every skill is a folder with a `SKILL.md` whose frontmatter needs exactly
  `name` (lowercase, hyphenated) and `description`.

## Common failure modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `npx skills add deepgram/<repo>` fails with a not-found or auth error | the target repository is private or does not exist | only the six public SDK repositories listed in README.md carry installable skills |
| `bun: command not found` | bun not installed | install from https://bun.sh; the generation scripts are bun-only |
| Regenerated `api` skill shows unexpected churn | the upstream specs moved | inspect the spec diff first; the specs are the source of truth |

## Live documentation and machine-readable surfaces

- Documentation: https://developers.deepgram.com — append `.md` to any docs
  page URL to get clean Markdown.
- Agent index of all documentation: https://developers.deepgram.com/llms.txt
- API specifications: https://developers.deepgram.com/openapi.yaml and
  https://developers.deepgram.com/asyncapi.yaml, mirrored hourly at
  https://github.com/deepgram/deepgram-api-specs
- API status (machine-readable): https://status.deepgram.com/api/v2/status.json
