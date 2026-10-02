---
name: speech-to-text
description: >
  Start here for Deepgram speech-to-text. Use when a task says "speech to text", "STT",
  "transcribe", "transcription", "live transcription", "captions", "diarization", "nova-3",
  "Flux", "turn detection", or "end of turn". Picks the model family (Nova on /v1/listen for
  general transcription, Flux STT on /v2/listen for conversational audio with built-in turn
  detection), gets a first request working, and routes to the api, docs, recipes, starters,
  examples, and per-language SDK skills for everything else.
---

# Deepgram Speech-to-Text

Deepgram transcribes audio with two model families on two endpoints. Pick the family first; the endpoint, the parameters, and the message shapes all follow from that choice. This skill gets a first request working and names the skill to open next. It does not repeat the full parameter reference; that lives in the `api` skill.

## Pick the model family first

| | Nova | Flux STT |
|---|---|---|
| Model names | `nova-3` (alias of `nova-3-general`), `nova-3-medical`, `nova-3-pharma` | `flux-general-en` (English), `flux-general-multi` (10 languages) |
| Endpoint | `/v1/listen`, REST and WebSocket | `/v2/listen`, WebSocket only |
| Output | A transcript stream | `TurnInfo` events carrying turn state and a transcript per turn |
| Turn detection | None built in; you use endpointing and your own logic | Built in: `StartOfTurn`, `EagerEndOfTurn`, `TurnResumed`, `EndOfTurn` |
| Formatting and analysis | `smart_format`, `diarize_model`, `summarize`, `sentiment`, `topics`, `intents`, redaction | Word timestamps, `numerals`, `redact` (`numbers` or `aggressive_numbers`), `keyterm`, `profanity_filter`, `mip_opt_out`, `tag`; no smart formatting, no diarization |
| Language | `language=<code>`, or `language=multi` for code-switching | The model name selects the language; `language_hint` biases `flux-general-multi` |

Decision rule:

- Choose Nova when you transcribe recorded files, generate captions or subtitles, need speaker labels, need summaries or sentiment, or stream audio where your own code decides when a phrase ends.
- Choose Flux STT when a person is talking to software and the software must know when they stopped: voice agents, phone assistants, IVR, agent assist. Flux has no prerecorded mode.
- Choose neither when you want Deepgram to also run the language model and speak the reply. That is the Voice Agent API, served from a separate host, `agent.deepgram.com`. Open the `voice-agent` skill.

## First request: Nova on a prerecorded file

Create a key at https://console.deepgram.com and export it as `DEEPGRAM_API_KEY`. The key goes in the `Authorization` header with the `Token` scheme. Always pass `model`; without it the API falls back to `base`.

```bash
curl -s -X POST 'https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true' \
  -H "Authorization: Token $DEEPGRAM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://dpgr.am/spacewalk.wav"}'
```

The transcript is at `results.channels[0].alternatives[0].transcript`. To send a local file instead, set `Content-Type` to the audio type (for example `audio/wav`) and pass `--data-binary @file.wav` with no JSON body.

Nova options you will reach for, all query parameters on `/v1/listen`:

- `smart_format=true` adds punctuation, paragraphs, and number formatting. It turns on `punctuate`, so do not set both.
- `diarize_model=latest` labels speakers. It replaces the deprecated `diarize=true`; a request that sets both is rejected. Streaming accepts `latest` and `v1` only.
- `language=multi` transcribes code-switched speech across the ten Nova-3 multilingual languages. Any single language code works too; the default is `en`.
- `keyterm=<term>` boosts names, product terms, and jargon. It is accepted on Nova-3 and Flux STT only; other models, Nova-2 for example, use `keywords` instead. Repeat the parameter once per term. The limit is 500 tokens across all keyterms in a request, and exceeding it fails the request with `Keyterm limit exceeded`; Deepgram's guidance is to stay well under it with the 20 to 50 terms that matter. Commas, semicolons, and `term:weight` are not rejected; the API treats the whole value as one literal term, so nothing you intended gets boosted.
- `summarize=v2`, `sentiment=true`, `topics=true`, and `intents=true` add audio intelligence. They run on prerecorded English audio only.
- Live streaming uses `wss://api.deepgram.com/v1/listen?model=nova-3`, the same `Authorization` header, and binary audio frames. Send `{"type":"KeepAlive"}` as a text frame every 3 to 5 seconds during silence, as the keep-alive page says; after 10 seconds without audio or `KeepAlive` the connection closes with `NET-0001`. Finish with `{"type":"CloseStream"}`. Regional hosts take the same path and the same key: `wss://api.eu.deepgram.com/v1/listen`, `wss://api.au.deepgram.com/v1/listen`, `wss://api.in.deepgram.com/v1/listen`.

