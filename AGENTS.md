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
| `.claude-plugin/` | Claude Code plugin-marketplace manifest — `metadata.version` is the released version, and `plugins[0].skills` is the list the installer reads |
| `CHANGELOG.md` | Keep a Changelog / SemVer record; every release has an entry |
| `package.json`, `bun.lock` | the single `yaml` dependency the generator needs |
| `.github/workflows/` | `context7.yml` only — refreshes Context7 on a published release |

## Install (consumer side)

```bash
npx skills add deepgram/skills          # any AI coding tool, interactive
```

The bare command opens a picker. With no TTY it exits 1 with `Interactive
prompt required but stdin is not a TTY` and installs nothing, so name the
targets when running headlessly:

```bash
npx skills add deepgram/skills --all                    # every skill, every detected agent
npx skills add deepgram/skills --agent claude-code -y   # one agent, every skill
npx skills add deepgram/skills --skill api -y           # one skill
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

## Versions and conventions (as of 2026-09-18)

- The generated `api` skill tracks the hourly-mirrored public specs at
  `https://dpgr.am/openapi.yml` and `https://dpgr.am/asyncapi.yml`.
- SDK-specific skills do NOT live here: each public SDK repository ships its
  own under `.agents/skills/` (JavaScript, Python, Java, Go, Rust, .NET).
- Every skill is a folder with a `SKILL.md` whose frontmatter requires
  `name` (lowercase, hyphenated) and `description`. Extra keys are allowed —
  `template/SKILL.md` also carries a `metadata` block.

## Release process (maintainer side)

A skill change is not finished when the markdown is edited. Every release bumps
two files together and then ships a tag:

1. Add an entry to `CHANGELOG.md` under a new `## [x.y.z] - YYYY-MM-DD` heading
   (Added / Changed / Fixed), describing the change per skill.
2. Set the same `x.y.z` in `.claude-plugin/marketplace.json` → `metadata.version`.
   It must match the newest `CHANGELOG.md` heading.
3. Commit as `chore: bump version to x.y.z and update changelog`.
4. Publish a GitHub release tagged `deepgram-skills-vx.y.z`. That is what
   triggers `.github/workflows/context7.yml`.

Adding a skill also means adding its path to `plugins[0].skills` in
`.claude-plugin/marketplace.json`, or the installer will not offer it.

## Common failure modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `npx skills add deepgram/<repo>` fails with a not-found or auth error | the target repository is private or does not exist | only the six public SDK repositories listed in README.md carry installable skills |
| `bun: command not found` | bun not installed | install from https://bun.sh; the generation scripts are bun-only |
| `ENOENT ... specs/openapi.yml` from `generate-skills.ts` | `fetch-specs.ts` was not run first; `specs/` is gitignored, so it is absent in a fresh clone | run both regeneration commands in order |
| Regenerated `api` skill shows unexpected churn | the upstream specs moved | inspect the spec diff first; the specs are the source of truth |

## Live documentation and machine-readable surfaces

- Documentation: https://developers.deepgram.com — append `.md` to any docs
  page URL to get clean Markdown.
- Agent index of all documentation: https://developers.deepgram.com/llms.txt
- API specifications: https://developers.deepgram.com/openapi.yaml and
  https://developers.deepgram.com/asyncapi.yaml, mirrored hourly at
  https://github.com/deepgram/deepgram-api-specs
- API status (machine-readable): https://status.deepgram.com/api/v2/status.json
