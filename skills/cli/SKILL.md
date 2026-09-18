---
name: cli
description: >
  Drive Deepgram from the terminal with the official CLI. Use when a task says "deepgram cli",
  "dg command", "deepctl", "dg listen", "dg speak", "transcribe from terminal", "transcribe a
  file from the command line", "caption a file with the CLI", "dg init", "scaffold a starter",
  "dg mcp", "dg skills", "dg login", "dg keys", "dg usage", or asks to script Deepgram in CI or
  a shell pipeline. Covers install, authentication, the real command surface, and the gaps where
  you should reach for the API or an SDK instead.
---

# Deepgram CLI (`deepctl`)

One PyPI package, `deepctl`, installs three interchangeable binaries: `dg`, `deepctl`, and `deepgram`. All three report the same version and take the same arguments. This skill uses `dg`. The current release is 0.3.0, published 2026-08-19.

## Decision rule

Reach for the CLI when the work is a shell task: transcribe a file or URL, synthesize a WAV, list keys or usage, scaffold a starter, or wire a step into CI.

Reach for curl or the `api` skill when you need a parameter the CLI does not expose. The docs state the rule plainly: `dg listen` "does not forward arbitrary API parameters." There is no `--keyterm`, no `--channels` for multichannel splitting, and no `--callback` or async callback mode. `dg api` is the escape hatch, since it passes any endpoint and query string through with auth attached, so `dg api '/v1/listen?model=nova-3&keyterm=spacewalk' -X POST --input body.json` reaches a parameter the flags omit. It takes JSON bodies only: `--input audio.wav` fails with `'utf-8' codec can't decode byte …`, so a local-file request that needs an unsupported parameter still belongs in curl.

Reach for an SDK when Deepgram is part of an application rather than a shell step, meaning anything with a WebSocket lifecycle, retries, or a UI. The CLI streams, but it owns the connection.

## Install

```bash
brew tap deepgram/tap && brew install deepgram   # also installs ffmpeg + portaudio
curl -fsSL https://deepgram.com/install.sh | sh  # macOS / Linux
pip install deepctl                              # or: uv tool install deepctl / pipx install deepctl
uvx deepctl --help                               # run without installing (also: pipx run deepctl)
```

On Windows: `iwr https://deepgram.com/install.ps1 -useb | iex`.

Upgrade the way you installed: `brew upgrade deepgram`, re-run `install.sh`, or `pip install --upgrade deepctl`. `dg update --check-only` is the version check, printing `current_version`, `latest_version`, and `update_available`. Bare `dg update` reports `"installation_method": null` on a pip install, so treat it as a reporter and upgrade through your installer.

Homebrew lags PyPI. pip, uv, and pipx install 0.3.0, but `Formula/deepgram.rb` in the tap pins `deepctl-0.2.26`, a release before the 0.3.0 one that added Flux TTS and Flux STT support and enforced exit codes. Install from PyPI if you need Flux STT or Flux TTS from the CLI.

`dg listen --mic` needs an extra on the PyPI installs: `pip install 'deepctl-cmd-listen[mic]'`. The Homebrew install brings the audio dependencies itself.

## Authentication

Three paths, in order of preference:

- `export DEEPGRAM_API_KEY=...`, plus `DEEPGRAM_PROJECT_ID=...` for the account commands. This is the CI path.
- `dg login` for the browser flow, or `dg login --api-key "$KEY" --project-id "$PROJECT" -f`. Credentials go to the OS keyring when one exists. When it does not, as in Linux containers and CI, `dg` prints `Warning: Could not store in keyring: No recommended backend was available` and the key lands in cleartext in the config file at mode 0644.
- The global `--api-key` flag overrides both. The CLI's own help calls it "intended for testing and CI"; it puts the key in shell history and in the process list, so prefer the env var.

The config file is `config.yaml` in the platform config directory: `~/Library/Application Support/deepctl/` on macOS and `~/.config/deepctl/` on Linux.

