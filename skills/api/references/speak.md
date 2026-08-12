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
- `bit_rate` `32000` | `48000` | number | number — The bitrate of the audio in bits per second. Choose from predefined ranges or specific values based on the encoding type.
- `container` `none` | `wav` | `wav` | `wav` | `ogg` — Container specifies the file format wrapper for the output audio. The available options depend on the encoding type.
- `encoding` `linear16` | `flac` | `mulaw` | `alaw` | `mp3` | `opus` | `aac` — Encoding allows you to specify the expected encoding of your audio output
- `model` `aura-angus-en` | `aura-arcas-en` | `aura-asteria-en` | `aura-athena-en` | `aura-helios-en` | `aura-hera-en` | `aura-luna-en` | `aura-orion-en` | `aura-orpheus-en` | `aura-perseus-en` | `aura-stella-en` | `aura-zeus-en` | `aura-2-amalthea-en` | `aura-2-andromeda-en` | `aura-2-apollo-en` | `aura-2-arcas-en` | `aura-2-aries-en` | `aura-2-asteria-en` | `aura-2-athena-en` | `aura-2-atlas-en` | `aura-2-aurora-en` | `aura-2-callista-en` | `aura-2-cora-en` | `aura-2-cordelia-en` | `aura-2-delia-en` | `aura-2-draco-en` | `aura-2-electra-en` | `aura-2-harmonia-en` | `aura-2-helena-en` | `aura-2-hera-en` | `aura-2-hermes-en` | `aura-2-hyperion-en` | `aura-2-iris-en` | `aura-2-janus-en` | `aura-2-juno-en` | `aura-2-jupiter-en` | `aura-2-luna-en` | `aura-2-mars-en` | `aura-2-minerva-en` | `aura-2-neptune-en` | `aura-2-odysseus-en` | `aura-2-ophelia-en` | `aura-2-orion-en` | `aura-2-orpheus-en` | `aura-2-pandora-en` | `aura-2-phoebe-en` | `aura-2-pluto-en` | `aura-2-saturn-en` | `aura-2-selene-en` | `aura-2-thalia-en` | `aura-2-theia-en` | `aura-2-vesta-en` | `aura-2-zeus-en` | `aura-2-agustina-es` | `aura-2-alvaro-es` | `aura-2-antonia-es` | `aura-2-aquila-es` | `aura-2-carina-es` | `aura-2-celeste-es` | `aura-2-diana-es` | `aura-2-estrella-es` | `aura-2-gloria-es` | `aura-2-javier-es` | `aura-2-luciano-es` | `aura-2-nestor-es` | `aura-2-olivia-es` | `aura-2-selena-es` | `aura-2-silvia-es` | `aura-2-sirio-es` | `aura-2-valerio-es` | `aura-2-aurelia-de` | `aura-2-elara-de` | `aura-2-fabian-de` | `aura-2-julius-de` | `aura-2-kara-de` | `aura-2-lara-de` | `aura-2-viktoria-de` | `aura-2-beatrix-nl` | `aura-2-cornelia-nl` | `aura-2-daphne-nl` | `aura-2-hestia-nl` | `aura-2-lars-nl` | `aura-2-leda-nl` | `aura-2-rhea-nl` | `aura-2-roman-nl` | `aura-2-sander-nl` | `aura-2-agathe-fr` | `aura-2-hector-fr` | `aura-2-cesare-it` | `aura-2-cinzia-it` | `aura-2-demetra-it` | `aura-2-dionisio-it` | `aura-2-elio-it` | `aura-2-flavio-it` | `aura-2-livia-it` | `aura-2-maia-it` | `aura-2-melia-it` | `aura-2-perseo-it` | `aura-2-ama-ja` | `aura-2-ebisu-ja` | `aura-2-fujin-ja` | `aura-2-izanami-ja` | `aura-2-uzume-ja` (default: `aura-asteria-en`) — AI model used to process submitted text
- `sample_rate` `8000` | `16000` | `24000` | `32000` | `48000` | `8000` | `16000` | `8000` | `16000` | `22050` | `48000` — Sample Rate specifies the sample rate for the output audio. Based on the encoding, different sample rates are supported. For some encodings, the sample rate is not configurable
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
- `bit_rate` `8000` | `16000` | `24000` | `32000` | `40000` | `48000` | integer | integer — The bitrate of the audio in bits per second. Choose from predefined ranges or specific values based on the encoding type.
- `container` `none` | `wav` | `wav` | `wav` | `ogg` — Container specifies the file format wrapper for the output audio. The available options depend on the encoding type.
- `encoding` `linear16` | `flac` | `mulaw` | `alaw` | `mp3` | `opus` | `aac` — Encoding allows you to specify the expected encoding of your audio output
- `expressivity` `-2` | `-1` | `0` | `1` | `2` — Expressive range of the generated speech, on a calm-to-animated axis. Accepted values: `-2`, `-1`, `0`, `1`, `2`. `0` (the default) is the voice's tuned delivery and the production-validated setting; negative values are calmer and more measured, positive values more animated. Supported on all Flux voices; applies to the whole request. Beta: behavior may change in future model versions, and non-default values increase the risk of hallucinations and pronunciation errors; audition before shipping. An invalid value is rejected with a `400` — `EXPRESSIVITY_OUT_OF_RANGE` for a value outside the range, `EXPRESSIVITY_INCREMENT_INVALID` for a fractional value. See [Expressivity](/docs/tts-expressivity).
- `model` string **(required)** — Flux TTS model used to synthesize the submitted text, in the form `flux-{voice}-{language}` (for example, `flux-alexis-en`). Required; unlike the v1 (Aura) endpoint there is no default and only flux models are accepted. English-only at launch.
- `sample_rate` `8000` | `16000` | `24000` | `32000` | `44100` | `48000` | `8000` | `16000` | `8000` | `16000` | `8000` | `16000` | `22050` | `32000` | `48000` — Sample Rate specifies the sample rate for the output audio. Based on the encoding, different sample rates are supported. For some encodings, the sample rate is not configurable
- `speed` `0.85` | `0.9` | `0.95` | `1` | `1.05` | `1.1` | `1.15` — Speaking rate multiplier that adjusts the pace of generated speech while preserving natural prosody and voice quality. Accepted values run `0.85` to `1.15` in `0.05` increments. Not yet supported in all languages.
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
- `mip_opt_out` any — Any type
- `model` `aura-angus-en` | `aura-arcas-en` | `aura-asteria-en` | `aura-athena-en` | `aura-helios-en` | `aura-hera-en` | `aura-luna-en` | `aura-orion-en` | `aura-orpheus-en` | `aura-perseus-en` | `aura-stella-en` | `aura-zeus-en` | `aura-2-amalthea-en` | `aura-2-andromeda-en` | `aura-2-apollo-en` | `aura-2-arcas-en` | `aura-2-aries-en` | `aura-2-asteria-en` | `aura-2-athena-en` | `aura-2-atlas-en` | `aura-2-aurora-en` | `aura-2-callista-en` | `aura-2-cora-en` | `aura-2-cordelia-en` | `aura-2-delia-en` | `aura-2-draco-en` | `aura-2-electra-en` | `aura-2-harmonia-en` | `aura-2-helena-en` | `aura-2-hera-en` | `aura-2-hermes-en` | `aura-2-hyperion-en` | `aura-2-iris-en` | `aura-2-janus-en` | `aura-2-juno-en` | `aura-2-jupiter-en` | `aura-2-luna-en` | `aura-2-mars-en` | `aura-2-minerva-en` | `aura-2-neptune-en` | `aura-2-odysseus-en` | `aura-2-ophelia-en` | `aura-2-orion-en` | `aura-2-orpheus-en` | `aura-2-pandora-en` | `aura-2-phoebe-en` | `aura-2-pluto-en` | `aura-2-saturn-en` | `aura-2-selene-en` | `aura-2-thalia-en` | `aura-2-theia-en` | `aura-2-vesta-en` | `aura-2-zeus-en` | `aura-2-agustina-es` | `aura-2-alvaro-es` | `aura-2-antonia-es` | `aura-2-aquila-es` | `aura-2-carina-es` | `aura-2-celeste-es` | `aura-2-diana-es` | `aura-2-estrella-es` | `aura-2-gloria-es` | `aura-2-javier-es` | `aura-2-luciano-es` | `aura-2-nestor-es` | `aura-2-olivia-es` | `aura-2-selena-es` | `aura-2-silvia-es` | `aura-2-sirio-es` | `aura-2-valerio-es` | `aura-2-aurelia-de` | `aura-2-elara-de` | `aura-2-fabian-de` | `aura-2-julius-de` | `aura-2-kara-de` | `aura-2-lara-de` | `aura-2-viktoria-de` | `aura-2-beatrix-nl` | `aura-2-cornelia-nl` | `aura-2-daphne-nl` | `aura-2-hestia-nl` | `aura-2-lars-nl` | `aura-2-leda-nl` | `aura-2-rhea-nl` | `aura-2-roman-nl` | `aura-2-sander-nl` | `aura-2-agathe-fr` | `aura-2-hector-fr` | `aura-2-cesare-it` | `aura-2-cinzia-it` | `aura-2-demetra-it` | `aura-2-dionisio-it` | `aura-2-elio-it` | `aura-2-flavio-it` | `aura-2-livia-it` | `aura-2-maia-it` | `aura-2-melia-it` | `aura-2-perseo-it` | `aura-2-ama-ja` | `aura-2-ebisu-ja` | `aura-2-fujin-ja` | `aura-2-izanami-ja` | `aura-2-uzume-ja` (default: `aura-asteria-en`) — AI model used to process submitted text
- `sample_rate` `8000` | `16000` | `24000` | `32000` | `48000` (default: `24000`) — Sample Rate specifies the sample rate for the output audio. Based on encoding 8000 or 24000 are possible defaults. For some encodings sample rate is not configurable.
- `speed` number (default: `1`) — Speaking rate multiplier that adjusts the pace of generated speech while preserving natural prosody and voice quality. Not yet supported in all languages.