## Flux STT: conversational audio with turn detection

Connect over WebSocket. Flux has no REST path.

```
wss://api.deepgram.com/v2/listen?model=flux-general-en&encoding=linear16&sample_rate=16000
```

Send the same `Authorization: Token` header. Audio must be mono. For raw audio (`linear16`, `linear32`, `mulaw`, `alaw`, `opus`, `ogg-opus`) `encoding` and `sample_rate` are required; for WAV, Ogg, or WebM containers omit both. Send 80 ms chunks. Flux STT has no `KeepAlive` message: WebSocket pings replace it, with a 60-second timeout. For in-region processing use `wss://api.eu.deepgram.com/v2/listen`, `wss://api.au.deepgram.com/v2/listen`, or `wss://api.in.deepgram.com/v2/listen` with the same key.

Two query parameters on `/v2/listen` to note:

- `redact` takes `numbers` or `aggressive_numbers`; any other value fails the handshake with 400. Each redacted span becomes a single `*`, not `[REDACTED]` or an entity tag.
- `profanity_filter=true` works on `/v2/listen`, `language=multi` included.

The server sends `Connected`, then a stream of `TurnInfo` messages. Each carries `event`, `turn_index`, `transcript`, `words` with timestamps, and `end_of_turn_confidence`. The `event` values:

- `Update`: roughly every 0.25 s of audio while a turn is in progress.
- `StartOfTurn`: the speaker began. Use it to interrupt your agent (barge-in).
- `EndOfTurn`: the speaker finished. Send the transcript to your language model. It carries `trigger`: `model`, `manual`, or `timeout`.
- `EagerEndOfTurn` and `TurnResumed`: emitted only when you set `eager_eot_threshold`. Start drafting a reply on the first; cancel it on the second. The `EndOfTurn` transcript matches the `EagerEndOfTurn` transcript exactly. Expect 50 to 70% more LLM calls in exchange for roughly 100 to 200 ms less end-to-end latency; start with `EndOfTurn` only.

Three query parameters tune turn detection, and all three can change mid-stream through the `Configure` message below:

| Parameter | Range | Default | Effect |
|---|---|---|---|
| `eot_threshold` | 0.5 to 1.0 | 0.7 | Confidence needed for `EndOfTurn`. `1.0` suppresses model detection. |
| `eager_eot_threshold` | 0.3 to 0.9 | unset | Enables `EagerEndOfTurn`. Lower values fire earlier with more false starts. Must be less than or equal to `eot_threshold`. |
| `eot_timeout_ms` | 500 to 60000 | 5000 | Silence that forces `EndOfTurn` regardless of confidence. |

Client control messages, each a JSON text frame:

- `{"type":"Configure","thresholds":{"eot_threshold":0.8},"keyterms":["Deepgram"],"numerals":true}` changes thresholds, keyterms, `language_hints`, or `numerals` without reconnecting.
  - Shape and atomicity: the turn-detection thresholds go under `thresholds`, as in the example; omitted fields keep their values. All fields in one message apply together or not at all: if one fails validation, none take effect.
  - `keyterms`: the array replaces the whole list and holds at most 100 plain terms (no `term:weight` syntax).
  - `language_hints`: `[]` clears the hints and reverts to auto-detect, while omitting the field or sending `null` keeps them.
  - `numerals`: starts from the `numerals` query parameter and applies to transcripts Flux STT sends after it processes the update, never to transcripts already sent. It must be a JSON boolean: the string `"true"` fails schema validation, Flux STT returns an `Error` with code `UNPARSABLE_CLIENT_MESSAGE`, and the connection closes.
  - The reply is `ConfigureSuccess`, which echoes the full active configuration including `numerals`, or `ConfigureFailure`, which carries `code` and `description` naming the rejected field and leaves the previous configuration in place.
