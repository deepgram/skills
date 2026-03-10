# Deepgram Agent API

Voice Agent — build conversational voice agents.

## Documentation

- [Voice Agent Docs](https://developers.deepgram.com/docs/voice-agent)
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

### GET `/v1/agent/settings/think/models`
> Server: `https://agent.deepgram.com`

List Agent Think Models

Retrieves the available think models that can be used for AI agent processing

#### Responses

**200**: List of available think models
**400**: Invalid Request

## WebSocket API

### WebSocket `/v1/agent/converse`
> Server: `wss://agent.deepgram.com`

Build a conversational voice agent using Deepgram's Voice Agent WebSocket

#### Client → Server Messages

**AgentV1SettingsMessage** — Send settings configuration to Deepgram's Voice Agent API

  - `type` `Settings` **(required)**
  - `tags` string[] — Tags to associate with the request
  - `experimental` boolean (default: `false`) — To enable experimental features
  - `flags` { history: boolean }
  - `mip_opt_out` boolean (default: `false`) — To opt out of Deepgram Model Improvement Program
  - `audio` { input: { encoding: `linear16` | `linear32` | `flac` | `alaw` | `mulaw` | `amr-nb` | `amr-wb` | `opus` | `ogg-opus` | `speex` | `g729`, sample_rate: number }, output: { encoding: `linear16` | `mulaw` | `alaw`, sample_rate: number, bitrate: number, container: string } } **(required)**
  - `agent` { language: string, context: { messages: object | object[] }, listen: { provider: object | object }, think: { provider: object | object | object | object | object, endpoint: object, functions: object[], prompt: string, context_length: `max` | number } | { provider: object | object | object | object | object, endpoint: object, functions: object[], prompt: string, context_length: `max` | number }[], speak: { provider: object | object | object | object | object, endpoint: object } | { provider: object | object | object | object | object, endpoint: object }[], greeting: string } **(required)**

**AgentV1UpdateSpeak** — Send update speak to Deepgram's Voice Agent API

  - `type` `UpdateSpeak` **(required)** — Message type identifier for updating the speak model
  - `speak` { provider: { type: `deepgram`, version: `v1`, model: `aura-asteria-en` | `aura-luna-en` | `aura-stella-en` | `aura-athena-en` | `aura-hera-en` | `aura-orion-en` | `aura-arcas-en` | `aura-perseus-en` | `aura-angus-en` | `aura-orpheus-en` | `aura-helios-en` | `aura-zeus-en` | `aura-2-amalthea-en` | `aura-2-andromeda-en` | `aura-2-apollo-en` | `aura-2-arcas-en` | `aura-2-aries-en` | `aura-2-asteria-en` | `aura-2-athena-en` | `aura-2-atlas-en` | `aura-2-aurora-en` | `aura-2-callista-en` | `aura-2-cora-en` | `aura-2-cordelia-en` | `aura-2-delia-en` | `aura-2-draco-en` | `aura-2-electra-en` | `aura-2-harmonia-en` | `aura-2-helena-en` | `aura-2-hera-en` | `aura-2-hermes-en` | `aura-2-hyperion-en` | `aura-2-iris-en` | `aura-2-janus-en` | `aura-2-juno-en` | `aura-2-jupiter-en` | `aura-2-luna-en` | `aura-2-mars-en` | `aura-2-minerva-en` | `aura-2-neptune-en` | `aura-2-odysseus-en` | `aura-2-ophelia-en` | `aura-2-orion-en` | `aura-2-orpheus-en` | `aura-2-pandora-en` | `aura-2-phoebe-en` | `aura-2-pluto-en` | `aura-2-saturn-en` | `aura-2-selene-en` | `aura-2-thalia-en` | `aura-2-theia-en` | `aura-2-vesta-en` | `aura-2-zeus-en` | `aura-2-sirio-es` | `aura-2-nestor-es` | `aura-2-carina-es` | `aura-2-celeste-es` | `aura-2-alvaro-es` | `aura-2-diana-es` | `aura-2-aquila-es` | `aura-2-selena-es` | `aura-2-estrella-es` | `aura-2-javier-es` } | { type: `eleven_labs`, version: `v1`, model_id: `eleven_turbo_v2_5` | `eleven_monolingual_v1` | `eleven_multilingual_v2`, language: string, language_code: string } | { type: `cartesia`, version: `2025-03-17`, model_id: `sonic-2` | `sonic-multilingual`, voice: object, language: string } | { type: `open_ai`, version: `v1`, model: `tts-1` | `tts-1-hd`, voice: `alloy` | `echo` | `fable` | `onyx` | `nova` | `shimmer` } | { type: `aws_polly`, voice: `Matthew` | `Joanna` | `Amy` | `Emma` | `Brian` | `Arthur` | `Aria` | `Ayanda`, language: string, language_code: string, engine: `generative` | `long-form` | `standard` | `neural`, credentials: object }, endpoint: { url: string, headers: object } } **(required)**

**AgentV1InjectUser** — Send inject user message to Deepgram's Voice Agent API

  - `type` `InjectUserMessage` **(required)** — Message type identifier for injecting a user message
  - `content` string **(required)** — The specific phrase or statement the agent should respond to

**AgentV1InjectAgent** — Send inject agent message to Deepgram's Voice Agent API

  - `type` `InjectAgentMessage` **(required)** — Message type identifier for injecting an agent message
  - `message` string **(required)** — The statement that the agent should say

**AgentV1SendFunctionCallResponse** — Send a function call response from the client to the server after
executing a client-side function call. This is used when the server
requests execution of a function marked with `client_side: true`.


  - `type` `FunctionCallResponse` **(required)** — Message type identifier for function call responses
  - `id` string — The unique identifier for the function call.

• **Required for client responses**: Should match the id from
  the corresponding `FunctionCallRequest`
• **Optional for server responses**: Server may omit when responding
  to internal function executions

  - `name` string **(required)** — The name of the function being called
  - `content` string **(required)** — The content or result of the function call

**AgentV1KeepAlive** — Send keep alive to Deepgram's Voice Agent API

  - `type` `KeepAlive` **(required)** — Message type identifier

**AgentV1UpdatePrompt** — Send a prompt update to Deepgram's Voice Agent API

  - `type` `UpdatePrompt` **(required)** — Message type identifier for prompt update request
  - `prompt` string **(required)** — The new system prompt to be used by the agent

**AgentV1MediaMessage** — Send raw binary audio data to Deepgram's Voice Agent API for processing

#### Server → Client Messages

**AgentV1ReceiveFunctionCallResponse** — Receive a function call response from the server after the server
has executed a server-side function call internally. This occurs
when functions are marked with `client_side: false`.


  - `type` `FunctionCallResponse` **(required)** — Message type identifier for function call responses
  - `id` string — The unique identifier for the function call.

• **Required for client responses**: Should match the id from
  the corresponding `FunctionCallRequest`
• **Optional for server responses**: Server may omit when responding
  to internal function executions

  - `name` string **(required)** — The name of the function being called
  - `content` string **(required)** — The content or result of the function call

**AgentV1PromptUpdatedEvent** — Receive prompt update from Deepgram's Voice Agent API

  - `type` `PromptUpdated` **(required)** — Message type identifier for prompt update confirmation

**AgentV1SpeakUpdatedEvent** — Receive speak update from Deepgram's Voice Agent API

  - `type` `SpeakUpdated` **(required)** — Message type identifier for speak update confirmation

**AgentV1InjectionRefused** — Receive injection refused message from Deepgram's Voice Agent API

  - `type` `InjectionRefused` **(required)** — Message type identifier for injection refused
  - `message` string **(required)** — Details about why the injection was refused

**AgentV1Welcome** — Receive welcome message from Deepgram's Voice Agent API

  - `type` `Welcome` **(required)** — Message type identifier for welcome message
  - `request_id` string **(required)** — Unique identifier for the request

**AgentV1SettingsApplied** — Receive settings applied message from Deepgram's Voice Agent API

  - `type` `SettingsApplied` **(required)** — Message type identifier for settings applied confirmation

**AgentV1ConversationText** — Receive conversation text from Deepgram's Voice Agent API

  - `type` `ConversationText` **(required)** — Message type identifier for conversation text
  - `role` `user` | `assistant` **(required)** — Identifies who spoke the statement
  - `content` string **(required)** — The actual statement that was spoken

**AgentV1UserStartedSpeaking** — Receive user started speaking message from Deepgram's Voice Agent API

  - `type` `UserStartedSpeaking` **(required)** — Message type identifier indicating that the user has begun speaking

**AgentV1AgentThinking** — Receive agent thinking message from Deepgram's Voice Agent API

  - `type` `AgentThinking` **(required)** — Message type identifier for agent thinking
  - `content` string **(required)** — The text of the agent's thought process

**AgentV1FunctionCallRequestEvent** — Receive function call request from Deepgram's Voice Agent API

  - `type` `FunctionCallRequest` **(required)** — Message type identifier for function call requests
  - `functions` { id: string, name: string, arguments: string, client_side: boolean }[] **(required)** — Array of functions to be called

**AgentV1AgentStartedSpeakingEvent** — Receive agent started speaking message from Deepgram's Voice Agent API

  - `type` `AgentStartedSpeaking` **(required)** — Message type identifier for agent started speaking
  - `total_latency` number **(required)** — Seconds from receiving the user's utterance to producing the agent's reply
  - `tts_latency` number **(required)** — The portion of total latency attributable to text-to-speech
  - `ttt_latency` number **(required)** — The portion of total latency attributable to text-to-text (usually an LLM)

**AgentV1AgentAudioDoneEvent** — Receive agent audio done message from Deepgram's Voice Agent API

  - `type` `AgentAudioDone` **(required)** — Message type identifier indicating the agent has finished sending audio

**AgentV1ErrorEvent** — Receive error response from Deepgram's Voice Agent API

  - `type` `Error` **(required)** — Message type identifier for error responses
  - `description` string **(required)** — A description of what went wrong
  - `code` string **(required)** — Error code identifying the type of error

**AgentV1WarningEvent** — Receive warning messages from Deepgram's Voice Agent API

  - `type` `Warning` **(required)** — Message type identifier for warnings
  - `description` string **(required)** — Description of the warning
  - `code` string **(required)** — Warning code identifier

**AgentV1AudioChunkEvent** — Receive raw binary audio data generated by Deepgram's Voice Agent API
