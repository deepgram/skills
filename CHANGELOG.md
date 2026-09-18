# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2026-09-18

### Added

Six new skills, and the wiring that makes them reachable. The `deepgram` plugin goes from 9 listed skills to 14.

- `speech-to-text`, `text-to-speech`, and `voice-agent` capability on-ramps, named for what a developer is building rather than for an endpoint. Each carries a first request, the Nova vs Flux STT or Aura vs Flux TTS decision, common mistakes with the exact error bodies, and a routing section (#9)
- `audio-intelligence` skill: the five parameters layered on `/v1/listen` (`summarize`, `sentiment`, `topics`, `intents`, `detect_entities`), a per-parameter matrix of prerecorded vs streaming support, the English-only limits and the 400 that enforces them, where each result lives in the response JSON, and `custom_topic` / `custom_intent` narrowing (#12)
- `text-intelligence` skill: `POST /v1/read` with `summarize`, `sentiment`, `topics`, and `intents`. Covers the two required query parameters (`language` plus at least one feature), the three accepted body shapes, the `text`-versus-`url` exactly-one rule, and why `detect_entities` is not on this endpoint (#12)
- `browser-agent` skill: the four Browser Agent SDK packages on npm (`@deepgram/agents`, `@deepgram/react`, `@deepgram/ui`, `@deepgram/agents-widget`), how to pick a layer, the `tokenFactory` and `Sec-WebSocket-Protocol` handshake that keeps a Deepgram API key out of client-side code, and the `^0.1.0` dependency ranges that break a `@deepgram/react@0.2.0` install (#14)
- `cli` skill: `deepctl` install paths and the three interchangeable binaries, the three authentication paths, the real command surface, `dg init`, `dg mcp`, and the parameters the flags do not expose (`dg api` is the escape hatch, and it takes JSON bodies only) (#16)
- `self-hosted` skill: a router plus four references (`hardware`, `docker-podman`, `kubernetes`, `sagemaker`) over a docs surface of more than 60 pages, replacing 80 lines that covered only distribution-credential CRUD. It decides whether self-hosting is the answer at all before it walks the licensing and container-credential bootstrap. Flux STT, Flux TTS, and Voice Agent all run self-hosted but are off by default, each needing a minimum image, a hand-requested model file, and a dedicated Engine; Flux STT allocates all available GPU memory at Engine startup, so a Nova-3 request against the same GPU returns CUDA OOM; Voice Agent self-hosted is Kubernetes only; Whisper is not a self-hosted product at all. SageMaker transport ships as three packages: PyPI `deepgram-sagemaker`, Maven `com.deepgram:deepgram-sagemaker`, and npm `@deepgram/sagemaker` (#15)
- `CONTRIBUTING.md`, plus OpenAI Codex and Cursor install and usage sections in `README.md` (#10)
- `AGENTS.md`, with the repository layout, headless install and regeneration commands, and the release process (#8)
- Marketplace: `audio-intelligence`, `text-intelligence`, `browser-agent`, `cli`, and `self-hosted` added to `plugins[0].skills`. That list is hardcoded, so until now those five had no `/deepgram:<name>` command and were invisible to the entire Claude Code plugin path, even though `npx skills add` found them by directory glob
- README: the same five skills added to all three per-skill lists, which have to stay in sync: the skills table, the `/deepgram:<name>` slash commands, and the Codex `$<name>` invocation list
- Recipes skill: the Text Analysis `v1` product row (`/v1/read`: `summarize`, `sentiment`, `topics`, `intents`, covered in all seven languages), which the live `deepgram/recipes` COVERAGE.md carries and this skill had omitted. The Audio Intelligence row is now labelled `/v1/listen` so the two are not read as one product
- Setup-mcp skill: a regional-endpoints section covering the split where the data plane serves EU, AU, and IN but the management API does not (#11)
- Starters skill: the 8 `{feature}-html` repositories documented as frontend submodules rather than runnable starters, including their inverted naming (`{feature}-html`, not `html-{feature}`) (#11)
- API skill: a prune pass for orphaned reference files and a content sanity check in `fetch-specs` (#17)

### Changed

- Browser work now routes to the `browser-agent` skill in `README.md`, `skills/api/SKILL.md`, `skills/docs/SKILL.md`, `skills/examples/SKILL.md`, and `skills/recipes/SKILL.md`. All five had said the browser SDK skills were "not yet public" and sent browser work to `@deepgram/sdk`'s browser bundle instead. The four Browser Agent SDK packages ship on npm, so that routing is gone; the Swift and Kotlin repositories are still private, so their `npx skills add` targets stay out
- Skills no longer record when a fact was checked, per the review checklist in `CONTRIBUTING.md`. Verification dates and "verified live" notes came out of `audio-intelligence`, `browser-agent`, `speech-to-text`, `text-intelligence`, `text-to-speech`, and `voice-agent`, with the facts and the exact error strings kept. Release and changelog dates (`deepctl` 0.3.0 published 2026-08-19, `@deepgram/react` 0.2.0 shipped 2026-09-10, `ForceEndTurn` added August 28, 2026) stay, because those are properties of the thing described
- Browser-agent skill: the pinned version table now follows registry-first guidance rather than leading with it. The packages are pre-1.0 and `@deepgram/ui`'s own README says interfaces may change between minor versions, so the skill puts the `npm view` commands ahead of the table and states that the registry wins
- Setup-mcp skill: rewritten around three verified paths (the CLI proxy `dg mcp`, the standalone `deepgram-mcp` package, and the hosted docs MCP server) (#11)
- README: the Codex docs MCP command gained authentication. `codex mcp add deepgram-docs --url https://api.dx.deepgram.com/kapa/mcp` returns 401 bare; the endpoint accepts a Deepgram API key as a bearer token, so the command now passes `--bearer-token-env-var DEEPGRAM_API_KEY`, and the credential-free `https://developers.deepgram.com/_mcp/server` is named as the alternative
- New routing bullets where a skill should have pointed at a sibling and did not: `voice-agent` to `browser-agent`, `speech-to-text` to `audio-intelligence`, `text-intelligence`, and `cli`, `recipes` to `cli` and to both intelligence skills, `starters` to `cli` for `dg init`
- `AGENTS.md`: the layout table said "the six shipped skills" and named the wrong six. It now names all 14, and records that `api` and `self-hosted` are the only two with a `references/` folder and that only `api`'s is generated
- Marketplace: the `deepgram` plugin description enumerated only the three original on-ramps
- API and docs skills: the "Related Deepgram skills" lists are the two routers an agent lands on, and both omitted `audio-intelligence`, `text-intelligence`, `browser-agent`, `cli`, and `self-hosted`. All five added to each
- Examples skill: the browser row read "via the Browser SDK", which now collides with the Browser Agent SDK packages. It names `@deepgram/sdk` in the browser, which is what that integration uses
- README, docs, and starters skills: the sibling-skill bullet lists this release extends no longer use em dashes, per the review checklist in `CONTRIBUTING.md`

### Fixed

- README and four skill files: removed the `npx skills add` targets for the Swift, Kotlin, and browser SDK repositories. Those repositories are private, so the command returns 404 for every reader outside Deepgram (#8)
- Removed the `deepgram-{lang}-maintaining-sdk` claim from `README.md` and `skills/api/SKILL.md`. No SDK repository ships a skill by that name; each ships 7 product skills (#8)
- Setup-mcp skill: the old hosted-MCP fallback pointed at an endpoint that returns 401 to an unauthenticated request, and claimed "full tool access". `dg mcp` exposes exactly one tool, `search_deepgram_knowledge_sources` (#11)
- API skill: corrected the self-hosted management path in the API Domains table. It read `/v1/projects/*/selfhosted/*`; the spec and the API serve `/v1/projects/*/self-hosted/*` (#11)
- API generator: a `/selfhosted` path test that never matched the hyphenated `/v1/projects/{project_id}/self-hosted/...` paths in the spec. It orphaned `references/self-hosted.md` while duplicating that file's endpoints into `projects.md` (#17)
- API generator: JSON Pointer resolution failed on unescaped slashes in AsyncAPI component keys, so no WebSocket message payload had ever rendered in any reference file (#17)
- API generator: a `messageName` fallback manufactured invalid `type` values, for example `AgentV1InjectUser` in place of `AgentV1InjectUserMessage` (#17)
- CLI skill: the list of this repository's skills that `dg skills` does not fetch named five and went stale the moment a sixth was added. It now says that everything outside the four hardcoded ones is never fetched, and that the list does not grow with the repository
- Starters skill: "See the `setup-mcp` skill to install the CLI" sent a CLI install to the MCP-wiring skill. It points at the `cli` skill
- Text-to-speech skill: dropped a note claiming the generated `speed` reference was stale and still listed seven values from `0.85` to `1.15`. The regenerated reference carries the same `0.5` to `1.5` range in `0.05` increments the skill documents

### Picked up in the spec regen

All references were regenerated after the generator fixes above, so the surface changes are listed separately (#17):

- `Any type` placeholders dropped from 23 to 7
- New messages and fields: `ListenV2ForceEndTurn`, `AgentV1ForceEndTurn`, `AgentV1FunctionCallCancelled`, `trigger` on `EndOfTurn`, `defer_until_eot`, `numerals`, `diarize_info`, and `expressivity` in `agent.md`
- `aura-2-perseo-it` removed from the voice catalog
- Flux TTS `speed` widened to `0.5` to `1.5`

[1.6.0]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.5.0...deepgram-skills-v1.6.0

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
