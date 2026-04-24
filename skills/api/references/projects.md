# Deepgram Projects API

Project management — manage projects, keys, members, and usage.

## Documentation

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

### GET `/v1/projects`

List Projects

Retrieves basic information about the projects associated with the API key

#### Responses

**200**: A list of projects
**400**: Invalid Request

### GET `/v1/projects/{project_id}`

Get a Project

Retrieves information about the specified project

#### Query Parameters

- `limit` number (default: `10`) — Number of results to return per page. Default 10. Range [1,1000]
- `page` number — Navigate and return the results to retrieve specific portions of information of the response

#### Responses

**200**: A project
**400**: Invalid Request

### PATCH `/v1/projects/{project_id}`

Update a Project

Updates the name or other properties of an existing project

#### Request Body

**application/json**

- `name` string — The name of the project

#### Responses

**200**: A project
**400**: Invalid Request

### DELETE `/v1/projects/{project_id}`

Delete a Project

Deletes the specified project

#### Responses

**200**: A project
**400**: Invalid Request

### DELETE `/v1/projects/{project_id}/leave`

Leave a Project

Removes the authenticated account from the specific project

#### Responses

**200**: Successfully removed account from project
**400**: Invalid Request

### GET `/v1/projects/{project_id}/keys`

List Project Keys

Retrieves all API keys associated with the specified project

#### Query Parameters

- `status` `active` | `expired` — Only return keys with a specific status

#### Responses

**200**: A list of API keys
**400**: Invalid Request

### POST `/v1/projects/{project_id}/keys`

Create a Project Key

Creates a new API key with specified settings for the project

#### Request Body

**application/json**

#### Responses

**200**: API key created successfully
**400**: Invalid Request

### GET `/v1/projects/{project_id}/keys/{key_id}`

Get a Project Key

Retrieves information about a specified API key

#### Responses

**200**: A specific API key
**400**: Invalid Request

### DELETE `/v1/projects/{project_id}/keys/{key_id}`

Delete a Project Key

Deletes an API key for a specific project

#### Responses

**200**: API key deleted
**400**: Invalid Request

### GET `/v1/projects/{project_id}/members`

List Project Members

Retrieves a list of members for a given project

#### Responses

**200**: A list of members for a given project
**400**: Invalid Request

### DELETE `/v1/projects/{project_id}/members/{member_id}`

Delete a Project Member

Removes a member from the project using their unique member ID

#### Responses

**200**: Delete the specific member from the project
**400**: Invalid Request

### GET `/v1/projects/{project_id}/members/{member_id}/scopes`

List Project Member Scopes

Retrieves a list of scopes for a specific member

#### Responses

**200**: A list of scopes for a specific member
**400**: Invalid Request

### PUT `/v1/projects/{project_id}/members/{member_id}/scopes`

Update Project Member Scopes

Updates the scopes for a specific member

#### Request Body

**application/json**

- `scope` string **(required)** — A scope to update

#### Responses

**200**: Updated the scopes for a specific member
**400**: Invalid Request

### GET `/v1/projects/{project_id}/invites`

List Project Invites

Generates a list of invites for a specific project

#### Responses

**200**: A list of invites for a specific project
**400**: Invalid Request

### POST `/v1/projects/{project_id}/invites`

Create a Project Invite

Generates an invite for a specific project

#### Request Body

**application/json**

- `email` string **(required)** — The email address of the invitee
- `scope` string **(required)** — The scope of the invitee

#### Responses

**200**: The invite was successfully generated
**400**: Invalid Request

### DELETE `/v1/projects/{project_id}/invites/{email}`

Delete a Project Invite

Deletes an invite for a specific project

#### Responses

**200**: The invite was successfully deleted
**400**: Invalid Request

### GET `/v1/projects/{project_id}/requests`

List Project Requests

Generates a list of requests for a specific project

#### Query Parameters

- `start` string — Start date of the requested date range. Formats accepted are YYYY-MM-DD, YYYY-MM-DDTHH:MM:SS, or YYYY-MM-DDTHH:MM:SS+HH:MM
- `end` string — End date of the requested date range. Formats accepted are YYYY-MM-DD, YYYY-MM-DDTHH:MM:SS, or YYYY-MM-DDTHH:MM:SS+HH:MM
- `limit` number (default: `10`) — Number of results to return per page. Default 10. Range [1,1000]
- `page` number — Navigate and return the results to retrieve specific portions of information of the response
- `accessor` string — Filter for requests where a specific accessor was used
- `request_id` string — Filter for a specific request id
- `deployment` `hosted` | `beta` | `self-hosted` — Filter for requests where a specific deployment was used
- `endpoint` `listen` | `read` | `speak` | `agent` — Filter for requests where a specific endpoint was used
- `method` `sync` | `async` | `streaming` — Filter for requests where a specific method was used
- `status` `succeeded` | `failed` — Filter for requests that succeeded (status code < 300) or failed (status code >=400)

