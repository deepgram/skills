# Deepgram Speak API

Text-to-speech synthesis — convert text into natural-sounding audio.

## Documentation

- [Text-to-Speech Docs](https://developers.deepgram.com/docs/tts-rest)
- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)

## Authentication

All API requests require authentication. Two methods are supported:

### ApiKeyAuth

Use `Authorization: Token <API_KEY>`
Example: `Authorization: Token 12345abcdef`


### JwtAuth

Use `Authorization: Bearer <JWT>`
Example: `Authorization: Bearer eyJhbGciOiJ...`



## REST API

### POST `/v1/speak`

Text to Speech transformation

Convert text into natural-sounding speech using Deepgram's TTS REST API

#### Query Parameters

- `callback` string — URL to which we'll make the callback request
- `callback_method` `POST` | `PUT` (default: `POST`) — HTTP method by which the callback request will be made
- `mip_opt_out` boolean (default: `false`) — Opts out requests from the Deepgram Model Improvement Program. Refer to our Docs for pricing impacts before setting this to true. https://dpgr.am/deepgram-mip
- `tag` string | string[] — Label your requests for the purpose of identification during usage reporting
- `bit_rate` `32000` | `48000` | number | number (default: `48000`) — The bitrate of the audio in bits per second. Choose from predefined ranges or specific values based on the encoding type.
- `container` `none` | `wav` | `wav` | `wav` | `ogg` (default: `wav`) — Container specifies the file format wrapper for the output audio. The available options depend on the encoding type.
- `encoding` `linear16` | `flac` | `mulaw` | `alaw` | `mp3` | `opus` | `aac` (default: `mp3`) — Encoding allows you to specify the expected encoding of your audio output
- `model` `aura-angus-en` | `aura-arcas-en` | `aura-asteria-en` | `aura-athena-en` | `aura-helios-en` | `aura-hera-en` | `aura-luna-en` | `aura-orion-en` | `aura-orpheus-en` | `aura-perseus-en` | `aura-stella-en` | `aura-zeus-en` | `aura-2-amalthea-en` | `aura-2-andromeda-en` | `aura-2-apollo-en` | `aura-2-arcas-en` | `aura-2-aries-en` | `aura-2-asteria-en` | `aura-2-athena-en` | `aura-2-atlas-en` | `aura-2-aurora-en` | `aura-2-callista-en` | `aura-2-cora-en` | `aura-2-cordelia-en` | `aura-2-delia-en` | `aura-2-draco-en` | `aura-2-electra-en` | `aura-2-harmonia-en` | `aura-2-helena-en` | `aura-2-hera-en` | `aura-2-hermes-en` | `aura-2-hyperion-en` | `aura-2-iris-en` | `aura-2-janus-en` | `aura-2-juno-en` | `aura-2-jupiter-en` | `aura-2-luna-en` | `aura-2-mars-en` | `aura-2-minerva-en` | `aura-2-neptune-en` | `aura-2-odysseus-en` | `aura-2-ophelia-en` | `aura-2-orion-en` | `aura-2-orpheus-en` | `aura-2-pandora-en` | `aura-2-phoebe-en` | `aura-2-pluto-en` | `aura-2-saturn-en` | `aura-2-selene-en` | `aura-2-thalia-en` | `aura-2-theia-en` | `aura-2-vesta-en` | `aura-2-zeus-en` | `aura-2-agustina-es` | `aura-2-alvaro-es` | `aura-2-antonia-es` | `aura-2-aquila-es` | `aura-2-carina-es` | `aura-2-celeste-es` | `aura-2-diana-es` | `aura-2-estrella-es` | `aura-2-gloria-es` | `aura-2-javier-es` | `aura-2-luciano-es` | `aura-2-nestor-es` | `aura-2-olivia-es` | `aura-2-selena-es` | `aura-2-silvia-es` | `aura-2-sirio-es` | `aura-2-valerio-es` | `aura-2-aurelia-de` | `aura-2-elara-de` | `aura-2-fabian-de` | `aura-2-julius-de` | `aura-2-kara-de` | `aura-2-lara-de` | `aura-2-viktoria-de` | `aura-2-beatrix-nl` | `aura-2-cornelia-nl` | `aura-2-daphne-nl` | `aura-2-hestia-nl` | `aura-2-lars-nl` | `aura-2-leda-nl` | `aura-2-rhea-nl` | `aura-2-roman-nl` | `aura-2-sander-nl` | `aura-2-agathe-fr` | `aura-2-hector-fr` | `aura-2-cesare-it` | `aura-2-cinzia-it` | `aura-2-demetra-it` | `aura-2-dionisio-it` | `aura-2-elio-it` | `aura-2-flavio-it` | `aura-2-livia-it` | `aura-2-maia-it` | `aura-2-melia-it` | `aura-2-ama-ja` | `aura-2-ebisu-ja` | `aura-2-fujin-ja` | `aura-2-izanami-ja` | `aura-2-uzume-ja` (default: `aura-asteria-en`) — AI model used to process submitted text
- `sample_rate` `8000` | `16000` | `24000` | `32000` | `48000` | `8000` | `16000` | `8000` | `16000` | `22050` | `48000` (default: `24000`) — Sample Rate specifies the sample rate for the output audio. Based on the encoding, different sample rates are supported. For some encodings, the sample rate is not configurable
- `speed` number (default: `1`) — Speaking rate multiplier that adjusts the pace of generated speech while preserving natural prosody and voice quality. Not yet supported in all languages.

