---
name: browser-agent
description: >
  Run a Deepgram voice agent in the browser with the four Browser Agent SDK packages:
  @deepgram/agents (core WebSocket session, mic, player), @deepgram/react (AgentProvider
  and hooks), @deepgram/ui (pre-built React components), and @deepgram/agents-widget
  (drop-in, no framework). Use when a task says "browser voice agent", "voice widget",
  "embed a voice agent", "react voice agent", "@deepgram/react", "@deepgram/ui",
  "agents-widget", "AgentProvider", "useAgentState", "useDeepgramAgent", "AgentSession",
  "tokenFactory", "Orb", "voice agent on my website", or asks how to keep a Deepgram API
  key out of client-side code. Picks the layer, gets one path running, and routes to the
  voice-agent skill for the WebSocket contract underneath.
---

# Deepgram Browser Agent SDK

Four packages, each wrapping the one below, all speaking the same Voice Agent WebSocket. Pick a layer by how much UI you want handled for you, not by package name. [1]

## Pick the layer first

| Use | When | Install |
|---|---|---|
| `@deepgram/agents-widget` | You want a voice agent on a page today. No framework, no build step. Six layouts (`sidebar`, `floating`, `inline`, `button`, `embedded`, `orb`), themed by design tokens. Accept its UI. | `@deepgram/agents-widget` |
| `@deepgram/ui` | React app, and Deepgram's conversation view, orb, waveform, and mic/speaker buttons are close enough to your design. Retheme with CSS custom properties. | `@deepgram/ui` only — see the duplicate-context trap below |
| `@deepgram/react` | React app, you build every pixel. Provider plus focused hooks manage the connection, mic, playback, transcript, and client tools. | `@deepgram/react @deepgram/agents` |
| `@deepgram/agents` | Vue, Svelte, Angular, vanilla JS, or a non-React runtime. `AgentSession` + `AgentMicrophone` + `AgentPlayer`, wire the events yourself. | `@deepgram/agents` |

Each layer re-exports the layer below, so installing `@deepgram/ui` gives you `AgentProvider`, all ten `useAgent*` hooks, and the `@deepgram/agents` types from one import (verified: `@deepgram/ui@0.1.6` exports `AgentProvider`, `useAgentClientTool`, `useAgentContext`, `useAgentControls`, `useAgentConversation`, `useAgentMicrophone`, `useAgentMode`, `useAgentPlayer`, `useAgentSession`, `useAgentState`, `useDeepgramAgent`). [7]

## Versions and stability, checked 2026-09-18

| Package | Version | Repo |
|---|---|---|
| `@deepgram/agents` | 0.1.2 | `deepgram/agent`, `packages/sdk` |
| `@deepgram/agents-widget` | 0.1.8 | `deepgram/agent`, `packages/widget` |
| `@deepgram/react` | 0.2.0 | `deepgram/react` |
| `@deepgram/ui` | 0.1.6 | `deepgram/ui` |

All four are pre-1.0 and `latest` is the only dist-tag on each. `@deepgram/ui`'s README states: "This library is pre-1.0. Interfaces may change between minor versions, and releases are cut as the library evolves rather than on a fixed schedule." Treat every export name here as true for the versions in that table and re-check `npm view <pkg> version` before trusting it. [3][4][5]

Declared runtime dependencies, as published: `@deepgram/agents` → `@deepgram/sdk` 5.9.0. `@deepgram/react@0.2.0` → `@deepgram/agents ^0.1.2`, with `react`/`react-dom` `>=18` as peers. `@deepgram/ui@0.1.6` → `@deepgram/react ^0.1.0` + `@deepgram/agents ^0.1.1` + Radix/Tailwind pieces. `@deepgram/agents-widget@0.1.8` → `@deepgram/react ^0.1.0`, `@deepgram/ui ^0.1.4`, `@deepgram/agents ^0.1.2`, `preact`. Note the `^0.1.0` ranges: they exclude `@deepgram/react@0.2.0`. [6]

## Browser auth: never the API key

