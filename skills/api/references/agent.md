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

List Agent Think Models

Retrieves the available think models that can be used for AI agent processing

#### Responses

**200**: List of available think models
**400**: Invalid Request

### GET `/v1/projects/{project_id}/agents`

List Agent Configurations

Returns all agent configurations for the specified project. Configurations are returned in their uninterpolated form—template variable placeholders appear as-is rather than with their substituted values.

#### Responses

**200**: A list of agent configurations
**400**: Invalid Request

### POST `/v1/projects/{project_id}/agents`

Create an Agent Configuration

Creates a new reusable agent configuration. The `config` field must be a valid JSON string representing the `agent` block of a Settings message. The returned `agent_id` can be passed in place of the full `agent` object in future Settings messages.

#### Request Body

**application/json**

- `config` string **(required)** — A valid JSON string representing the agent block of a Settings message
- `metadata` object — A map of arbitrary key-value pairs for labeling or organizing the agent configuration
- `api_version` integer (default: `1`) — API version. Defaults to 1

#### Responses

**200**: Agent configuration created successfully
**400**: Invalid Request

### GET `/v1/projects/{project_id}/agents/{agent_id}`

Get an Agent Configuration

Returns the specified agent configuration in its uninterpolated form

#### Responses

**200**: An agent configuration
**400**: Invalid Request

### PUT `/v1/projects/{project_id}/agents/{agent_id}`

Update Agent Metadata

Updates the metadata associated with an agent configuration. The config itself is immutable—to change the configuration, delete the existing agent and create a new one.

#### Request Body

**application/json**

- `metadata` object **(required)** — A map of string key-value pairs to associate with this agent configuration

#### Responses

**200**: Agent configuration updated
**400**: Invalid Request

### DELETE `/v1/projects/{project_id}/agents/{agent_id}`

Delete an Agent Configuration

Deletes the specified agent configuration. Deleting an agent configuration can cause a production outage if your service references this agent UUID. Migrate all active sessions to a new configuration before deleting.

#### Responses

**200**: Agent configuration deleted
**400**: Invalid Request

### GET `/v1/projects/{project_id}/agent-variables`

List Agent Variables

Returns all template variables for the specified project

#### Responses

**200**: A list of agent variables
**400**: Invalid Request

### POST `/v1/projects/{project_id}/agent-variables`

Create an Agent Variable

Creates a new template variable. Variables follow the `DG_<VARIABLE_NAME>` naming format and can substitute any JSON value in an agent configuration.

#### Request Body

**application/json**

- `key` string **(required)** — The variable name, following the DG_<VARIABLE_NAME> format
- `value` any **(required)** — The value to substitute. Can be any valid JSON type (string, number, boolean, object, or array)
- `api_version` integer (default: `1`) — API version. Defaults to 1

#### Responses

**200**: Agent variable created successfully
**400**: Invalid Request

### GET `/v1/projects/{project_id}/agent-variables/{variable_id}`

Get an Agent Variable

Returns the specified template variable

#### Responses

**200**: An agent variable
**400**: Invalid Request

### PATCH `/v1/projects/{project_id}/agent-variables/{variable_id}`

Update an Agent Variable

Updates the value of an existing template variable

#### Request Body

**application/json**

- `value` any **(required)** — The new value to substitute

#### Responses

**200**: Agent variable updated
**400**: Invalid Request

### DELETE `/v1/projects/{project_id}/agent-variables/{variable_id}`

Delete an Agent Variable

Deletes the specified template variable

#### Responses

**200**: Agent variable deleted
**400**: Invalid Request

## WebSocket API

### WebSocket `/v1/agent/converse`
> Server: `wss://agent.deepgram.com`

Build a conversational voice agent using Deepgram's Voice Agent WebSocket

#### Client → Server Messages

**AgentV1Settings** — Send settings configuration to Deepgram's Voice Agent API

  - `type` `Settings` **(required)**
  - `tags` string[] — Tags to associate with the request
  - `experimental` boolean (default: `false`) — To enable experimental features
  - `flags` { history: boolean }
  - `mip_opt_out` boolean (default: `false`) — To opt out of Deepgram Model Improvement Program
  - `audio` { input: { encoding: `linear16` | `linear32` | `flac` | `alaw` | `mulaw` | `amr-nb` | `amr-wb` | `opus` | `ogg-opus` | `speex` | `g729`, sample_rate: integer }, output: { encoding: `linear16` | `mulaw` | `alaw` | `mp3` | `opus` | `flac` | `aac`, sample_rate: integer, bitrate: integer, container: `none` | `wav` | `ogg` } } **(required)**
  - `agent` { language: string, context: { messages: object | object[] }, listen: { provider: object | object }, think: { provider: object | object | object | object | object, endpoint: object, functions: object[], prompt: string, context_length: `max` | number } | { provider: object | object | object | object | object, endpoint: object, functions: object[], prompt: string, context_length: `max` | number }[], speak: { provider: object | object | object | object | object, endpoint: object } | { provider: object | object | object | object | object, endpoint: object }[], greeting: string } | string **(required)**