#### Responses

**200**: A list of requests for a specific project
**400**: Invalid Request

### GET `/v1/projects/{project_id}/requests/{request_id}`

Get a Project Request

Retrieves a specific request for a specific project

#### Responses

**200**: A specific request for a specific project
**400**: Invalid Request

### GET `/v1/projects/{project_id}/usage`

Get Project Usage

Retrieves the usage for a specific project. Use Get Project Usage Breakdown for a more comprehensive usage summary.

#### Query Parameters

- `start` string — Start date of the requested date range. Format accepted is YYYY-MM-DD
- `end` string — End date of the requested date range. Format accepted is YYYY-MM-DD
- `accessor` string — Filter for requests where a specific accessor was used
- `alternatives` boolean — Filter for requests where alternatives were used
- `callback_method` boolean — Filter for requests where callback method was used
- `callback` boolean — Filter for requests where callback was used
- `channels` boolean — Filter for requests where channels were used
- `custom_intent_mode` boolean — Filter for requests where custom intent mode was used
- `custom_intent` boolean — Filter for requests where custom intent was used
- `custom_topic_mode` boolean — Filter for requests where custom topic mode was used
- `custom_topic` boolean — Filter for requests where custom topic was used
- `deployment` `hosted` | `beta` | `self-hosted` — Filter for requests where a specific deployment was used
- `detect_entities` boolean — Filter for requests where detect entities was used
- `detect_language` boolean — Filter for requests where detect language was used
- `diarize` boolean — Filter for requests where diarize was used
- `dictation` boolean — Filter for requests where dictation was used
- `encoding` boolean — Filter for requests where encoding was used
- `endpoint` `listen` | `read` | `speak` | `agent` — Filter for requests where a specific endpoint was used
- `extra` boolean — Filter for requests where extra was used
- `filler_words` boolean — Filter for requests where filler words was used
- `intents` boolean — Filter for requests where intents was used
- `keyterm` boolean — Filter for requests where keyterm was used
- `keywords` boolean — Filter for requests where keywords was used
- `language` boolean — Filter for requests where language was used
- `measurements` boolean — Filter for requests where measurements were used
- `method` `sync` | `async` | `streaming` — Filter for requests where a specific method was used
- `model` string — Filter for requests where a specific model uuid was used
- `multichannel` boolean — Filter for requests where multichannel was used
- `numerals` boolean — Filter for requests where numerals were used
- `paragraphs` boolean — Filter for requests where paragraphs were used
- `profanity_filter` boolean — Filter for requests where profanity filter was used
- `punctuate` boolean — Filter for requests where punctuate was used
- `redact` boolean — Filter for requests where redact was used
- `replace` boolean — Filter for requests where replace was used
- `sample_rate` boolean — Filter for requests where sample rate was used
- `search` boolean — Filter for requests where search was used
- `sentiment` boolean — Filter for requests where sentiment was used
- `smart_format` boolean — Filter for requests where smart format was used
- `summarize` boolean — Filter for requests where summarize was used
- `tag` string — Filter for requests where a specific tag was used
- `topics` boolean — Filter for requests where topics was used
- `utt_split` boolean — Filter for requests where utt split was used
- `utterances` boolean — Filter for requests where utterances was used
- `version` boolean — Filter for requests where version was used

#### Responses

**200**: A specific request for a specific project
**400**: Invalid Request

### GET `/v1/projects/{project_id}/usage/fields`

List Project Usage Fields

Lists the features, models, tags, languages, and processing method used for requests in the specified project

#### Query Parameters

- `start` string — Start date of the requested date range. Format accepted is YYYY-MM-DD
- `end` string — End date of the requested date range. Format accepted is YYYY-MM-DD

#### Responses

**200**: A list of fields for a specific project
**400**: Invalid Request

### GET `/v1/projects/{project_id}/usage/breakdown`

Get Project Usage Breakdown

Retrieves the usage breakdown for a specific project, with various filter options by API feature or by groupings. Setting a feature (e.g. diarize) to true includes requests that used that feature, while false excludes requests that used it. Multiple true filters are combined with OR logic, while false filters use AND logic.

#### Query Parameters

