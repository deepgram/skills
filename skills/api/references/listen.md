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
- `keywords` string | string[] — Keywords can boost or suppress specialized terminology and brands. `keywords` is not supported with Nova-3 models; use `keyterm` instead.
- `language` string (default: `en`) — The [BCP-47 language tag](https://tools.ietf.org/html/bcp47) that hints at the primary spoken language. Depending on the Model and API endpoint you choose only certain languages are available
- `measurements` boolean (default: `false`) — Spoken measurements will be converted to their corresponding abbreviations
- `model` `nova-3` | `nova-3-general` | `nova-3-medical` | `nova-2` | `nova-2-general` | `nova-2-meeting` | `nova-2-finance` | `nova-2-conversationalai` | `nova-2-voicemail` | `nova-2-video` | `nova-2-medical` | `nova-2-drivethru` | `nova-2-automotive` | `nova` | `nova-general` | `nova-phonecall` | `nova-medical` | `enhanced` | `enhanced-general` | `enhanced-meeting` | `enhanced-phonecall` | `enhanced-finance` | `base` | `meeting` | `phonecall` | `finance` | `conversationalai` | `voicemail` | `video` | string (default: `base-general`) — AI model used to process submitted audio
- `multichannel` boolean (default: `false`) — Transcribe each audio channel independently
- `numerals` boolean (default: `false`) — Numerals converts numbers from written format to numerical format
- `paragraphs` boolean (default: `false`) — Splits audio into paragraphs to improve transcript readability
- `profanity_filter` boolean (default: `false`) — Profanity Filter looks for recognized profanity and converts it to the nearest recognized non-profane word or removes it from the transcript completely
- `punctuate` boolean (default: `false`) — Add punctuation and capitalization to the transcript
- `redact` string | `pci` | `pii` | `numbers`[] (default: `false`) — Redaction removes sensitive information from your transcripts
- `replace` string | string[] — Search for terms or phrases in submitted audio and replaces them
- `search` string | string[] — Search for terms or phrases in submitted audio
- `smart_format` boolean (default: `false`) — Apply formatting to transcript output. When set to true, additional formatting will be applied to transcripts to improve readability
- `utterances` boolean (default: `false`) — Segments speech into meaningful semantic units
- `utt_split` number (default: `0.8`) — Seconds to wait before detecting a pause between words in submitted audio
- `version` `latest` | string (default: `latest`) — Version of an AI model to use
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

- `callback` string — URL to which we'll make the callback request
- `callback_method` `POST` | `GET` | `PUT` | `DELETE` (default: `POST`) — HTTP method by which the callback request will be made
- `channels` any (default: `1`) — Any type
- `detect_entities` `true` | `false` (default: `false`) — Identifies and extracts key entities from content in submitted audio. Entities appear in final results. When enabled, Punctuation will also be enabled by default
- `diarize` `true` | `false` (default: `false`) — Deprecated. Use `diarize_model` instead. Defaults to `false`. Recognize speaker changes. Each word in the transcript will be assigned a speaker number starting at 0
- `diarize_model` `latest` | `v1`
- `dictation` `true` | `false` (default: `false`) — Identify and extract key entities from content in submitted audio
- `encoding` `linear16` | `linear32` | `flac` | `alaw` | `mulaw` | `amr-nb` | `amr-wb` | `opus` | `ogg-opus` | `speex` | `g729` — Specify the expected encoding of your submitted audio
- `endpointing` any (default: `10`) — Any type
- `extra` string | string[] — Arbitrary key-value pairs that are attached to the API response for usage in downstream processing
- `interim_results` `true` | `false` (default: `false`) — Specifies whether the streaming endpoint should provide ongoing transcription updates as more audio is received. When set to true, the endpoint sends continuous updates, meaning transcription results may evolve over time
- `keyterm` string[] — Key term prompting improves recognition of specialized terminology and brands. Only compatible with Nova-3.

  `keyterm` accepts plain terms only. Unlike the legacy `keywords` feature, it does not support weights or intensifiers. Appending one (for example, `keyterm=term:0.15`) is not rejected—the weight is silently ignored and the entire value is treated as a literal keyterm.

  To boost multiple separate keyterms, repeat the `keyterm` parameter (for example, `keyterm=term1&keyterm=term2`). To boost one multi-word phrase as a single keyterm, join the words with `%20` or `+` (for example, `keyterm=customer%20service`). Do not separate keyterms with commas, semicolons, or line breaks.
- `keywords` string | string[] — Keywords can boost or suppress specialized terminology and brands. `keywords` is not supported with Nova-3 models; use `keyterm` instead.
- `language` string (default: `en`) — The [BCP-47 language tag](https://tools.ietf.org/html/bcp47) that hints at the primary spoken language. Depending on the Model and API endpoint you choose only certain languages are available
- `mip_opt_out` boolean (default: `false`) — Opts out requests from the Deepgram Model Improvement Program. Refer to our Docs for pricing impacts before setting this to true. https://dpgr.am/deepgram-mip
- `model` `nova-3` | `nova-3-general` | `nova-3-medical` | `nova-2` | `nova-2-general` | `nova-2-meeting` | `nova-2-finance` | `nova-2-conversationalai` | `nova-2-voicemail` | `nova-2-video` | `nova-2-medical` | `nova-2-drivethru` | `nova-2-automotive` | `nova` | `nova-general` | `nova-phonecall` | `nova-medical` | `enhanced` | `enhanced-general` | `enhanced-meeting` | `enhanced-phonecall` | `enhanced-finance` | `base` | `meeting` | `phonecall` | `finance` | `conversationalai` | `voicemail` | `video` | `custom` — AI model to use for the transcription
- `multichannel` `true` | `false` (default: `false`) — Transcribe each audio channel independently
- `numerals` `true` | `false` (default: `false`) — Convert numbers from written format to numerical format
- `profanity_filter` `true` | `false` (default: `false`) — Profanity Filter looks for recognized profanity and converts it to the nearest recognized non-profane word or removes it from the transcript completely
- `punctuate` `true` | `false` (default: `false`) — Add punctuation and capitalization to the transcript
- `redact` `true` | `false` | `pci` | `numbers` | `aggressive_numbers` | `ssn` (default: `false`) — Redaction removes sensitive information from your transcripts
- `replace` string | string[] — Search for terms or phrases in submitted audio and replaces them
- `sample_rate` any — Any type
- `search` string | string[] — Search for terms or phrases in submitted audio
- `smart_format` `true` | `false` (default: `false`) — Apply formatting to transcript output. When set to true, additional formatting will be applied to transcripts to improve readability
- `tag` string | string[] — Label your requests for the purpose of identification during usage reporting
- `utterance_end_ms` any — Any type
- `vad_events` `true` | `false` (default: `false`) — Indicates that speech has started. You'll begin receiving Speech Started messages upon speech starting
- `version` `latest` | string (default: `latest`) — Version of an AI model to use

#### Client → Server Messages

**ListenV1Media** — Send audio or video data to be transcribed

**ListenV1Finalize** — Send a Finalize message to flush the WebSocket stream

  - `type` `Finalize` | `CloseStream` | `KeepAlive` **(required)** — Message type identifier

**ListenV1CloseStream** — Send a CloseStream message to close the WebSocket stream

  - `type` `Finalize` | `CloseStream` | `KeepAlive` **(required)** — Message type identifier

**ListenV1KeepAlive** — Send a KeepAlive message to keep the WebSocket stream alive

  - `type` `Finalize` | `CloseStream` | `KeepAlive` **(required)** — Message type identifier

#### Server → Client Messages

**ListenV1Results** — Receive transcription results

  - `type` `Results` **(required)** — Message type identifier
  - `channel_index` integer[] **(required)** — The index of the channel
  - `duration` number **(required)** — The duration of the transcription
  - `start` number **(required)** — The start time of the transcription
  - `is_final` boolean — Whether the transcription is final
  - `speech_final` boolean — Whether the transcription is speech final
  - `channel` { alternatives: { transcript: string, confidence: number, languages: string[], words: object[] }[] } **(required)**
  - `metadata` { request_id: string, model_info: { name: string, version: string, arch: string }, model_uuid: string, diarize_info: { model_uuid: string, arch: string } } **(required)**
  - `from_finalize` boolean — Whether the transcription is from a finalize message
  - `entities` { label: string, value: string, raw_value: string, confidence: number, start_word: integer, end_word: integer }[] — Extracted entities from the audio when detect_entities is enabled. Only present in is_final messages. Returns an empty array if no entities are detected

**ListenV1Metadata** — Receive metadata about the transcription

  - `type` `Metadata` **(required)** — Message type identifier
  - `transaction_key` string **(required)** — The transaction key
  - `request_id` string **(required)** — The request ID
  - `sha256` string **(required)** — The sha256
  - `created` string **(required)** — The created
  - `duration` number **(required)** — The duration
  - `channels` integer **(required)** — The channels

**ListenV1UtteranceEnd** — Receive an utterance end event

  - `type` `UtteranceEnd` **(required)** — Message type identifier
  - `channel` integer[] **(required)** — The channel
  - `last_word_end` number **(required)** — The last word end

**ListenV1SpeechStarted** — Receive a speech started event

  - `type` `SpeechStarted` **(required)** — Message type identifier
  - `channel` integer[] **(required)** — The channel
  - `timestamp` number **(required)** — The timestamp

### WebSocket `/v2/listen`
> Server: `wss://api.deepgram.com`

Real-time conversational speech recognition with contextual turn detection
for natural voice conversations


#### Connection Parameters

- `model` `flux-general-en` | `flux-general-multi` — Defines the AI model used to process submitted audio.
- `encoding` `linear16` | `linear32` | `mulaw` | `alaw` | `opus` | `ogg-opus` — Encoding of the audio stream. Required if sending non-containerized/raw audio. If sending containerized audio, this parameter should be omitted.
- `sample_rate` any — Any type
- `eager_eot_threshold` number — End-of-turn confidence required to fire an eager end-of-turn event. When set, enables EagerEndOfTurn and TurnResumed events. Valid range: 0.3 - 0.9.
- `eot_threshold` number (default: `0.7`) — End-of-turn confidence required to finish a turn. Valid range: 0.5 - 1.0. Defaults to 0.7. Set to 1.0 to fully suppress confidence-based end-of-turn detection. `eot_timeout_ms` still ends idle turns; increase it when using ForceEndTurn for full manual turn control.
- `eot_timeout_ms` integer (default: `5000`) — A turn will be finished when this much time in milliseconds has passed after speech, regardless of EOT confidence. Defaults to 5000.
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

**ListenV2Media** — Send audio or video data to be transcribed

**ListenV2CloseStream** — Send a CloseStream message to close the WebSocket stream

  - `type` `CloseStream` **(required)** — Message type identifier

**ListenV2ForceEndTurn** — Send a ForceEndTurn message to immediately end the current turn

  - `type` `ForceEndTurn` **(required)** — Message type identifier

**ListenV2Configure** — Send a Configure message to update Flux settings

  - `type` `Configure` **(required)** — Message type identifier
  - `thresholds` { eager_eot_threshold: any, eot_threshold: any, eot_timeout_ms: any } — Updates each parameter, if it is supplied. If a particular threshold parameter
    is not supplied, the configuration continues using the currently configured value.
  - `keyterms` string | string[] — Keyterm prompting improves recognition of specialized terminology.

    `keyterm` accepts plain terms only. Unlike the legacy `keywords` feature,
    it does not support weights or intensifiers. Appending one
    (for example, `keyterm=term:0.15`) is not rejected—the weight is
    silently ignored and the entire value is treated as a literal keyterm.

    To boost multiple separate keyterms, repeat the `keyterm` parameter
    (for example, `keyterm=term1&keyterm=term2`). To boost one multi-word
    phrase as a single keyterm, join the words with `%20` or `+`
    (for example, `keyterm=customer%20service`). Do not separate keyterms
    with commas, semicolons, or line breaks.
  - `language_hints` string[] — Language hints to constrain and prioritize language detection.
    Only valid when the model is flux-general-multi. If this field is not supplied,
    the session will continue to use the currently configured value.
  - `numerals` boolean (default: `false`) — Numerals converts numbers from written format to numerical format. Applies to turns transcribed after the update.

#### Server → Client Messages

**ListenV2Connected** — Receive a connected message

  - `type` `Connected` **(required)** — Message type identifier
  - `request_id` string **(required)** — The unique identifier of the request
  - `sequence_id` integer **(required)** — Starts at `0` and increments for each message the server sends
    to the client.  This includes messages of other types, like
    `TurnInfo` messages.

**ListenV2TurnInfo** — Receive a turn info message

  - `type` `TurnInfo` **(required)**
  - `request_id` string **(required)** — The unique identifier of the request
  - `sequence_id` integer **(required)** — Starts at `0` and increments for each message the server sends to the client.  This includes messages of other types, like `Connected` messages.
  - `event` `Update` | `StartOfTurn` | `EagerEndOfTurn` | `TurnResumed` | `EndOfTurn` **(required)** — The type of event being reported.

    - **Update** - Additional audio has been transcribed, but the turn state hasn't changed
    - **StartOfTurn** - The user has begun speaking for the first time in the turn
    - **EagerEndOfTurn** - The system has moderate confidence that the user has finished speaking for the turn. This is an opportunity to begin preparing an agent reply
    - **TurnResumed** - The system detected that speech had ended and therefore sent an **EagerEndOfTurn** event, but speech is actually continuing for this turn
    - **EndOfTurn** - The user has finished speaking for the turn
  - `turn_index` integer **(required)** — The index of the current turn
  - `audio_window_start` string **(required)** — Start time in seconds of the audio range that was transcribed
  - `audio_window_end` string **(required)** — End time in seconds of the audio range that was transcribed
  - `transcript` string **(required)** — Text that was said over the course of the current turn
  - `words` { word: string, confidence: string, start: number, end: number }[] **(required)** — The words in the `transcript`
  - `end_of_turn_confidence` string **(required)** — Confidence that no more speech is coming in this turn
  - `trigger` string — The cause of the turn ending. Present on every `EndOfTurn` event and only there.

    - **model** - the turn ended by Flux's native end-of-turn detection

    - **manual** - the turn ended because a `ForceEndTurn` message was sent

    - **timeout** - the turn ended because `eot_timeout_ms` elapsed

    This is an open enum. New values may be added over time, so clients must tolerate values they do not recognize.
  - `languages` string[] — Detected languages sorted by descending frequency in the
    transcript. Only present when the flux-general-multi model
    detects languages in the audio.
  - `languages_hinted` string[] — The language hints that were supplied for this turn. Only
    present when language hints are configured.

**ListenV2ConfigureSuccess** — Sent when a `Configure` message was successfully applied. Returns the current, up-to-date values that were applied.

  - `type` `ConfigureSuccess` **(required)** — Message type identifier
  - `request_id` string **(required)** — The unique identifier of the request
  - `thresholds` { eager_eot_threshold: any, eot_threshold: any, eot_timeout_ms: any } **(required)** — Updates each parameter, if it is supplied. If a particular threshold parameter
    is not supplied, the configuration continues using the currently configured value.
  - `keyterms` string | string[] **(required)** — Keyterm prompting improves recognition of specialized terminology.

    `keyterm` accepts plain terms only. Unlike the legacy `keywords` feature,
    it does not support weights or intensifiers. Appending one
    (for example, `keyterm=term:0.15`) is not rejected—the weight is
    silently ignored and the entire value is treated as a literal keyterm.

    To boost multiple separate keyterms, repeat the `keyterm` parameter
    (for example, `keyterm=term1&keyterm=term2`). To boost one multi-word
    phrase as a single keyterm, join the words with `%20` or `+`
    (for example, `keyterm=customer%20service`). Do not separate keyterms
    with commas, semicolons, or line breaks.
  - `language_hints` string[] — The currently active language hints. Only applicable to the flux-general-multi model.
  - `sequence_id` integer **(required)** — Starts at `0` and increments for each message the server sends
    to the client.  This includes messages of other types, like
    `TurnInfo` messages.

**ListenV2ConfigureFailure** — Indicates that a Configure message was rejected

  - `type` `ConfigureFailure` **(required)** — Message type identifier
  - `request_id` string **(required)** — The unique identifier of the request
  - `sequence_id` integer **(required)** — Starts at `0` and increments for each message the server sends
    to the client.  This includes messages of other types, like
    `TurnInfo` messages.

**ListenV2FatalError** — Receive a fatal error message

  - `type` `Error` **(required)** — Message type identifier
  - `sequence_id` integer **(required)** — Starts at `0` and increments for each message the server sends
    to the client.  This includes messages of other types, like
    `Connected` messages.
  - `code` string **(required)** — A string code describing the error, e.g. `INTERNAL_SERVER_ERROR`
  - `description` string **(required)** — Prose description of the error
