---
name: text-intelligence
description: >
  Analyze text you already have with Deepgram's Read API. Use when a task says
  "text intelligence", "read API", "/v1/read", "analyze text", "sentiment of this
  text", "summarize this transcript", "summarize a document", "topic detection on
  text", "intent recognition on text", "analyze a support ticket", or "analyze a chat
  log". One REST call, POST /v1/read, with four features: summarize, sentiment,
  topics, intents. Covers the two required query parameters people miss, the
  text-versus-url body, the English-only limit, and why entity detection is not
  here. Routes to audio-intelligence for audio input and to the api, docs, recipes,
  starters, and per-language SDK skills.
---

# Deepgram Text Intelligence (Read API)

`POST https://api.deepgram.com/v1/read` takes text and returns analysis. No audio, no transcript,
no streaming — one request, one response. Four features: `summarize`, `sentiment`, `topics`,
`intents`.

## Decide first

- **Your input is text** — a transcript you already have, a document, an email, a chat log, a
  support ticket: stay here.
- **Your input is audio**: do not transcribe and then call this. `/v1/listen` runs the same analysis
  during transcription, in a single API call. Open the `audio-intelligence` skill.
- **You need entity detection** (names, amounts, dates): not available here. `/v1/read` rejects
  `detect_entities` outright. Only `/v1/listen` detects entities, so your input has to be audio.
- **You need streaming**: there is none. `/v1/read` is POST-only — a GET returns 405, and so does a
  WebSocket upgrade against the same path.

## Verified request

Both `language` and at least one feature are **required**. Omitting either is a 400.

```bash
curl -s -X POST 'https://api.deepgram.com/v1/read?language=en&summarize=v2&sentiment=true&topics=true&intents=true' \
  -H "Authorization: Token $DEEPGRAM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hi, this is Maria Gonzalez from Acme Corp in Denver. The invoice we received on March 3rd double-charged us on the annual plan. I would like a refund and I want to cancel the second subscription."}'
```

Returns 200. Where each result lives:

| Result | Path |
|---|---|
| Summary | `results.summary.text` |
| Sentiment per segment | `results.sentiments.segments[]` — `text`, `start_word`, `end_word`, `sentiment`, `sentiment_score` |
| Sentiment overall | `results.sentiments.average` — `sentiment`, `sentiment_score` |
| Topics | `results.topics.segments[].topics[]` — `topic`, `confidence_score` |
| Intents | `results.intents.segments[].intents[]` — `intent`, `confidence_score` |

The parameter is `sentiment`; the result key is `sentiments`. `metadata` carries `request_id`,
`created`, `language`, and one `summary_info` / `sentiment_info` / `topics_info` / `intents_info`
block per enabled feature, each with `model_uuid`, `input_tokens`, and `output_tokens` — that token
count is what you reconcile usage against.

## The body: exactly one of `text` or `url`

Three accepted shapes:

- `Content-Type: application/json` with `{"text": "..."}`.
- `Content-Type: application/json` with `{"url": "..."}`, where the URL serves **plain text**.
  Deepgram fetches it.
- `Content-Type: text/plain` with the raw text as the whole body, no JSON wrapper.

Sending both `text` and `url`, or neither, returns 400 `{"err_code":"PAYLOAD_ERROR","err_msg":"Failed
to deserialize JSON payload. Please specify exactly one of \`text\` or \`url\` in the JSON body."}`.

A 1 MB JSON body (210,000 input tokens, per `metadata.summary_info.input_tokens`) was accepted, so
there is no small size ceiling to design around. Treat very large documents as chunkable rather
than assuming any particular ceiling.

## Options