#### Request Body

**application/json**

- `text` string **(required)** — The text content to be converted to speech

#### Responses

**200**: Successful text-to-speech transformation
**400**: Invalid Request

### POST `/v2/speak`

Flux Text to Speech (batch)

Synthesize a complete block of text into a single audio response using Deepgram's Flux TTS batch (REST) API. Use this for pre-rendering fixed audio (IVR prompts, notifications, narration) where the whole text is known up front and you don't need incremental playback or interruption.

#### Query Parameters

- `callback` string — URL to which we'll make the callback request
- `callback_method` `POST` | `PUT` (default: `POST`) — HTTP method by which the callback request will be made
- `mip_opt_out` boolean (default: `false`) — Opts out requests from the Deepgram Model Improvement Program. Refer to our Docs for pricing impacts before setting this to true. https://dpgr.am/deepgram-mip
- `tag` string | string[] — Label your requests for the purpose of identification during usage reporting
- `bit_rate` `8000` | `16000` | `24000` | `32000` | `40000` | `48000` | integer | integer (default: `48000`) — The bitrate of the audio in bits per second. Choose from predefined ranges or specific values based on the encoding type.
- `container` `none` | `wav` | `wav` | `wav` | `ogg` (default: `wav`) — Container specifies the file format wrapper for the output audio. The available options depend on the encoding type.
- `encoding` `linear16` | `flac` | `mulaw` | `alaw` | `mp3` | `opus` | `aac` (default: `mp3`) — Encoding allows you to specify the expected encoding of your audio output
- `expressivity` `-2` | `-1` | `0` | `1` | `2` (default: `0`) — Expressive range of the generated speech, on a calm-to-animated axis. Accepted values: `-2`, `-1`, `0`, `1`, `2`. `0` (the default) is the voice's tuned delivery and the production-validated setting, with `-2` the calm end of the range and `2` the animated end. Supported on all Flux voices; applies to the whole request. Beta: behavior may change in future model versions, and non-default values increase the risk of hallucinations and pronunciation errors; audition before shipping. An invalid value is rejected with a `400` — `EXPRESSIVITY_OUT_OF_RANGE` for a value outside the range, `EXPRESSIVITY_INCREMENT_INVALID` for a fractional value. See [Expressivity](/docs/tts-expressivity).
- `model` string **(required)** — Flux TTS model used to synthesize the submitted text, in the form `flux-{voice}-{language}` (for example, `flux-alexis-en`). Required; unlike the v1 (Aura) endpoint there is no default and only flux models are accepted. English-only at launch.
- `sample_rate` `8000` | `16000` | `24000` | `32000` | `44100` | `48000` | `8000` | `16000` | `8000` | `16000` | `8000` | `16000` | `22050` | `32000` | `48000` (default: `24000`) — Sample Rate specifies the sample rate for the output audio. Based on the encoding, different sample rates are supported. For some encodings, the sample rate is not configurable
- `speed` number (default: `1`) — Speaking rate multiplier that adjusts the pace of generated speech while preserving natural prosody and voice quality. Accepted values run `0.5` to `1.5` in `0.05` increments. Not yet supported in all languages.
- `priority` `low` — Processing priority for asynchronous (callback) requests. The only supported value is low.