**AgentV1UpdateListen** — Send update listen to Deepgram's Voice Agent API

  - `type` `UpdateListen` **(required)** — Message type identifier for updating the listen configuration
  - `listen` { provider: { type: `deepgram`, version: `v1`, model: string, language: string, keyterms: string[], smart_format: boolean } | { type: `deepgram`, version: `v2`, model: string, language_hints: string[], eot_threshold: number, eager_eot_threshold: number, eot_timeout_ms: integer, keyterms: string[] } } **(required)** — Listen configuration to update. Contains a provider object with the same schema as Settings. The model and language can be changed mid-session. Keyterms can only be updated mid-session for Flux models.

**AgentV1UpdateThink** — Send update think to Deepgram's Voice Agent API

  - `type` `UpdateThink` **(required)** — Message type identifier for updating the think model
  - `think` { provider: { type: `open_ai`, version: `v1`, model: `gpt-5` | `gpt-5-mini` | `gpt-5-nano` | `gpt-4.1` | `gpt-4.1-mini` | `gpt-4.1-nano` | `gpt-4o` | `gpt-4o-mini`, temperature: number, reasoning_mode: `none` | `minimal` | `low` | `medium` | `high` } | { type: `aws_bedrock`, model: `anthropic/claude-3-5-sonnet-20240620-v1:0` | `anthropic/claude-3-5-haiku-20240307-v1:0`, temperature: number, credentials: object } | { type: `anthropic`, version: `v1`, model: `claude-3-5-haiku-latest` | `claude-sonnet-4-20250514`, temperature: number } | { type: `google`, version: `ai-studio-v1beta` | `gemini-enterprise-agent-v1` | `v1beta`, model: `gemini-2.0-flash` | `gemini-2.0-flash-lite` | `gemini-2.5-flash`, temperature: number } | { type: `groq`, version: `v1`, model: `openai/gpt-oss-20b`, temperature: number, reasoning_mode: `none` | `minimal` | `low` | `medium` | `high` }, endpoint: { url: string, headers: object }, functions: { name: string, description: string, parameters: object, defer_until_eot: boolean, endpoint: object }[], prompt: string, context_length: `max` | number } | { provider: { type: `open_ai`, version: `v1`, model: `gpt-5` | `gpt-5-mini` | `gpt-5-nano` | `gpt-4.1` | `gpt-4.1-mini` | `gpt-4.1-nano` | `gpt-4o` | `gpt-4o-mini`, temperature: number, reasoning_mode: `none` | `minimal` | `low` | `medium` | `high` } | { type: `aws_bedrock`, model: `anthropic/claude-3-5-sonnet-20240620-v1:0` | `anthropic/claude-3-5-haiku-20240307-v1:0`, temperature: number, credentials: object } | { type: `anthropic`, version: `v1`, model: `claude-3-5-haiku-latest` | `claude-sonnet-4-20250514`, temperature: number } | { type: `google`, version: `ai-studio-v1beta` | `gemini-enterprise-agent-v1` | `v1beta`, model: `gemini-2.0-flash` | `gemini-2.0-flash-lite` | `gemini-2.5-flash`, temperature: number } | { type: `groq`, version: `v1`, model: `openai/gpt-oss-20b`, temperature: number, reasoning_mode: `none` | `minimal` | `low` | `medium` | `high` }, endpoint: { url: string, headers: object }, functions: { name: string, description: string, parameters: object, defer_until_eot: boolean, endpoint: object }[], prompt: string, context_length: `max` | number }[] **(required)**

