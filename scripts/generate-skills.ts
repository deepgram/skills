import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

const SPECS_DIR = join(import.meta.dirname, "..", "specs");
const REFS_DIR = join(import.meta.dirname, "..", "skills", "api", "references");

// ---------------------------------------------------------------------------
// $ref resolver
// ---------------------------------------------------------------------------

// Deepgram's AsyncAPI document uses component keys that contain a literal `/`
// (for example `components.messages["subpackage_agent/v1.agent.v1-client-0-..."]`)
// without escaping it as `~1`. A naive segment-by-segment walk therefore misses
// every WebSocket message. Walk longest-key-first so both escaped and
// unescaped pointers resolve.
function resolvePointer(node: any, parts: string[]): any {
  if (parts.length === 0) return node;
  if (node === null || typeof node !== "object") return undefined;
  for (let take = parts.length; take >= 1; take--) {
    const key = parts.slice(0, take).join("/");
    if (Object.prototype.hasOwnProperty.call(node, key)) {
      const found = resolvePointer(node[key], parts.slice(take));
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function resolveRef(root: any, ref: string): any {
  if (!ref.startsWith("#/")) return ref;
  const parts = ref
    .slice(2)
    .split("/")
    .map((p) => decodeURIComponent(p).replace(/~1/g, "/").replace(/~0/g, "~"));
  return resolvePointer(root, parts);
}

// Deep enough for the Voice Agent `Settings` tree, which nests provider
// unions several levels down. Cycles are caught by the per-path `seen` set,
// not by this cap.
const MAX_RESOLVE_DEPTH = 40;

function resolve(root: any, obj: any, seen: Set<any> = new Set(), depth = 0): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (depth > MAX_RESOLVE_DEPTH) return obj;
  if (obj.$ref) {
    const target = resolveRef(root, obj.$ref);
    if (target === undefined) return obj;
    // Guard against self-referential schemas.
    if (seen.has(target)) return { type: "object" };
    const nextSeen = new Set(seen).add(target);
    const resolved = resolve(root, target, nextSeen, depth + 1);
    // JSON Schema 2020-12 / OpenAPI 3.1 allow keywords alongside `$ref`, and
    // Deepgram's specs put per-site `default` and `description` there. Keep
    // them: the sibling is the more specific statement.
    const siblings = Object.entries(obj).filter(([k]) => k !== "$ref");
    if (siblings.length === 0) return resolved;
    if (resolved === null || typeof resolved !== "object" || Array.isArray(resolved)) {
      return resolved;
    }
    const merged: any = { ...resolved };
    for (const [k, v] of siblings) merged[k] = resolve(root, v, nextSeen, depth + 1);
    return merged;
  }
  if (Array.isArray(obj)) return obj.map((item) => resolve(root, item, seen, depth + 1));
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = resolve(root, value, seen, depth + 1);
  }
  return result;
}

// ---------------------------------------------------------------------------
// "Any type" stub repair
// ---------------------------------------------------------------------------
//
// Several connection-level parameters `$ref` a placeholder component that
// carries no type information and the literal description `Any type` — for
// example `ListenV2EotThreshold`, which is how every Flux STT tuning knob is
// declared. The real prose exists in the spec, on a concrete inline definition
// of the same parameter somewhere else (the REST query parameter for the same
// path, or an inline message-schema property). Look it up instead of letting
// the placeholder render as "`x` any — Any type".

function normalizeWords(s: string): string {
  return s.toLowerCase().replace(/^(the|a|an)\s+/, "").replace(/[^a-z0-9]/g, "");
}

// A description is useless if it is missing, is the `Any type` placeholder, is
// just the schema title, or merely restates the property name ("The channels").
function isUselessDescription(desc: unknown, propName?: string, title?: unknown): boolean {
  if (desc === undefined || desc === null) return true;
  const d = String(desc).trim();
  if (d === "") return true;
  if (/^any type$/i.test(d)) return true;
  if (title !== undefined && d === String(title).trim()) return true;
  if (propName && normalizeWords(d) === normalizeWords(propName)) return true;
  return false;
}

// A schema is concrete if it says anything at all about the shape of the value.
function isConcreteSchema(s: any): boolean {
  if (!s || typeof s !== "object") return false;
  return (
    s.type !== undefined ||
    s.enum !== undefined ||
    s.oneOf !== undefined ||
    s.anyOf !== undefined ||
    s.const !== undefined ||
    s.properties !== undefined ||
    s.items !== undefined
  );
}

function isStub(propName: string, prop: any): boolean {
  return (
    !isConcreteSchema(prop) &&
    isUselessDescription(prop?.description, propName, prop?.title)
  );
}

type StubRepairer = (propName: string, prop: any) => any;

const IDENTITY_REPAIRER: StubRepairer = (_name, prop) => prop;

function inheritFrom(prop: any, donor: any): any {
  const out: any = { ...donor, ...prop };
  // The stub's own description/title are the thing we are replacing.
  out.description = donor.description;
  if (donor.title !== undefined) out.title = donor.title;
  else delete out.title;
  return out;
}

// Index every concrete, inline property definition in a document by property
// name, so a stub can inherit from a same-named sibling elsewhere in the spec.
function buildPropertyIndex(spec: any): Map<string, any[]> {
  const index = new Map<string, any[]>();
  const visited = new Set<any>();
  const walk = (node: any) => {
    if (!node || typeof node !== "object" || visited.has(node)) return;
    visited.add(node);
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    const props = node.properties;
    if (props && typeof props === "object" && !Array.isArray(props)) {
      for (const [name, value] of Object.entries<any>(props)) {
        if (!value || typeof value !== "object" || value.$ref) continue;
        if (!isConcreteSchema(value)) continue;
        if (isUselessDescription(value.description, name, value.title)) continue;
        if (!index.has(name)) index.set(name, []);
        index.get(name)!.push(value);
      }
    }
    for (const value of Object.values(node)) walk(value);
  };
  walk(spec);
  return index;
}

// Query parameters of a single REST operation, keyed by name. A WebSocket
// channel's connection parameters are the same parameters as the REST
// operation on the same path, so this is the most specific donor available.
function restQueryParamsByPath(spec: any): Map<string, Map<string, any>> {
  const byPath = new Map<string, Map<string, any>>();
  for (const [path, pathObj] of Object.entries<any>(spec.paths ?? {})) {
    const params = new Map<string, any>();
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      for (const raw of pathObj?.[method]?.parameters ?? []) {
        const p = resolve(spec, raw);
        if (p?.in !== "query" || !p.name) continue;
        if (isUselessDescription(p.description, p.name, p.schema?.title)) continue;
        params.set(p.name, { ...(p.schema ?? {}), description: p.description });
      }
    }
    if (params.size > 0) byPath.set(path, params);
  }
  return byPath;
}