A browser `WebSocket` cannot set request headers, so the SDK sends a short-lived bearer token as the `Sec-WebSocket-Protocol` handshake value. You supply that token through `tokenFactory`, which the SDK calls before every connect and every reconnect, so tokens can be seconds long. [1]

Mint them on your own server. `POST https://api.deepgram.com/v1/auth/grant` with your real key returns `{"access_token":"...","expires_in":30}`:

```js
// Server. The API key never leaves this process.
app.get("/api/deepgram-token", async (_req, res) => {
  const r = await fetch("https://api.deepgram.com/v1/auth/grant", {
    method: "POST",
    headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
               "Content-Type": "application/json" },
    body: JSON.stringify({ ttl_seconds: 30 }),
  });
  const { access_token } = await r.json();
  res.set("Cache-Control", "no-store").send(access_token);
});
```

Then `auth: { tokenFactory: () => fetch("/api/deepgram-token").then(r => r.text()) }` in React and the SDK, or a top-level `tokenFactory` in the widget. Put your own session check in front of that route: anyone who can call it can open an agent session billed to you. The `apiKey` auth mode exists for server-side use and local experiments only; in a browser bundle it is a published credential. [1][2]

## Widget: one call

```js
import { init } from "@deepgram/agents-widget";

const teardown = init({
  tokenFactory: () => fetch("/api/deepgram-token").then((r) => r.text()),
  agent: "YOUR_AGENT_ID", // a Reusable Agent Configuration UUID, or a full settings object
  layout: "floating",
  placement: "bottom-right",
});
// teardown() unmounts and removes injected styles — call it on SPA route change
```

`init` is the package's only function export; everything else it ships is types. For a no-build page, load the UMD bundle and call `DeepgramAgent.init(...)` — the global is `DeepgramAgent`. `https://cdn.deepgram.com/widgets/v0.1.8/widget.umd.js` serves a build byte-identical to npm 0.1.8 (414,517 bytes minified, ~91 KB gzipped; verified 2026-09-18). A `latest` path exists on that CDN and is a moving pointer, so pin the `v`-prefixed version in production. [2][8]

## React hooks

```tsx
import { AgentProvider, useAgentState, useAgentConversation } from "@deepgram/react";

const config = {
  auth: { tokenFactory: () => fetch("/api/deepgram-token").then((r) => r.text()) },
  agent: { think: { provider: { type: "open_ai" as const, model: "gpt-4o-mini" } } },
};

export default function App() {
  return <AgentProvider config={config}><Agent /></AgentProvider>;
}

function Agent() {
  const { state, start, stop } = useAgentState();       // idle | connecting | connected | reconnecting | disconnected
  const { conversation } = useAgentConversation();
  const onStart = async () => { try { await start(); } catch (e) { console.error(e); } };
  return (
    <>
      <button onClick={state === "idle" ? onStart : stop}>{state === "idle" ? "Start" : "Stop"}</button>
      {conversation.map((e) => <p key={e.id}><b>{e.role}:</b> {e.content}</p>)}
    </>
  );
}
```

The other hooks: `useAgentMode` (`idle`/`listening`/`thinking`/`speaking`), `useAgentMicrophone`, `useAgentPlayer`, `useAgentControls` (grouped lifecycle, messaging, runtime settings, mute), `useAgentClientTool` (register a function-call handler scoped to the component), `useAgentContext`, `useAgentSession` (the raw `AgentSession`), and `useDeepgramAgent` (no provider needed). `config`, `playerSampleRate`, and the initial `autoStart` fix the session for the provider's lifetime — change a connected agent with the runtime controls, not by mutating `config`. [4]

## React UI components

```tsx
import { AgentProvider, AgentConversation, AgentTextInput, AgentStartButton, Orb } from "@deepgram/ui";
import "@deepgram/ui/styles.css";

<AgentProvider config={config}>
  <div data-dg-agent>
    <Orb size={120} />
    <AgentConversation />
    <AgentTextInput />
    <AgentStartButton />
  </div>
</AgentProvider>
```

