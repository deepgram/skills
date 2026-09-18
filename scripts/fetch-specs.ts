import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

const SPECS_DIR = join(import.meta.dirname, "..", "specs");

// Which root key the document must declare, per target filename.
const EXPECTED_ROOT_KEY: Record<string, string> = {
  "openapi.yml": "openapi",
  "asyncapi.yml": "asyncapi",
};

// `response.ok` is not enough. A near-miss URL (for example `.yaml` instead of
// `.yml`) serves the marketing site with HTTP 200, which then lands in
// specs/ as half a megabyte of HTML and only blows up later, inside the
// generator, as an inscrutable YAML parse error. Validate the body here.
function assertLooksLikeSpec(filename: string, url: string, content: string): void {
  const fail = (why: string): never => {
    throw new Error(
      `${url} did not return ${filename}: ${why}. ` +
        `Check the URL — dpgr.am serves the marketing site for near-miss paths ` +
        `(for example \`.yaml\` instead of \`.yml\`) with HTTP 200.`
    );
  };

  if (content.trim() === "") fail("the response body is empty");
  if (/^\s*(<!doctype|<html)/i.test(content)) fail("the response body is HTML");

  let doc: unknown;
  try {
    doc = parse(content);
  } catch (err) {
    fail(`the response body is not valid YAML (${(err as Error).message})`);
  }
  if (doc === null || typeof doc !== "object" || Array.isArray(doc)) {
    fail("the response body is not a YAML mapping");
  }

  const rootKey = EXPECTED_ROOT_KEY[filename];
  const record = doc as Record<string, unknown>;
  if (rootKey && record[rootKey] === undefined) {
    fail(`the document has no \`${rootKey}:\` version key`);
  }
  if (record.paths === undefined && record.channels === undefined) {
    fail("the document declares neither `paths:` nor `channels:`");
  }
}

async function fetchSpec(url: string, filename: string): Promise<void> {
  console.log(`Fetching ${filename} from ${url}`);
  const response = await fetch(url, { redirect: "follow" });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }

  const content = await response.text();
  assertLooksLikeSpec(filename, url, content);

  const dest = join(SPECS_DIR, filename);
  writeFileSync(dest, content, "utf-8");
  console.log(`Wrote ${dest} (${content.length} bytes)`);
}

async function main() {
  const [openApiUrl, asyncApiUrl] = process.argv.slice(2);

  if (!openApiUrl || !asyncApiUrl) {
    console.error(
      "Usage: bun run fetch-specs.ts <openapi-url> <asyncapi-url>"
    );
    process.exit(1);
  }

  mkdirSync(SPECS_DIR, { recursive: true });

  await Promise.all([
    fetchSpec(openApiUrl, "openapi.yml"),
    fetchSpec(asyncApiUrl, "asyncapi.yml"),
  ]);

  console.log("Done.");
}

main();
