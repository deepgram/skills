# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

[Unreleased]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.7.0...HEAD

## [1.7.0] - 2026-10-01

Catch-up with the September API, spec, SDK, CLI, and documentation changes. The headline items are Flux TTS inline pause and pronunciation controls, the Flux STT `Warning` message and mid-stream `numerals`, the Voice Agent reusable-configuration and agent-variable REST surface, and `FunctionCallCancelled` with `defer_until_eot`. Per-SDK availability is corrected across the product skills: which SDKs ship a Flux TTS client, `ForceEndTurn`, mid-stream `numerals`, and the agent-configuration REST clients. The product skills gain the regional hosts `api.eu`, `api.au`, and `api.in.deepgram.com`, the CLI skill tracks `deepctl` 0.3.1 and the Homebrew 6 install form, and the self-hosted skill carries the FIPS constraints and the SageMaker AMI requirement. No skill is added or removed, so the `deepgram` plugin still lists 14 skills.

### Added

- API skill: the API Domains table now lists the whole Voice Agent REST surface, not just `GET agent.deepgram.com/v1/agent/settings/think/models`. Reusable agent configurations are `GET` and `POST /v1/projects/{project_id}/agents` plus `GET`, `PUT`, and `DELETE /v1/projects/{project_id}/agents/{agent_id}`; agent variables are `GET` and `POST /v1/projects/{project_id}/agent-variables` plus `GET`, `PATCH`, and `DELETE /v1/projects/{project_id}/agent-variables/{variable_id}`. All ten were already rendered in `references/agent.md`; the table is the router an agent reads first, and it had never pointed at them. The OpenAPI carries one `servers` block for the whole document, so these ten paths are listed without a host
- API skill: the Models row names the four model endpoints rather than one: `GET /v1/models`, `GET /v1/models/{model_id}`, `GET /v1/projects/{project_id}/models`, and `GET /v1/projects/{project_id}/models/{model_id}`, and records that `include_outdated=true` on either list call also returns non-latest model versions
- API skill, Flux TTS mistake 12: the inline-controls rule for `/v2/speak`. A pronunciation override `\{"word":"...","pronounce":"<IPA>"\}` is honored on both transports (Early Access) but only with `speed` 1.0, a pause marker `\{pause:500ms\}` is batch-only, and a pause marker on the socket, or a pronunciation control on a socket whose `speed` is not 1.0, fails the connection with `DATA-0002`. On batch the same violations are a 400 whose `err_code` is one of six: `CONTROL_COMBINATION_INVALID`, `PAUSE_SPEED_CAP_EXCEEDED`, `BREAK_OUT_OF_RANGE`, `BREAK_INCREMENT_INVALID`, `BREAKS_LIMIT_EXCEEDED`, and `BREAK_SYNTAX_INVALID`, each given with the rule it names; a `speed` of exactly `1.0` never counts as a speed control. Links the Speed, Pause, Pronunciation page
- Text-to-speech skill: Flux TTS inline controls, which the skill had not covered. Pronunciation control (Early Access) is an escaped JSON object in the text, `\{"word":"...","pronounce":"<IPA>"\}`, accepted on both `/v2/speak` transports, at most 500 per request with IPA of at most 128 characters, and only with `speed` `1.0`. Pause control `\{pause:500ms\}` is batch only, 500 to 3000 ms in 100 ms steps, at most 8 per request, with `speed` capped at `1.15` while a pause is present. A violation on the socket fails the connection with `DATA-0002`; on batch it is a 400 carrying one of the six batch 400 codes. Each transport reports what it applied: `SpeechMetadata.controls_applied` on the socket, `dg-pronunciations-applied` and `dg-breaks-applied` response headers on batch, with invalid IPA still applied best-effort and surfaced as a `PRONUNCIATION_WARNINGS` warning or the `dg-warnings` header
- Text-to-speech skill: the `Connected` message (`request_id`, `model_name`, `model_version`, `model_uuids`) and the `SessionMetadata` message (cumulative session totals, rebased by an `Interrupt` onto the audio the client actually played), neither of which the skill had named
- Text-to-speech skill: `Interrupt` offset semantics. `playback_offset.value` is cumulative milliseconds since the session started, not since the current turn; each `Interrupt` must exceed the previous offset or it is ignored with `INVALID_INTERRUPT_OFFSET`; `audio_played_ms` from `SpeechInterrupted` is the baseline for the next offset. The old text produced wrong offsets after the first turn
- Text-to-speech skill: the Flux TTS server message list in full, with `Error` (fatal, every `DOMAIN-NNNN` code is followed by a WebSocket close) distinguished from `Warning`, and `ConfigureSuccess`/`ConfigureFailure` named with their `field`/`value` shape. `ConfigureFailure` gains its fourth code, `CONTROL_COMBINATION_INVALID` (a queued turn still carries a pronunciation control; `Flush` that turn first), and its fifth, `INTERNAL_ERROR`, which the AsyncAPI reference lists for an acceptable configuration the server could not apply
- Text-to-speech skill: Aura `/v1/speak` WebSocket limits (2000 characters per request `BIG-0001`, 2400 characters per minute `DATA-0001`, 60 minutes per connection `NET-0003`), the same `NET-0003` closing a Flux TTS session at 1 hour beside the existing `NET-0004` idle close, and the regional hosts `api.eu`, `api.au`, and `api.in.deepgram.com` for `/v1/speak` and `/v2/speak`
- Text-to-speech skill: a pointer from the Voice Agent mistake to https://developers.deepgram.com/docs/voice-agent-tts-controls, where `speed` and `expressivity` are set on `agent.speak.provider`
- Speech-to-text skill: the Flux STT `Configure` message takes `numerals` alongside thresholds, keyterms, and `language_hints`. The skill's example message carries `"numerals":true`, states that the value starts from the `numerals` query parameter and applies only to transcripts Flux STT sends after it processes the update, and that it must be a JSON boolean: the string `"true"` fails schema validation, Flux STT answers with an `Error` of code `UNPARSABLE_CLIENT_MESSAGE`, and the connection closes. `ConfigureSuccess` echoes the full active configuration including `numerals`; `ConfigureFailure` carries `code` and `description` naming the rejected field and leaves the previous configuration in place
- Speech-to-text skill: the `numerals` language scope on Flux STT. `flux-general-en` formats every number; `flux-general-multi` formats English, Spanish, French, German, Russian, Portuguese, Italian, and Dutch, and leaves Hindi and Japanese numbers as spoken
- Speech-to-text skill: SDK routing for mid-stream `numerals`. The JavaScript SDK has it from 5.13.0 (`socket.sendConfigure({type:"Configure", numerals:true})`), the Python SDK from 7.11.0 (`connection.send_configure(ListenV2Configure(numerals=True))`), and the Java SDK from 0.10.2 (`sendConfigure(ListenV2Configure.builder().numerals(true).build())`); the Go 3.8.0, Rust 0.11.0, and .NET 7.1.1 Configure types carry no `numerals` field, so the raw JSON message or the `numerals` query parameter is the path on those SDKs. The `deepgram-{lang}-conversational-stt` SDK skills do not cover it, so the skill tells the reader to take the message shape from its own `Configure` bullet
- Speech-to-text skill: two Sources entries, https://developers.deepgram.com/docs/flux/configuration for the end-of-turn threshold table and https://developers.deepgram.com/docs/numerals for the Flux STT numerals language list and mid-stream toggling
- Voice-agent skill: a "Reusable agent configurations" section. `Settings.agent` is either the full `agent` object or a Reusable Agent Configuration UUID string, the same `agent: "YOUR_AGENT_ID"` form the browser-agent skill already shows. The section gives the REST surface on `https://api.deepgram.com/v1` (`POST/GET /projects/{project_id}/agents`, `GET/PUT/DELETE .../agents/{agent_id}`), that `config` is the JSON string of the `agent` block and is immutable once created (`PUT` changes `metadata` only), that deleting a configuration a running service references breaks that service, the `INVALID_AGENT_ID` and `AGENT_ID_NOT_SUPPORTED` error codes, and the template-variable endpoints (`/projects/{project_id}/agent-variables`) with the `DG_<NAME>` key form, unquoted substitution of any JSON value, `is_sensitive: false`, and the rule that configurations and variables are readable by every project member so hold no secrets
- Voice-agent skill: `FunctionCallCancelled` in the message lifecycle table (the user started speaking again; stop work on each `id` and send no `FunctionCallResponse`, a late one is dropped), and a speculative-dispatch paragraph in the function-calling section. Function calls go out before the turn is confirmed by default; `defer_until_eot: true` holds a call until the turn is confirmed and discards it if the turn resumes, for actions that cannot be undone, and an `endpoint` function that already ran is not rolled back
- Voice-agent skill: `agent.speak.provider.speed` (Flux TTS `0.5` to `1.5` in `0.05` steps, Aura `0.7` to `1.5`; an unaccepted value ends the session with `FAILED_TO_SPEAK`) and `expressivity` (whole numbers `-2` to `2`, Flux TTS `v2` only, fixed for the session, beta with `0` the only production-validated value) in the `speak` field notes
- Voice-agent skill: `Settings.flags.history` (default `true`) and the server `History` message in both its conversation-text and `function_calls` shapes, alongside the existing `agent.context.messages` input; a pointer bullet for `think.context_length`, `think.provider.reasoning_mode`, and the top-level `tags`, `experimental`, and `mip_opt_out`, with ranges in `references/agent.md`; a one-line note that Conversational Mode (`agent.think_conversational.provider`) is invite-only Early Access answered with `UNPARSABLE_CLIENT_MESSAGE` from unenrolled projects
- Voice-agent skill: the SDK routing bullets record that `FunctionCallCancelled` and `defer_until_eot` ship in JS 5.12.0, Python 7.10.0, and Java 0.10.1 while the SDK voice-agent skills do not describe them, so message shapes come from this skill; that Go 3.8.0 and .NET 7.1.1 have no typed `FunctionCallCancelled` or `defer_until_eot`, so the raw message is parsed and the field sent as plain JSON; and the reusable-configuration REST clients (JS `client.voiceAgent`, Python `client.voice_agent`, Java `client.voiceAgent()`, .NET `AgentManage`; Go on `main` after 3.8.0 only; Rust none)
- Voice-agent skill: six new sources (reusable agent configurations, speculative replies, function call cancelled, TTS controls, history, conversational mode) and two new description triggers, "reusable agent configuration" and "defer_until_eot"
- Self-hosted skill: the SageMaker reference now carries the ordered instance-pool recommendation above the instance table. A single instance type has no fallback, so when the Availability Zone is short of that GPU the endpoint goes `Failed` (`Request to service failed` or `InsufficientInstanceCapacity`), which happens routinely for popular GPU types. The pool order is the listing's recommended type first, same-or-newer generations with similar per-instance capacity next (`g6`, `g6e`, `g7`), older generations last as insurance, never an unsupported type (`g4dn` for Flux STT, `g5` and `g4dn` for Flux TTS, single-GPU types for Aura-2), up to 5 types with three as the sweet spot. `VariantInstanceProvisionTimeoutInSeconds` is the per-type wait (`300` recommended, `60` to `3600` allowed), and quota does not fall back: every pooled type needs a regional quota of at least `1` or `CreateEndpoint` fails with `ResourceLimitExceeded`. Also one line that AWS field employees can reach Deepgram models through the AWS Marketplace Field Demonstration Program, for which Deepgram is an eligible provider
- Self-hosted skill: the Kubernetes reference states that the `API/Engine -> License Proxy -> Billing` chain for air-gapped HA needs a chart newer than `0.46.0`. On `0.46.0` and earlier, with `billing.enabled` and `licenseProxy.enabled` both `true`, the `billing` condition takes precedence, so API and Engine connect to Billing directly and the deployed License Proxy receives no traffic; the fix is the `Unreleased` entry in `charts/deepgram-self-hosted/CHANGELOG.md`
- Examples skill: the category map and description now cover the integrations the live `deepgram/examples` tree carries that the skill had omitted: Telnyx and Plivo (telephony), Webex, Jitsi, and Microsoft Teams (the "Recording platforms" row is now "Meeting platforms", split into recordings on Nova prerecorded and live meetings on Nova live, since the Jitsi bridge and the Teams bot stream), Haystack and Semantic Kernel (LLM frameworks), Gin (web frameworks), a **Broadcast** row for the OBS Studio native C captioning plugin, and an **Infrastructure** row for the Node and Python Deepgram API proxy servers, Silero VAD speech segmentation, and the multi-provider chat-completions proxy that serves as a Voice Agent `think.endpoint.url`. The two `530-*` directories are named in full because they share a number. The statement that no example covers Flux TTS stands: the Voice Agent proxy keeps TTS on `aura-2`
- `AGENTS.md`: the install section records that `npx skills add` clones with `git`, so an image without it (a bare `node:22-alpine`, for example) fails every target with `Failed to clone ...: Error: spawn git ENOENT` and exits 1 with nothing installed; install `git` first and check for the `SKILL.md` files after any headless install. The common-failure-modes table gains the matching row with `apk add git` as the fix
- API skill: the reference generator now emits JSON-Schema bounds, which it had been discarding for every parameter. `minimum` and `maximum` are the only bounds the specs carry (20 values in `openapi.yml`, 29 in `asyncapi.yml`); `minLength`, `maxLength`, `minItems`, `maxItems`, `exclusiveMinimum`, and `exclusiveMaximum` are handled so an upstream spec that starts using one needs no further change, and `multipleOf` is handled alongside them. `enum` is left as it was, because `formatType` already renders it as a literal union. A bound whose numbers the description states in prose is suppressed rather than repeated, so `limit`, which ends "Range [1,1000]", does not also render "range: `1` to `1000`". `ttl_seconds` on `POST /v1/auth/grant` gains `range: 1 to 3600`, the `/v1/speak` and Speak v1 WebSocket `speed` parameters gain `range: 0.7 to 1.5`, and `turn_index` on Flux STT `TurnInfo` gains `minimum: 0`
- API skill: an "Inline controls" row in the Aura vs Flux TTS table. Aura-2 pronunciation is GA for English and Spanish with a 2000-character input limit and no pause control; Flux TTS pronunciation is Early Access on both transports only with `speed` exactly `1.0` (`CONTROL_COMBINATION_INVALID` on batch, `DATA-0002` on the socket), and the `\{pause:500ms\}` marker is batch-only, 500 to 3000 ms in 100 ms steps, at most 8 per request
- API skill: the Documentation list links [API Rate Limits](https://developers.deepgram.com/reference/api-rate-limits), whose tables are per region and apply per project rather than per API key, and [Working with Concurrency Rate Limits](https://developers.deepgram.com/docs/working-with-concurrency-rate-limits); all-APIs mistake 2 points at the same page
- Speech-to-text skill: the Flux STT column of the model-family table now lists `mip_opt_out` and `tag`, which the `/v2/listen` reference accepts, and a new Flux STT bullet states that each redacted span becomes a single `*` rather than `[REDACTED]` or an entity tag, and that `profanity_filter`, accepted by the reference but marked unsupported on the comparison page, is not to be relied on until the two agree
- Speech-to-text skill: `CloseStream` on Flux STT does not finalize the active turn. It emits the remaining `Update` messages and closes without a WebSocket close status code, so no `EndOfTurn` arrives; the skill now says to send `ForceEndTurn` first for a final transcript, and that the reverse order leaves `ForceEndTurn` with no effect
- Speech-to-text skill: `Configure` limits and semantics. `keyterms` holds at most 100 plain terms, `language_hints: []` clears the hints while omitting the field or sending `null` keeps them, and every field in one message applies together or not at all
- Speech-to-text skill: `ForceEndTurn` SDK methods, JS 5.9.0 `sendForceEndTurn`, Python 7.8.0 `send_force_end_turn`, Java 0.9.0 `sendForceEndTurn`, Go 3.8.0 `ForceEndTurn()`, Rust 0.10.1 `force_end_turn()`, .NET 7.1.0 `SendForceEndTurn()` on the concrete `FluxWebSocketClient`, not the interface
- Speech-to-text skill: a common mistake for the `/v1/listen` `{"type":"Configure","features":{"numerals":true}}` form, which Flux STT rejects before closing the connection
- Speech-to-text skill: `EagerEndOfTurn` costs 50 to 70% more LLM calls for roughly 100 to 200 ms less end-to-end latency, and Flux STT has no `KeepAlive`: WebSocket pings replace it with a 60 second timeout
- Speech-to-text skill: regional hosts `wss://api.{eu,au,in}.deepgram.com` for `/v1/listen` and `/v2/listen`, and six Sources entries: feature overview, bring your own turn detection, Flux STT voice agent and eager end of turn, redaction, regional endpoints
- Text-to-speech skill: Aura-2 Spanish `speed` recommended range `0.9` to `1.5`; the five English-Spanish code-switching voices; the Twilio Flux TTS guide's `deepgram-sdk` 7.6.0 floor; Voice Agent notes that an inline pause marker on Flux TTS is silently unspoken and compressed output returns `INVALID_SETTINGS`
- Text-to-speech skill: the IPA length ratio (10x the source word, floor 15), both `BREAK_SYNTAX_INVALID` triggers, the four accepted pause forms, and the about 100 ms pause tolerance
- Text-to-speech skill: nine new sources (models-languages overview, regional endpoints, ws-close, troubleshooting, prompting, Flux TTS feature-overview, state, context, Twilio)
- Voice-agent skill: the `think` note gives the Google `think.provider.version` values (`ai-studio-v1beta`, its alias `v1beta`, and `gemini-enterprise-agent-v1`) with the default per endpoint (`gemini-enterprise-agent-v1` on `api.eu.deepgram.com`, `ai-studio-v1beta` elsewhere), the think and speak provider-array fallback chains (`THINK_REQUEST_FAILED` / `SPEAK_REQUEST_FAILED` per failed provider, `FAILED_TO_THINK` / `FAILED_TO_SPEAK` when all fail), and that a managed-LLM prompt over 25,000 characters is truncated with `PROMPT_TOO_LONG` rather than rejected
- Voice-agent skill: `agent.language` is deprecated in favor of `listen.provider.language` and `speak.provider.language`; a Deepgram speak provider given `language` is rejected with `UNPARSABLE_CLIENT_MESSAGE`; the `audio.output.encoding` enum (`mp3`, `opus`, `flac`, `aac` beside the raw encodings), `container` (`none`, `wav`, `ogg`), and `bitrate`, all Aura-only since Flux TTS answers them with `INVALID_SETTINGS`
- Voice-agent skill: `UpdateListen` clears `language_hints` when omitted; `ConversationText` carries `languages_hinted` and `languages` on `flux-general-multi`; the Error/Warning row names `MAXIMUM_SESSION_LENGTH_REACHED`, `MAXIMUM_SESSION_LENGTH_APPROACHING`, `FAILED_TO_THINK`, and `FAILED_TO_SPEAK`; an observability line (no logging API, persist every non-audio frame keyed to `request_id`)
- Voice-agent skill: six Sources (regional endpoints, media inputs and outputs, conversation context, observability, the Settings/inputs/outputs message indexes, the .NET SDK repository); Source 36 notes the conversational-mode page is absent from llms.txt
- Browser-agent skill: `AgentSession` options `keepAliveInterval` (10,000 ms), `url`, and `reconnect.baseDelay` 500 ms / `maxDelay` 30,000 ms / `jitter` plus or minus 20%; `injectAgentMessage(message, behavior?)`; the `listen-updated`, `latency-report`, and `history` events; `AgentPlayer` decodes `linear16` only; the 4-minute token cache beside the docs' "5-minute keys" figure and the 30-second grant default; `useDeepgramAgent` does not support `useAgentClientTool`
- Browser-agent skill: the two `@deepgram/ui` release notes that matter when pinning. 0.1.5 compiles the standalone `styles.css` export so bundlers receive regular CSS instead of Tailwind source directives, and 0.1.6 preserves the bundled TypeScript declarations after a `vite-plugin-dts` upgrade, so pin 0.1.6 or newer; a Source for the `deepgram/ui` releases and README
- Audio-intelligence skill: the streaming entity finalization rule. The server holds a final `Results` message until the speaker moves on to non-entity speech, 3 seconds of silence pass, or a `Finalize` arrives; `no_delay=true` forces immediate finalization and the docs state it leaves entities missed or incomplete in many cases
- Audio-intelligence skill: `summarize` needs more than 50 words of speech; a shorter input is returned as-is in `summary.short` with no tokens billed as summarization usage
- Audio-intelligence skill: `raw_value` on every entity when a formatting feature is on, per-word `sentiment` and `sentiment_score` on `words[]`, the `sentiment_score` range and 0.333 break point, the `confidence_score` range, and the 100-item cap on `custom_topic` and `custom_intent`
- Text-intelligence skill: a "Hosts and concurrency" section: `/v1/read` on `api.eu.deepgram.com`, `api.au.deepgram.com`, and `api.in.deepgram.com` with no cross-region fallback, and per-project concurrency of 10 per feature in North America, 5 for `sentiment` and `intents` on the regional hosts, Enterprise starting at 10 (20 for `summarize`)
- Text-intelligence skill: the 50-word summarization minimum and zero-token billing for shorter input, the 415 `UNSUPPORTED_MEDIA_TYPE` body, `url` sources serving `text/plain` or `application/json` with a `text` field, callback ports, `dg-token` and Basic Auth, the 10-retry 30-second schedule, tag limits (128 characters, 500 unique per day, immutable), score ranges, the 100-item `custom_topic`/`custom_intent` cap, and the `cli` skill (`dg read`) in the routing list
- CLI skill: the `dg api` output contract. stdout carries two JSON documents, the response body and then a result envelope (`status`, `message`, `method`, `url`, `status_code`, `response_body`, `elapsed_ms`); `-o json` changes nothing and `--raw` only compacts the body, so `json.load` fails with `Extra data` while `jq` filters both documents; `--jq` shells out to a local `jq` and prints a `jq Required` panel without one. Bodies are text only, never binary
- CLI skill: the four soft agent-detection signals (non-TTY stdin, non-TTY stdout, unset or `dumb` `TERM`, `NO_COLOR`), three of which switch output to JSON
- Setup-mcp skill: `/_mcp/server` answers `HEAD` with 404, a `GET` with the MCP `Accept` header with 405, and a bare `GET` with a JSON descriptor; only a `POST` `initialize` reaches the server, with a runnable curl
- Setup-mcp skill: a caveat that the agentic-tools page lists both kapa URLs with no authentication step although both answer an unauthenticated `initialize` with 401, and that its Docs MCP section does not mention `/_mcp/server`
- Self-hosted skill: the FIPS constraints from the FIPS-Compliant Deployment page, in `SKILL.md`, the Kubernetes reference, and the Docker/Podman reference. Flux STT is not supported on FIPS images and runs only on standard images; the FIPS Engine loads `.dgv2` models only, and `.dgv2` and `.dg` files are not interchangeable; the FIPS API image enforces TLS 1.3 exclusively, rejecting TLS 1.2 connections and non-FIPS cipher suites such as ChaCha20 regardless of the `[fips]` flag, with the customer supplying the full-chain PKI certificate for the API's HTTPS endpoint. The MP3 and FLAC known issue now says the request returns `HTTP 200` with an empty body, covers `/v1/speak` as well as batch `/v2/speak`, and names `linear16` and `opus` as unaffected
- Self-hosted skill: the SageMaker reference states that `InferenceAmiVersion=al2023-ami-sagemaker-inference-gpu-4-1` (NVIDIA driver 580, CUDA 13.0) is required on the production variant, because the model packages run a CUDA 13 runtime and without it SageMaker boots the instance family's default AMI and the container fails its CUDA preflight check; the SageMaker AI console cannot set the field, so the endpoint configuration is created with the AWS CLI, Boto3, or Terraform (`inference_ami_version`)
- Starters skill: a note that the `java-flux-tts` README clones with a plain `git clone` while its `.gitmodules` points both submodules at SSH URLs, so following its Maven steps leaves `frontend/` and `contracts/` empty

### Changed

- API skill: `references/listen.md` and `references/speak.md` regenerated from the public specs. `listen.md` gains the Flux STT `Warning` message (`ListenV2Warning`: `type`, `request_id`, `sequence_id`, `code`, `description`, all required), `code` and `description` on `ConfigureFailure`, and `numerals` echoed on `ConfigureSuccess`. `speak.md` replaces every "inline pause and pronunciation controls are not yet applied; they are stripped" sentence with the live rules: `\{pause:500ms\}` markers of 500 to 3000 ms in 100 ms steps, at most 8 per batch request, `speed` capped at `1.15` while a pause is present, pronunciation controls that cannot be combined with a pause or with a `speed` other than `1.0`, the six `400` `err_code` values on `POST /v2/speak` (`CONTROL_COMBINATION_INVALID`, `PAUSE_SPEED_CAP_EXCEEDED`, `BREAK_OUT_OF_RANGE`, `BREAK_INCREMENT_INVALID`, `BREAKS_LIMIT_EXCEEDED`, `BREAK_SYNTAX_INVALID`), the new `CONTROL_COMBINATION_INVALID` value on `SpeakV2ConfigureFailure.code`, the `DATA-0002` meaning on `SpeakV2Error`, and the pronunciation `Warning` codes (`PRONUNCIATION_WARNINGS`, `PRONUNCIATION_TOO_LONG`, `PRONUNCIATIONS_LIMIT_EXCEEDED`) now described as emitted rather than reserved. The other six reference files are unchanged
- API skill: the `/v2/listen` `Configure` scope reads "EOT thresholds, keyterms, language hints, and `numerals`" in all four places it is described (the Nova vs Flux STT comparison table, the "Pick Flux STT" list, all-APIs mistake 1, and Flux STT mistake 17). It had said "EOT thresholds and keyterms", which omitted the two fields `ListenV2Configure` also carries
- API skill, Flux STT mistake 17: `ConfigureSuccess` echoes the full active configuration, `numerals` included, not only the fields the client sent, and `ConfigureFailure` carries `code` and `description` identifying the rejected configuration
- API skill, Flux STT mistake 18: the `ForceEndTurn` warning note no longer says the `Warning` message is absent from the AsyncAPI and cannot appear in `references/listen.md`. The reference shows the `ListenV2Warning` shape; its `code` is a free string, so the note now says the individual codes such as `FORCE_END_TURN_NO_ACTIVE_TURN` come from the Force End Turn docs page, and links it
- API skill, mistake 20: the `summarize` sentence on `/v1/read` said the reference contradicted the `v2` value. `references/read.md` types the parameter `v2` | boolean, so the skill now says the type is right and only the description still reads boolean-only
- API skill: the host notes for Voice Agent REST are scoped to the one endpoint they describe. "Voice Agent's REST endpoints live on the `agent.` host", "The Agent REST endpoints move with it", and the mistake 15 heading now name `GET /v1/agent/settings/think/models`, so the ten `/v1/projects/{project_id}/agents` and `agent-variables` paths added to the domain table are not read as living on `agent.deepgram.com`
- API skill: the `speed` row of the Aura vs Flux TTS table carries the `1.15` cap while a pause marker is present (`PAUSE_SPEED_CAP_EXCEEDED`) and points at the Inline controls row for the pronunciation rule
- API skill: the "Pick Aura" list no longer lists one-shot synthesis or "compressed output from a stream" (both families stream raw audio and both serve `mp3`, `opus`, `flac`, and `aac` on batch REST); it names the one case that remains, compressed output inside a Voice Agent, where Flux TTS returns `INVALID_SETTINGS`. The list now agrees with the text-to-speech skill's Flux TTS first rule, and the Models row's empty host cell reads `none` in place of a dash
- Text-to-speech skill, mistake 6, and API skill, Flux TTS mistake 12: both now say SSML is not interpreted and that the only markup Flux TTS honors is its own escaped inline controls (pronunciation on both transports, pause on batch). Mistake 6 adds that the client-messages page describes known SSML, ElevenLabs, and Cartesia tags stripped with one `INPUT_MARKUP_STRIPPED` warning per `Speak`, which `/v2/speak` does not send for `<speak>` and `<break>` markup, so do not wait on it. The Aura REST section states that Aura-2 pronunciation control is GA on `/v1/speak` with the same syntax for English and Spanish voices, a 2000-character input limit, and no pause control, and that the same control is Early Access on Flux TTS `/v2/speak`
- Text-to-speech skill: the Flux TTS SDK bullet now states that every SDK ships a Flux TTS client, Go from v3.8.0 as `pkg/client/speak/v2`, where they had said every SDK except Go and told Go users to use the WebSocket directly. It also records that only the Rust SDK skill documents Flux TTS and that the JS, Python, Java, Go, and .NET `text-to-speech` SDK skills cover `/v1/speak` only, so `/v2/speak` message shapes come from this skill; the .NET SDK itself still ships `FluxSpeakRESTClient` and `FluxSpeakWebSocketClient`
- Text-to-speech skill: the batch bullet notes that batch is the only transport that honors inline pauses
- Speech-to-text skill: the model-family table names the two `redact` values Flux STT accepts, `numbers` and `aggressive_numbers`, where it had said only "number redaction", and the Flux STT section states that any other value fails the WebSocket handshake with 400
- Speech-to-text skill: the threshold-table introduction points at the `Configure` message as the mid-stream mechanism, and the `ForceEndTurn` bullet says "Flux STT" rather than bare "Flux"
- Voice-agent skill: `ForceEndTurn` spells out both failure modes. With a listen provider other than Flux STT (`v2`) the server sends a `FORCE_END_TURN_UNSUPPORTED` warning and the turn does not end; with no turn in progress the message is ignored silently. `UpdateListen` is described as changing `model` and `language` mid-session on any provider, with thresholds and language hints on Flux STT and keyterm updates on Flux STT models only
- Voice-agent skill: the `think` provider note labels `groq` and `aws_bedrock` as bring-your-own, gives `aws_bedrock` its `provider.credentials` block (`type` `iam`, or `sts` plus `session_token`, with `region`, `access_key_id`, `secret_access_key`) and the `https://bedrock-runtime.{region}.amazonaws.com/` endpoint, and tells the reader to confirm the `nvidia` model string against `GET /v1/agent/settings/think/models`
- Voice-agent skill: the third-party TTS note states that `endpoint` takes `url` and `headers`, that `wss` URLs are accepted for Eleven Labs only, and that `aws_polly` also requires `credentials`; the Deepgram-managed Cartesia exception (no `endpoint`) stays, as the TTS models page documents it
- CLI skill: tracks `deepctl` 0.3.1, published 2026-09-29. The version-scoped statements that still hold on 0.3.1 are relabelled from 0.3.0: the config-file write by `dg update --check-only`, the 23-command surface, the four hardcoded `dg skills` downloads, the single-tool `dg mcp` proxy, the HTTP 404 on regional hosts, and the plain-transcript output of `--srt` and `--webvtt`. pip, uv, and pipx install 0.3.1; the Homebrew tap still pins `deepctl-0.2.26`
- CLI skill: the global-flag rule is now exact. `-o`, `-q`, and `-v` are accepted after the subcommand on 0.3.1, so `dg listen file.wav -o json` and `dg -o json listen file.wav` are equivalent, except on `dg speak`, where `-o` after the subcommand is the output file. `--base-url`, `--api-key`, `-p`, `-c`, and `--timing` still fail with `No such option` after the subcommand, and the "global flag after the subcommand" mistake uses `--base-url` as its example because `dg listen -v file.wav` now succeeds
- CLI skill: `dg models` is described by its 0.3.1 output: 553 rows, 942 with `--include-outdated`, each row carrying both a bare `name` (`asteria`) and a `canonical_name` (`aura-2-asteria-en`) plus a `deprecated` flag. It still lists no Flux STT or Flux TTS models, so the advice to take model names from the `speech-to-text` and `text-to-speech` skills stands
- CLI skill: `dg whoami -o json` now has a `key_source` field that names where the key came from, for example `DEEPGRAM_API_KEY (env)`; the claim that it mislabelled an environment key as `config file` is gone
- CLI skill: `--agent-friendly` is accepted by every command except the `skills`, `debug`, and `plugin` groups, which reject it with `No such option`
- Setup-mcp skill: the upgrade advice for Path A no longer tells the user to run `dg update`, which the CLI skill documents as a reporter that prints `installation_method: null` on a pip install. Both skills now say to upgrade through the installer that put `deepctl` there (pip, `uv tool upgrade deepctl`, `pipx upgrade deepctl`, `brew upgrade deepgram`, or the install script) and to use `dg update --check-only` to see whether a newer release exists. The Path A troubleshooting fallback says the same
- Recipes skill: the Nova row lists all 26 `speech-to-text/v1` recipes rather than 16; `punctuate`, `multichannel`, `streaming-file`, `filler-words`, `replace`, `keyterm`, `profanity-filter`, `dictation`, `numerals`, and `measurements` were missing. The Flux STT row now describes the two recipes that exist under `speech-to-text/v2`: `streaming` (the `/v2/listen` WebSocket with `model=flux-general-en`, `encoding=linear16`, `sample_rate=16000`, printing `TurnInfo` events in place of v1 interim/final pairs) and `transcribe-url` (`model=flux-general-en` on the SDK's prerecorded call with `smart_format`), with the CLI carrying only `transcribe-url`. It no longer claims recipes for EOT, eager EOT, mid-session `Configure`, or keyterms, none of which exist
- Starters skill: `sinatra-transcription`, still listed in the `dg init` gallery, is described as archived and private, so the clone returns 404 for anyone outside Deepgram, rather than only archived
- `AGENTS.md`: the layout table describes all three workflows (`context7.yml`, `spec-drift.yml`, `validate-skills.yml`) where it had named `context7.yml` only, names `validate-skills.ts` beside the two regeneration scripts, lists it as a headless check, dates the conventions section 2026-10-01, and says a new skill also needs a row in the `README.md` skills table
- Speech-to-text skill: the Nova `KeepAlive` bullet names the `NET-0001` close after 10 seconds, per the keep-alive page, and notes the comparison page says 12 seconds
- Text-to-speech skill: the family table and rule of thumb follow the models overview page: Flux TTS for all new builds, Aura-2 when the language is not covered, Aura-1 first-generation English only
- Text-to-speech skill: expressivity errors are described as an HTTP 400 at connect time, before the upgrade, with no `Connected` message
- Voice-agent skill: the LiveKit sentence follows the current guide, which starts on LiveKit Inference (`deepgram/aura-2`, voice `thalia`), moves to the Deepgram plugin on `nova-3` and `aura-2-thalia-en`, and swaps to `STTv2 flux-general-en` and `TTSv2 flux-alexis-en`
- Voice-agent skill: the `think/models` curl marks the `Authorization` header optional, since the endpoint is public; the three `references/agent.md` mentions say it is the `api` skill's file; `reasoning_mode` cites the AsyncAPI reference for its five values and notes the configure page lists `low`, `medium`, and `high`
- Voice-agent skill: the `nvidia` note states the two names side by side, `nemotron-3-nano-30B-A3B` on the LLM models page and `nvidia/nemotron-3.5-lightning-30b-a3b` from `GET /v1/agent/settings/think/models`, and that the endpoint's string is what the API accepts
- Voice-agent skill: `UpdatePrompt` keeps "adds to" and notes the conversation-context page says it replaces the system prompt, so confirm on a test session
- Browser-agent skill: mistake 8 says turn detection and barge-in are server-side for any listen model (the default is a `v1` Nova model) and Flux STT `v2` adds model-integrated end-of-turn detection; mistake 6 names the SDK key `audio.output.sampleRate` with the wire field as an aside
- Audio-intelligence skill: "over 50" entity types is now 59 detected and 56 redactable; `cardinal`, `ordinal`, and `percent` are detected but return a 400 when passed to `redact`
- Audio-intelligence skill: the `summarize` non-English mistake distinguishes an explicit `language` (hard 400) from `detect_language=true` (HTTP 200, `metadata.warnings`, and `summary.result: "failure"`)
- Text-intelligence skill: the sample request's text runs to 90 words so `results.summary.text` is a summary rather than the echoed input
- Text-intelligence skill: the `references/read.md` caveat now also covers the `summarize` description reading boolean-only while the API accepts `v2`, and the reference page's double-nested example response
- CLI skill: Homebrew install is `brew install deepgram/tap/deepgram`; Homebrew 6 loads a third-party formula only after it is trusted, and the two-step `brew tap` form fails without `brew trust`. The tap still pins `deepctl-0.2.26`
- CLI skill: 0.2.26 already routes `flux-*` models to `/v2/listen` and `/v2/speak`; what 0.3.0 changed is the `dg speak` default (`flux-alexis-en`), `--speed`, `--expressivity`, `--redact`, `--numerals`, and the exit-code contract
- CLI skill: the `dg skills` markers are `<!-- BEGIN deepctl CLI Reference (auto-generated by deepctl) -->` and `<!-- END deepctl CLI Reference -->`, used for Codex, Gemini CLI, and OpenCode (`~/.opencode/agents.md`); Cursor's `deepctl.mdc` is overwritten whole with no markers
- CLI skill: `dg mcp` advertises `deepgram-mcp` 0.1.10 while PyPI `deepgram-mcp` is 0.1.1, so the number is not an upgrade signal
- Setup-mcp skill: Homebrew install line and trust note as in the CLI skill
- Self-hosted skill: mistake 13 points at the `0.46.0` section of the Helm chart CHANGELOG for the `release-260915` notes (default tags moved to `release-260915`, `gpu-operator.driver.version` raised from `550.54.15` to `580.173.02`, `gpu-operator.driver.useOpenKernelModules` set to `true`), since the Deepgram changelog's newest self-hosted entry is the August 2026 release (`release-260826`) and carries none for `release-260915`
- Self-hosted skill: the `dg-sagemaker` script count reads 12 scripts plus a shared `_common.py` helper, with model-package ARN lookup and endpoint status added to the coverage list, and `python-tts/` joins the client directories listed under Validating an endpoint
- Starters skill: the submodule section no longer says both `.gitmodules` URLs are SSH in every starter. 80 of the 96 starters use SSH URLs; 16 use HTTPS (12 of the 13 `{framework}-live-transcription` starters, every one except `rust-live-transcription`, plus `csharp-voice-agent`, `django-voice-agent`, `flask-voice-agent`, and `node-voice-agent`). The `insteadOf` rewrite is kept and described as a no-op on the HTTPS starters, and the `make init` and `dg init --install` failure modes are scoped to the 80 SSH starters

### Fixed

- API skill, Flux STT mistake 17: the `Configure` example sent `"eot_threshold": "0.8"` and `"eot_timeout_ms": "3000"` as JSON strings. `eot_threshold` is a number and `eot_timeout_ms` an integer, and the Flux STT Configure docs send them unquoted, so the example now reads `0.8` and `3000`
- API skill: removed `GET /v1/auth/token` from the regional-endpoints table. No such path exists; the only auth path is `POST /v1/auth/grant`
- Voice-agent skill: three bare "Flux" mentions (the LiveKit swap sentence, the `listen` field note, and the `UpdateListen`/`ForceEndTurn` bullet) now read "Flux STT" or "Flux TTS"
- CLI skill: the exit-code mistake no longer says a missing API key exits 0. On 0.3.1 both `dg listen` and `dg projects` print `Error: DEEPGRAM_API_KEY is not set …` and exit 1; the Ctrl-C hole on `dg listen --mic` and `dg mcp` is still documented
- CLI skill: the `dg init` gallery caveat says `sinatra-transcription` points at an archived, private repository whose URL returns 404, not merely an archived one
- CLI skill: the agentic-tools source link moved from `/agentic-tools` to `/developer-tools/agentic-tools`
- Setup-mcp skill: Path B now says `deepgram-mcp` is a PyPI package and that the npm package of the same name is unrelated third-party code that also asks for `DEEPGRAM_API_KEY`, so `npx deepgram-mcp` must not be used
- Self-hosted skill: the SageMaker reference's Java section said Maven Central's latest Java SDK was `0.10.0`; it is `0.10.2`, which still satisfies the `0.4.0` floor the transport needs
- Self-hosted skill: the Docker/Podman reference dropped its link to `/docs/deploy-deepgram-services`, which redirects to `/docs/deploy-stt-services`, a page the same list already cites
- Browser-agent skill: the `ttl` versus `ttl_seconds` mistake no longer claims that browser-agent documentation snippets still show `ttl`. Those snippets were corrected upstream. The mistake itself, the `expires_in` values it quotes, and the advice to read `expires_in` rather than trust the field name all stand; the reason given for that advice is now the behavior that causes it, which is that `/v1/auth/grant` ignores any field it does not recognize and still answers HTTP 200
- CI: the `spec-drift.yml` header comment said the generator does not prune reference files it no longer emits. It has pruned them since 1.6.0, so a removed endpoint group reports as a deletion; the comment now says so
- Speech-to-text skill: the `keyterm` bullet no longer claims other models return 400 and point at `keywords`, which no page documents; it now says `keyterm` is Nova-3 and Flux STT only and other models such as Nova-2 use `keywords`
- Text-to-speech skill: mistake 2 distinguishes a 400 `No such model/language/tier combination found` (unknown name) from a 403 `INSUFFICIENT_PERMISSIONS` (no access), and no longer claims `GET /v1/models` is scoped to the key; its `tts` list is the public Aura catalog with no `flux-*` entries
- Browser-agent skill: mistake 3 quotes the real error, `useAgentContext must be used inside <AgentProvider>`, and records that the `deepgram/ui` repository README's install line `npm install @deepgram/ui @deepgram/react @deepgram/agents` produces that tree
- Audio-intelligence skill: streaming `entities` are read only from `is_final: true` messages. The docs say interim results carry no `entities` key; the skill states that `nova-3` sends the key on interim results as well, usually `[]` and sometimes populated, and that those values are not final, so the sentence that said interims never carry the key is gone
- Audio-intelligence skill: three bare "Flux" mentions now read "Flux STT"
- Text-intelligence skill: the claim that a 1 MB / 210,000-token body means there is no size ceiling is replaced by the documented 150K token cap per request, the 400 `TOKEN_LIMIT_EXCEEDED` body, and the advice to chunk a document that approaches 150K tokens rather than send it whole
- CLI skill: on 0.3.1 a URL source prints `Checking URL accessibility...` on stdout, so `dg -o json listen <url> | jq` fails on that line while a local file parses cleanly; download the file first or drop the line with `tail -n +2`. On `main` the line is written to stderr, so the release after 0.3.1 keeps stdout to the JSON body
- CLI skill: `dg -o json init --list` prints the Rich table, a `<n> template(s)` line, and the JSON array on one stdout; it does not ignore `-o json`
- CLI skill: `dg init` prerequisite failure is a `Missing required tools:` checklist; `Missing tools: git, node, npm, make, curl` is the JSON message
- CLI skill: `dg listen -` on Ctrl-C exits 134 with a buffered-stdin fatal error, alongside the exit-0 holes
- CLI skill: mistake 8 said `dg login --profile` does not persist without a keyring; it writes the profile and the key to `config.yaml` in cleartext and copies the key into `default`
- Self-hosted skill: both `https://deepgram.com/contact-us/` links drop the trailing slash, which returned a 308
- Recipes and setup-mcp skills: table labels and Sources labels use a colon where they used an em dash

[1.7.0]: https://github.com/deepgram/skills/compare/deepgram-skills-v1.6.0...deepgram-skills-v1.7.0

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