The env-var path is not guaranteed to stay off disk. Any command that persists configuration copies the key it read from the environment into that cleartext file. On 0.3.0 with the env var set and no config file, `dg whoami`, `dg listen`, `dg projects --list`, and `dg models` write nothing, but `dg update --check-only` creates it with `api_key:` in it, and `dg projects --set-default` does the same. Treat the file as a secret, and give CI an ephemeral `HOME`.

`dg whoami` shows status; add `-o json` for `authenticated`, `project_id`, and `base_url`. It labels the key source `config file` even when the key came from the environment and no config file exists, so do not read that field as a location.

With no key, every API-backed command prints this, with your own config path in the parentheses:

```
Error: DEEPGRAM_API_KEY is not set in the configuration file
(.../deepctl/config.yaml) or environment variable.
```

`dg keys`, `dg usage`, `dg billing`, `dg members`, and `dg requests` also need a project, or they fail with `ERROR: Project ID is required for this command. Set DEEPGRAM_PROJECT_ID or configure via profile.` Fix that with `dg projects --set-default <project_id>` or the env var.

## Command surface

23 top-level commands in 0.3.0. `dg transcribe` also survives as a hidden, deprecated alias of `dg listen`.

| Group | Commands |
|---|---|
| Media | `listen` (STT), `speak` (TTS), `read` (text intelligence) |
| Account | `login`, `logout`, `whoami`, `profiles`, `projects`, `keys`, `members`, `usage`, `billing`, `requests`, `models` |
| Raw API | `api` |
| Agent tooling | `mcp`, `skills`, `init` |
| Local | `debug` (`audio`, `browser`, `network`, `probe`, `toolkit`), `ffprobe`, `completion`, `plugin` (`install`, `list`, `remove`, `search`, `update`), `update` |

Account commands are flag-based, so the action is a flag rather than a subcommand: `dg projects --list`, not `dg projects list`.

Global flags go before the subcommand: `dg -o json listen file.wav`, never `dg listen -o json`. `-o` takes `json`, `yaml`, `table`, or `csv`. The CLI also detects agent environments, including Claude Code, Aider, and OpenAI Codex, and switches to JSON with plain-text status lines; force that with `CI=true` or `--non-interactive`. A piped stdout alone is not the trigger, so pass `-o json` rather than relying on redirection.

Separately, every command accepts `--agent-friendly`, which prints a machine-readable spec of that command, covering its description, examples, every parameter, `requires_auth`, and `requires_project`, then exits without calling the API.

## Command reference

```bash
# Transcribe a URL or a file. Nova, defaulting to nova-3 and en-US.
dg listen https://dpgr.am/spacewalk.wav
dg -o table listen call.wav --diarize --smart-format     # [Speaker 0] prefixes
dg -o json listen call.wav | jq -r '.results.channels[0].alternatives[0].transcript'

# Flux STT streams only, so feed it stdin or --mic
ffmpeg -i call.wav -f s16le -ar 16000 -ac 1 - \
  | dg listen -m flux-general-en --encoding linear16 --sample-rate 16000

# Text-to-speech. The default model is flux-alexis-en: Flux TTS over WebSocket, WAV out.
dg speak "Deploy finished." -o notice.wav
dg speak "Deploy finished." -m aura-2-asteria-en -o notice.mp3   # Aura on Speak v1 REST, for MP3
dg speak --file script.txt --speed 0.9 -o slow.wav               # --speed and --expressivity are flux-* only

# Text intelligence
dg -o table read --sentiment --topics --summarize --file feedback.txt

# Account
dg projects --list
dg projects --set-default <project_id>
dg keys --list
dg keys --create --comment 'ci-pipeline' --scopes member --dry-run
dg usage --last-month
dg requests --status failed --endpoint listen --limit 20

# Anything the flags do not cover. JSON bodies only, never binary audio.
dg api '/v1/listen?model=nova-3&keyterm=spacewalk' -X POST -f url=https://dpgr.am/spacewalk.wav
dg api /v1/projects
```

