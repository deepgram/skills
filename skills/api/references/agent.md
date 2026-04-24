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

**AgentV1Settings** — Client messages

**AgentV1UpdateSpeak** — Client messages

**AgentV1InjectUser** — Client messages

**AgentV1InjectAgent** — Client messages

**AgentV1SendFunctionCallResponse** — Client messages

**AgentV1KeepAlive** — Client messages

**AgentV1UpdatePrompt** — Client messages

**AgentV1UpdateThink** — Client messages

**AgentV1Media** — Client messages

#### Server → Client Messages

**AgentV1ReceiveFunctionCallResponse** — Server messages

**AgentV1PromptUpdated** — Server messages

**AgentV1SpeakUpdated** — Server messages

**AgentV1ThinkUpdated** — Server messages

**AgentV1InjectionRefused** — Server messages

**AgentV1Welcome** — Server messages

**AgentV1SettingsApplied** — Server messages

**AgentV1ConversationText** — Server messages

**AgentV1UserStartedSpeaking** — Server messages

**AgentV1AgentThinking** — Server messages

**AgentV1FunctionCallRequest** — Server messages

**AgentV1AgentStartedSpeaking** — Server messages

**AgentV1AgentAudioDone** — Server messages

**AgentV1Error** — Server messages

**AgentV1Warning** — Server messages

**AgentV1Audio** — Server messages
