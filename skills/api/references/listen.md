# Deepgram Listen API

Speech-to-text transcription — convert audio and video into text.

## Documentation

- [Speech-to-Text Getting Started](https://developers.deepgram.com/docs/stt/getting-started)
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

### POST `/v1/listen`

Transcribe and analyze pre-recorded audio and video

Transcribe audio and video using Deepgram's speech-to-text REST API

#### Query Parameters

- `callback` string — URL to which we'll make the callback request
- `callback_method` `POST` | `PUT` (default: `POST`) — HTTP method by which the callback request will be made
- `extra` string | string[] — Arbitrary key-value pairs that are attached to the API response for usage in downstream processing
- `sentiment` boolean (default: `false`) — Recognizes the sentiment throughout a transcript or text
- `summarize` `v2` | boolean — Summarize content. For Listen API, supports string version option. For Read API, accepts boolean only.
- `tag` string | string[] — Label your requests for the purpose of identification during usage reporting
- `topics` boolean (default: `false`) — Detect topics throughout a transcript or text
- `custom_topic` string | string[] — Custom topics you want the model to detect within your input audio or text if present Submit up to `100`.
- `custom_topic_mode` `extended` | `strict` (default: `extended`) — Sets how the model will interpret strings submitted to the `custom_topic` param. When `strict`, the model will only return topics submitted using the `custom_topic` param. When `extended`, the model will return its own detected topics in addition to those submitted using the `custom_topic` param
- `intents` boolean (default: `false`) — Recognizes speaker intent throughout a transcript or text
- `custom_intent` string | string[] — Custom intents you want the model to detect within your input audio if present
- `custom_intent_mode` `extended` | `strict` (default: `extended`) — Sets how the model will interpret intents submitted to the `custom_intent` param. When `strict`, the model will only return intents submitted using the `custom_intent` param. When `extended`, the model will return its own detected intents in the `custom_intent` param.
- `detect_entities` boolean (default: `false`) — Identifies and extracts key entities from content in submitted audio
- `detect_language` boolean | string[] — Identifies the dominant language spoken in submitted audio
- `diarize` boolean (default: `false`) — Deprecated: use `diarize_model` instead. Recognize speaker changes. Each word in the transcript will be assigned a speaker number starting at 0.
- `diarize_model` `latest` | `v1` | `v2` — Select and enable a specific diarization model version. Specifying this parameter enables diarization and selects the model — you do not need to also set the deprecated `diarize=true` parameter. For batch, supported values are `latest` (currently v2), `v1`, and `v2`. For streaming, supported values are `latest` (currently v1) and `v1`; `v2` returns a validation error on streaming requests.
- `dictation` boolean (default: `false`) — Dictation mode for controlling formatting with dictated speech
- `encoding` `linear16` | `flac` | `mulaw` | `amr-nb` | `amr-wb` | `opus` | `speex` | `g729` — Specify the expected encoding of your submitted audio
- `filler_words` boolean (default: `false`) — Filler Words can help transcribe interruptions in your audio, like "uh" and "um"
- `keyterm` string[] — Key term prompting improves recognition of specialized terminology and brands. Only compatible with Nova-3.

`keyterm` accepts plain terms only. Unlike the legacy `keywords` feature, it does not support weights or intensifiers. Appending one (for example, `keyterm=term:0.15`) is not rejected—the weight is silently ignored and the entire value is treated as a literal keyterm.

To boost multiple separate keyterms, repeat the `keyterm` parameter (for example, `keyterm=term1&keyterm=term2`). To boost one multi-word phrase as a single keyterm, join the words with `%20` or `+` (for example, `keyterm=customer%20service`). Do not separate keyterms with commas, semicolons, or line breaks.

- `keywords` string | string[] — Keywords can boost or suppress specialized terminology and brands
- `language` string (default: `en`) — The [BCP-47 language tag](https://tools.ietf.org/html/bcp47) that hints at the primary spoken language. Depending on the Model and API endpoint you choose only certain languages are available
- `measurements` boolean (default: `false`) — Spoken measurements will be converted to their corresponding abbreviations
- `model` `nova-3` | `nova-3-general` | `nova-3-medical` | `nova-2` | `nova-2-general` | `nova-2-meeting` | `nova-2-finance` | `nova-2-conversationalai` | `nova-2-voicemail` | `nova-2-video` | `nova-2-medical` | `nova-2-drivethru` | `nova-2-automotive` | `nova` | `nova-general` | `nova-phonecall` | `nova-medical` | `enhanced` | `enhanced-general` | `enhanced-meeting` | `enhanced-phonecall` | `enhanced-finance` | `base` | `meeting` | `phonecall` | `finance` | `conversationalai` | `voicemail` | `video` | string — AI model used to process submitted audio
- `multichannel` boolean (default: `false`) — Transcribe each audio channel independently
- `numerals` boolean (default: `false`) — Numerals converts numbers from written format to numerical format
- `paragraphs` boolean (default: `false`) — Splits audio into paragraphs to improve transcript readability
- `profanity_filter` boolean (default: `false`) — Profanity Filter looks for recognized profanity and converts it to the nearest recognized non-profane word or removes it from the transcript completely
- `punctuate` boolean (default: `false`) — Add punctuation and capitalization to the transcript
- `redact` string | `pci` | `pii` | `numbers`[] — Redaction removes sensitive information from your transcripts
- `replace` string | string[] — Search for terms or phrases in submitted audio and replaces them
- `search` string | string[] — Search for terms or phrases in submitted audio
- `smart_format` boolean (default: `false`) — Apply formatting to transcript output. When set to true, additional formatting will be applied to transcripts to improve readability
- `utterances` boolean (default: `false`) — Segments speech into meaningful semantic units
- `utt_split` number (default: `0.8`) — Seconds to wait before detecting a pause between words in submitted audio
- `version` `latest` | string — Version of an AI model to use
- `mip_opt_out` boolean (default: `false`) — Opts out requests from the Deepgram Model Improvement Program. Refer to our Docs for pricing impacts before setting this to true. https://dpgr.am/deepgram-mip

#### Request Body

**application/json**

- `url` string **(required)**

#### Responses

**200**: Returns either transcription results, or a request_id when using a callback.
**400**: Invalid Request

## WebSocket API

### WebSocket `/v1/listen`
> Server: `wss://api.deepgram.com`

Transcribe audio and video using Deepgram's speech-to-text WebSocket

#### Connection Parameters

- `callback` any — Any type
- `callback_method` `POST` | `GET` | `PUT` | `DELETE` (default: `POST`) — HTTP method by which the callback request will be made
- `channels` any — Any type
- `detect_entities` `true` | `false` (default: `false`) — Identifies and extracts key entities from content in submitted audio. Entities appear in final results. When enabled, Punctuation will also be enabled by default
- `diarize` `true` | `false` (default: `false`) — Deprecated. Use `diarize_model` instead. Defaults to `false`. Recognize speaker changes. Each word in the transcript will be assigned a speaker number starting at 0
- `diarize_model` `latest` | `v1`
- `dictation` `true` | `false` (default: `false`) — Identify and extract key entities from content in submitted audio
- `encoding` `linear16` | `linear32` | `flac` | `alaw` | `mulaw` | `amr-nb` | `amr-wb` | `opus` | `ogg-opus` | `speex` | `g729` — Specify the expected encoding of your submitted audio
- `endpointing` any — Any type
- `extra` any — Any type
- `interim_results` `true` | `false` (default: `false`) — Specifies whether the streaming endpoint should provide ongoing transcription updates as more audio is received. When set to true, the endpoint sends continuous updates, meaning transcription results may evolve over time
- `keyterm` any — Any type
- `keywords` any — Any type
- `language` any — Any type
- `mip_opt_out` any — Any type
- `model` `nova-3` | `nova-3-general` | `nova-3-medical` | `nova-2` | `nova-2-general` | `nova-2-meeting` | `nova-2-finance` | `nova-2-conversationalai` | `nova-2-voicemail` | `nova-2-video` | `nova-2-medical` | `nova-2-drivethru` | `nova-2-automotive` | `nova` | `nova-general` | `nova-phonecall` | `nova-medical` | `enhanced` | `enhanced-general` | `enhanced-meeting` | `enhanced-phonecall` | `enhanced-finance` | `base` | `meeting` | `phonecall` | `finance` | `conversationalai` | `voicemail` | `video` | `custom` — AI model to use for the transcription
- `multichannel` `true` | `false` (default: `false`) — Transcribe each audio channel independently
- `numerals` `true` | `false` (default: `false`) — Convert numbers from written format to numerical format
- `profanity_filter` `true` | `false` (default: `false`) — Profanity Filter looks for recognized profanity and converts it to the nearest recognized non-profane word or removes it from the transcript completely
- `punctuate` `true` | `false` (default: `false`) — Add punctuation and capitalization to the transcript
- `redact` `true` | `false` | `pci` | `numbers` | `aggressive_numbers` | `ssn` (default: `false`) — Redaction removes sensitive information from your transcripts
- `replace` any — Any type
- `sample_rate` any — Any type
- `search` any — Any type
- `smart_format` `true` | `false` (default: `false`) — Apply formatting to transcript output. When set to true, additional formatting will be applied to transcripts to improve readability
- `tag` any — Any type
- `utterance_end_ms` any — Any type
- `vad_events` `true` | `false` (default: `false`) — Indicates that speech has started. You'll begin receiving Speech Started messages upon speech starting
- `version` any — Any type

#### Client → Server Messages

**ListenV1Media** — Client messages

**ListenV1Finalize** — Client messages

**ListenV1CloseStream** — Client messages

**ListenV1KeepAlive** — Client messages

#### Server → Client Messages

**ListenV1Results** — Server messages

**ListenV1Metadata** — Server messages

**ListenV1UtteranceEnd** — Server messages

**ListenV1SpeechStarted** — Server messages

### WebSocket `/v2/listen`
> Server: `wss://api.deepgram.com`

Real-time conversational speech recognition with contextual turn detection
for natural voice conversations


#### Connection Parameters

- `model` `flux-general-en` | `flux-general-multi` — Defines the AI model used to process submitted audio.
- `encoding` `linear16` | `linear32` | `mulaw` | `alaw` | `opus` | `ogg-opus` — Encoding of the audio stream. Required if sending non-containerized/raw audio. If sending containerized audio, this parameter should be omitted.
- `sample_rate` any — Any type
- `eager_eot_threshold` any — Any type
- `eot_threshold` any — Any type
- `eot_timeout_ms` any — Any type
- `keyterm` string | string[] — Keyterm prompting improves recognition of specialized terminology.

`keyterm` accepts plain terms only. Unlike the legacy `keywords` feature,
it does not support weights or intensifiers. Appending one
(for example, `keyterm=term:0.15`) is not rejected—the weight is
silently ignored and the entire value is treated as a literal keyterm.

To boost multiple separate keyterms, repeat the `keyterm` parameter
(for example, `keyterm=term1&keyterm=term2`). To boost one multi-word
phrase as a single keyterm, join the words with `%20` or `+`
(for example, `keyterm=customer%20service`). Do not separate keyterms
with commas, semicolons, or line breaks.

- `language_hint` string | string[] — Language hints constrain and prioritize language detection for the
flux-general-multi model. Pass multiple language_hint query parameters
to specify multiple language codes. Empty values are rejected.
Only valid when model is flux-general-multi.

- `profanity_filter` `true` | `false` (default: `false`) — Profanity Filter looks for recognized profanity and converts it to the nearest recognized non-profane word or removes it from the transcript completely.
- `numerals` `true` | `false` (default: `false`) — Numerals converts numbers from written format to numerical format
- `redact` `numbers` | `aggressive_numbers` — Redaction removes sensitive information from your transcripts. On Flux, only `numbers` and `aggressive_numbers` are supported.
- `mip_opt_out` any — Any type
- `tag` any — Any type

#### Client → Server Messages

**ListenV2Media** — Client messages

**ListenV2CloseStream** — Client messages

**ListenV2Configure** — Client messages

#### Server → Client Messages

**ListenV2Connected** — Server messages

**ListenV2TurnInfo** — Server messages

**ListenV2ConfigureSuccess** — Server messages

**ListenV2ConfigureFailure** — Server messages

**ListenV2FatalError** — Server messages