- `{"type":"ForceEndTurn"}` (added August 28, 2026) ends the current turn on your own signal: a push-to-talk release, a DTMF tone, a send button. Flux STT emits `EndOfTurn` with `"trigger":"manual"`. With no active turn the message is ignored and a `Warning` with code `FORCE_END_TURN_NO_ACTIVE_TURN` comes back. Set `eot_threshold=1.0` to drive every turn yourself, keeping `eot_timeout_ms` high as a backstop (`"trigger":"timeout"`).
  - SDK methods: JS 5.9.0 `sendForceEndTurn`, Python 7.8.0 `send_force_end_turn`, Java 0.9.0 `sendForceEndTurn`, Go 3.8.0 `ForceEndTurn()`, Rust 0.10.1 `force_end_turn()`, .NET 7.1.0 `SendForceEndTurn()` on the concrete `FluxWebSocketClient`, not the interface.
- `{"type":"CloseStream"}` finishes decoding the audio already received, emits the matching `Update` messages, and closes the connection without a WebSocket close status code. It does not finalize the active turn: no `EndOfTurn` is emitted, so the last message is an interim `Update`. To end on a final transcript send `ForceEndTurn` first, then `CloseStream`; messages are processed in order, so the turn ends and then the connection closes. Sent the other way round, the `ForceEndTurn` has no effect.

For non-English or mixed-language calls use `model=flux-general-multi`, optionally with repeated `language_hint=<code>` parameters (for example `language_hint=en&language_hint=es`). Without hints the model detects the language itself. `TurnInfo` then includes `languages` and `languages_hinted`. `numerals` formats every number on `flux-general-en`; on `flux-general-multi` it formats English, Spanish, French, German, Russian, Portuguese, Italian, and Dutch, and leaves Hindi and Japanese numbers as spoken.

## Common mistakes

1. `Authorization: Bearer <api key>` returns 401. API keys use `Authorization: Token <key>`. `Bearer` is only for the short-lived JWT that `POST /v1/auth/grant` issues.
2. A 403 with `{"err_code":"INSUFFICIENT_PERMISSIONS","err_msg":"Project does not have access to the requested model."}` comes back both for a misspelled model name and for a real model the project cannot use. The body carries a `request_id`. Check the spelling before asking for access. `GET https://api.deepgram.com/v1/models` lists the public catalog; `GET /v1/projects/{project_id}/models` lists your project's models. There is no model named `nova-3-conversational`; conversational audio is Flux, `flux-general-en`. The public catalog does not list the Flux model names, so the Flux docs are the source for those.
3. Flux on `/v1/listen` does not work, and `model=flux` is not a valid value. Use `/v2/listen` with `flux-general-en` or `flux-general-multi`.
4. `language=en` or `language=multi` on Flux is wrong. The model name selects the language. `language_hint` is accepted only by `flux-general-multi` and returns 400 on any other model.
5. Setting `encoding` or `sample_rate` for containerized audio (WAV, Ogg, WebM) causes errors or garbled output. Omit both and let the container declare the format.
6. `ForceEndTurn` on `/v1/listen` returns an error; it exists only on Flux.
7. `smart_format`, `diarize`, and the intelligence parameters are not available on `/v2/listen`. Speaker labels and summaries are a Nova job.
8. A `KeepAlive` sent as a binary frame is mishandled. Send control messages as text frames and audio as binary frames.
9. `{"type":"Configure","features":{"numerals":true}}` is the `/v1/listen` form. Flux STT rejects the `features` nesting and closes the connection; on `/v2/listen` send `numerals` as a top-level field, `{"type":"Configure","numerals":true}`.

## Pricing

Deepgram bills speech-to-text per minute of audio. Figures change, so read them at https://deepgram.com/pricing rather than from any skill.

## Use a different skill when

