/**
 * SESSION START — orientation without a transcript
 * ================================================
 * Printed into a new session's context by the SessionStart hook. It answers
 * "where is this project?" from two sources:
 *
 *   1. .claude/STATE.md — what the last session chose to write down.
 *   2. git — what actually happened.
 *
 * They are printed SEPARATELY and on purpose. STATE.md is a human snapshot and
 * can be stale or optimistic; git cannot. Where they disagree, git is right.
 *
 * Absolute rule: this script must never stop a session from starting. Every step
 * is wrapped, every failure degrades to a note, and the process always exits 0.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Hard cap so a runaway file can't flood the context window. */
const MAX_STATE_CHARS = 9000;
const MAX_TOTAL_CHARS = 14000;

const out = [];
const say = (s = "") => out.push(s);

/** Run a git command; return null on any failure (missing git, no repo, …). */
function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    }).trim();
  } catch {
    return null;
  }
}

/* ------------------------------- 1. STATE.md ------------------------------ */

try {
  let state = readFileSync(join(ROOT, ".claude", "STATE.md"), "utf8").trim();
  if (state.length > MAX_STATE_CHARS) {
    state = state.slice(0, MAX_STATE_CHARS) + "\n\n…(STATE.md truncated — it has grown too long; trim it with /handoff)";
  }
  say("=== PROJECT STATE (.claude/STATE.md — written by the last session) ===");
  say("");
  say(state);
} catch {
  say("=== PROJECT STATE ===");
  say("");
  say("No .claude/STATE.md yet. Run /handoff at the end of this session to create one.");
}

/* --------------------------------- 2. git -------------------------------- */

say("");
say("=== LIVE GIT FACTS (authoritative — trust these over STATE.md above) ===");
say("");

const inRepo = git(["rev-parse", "--is-inside-work-tree"]) === "true";

if (!inRepo) {
  say("This project is NOT a git repository, so there is no branch, history or");
  say("uncommitted-file list to report. Nothing here is version controlled —");
  say("`git init` would light up the rest of this block.");
} else {
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]) ?? "(unknown)";
  say(`Branch: ${branch}`);

  const log = git(["log", "-5", "--pretty=format:%h  %ad  %s", "--date=short"]);
  say("");
  say("Last 5 commits:");
  say(log && log.length ? log : "  (no commits yet)");

  const status = git(["status", "--porcelain"]);
  say("");
  if (status === null) {
    say("Uncommitted changes: (could not read git status)");
  } else if (!status.length) {
    say("Uncommitted changes: none — the working tree is clean.");
  } else {
    const lines = status.split("\n");
    const shown = lines.slice(0, 40);
    say(`Uncommitted changes (${lines.length} file${lines.length === 1 ? "" : "s"}):`);
    say(shown.map((l) => "  " + l).join("\n"));
    if (lines.length > shown.length) say(`  …and ${lines.length - shown.length} more`);
    say("");
    say("An uncommitted file is the strongest signal of what the last session was");
    say("in the middle of. Check these before starting anything new.");
  }
}

/* -------------------------------- 3. emit -------------------------------- */

let text = out.join("\n");
if (text.length > MAX_TOTAL_CHARS) {
  text = text.slice(0, MAX_TOTAL_CHARS) + "\n…(truncated)";
}
process.stdout.write(text + "\n");
process.exit(0);
