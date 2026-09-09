---
name: handoff
description: Rewrite .claude/STATE.md and append any decisions to docs/DECISIONS.md so the next session starts oriented. Use when the user types /handoff, says they are stopping, wraps up a piece of work, or when a clean stopping point is reached.
---

# Handoff

Write down what this session knows, so the next one does not have to rediscover
it. Aayush works in blocks separated by usage-limit resets and starts a **new**
session each time — this file is the only thing that survives.

## The one rule

**Work only from what you already know in this session.** Do not re-read the
codebase, do not grep, do not run analysis. If you did not learn it in this
session, it does not belong in the update. This must stay cheap — a handoff that
costs a re-analysis defeats its own purpose.

Reading `.claude/STATE.md` itself is fine and expected; you are rewriting it.

## Steps

1. **Read `.claude/STATE.md`.** You are rewriting it in place — a snapshot of
   where things stand now, not a log of what happened. Delete anything that is
   no longer true.

2. **Rewrite it**, keeping these sections and this order:

   - `## Right now` — one short paragraph. If a multi-step task is mid-flight,
     head it `Right now — IN FLIGHT` and record, per touched file, whether it is
     done, half-edited (and exactly what is wrong), or not started. Say what is
     known-broken and which checks actually ran.
   - `## Next action` — numbered, concrete enough to start cold with no memory
     of this conversation. "Fix the login" is useless; "sign in at /studio and
     confirm the header reaches 'all changes saved'" is not.
   - `## Blocked — waiting on me (Aayush)` — things only he can do.
   - `## Parked — wanted, but not now` — with **his own words** and the trigger
     that unparks each one.
   - `## Recently shipped` — with commit hashes when the project has git.
   - `## Deferred on purpose` — decided against, and why, so it is not
     relitigated next session.
   - `## Environment facts that will bite you` — carry these forward; they are
     the most expensive things to rediscover.

   Keep the whole file under ~120 lines. It is loaded into every new session.

3. **Never overstate progress.** Say plainly what is unverified, half-done, or
   only assumed to work. A STATE.md that claims something works when it does not
   is worse than no STATE.md — the next session will build on the lie.

4. **Append any decisions** to the TOP of `docs/DECISIONS.md`: what was chosen,
   why (quote Aayush's own words where he gave them), and what was rejected.
   Never rewrite an existing entry. Skip this step if no real decision was made
   — routine work is not a decision.

5. **Report back in two or three lines**: what you recorded, and what the next
   session should do first. Then suggest `/clear` rather than letting the
   context auto-compact — `/clear` keeps the folder and reloads STATE.md
   through the SessionStart hook, while auto-compaction silently loses detail.