- You need every parameter, response schema, or message field: `api` skill, file `references/listen.md`.
- You want the documentation page for a topic: `docs` skill. The pages this skill leans on are listed under Sources.
- You want a runnable app with a UI: `starters` skill (the `transcription`, `live-transcription`, and `flux` features).
- You want a one-feature snippet under 50 lines: `recipes` skill, https://github.com/deepgram/recipes.
- You are wiring Deepgram into Twilio, LiveKit, Pipecat, LangChain, or another platform: `examples` skill.
- You want language-idiomatic SDK code: install `deepgram-{js,python,java,go,rust,dotnet}-speech-to-text` for Nova and `deepgram-{lang}-conversational-stt` for Flux STT from the matching SDK repository (`npx skills add deepgram/deepgram-python-sdk`, and so on).
- You want mid-stream `numerals` through `Configure` from an SDK: the `deepgram-{lang}-conversational-stt` skills do not cover it, so take the message shape from the `Configure` bullet in this skill. The JavaScript SDK sends it from 5.13.0 (`socket.sendConfigure({type:"Configure", numerals:true})`), the Python SDK from 7.11.0 (`connection.send_configure(ListenV2Configure(numerals=True))`), and the Java SDK from 0.10.2 (`sendConfigure(ListenV2Configure.builder().numerals(true).build())`).
- You want mid-stream `numerals` on the Go 3.8.0, Rust 0.11.0, or .NET 7.1.1 SDK: their Configure types carry no `numerals` field, so send the raw JSON Configure message or set `numerals` on the connection URL.
- You want analysis and not just the transcript (`summarize`, `sentiment`, `topics`, `intents`, `detect_entities` on `/v1/listen`): `audio-intelligence` skill. For text you already have, `/v1/read` and the `text-intelligence` skill.
- You want text-to-speech or a full voice agent: the `text-to-speech` or `voice-agent` skill.
- You want a shell command rather than application code: `cli` skill.
- You want the docs queryable from your coding tool: `setup-mcp` skill.

## Sources

- Getting started: https://developers.deepgram.com/docs/stt/getting-started
- Nova prerecorded: https://developers.deepgram.com/docs/pre-recorded-audio
- Nova live streaming: https://developers.deepgram.com/docs/live-streaming-audio and https://developers.deepgram.com/docs/audio-keep-alive
- Models and languages: https://developers.deepgram.com/docs/models-languages-overview
- Multilingual code switching: https://developers.deepgram.com/docs/multilingual-code-switching
- Smart Format, diarization, keyterms: https://developers.deepgram.com/docs/smart-format, https://developers.deepgram.com/docs/diarization, https://developers.deepgram.com/docs/keyterm
- Audio intelligence: https://developers.deepgram.com/docs/audio-intelligence and https://developers.deepgram.com/docs/stt-intelligence-feature-overview
- Flux quickstart: https://developers.deepgram.com/docs/flux/quickstart
- Flux compared with Nova-3: https://developers.deepgram.com/docs/flux/flux-nova-3-comparison
- Nova-3 to Flux migration: https://developers.deepgram.com/docs/flux/nova-3-migration
- Flux state machine: https://developers.deepgram.com/docs/flux/state
- Flux STT turn-detection parameters (the threshold table): https://developers.deepgram.com/docs/flux/configuration
- Flux control messages: https://developers.deepgram.com/docs/flux/configure, https://developers.deepgram.com/docs/flux/force-end-turn, https://developers.deepgram.com/docs/flux/close-stream
- Flux STT feature matrix (profanity filter, redaction scope, control messages): https://developers.deepgram.com/docs/flux/feature-overview
- Profanity filter, including Flux STT `language=multi`: https://developers.deepgram.com/docs/profanity-filter
- Bring your own turn detection (`eot_threshold=1.0` plus `ForceEndTurn`): https://developers.deepgram.com/docs/flux/own-turn-detection
- Flux STT in a voice agent and eager end of turn (LLM call cost): https://developers.deepgram.com/docs/flux/agent and https://developers.deepgram.com/docs/flux/voice-agent-eager-eot
- Redaction, including the Flux STT `*` placeholder: https://developers.deepgram.com/docs/redaction
- Regional endpoints (EU, AU, India hosts for `/v1/listen` and `/v2/listen`): https://developers.deepgram.com/reference/regional-endpoints
- Numerals, including the Flux STT language list and mid-stream toggling: https://developers.deepgram.com/docs/numerals
- ForceEndTurn release note: https://developers.deepgram.com/changelog/2026/8/28
- Flux multilingual: https://developers.deepgram.com/docs/flux/language-prompting
- Authentication: https://developers.deepgram.com/guides/fundamentals/authenticating and https://developers.deepgram.com/guides/fundamentals/token-based-authentication
- Models endpoint: https://developers.deepgram.com/guides/fundamentals/model-metadata
- Error codes: https://developers.deepgram.com/docs/errors
- Voice Agent host (agent.deepgram.com): https://developers.deepgram.com/docs/build-a-voice-agent
- API reference: https://developers.deepgram.com/reference/speech-to-text/listen-pre-recorded, https://developers.deepgram.com/reference/speech-to-text/listen-streaming, https://developers.deepgram.com/reference/speech-to-text/listen-flux
