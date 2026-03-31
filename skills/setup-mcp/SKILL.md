---
name: setup-mcp
description: >
  Set up the Deepgram MCP server for your AI coding tool. Checks whether the Deepgram CLI
  (dg/deepctl) is installed: if so, uses the local CLI MCP server (dg mcp) for full tool
  access; otherwise offers the hosted documentation MCP or suggests installing the CLI.
  Use whenever someone wants to install Deepgram's agentic tools, set up the MCP server,
  or connect their editor to Deepgram.
---

# Install the Deepgram MCP Server

You are setting up Deepgram MCP integration for the user. Follow these steps:

## Step 1: Check for the Deepgram CLI

Run `dg --version` (or `deepctl --version`, or `where dg` on Windows) to check if the
Deepgram CLI is installed.

- **If found:** use the **local CLI MCP** (`dg mcp`) — this gives full access to Deepgram
  tools including transcription, text-to-speech, project management, and more.
- **If not found:** use the **hosted documentation MCP** and offer to install the CLI.

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

## Step 4: Install

---

### If the Deepgram CLI (`dg`) IS installed — use the local CLI MCP

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
      "command": "dg",
      "args": ["mcp"]
    }
  }
}
```

#### Windsurf

Write or merge into the project's `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "deepgram": {
      "command": "dg",
      "args": ["mcp"]
    }
  }
}
```

#### Other tools

Provide the MCP server command and let them configure manually:

- **Transport:** stdio
- **Command:** `dg`
- **Args:** `["mcp"]`

---

### If the Deepgram CLI is NOT installed — use the hosted docs MCP

Tell the user:

> The Deepgram CLI isn't installed. You can either:
> 1. **Install the CLI** (`pipx install deepctl`) for full Deepgram tool access, then re-run `/deepgram:setup-mcp`
> 2. **Use the hosted MCP** for documentation queries right now

If they choose the hosted MCP (or want it alongside the CLI):

#### Claude Code

```sh
# Project scope
claude mcp add deepgram-docs --scope project --transport http https://api.dx.deepgram.com/kapa/mcp

# User/global scope
claude mcp add deepgram-docs --transport http https://api.dx.deepgram.com/kapa/mcp
```

#### Cursor

Write or merge into the project's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "deepgram-docs": {
      "type": "http",
      "url": "https://api.dx.deepgram.com/kapa/mcp"
    }
  }
}
```

#### Windsurf

Write or merge into the project's `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "deepgram-docs": {
      "type": "http",
      "url": "https://api.dx.deepgram.com/kapa/mcp"
    }
  }
}
```

#### Other tools

Provide the MCP server details and let them configure manually:

- **Type:** HTTP
- **URL:** `https://api.dx.deepgram.com/kapa/mcp`

---

## Step 5: Confirm

After installation:

- **Claude Code** — run `/reload-plugins` to activate immediately, no restart needed.
- **Cursor / Windsurf / Other** — the user may need to restart or reload their tool.

Then tell the user:

> The Deepgram MCP server is now configured.

If using the CLI MCP (`dg mcp`), add:
> Available tools include transcription, text-to-speech, project management, and usage
> queries. Try asking to transcribe an audio file or convert text to speech.

If using the hosted docs MCP, add:
> Your tool can now query Deepgram's full documentation directly — try asking about API
> parameters, voice agents, or model capabilities.

Link them to [Deepgram Agentic Tools](https://developers.deepgram.com/agentic-tools) for more details.

## Troubleshooting

If the MCP server fails to connect:

1. For the CLI MCP: verify `dg --version` works and `dg mcp` runs without errors. Update
   with `pipx upgrade deepctl` or `pip install --upgrade deepctl`.
2. For the hosted MCP: verify the URL `https://api.dx.deepgram.com/kapa/mcp` is accessible.
3. To install the CLI: `pipx install deepctl`
