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
| Model names | `nova-3` (alias of `nova-3-general`), `nova-3-medical` | `flux-general-en` (English), `flux-general-multi` (10 languages) |
| Endpoint | `/v1/listen`, REST and WebSocket | `/v2/listen`, WebSocket only |
| Output | A transcript stream | `TurnInfo` events carrying turn state and a transcript per turn |
| Turn detection | None built in; you use endpointing and your own logic | Built in: `StartOfTurn`, `EagerEndOfTurn`, `TurnResumed`, `EndOfTurn` |
| Formatting and analysis | `smart_format`, `diarize_model`, `summarize`, `sentiment`, `topics`, `intents`, redaction | Word timestamps, `numerals`, number redaction, `keyterm`; no smart formatting, no diarization |
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
- `keyterm=<term>` boosts up to 100 terms on Nova-3. Repeat the parameter once per term. Commas, semicolons, and `term:weight` are not rejected; the API treats the whole value as one literal term and boosts nothing.
- `summarize=v2`, `sentiment=true`, `topics=true`, and `intents=true` add audio intelligence. They run on prerecorded English audio only.
- Live streaming uses `wss://api.deepgram.com/v1/listen?model=nova-3`, the same `Authorization` header, and binary audio frames. During silence send `{"type":"KeepAlive"}` as a text frame every 3 to 5 seconds; the connection closes after 10 seconds without audio. Finish with `{"type":"CloseStream"}`.

## Flux STT: conversational audio with turn detection

Connect over WebSocket. Flux has no REST path.

```
wss://api.deepgram.com/v2/listen?model=flux-general-en&encoding=linear16&sample_rate=16000
```

Send the same `Authorization: Token` header. Audio must be mono. For raw audio (`linear16`, `linear32`, `mulaw`, `alaw`, `opus`, `ogg-opus`) `encoding` and `sample_rate` are required; for WAV, Ogg, or WebM containers omit both. Send 80 ms chunks.

The server sends `Connected`, then a stream of `TurnInfo` messages. Each carries `event`, `turn_index`, `transcript`, `words` with timestamps, and `end_of_turn_confidence`. The `event` values:

- `Update`: roughly every 0.25 s of audio while a turn is in progress.
- `StartOfTurn`: the speaker began. Use it to interrupt your agent (barge-in).
- `EndOfTurn`: the speaker finished. Send the transcript to your language model. It carries `trigger`: `model`, `manual`, or `timeout`.
- `EagerEndOfTurn` and `TurnResumed`: emitted only when you set `eager_eot_threshold`. Start drafting a reply on the first; cancel it on the second.

Three query parameters tune turn detection, and all three can change mid-stream:

| Parameter | Range | Default | Effect |
|---|---|---|---|
| `eot_threshold` | 0.5 to 1.0 | 0.7 | Confidence needed for `EndOfTurn`. `1.0` suppresses model detection. |
| `eager_eot_threshold` | 0.3 to 0.9 | unset | Enables `EagerEndOfTurn`. Lower values fire earlier with more false starts. |
| `eot_timeout_ms` | 500 to 60000 | 5000 | Silence that forces `EndOfTurn` regardless of confidence. |

Client control messages, each a JSON text frame:

- `{"type":"Configure","thresholds":{"eot_threshold":0.8},"keyterms":["Deepgram"]}` changes thresholds, keyterms, or `language_hints` without reconnecting. Omitted fields keep their values; a `keyterms` array replaces the whole list. The reply is `ConfigureSuccess` or `ConfigureFailure`.
- `{"type":"ForceEndTurn"}` (added August 28, 2026) ends the current turn on your own signal: a push-to-talk release, a DTMF tone, a send button. Flux emits `EndOfTurn` with `"trigger":"manual"`. With no active turn the message is ignored and a `Warning` with code `FORCE_END_TURN_NO_ACTIVE_TURN` comes back. Set `eot_threshold=1.0` to drive every turn yourself.
- `{"type":"CloseStream"}` closes the stream.