#### Request Body

**application/json**

- `text` string **(required)** — The text content to be converted to speech. The server normalizes and preprocesses the text before synthesis. Inline pause and pronunciation controls are not yet applied; they are stripped from the text before synthesis.

#### Responses

**200**: Returns the synthesized audio in the requested encoding as a binary stream. When a `callback` URL is supplied, the request is processed asynchronously and the response body is instead a JSON acknowledgement (Content-Type `application/json`) of the form {"request_id": "..."}, with the audio delivered to the callback URL. Because this endpoint is typed as a binary audio stream, SDK callers that set `callback` receive this JSON acknowledgement through the audio byte iterator as raw bytes and must join the chunks and parse `request_id` themselves.
**400**: Invalid Request. Inline pause and pronunciation controls are not applied and are stripped rather than rejected.

## WebSocket API

### WebSocket `/v1/speak`
> Server: `wss://api.deepgram.com`

Convert text into natural-sounding speech using Deepgram's TTS WebSocket

#### Connection Parameters

- `encoding` `linear16` | `mulaw` | `alaw` (default: `linear16`) — Encoding allows you to specify the expected encoding of your audio output for streaming TTS. Only streaming-compatible encodings are supported.
- `mip_opt_out` boolean (default: `false`) — Opts out requests from the Deepgram Model Improvement Program. Refer to our Docs for pricing impacts before setting this to true. https://dpgr.am/deepgram-mip
- `model` `aura-angus-en` | `aura-arcas-en` | `aura-asteria-en` | `aura-athena-en` | `aura-helios-en` | `aura-hera-en` | `aura-luna-en` | `aura-orion-en` | `aura-orpheus-en` | `aura-perseus-en` | `aura-stella-en` | `aura-zeus-en` | `aura-2-amalthea-en` | `aura-2-andromeda-en` | `aura-2-apollo-en` | `aura-2-arcas-en` | `aura-2-aries-en` | `aura-2-asteria-en` | `aura-2-athena-en` | `aura-2-atlas-en` | `aura-2-aurora-en` | `aura-2-callista-en` | `aura-2-cora-en` | `aura-2-cordelia-en` | `aura-2-delia-en` | `aura-2-draco-en` | `aura-2-electra-en` | `aura-2-harmonia-en` | `aura-2-helena-en` | `aura-2-hera-en` | `aura-2-hermes-en` | `aura-2-hyperion-en` | `aura-2-iris-en` | `aura-2-janus-en` | `aura-2-juno-en` | `aura-2-jupiter-en` | `aura-2-luna-en` | `aura-2-mars-en` | `aura-2-minerva-en` | `aura-2-neptune-en` | `aura-2-odysseus-en` | `aura-2-ophelia-en` | `aura-2-orion-en` | `aura-2-orpheus-en` | `aura-2-pandora-en` | `aura-2-phoebe-en` | `aura-2-pluto-en` | `aura-2-saturn-en` | `aura-2-selene-en` | `aura-2-thalia-en` | `aura-2-theia-en` | `aura-2-vesta-en` | `aura-2-zeus-en` | `aura-2-agustina-es` | `aura-2-alvaro-es` | `aura-2-antonia-es` | `aura-2-aquila-es` | `aura-2-carina-es` | `aura-2-celeste-es` | `aura-2-diana-es` | `aura-2-estrella-es` | `aura-2-gloria-es` | `aura-2-javier-es` | `aura-2-luciano-es` | `aura-2-nestor-es` | `aura-2-olivia-es` | `aura-2-selena-es` | `aura-2-silvia-es` | `aura-2-sirio-es` | `aura-2-valerio-es` | `aura-2-aurelia-de` | `aura-2-elara-de` | `aura-2-fabian-de` | `aura-2-julius-de` | `aura-2-kara-de` | `aura-2-lara-de` | `aura-2-viktoria-de` | `aura-2-beatrix-nl` | `aura-2-cornelia-nl` | `aura-2-daphne-nl` | `aura-2-hestia-nl` | `aura-2-lars-nl` | `aura-2-leda-nl` | `aura-2-rhea-nl` | `aura-2-roman-nl` | `aura-2-sander-nl` | `aura-2-agathe-fr` | `aura-2-hector-fr` | `aura-2-cesare-it` | `aura-2-cinzia-it` | `aura-2-demetra-it` | `aura-2-dionisio-it` | `aura-2-elio-it` | `aura-2-flavio-it` | `aura-2-livia-it` | `aura-2-maia-it` | `aura-2-melia-it` | `aura-2-ama-ja` | `aura-2-ebisu-ja` | `aura-2-fujin-ja` | `aura-2-izanami-ja` | `aura-2-uzume-ja` (default: `aura-asteria-en`) — AI model used to process submitted text
- `sample_rate` `8000` | `16000` | `24000` | `32000` | `48000` (default: `24000`) — Sample Rate specifies the sample rate for the output audio. Based on encoding 8000 or 24000 are possible defaults. For some encodings sample rate is not configurable.
- `speed` number (default: `1`) — Speaking rate multiplier that adjusts the pace of generated speech while preserving natural prosody and voice quality. Not yet supported in all languages.

