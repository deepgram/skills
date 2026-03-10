# Deepgram Read API

Text analysis — analyze and understand text content.

## Documentation

- [Text and Audio Intelligence](https://developers.deepgram.com/docs/audio-intelligence)
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

### POST `/v1/read`
> Server: `https://api.deepgram.com`

Analyze text content

Analyze text content using Deepgrams text analysis API

#### Query Parameters

- `callback` string — URL to which we'll make the callback request
- `callback_method` `POST` | `PUT` (default: `POST`) — HTTP method by which the callback request will be made
- `sentiment` boolean (default: `false`) — Recognizes the sentiment throughout a transcript or text
- `summarize` `v2` | boolean — Summarize content. For Listen API, supports string version option. For Read API, accepts boolean only.
- `tag` string | string[] — Label your requests for the purpose of identification during usage reporting
- `topics` boolean (default: `false`) — Detect topics throughout a transcript or text
- `custom_topic` string | string[] — Custom topics you want the model to detect within your input audio or text if present Submit up to `100`.
- `custom_topic_mode` `extended` | `strict` (default: `extended`) — Sets how the model will interpret strings submitted to the `custom_topic` param. When `strict`, the model will only return topics submitted using the `custom_topic` param. When `extended`, the model will return its own detected topics in addition to those submitted using the `custom_topic` param
- `intents` boolean (default: `false`) — Recognizes speaker intent throughout a transcript or text
- `custom_intent` string | string[] — Custom intents you want the model to detect within your input audio if present
- `custom_intent_mode` `extended` | `strict` (default: `extended`) — Sets how the model will interpret intents submitted to the `custom_intent` param. When `strict`, the model will only return intents submitted using the `custom_intent` param. When `extended`, the model will return its own detected intents in the `custom_intent` param.
- `language` string (default: `en`) — The [BCP-47 language tag](https://tools.ietf.org/html/bcp47) that hints at the primary spoken language. Depending on the Model and API endpoint you choose only certain languages are available

#### Request Body

**application/json**

#### Responses

**200**: Successful text analysis
**400**: Invalid Request