`dg -o json listen` returns the Deepgram response verbatim, with the same `metadata` and `results.channels[].alternatives[]` shape as `POST /v1/listen`. Script against that, not against the pretty output.

## `dg skills`

`dg skills status` lists eight assistants it can detect: Claude Code, OpenAI Codex, Gemini CLI, Amazon Q Developer, Aider, OpenCode, Cursor, and Cline. `dg skills install --all` and `dg skills setup` write files for the detected ones; `dg skills list`, `update`, and `remove` manage them. State lives in `~/.deepctl/skills/skills.json`.

It is not a substitute for `npx skills add deepgram/skills`. On 0.3.0:

- It downloads four hardcoded skills from this repository, `api`, `docs`, `setup-mcp`, and `starters`, from `raw.githubusercontent.com/deepgram/skills/main`. Every other skill in the repository, including the capability on-ramps, is never fetched, and the list does not grow when the repository adds one.
- For Claude Code it writes them to `~/.claude/commands/deepgram/*.md`, the slash-command directory at user scope, not `~/.claude/skills/`, and keeps the `name:` and `description:` skill frontmatter, which is not the slash-command schema.
- For Codex, Gemini, and Cursor it concatenates the same four files into one blob at `~/.codex/instructions.md`, `~/.gemini/GEMINI.md`, or `~/.cursor/rules/deepctl.mdc`, wrapped in `<!-- BEGIN deepctl CLI Reference -->` markers. The blob holds no CLI command reference despite that marker.

Use `npx skills add deepgram/skills` to get the full, current skill set. Use `dg skills` to check what a machine already has, or to seed a tool this repository's installer does not support.

## `dg init`

`dg init` clones from the templates gallery at `https://templates.dx.deepgram.com/api/templates`, which holds 44 templates in six categories: `transcription` (10), `live-transcription` (8), `text-to-speech` (7), `live-text-to-speech` (7), `voice-agent` (7), and `text-intelligence` (5). The command is alpha.

```bash
dg init --list                       # renders a table and ignores -o json
dg init --list --search fastapi
dg init node-transcription --dir ./my-app --no-install --no-start
```

It does more than `git clone`: it leaves `.git` intact so you can add your own remote, and it writes your key into the clone's `.env` as `DEEPGRAM_API_KEY=`. That is a live secret on disk, so check `.gitignore` before committing. It also refuses to run until `git`, `node`, `npm`, `make`, and `curl` are all present, even with `--no-install`, failing with `Missing tools: git, node, npm, make, curl`.

Three gallery caveats: the gallery carries no `flux` or `flux-tts` templates, so `dg init --list --search flux` returns `No templates found`; the `nextjs-*` entries live under the `deepgram-devs` org while every other template is under `deepgram-starters`; and `sinatra-transcription` points at an archived repository. Use the `starters` skill for the full starter matrix and for anything on Flux STT or Flux TTS.

## `dg mcp`

`dg mcp` runs a stdio MCP proxy, with `--transport sse --port 8000` for SSE. On 0.3.0 it advertises server `deepgram-mcp` 0.1.10 and exposes exactly one tool, `search_deepgram_knowledge_sources`, a semantic search over Deepgram's documentation. It exposes no transcription, synthesis, or project tools, so call `dg` directly for those. Use the `setup-mcp` skill for editor wiring.

## Regional and custom hosts

The global `--base-url` flag and the `DEEPGRAM_BASE_URL` env var both retarget the host, and REST and WebSocket endpoints are derived from whichever you set. `dg whoami` echoes the value back. Use them for self-hosted and staging deployments.

The regional hosts do not work on 0.3.0. Every command first checks credentials against `{base_url}/v1/projects`, and the management API is not served regionally, so `dg --base-url https://api.eu.deepgram.com listen file.wav` fails with `Error: Unexpected error: HTTP 404` while the same transcription request succeeds with curl against `api.eu.deepgram.com/v1/listen`. Use curl or an SDK for `api.eu.deepgram.com`, `api.au.deepgram.com`, and `api.in.deepgram.com`.