#### Client → Server Messages

**SpeakV1Text** — Text to convert to audio

  - `type` `Speak` **(required)** — Message type identifier
  - `text` string **(required)** — The input text to be converted to speech

**SpeakV1Flush** — Flush the buffer and receive the final audio for text sent so far

  - `type` `Flush` | `Clear` | `Close` **(required)** — Message type identifier

**SpeakV1Clear** — Clear the buffer and start a new audio generation. Potentially destructive operation for any text in the buffer

  - `type` `Flush` | `Clear` | `Close` **(required)** — Message type identifier

**SpeakV1Close** — Flush the buffer and close the connection gracefully after all audio is generated

  - `type` `Flush` | `Clear` | `Close` **(required)** — Message type identifier

#### Server → Client Messages

**SpeakV1Audio** — Receive audio chunks as they are generated

**SpeakV1Metadata** — Receive metadata about the audio generation

  - `type` `Metadata` **(required)** — Message type identifier
  - `request_id` string **(required)** — Unique identifier for the request
  - `model_name` string **(required)** — Name of the model being used
  - `model_version` string **(required)** — Version of the primary model being used
  - `model_uuid` string **(required)** — Unique identifier for the primary model used
  - `additional_model_uuids` string[] — List of unique identifiers for any additional models used to serve the request

**SpeakV1Flushed** — Receive metadata about the audio generation

  - `type` `Flushed` | `Cleared` **(required)** — Message type identifier
  - `sequence_id` integer **(required)** — The sequence ID of the response

**SpeakV1Cleared** — Receive metadata about the audio generation

  - `type` `Flushed` | `Cleared` **(required)** — Message type identifier
  - `sequence_id` integer **(required)** — The sequence ID of the response