**AgentV1UpdateSpeak** — Send update speak to Deepgram's Voice Agent API

  - `type` `UpdateSpeak` **(required)** — Message type identifier for updating the speak model
  - `speak` { provider: { type: `deepgram`, version: string, model: `aura-asteria-en` | `aura-luna-en` | `aura-stella-en` | `aura-athena-en` | `aura-hera-en` | `aura-orion-en` | `aura-arcas-en` | `aura-perseus-en` | `aura-angus-en` | `aura-orpheus-en` | `aura-helios-en` | `aura-zeus-en` | `aura-2-amalthea-en` | `aura-2-andromeda-en` | `aura-2-apollo-en` | `aura-2-arcas-en` | `aura-2-aries-en` | `aura-2-asteria-en` | `aura-2-athena-en` | `aura-2-atlas-en` | `aura-2-aurora-en` | `aura-2-callista-en` | `aura-2-cora-en` | `aura-2-cordelia-en` | `aura-2-delia-en` | `aura-2-draco-en` | `aura-2-electra-en` | `aura-2-harmonia-en` | `aura-2-helena-en` | `aura-2-hera-en` | `aura-2-hermes-en` | `aura-2-hyperion-en` | `aura-2-iris-en` | `aura-2-janus-en` | `aura-2-juno-en` | `aura-2-jupiter-en` | `aura-2-luna-en` | `aura-2-mars-en` | `aura-2-minerva-en` | `aura-2-neptune-en` | `aura-2-odysseus-en` | `aura-2-ophelia-en` | `aura-2-orion-en` | `aura-2-orpheus-en` | `aura-2-pandora-en` | `aura-2-phoebe-en` | `aura-2-pluto-en` | `aura-2-saturn-en` | `aura-2-selene-en` | `aura-2-thalia-en` | `aura-2-theia-en` | `aura-2-vesta-en` | `aura-2-zeus-en` | `aura-2-sirio-es` | `aura-2-nestor-es` | `aura-2-carina-es` | `aura-2-celeste-es` | `aura-2-alvaro-es` | `aura-2-diana-es` | `aura-2-aquila-es` | `aura-2-selena-es` | `aura-2-estrella-es` | `aura-2-javier-es` | `flux-alexis-en` | `flux-bree-en` | `flux-brittany-en` | `flux-brooke-en` | `flux-bruce-en` | `flux-cliff-en` | `flux-cole-en` | `flux-colin-en` | `flux-conor-en` | `flux-donovan-en` | `flux-drew-en` | `flux-elise-en` | `flux-gemma-en` | `flux-haley-en` | `flux-hannah-en` | `flux-heather-en` | `flux-jack-en` | `flux-kai-en` | `flux-kelsey-en` | `flux-kit-en` | `flux-maeve-en` | `flux-marcelo-en` | `flux-marcus-en` | `flux-meena-en` | `flux-meghan-en` | `flux-miles-en` | `flux-naveen-en` | `flux-paige-en` | `flux-priya-en` | `flux-rufus-en` | `flux-sean-en` | `flux-sharon-en` | `flux-sienna-en` | `flux-tanner-en` | `flux-wade-en` | `flux-wes-en`, speed: number, expressivity: `-2` | `-1` | `0` | `1` | `2` } | { type: `eleven_labs`, version: `v1`, model_id: `eleven_turbo_v2_5` | `eleven_monolingual_v1` | `eleven_multilingual_v2`, language: string, language_code: string } | { type: `cartesia`, version: `2025-03-17`, model_id: `sonic-2` | `sonic-multilingual`, voice: object, language: string, volume: number } | { type: `open_ai`, version: `v1`, model: `tts-1` | `tts-1-hd`, voice: `alloy` | `echo` | `fable` | `onyx` | `nova` | `shimmer` } | { type: `aws_polly`, voice: `Matthew` | `Joanna` | `Amy` | `Emma` | `Brian` | `Arthur` | `Aria` | `Ayanda`, language: string, language_code: string, engine: `generative` | `long-form` | `standard` | `neural`, credentials: object }, endpoint: { url: string, headers: object } } | { provider: { type: `deepgram`, version: string, model: `aura-asteria-en` | `aura-luna-en` | `aura-stella-en` | `aura-athena-en` | `aura-hera-en` | `aura-orion-en` | `aura-arcas-en` | `aura-perseus-en` | `aura-angus-en` | `aura-orpheus-en` | `aura-helios-en` | `aura-zeus-en` | `aura-2-amalthea-en` | `aura-2-andromeda-en` | `aura-2-apollo-en` | `aura-2-arcas-en` | `aura-2-aries-en` | `aura-2-asteria-en` | `aura-2-athena-en` | `aura-2-atlas-en` | `aura-2-aurora-en` | `aura-2-callista-en` | `aura-2-cora-en` | `aura-2-cordelia-en` | `aura-2-delia-en` | `aura-2-draco-en` | `aura-2-electra-en` | `aura-2-harmonia-en` | `aura-2-helena-en` | `aura-2-hera-en` | `aura-2-hermes-en` | `aura-2-hyperion-en` | `aura-2-iris-en` | `aura-2-janus-en` | `aura-2-juno-en` | `aura-2-jupiter-en` | `aura-2-luna-en` | `aura-2-mars-en` | `aura-2-minerva-en` | `aura-2-neptune-en` | `aura-2-odysseus-en` | `aura-2-ophelia-en` | `aura-2-orion-en` | `aura-2-orpheus-en` | `aura-2-pandora-en` | `aura-2-phoebe-en` | `aura-2-pluto-en` | `aura-2-saturn-en` | `aura-2-selene-en` | `aura-2-thalia-en` | `aura-2-theia-en` | `aura-2-vesta-en` | `aura-2-zeus-en` | `aura-2-sirio-es` | `aura-2-nestor-es` | `aura-2-carina-es` | `aura-2-celeste-es` | `aura-2-alvaro-es` | `aura-2-diana-es` | `aura-2-aquila-es` | `aura-2-selena-es` | `aura-2-estrella-es` | `aura-2-javier-es` | `flux-alexis-en` | `flux-bree-en` | `flux-brittany-en` | `flux-brooke-en` | `flux-bruce-en` | `flux-cliff-en` | `flux-cole-en` | `flux-colin-en` | `flux-conor-en` | `flux-donovan-en` | `flux-drew-en` | `flux-elise-en` | `flux-gemma-en` | `flux-haley-en` | `flux-hannah-en` | `flux-heather-en` | `flux-jack-en` | `flux-kai-en` | `flux-kelsey-en` | `flux-kit-en` | `flux-maeve-en` | `flux-marcelo-en` | `flux-marcus-en` | `flux-meena-en` | `flux-meghan-en` | `flux-miles-en` | `flux-naveen-en` | `flux-paige-en` | `flux-priya-en` | `flux-rufus-en` | `flux-sean-en` | `flux-sharon-en` | `flux-sienna-en` | `flux-tanner-en` | `flux-wade-en` | `flux-wes-en`, speed: number, expressivity: `-2` | `-1` | `0` | `1` | `2` } | { type: `eleven_labs`, version: `v1`, model_id: `eleven_turbo_v2_5` | `eleven_monolingual_v1` | `eleven_multilingual_v2`, language: string, language_code: string } | { type: `cartesia`, version: `2025-03-17`, model_id: `sonic-2` | `sonic-multilingual`, voice: object, language: string, volume: number } | { type: `open_ai`, version: `v1`, model: `tts-1` | `tts-1-hd`, voice: `alloy` | `echo` | `fable` | `onyx` | `nova` | `shimmer` } | { type: `aws_polly`, voice: `Matthew` | `Joanna` | `Amy` | `Emma` | `Brian` | `Arthur` | `Aria` | `Ayanda`, language: string, language_code: string, engine: `generative` | `long-form` | `standard` | `neural`, credentials: object }, endpoint: { url: string, headers: object } }[] **(required)**