const unresolvedStubs = new Set<string>();

function makeStubRepairer(
  scoped: Map<string, any> | undefined,
  index: Map<string, any[]>
): StubRepairer {
  return (propName: string, prop: any) => {
    if (!isStub(propName, prop)) return prop;
    const donor = scoped?.get(propName);
    if (donor) return inheritFrom(prop, donor);
    const candidates = index.get(propName) ?? [];
    const distinct = new Set(
      candidates.map((c) => String(c.description).trim())
    );
    // Only inherit when the spec is unambiguous about what this parameter is.
    // `language` and `version`, for instance, mean different things in
    // different places, so leave those alone rather than guess.
    if (candidates.length > 0 && distinct.size === 1) {
      return inheritFrom(prop, candidates[0]);
    }
    unresolvedStubs.add(propName);
    return prop;
  };
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
  if (schema.properties) {
    if (depth < 2) {
      const props = Object.entries(schema.properties)
        .map(([k, v]: [string, any]) => `${k}: ${formatType(v, depth + 1)}`)
        .join(", ");
      return `{ ${props} }`;
    }
    // Past the inline-expansion depth, say `object` rather than `any` — the
    // shape is known, it is just not worth spelling out here.
    return "object";
  }
  return schema.type ?? "any";
}

// Spec descriptions are frequently multi-paragraph. Dropped into a list item
// verbatim, the unindented continuation lines terminate the surrounding
// markdown list. Indent them to the item's content column instead.
function inlineDescription(desc: unknown, indent: string): string {
  const text = String(desc).replace(/\s+$/, "");
  if (!text.includes("\n")) return text;
  return text
    .split("\n")
    .map((line, i) => (i === 0 ? line : line.trim() === "" ? "" : `${indent}  ${line}`))
    .join("\n");
}

