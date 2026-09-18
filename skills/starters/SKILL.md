---
name: starters
description: >
  Clone a ready-to-run Deepgram demo app and start building on top of it. Use whenever someone
  wants a quick working demo, needs to prototype with Deepgram, or is starting a new project
  that uses speech-to-text, text-to-speech, voice agents, audio intelligence, or live streaming.
  Match the user's language, framework, and desired Deepgram feature to the right starter.
---

# Deepgram Starter Apps

Clone a working demo and start building. Every starter is a minimal, runnable app you can extend.

## 1. Pick Your Feature

What do you want to build?

- **Transcribe a file** → `transcription` — send audio/video, get text back (REST, Nova)
- **Transcribe a live stream** → `live-transcription` — real-time speech-to-text (WebSocket, Nova)
- **Generate speech** → `text-to-speech` — send text, get audio back (REST, Aura)
- **Stream speech** → `live-text-to-speech` — real-time text-to-audio (WebSocket, Aura)
- **Analyze text** → `text-intelligence` — sentiment, topics, intents, summaries over text you
  already have (REST, `/v1/read`)
- **Build a voice agent** → `voice-agent` — conversational AI agent (WebSocket, agent.deepgram.com)
- **Conversational STT with turn detection** → `flux` — Deepgram Flux STT for voice agents and interactive assistants (WebSocket, `/v2/listen`)
- **Turn-based TTS for a voice agent** → `flux-tts` — Deepgram Flux TTS, streaming synthesis with barge-in (WebSocket, `/v2/speak`)

**There is no audio-intelligence starter.** `text-intelligence` is text-only — it posts text you
already have to `/v1/read`. No `{framework}-audio-intelligence` repository exists in
`deepgram-starters` for any framework, so don't construct those URLs. To run intelligence features
(summarization, sentiment, topics, intents) over *audio*, they are query parameters on
`/v1/listen`, not a separate starter: clone the `transcription` starter for your framework and add
the parameters to its existing request. See the `api` skill for which features `/v1/listen`
supports.

**Nova vs Flux STT for speech-to-text:** use `transcription` or `live-transcription` (Nova, `/v1/listen`) for general-purpose transcription, captions, and batch workloads. Use `flux` (Flux STT, `/v2/listen`) when you need built-in turn detection for conversational audio. See the `api` skill for a full comparison.

**Aura vs Flux TTS for text-to-speech:** use `text-to-speech` or `live-text-to-speech` (Aura, `/v1/speak`) for one-shot synthesis, non-English voices, and compressed audio. Use `flux-tts` (Flux TTS, `/v2/speak`) when you're streaming LLM output to a speaker and need a turn lifecycle and barge-in. See the `api` skill for a full comparison.

