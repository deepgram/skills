# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-08-12

### Added

Flux TTS — Deepgram's streaming-first, voice-agent-first TTS family on the new `/v2/speak` endpoint. It ships alongside `/v1/speak`, which is unchanged; Aura voices are served only on v1 and Flux voices only on v2.

- API skill: `references/speak.md` now covers both `/v2/speak` transports — `POST /v2/speak` (batch REST) and `wss://api.deepgram.com/v2/speak` (streaming), with all 5 client and 11 server `SpeakV2*` messages
- API skill: "Aura (`/v1/speak`) vs Flux TTS (`/v2/speak`)" decision guide — feature matrix, pick-when bullets, and migration links, mirroring the existing Nova vs Flux section
- API skill: `/v2/speak` added to the architecture diagram, the "Which API should I use?" decision tree, and the API Domains table (which now splits Speak into v1 and v2 rows, following the Listen v1/v2 precedent)
- API skill: `### Flux TTS (/v2/speak)` gotchas — `model` is required and must be `flux-*`, `Flush` ends the turn (no `Finalize`; use `SpeechMetadata` as the end-of-turn signal), streaming is raw-audio-only and rejects batch-only or unknown params, and the server does not insert whitespace between `Speak` messages
- API skill: Voice Agent gotcha for `agent.speak.provider.version` — `v2` selects Flux TTS, `v1` selects Aura, and **omitting `agent.speak` entirely now defaults to Flux TTS `flux-kit-en`**
- Docs skill: TTS section rebuilt with Aura and Flux TTS model-family bullets plus the Flux TTS overview, streaming and batch quickstarts, batch-vs-streaming, voices, and migration links; Voice Agent section gains the TTS-models and Flux-TTS-voice-agent guides
- Starters skill: `flux-tts` feature bullet, an Aura vs Flux TTS pointer, and a `flux-tts` matrix column. Populated for `node`, `flask`, `fastapi`, `django`, and `java` only — the five apps Deepgram publishes; the other 8 frameworks are marked unavailable so agents don't fabricate repo URLs
- README: text-to-speech model families section, parallel to the existing speech-to-text one

### Changed

- Recipes skill: TTS row scoped to Aura (`/v1/speak`) and a note that Flux TTS has no recipes yet — there is no `text-to-speech/v2` directory in `deepgram/recipes`
- Examples skill: note that no integration example covers Flux TTS yet, with guidance to take transport/auth from the example and the Flux TTS contract from the `api` skill

### Fixed

- Examples skill: removed a duplicated, malformed `LLM frameworks` row from the category map
- Docs skill: MCP section referenced the removed `/deepgram:mcp` command; now points at the `setup-mcp` skill (renamed in 1.2.0)

### Picked up in the spec regen

Unrelated API surface changes that landed with the same `references/` regeneration, listed separately so the Flux TTS diff stays legible:

- API skill: Aura-2 voice catalog expanded with German, Dutch, French, Italian, and Japanese voices, and additional Spanish voices
- API skill: `/v1/listen` gains `diarize_model` (`latest` / `v1` / `v2`); `diarize` is now documented as deprecated in favour of it
- API skill: `/v2/listen` gains `language_hint` (for `flux-general-multi`), `profanity_filter`, `numerals`, and `redact`, plus expanded `keyterm` guidance on both listen endpoints
- API skill: Voice Agent gains `UpdateListen`, `UpdateThink`, `LatencyReport`, and `History` messages

[1.5.0]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.4.0...deepgram-skills-v1.5.0

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