**AgentV1InjectUserMessage** — Send inject user message to Deepgram's Voice Agent API

  - `type` `InjectUserMessage` **(required)** — Message type identifier for injecting a user message
  - `content` string **(required)** — The specific phrase or statement the agent should respond to

**AgentV1InjectAgentMessage** — Send inject agent message to Deepgram's Voice Agent API

  - `type` `InjectAgentMessage` **(required)** — Message type identifier for injecting an agent message
  - `message` string **(required)** — The statement that the agent should say
  - `behavior` `default` | `queue` | `interrupt` (default: `default`) — Controls how the injection interacts with any in-progress user or agent turn.

    * `default` — The agent speaks only if neither the user nor the agent is mid-turn. If a turn is in progress, the server replies with `InjectionRefused`.
    * `queue` — The message is appended after any already-queued `ConversationText` without interrupting the current agent turn or think response. If nothing is queued, the message plays immediately.
    * `interrupt` — The agent immediately speaks. If the agent was already speaking, it interrupts the current speech and replaces it with the new message. If the user is speaking, the agent interrupts with the new message, but the user's continued speech triggers `UserStartedSpeaking`, which quickly interrupts the agent.

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

**AgentV1ForceEndTurn** — Send a ForceEndTurn message to immediately end the current user turn

  - `type` `ForceEndTurn` **(required)** — Message type identifier for forcing the end of the current turn

