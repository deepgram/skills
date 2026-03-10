---
name: deepgram-api
description: >
  Deepgram API reference for speech-to-text, text-to-speech, voice agents, audio intelligence,
  and account management. Use whenever building with Deepgram APIs — REST or WebSocket. Covers
  authentication, all endpoints, query parameters, request/response schemas, and WebSocket
  message formats. Reference files are organized by domain: listen (STT), speak (TTS), agent
  (voice agents), read (text/audio intelligence), models, projects, auth, and self-hosted.
---

# Deepgram API

Build with Deepgram's speech-to-text, text-to-speech, voice agent, and audio intelligence APIs.

## Getting Started

All API requests require authentication via API key or JWT:

- **API Key**: `Authorization: Token <API_KEY>`
- **JWT**: `Authorization: Bearer <JWT>`

Base servers:

- REST & STT/TTS WebSocket: `https://api.deepgram.com`
- Voice Agent WebSocket: `https://agent.deepgram.com`

## API Domains

| Domain | REST | WebSocket | Reference |
|--------|------|-----------|-----------|
| Listen (STT) | `POST /v1/listen` | `wss://api.deepgram.com/v1/listen` | [listen.md](references/listen.md) |
| Speak (TTS) | `POST /v1/speak` | `wss://api.deepgram.com/v1/speak` | [speak.md](references/speak.md) |
| Voice Agent | `GET /v1/agent/settings/think/models` | `wss://agent.deepgram.com/v1/agent/converse` | [agent.md](references/agent.md) |
| Read (Intelligence) | `POST /v1/read` | — | [read.md](references/read.md) |
| Models | `GET /v1/models` | — | [models.md](references/models.md) |
| Projects | `/v1/projects/*` | — | [projects.md](references/projects.md) |
| Auth | `POST /v1/auth/grant` | — | [auth.md](references/auth.md) |
| Self-Hosted | `/v1/projects/*/selfhosted/*` | — | [self-hosted.md](references/self-hosted.md) |

## Documentation

- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)
- [Speech-to-Text Getting Started](https://developers.deepgram.com/docs/stt/getting-started)
- [Text-to-Speech Docs](https://developers.deepgram.com/docs/tts-rest)
- [Voice Agent Docs](https://developers.deepgram.com/docs/voice-agent)
- [Audio Intelligence](https://developers.deepgram.com/docs/audio-intelligence)
- [Self-Hosted Deployments](https://developers.deepgram.com/docs/self-hosted-introduction)