**SpeakV1Warning** — Receive a warning about the audio generation

  - `type` `Warning` **(required)** — Message type identifier
  - `description` string **(required)** — A description of what went wrong
  - `code` string **(required)** — Error code identifying the type of error

### WebSocket `/v2/speak`
> Server: `wss://api.deepgram.com`

Streaming, turn-based text-to-speech (Flux TTS) built for voice-agent
pipelines. Stream LLM tokens in, speak them to the user, and report
per-turn billing and timing.


#### Connection Parameters

- `model` string — The Flux TTS model used to synthesize speech. Required on every connection. Model strings follow the format `flux-{voice}-{language}` (e.g. `flux-alexis-en`). An Aura model string is rejected on `/v2/speak`; use `/v1/speak` for Aura voices.
- `encoding` `linear16` | `mulaw` | `alaw` (default: `linear16`) — Encoding of the raw output audio. The streaming WebSocket emits raw (non-containerized) audio, so only streaming-compatible encodings are supported. Compressed and containerized encodings (`mp3`, `opus`, `flac`, `aac`) are available on the batch REST transport only.
- `sample_rate` `8000` | `16000` | `24000` | `32000` | `44100` | `48000` — Output sample rate in Hz. With `linear16`, valid values are `8000`, `16000`, `24000`, `32000`, `44100`, and `48000`. With `mulaw` or `alaw`, valid values are `8000` and `16000`. Defaults to the model's native sample rate.
- `speed` number (default: `1`) — Speech-rate multiplier. `1.0` is the model's nominal rate; lower is slower. Accepted values run `0.5` to `1.5` in `0.05` increments. A value outside that range is rejected with `SPEED_OUT_OF_RANGE`; a value inside it but off the `0.05` increment with `SPEED_INCREMENT_INVALID`. Models and languages without runtime speed control reject any value with `SPEED_NOT_SUPPORTED`.
- `expressivity` `-2` | `-1` | `0` | `1` | `2` (default: `0`) — Expressive range of the generated speech, on a calm-to-animated axis. Accepted values: `-2`, `-1`, `0`, `1`, `2`. `0` (the default) is the voice's tuned delivery and the production-validated setting, with `-2` the calm end of the range and `2` the animated end. Supported on all Flux voices. Fixed for the connection — not settable via `Configure`. Beta: behavior may change in future model versions, and non-default values increase the risk of hallucinations and pronunciation errors; audition before shipping. An invalid value fails the connection with a `400` — `EXPRESSIVITY_OUT_OF_RANGE` for a value outside the range, `EXPRESSIVITY_INCREMENT_INVALID` for a fractional value. See [Expressivity](/docs/tts-expressivity).
- `mip_opt_out` boolean (default: `false`) — Opts out requests from the Deepgram Model Improvement Program. Refer to our Docs for pricing impacts before setting this to true. https://dpgr.am/deepgram-mip
- `tag` string | string[] — Label your requests for the purpose of identification during usage reporting

#### Client → Server Messages

**SpeakV2Speak** — Send text to be synthesized into the active turn

  - `type` `Speak` **(required)** — Message type identifier
  - `text` string **(required)** — The input text to synthesize. Inline pause and pronunciation controls are not yet applied; they are stripped from the text before synthesis.

**SpeakV2Flush** — End the active turn and generate the remaining audio

  - `type` `Flush` **(required)** — Message type identifier

**SpeakV2Interrupt** — Cancel the active turn because the user barged in

  - `type` `Interrupt` **(required)** — Message type identifier
  - `playback_offset` { type: `time_ms`, value: integer } — How much audio the client had played when the user barged in. Optional: without it the server cannot split the turn's text, so `SpeechInterrupted` omits `text_spoken` and `text_remaining`.

    The offset is cumulative from the start of the *session*, not from the start of the current turn. Each `Interrupt` must advance past the position the previous one established.