Components: `AgentStatus`, `AgentConversation`, `AgentMessage`, `AgentTextInput`, `AgentMicrophoneButton`, `AgentSpeakerButton`, `AgentStartButton`, plus `VoiceButton`, `Orb`, `LiveWaveform`, `BarVisualizer`, `MicSelector`, and `Response`. Styling is Tailwind v4 compiled into `@deepgram/ui/styles.css` and scoped to `[data-dg-agent]`; tokens are shadcn `--color-*` names you override on any `[data-dg-agent]` ancestor. `data-dg-scheme="dark"` on the same element forces dark; without it components follow `prefers-color-scheme`. A shadcn-compatible registry is published at `ui.deepgram.com`. [5]

## Raw SDK, any framework

```js
import { AgentSession, AgentMicrophone, AgentPlayer } from "@deepgram/agents";

const session = new AgentSession({
  auth: { tokenFactory: () => fetch("/api/deepgram-token").then((r) => r.text()) },
  agent: "YOUR_AGENT_ID",
});
const player = new AgentPlayer();                                  // default output 24000 Hz
const mic = new AgentMicrophone((data) => session.sendAudio(data)); // default capture 16000 Hz

session.on("audio", (chunk) => player.queue(chunk));
session.on("user-started-speaking", () => player.interrupt());      // barge-in
session.on("conversation-text", (m) => console.log(`${m.role}: ${m.content}`));

await session.connect();
await mic.start();
```

`AgentSession` handles the `Welcome`/`Settings`/`SettingsApplied` handshake, buffers mic frames until `SettingsApplied`, sends KeepAlive, and reconnects with jittered exponential backoff (`reconnect.maxAttempts` default 8). Runtime methods mirror the protocol: `updateListen`, `updateSpeak`, `updateThink`, `updatePrompt`, `injectUserMessage`, `injectAgentMessage`, `sendFunctionCallResponse`. Events are the protocol messages in kebab-case plus `audio`, `connecting`, `connected`, `reconnecting`, `disconnected`, `sdk-error`. `AgentMicrophone` and `AgentPlayer` expose `getInputVolume`/`getOutputVolume` and `getInput*/getOutputByteFrequencyData` for visualizers. [3]

## Upgrading `@deepgram/react` 0.1 to 0.2

0.2.0 shipped 2026-09-10 and is the only breaking release so far. Its five changes: [9]

1. `AgentMode` gained `"thinking"`. Fix exhaustive `switch`es and mode-to-label maps.
2. `AgentContextValue` and the hook result types gained required members. Consuming components need no change; typed mocks, wrappers, and hand-written implementations of those interfaces do.
3. `registerClientTool()` now returns an unsubscribe function. Ignoring it still works; store and call it when registering outside a component lifecycle. `useAgentClientTool()` still unregisters on unmount.
4. `useDeepgramAgent().start()` now clears `conversation` before connecting. Keep any transcript that must outlive a restart outside the hook. Manual `start()` now rejects on failure, so handle the promise; automatic and reconnect failures go to `onSdkError`.
5. New runtime controls on `useAgentControls()`/`useAgentConversation()`/`useDeepgramAgent()` — `updatePrompt`, `sendAgentMessage`, and friends — update a connected agent without recreating the provider. `onListenUpdated`, `onPromptUpdated`, `onSpeakUpdated`, `onThinkUpdated` observe the server acknowledgement.

## Common mistakes