For non-English or mixed-language calls use `model=flux-general-multi`, optionally with repeated `language_hint=<code>` parameters (for example `language_hint=en&language_hint=es`). Without hints the model detects the language itself. `TurnInfo` then includes `languages` and `languages_hinted`.

## Common mistakes

1. `Authorization: Bearer <api key>` returns 401. API keys use `Authorization: Token <key>`. `Bearer` is only for the short-lived JWT that `POST /v1/auth/grant` issues.
2. A 403 with `{"err_code":"INSUFFICIENT_PERMISSIONS","err_msg":"Project does not have access to the requested model."}` comes back both for a misspelled model name and for a real model the project cannot use. Check the spelling before asking for access (verified live 2026-09-03: a made-up model name on `/v1/listen` returned exactly this body). `GET https://api.deepgram.com/v1/models` lists the public catalog; `GET /v1/projects/{project_id}/models` lists your project's models. There is no model named `nova-3-conversational`; conversational audio is Flux, `flux-general-en`. The public catalog did not list the Flux model names when checked on 2026-09-03; the Flux docs are the source for those.
3. Flux on `/v1/listen` does not work, and `model=flux` is not a valid value. Use `/v2/listen` with `flux-general-en` or `flux-general-multi`.
4. `language=en` or `language=multi` on Flux is wrong. The model name selects the language. `language_hint` is accepted only by `flux-general-multi` and returns 400 on any other model.
5. Setting `encoding` or `sample_rate` for containerized audio (WAV, Ogg, WebM) causes errors or garbled output. Omit both and let the container declare the format.
6. `ForceEndTurn` on `/v1/listen` returns an error; it exists only on Flux.
7. `smart_format`, `diarize`, and the intelligence parameters are not available on `/v2/listen`. Speaker labels and summaries are a Nova job.
8. A `KeepAlive` sent as a binary frame is mishandled. Send control messages as text frames and audio as binary frames.

## Pricing

Deepgram bills speech-to-text per minute of audio. Figures change, so read them at https://deepgram.com/pricing rather than from any skill.

## Use a different skill when

- You need every parameter, response schema, or message field: `api` skill, file `references/listen.md`.
- You want the documentation page for a topic: `docs` skill. The pages this skill leans on are listed under Sources.
- You want a runnable app with a UI: `starters` skill (the `transcription`, `live-transcription`, and `flux` features).
- You want a one-feature snippet under 50 lines: `recipes` skill, https://github.com/deepgram/recipes.
- You are wiring Deepgram into Twilio, LiveKit, Pipecat, LangChain, or another platform: `examples` skill.
- You want language-idiomatic SDK code: install `deepgram-{js,python,java,go,rust,dotnet}-speech-to-text` for Nova and `deepgram-{lang}-conversational-stt` for Flux from the matching SDK repository (`npx skills add deepgram/deepgram-python-sdk`, and so on).
- You want text-to-speech or a full voice agent: the `text-to-speech` or `voice-agent` skill.
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
- Flux control messages: https://developers.deepgram.com/docs/flux/configure, https://developers.deepgram.com/docs/flux/force-end-turn, https://developers.deepgram.com/docs/flux/close-stream
- ForceEndTurn release note: https://developers.deepgram.com/changelog/2026/8/28
- Flux multilingual: https://developers.deepgram.com/docs/flux/language-prompting
- Authentication: https://developers.deepgram.com/guides/fundamentals/authenticating and https://developers.deepgram.com/guides/fundamentals/token-based-authentication
- Models endpoint: https://developers.deepgram.com/guides/fundamentals/model-metadata
- Error codes: https://developers.deepgram.com/docs/errors
- Voice Agent host (agent.deepgram.com): https://developers.deepgram.com/docs/build-a-voice-agent
- API reference: https://developers.deepgram.com/reference/speech-to-text/listen-pre-recorded, https://developers.deepgram.com/reference/speech-to-text/listen-streaming, https://developers.deepgram.com/reference/speech-to-text/listen-flux
