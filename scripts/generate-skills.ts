import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

const SPECS_DIR = join(import.meta.dirname, "..", "specs");
const REFS_DIR = join(import.meta.dirname, "..", "skills", "api", "references");

// ---------------------------------------------------------------------------
// $ref resolver
// ---------------------------------------------------------------------------

function resolveRef(root: any, ref: string): any {
  if (!ref.startsWith("#/")) return ref;
  const parts = ref.slice(2).split("/");
  let node = root;
  for (const p of parts) {
    node = node?.[p];
    if (node === undefined) return undefined;
  }
  return node;
}

function resolve(root: any, obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (obj.$ref) return resolve(root, resolveRef(root, obj.$ref));
  if (Array.isArray(obj)) return obj.map((item) => resolve(root, item));
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = resolve(root, value);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Schema formatting
// ---------------------------------------------------------------------------

function formatType(schema: any, depth = 0): string {
  if (!schema) return "any";
  if (schema.enum) return schema.enum.map((v: any) => `\`${v}\``).join(" | ");
  if (schema.const) return `\`${schema.const}\``;
  if (schema.oneOf)
    return schema.oneOf.map((s: any) => formatType(s, depth)).join(" | ");
  if (schema.type === "array")
    return `${formatType(schema.items, depth)}[]`;
  if (schema.type === "object" && schema.properties && depth < 2) {
    const props = Object.entries(schema.properties)
      .map(([k, v]: [string, any]) => `${k}: ${formatType(v, depth + 1)}`)
      .join(", ");
    return `{ ${props} }`;
  }
  return schema.type ?? "any";
}

function describeSchema(schema: any, indent = ""): string {
  if (!schema?.properties) return "";
  const lines: string[] = [];
  for (const [name, prop] of Object.entries(schema.properties) as [
    string,
    any,
  ][]) {
    const required = schema.required?.includes(name) ? " **(required)**" : "";
    const type = formatType(prop);
    const desc = prop.description ? ` — ${prop.description}` : "";
    const def = prop.default !== undefined ? ` (default: \`${prop.default}\`)` : "";
    lines.push(`${indent}- \`${name}\` ${type}${required}${def}${desc}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// OpenAPI → markdown
// ---------------------------------------------------------------------------

interface ApiGroup {
  tag: string;
  description?: string;
  endpoints: EndpointInfo[];
}

interface EndpointInfo {
  method: string;
  path: string;
  summary: string;
  description: string;
  server?: string;
  parameters: any[];
  requestBody?: any;
  responses: any;
}

function normalizeTag(rawTag: string | undefined, path: string): string {
  const t = (rawTag ?? "").toLowerCase();
  const p = path.toLowerCase();
  if (t.includes("listen") || p.includes("/listen")) return "Listen";
  if (t.includes("speak") || p.includes("/speak")) return "Speak";
  if (t.includes("voiceagent") || p.includes("/agent")) return "Agent";
  if (t.includes("agent")) return "Agent";
  if (t.includes("read") || p.includes("/read")) return "Read";
  if (t.includes("selfhost") || t.includes("self-host") || t.includes("onprem") || p.includes("/selfhosted") || p.includes("/onprem")) return "Self-Hosted";
  if (t.includes("models") || p.match(/\/models(\/|$)/)) return "Models";
  if (t.includes("auth") || p.includes("/auth/")) return "Auth";
  if (
    t.includes("manage") || t.includes("projects") || t.includes("keys") ||
    t.includes("members") || t.includes("invites") || t.includes("usage") ||
    t.includes("billing") || t.includes("scopes") || p.includes("/projects")
  ) return "Projects";
  return "Other";
}

function groupOpenApiEndpoints(spec: any): Map<string, ApiGroup> {
  const groups = new Map<string, ApiGroup>();
  const paths = spec.paths ?? {};

  for (const [path, pathObj] of Object.entries(paths) as [string, any][]) {
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const op = pathObj[method];
      if (!op) continue;

      const tag = normalizeTag(op.tags?.[0], path);

      if (!groups.has(tag)) {
        groups.set(tag, { tag, endpoints: [] });
      }

      const server = pathObj.servers?.[0]?.url;
      const params = (op.parameters ?? []).map((p: any) => resolve(spec, p));
      const reqBody = op.requestBody ? resolve(spec, op.requestBody) : undefined;
      const responses = resolve(spec, op.responses ?? {});

      groups.get(tag)!.endpoints.push({
        method: method.toUpperCase(),
        path,
        summary: op.summary ?? "",
        description: op.description ?? "",
        server,
        parameters: params,
        requestBody: reqBody,
        responses,
      });
    }
  }

  return groups;
}

function renderEndpoint(ep: EndpointInfo): string {
  const lines: string[] = [];
  lines.push(`### ${ep.method} \`${ep.path}\``);
  if (ep.server) lines.push(`> Server: \`${ep.server}\``);
  lines.push("");
  if (ep.summary) lines.push(ep.summary);
  if (ep.description && ep.description !== ep.summary)
    lines.push("", ep.description);
  lines.push("");

  // Query parameters
  const queryParams = ep.parameters.filter((p: any) => p.in === "query");
  if (queryParams.length > 0) {
    lines.push("#### Query Parameters", "");
    for (const p of queryParams) {
      const type = formatType(p.schema);
      const req = p.required ? " **(required)**" : "";
      const def =
        p.schema?.default !== undefined
          ? ` (default: \`${p.schema.default}\`)`
          : "";
      const desc = p.description ? ` — ${p.description}` : "";
      lines.push(`- \`${p.name}\` ${type}${req}${def}${desc}`);
    }
    lines.push("");
  }

  // Request body
  if (ep.requestBody) {
    lines.push("#### Request Body", "");
    for (const [contentType, media] of Object.entries(
      ep.requestBody.content ?? {}
    ) as [string, any][]) {
      lines.push(`**${contentType}**`, "");
      if (media.schema) {
        const desc = describeSchema(media.schema);
        if (desc) lines.push(desc, "");
      }
    }
  }

  // Responses
  if (ep.responses) {
    lines.push("#### Responses", "");
    for (const [status, resp] of Object.entries(ep.responses) as [
      string,
      any,
    ][]) {
      lines.push(`**${status}**: ${(resp as any).description ?? ""}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// AsyncAPI → markdown
// ---------------------------------------------------------------------------

interface ChannelInfo {
  name: string;
  address: string;
  description: string;
  server?: string;
  queryParams?: any;
  sendMessages: MessageInfo[];
  receiveMessages: MessageInfo[];
}

interface MessageInfo {
  name: string;
  description: string;
  payload?: any;
}

function messageName(refPath: string | undefined, resolved: any): string {
  if (resolved?.name) return resolved.name;
  if (resolved?.title) return resolved.title;
  if (refPath) {
    const last = refPath.split("/").pop() ?? "";
    return last
      .replace(/Message$|Event$/, "")
      .replace(/^.*-\d+-/, "");
  }
  return "Unknown";
}

function extractMessages(spec: any, op: any): MessageInfo[] {
  if (!op?.message) return [];
  const variants = op.message.oneOf ?? [op.message];
  const out: MessageInfo[] = [];
  for (const v of variants) {
    const refPath = v?.$ref;
    const resolved = resolve(spec, v);
    out.push({
      name: messageName(refPath, resolved),
      description: resolved?.description ?? op.description ?? op.summary ?? "",
      payload: resolved?.payload ? resolve(spec, resolved.payload) : undefined,
    });
  }
  return out;
}

function extractChannels(spec: any): ChannelInfo[] {
  const channels: ChannelInfo[] = [];
  const rawChannels = spec.channels ?? {};

  for (const [name, ch] of Object.entries(rawChannels) as [string, any][]) {
    if (!ch || typeof ch !== "object") continue;

    const address = ch.address ?? name;

    const serverHost = spec.servers?.Production?.url
      ?? spec.servers?.production?.url
      ?? spec.servers?.[Object.keys(spec.servers ?? {})[0]]?.url;

    const queryParams = ch.bindings?.ws?.query;

    const publishMsgs = extractMessages(spec, ch.publish);
    const subscribeMsgs = extractMessages(spec, ch.subscribe);

    channels.push({
      name,
      address,
      description: ch.description ?? ch.publish?.description ?? ch.subscribe?.description ?? "",
      server: resolveChannelServer(name, serverHost),
      queryParams: queryParams ? resolve(spec, queryParams) : undefined,
      sendMessages: subscribeMsgs,
      receiveMessages: publishMsgs,
    });
  }

  return channels;
}

// Voice Agent runs on a dedicated server (`wss://agent.deepgram.com`). The
// AsyncAPI spec declares only one global server, so per-channel servers are
// applied here until the spec encodes them natively.
function resolveChannelServer(channelName: string, specServer: string | undefined): string | undefined {
  if (channelName.toLowerCase().includes("/agent")) {
    return "wss://agent.deepgram.com";
  }
  if (!specServer) return undefined;
  return specServer.startsWith("ws://") || specServer.startsWith("wss://")
    ? specServer.replace(/\/$/, "")
    : `wss://${specServer.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
}

function renderChannel(ch: ChannelInfo): string {
  const lines: string[] = [];
  lines.push(`### WebSocket \`${ch.address}\``);
  if (ch.server) lines.push(`> Server: \`${ch.server}\``);
  lines.push("", ch.description, "");

  if (ch.queryParams?.properties) {
    lines.push("#### Connection Parameters", "");
    lines.push(describeSchema(ch.queryParams), "");
  }

  if (ch.sendMessages.length > 0) {
    lines.push("#### Client → Server Messages", "");
    for (const msg of ch.sendMessages) {
      lines.push(`**${msg.name}**${msg.description ? ` — ${msg.description}` : ""}`);
      if (msg.payload) {
        const desc = describeSchema(msg.payload, "  ");
        if (desc) lines.push("", desc);
      }
      lines.push("");
    }
  }

  if (ch.receiveMessages.length > 0) {
    lines.push("#### Server → Client Messages", "");
    for (const msg of ch.receiveMessages) {
      lines.push(`**${msg.name}**${msg.description ? ` — ${msg.description}` : ""}`);
      if (msg.payload) {
        const desc = describeSchema(msg.payload, "  ");
        if (desc) lines.push("", desc);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Map channels to API domains
// ---------------------------------------------------------------------------

function channelDomain(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("/listen") || n.startsWith("listen")) return "Listen";
  if (n.includes("/speak") || n.startsWith("speak")) return "Speak";
  if (n.includes("/agent") || n.startsWith("agent")) return "Agent";
  return "Other";
}

// ---------------------------------------------------------------------------
// Auth section (shared)
// ---------------------------------------------------------------------------

function renderAuth(spec: any): string {
  const schemes = spec.components?.securitySchemes ?? {};
  const lines: string[] = [
    "## Authentication",
    "",
    "All API requests require authentication. Two methods are supported:",
    "",
  ];

  for (const [name, scheme] of Object.entries(schemes) as [string, any][]) {
    const resolved = resolve(spec, scheme);
    lines.push(`### ${name}`);
    if (resolved.description) lines.push("", resolved.description);
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  Listen: "Speech-to-text transcription — convert audio and video into text.",
  Speak: "Text-to-speech synthesis — convert text into natural-sounding audio.",
  Read: "Text analysis — analyze and understand text content.",
  Agent: "Voice Agent — build conversational voice agents.",
  Models: "Model management — list and query available models.",
  Auth: "Authentication — manage API keys and temporary tokens.",
  Projects: "Project management — manage projects, keys, members, and usage.",
};

const DOMAIN_DOCS: Record<string, string[]> = {
  Listen: [
    "- [Speech-to-Text Getting Started](https://developers.deepgram.com/docs/stt/getting-started)",
    "- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)",
  ],
  Speak: [
    "- [Text-to-Speech Docs](https://developers.deepgram.com/docs/tts-rest)",
    "- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)",
  ],
  Read: [
    "- [Text and Audio Intelligence](https://developers.deepgram.com/docs/audio-intelligence)",
    "- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)",
  ],
  Agent: [
    "- [Voice Agent Docs](https://developers.deepgram.com/docs/voice-agent)",
    "- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)",
  ],
  "Self-Hosted": [
    "- [Self-Hosted Deployments](https://developers.deepgram.com/docs/self-hosted-introduction)",
    "- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)",
  ],
  Models: [
    "- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)",
  ],
  Auth: [
    "- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)",
  ],
  Projects: [
    "- [API Reference](https://developers.deepgram.com/reference/deepgram-api-overview)",
  ],
};

function main() {
  const openApiRaw = readFileSync(join(SPECS_DIR, "openapi.yml"), "utf-8");
  const asyncApiRaw = readFileSync(join(SPECS_DIR, "asyncapi.yml"), "utf-8");

  const openApi = parse(openApiRaw);
  const asyncApi = parse(asyncApiRaw);

  mkdirSync(REFS_DIR, { recursive: true });

  // Group REST endpoints
  const restGroups = groupOpenApiEndpoints(openApi);

  // Group WebSocket channels
  const channels = extractChannels(asyncApi);
  const wsGroups = new Map<string, ChannelInfo[]>();
  for (const ch of channels) {
    const domain = channelDomain(ch.name);
    if (!wsGroups.has(domain)) wsGroups.set(domain, []);
    wsGroups.get(domain)!.push(ch);
  }

  // Determine all domains
  const allDomains = new Set([...restGroups.keys(), ...wsGroups.keys()]);

  const auth = renderAuth(openApi);

  for (const domain of allDomains) {
    const lines: string[] = [];
    const desc = DOMAIN_DESCRIPTIONS[domain] ?? "";

    lines.push(`# Deepgram ${domain} API`);
    lines.push("");
    if (desc) lines.push(desc, "");

    const docs = DOMAIN_DOCS[domain];
    if (docs) {
      lines.push("## Documentation", "", ...docs, "");
    }

    lines.push(auth, "");

    // REST endpoints
    const rest = restGroups.get(domain);
    if (rest && rest.endpoints.length > 0) {
      lines.push("## REST API", "");
      for (const ep of rest.endpoints) {
        lines.push(renderEndpoint(ep));
      }
    }

    // WebSocket channels
    const ws = wsGroups.get(domain);
    if (ws && ws.length > 0) {
      lines.push("## WebSocket API", "");
      for (const ch of ws) {
        lines.push(renderChannel(ch));
      }
    }

    const filename = `${domain.toLowerCase()}.md`;
    const dest = join(REFS_DIR, filename);
    writeFileSync(dest, lines.join("\n"), "utf-8");
    console.log(`Generated references/${filename}`);
  }

  console.log("Done.");
}

main();
