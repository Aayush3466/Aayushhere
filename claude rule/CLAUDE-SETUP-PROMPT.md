# Setting this up on a new project

Paste the block below as the **first message** in a new project. It tells Claude to build the same
session-continuity system that Relay uses, adapted to that codebase.

Everything it asks for is a documented Claude Code feature: `SessionStart` hooks inject their stdout
into the session's context, project `CLAUDE.md` loads every session, and skills load on demand.

---

```
Before we build anything, set up session continuity for this project. I work in blocks separated by
usage-limit resets, and I don't want to re-explain the project or lose a half-finished task each
time. Build this:

1. `.claude/STATE.md` — a snapshot (not a log) of where the project stands, rewritten in place.
   Sections: Right now / Next action (numbered, concrete enough to start cold) / Blocked-waiting on
   me / Parked-wanted but not now (with the trigger that unparks each) / Recently shipped with
   commit hashes / Deferred on purpose (decided against) / Environment facts that will bite you.
   Keep it under ~120 lines.

2. `.claude/hooks/session-start.mjs` — a Node script (Node so it works on Windows too) that prints
   STATE.md plus live git facts: current branch, last 5 commits, and any uncommitted files. Wrap
   every step so it can never stop a session from starting, and cap the output. Register it in
   `.claude/settings.json` as a SessionStart hook with matcher "startup|clear|compact" — its stdout
   is injected into context, so a new session starts oriented without replaying an old transcript.
   Print the git block separately from STATE.md and tell yourself to trust git where they disagree.

3. `docs/DECISIONS.md` — an append-at-the-top log of decisions I make: what was chosen, why (quote
   my own words), and what was rejected. Never rewrite old entries.

4. A `/handoff` skill at `.claude/skills/handoff/SKILL.md` that rewrites STATE.md and appends any
   decision to DECISIONS.md, working only from what you already know in the session — it must be
   cheap, never a re-analysis of the codebase.

5. Rules in `CLAUDE.md` (keep the whole file under 200 lines) telling you to:
   - update STATE.md via /handoff whenever you finish a meaningful piece of work;
   - for any multi-step task, write the numbered plan into STATE.md as "Right now — IN FLIGHT"
     WHEN YOU START, and tick off steps and file states AS THEY LAND, not at the end — a usage
     limit can cut the session off with no warning, and a plan written at minute 0 is stale by
     minute 60. Record for each touched file whether it is done, half-edited (and exactly what is
     wrong), or not started, plus what is known-broken and which checks actually ran;
   - log my decisions and reasoning in DECISIONS.md;
   - write anything I park mid-conversation ("let's do this at the end", "not now", "after we buy
     X") straight into STATE.md's Parked section the moment I say it, with my own words and the
     trigger that unparks it — a session can die at a usage limit and anything only in the chat is
     lost;
   - tell me when we're at a clean stopping point and a fresh session is worth starting, naming
     `/clear` — it keeps the folder and reloads the state file — rather than letting the context
     auto-compact, which silently loses detail;
   - never overstate progress in STATE.md; say plainly what is unverified or half-done.

Then run the hook once to prove it works and show me its output. Fill STATE.md with the project's
real current state, not a placeholder.

After this is set up, my workflow is: start a NEW session for each task (never resume an old one)
and just tell you what I want — you'll already know where things stand.
```

---

## How to actually use it, day to day

**Starting a new feature:** open a **new** session and describe the feature. Nothing else. The hook
has already told Claude the branch, the recent commits, what is unmerged, what is deferred, and what
the last session left behind.

**Resuming a half-finished task:** open a **new** session and say `continue`. STATE.md's "Next
action" plus the uncommitted-files list from git is the handoff.

**Do not** use "continue this conversation" / `--resume` after a break. That replays the entire
prior transcript, and once the prompt cache has expired it is all re-processed at full price. That
is the expensive thing — not the project's own files.

**Stopping mid-task on purpose:** say `/handoff` before you walk away.

**Checking the cost:** `/context` shows what is currently loaded.
