# Deepgram Models API

Model management — list and query available models.

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

### GET `/v1/models`
> Server: `https://api.deepgram.com`

List Models

Returns metadata on all the latest public models. To retrieve custom models, use Get Project Models.

#### Query Parameters

- `include_outdated` boolean — returns non-latest versions of models

#### Responses

**200**: A list of models
**400**: Invalid Request

### GET `/v1/models/{model_id}`
> Server: `https://api.deepgram.com`

Get a specific Model

Returns metadata for a specific public model

#### Responses

**200**: A model object that can be either STT or TTS
**400**: Invalid Request