- `start` string — Start date of the requested date range. Format accepted is YYYY-MM-DD
- `end` string — End date of the requested date range. Format accepted is YYYY-MM-DD
- `grouping` `accessor` | `endpoint` | `feature_set` | `models` | `method` | `tags` | `deployment` — Common usage grouping parameters
- `accessor` string — Filter for requests where a specific accessor was used
- `alternatives` boolean — Filter for requests where alternatives were used
- `callback_method` boolean — Filter for requests where callback method was used
- `callback` boolean — Filter for requests where callback was used
- `channels` boolean — Filter for requests where channels were used
- `custom_intent_mode` boolean — Filter for requests where custom intent mode was used
- `custom_intent` boolean — Filter for requests where custom intent was used
- `custom_topic_mode` boolean — Filter for requests where custom topic mode was used
- `custom_topic` boolean — Filter for requests where custom topic was used
- `deployment` `hosted` | `beta` | `self-hosted` — Filter for requests where a specific deployment was used
- `detect_entities` boolean — Filter for requests where detect entities was used
- `detect_language` boolean — Filter for requests where detect language was used
- `diarize` boolean — Filter for requests where diarize was used
- `dictation` boolean — Filter for requests where dictation was used
- `encoding` boolean — Filter for requests where encoding was used
- `endpoint` `listen` | `read` | `speak` | `agent` — Filter for requests where a specific endpoint was used
- `extra` boolean — Filter for requests where extra was used
- `filler_words` boolean — Filter for requests where filler words was used
- `intents` boolean — Filter for requests where intents was used
- `keyterm` boolean — Filter for requests where keyterm was used
- `keywords` boolean — Filter for requests where keywords was used
- `language` boolean — Filter for requests where language was used
- `measurements` boolean — Filter for requests where measurements were used
- `method` `sync` | `async` | `streaming` — Filter for requests where a specific method was used
- `model` string — Filter for requests where a specific model uuid was used
- `multichannel` boolean — Filter for requests where multichannel was used
- `numerals` boolean — Filter for requests where numerals were used
- `paragraphs` boolean — Filter for requests where paragraphs were used
- `profanity_filter` boolean — Filter for requests where profanity filter was used
- `punctuate` boolean — Filter for requests where punctuate was used
- `redact` boolean — Filter for requests where redact was used
- `replace` boolean — Filter for requests where replace was used
- `sample_rate` boolean — Filter for requests where sample rate was used
- `search` boolean — Filter for requests where search was used
- `sentiment` boolean — Filter for requests where sentiment was used
- `smart_format` boolean — Filter for requests where smart format was used
- `summarize` boolean — Filter for requests where summarize was used
- `tag` string — Filter for requests where a specific tag was used
- `topics` boolean — Filter for requests where topics was used
- `utt_split` boolean — Filter for requests where utt split was used
- `utterances` boolean — Filter for requests where utterances was used
- `version` boolean — Filter for requests where version was used

#### Responses

**200**: Usage breakdown response
**400**: Invalid Request

### GET `/v1/projects/{project_id}/balances`

Get Project Balances

Generates a list of outstanding balances for the specified project

#### Responses

**200**: A list of outstanding balances
**400**: Invalid Request

### GET `/v1/projects/{project_id}/balances/{balance_id}`

Get a Project Balance

Retrieves details about the specified balance

#### Responses

**200**: A specific balance
**400**: Invalid Request

### GET `/v1/projects/{project_id}/billing/breakdown`

Get Project Billing Breakdown

Retrieves the billing summary for a specific project, with various filter options or by grouping options.

#### Query Parameters

- `start` string — Start date of the requested date range. Format accepted is YYYY-MM-DD
- `end` string — End date of the requested date range. Format accepted is YYYY-MM-DD
- `accessor` string — Filter for requests where a specific accessor was used
- `deployment` `hosted` | `beta` | `self-hosted` — Filter for requests where a specific deployment was used
- `tag` string — Filter for requests where a specific tag was used
- `line_item` string — Filter requests by line item (e.g. streaming::nova-3)
- `grouping` `accessor` | `deployment` | `line_item` | `tags`[] — Group billing breakdown by one or more dimensions (accessor, deployment, line_item, tags)

#### Responses

**200**: Billing breakdown response
**400**: Invalid Request

### GET `/v1/projects/{project_id}/billing/fields`

List Project Billing Fields

Lists the accessors, deployment types, tags, and line items used for billing data in the specified time period. Use this endpoint if you want to filter your results from the Billing Breakdown endpoint and want to know what filters are available.

#### Query Parameters

- `start` string — Start date of the requested date range. Format accepted is YYYY-MM-DD
- `end` string — End date of the requested date range. Format accepted is YYYY-MM-DD

#### Responses

**200**: A list of billing fields for a specific project
**400**: Invalid Request

### GET `/v1/projects/{project_id}/purchases`

List Project Purchases

Returns the original purchased amount on an order transaction

#### Query Parameters

- `limit` number (default: `10`) — Number of results to return per page. Default 10. Range [1,1000]

#### Responses

**200**: A list of purchases for a specific project
**400**: Invalid Request
