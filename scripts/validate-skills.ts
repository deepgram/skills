/**
 * Validate this repo's skills and keep .claude-plugin/marketplace.json honest.
 *
 * Exists because two classes of bug shipped silently:
 *
 *  1. A `description:` written as an unquoted YAML scalar containing a colon-space
 *     ("Route honestly: this crate...") is a YAML *parse error*, not a lint nit. The
 *     `skills` CLI prints one dim "⚠ Skipped ... YAML parse error" line and then exits 0,
 *     so the SDK installs N-1 skills while the manifest advertises N. To catch that we
 *     parse frontmatter with the SAME parser the installer uses (yaml@2.x) — a more
 *     lenient parser would pass files the installer drops.
 *
 *  2. marketplace.json drifting from what is actually on disk (it once advertised
 *     `deepgram-{lang}-maintaining-sdk` skills that exist in no repo). So the local
 *     plugin's skill list is diffed against the filesystem in BOTH directions.
 *
 * Complements `deepgram/ci-tools` `check-skill` (skill_lint.py), which covers authoring
 * quality — inline code, allowed-tools coverage, model/effort/version — but treats
 * frontmatter as regex-matched text and never looks at marketplace.json, so it reports
 * zero errors for both bugs above.
 *
 * Usage:
 *   bun run scripts/validate-skills.ts            # local, hermetic, blocking
 *   bun run scripts/validate-skills.ts --remote   # also check SDK plugins via `gh api`
 */

import { readdirSync, readFileSync, existsSync, statSync, appendFileSync } from "fs";
import { join, relative } from "path";
import { parse } from "yaml";

const ROOT = join(import.meta.dirname, "..");
const SKILLS_DIR = join(ROOT, "skills");
const MANIFEST = join(ROOT, ".claude-plugin", "marketplace.json");

/** Plugin in marketplace.json whose `source` is this repo, so its paths are local. */
const LOCAL_PLUGIN = "deepgram";

const failures: string[] = [];

function fail(message: string): void {
  failures.push(message);
}

function rel(path: string): string {
  return relative(ROOT, path) || path;
}

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

interface Frontmatter {
  /** Parsed mapping, or null when the block failed to parse. */
  data: Record<string, unknown> | null;
  /** Verbatim parser error, for operator-actionable output. */
  error?: string;
  /** Line in the file where the frontmatter body starts (for error offsets). */
  bodyStartLine: number;
}

/**
 * Split the `---` delimited block off the top of a SKILL.md and parse it.
 *
 * The delimiters are stripped before parsing so parser line numbers match what the
 * installer reports (it reports "line 2" for the third line of the file).
 */
function readFrontmatter(file: string): Frontmatter {
  const text = readFileSync(file, "utf-8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/.exec(text);

  if (!match) {
    return {
      data: null,
      error: "no YAML frontmatter found (expected a leading `---` delimited block)",
      bodyStartLine: 2,
    };
  }

  try {
    const data = parse(match[1]);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return {
        data: null,
        error: `frontmatter is not a YAML mapping (parsed as ${
          Array.isArray(data) ? "array" : typeof data
        })`,
        bodyStartLine: 2,
      };
    }
    return { data: data as Record<string, unknown>, bodyStartLine: 2 };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : String(err),
      bodyStartLine: 2,
    };
  }
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

interface Plugin {
  name?: unknown;
  source?: unknown;
  skills?: unknown;
}