**SpeakV2Configure** — Update synthesis configuration mid-session

  - `type` `Configure` **(required)** — Message type identifier
  - `speed` number (default: `1`) — Speech-rate multiplier. `1.0` is the model's nominal rate; lower is slower. Accepted values run `0.5` to `1.5` in `0.05` increments. A value outside that range is rejected with `SPEED_OUT_OF_RANGE`; a value inside it but off the `0.05` increment with `SPEED_INCREMENT_INVALID`. Models and languages without runtime speed control reject any value with `SPEED_NOT_SUPPORTED`.

**SpeakV2Close** — Gracefully close the connection, draining all remaining and queued audio

  - `type` `Close` **(required)** — Message type identifier

#### Server → Client Messages

**SpeakV2Audio** — Receive audio chunks as they are generated

**SpeakV2Connected** — Receive a connected message on a successful connection

  - `type` `Connected` **(required)** — Message type identifier
  - `request_id` string **(required)** — The unique identifier of the `/v2/speak` request
  - `model_name` string **(required)** — Resolved model name
  - `model_version` string **(required)** — Resolved model version
  - `model_uuids` string[] **(required)** — Resolved model UUIDs. A list, because a resolved model may be backed by more than one underlying model.

**SpeakV2SpeechStarted** — Receive a message marking the start of a new turn, carrying the turn's unique identifier

  - `type` `SpeechStarted` **(required)** — Message type identifier
  - `speech_id` string **(required)** — Server-minted identifier for this turn, of the form `dg_sp_<12 hex digits>`. Informational.

**SpeakV2SpeechMetadata** — Receive per-turn billing and timing after a manual Flush

  - `type` `SpeechMetadata` **(required)** — Message type identifier
  - `speech_id` string **(required)** — Server-assigned turn identifier
  - `audio_duration_ms` integer **(required)** — Total audio duration produced for this turn, in milliseconds
  - `input_character_count` integer **(required)** — Raw input character count for this turn, before text normalization
  - `billable_character_count` integer **(required)** — Billable character count for this turn — the input character count with stripped control characters removed. Always less than or equal to `input_character_count`.
  - `controls_applied` { pronunciations_applied: integer, breaks_applied: integer, pronunciation_warnings: integer } **(required)** — Counts of the inline controls the server acted on during the turn. Inline pause and pronunciation controls are not applied at launch — support is coming soon — so every count is currently `0`.

**SpeakV2SpeechInterrupted** — Receive what the user heard, and the interrupted turn's billing, after an Interrupt

  - `type` `SpeechInterrupted` **(required)** — Message type identifier
  - `audio_played_ms` integer **(required)** — How much audio the client had played when the interrupt landed, in milliseconds from the start of the session. Echoes the `Interrupt`'s `playback_offset` when one was supplied. Otherwise it is the server's own total, representing the audio that has been generated so far. A client that sends its first `Interrupt` without an offset can use this value as the baseline the next one must advance past.
  - `text_spoken` string — The portion of the turn's text the user heard. Omitted when the `Interrupt` carried no `playback_offset`.
  - `text_remaining` string — The portion of the turn's text the user did not hear. Omitted when the `Interrupt` carried no `playback_offset`.
  - `metadata` { speech_id: string, audio_duration_ms: integer, input_character_count: integer, billable_character_count: integer, controls_applied: { pronunciations_applied: integer, breaks_applied: integer, pronunciation_warnings: integer } } **(required)** — Billing and timing for a single turn.

**SpeakV2Flushed** — Receive an echo confirming receipt of a manual Flush

  - `type` `Flushed` **(required)** — Message type identifier
  - `speech_id` string **(required)** — Server-assigned turn identifier

**SpeakV2SessionMetadata** — Receive cumulative session totals before the socket closes

  - `type` `SessionMetadata` **(required)** — Message type identifier
  - `total_audio_duration_ms` integer **(required)** — Cumulative audio duration produced across the session, in milliseconds. An `Interrupt` rebases this onto the audio the client actually played.
  - `total_input_character_count` integer **(required)** — Cumulative raw input character count across the session
  - `total_billable_character_count` integer **(required)** — Cumulative billable character count across the session