#### Client → Server Messages

**SpeakV1Text** — Client messages

**SpeakV1Flush** — Client messages

**SpeakV1Clear** — Client messages

**SpeakV1Close** — Client messages

#### Server → Client Messages

**SpeakV1Audio** — Server messages

**SpeakV1Metadata** — Server messages

**SpeakV1Flushed** — Server messages

**SpeakV1Cleared** — Server messages

**SpeakV1Warning** — Server messages

### WebSocket `/v2/speak`
> Server: `wss://api.deepgram.com`

Streaming, turn-based text-to-speech (Flux TTS) built for voice-agent
pipelines. Stream LLM tokens in, speak them to the user, and report
per-turn billing and timing.


#### Connection Parameters

- `model` string — The Flux TTS model used to synthesize speech. Required on every connection. Model strings follow the format `flux-{voice}-{language}` (e.g. `flux-alexis-en`). An Aura model string is rejected on `/v2/speak`; use `/v1/speak` for Aura voices.
- `encoding` `linear16` | `mulaw` | `alaw` (default: `linear16`) — Encoding of the raw output audio. The streaming WebSocket emits raw (non-containerized) audio, so only streaming-compatible encodings are supported. Compressed and containerized encodings (`mp3`, `opus`, `flac`, `aac`) are available on the batch REST transport only.
- `sample_rate` `8000` | `16000` | `24000` | `32000` | `44100` | `48000` — Output sample rate in Hz. With `linear16`, valid values are `8000`, `16000`, `24000`, `32000`, `44100`, and `48000`. With `mulaw` or `alaw`, valid values are `8000` and `16000`. Defaults to the model's native sample rate.
- `speed` `0.85` | `0.90` | `0.95` | `1.00` | `1.05` | `1.10` | `1.15` (default: `1.00`) — Speech-rate multiplier. `1.00` is the model's nominal rate; lower is slower. Accepted values: `0.85`, `0.90`, `0.95`, `1.00`, `1.05`, `1.10`, `1.15`. A value outside that range is rejected with `SPEED_OUT_OF_RANGE`; a value inside it but off the `0.05` increment with `SPEED_INCREMENT_INVALID`. Models and languages without runtime speed control reject any value with `SPEED_NOT_SUPPORTED`.
- `expressivity` `-2` | `-1` | `0` | `1` | `2` — Expressive range of the generated speech, on a calm-to-animated axis. Accepted values: `-2`, `-1`, `0`, `1`, `2`. `0` (the default) is the voice's tuned delivery and the production-validated setting; negative values are calmer and more measured, positive values more animated. Supported on all Flux voices. Fixed for the connection — not settable via `Configure`. Beta: behavior may change in future model versions, and non-default values increase the risk of hallucinations and pronunciation errors; audition before shipping. An invalid value fails the connection with a `400` — `EXPRESSIVITY_OUT_OF_RANGE` for a value outside the range, `EXPRESSIVITY_INCREMENT_INVALID` for a fractional value. See [Expressivity](/docs/tts-expressivity).
- `mip_opt_out` any — Any type
- `tag` any — Any type

#### Client → Server Messages

**SpeakV2Speak** — Client messages

**SpeakV2Flush** — Client messages

**SpeakV2Interrupt** — Client messages

**SpeakV2Configure** — Client messages

**SpeakV2Close** — Client messages

#### Server → Client Messages

**SpeakV2Audio** — Server messages

**SpeakV2Connected** — Server messages

**SpeakV2SpeechStarted** — Server messages

**SpeakV2SpeechMetadata** — Server messages

**SpeakV2SpeechInterrupted** — Server messages

**SpeakV2Flushed** — Server messages

**SpeakV2SessionMetadata** — Server messages

**SpeakV2ConfigureSuccess** — Server messages

**SpeakV2ConfigureFailure** — Server messages

**SpeakV2Warning** — Server messages

**SpeakV2Error** — Server messages
