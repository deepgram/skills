---
name: setup-mcp
description: >
  Set up a Deepgram MCP server for your AI coding tool. Offers three paths: the Deepgram CLI
  MCP proxy (dg mcp), the standalone deepgram-mcp package, and the credential-free hosted
  documentation MCP. Use whenever someone wants to install Deepgram's agentic tools, set up
  the MCP server, or connect their editor to Deepgram.
---

# Install a Deepgram MCP Server

You are setting up Deepgram MCP integration for the user. Follow these steps.

## Step 1: Pick a path

Three paths exist. Pick by whether the user has, or wants, a Deepgram API key.

| Path | Server | Credentials | Install footprint |
|---|---|---|---|
| **A** | Deepgram CLI MCP proxy (`dg mcp`) | Deepgram API key **required** | Full CLI (`deepctl`) |
| **B** | Standalone `deepgram-mcp` | Deepgram API key **required** | One Python package |
| **C** | Hosted docs MCP (`/_mcp/server`) | **None** | Nothing to install |

Decision rule:

- The user already has the CLI, or wants `dg listen` / `dg speak` / `dg init` too → **Path A**.
- The user has an API key but wants only the MCP server, no CLI → **Path B**.
- The user has no API key, or wants something working in one command → **Path C**.

A key-authenticated hosted variant of Paths A/B also exists at `api.dx.deepgram.com/kapa/mcp`,
with nothing to install — see "The kapa endpoints are not credential-free" below.

Paths A and B are the same server: `dg mcp` wraps the `deepgram-mcp` package. Both proxy
Deepgram's developer API and fetch their tool list from Deepgram at runtime, so new tools
appear on reconnect without a package upgrade. As of this writing that list is a single
documentation and knowledge-source search tool (`search_deepgram_knowledge_sources`) — check
`tools/list` in the user's client for what is live rather than promising a tool set.

Paths A/B and Path C both answer Deepgram questions from documentation, so installing more
than one is usually redundant. Path C is the only one that works with no credentials.

## Step 2: Detect the environment

Determine which AI coding tool the user is running. Check for:

- **Claude Code** — look for a `.claude/` directory in the project or user home
- **Cursor** — look for a `.cursor/` directory in the project root
- **Windsurf** — look for a `.windsurf/` directory in the project root

If multiple are detected, or none are detected, ask the user which tool they want to configure.

## Step 3: Ask about scope

Ask the user whether they want the MCP server configured:

- **For this project only** (recommended for team repos)
- **Globally** (available in all projects)

---

## Path A — Deepgram CLI MCP proxy (`dg mcp`)

### A1. Install the CLI

Check first: `dg --version` (or `deepctl --version`, or `where dg` on Windows). The package is
`deepctl` and installs three interchangeable binaries — `dg`, `deepctl`, and `deepgram`.

```sh
# macOS / Linux — Homebrew (also brings in ffmpeg and portaudio)
brew tap deepgram/tap && brew install deepgram

# macOS / Linux — install script
curl -fsSL https://deepgram.com/install.sh | sh

# pip / uv / pipx
pip install deepctl
uv tool install deepctl
pipx install deepctl
```

```powershell
# Windows — PowerShell
iwr https://deepgram.com/install.ps1 -useb | iex
```

To upgrade, use the CLI's own updater: `dg update` (add `--check-only` to check without
installing). If it was installed with Homebrew, `brew upgrade deepgram` also works.

### A2. Authenticate — required

`dg mcp` will not start without credentials. Do this before configuring any editor:

```sh
dg login                  # interactive; or dg login --api-key <KEY>
dg whoami                 # confirm: "authenticated": true
```

`DEEPGRAM_API_KEY` in the environment works instead of `dg login`. Get a key at
<https://console.deepgram.com>.

### A3. Configure the editor

#### Claude Code

```sh
# Project scope
claude mcp add deepgram --scope project dg mcp

# User/global scope
claude mcp add deepgram dg mcp
```

#### Cursor

Write or merge into the project's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "deepgram": {
      "type": "stdio",
      "command": "dg",
      "args": ["mcp"]
    }
  }
}
```

#### Windsurf

Write or merge into the project's `.windsurf/mcp.json`, using the same object as Cursor above.

#### Without a permanent install

`uvx` and `pipx run` fetch `deepctl` on demand. Credentials still come from `dg login` or
`DEEPGRAM_API_KEY`:

```json
{
  "mcpServers": {
    "deepgram": {
      "command": "uvx",
      "args": ["deepctl", "mcp"]
    }
  }
}
```

#### Other tools

- **Transport:** stdio
- **Command:** `dg`
- **Args:** `["mcp"]`

`dg mcp --transport sse --port 8000` serves SSE instead, for clients that need HTTP.

---

## Path B — Standalone `deepgram-mcp`

The MCP server without the rest of the CLI. One package, one binary.

```sh
pip install deepgram-mcp
export DEEPGRAM_API_KEY=your_key_here
```

#### Claude Code

```sh
claude mcp add deepgram -- deepgram-mcp
```

#### Cursor / Windsurf

Write or merge into `.cursor/mcp.json` or the Windsurf MCP config:

```json
{
  "mcpServers": {
    "deepgram": {
      "command": "deepgram-mcp",
      "env": {
        "DEEPGRAM_API_KEY": "your_key_here"
      }
    }
  }
}
```

`--api-key` overrides the environment variable, and `--transport sse --port 8000` serves SSE.
Source: <https://github.com/deepgram/mcp>.

---

## Path C — Hosted documentation MCP (no credentials)

Use `https://developers.deepgram.com/_mcp/server`. It answers unauthenticated, needs no API
key, and exposes one tool, `searchDocs`, which returns documentation passages with source URLs.

