# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: https://github.com/deepgram/skills/compare/deepgram-skills-v0.0.1...deepgram-skills-v1.1.0
[0.0.1]: https://github.com/deepgram/skills/releases/tag/deepgram-skills-v0.0.1