**AgentV1Media** — Send raw binary audio data to Deepgram's Voice Agent API for processing

#### Server → Client Messages

**AgentV1ListenUpdated** — Receive listen update from Deepgram's Voice Agent API

  - `type` `ListenUpdated` **(required)** — Message type identifier for listen update confirmation

**AgentV1ThinkUpdated** — Receive think update from Deepgram's Voice Agent API

  - `type` `ThinkUpdated` **(required)** — Message type identifier for think update confirmation

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

**AgentV1PromptUpdated** — Receive prompt update from Deepgram's Voice Agent API

  - `type` `PromptUpdated` **(required)** — Message type identifier for prompt update confirmation

**AgentV1SpeakUpdated** — Receive speak update from Deepgram's Voice Agent API

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
  - `languages_hinted` string[] — The language hints that were active at the time of the turn. Only present on user-role messages when the listen model is flux-general-multi.
  - `languages` string[] — Languages detected in the user's speech, sorted by word count (descending). Only present on user-role messages when the listen model is flux-general-multi.

**AgentV1UserStartedSpeaking** — Receive user started speaking message from Deepgram's Voice Agent API

  - `type` `UserStartedSpeaking` **(required)** — Message type identifier indicating that the user has begun speaking

**AgentV1AgentThinking** — Receive agent thinking message from Deepgram's Voice Agent API

  - `type` `AgentThinking` **(required)** — Message type identifier for agent thinking
  - `content` string **(required)** — The text of the agent's thought process

**AgentV1LatencyReport** — Receive a latency report from Deepgram's Voice Agent API

  - `type` `LatencyReport` **(required)** — Message type identifier for the latency report
  - `stt_latency` string — Speech-to-text: time from audio received to transcript produced, in seconds
  - `ttt_token_latency` string — Time to first token of any type (text, tool call, or thinking), in seconds
  - `ttt_text_latency` string — Time to first text token from the LLM, in seconds
  - `ttt_tool_latency` string — Time to first tool-call token from the LLM, in seconds
  - `ttt_thinking_latency` string — Time to first thinking token from the LLM, in seconds
  - `tts_latency` string — Text-to-speech: time from first text token to first audio byte, in seconds
  - `total_latency` string — End-to-end: time from user utterance end to first audio byte, in seconds

**AgentV1FunctionCallRequest** — Receive function call request from Deepgram's Voice Agent API

  - `type` `FunctionCallRequest` **(required)** — Message type identifier for function call requests
  - `functions` { id: string, name: string, arguments: string, client_side: boolean, thought_signature: string }[] **(required)** — Array of functions to be called

**AgentV1FunctionCallCancelled** — Receive notice that a function call you already received was cancelled because the user started speaking again

  - `type` `FunctionCallCancelled` **(required)** — Message type identifier for cancelled function calls
  - `functions` { id: string, name: string }[] **(required)** — The function calls that are no longer valid

**AgentV1AgentStartedSpeaking** — Receive agent started speaking message from Deepgram's Voice Agent API

  - `type` `AgentStartedSpeaking` **(required)** — Message type identifier for agent started speaking
  - `total_latency` string **(required)** — Seconds from receiving the user's utterance to producing the agent's reply
  - `tts_latency` string **(required)** — The portion of total latency attributable to text-to-speech
  - `ttt_latency` string **(required)** — The portion of total latency attributable to text-to-text (usually an LLM)

**AgentV1AgentAudioDone** — Receive agent audio done message from Deepgram's Voice Agent API

  - `type` `AgentAudioDone` **(required)** — Message type identifier indicating the agent has finished sending audio

**AgentV1Error** — Receive error response from Deepgram's Voice Agent API

  - `type` `Error` **(required)** — Message type identifier for error responses
  - `description` string **(required)** — A description of what went wrong
  - `code` string **(required)** — Error code identifying the type of error

**AgentV1Warning** — Receive warning messages from Deepgram's Voice Agent API

  - `type` `Warning` **(required)** — Message type identifier for warnings
  - `description` string **(required)** — Description of the warning
  - `code` string **(required)** — Warning code identifier

**AgentV1History** — Receive a conversation history message from Deepgram's Voice Agent API. Each message is either a conversation text (with role and content) or a function call record (with function_calls array).

**AgentV1Audio** — Receive raw binary audio data generated by Deepgram's Voice Agent API
