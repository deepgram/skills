# Deepgram Self-Hosted API

## Documentation

- [Self-Hosted Deployments](https://developers.deepgram.com/docs/self-hosted-introduction)
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

### GET `/v1/projects/{project_id}/self-hosted/distribution/credentials`

List Project Self-Hosted Distribution Credentials

Lists sets of distribution credentials for the specified project

#### Responses

**200**: A list of distribution credentials for a specific project
**400**: Invalid Request

### POST `/v1/projects/{project_id}/self-hosted/distribution/credentials`

Create a Project Self-Hosted Distribution Credential

Creates a set of distribution credentials for the specified project

#### Query Parameters

- `scopes` `self-hosted:products` | `self-hosted:product:api` | `self-hosted:product:engine` | `self-hosted:product:license-proxy` | `self-hosted:product:dgtools` | `self-hosted:product:billing` | `self-hosted:product:hotpepper` | `self-hosted:product:metrics-server`[] — List of permission scopes for the credentials
- `provider` `quay` (default: `quay`) — The provider of the distribution service

#### Request Body

**application/json**

- `comment` string — Optional comment about the credentials

#### Responses

**200**: Single distribution credential
**400**: Invalid Request

### GET `/v1/projects/{project_id}/self-hosted/distribution/credentials/{distribution_credentials_id}`

Get a Project Self-Hosted Distribution Credential

Returns a set of distribution credentials for the specified project

#### Responses

**200**: Single distribution credential
**400**: Invalid Request

### DELETE `/v1/projects/{project_id}/self-hosted/distribution/credentials/{distribution_credentials_id}`

Delete a Project Self-Hosted Distribution Credential

Deletes a set of distribution credentials for the specified project

#### Responses

**200**: Single distribution credential
**400**: Invalid Request
