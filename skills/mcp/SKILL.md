---
name: mcp
description: >
  Set up the Deepgram MCP server for querying Deepgram documentation directly from your AI
  coding tool. Detects the user's tool (Claude Code, Cursor, Windsurf, etc.) and runs the
  appropriate installation command. Use whenever someone wants to install Deepgram's agentic
  tools, set up the MCP server, or connect their editor to Deepgram docs.
---

# Install the Deepgram MCP Server

You are setting up the Deepgram documentation MCP server for the user. Follow these steps:

## Step 1: Check for deepctl

Run `which deepctl` (or `where deepctl` on Windows) to check if the Deepgram CLI is installed.

- **If found:** proceed silently — do not mention deepctl or suggest installing it.
- **If not found:** that's fine, continue without it. Do not prompt the user to install it.

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

### Claude Code

Run the appropriate command:

```sh
# Project scope
claude mcp add deepgram-docs --scope project --transport http https://deepgram.mcp.kapa.ai

# User/global scope
claude mcp add deepgram-docs --transport http https://deepgram.mcp.kapa.ai
```

### Cursor

Write or merge into the project's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "deepgram-docs": {
      "type": "http",
      "url": "https://deepgram.mcp.kapa.ai"
    }
  }
}
```

### Windsurf

Write or merge into the project's `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "deepgram-docs": {
      "type": "http",
      "url": "https://deepgram.mcp.kapa.ai"
    }
  }
}
```

### Other tools

If the user's tool is not listed above, provide the MCP server details and let them configure manually:

- **Type:** HTTP
- **URL:** `https://deepgram.mcp.kapa.ai`

## Step 5: Confirm

After installation:

- **Claude Code** — run `/reload-plugins` to activate immediately, no restart needed.
- **Cursor / Windsurf / Other** — the user may need to restart or reload their tool for the MCP server to become available.

Then tell the user:

> The Deepgram docs MCP server is now configured. Once active, your tool can query Deepgram's full documentation directly — try asking it about API parameters, voice agents, or model capabilities.

Link them to [Deepgram Agentic Tools](https://developers.deepgram.com/agentic-tools) for more details.

## Troubleshooting

If the MCP server fails to connect or behaves unexpectedly:

1. If `deepctl` is installed, suggest: `deepctl --version` to check they are on the latest version, and `pipx upgrade deepctl` or `pip install --upgrade deepctl` to update if needed.
2. If `deepctl` is not installed, suggest installing it: `pipx install deepctl` — it can help diagnose and configure Deepgram integrations.
3. Verify the MCP server URL is correct: `https://deepgram.mcp.kapa.ai`