## Common mistakes

1. Trusting the exit code. 0.3.0 enforces exit codes, where earlier versions always exited 0: now 0 is success, 1 is an error or bad usage, and 2 is an interrupt. The contract has holes. `dg listen --mic` and `dg mcp` swallow Ctrl-C and exit 0, and a missing API key prints `Error: DEEPGRAM_API_KEY is not set …` and still exits 0, on both `dg listen` and `dg projects`. API errors and missing files do exit 1. In CI, check `"status"` in `-o json` as well as `$?`.
2. Expecting caption files from `--srt` or `--webvtt`. The docs label them "SRT subtitles" and "WebVTT captions", but on 0.3.0 `dg listen file.wav --srt --save-to out.srt` writes the plain transcript with no cue numbers and no timestamps, for a local file or a URL, under `-o table` or `-o json`. Use `dg -o json listen` and build cues from the word timestamps, or call the API.
3. Running `dg config set …`. Every help screen ends with `Disable: dg config set telemetry.enabled false`, but there is no `config` command, and the attempt returns `Error: No such command 'config'`. Set `DEEPCTL_TELEMETRY_DISABLED=1` instead, after which the footer reads `Telemetry is off.`
4. Putting a global flag after the subcommand. `dg listen -v file.wav` returns `Error: No such option '-v'`. Write `dg -v listen file.wav`.
5. Treating `dg models` as the model catalog. It returns 549 rows, strips the family prefix so Aura voices appear as `asteria` rather than `aura-2-asteria-en`, includes deprecated versions, and lists no Flux STT or Flux TTS models at all. Take model names from the `speech-to-text` and `text-to-speech` skills.
6. Pointing Flux STT at a file. `dg listen file.wav -m flux-general-en` returns `Flux STT (flux-general-en) is streaming-only and cannot transcribe a file or URL.` Pipe stdin or use `--mic`, since Flux STT has no prerecorded mode.
7. Acting on `Warning: API key format doesn't match expected pattern`. A valid 40-character key triggers it and then verifies fine.
8. Expecting `dg login --profile <name>` to persist without a keyring. The profile then appears in neither `dg profiles --list` nor `config.yaml`, which still hold only `default`.

## Use a different skill when

- You want the MCP server wired into an editor: `setup-mcp` skill.
- You want a runnable starter app, the full starter matrix, or anything on Flux STT or Flux TTS: `starters` skill.
- You need a parameter, response schema, or WebSocket message the CLI does not expose: `api` skill.
- You are choosing a model or an endpoint: `speech-to-text`, `text-to-speech`, or `voice-agent` skill.
- You want application code rather than a shell command: the per-language SDK skills, installed with `npx skills add deepgram/deepgram-python-sdk` and its siblings.
- You want a one-feature snippet: `recipes` skill. For a platform integration: `examples` skill.

## Sources

- Getting started: https://developers.deepgram.com/developer-tools/cli/getting-started
- Installation: https://developers.deepgram.com/developer-tools/cli/installation
- Authentication: https://developers.deepgram.com/developer-tools/cli/authentication
- Speech-to-text: https://developers.deepgram.com/developer-tools/cli/speech-to-text
- Text-to-speech: https://developers.deepgram.com/developer-tools/cli/text-to-speech
- Text intelligence: https://developers.deepgram.com/developer-tools/cli/text-intelligence
- Account management: https://developers.deepgram.com/developer-tools/cli/account-management
- MCP server: https://developers.deepgram.com/developer-tools/cli/mcp-server
- Shell completion: https://developers.deepgram.com/developer-tools/cli/shell-completion
- Plugins: https://developers.deepgram.com/developer-tools/cli/plugins
- Agentic tools overview: https://developers.deepgram.com/agentic-tools
- Source and releases: https://github.com/deepgram/cli
- Package: https://pypi.org/project/deepctl/
- Homebrew tap: https://github.com/deepgram/homebrew-tap
