# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-05-01

### Added

- Marketplace: 6 SDK plugins — `deepgram-js-sdk`, `deepgram-python-sdk`, `deepgram-java-sdk`, `deepgram-go-sdk`, `deepgram-rust-sdk`, `deepgram-dotnet-sdk` — installable via `/plugin install <name>@deepgram-agent-skills`. Each aggregates the 7 language-idiomatic skills from its SDK repo's `.agents/skills/` directory via cross-repo `source` entries.
- Marketplace: `examples` and `recipes` skills now exposed in the `deepgram` plugin (`/deepgram:examples`, `/deepgram:recipes`).

### Changed

- README and `skills/api/SKILL.md`: tightened `deepgram-{lang}-{product}` namespace references and `--skill` install examples following the SDK skill rename.

[1.4.0]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.3.1...deepgram-skills-v1.4.0

## [1.2.4] - 2026-04-02

### Fixed

- API skill: restored empty byte payload gotcha — sending a zero-length binary frame to `/v1/listen` is treated as a close, not ignored

[1.2.4]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.2.3...deepgram-skills-v1.2.4

## [1.2.3] - 2026-04-02

### Fixed

- API skill: removed `{"type":"Ready"}` gotcha — this message does not exist in the API
- API skill: removed empty byte payload gotcha — not verifiable in spec or docs
- API skill: corrected KeepAlive binary consequence — causes transcription delays (pipeline choke), not a silent no-op

[1.2.3]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.2.2...deepgram-skills-v1.2.3

## [1.2.2] - 2026-04-02

### Added

- API skill: architecture diagram showing `api.deepgram.com` vs `agent.deepgram.com` split and how the Voice Agent pipeline orchestrates STT + LLM + TTS
- API skill: decision tree for choosing the right API (REST vs WebSocket, STT vs TTS vs Voice Agent vs Read)
- API skill: 13 common mistakes grouped by API surface, sourced from docs tips-and-tricks pages
- API skill: Flux `Configure` message for mid-session EOT threshold and keyterm updates (live on API, not yet in public spec)

### Fixed

- API skill: clarified query params rule — Voice Agent has no URL params (all config via `Settings` message); Flux supports `Configure` for mid-session updates

[1.2.2]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.2.1...deepgram-skills-v1.2.2

## [1.2.1] - 2026-04-02

### Added

- `npx skills add deepgram/skills` install path for any AI coding tool (Claude Code, Cursor, Windsurf, Copilot, Gemini CLI, and 30+ others via [vercel-labs/skills](https://github.com/vercel-labs/skills))

### Fixed

- README: corrected stale `skills/mcp` references to `skills/setup-mcp`

[1.2.1]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.2.0...deepgram-skills-v1.2.1

## [1.2.0] - 2026-03-25

### Changed

- Renamed `mcp` skill to `setup-mcp` for clarity (`/deepgram:setup-mcp`)
- MCP skill now silently checks for `deepctl` before setup — no install nagging
- Added troubleshooting section that suggests checking `deepctl` version only when things go wrong

## [1.1.0] - 2026-03-20

### Changed

- **Breaking:** Consolidated three separate plugins (`deepgram-api`, `deepgram-docs`, `deepgram-starters`) into a single `deepgram` plugin with sub-command skills
- Renamed skill directories: `deepgram-api` -> `api`, `deepgram-docs` -> `docs`, `deepgram-starters` -> `starters`
- Moved MCP server details from docs skill into dedicated mcp skill
- Updated `generate-skills.ts` to reference new `skills/api/references` path

### Added

- New `/deepgram:mcp` skill for automated Deepgram MCP server installation (detects Claude Code, Cursor, Windsurf)

### Fixed

- Skills no longer register 3x across plugin namespaces (was 9 entries, now 4)

### Migration

Users upgrading from v0.0.1 need to update their `enabledPlugins` in `~/.claude/settings.json`:

```diff
- "deepgram-api@deepgram-agent-skills": true,
- "deepgram-docs@deepgram-agent-skills": true,
- "deepgram-starters@deepgram-agent-skills": true
+ "deepgram@deepgram-agent-skills": true
```

Or reinstall via `/plugin install deepgram@deepgram-agent-skills`.

## [0.0.1] - 2026-03-10

### Added

- Initial release with three skills: `deepgram-api`, `deepgram-docs`, `deepgram-starters`
- API reference generated from OpenAPI and AsyncAPI specs
- Documentation navigator with MCP server setup
- Starter app catalog covering 13 frameworks and 7 features

[1.2.0]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.1.0...deepgram-skills-v1.2.0
[1.1.0]: https://github.com/deepgram/skills/compare/deepgram-skills-v0.0.1...deepgram-skills-v1.1.0
[0.0.1]: https://github.com/deepgram/skills/releases/tag/deepgram-skills-v0.0.1