**Flux TTS starters exist for `node`, `flask`, `fastapi`, `django`, and `java` only** — these are the five apps Deepgram officially publishes at [Flux TTS template apps](https://developers.deepgram.com/docs/flux-tts/template-apps). There is no `flux-tts` starter for the other frameworks; don't construct those URLs. For an unsupported framework, start from the `api` skill's Flux TTS section and the SDK skills instead.

## 2. Pick Your Stack

| Language | Frameworks |
|----------|------------|
| JavaScript | `node` |
| TypeScript | `bun`, `deno` |
| Python | `fastapi`, `flask`, `django` |
| Go | `go` |
| Java | `java` |
| C# | `csharp` |
| Rust | `rust` |
| Ruby | `ruby` |
| PHP | `php` |
| C++ | `cpp` |

## 3. Clone and Run

Every starter lives at `https://github.com/deepgram-starters/{framework}-{feature}` — framework
first, feature second. Clone **with submodules**; each starter vendors two git submodules — its
browser frontend at `frontend/` and the shared starter contracts at `contracts/` — and a plain
`git clone` leaves both directories empty and the app unrunnable:

```sh
git clone --recurse-submodules https://github.com/deepgram-starters/{framework}-{feature}.git
cd {framework}-{feature}
```

Both submodule URLs in `.gitmodules` are SSH (`git@github.com:...`) even though both repositories
are public, so `--recurse-submodules` fails with `Host key verification failed` unless the user
has a GitHub SSH key. Without one, rewrite SSH to HTTPS for the clone:

```sh
git -c url."https://github.com/".insteadOf="git@github.com:" \
  clone --recurse-submodules https://github.com/deepgram-starters/{framework}-{feature}.git
```

The starter's own `make init` runs `git submodule update --init --recursive` and installs
dependencies, but it inherits the same SSH URLs — it fails identically without a key, so it is
the path for users who **have** SSH set up, not a workaround for users who don't.

Set your API key and follow the README:

```sh
export DEEPGRAM_API_KEY=your_key_here
```

Get an API key at <https://console.deepgram.com>.

### Or scaffold with the CLI

The [Deepgram CLI](https://github.com/deepgram/cli) has a scaffolder that finds and clones a
starter for you:

```sh
dg init --list                       # browse templates
dg init --list --search python       # filter
dg init node-transcription           # clone into ./node-transcription
dg init node-transcription --dir ./my-app
```

**`dg init` does not solve the submodule problem.** It runs a plain clone, so `frontend/` and
`contracts/` land empty, and it still prints `Done! … is ready` and `"status": "success"`. Adding
`--install` runs the starter's `make check-prereqs && make init`, which hits the same SSH URLs and
fails with `Host key verification failed` — and `dg init` reports success anyway. Without a GitHub
SSH key, finish the checkout by hand after `dg init`:

```sh
cd my-app
git -c url."https://github.com/".insteadOf="git@github.com:" \
  submodule update --init --recursive
```

`dg init` is also marked alpha, and its templates gallery is a separate list from the matrix
below rather than a subset of it. It carries 44 templates with no `flux` or `flux-tts` entries;
it still lists `sinatra-transcription`, whose repository is archived; and it lists `nextjs-*`
templates that now redirect out of `deepgram-starters` to `deepgram-devs`, which is why there is
no `nextjs` row below. Treat the matrix as authoritative and fall back to `git clone`. See the
`cli` skill for installing `deepctl` and for the rest of `dg init`.

## The `{feature}-html` repos are not starters

The `deepgram-starters` org also contains `transcription-html`, `live-transcription-html`,
`text-to-speech-html`, `live-text-to-speech-html`, `text-intelligence-html`, `voice-agent-html`,
`flux-html`, and `flux-tts-html`. **Do not clone these and do not offer them as starters.** Each
is the shared browser frontend that a backend starter pulls in as its `frontend/` submodule —
`node-transcription` vendors `transcription-html`, `flask-voice-agent` vendors `voice-agent-html`,
`node-flux-tts` and `java-flux-tts` both vendor `flux-tts-html`, and so on. Seven of the eight
say so in their own README ("This is a frontend submodule - do not use directly"); `flux-tts-html`
carries no such warning but is vendored the same way. None of them serve an API, so none of them
run standalone. Clone the backend starter instead and the right frontend arrives with it.

They also invert the naming rule. The starter pattern is `{framework}-{feature}`, but these are
`{feature}-html` — and the mirror-image names do **not** exist, so do not construct them:
`deepgram-starters/html-transcription` is a 404. There is no vanilla-HTML row in the matrix
because there is no standalone browser starter; for browser-only work, clone the `node` starter
for the feature you want and read its `frontend/` directory.

## Examples

**"I want to build a voice agent in Python"**
→ `git clone --recurse-submodules https://github.com/deepgram-starters/fastapi-voice-agent.git`

**"I need live transcription in my Node app"**
→ `git clone --recurse-submodules https://github.com/deepgram-starters/node-live-transcription.git`

**"I want to add text-to-speech to my Go service"**
→ `git clone --recurse-submodules https://github.com/deepgram-starters/go-text-to-speech.git`

**"I want to analyze audio for sentiment in C#"**
→ `git clone --recurse-submodules https://github.com/deepgram-starters/csharp-text-intelligence.git`

**"I want streaming TTS with barge-in for my Node voice agent"**
→ `git clone --recurse-submodules https://github.com/deepgram-starters/node-flux-tts.git`

**"I want a plain browser/HTML demo"**
→ There is no standalone HTML starter. Clone `node-{feature}` and work in its `frontend/`
directory — that is the same browser code the `{feature}-html` submodule holds.

## All Starters

Every URL below is a real, published, non-archived repository, and the table is the complete
set: 13 frameworks × 7 features, plus `flux-tts` for the five frameworks that have it. A cell
showing `—` means that starter does not exist; don't construct the URL.

| | transcription | live-transcription | text-to-speech | live-text-to-speech | text-intelligence | voice-agent | flux | flux-tts |
|---|---|---|---|---|---|---|---|---|
| **node** | [repo](https://github.com/deepgram-starters/node-transcription) | [repo](https://github.com/deepgram-starters/node-live-transcription) | [repo](https://github.com/deepgram-starters/node-text-to-speech) | [repo](https://github.com/deepgram-starters/node-live-text-to-speech) | [repo](https://github.com/deepgram-starters/node-text-intelligence) | [repo](https://github.com/deepgram-starters/node-voice-agent) | [repo](https://github.com/deepgram-starters/node-flux) | [repo](https://github.com/deepgram-starters/node-flux-tts) |
| **bun** | [repo](https://github.com/deepgram-starters/bun-transcription) | [repo](https://github.com/deepgram-starters/bun-live-transcription) | [repo](https://github.com/deepgram-starters/bun-text-to-speech) | [repo](https://github.com/deepgram-starters/bun-live-text-to-speech) | [repo](https://github.com/deepgram-starters/bun-text-intelligence) | [repo](https://github.com/deepgram-starters/bun-voice-agent) | [repo](https://github.com/deepgram-starters/bun-flux) | — |
| **deno** | [repo](https://github.com/deepgram-starters/deno-transcription) | [repo](https://github.com/deepgram-starters/deno-live-transcription) | [repo](https://github.com/deepgram-starters/deno-text-to-speech) | [repo](https://github.com/deepgram-starters/deno-live-text-to-speech) | [repo](https://github.com/deepgram-starters/deno-text-intelligence) | [repo](https://github.com/deepgram-starters/deno-voice-agent) | [repo](https://github.com/deepgram-starters/deno-flux) | — |
| **fastapi** | [repo](https://github.com/deepgram-starters/fastapi-transcription) | [repo](https://github.com/deepgram-starters/fastapi-live-transcription) | [repo](https://github.com/deepgram-starters/fastapi-text-to-speech) | [repo](https://github.com/deepgram-starters/fastapi-live-text-to-speech) | [repo](https://github.com/deepgram-starters/fastapi-text-intelligence) | [repo](https://github.com/deepgram-starters/fastapi-voice-agent) | [repo](https://github.com/deepgram-starters/fastapi-flux) | [repo](https://github.com/deepgram-starters/fastapi-flux-tts) |
| **flask** | [repo](https://github.com/deepgram-starters/flask-transcription) | [repo](https://github.com/deepgram-starters/flask-live-transcription) | [repo](https://github.com/deepgram-starters/flask-text-to-speech) | [repo](https://github.com/deepgram-starters/flask-live-text-to-speech) | [repo](https://github.com/deepgram-starters/flask-text-intelligence) | [repo](https://github.com/deepgram-starters/flask-voice-agent) | [repo](https://github.com/deepgram-starters/flask-flux) | [repo](https://github.com/deepgram-starters/flask-flux-tts) |
| **django** | [repo](https://github.com/deepgram-starters/django-transcription) | [repo](https://github.com/deepgram-starters/django-live-transcription) | [repo](https://github.com/deepgram-starters/django-text-to-speech) | [repo](https://github.com/deepgram-starters/django-live-text-to-speech) | [repo](https://github.com/deepgram-starters/django-text-intelligence) | [repo](https://github.com/deepgram-starters/django-voice-agent) | [repo](https://github.com/deepgram-starters/django-flux) | [repo](https://github.com/deepgram-starters/django-flux-tts) |
| **go** | [repo](https://github.com/deepgram-starters/go-transcription) | [repo](https://github.com/deepgram-starters/go-live-transcription) | [repo](https://github.com/deepgram-starters/go-text-to-speech) | [repo](https://github.com/deepgram-starters/go-live-text-to-speech) | [repo](https://github.com/deepgram-starters/go-text-intelligence) | [repo](https://github.com/deepgram-starters/go-voice-agent) | [repo](https://github.com/deepgram-starters/go-flux) | — |
| **java** | [repo](https://github.com/deepgram-starters/java-transcription) | [repo](https://github.com/deepgram-starters/java-live-transcription) | [repo](https://github.com/deepgram-starters/java-text-to-speech) | [repo](https://github.com/deepgram-starters/java-live-text-to-speech) | [repo](https://github.com/deepgram-starters/java-text-intelligence) | [repo](https://github.com/deepgram-starters/java-voice-agent) | [repo](https://github.com/deepgram-starters/java-flux) | [repo](https://github.com/deepgram-starters/java-flux-tts) |
| **csharp** | [repo](https://github.com/deepgram-starters/csharp-transcription) | [repo](https://github.com/deepgram-starters/csharp-live-transcription) | [repo](https://github.com/deepgram-starters/csharp-text-to-speech) | [repo](https://github.com/deepgram-starters/csharp-live-text-to-speech) | [repo](https://github.com/deepgram-starters/csharp-text-intelligence) | [repo](https://github.com/deepgram-starters/csharp-voice-agent) | [repo](https://github.com/deepgram-starters/csharp-flux) | — |
| **rust** | [repo](https://github.com/deepgram-starters/rust-transcription) | [repo](https://github.com/deepgram-starters/rust-live-transcription) | [repo](https://github.com/deepgram-starters/rust-text-to-speech) | [repo](https://github.com/deepgram-starters/rust-live-text-to-speech) | [repo](https://github.com/deepgram-starters/rust-text-intelligence) | [repo](https://github.com/deepgram-starters/rust-voice-agent) | [repo](https://github.com/deepgram-starters/rust-flux) | — |
| **ruby** | [repo](https://github.com/deepgram-starters/ruby-transcription) | [repo](https://github.com/deepgram-starters/ruby-live-transcription) | [repo](https://github.com/deepgram-starters/ruby-text-to-speech) | [repo](https://github.com/deepgram-starters/ruby-live-text-to-speech) | [repo](https://github.com/deepgram-starters/ruby-text-intelligence) | [repo](https://github.com/deepgram-starters/ruby-voice-agent) | [repo](https://github.com/deepgram-starters/ruby-flux) | — |
| **php** | [repo](https://github.com/deepgram-starters/php-transcription) | [repo](https://github.com/deepgram-starters/php-live-transcription) | [repo](https://github.com/deepgram-starters/php-text-to-speech) | [repo](https://github.com/deepgram-starters/php-live-text-to-speech) | [repo](https://github.com/deepgram-starters/php-text-intelligence) | [repo](https://github.com/deepgram-starters/php-voice-agent) | [repo](https://github.com/deepgram-starters/php-flux) | — |
| **cpp** | [repo](https://github.com/deepgram-starters/cpp-transcription) | [repo](https://github.com/deepgram-starters/cpp-live-transcription) | [repo](https://github.com/deepgram-starters/cpp-text-to-speech) | [repo](https://github.com/deepgram-starters/cpp-live-text-to-speech) | [repo](https://github.com/deepgram-starters/cpp-text-intelligence) | [repo](https://github.com/deepgram-starters/cpp-voice-agent) | [repo](https://github.com/deepgram-starters/cpp-flux) | — |

## Need something more specific?

- **Focused feature snippets** (one feature, one language, < 50 lines) → `recipes` skill → <https://github.com/deepgram/recipes>
- **Third-party integrations** (Twilio, LiveKit, LangChain, Vercel AI SDK, Discord, etc.) → `examples` skill → <https://github.com/deepgram/examples>
- **SDK-specific code skills** (idiomatic imports, async patterns, gotchas) → `npx skills add deepgram/deepgram-{lang}-sdk` — see the `api` skill for the 6 SDKs whose skills are publicly installable.

## Related Deepgram skills

- `api`: consolidated REST + WebSocket API reference
- `recipes`: minimal runnable feature snippets per language
- `examples`: full integration examples with third-party platforms
- `docs`: documentation finder
- `cli`: `deepctl`, including `dg init` for scaffolding a template from the terminal
- `setup-mcp`: Deepgram MCP server installation