/** Parse marketplace.json. Returns null (and records a failure) if unusable. */
function readManifest(): Plugin[] | null {
  if (!existsSync(MANIFEST)) {
    fail(`${rel(MANIFEST)}: manifest not found`);
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(MANIFEST, "utf-8"));
  } catch (err) {
    fail(
      `${rel(MANIFEST)}: invalid JSON — ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    return null;
  }

  const plugins = (parsed as { plugins?: unknown })?.plugins;
  if (!Array.isArray(plugins)) {
    fail(`${rel(MANIFEST)}: missing a top-level "plugins" array`);
    return null;
  }
  return plugins as Plugin[];
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

/** Every `skills/*` directory on disk, sorted. */
function skillDirsOnDisk(): string[] {
  if (!existsSync(SKILLS_DIR)) {
    fail(`${rel(SKILLS_DIR)}: skills directory not found`);
    return [];
  }
  return readdirSync(SKILLS_DIR)
    .filter((name) => {
      if (name.startsWith(".")) return false;
      // throwIfNoEntry:false so a broken symlink is skipped rather than crashing the run.
      return statSync(join(SKILLS_DIR, name), { throwIfNoEntry: false })?.isDirectory() ?? false;
    })
    .sort();
}

/** Parse + validate each skill. Returns how many were fully valid. */
function checkSkills(dirs: string[]): number {
  let valid = 0;

  for (const dir of dirs) {
    const file = join(SKILLS_DIR, dir, "SKILL.md");

    if (!existsSync(file)) {
      fail(`${rel(join(SKILLS_DIR, dir))}: directory has no SKILL.md`);
      continue;
    }

    const { data, error } = readFrontmatter(file);

    if (!data) {
      // This is the installer-fatal case: the CLI skips the skill and still exits 0.
      fail(`${rel(file)}: YAML frontmatter failed to parse — ${error}`);
      continue;
    }

    let ok = true;

    for (const field of ["name", "description"] as const) {
      const value = data[field];
      if (typeof value !== "string" || value.trim() === "") {
        fail(`${rel(file)}: missing or empty required field \`${field}\``);
        ok = false;
      }
    }

    if (typeof data.name === "string" && data.name.trim() !== dir) {
      fail(
        `${rel(file)}: frontmatter \`name: ${data.name.trim()}\` does not match its directory name \`${dir}\``
      );
      ok = false;
    }

    if (ok) valid += 1;
  }

  return valid;
}

/** Diff the local plugin's `skills` list against `skills/*` on disk, both directions. */
function checkManifestSync(plugins: Plugin[], dirs: string[]): void {
  const local = plugins.find((p) => p.name === LOCAL_PLUGIN);

  if (!local) {
    fail(`${rel(MANIFEST)}: no plugin named "${LOCAL_PLUGIN}" — cannot check local skill paths`);
    return;
  }
  if (!Array.isArray(local.skills)) {
    fail(`${rel(MANIFEST)}: plugin "${LOCAL_PLUGIN}" has no "skills" array`);
    return;
  }

  const listed = new Set<string>();

  for (const entry of local.skills) {
    if (typeof entry !== "string") {
      fail(`${rel(MANIFEST)}: plugin "${LOCAL_PLUGIN}" has a non-string skills entry: ${JSON.stringify(entry)}`);
      continue;
    }

    // Local paths are repo-relative (`./skills/<name>`). Anything else is a remote
    // source and does not belong in this plugin.
    const path = entry.replace(/^\.\//, "");
    if (!path.startsWith("skills/")) {
      fail(
        `${rel(MANIFEST)}: plugin "${LOCAL_PLUGIN}" entry \`${entry}\` is not a local \`./skills/*\` path`
      );
      continue;
    }

    const name = path.slice("skills/".length);
    listed.add(name);

    if (!existsSync(join(ROOT, path, "SKILL.md"))) {
      fail(
        `${rel(MANIFEST)}: plugin "${LOCAL_PLUGIN}" lists \`${entry}\` but ${path}/SKILL.md does not exist on disk`
      );
    }
  }

  for (const dir of dirs) {
    if (!listed.has(dir)) {
      fail(
        `${rel(MANIFEST)}: skills/${dir}/SKILL.md exists on disk but plugin "${LOCAL_PLUGIN}" does not list \`./skills/${dir}\` — it will not install`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Optional remote check (SDK plugins)
// ---------------------------------------------------------------------------

/**
 * The SDK plugins' `.agents/skills/*` paths resolve against github sources, not this
 * checkout, so they cannot be verified locally. Checked here against the live repos via
 * `gh api`. Deliberately separate and non-blocking: a GitHub outage must not block PRs.
 */
async function checkRemotePlugins(plugins: Plugin[]): Promise<string[]> {
  const remote = plugins.filter(
    (p) => typeof p.source === "object" && p.source !== null && "repo" in (p.source as object)
  );

  const problems: string[] = [];
  const report = (line: string) => {
    problems.push(line);
    console.log(`  ✗ ${line}`);
  };

  for (const plugin of remote) {
    const repo = (plugin.source as { repo?: string }).repo;
    const skills = Array.isArray(plugin.skills) ? plugin.skills : [];
    if (!repo) continue;

    for (const entry of skills) {
      if (typeof entry !== "string") continue;
      const path = `${entry.replace(/^\.\//, "")}/SKILL.md`;
      const proc = Bun.spawn(["gh", "api", `repos/${repo}/contents/${path}`, "--jq", ".sha"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const code = await proc.exited;

      if (code !== 0) {
        const stderr = (await new Response(proc.stderr).text()).trim().split("\n")[0];
        report(`${repo}: ${path} — ${stderr || `gh api exited ${code}`}`);
        continue;
      }

      // Present in the repo — now confirm the installer can actually parse it.
      const raw = Bun.spawn(
        ["gh", "api", `repos/${repo}/contents/${path}`, "-H", "Accept: application/vnd.github.raw"],
        { stdout: "pipe", stderr: "pipe" }
      );
      if ((await raw.exited) !== 0) continue;

      const text = await new Response(raw.stdout).text();
      const match = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/.exec(text);
      if (!match) {
        report(`${repo}: ${path} — no YAML frontmatter found`);
        continue;
      }
      try {
        parse(match[1]);
      } catch (err) {
        report(
          `${repo}: ${path} — YAML frontmatter failed to parse — ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }

  return problems;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const dirs = skillDirsOnDisk();
  const valid = checkSkills(dirs);

  const plugins = readManifest();
  if (plugins) checkManifestSync(plugins, dirs);

  console.log(`Found ${dirs.length} skills, ${valid} valid`);

  if (failures.length > 0) {
    console.log(`\n${failures.length} failure(s):`);
    for (const failure of failures) console.log(`  ✗ ${failure}`);
  }

  if (process.argv.includes("--remote")) {
    if (!plugins) {
      console.log("\nSkipping remote SDK plugin check — manifest is unusable.");
    } else {
      console.log("\nChecking remote SDK plugin skill paths via `gh api`...");
      const problems = await checkRemotePlugins(plugins);
      console.log(
        problems.length === 0
          ? "All remote SDK plugin skill paths exist and parse."
          : `${problems.length} remote SDK plugin skill problem(s) — reported, not blocking.`
      );

      // This job is continue-on-error, so it green-checks either way and nobody opens a
      // passing job's log. Put findings in the run summary so they are visible without
      // digging — the whole point here is not shipping another skippable warning.
      const summary = process.env.GITHUB_STEP_SUMMARY;
      if (summary && problems.length > 0) {
        const lines = [
          `## ${problems.length} remote SDK plugin skill problem(s)`,
          "",
          "These skills are advertised by `.claude-plugin/marketplace.json` but the live SDK",
          "repo either does not have them or ships frontmatter the installer cannot parse.",
          "A skill that fails to parse is silently skipped at install time (the CLI still",
          "exits 0), so the SDK installs fewer skills than the manifest advertises.",
          "",
          // Parser errors are multi-line (they include a caret line), so each finding
          // gets a fenced block rather than a list item that would break the markdown.
          ...problems.flatMap((p) => {
            const [location, ...rest] = p.split(" — ");
            return [`**${location}**`, "", "```", rest.join(" — ").trimEnd(), "```", ""];
          }),
          "Reported, not blocking: these live in other repos and must be fixed there.",
        ];
        appendFileSync(summary, `${lines.join("\n")}\n`);
      }
    }
  }

  if (failures.length > 0) process.exit(1);
  console.log("\nAll skills valid.");
}

main();