function describeSchema(
  schema: any,
  indent = "",
  repair: StubRepairer = IDENTITY_REPAIRER
): string {
  if (!schema?.properties) return "";
  const lines: string[] = [];
  for (const [name, raw] of Object.entries(schema.properties) as [
    string,
    any,
  ][]) {
    const prop = repair(name, raw);
    const required = schema.required?.includes(name) ? " **(required)**" : "";
    const type = formatType(prop);
    const desc = prop.description
      ? ` — ${inlineDescription(prop.description, indent)}`
      : "";
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

// Paths that own the self-hosted (distribution credentials) domain. These are
// matched by path, not by tag: upstream has already renamed the tag once
// (`selfHosted > v1 > distributionCredentials` -> `distributionCredentials`),
// and when the tag stopped matching these endpoints silently fell through to
// the Projects bucket. The path is the stable identity.
const SELF_HOSTED_PATHS =
  /\/self-?hosted(\/|$)|\/onprem(ise)?(\/|$)|\/distribution\/credentials(\/|$)/;

// Every test below is checked against both the tag and the path, on purpose.
// Upstream tags are resource-level nouns (`media`, `audio`, `text`, `tokens`,
// `distributionCredentials`, ...), so as of today it is the PATH tests that do
// all of the routing and the tag tests that match nothing. Keep both: the tag
// tests cost nothing and catch a future rename, and every domain is pinned by
// at least one path test so no bucket can silently empty out again.
function normalizeTag(rawTag: string | undefined, path: string): string {
  const t = (rawTag ?? "").toLowerCase();
  const p = path.toLowerCase();
  // Self-hosted first: its paths also contain `/projects`, so a later test
  // would swallow them.
  if (
    t.includes("selfhost") ||
    t.includes("self-host") ||
    t.includes("onprem") ||
    t.includes("distributioncredentials") ||
    SELF_HOSTED_PATHS.test(p)
  )
    return "Self-Hosted";
  if (t.includes("listen") || p.includes("/listen")) return "Listen";
  if (t.includes("speak") || p.includes("/speak")) return "Speak";
  if (t.includes("voiceagent") || p.includes("/agent")) return "Agent";
  if (t.includes("agent")) return "Agent";
  if (t.includes("read") || p.includes("/read")) return "Read";
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

function renderEndpoint(
  ep: EndpointInfo,
  repair: StubRepairer = IDENTITY_REPAIRER
): string {
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
      const schema = repair(p.name, {
        ...(p.schema ?? {}),
        description: p.description ?? p.schema?.description,
      });
      const type = formatType(schema);
      const req = p.required ? " **(required)**" : "";
      const def =
        schema?.default !== undefined
          ? ` (default: \`${schema.default}\`)`
          : "";
      const desc = schema.description
        ? ` — ${inlineDescription(schema.description, "")}`
        : "";
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
        const desc = describeSchema(media.schema, "", repair);
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
    // Strip only the `<...>-<index>-` component-key prefix. The name is the
    // literal `type` value clients send or match on, so it must survive
    // verbatim — trimming a trailing `Message`/`Event` turned
    // `AgentV1InjectUserMessage` into a type value the API rejects.
    const last = refPath.split("/").pop() ?? "";
    return last.replace(/^.*-\d+-/, "");
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

function renderChannel(
  ch: ChannelInfo,
  repair: StubRepairer = IDENTITY_REPAIRER
): string {
  const lines: string[] = [];
  lines.push(`### WebSocket \`${ch.address}\``);
  if (ch.server) lines.push(`> Server: \`${ch.server}\``);
  lines.push("", ch.description, "");

  if (ch.queryParams?.properties) {
    lines.push("#### Connection Parameters", "");
    lines.push(describeSchema(ch.queryParams, "", repair), "");
  }

  if (ch.sendMessages.length > 0) {
    lines.push("#### Client → Server Messages", "");
    for (const msg of ch.sendMessages) {
      lines.push(
        `**${msg.name}**${msg.description ? ` — ${inlineDescription(msg.description, "")}` : ""}`
      );
      if (msg.payload) {
        const desc = describeSchema(msg.payload, "  ", repair);
        if (desc) lines.push("", desc);
      }
      lines.push("");
    }
  }

  if (ch.receiveMessages.length > 0) {
    lines.push("#### Server → Client Messages", "");
    for (const msg of ch.receiveMessages) {
      lines.push(
        `**${msg.name}**${msg.description ? ` — ${inlineDescription(msg.description, "")}` : ""}`
      );
      if (msg.payload) {
        const desc = describeSchema(msg.payload, "  ", repair);
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
  "Self-Hosted":
    "Self-hosted deployments — manage the distribution credentials used to pull Deepgram container images.",
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

  // Donors for repairing `Any type` placeholder components.
  const restParamsByPath = restQueryParamsByPath(openApi);
  const asyncIndex = buildPropertyIndex(asyncApi);
  const openApiIndex = buildPropertyIndex(openApi);
  const combinedIndex = new Map<string, any[]>(asyncIndex);
  for (const [name, defs] of openApiIndex) {
    combinedIndex.set(name, [...(combinedIndex.get(name) ?? []), ...defs]);
  }
  const repairerFor = (path: string | undefined) =>
    makeStubRepairer(path ? restParamsByPath.get(path) : undefined, combinedIndex);

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
  const emitted = new Set<string>();

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
        lines.push(renderEndpoint(ep, repairerFor(ep.path)));
      }
    }

    // WebSocket channels
    const ws = wsGroups.get(domain);
    if (ws && ws.length > 0) {
      lines.push("## WebSocket API", "");
      for (const ch of ws) {
        lines.push(renderChannel(ch, repairerFor(ch.address)));
      }
    }

    const filename = `${domain.toLowerCase()}.md`;
    const dest = join(REFS_DIR, filename);
    writeFileSync(dest, lines.join("\n"), "utf-8");
    emitted.add(filename);
    console.log(`Generated references/${filename}`);
  }

  // Prune pass. references/ is wholly generated from the specs, so anything
  // this run did not emit is stale. Deleting is the right call rather than
  // erroring out: a stale reference file is worse than a missing one because
  // agents read it and act on it, and it produces no diff, so it stays
  // invisible in review forever. (That is exactly how `self-hosted.md` was
  // orphaned when the upstream tag was renamed.) Deleting makes the output a
  // pure function of the specs, keeps reruns idempotent, and surfaces the
  // change as a visible deletion in `git status` / `git diff --stat`.
  const pruned: string[] = [];
  for (const entry of readdirSync(REFS_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    if (emitted.has(entry.name)) continue;
    rmSync(join(REFS_DIR, entry.name));
    pruned.push(entry.name);
    console.log(`Pruned orphaned references/${entry.name} (no longer in the spec)`);
  }

  console.log(
    `Done. ${emitted.size} reference file(s) generated, ${pruned.length} pruned.`
  );
  if (pruned.length > 0) {
    console.log(
      "NOTE: pruned files were routed elsewhere or dropped upstream — check " +
        "skills/api/SKILL.md for links that now point at nothing."
    );
  }
  if (unresolvedStubs.size > 0) {
    console.log(
      `NOTE: ${unresolvedStubs.size} parameter(s) still have no usable description in the spec ` +
        `and render as \`any\`: ${[...unresolvedStubs].sort().join(", ")}. ` +
        "These need a spec fix upstream."
    );
  }
}

main();
