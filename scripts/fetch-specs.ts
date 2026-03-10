import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const SPECS_DIR = join(import.meta.dirname, "..", "specs");

async function fetchSpec(url: string, filename: string): Promise<void> {
  console.log(`Fetching ${filename} from ${url}`);
  const response = await fetch(url, { redirect: "follow" });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }

  const content = await response.text();
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
