# Deepgram Auth API

Authentication — manage API keys and temporary tokens.

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

### POST `/v1/auth/grant`

Token-based Authentication

Generates a temporary JSON Web Token (JWT) with a 30-second (by default) TTL and usage::write permission for core voice APIs, requiring an API key with Member or higher authorization. Tokens created with this endpoint will not work with the Manage APIs.

#### Request Body

**application/json**

- `ttl_seconds` number — Time to live in seconds for the token. Defaults to 30 seconds.

#### Responses

**200**: Grant response
**400**: Invalid Request