1. Shipping the API key to the browser. `{ auth: { apiKey } }` in client code publishes a credential anyone can bill against. Use `tokenFactory` against a route you gate. [1]
2. `{"ttl": 30}` in the `/v1/auth/grant` body. The field is `ttl_seconds`; `ttl` is silently ignored and you get the 30-second default. Verified live 2026-09-18: `{"ttl":300}` returned `expires_in: 30`, `{"ttl_seconds":300}` returned `expires_in: 300`. The Browser Agent overview page shows `ttl`. [2]
3. Installing `@deepgram/react@0.2.0` next to `@deepgram/ui@0.1.6` and importing the provider from one and hooks from the other. `@deepgram/ui` declares `@deepgram/react ^0.1.0`, so npm nests a second copy at 0.1.0 and you get two React contexts — hooks read the wrong one or throw "used outside AgentProvider". Verified live 2026-09-18: `ui.AgentProvider === react.AgentProvider` was `false` on that install. Fix either way: import everything from `@deepgram/ui` alone, or add `"overrides": { "@deepgram/react": "0.2.0" }` (pnpm: `overrides`; yarn: `resolutions`) — with the override, npm deduped and the identity check returned `true`.
4. Forgetting `import "@deepgram/ui/styles.css"` or the `data-dg-agent` attribute on a wrapper. Every `@deepgram/ui` token is scoped to `[data-dg-agent]`, so without it the components render unstyled. [5]
5. Never calling `player.interrupt()` on `user-started-speaking` in a raw-SDK build. Deepgram stops generating, but your queued audio keeps talking over the caller. The React and widget layers do this for you. [3]
6. Mismatched sample rates. `AgentPlayer`'s `sampleRate` (default 24000) must equal `audio.output.sample_rate` in your agent settings, and `AgentMicrophone`'s (default 16000) must equal `audio.input.sample_rate`. [3]
7. Leaving `latest` in a production CDN `<script>` tag. Pin `v0.1.8`; these packages are pre-1.0 and minor releases may change interfaces. [8]
8. Expecting client-side Silero VAD. The Browser Agent overview and JavaScript SDK pages advertise optional Silero VAD, but no VAD option or export exists in `@deepgram/agents@0.1.2` or in `deepgram/agent`'s current `main`. Turn detection comes from the server-side listen provider — a Flux model with `version: "v2"`. Open the `voice-agent` skill for that.

## Use a different skill when

- You need the WebSocket contract these packages wrap — `Settings` fields, message lifecycle, barge-in, function calling, telephony: `voice-agent` skill.
- You need the full schema for any field or endpoint, including `/v1/auth/grant`: `api` skill (`references/agent.md`, `references/auth.md`).
- You want a full runnable app to clone rather than a package to add: `starters` skill (feature `voice-agent`), or `examples` skill for third-party platforms.
- You want a one-feature snippet: `recipes` skill.
- You are writing the token-minting server in Python, Go, Java, .NET, or Rust: that SDK's own skills, shipped from its repository.
- You want to find a docs page: `docs` skill. You want Deepgram docs queryable in your editor: `setup-mcp` skill.

## Sources

Verified 2026-09-18. Package facts come from the published tarballs installed in a clean `node:24` container and from each repo's `main`; live API behaviour from calls against `api.deepgram.com`.

1. https://developers.deepgram.com/docs/browser-agent-overview (layer choice, token factory, `Sec-WebSocket-Protocol`)
2. https://developers.deepgram.com/reference/auth/tokens/grant and https://developers.deepgram.com/guides/fundamentals/token-based-authentication (`ttl_seconds`, default 30 s; `ttl` behaviour verified live)
3. https://github.com/deepgram/agent (`packages/sdk`) and https://developers.deepgram.com/docs/browser-agent-javascript — exports read from `@deepgram/agents@0.1.2` `dist/index.d.ts`
4. https://github.com/deepgram/react and https://developers.deepgram.com/docs/browser-agent-react — hooks read from `@deepgram/react@0.2.0` `dist/index.d.ts`
5. https://github.com/deepgram/ui and https://developers.deepgram.com/docs/browser-agent-react-ui — components read from `@deepgram/ui@0.1.6` `dist/index.d.ts`; pre-1.0 wording quoted from the repo README
6. `npm view <pkg> version dist-tags dependencies peerDependencies` for all four packages
7. Runtime export check in `node:24`: `import * as ui from "@deepgram/ui"; Object.keys(ui)`
8. https://developers.deepgram.com/docs/browser-agent-widget — CDN URL, layouts, teardown; UMD global and byte-for-byte CDN/npm match verified by download
9. https://github.com/deepgram/react/blob/main/MIGRATION.md
10. https://github.com/deepgram/agent/tree/main/examples (17 examples: widget 01-07, React 10-15, UMD 20-23) and the live build at https://deepgram-agent-examples.fly.dev
