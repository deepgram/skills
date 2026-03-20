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
> Server: `https://api.deepgram.com`

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
- `diarize` boolean (default: `false`) — Recognize speaker changes. Each word in the transcript will be assigned a speaker number starting at 0
- `dictation` boolean (default: `false`) — Dictation mode for controlling formatting with dictated speech
- `encoding` `linear16` | `flac` | `mulaw` | `amr-nb` | `amr-wb` | `opus` | `speex` | `g729` — Specify the expected encoding of your submitted audio
- `filler_words` boolean (default: `false`) — Filler Words can help transcribe interruptions in your audio, like "uh" and "um"
- `keyterm` string[] — Key term prompting can boost or suppress specialized terminology and brands. Only compatible with Nova-3
- `keywords` string | string[] — Keywords can boost or suppress specialized terminology and brands
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

**application/octet-stream**

#### Responses

**200**: Returns either transcription results, or a request_id when using a callback.
**400**: Invalid Request

## WebSocket API

### WebSocket `/v1/listen`
> Server: `wss://api.deepgram.com`

Transcribe audio and video using Deepgram's speech-to-text WebSocket

#### Connection Parameters

- `callback` any — URL to which we'll make the callback request
- `callback_method` `POST` | `GET` | `PUT` | `DELETE` (default: `POST`) — HTTP method by which the callback request will be made
- `channels` any (default: `1`) — The number of channels in the submitted audio
- `detect_entities` `true` | `false` (default: `false`) — Identifies and extracts key entities from content in submitted audio. Entities appear in final results. When enabled, Punctuation will also be enabled by default
- `diarize` `true` | `false` (default: `false`) — Defaults to `false`. Recognize speaker changes. Each word in the transcript will be assigned a speaker number starting at 0
- `dictation` `true` | `false` (default: `false`) — Identify and extract key entities from content in submitted audio
- `encoding` `linear16` | `linear32` | `flac` | `alaw` | `mulaw` | `amr-nb` | `amr-wb` | `opus` | `ogg-opus` | `speex` | `g729` — Specify the expected encoding of your submitted audio
- `endpointing` any (default: `10`) — Indicates how long Deepgram will wait to detect whether a speaker has finished speaking or pauses for a significant period of time. When set to a value, the streaming endpoint immediately finalizes the transcription for the processed time range and returns the transcript with a speech_final parameter set to true. Can also be set to false to disable endpointing
- `extra` any — Arbitrary key-value pairs that are attached to the API response for usage in downstream processing
- `interim_results` `true` | `false` (default: `false`) — Specifies whether the streaming endpoint should provide ongoing transcription updates as more audio is received. When set to true, the endpoint sends continuous updates, meaning transcription results may evolve over time
- `keyterm` any — Key term prompting can boost specialized terminology and brands. Only compatible with Nova-3
- `keywords` any — Keywords can boost or suppress specialized terminology and brands
- `language` any (default: `en`) — The [BCP-47 language tag](https://tools.ietf.org/html/bcp47) that hints at the primary spoken language. Depending on the Model you choose only certain languages are available
- `mip_opt_out` any (default: `false`) — Opts out requests from the Deepgram Model Improvement Program. Refer to our Docs for pricing impacts before setting this to true. https://dpgr.am/deepgram-mip
- `model` `nova-3` | `nova-3-general` | `nova-3-medical` | `nova-2` | `nova-2-general` | `nova-2-meeting` | `nova-2-finance` | `nova-2-conversationalai` | `nova-2-voicemail` | `nova-2-video` | `nova-2-medical` | `nova-2-drivethru` | `nova-2-automotive` | `nova` | `nova-general` | `nova-phonecall` | `nova-medical` | `enhanced` | `enhanced-general` | `enhanced-meeting` | `enhanced-phonecall` | `enhanced-finance` | `base` | `meeting` | `phonecall` | `finance` | `conversationalai` | `voicemail` | `video` | `custom` — AI model to use for the transcription
- `multichannel` `true` | `false` (default: `false`) — Transcribe each audio channel independently
- `numerals` `true` | `false` (default: `false`) — Convert numbers from written format to numerical format
- `profanity_filter` `true` | `false` (default: `false`) — Profanity Filter looks for recognized profanity and converts it to the nearest recognized non-profane word or removes it from the transcript completely
- `punctuate` `true` | `false` (default: `false`) — Add punctuation and capitalization to the transcript
- `redact` `true` | `false` | `pci` | `numbers` | `aggressive_numbers` | `ssn` (default: `false`) — Redaction removes sensitive information from your transcripts
- `replace` any — Search for terms or phrases in submitted audio and replaces them
- `sample_rate` any — Sample rate of submitted audio. Required (and only read) when a value is provided for encoding
- `search` any — Search for terms or phrases in submitted audio
- `smart_format` `true` | `false` (default: `false`) — Apply formatting to transcript output. When set to true, additional formatting will be applied to transcripts to improve readability
- `tag` any — Label your requests for the purpose of identification during usage reporting
- `utterance_end_ms` any — Indicates how long Deepgram will wait to send an UtteranceEnd message after a word has been transcribed. Use with interim_results
- `vad_events` `true` | `false` (default: `false`) — Indicates that speech has started. You'll begin receiving Speech Started messages upon speech starting
- `version` any (default: `latest`) — Version of an AI model to use

#### Client → Server Messages

**ListenV1MediaMessage** — Send audio or video data to be transcribed

**ListenV1ControlMessage** — Send a Finalize message to flush the WebSocket stream

  - `type` `Finalize` | `CloseStream` | `KeepAlive` **(required)** — Message type identifier

**ListenV1ControlMessage** — Send a CloseStream message to close the WebSocket stream

  - `type` `Finalize` | `CloseStream` | `KeepAlive` **(required)** — Message type identifier

**ListenV1ControlMessage** — Send a KeepAlive message to keep the WebSocket stream alive

  - `type` `Finalize` | `CloseStream` | `KeepAlive` **(required)** — Message type identifier

#### Server → Client Messages

**ListenV1ResultsEvent** — Receive transcription results

  - `type` `Results` **(required)** — Message type identifier
  - `channel_index` number[] **(required)** — The index of the channel
  - `duration` number **(required)** — The duration of the transcription
  - `start` number **(required)** — The start time of the transcription
  - `is_final` boolean — Whether the transcription is final
  - `speech_final` boolean — Whether the transcription is speech final
  - `channel` { alternatives: { transcript: string, confidence: number, languages: string[], words: object[] }[] } **(required)**
  - `metadata` { request_id: string, model_info: { name: string, version: string, arch: string }, model_uuid: string } **(required)**
  - `from_finalize` boolean — Whether the transcription is from a finalize message
  - `entities` { label: string, value: string, raw_value: string, confidence: number, start_word: integer, end_word: integer }[] — Extracted entities from the audio when detect_entities is enabled. Only present in is_final messages. Returns an empty array if no entities are detected

**ListenV1MetadataEvent** — Receive metadata about the transcription

  - `type` `Metadata` **(required)** — Message type identifier
  - `transaction_key` string **(required)** — The transaction key
  - `request_id` string **(required)** — The request ID
  - `sha256` string **(required)** — The sha256
  - `created` string **(required)** — The created
  - `duration` number **(required)** — The duration
  - `channels` number **(required)** — The channels

**ListenV1UtteranceEndEvent** — Receive an utterance end event

  - `type` `UtteranceEnd` **(required)** — Message type identifier
  - `channel` number[] **(required)** — The channel
  - `last_word_end` number **(required)** — The last word end

**ListenV1SpeechStartedEvent** — Receive a speech started event

  - `type` `SpeechStarted` **(required)** — Message type identifier
  - `channel` number[] **(required)** — The channel
  - `timestamp` number **(required)** — The timestamp

### WebSocket `/v2/listen`
> Server: `wss://api.deepgram.com`

Real-time conversational speech recognition with contextual turn detection
for natural voice conversations


#### Connection Parameters

- `model` `flux-general-en` **(required)** — Defines the AI model used to process submitted audio.
- `encoding` `linear16` | `linear32` | `mulaw` | `alaw` | `opus` | `ogg-opus` — Encoding of the audio stream. Required if sending non-containerized/raw audio. If sending containerized audio, this parameter should be omitted.
- `sample_rate` any — Sample rate of the audio stream in Hz. Required if sending non-containerized/raw audio. If sending containerized audio, this parameter should be omitted.
- `eager_eot_threshold` any — End-of-turn confidence required to fire an eager end-of-turn event.
When set, enables `EagerEndOfTurn` and `TurnResumed` events. Valid
Values 0.3 - 0.9.

- `eot_threshold` any (default: `0.7`) — End-of-turn confidence required to finish a turn. Valid Values 0.5 -
0.9.

- `eot_timeout_ms` any (default: `5000`) — A turn will be finished when this much time has passed after speech,
regardless of EOT confidence.

- `keyterm` string | string[] — Keyterm prompting can improve recognition of specialized terminology.
Pass multiple keyterm query parameters to boost multiple keyterms.

- `mip_opt_out` any — Opts out requests from the Deepgram Model Improvement Program. Refer
to our Docs for pricing impacts before setting this to true.
https://dpgr.am/deepgram-mip

- `tag` any — Label your requests for the purpose of identification during usage
reporting


#### Client → Server Messages

**ListenV2MediaMessage** — Send audio or video data to be transcribed

**ListenV2ControlMessage** — Send a CloseStream message to close the WebSocket stream

  - `type` `Finalize` | `CloseStream` | `KeepAlive` **(required)** — Message type identifier

#### Server → Client Messages

**ListenV2ConnectedEvent** — Receive a connected message

  - `type` `Connected` **(required)** — Message type identifier
  - `request_id` string **(required)** — The unique identifier of the request
  - `sequence_id` number **(required)** — Starts at `0` and increments for each message the server sends
to the client.  This includes messages of other types, like
`TurnInfo` messages.


**ListenV2TurnInfo** — Receive a turn info message

  - `type` `TurnInfo` **(required)**
  - `request_id` string **(required)** — The unique identifier of the request
  - `sequence_id` number **(required)** — Starts at `0` and increments for each message the server sends to the client.  This includes messages of other types, like `Connected` messages.

  - `event` `Update` | `StartOfTurn` | `EagerEndOfTurn` | `TurnResumed` | `EndOfTurn` **(required)** — The type of event being reported.

- **Update** - Additional audio has been transcribed, but the turn state hasn't changed
- **StartOfTurn** - The user has begun speaking for the first time in the turn
- **EagerEndOfTurn** - The system has moderate confidence that the user has finished speaking for the turn. This is an opportunity to begin preparing an agent reply
- **TurnResumed** - The system detected that speech had ended and therefore sent an **EagerEndOfTurn** event, but speech is actually continuing for this turn
- **EndOfTurn** - The user has finished speaking for the turn

  - `turn_index` number **(required)** — The index of the current turn
  - `audio_window_start` number **(required)** — Start time in seconds of the audio range that was transcribed
  - `audio_window_end` number **(required)** — End time in seconds of the audio range that was transcribed
  - `transcript` string **(required)** — Text that was said over the course of the current turn
  - `words` { word: string, confidence: number }[] **(required)** — The words in the `transcript`
  - `end_of_turn_confidence` number **(required)** — Confidence that no more speech is coming in this turn

**ListenV2FatalErrorEvent** — Receive a fatal error message

  - `type` `Error` **(required)** — Message type identifier
  - `sequence_id` number **(required)** — Starts at `0` and increments for each message the server sends
to the client.  This includes messages of other types, like
`Connected` messages.

  - `code` string **(required)** — A string code describing the error, e.g. `INTERNAL_SERVER_ERROR`
  - `description` string **(required)** — Prose description of the error
