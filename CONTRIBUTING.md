# Contributing to Deepgram Skills

Skills in this repository are plain Markdown that AI coding tools load to build with Deepgram. A wrong sentence in a skill becomes wrong code in someone's project, so every change is held to the same standard as the documentation at [developers.deepgram.com](https://developers.deepgram.com): state what is true, name the exact parameter, and link the page that owns the full contract.

## Propose a skill

Open an issue at <https://github.com/deepgram/skills/issues> before writing a new skill. Say which developer task it serves, why none of the existing skills covers it, and which documentation pages it will lean on. A skill earns its place when an agent that has it produces a correct first request faster than an agent that only has the `api` skill.

Skills that belong here cover product contracts shared by every language: the API surface, the documentation map, starter apps, recipes, third-party integrations, and MCP setup. Language-specific usage belongs in the SDK repository's own `.agents/skills/` folder (`deepgram-{lang}-{product}`), so a skill about Python imports or Go channel handling goes to that SDK repository.

## Folder layout and frontmatter

Each skill is one folder under `skills/` holding a `SKILL.md`, plus an optional `references/` folder for material the agent loads on demand. The `api` skill shows both:

```text
skills/
  api/
    SKILL.md
    references/
      listen.md
      speak.md
      agent.md
  docs/
    SKILL.md
```

Start from [`template/SKILL.md`](./template/SKILL.md). The frontmatter takes two required fields:

```markdown
---
name: my-skill
description: >
  What the skill does and the words a task uses when it applies. Front-load the
  trigger phrases; hosts shorten descriptions and match on them.
---
```

- `name` is lowercase with hyphens and matches the folder name, so `skills/api/SKILL.md` declares `name: api`.
- `description` decides when an agent picks the skill. Put the trigger words in the first sentence.
- `metadata.internal: true` hides a skill from `npx skills add` unless the installer sets `INSTALL_INTERNAL_SKILLS=1`. The template carries this flag so it never installs.

After the frontmatter, the body is the instruction the agent follows. Keep it short enough to read in one pass, put the runnable request before the explanation, and end with a routing section that names the sibling skills for adjacent tasks.

## Generated versus hand-written

`skills/api/references/*.md` is generated from the public OpenAPI and AsyncAPI specs; edit the generator or the spec, never the output. Regenerate with [bun](https://bun.sh):

```sh
bun run scripts/fetch-specs.ts https://dpgr.am/openapi.yml https://dpgr.am/asyncapi.yml
bun install && bun run scripts/generate-skills.ts
```

`skills/api/SKILL.md` and every other `SKILL.md` are hand-written and edited directly.

## Test a skill locally

The `skills` CLI installs from a local path, so you can install your working copy into a scratch project before opening a pull request. From the repository root:

```sh
# List every installable skill in this checkout (hidden skills are skipped)
npx skills add ./ --list

# Install one skill into the current project for Codex and Claude Code
npx skills add ./ --skill my-skill -a codex -a claude-code -y

# Or point at the skill folder itself
npx skills add ./skills/my-skill -a codex -y
```

The install writes `.agents/skills/my-skill/` (Codex, Cursor, and other agents that read that path) and `.claude/skills/my-skill/` (Claude Code), plus a `skills-lock.json` at the project root. Open the agent in that project, ask it a task the description should trigger, and confirm it loads the skill and produces the request you expect. Remove the scratch install with `npx skills remove my-skill`.

The regeneration scripts are the only automated check in this repository. Run them, then confirm `git diff` shows only the change you intended.

## Review checklist

Every pull request is checked against these points:

- Every endpoint, parameter, default, model name, and message name matches the page it cites on developers.deepgram.com. Append `.md` to any docs URL to read the page as Markdown.
- Every URL in the change returns HTTP 200.
- Marketing adjectives are out: "best-in-class", "powerful", "seamless", "natural-sounding", and their relatives are replaced by the figure or the mechanism.
- "Flux" is never bare. Write "Flux STT" (`/v2/listen`, `flux-general-en`) or "Flux TTS" (`/v2/speak`, `flux-{voice}-{language}`); API identifiers stay literal.
- Capabilities are scoped. A feature that depends on a model, language, endpoint, or SDK says so where the claim is made.
- No em dashes or en dashes in new text.
- No process language. A skill states what is true and what to do; it does not say when a fact was checked, which source disagreed, or that a sample was not run. Verification notes go in the pull request description.
- Repositories the skill links to are public. A private repository returns 404 to every reader who is not a Deepgram member, and the command that points at it fails for them.
- New skills are added to `.claude-plugin/marketplace.json` under the `deepgram` plugin and to the skills table in `README.md`.

## Release cadence

Releases are cut on demand after merges that change what an installed skill tells an agent. There is no fixed schedule. A release is a `chore: bump version to X.Y.Z and update changelog` commit that:

1. Adds a `## [X.Y.Z] - YYYY-MM-DD` section to `CHANGELOG.md` in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) form.
2. Bumps `metadata.version` in `.claude-plugin/marketplace.json`.
3. Tags the commit `deepgram-skills-vX.Y.Z` and publishes a GitHub release from that tag.

Publishing the release triggers `.github/workflows/context7.yml`, which refreshes the Context7 index of this repository.

## Report a wrong skill

Open an issue at <https://github.com/deepgram/skills/issues> with the skill name, the sentence that is wrong, what the agent did because of it, and the documentation page that shows the correct behavior. If you can, include the request the agent sent and the response body Deepgram returned. Fixes to hand-written skills ship as a pull request against `main`; fixes to `skills/api/references/*.md` need a spec change in [deepgram/deepgram-api-specs](https://github.com/deepgram/deepgram-api-specs) followed by regeneration here.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `docs(api): ...`, `fix(starters): ...`, `feat(recipes): ...`.