**SpeakV2ConfigureSuccess** — Receive confirmation that a Configure was accepted and applied, echoing the applied configuration

  - `type` `ConfigureSuccess` **(required)** — Message type identifier
  - `applied` { speed: number } **(required)** — Synthesis configuration. A field is present only when it has been set on this session.

**SpeakV2ConfigureFailure** — Receive notice that a Configure was rejected or failed to apply; the prior configuration is retained

  - `type` `ConfigureFailure` **(required)** — Message type identifier
  - `code` `SPEED_OUT_OF_RANGE` | `SPEED_INCREMENT_INVALID` | `SPEED_NOT_SUPPORTED` | `INTERNAL_ERROR` **(required)** — Failure code, in `SCREAMING_SNAKE_CASE`. `SPEED_OUT_OF_RANGE`: outside the range the model publishes. `SPEED_INCREMENT_INVALID`: inside the published range but off the `0.05` increment. `SPEED_NOT_SUPPORTED`: this model or language has no runtime speed control at all. `INTERNAL_ERROR`: the configuration was acceptable but the server could not apply it — unlike the others, a server-side failure rather than a statement about the request.
  - `field` `speed` — The configuration field the failure is about. Absent when the failure is not tied to one field.
  - `value` number — The rejected value for `field`. Absent when there is no offending value to echo — `SPEED_NOT_SUPPORTED` names the field but carries no value, because the rejection is a property of the model.
  - `description` string **(required)** — A human-readable description of the failure

**SpeakV2Warning** — Receive a warning; synthesis continues and the connection is unaffected

  - `type` `Warning` **(required)** — Message type identifier
  - `code` string **(required)** — Warning code identifying the condition, in `SCREAMING_SNAKE_CASE`.

    Turn-scoped codes: `NO_ACTIVE_SPEECH` (a speech-scoped message arrived with no active turn), `NO_SYNTHESIZABLE_TEXT` (the turn's text was entirely whitespace or punctuation, so it produced no audio and is completed with a zero-duration `SpeechMetadata`), and `SYNTHESIS_RETRYING` (a synthesis request failed and is being retried).

    Inline-control codes are reserved and not currently emitted, because inline pause and pronunciation controls are not yet applied: `BREAKS_LIMIT_EXCEEDED` (too many pause controls, or two pauses with no intervening text), `BREAK_TOKENS_OUT_OF_RANGE` (pause durations outside the range the model supports), `BREAK_TOKENS_WITH_INVALID_INCREMENTS` (pause durations off the model's supported increment), `PRONUNCIATION_WARNINGS` (a pronunciation override contained invalid IPA), `PRONUNCIATION_TOO_LONG` (an IPA string exceeded the length limit), `PRONUNCIATIONS_LIMIT_EXCEEDED` (too many pronunciation controls in one turn).

    Interrupt-scoped codes, each meaning the `Interrupt` was ignored: `NO_AUDIO_GENERATED` (the session has produced no audio yet, so there is nothing to interrupt), `INTERRUPT_IN_PROGRESS` (an earlier `Interrupt` is still being processed — at most one is handled at a time), `INVALID_INTERRUPT_OFFSET` (the `playback_offset` did not advance past the position a prior interrupt established).
  - `description` string **(required)** — A human-readable description of the warning

**SpeakV2Error** — Receive a fatal error message followed by a WebSocket close

  - `type` `Error` **(required)** — Message type identifier
  - `code` `MESSAGE-0000` | `DATA-0000` | `DATA-0002` | `BIG-0000` | `NET-0000` | `NET-0001` | `NET-0002` | `NET-0003` | `NET-0004` **(required)** — A code identifying the error, e.g. `MESSAGE-0000` or `NET-0000`.
  - `description` string **(required)** — Prose description of the error