- `summarize` accepts `v2` **and** `true`; both return `results.summary.text`.
- `custom_topic` and `custom_intent` (repeatable) add your own labels. `custom_topic_mode` and
  `custom_intent_mode` take `extended` (default: your labels plus the model's own) or `strict`
  (your labels only). `strict` returns `"segments": []` when nothing matches, which reads as a
  broken request but is not. Start with `extended`.
- `callback` (with optional `callback_method`, default `POST`) makes the request asynchronous. The
  response body becomes just `{"request_id":"..."}` and the analysis is POSTed to your URL. [5]
- `tag` (repeatable) labels the request for usage reporting. [6]

## Common mistakes

1. **Omitting `language`.** The generated API reference documents `language` as optional with
   default `en`. It is not optional. The live API returns 400
   `{"err_code":"INVALID_QUERY_PARAMETER","err_msg":"Failed to deserialize query parameters:
   missing field \`language\`"}`. Always send `language=en`. This error fires *before* any other
   validation, so it masks every other mistake in the request — fix it first.
2. **Enabling no features.** `language=en` alone returns 400 `"Request did not enable any features.
   Please enable at least one feature. Available features: \`summarize\`, \`topics\`, \`intents\`,
   \`sentiment\`."` That error string is also the authoritative list of what the Read API does.
3. **Any language other than English.** `language=es` returns 400 `"Request specified unsupported
   language: es. Only English is supported."` Same for `fr`, and `language=multi` is rejected the
   same way — there is no code-switching mode here, unlike `/v1/listen`. Regional English tags are
   fine: `en-US` is accepted and reported back as `"language": "en"`.
4. **Sending `detect_entities`.** 400 `{"err_code":"INVALID_QUERY_PARAMETER","err_msg":"unknown
   query parameter: detect_entities"}`. Entity detection exists only on `/v1/listen`.
5. **Pointing `url` at audio.** `{"url":"https://dpgr.am/spacewalk.wav"}` returns 400
   `{"err_code":"REMOTE_CONTENT_ERROR","err_msg":"Failed to deserialize remote text data. Please
   provide \`application/json\` with a \`text\` field or \`text/plain\`."}`. `url` means a text
   document. Audio goes to `/v1/listen`.
6. **Looking for `results.summary.short`.** That is `/v1/listen`'s shape. Read returns
   `results.summary.text`. Code that handles both endpoints has to branch.
7. **Transcribing, then calling Read.** Two round trips instead of one, and you lose entity
   detection, which Read does not offer at all. If you start from audio, put the parameters on
   `/v1/listen` and read the `audio-intelligence` skill.
8. **Wrong auth scheme.** API keys use `Authorization: Token <key>`. `Bearer` is only for the
   short-lived JWT from `POST /v1/auth/grant`. [7]

## Pricing

Every feature you enable adds to what the request costs. Rates and the billing model change, so
read <https://deepgram.com/pricing> rather than any figure quoted in a skill.

## Use a different skill when

- Your input is audio: `audio-intelligence` skill. It also covers entity detection.
- You want every parameter and the response schema: `api` skill, `references/read.md` — but see
  mistake 1; that file's `language` default is wrong.
- You want a runnable demo app: `starters` skill, feature `text-intelligence`, available for node,
  bun, deno, fastapi, flask, django, go, java, csharp, rust, ruby, php, and cpp.
- You want a snippet under 50 lines: `recipes` skill. The repo's "Text Analysis `v1`" section has
  `summarize`, `sentiment`, `topics`, and `intents` in Python, JavaScript, Go, .NET, Java, Rust, and
  the CLI. [8]
- You want language-idiomatic SDK code: install `deepgram-{js,python,java,go,rust,dotnet}-text-intelligence`
  from the matching SDK repository (`npx skills add deepgram/deepgram-python-sdk`, and so on).
- You want speech-to-text, text-to-speech, or a voice agent: the `speech-to-text`, `text-to-speech`,
  or `voice-agent` skill.
- You want to find a docs page: `docs` skill. You want the docs in your editor: `setup-mcp` skill.

## Sources

1. https://developers.deepgram.com/docs/text-intelligence (getting started)
2. https://developers.deepgram.com/docs/text-intelligence-feature-overview (the four features, English only, no streaming)
3. https://developers.deepgram.com/docs/text-summarization, https://developers.deepgram.com/docs/text-sentiment-analysis, https://developers.deepgram.com/docs/text-topic-detection, https://developers.deepgram.com/docs/text-intention-recognition
4. https://developers.deepgram.com/reference/text-intelligence/analyze-text
5. https://developers.deepgram.com/docs/text-intelligence-callback
6. https://developers.deepgram.com/docs/text-intelligence-tagging
7. https://developers.deepgram.com/guides/fundamentals/authenticating and https://developers.deepgram.com/docs/errors
8. https://github.com/deepgram/recipes/blob/main/COVERAGE.md ("Text Analysis `v1`" section)
9. https://developers.deepgram.com/docs/text-intelligence-template-apps and https://deepgram.com/pricing
