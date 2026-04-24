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
- `model` `aura-asteria-en` | `aura-luna-en` | `aura-stella-en` | `aura-athena-en` | `aura-hera-en` | `aura-orion-en` | `aura-arcas-en` | `aura-perseus-en` | `aura-angus-en` | `aura-orpheus-en` | `aura-helios-en` | `aura-zeus-en` | `aura-2-amalthea-en` | `aura-2-andromeda-en` | `aura-2-apollo-en` | `aura-2-arcas-en` | `aura-2-aries-en` | `aura-2-asteria-en` | `aura-2-athena-en` | `aura-2-atlas-en` | `aura-2-aurora-en` | `aura-2-callista-en` | `aura-2-cordelia-en` | `aura-2-cora-en` | `aura-2-delia-en` | `aura-2-draco-en` | `aura-2-electra-en` | `aura-2-harmonia-en` | `aura-2-helena-en` | `aura-2-hera-en` | `aura-2-hermes-en` | `aura-2-hyperion-en` | `aura-2-iris-en` | `aura-2-janus-en` | `aura-2-juno-en` | `aura-2-jupiter-en` | `aura-2-luna-en` | `aura-2-mars-en` | `aura-2-minerva-en` | `aura-2-neptune-en` | `aura-2-odysseus-en` | `aura-2-ophelia-en` | `aura-2-orion-en` | `aura-2-orpheus-en` | `aura-2-pandora-en` | `aura-2-phoebe-en` | `aura-2-pluto-en` | `aura-2-saturn-en` | `aura-2-selene-en` | `aura-2-thalia-en` | `aura-2-theia-en` | `aura-2-vesta-en` | `aura-2-zeus-en` | `aura-2-sirio-es` | `aura-2-nestor-es` | `aura-2-carina-es` | `aura-2-celeste-es` | `aura-2-alvaro-es` | `aura-2-diana-es` | `aura-2-aquila-es` | `aura-2-selena-es` | `aura-2-estrella-es` | `aura-2-javier-es` (default: `aura-asteria-en`) — AI model used to process submitted text
- `sample_rate` `8000` | `16000` | `24000` | `32000` | `48000` | `8000` | `16000` | `8000` | `16000` | `22050` | `48000` — Sample Rate specifies the sample rate for the output audio. Based on the encoding, different sample rates are supported. For some encodings, the sample rate is not configurable
- `speed` number (default: `1`) — Speaking rate multiplier that adjusts the pace of generated speech while preserving natural prosody and voice quality. Not yet supported in all languages.

#### Request Body

**application/json**

- `text` string **(required)** — The text content to be converted to speech

#### Responses

**200**: Successful text-to-speech transformation
**400**: Invalid Request

## WebSocket API

### WebSocket `/v1/speak`
> Server: `wss://api.deepgram.com`

Convert text into natural-sounding speech using Deepgram's TTS WebSocket

#### Connection Parameters

- `encoding` `linear16` | `mulaw` | `alaw` (default: `linear16`) — Encoding allows you to specify the expected encoding of your audio output for streaming TTS. Only streaming-compatible encodings are supported.
- `mip_opt_out` any — Any type
- `model` `aura-asteria-en` | `aura-luna-en` | `aura-stella-en` | `aura-athena-en` | `aura-hera-en` | `aura-orion-en` | `aura-arcas-en` | `aura-perseus-en` | `aura-angus-en` | `aura-orpheus-en` | `aura-helios-en` | `aura-zeus-en` | `aura-2-amalthea-en` | `aura-2-andromeda-en` | `aura-2-apollo-en` | `aura-2-arcas-en` | `aura-2-aries-en` | `aura-2-asteria-en` | `aura-2-athena-en` | `aura-2-atlas-en` | `aura-2-aurora-en` | `aura-2-callista-en` | `aura-2-cordelia-en` | `aura-2-cora-en` | `aura-2-delia-en` | `aura-2-draco-en` | `aura-2-electra-en` | `aura-2-harmonia-en` | `aura-2-helena-en` | `aura-2-hera-en` | `aura-2-hermes-en` | `aura-2-hyperion-en` | `aura-2-iris-en` | `aura-2-janus-en` | `aura-2-juno-en` | `aura-2-jupiter-en` | `aura-2-luna-en` | `aura-2-mars-en` | `aura-2-minerva-en` | `aura-2-neptune-en` | `aura-2-odysseus-en` | `aura-2-ophelia-en` | `aura-2-orion-en` | `aura-2-orpheus-en` | `aura-2-pandora-en` | `aura-2-phoebe-en` | `aura-2-pluto-en` | `aura-2-saturn-en` | `aura-2-selene-en` | `aura-2-thalia-en` | `aura-2-theia-en` | `aura-2-vesta-en` | `aura-2-zeus-en` | `aura-2-sirio-es` | `aura-2-nestor-es` | `aura-2-carina-es` | `aura-2-celeste-es` | `aura-2-alvaro-es` | `aura-2-diana-es` | `aura-2-aquila-es` | `aura-2-selena-es` | `aura-2-estrella-es` | `aura-2-javier-es` (default: `aura-asteria-en`) — AI model used to process submitted text
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