#### Claude Code

```sh
# Project scope
claude mcp add deepgram-docs --scope project --transport http https://developers.deepgram.com/_mcp/server

# User/global scope
claude mcp add deepgram-docs --transport http https://developers.deepgram.com/_mcp/server
```

#### Cursor

Write or merge into the project's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "deepgram-docs": {
      "type": "http",
      "url": "https://developers.deepgram.com/_mcp/server"
    }
  }
}
```

#### Windsurf

Write or merge into the project's `.windsurf/mcp.json`, using the same object as Cursor above.

#### Other tools

- **Type:** HTTP
- **URL:** `https://developers.deepgram.com/_mcp/server`

### The kapa endpoints are not credential-free

`https://api.dx.deepgram.com/kapa/mcp` and `https://deepgram.mcp.kapa.ai` both exist, and both
reject an unauthenticated request with HTTP 401 plus a `WWW-Authenticate: Bearer
resource_metadata=...` header, so a client that implements MCP's OAuth flow can connect to either.
They differ in whether a Deepgram API key works:

- **`api.dx.deepgram.com/kapa/mcp` accepts a Deepgram API key.** Send it as either
  `Authorization: Token <KEY>` or `Authorization: Bearer <KEY>` and `initialize` returns 200 from
  `deepgram-mcp-relay`; an invalid key gets 401. `tools/list` returns the same single
  `search_deepgram_knowledge_sources` tool as Paths A and B, so this is the hosted HTTP form of
  the same server — useful when the user has a key but cannot install anything. Pass the key as a
  header, or the client falls back to OAuth:

  ```sh
  claude mcp add deepgram-relay --transport http https://api.dx.deepgram.com/kapa/mcp \
    --header "Authorization: Token $DEEPGRAM_API_KEY"
  ```
- **`deepgram.mcp.kapa.ai` does not.** A Deepgram API key gets 401 with either scheme. OAuth is
  the only way in.

Neither is the zero-setup option — use `/_mcp/server` for that.

---

## Step 4: Confirm

- **Claude Code** — run `/reload-plugins` to activate immediately, no restart needed.
- **Cursor / Windsurf / Other** — the user may need to restart or reload their tool.

Then tell the user the server is configured, and check what it actually exposes before
describing it — have the client list its tools rather than naming tools from memory.

For Path C, add:

> Your tool can now search Deepgram's documentation directly — try asking about API
> parameters, voice agents, or model capabilities.

Link them to [Deepgram Agentic Tools](https://developers.deepgram.com/developer-tools/agentic-tools)
for more details.

## Troubleshooting

**`Error: DEEPGRAM_API_KEY is not set in the configuration file (...config.yaml) or environment variable.`**
followed by `Run deepctl login to configure the CLI with your Deepgram account.`
→ Path A with no credentials. `dg mcp` exits 1 before serving anything. Run `dg login`, or set
`DEEPGRAM_API_KEY`. Confirm with `dg whoami`.

**`Error: No API key. Set DEEPGRAM_API_KEY or use --api-key.`**
→ Path B with no credentials. Export `DEEPGRAM_API_KEY`, put it in the server's `env` block, or
pass `--api-key`.

**`! Needs authentication` in `claude mcp list`, or HTTP 401 `{"status_code":401,"detail":"Authentication required"}` / `{"error":"invalid_token"}`**
→ You are pointed at a kapa endpoint with no credentials. Switch to
`https://developers.deepgram.com/_mcp/server`, which needs none. To stay on
`api.dx.deepgram.com/kapa/mcp`, add `--header "Authorization: Token $DEEPGRAM_API_KEY"` — that
endpoint accepts a Deepgram API key. On `deepgram.mcp.kapa.ai` an API key does not work; let the
client run its OAuth flow instead.

**`Server "deepgram-docs" is defined in multiple scopes with different endpoints`**
→ An earlier setup registered `deepgram-docs` at a kapa URL in user scope, and this one added a
different URL in project scope. OAuth tokens are stored per endpoint, so authenticating one does
not carry over. Keep one: `claude mcp remove deepgram-docs -s user` (or `-s project`). Check for
a pre-existing entry with `claude mcp get deepgram-docs` before adding, and pick a distinct
server name if the user wants to keep both.

**`ImportError` mentioning `streamablehttp_client` on startup**
→ An incompatible `mcp` package. `deepgram-mcp` imports `streamablehttp_client` from
`mcp.client.streamable_http`, which `mcp` 2.0 removed. Install into a clean environment, or pin
`mcp>=1.0.0,<2.0.0`. Installing `deepctl` pins this for you.

**The server connects but exposes fewer tools than expected**
→ Expected. Paths A and B fetch their tool list from Deepgram at runtime, so it reflects what
the API serves right now, not what the package version implies. Reconnect to pick up new tools.

**Anything else on Path A**
→ Verify `dg --version` works and `dg mcp` runs in a terminal without errors, then `dg update`.

## Sources

- Deepgram CLI — <https://github.com/deepgram/cli>
- `deepgram-mcp` — <https://github.com/deepgram/mcp>
- Deepgram Agentic Tools — <https://developers.deepgram.com/developer-tools/agentic-tools>
