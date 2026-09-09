@AGENTS.md

# The Cartographer

Aayush Adhikari's illustrated portfolio. Next.js 16 · React 19 · Tailwind v4 ·
Supabase. One continuous hand-drawn map you travel through eight chapters.

## How Aayush works

He works in blocks separated by usage-limit resets and starts a **new session**
for each task rather than resuming an old one. A session can be cut off at any
moment with no warning. Everything below follows from that.

### Session continuity — not optional

- **Update `.claude/STATE.md` via `/handoff`** whenever you finish a meaningful
  piece of work, and before you stop.

- **For any multi-step task, write the numbered plan into STATE.md as
  `Right now — IN FLIGHT` WHEN YOU START — not when you finish.** Tick off steps
  and file states *as they land*. A plan written at minute 0 is stale by minute
  60, and a usage limit gives no warning. For each touched file record whether it
  is done, half-edited (and exactly what is wrong), or not started; plus what is
  known-broken and which checks actually ran.

- **The moment Aayush parks something** — "let's do this at the end", "not now",
  "after we buy X" — write it straight into STATE.md's Parked section, in his own
  words, with the trigger that unparks it. Anything living only in the chat is
  lost when the session dies.

- **Log his decisions and reasoning** at the top of `docs/DECISIONS.md`: what was
  chosen, why (quote his words), what was rejected. Never rewrite old entries.

- **Never overstate progress in STATE.md.** Say plainly what is unverified or
  half-done. A STATE.md that claims something works when it does not is worse
  than none — the next session builds on the lie.

- **Say when a fresh session is worth starting.** At a clean stopping point, tell
  him, and name `/clear` — it keeps the folder and reloads STATE.md through the
  SessionStart hook. Letting the context auto-compact silently loses detail.

## Architecture invariants

Break these and the design stops holding together.

- **One read path.** The whole public map renders from `getSiteContent()` in
  `src/lib/content.ts`. It reads Supabase and degrades per-collection to the CV
  seed. Never fetch content anywhere else; never let it throw.

- **`src/data/seed.ts` is the permanent fallback**, not dead code. The site must
  never render blank because a query failed.

- **`src/lib/supabase/map.ts` is the only file that knows the database is
  snake_case.** Everything above it sees the shapes in `src/lib/types.ts`.

- **Every write re-checks authorization.** Server actions in `src/lib/actions/`
  call `requireAdmin()` first — it throws rather than returning, so a forgotten
  check cannot fall through. `src/proxy.ts` is an *optimistic* redirect only;
  `src/lib/auth/dal.ts` is the real gate; Postgres RLS is the last line.

- **Writes use the admin's own session, never the service-role key.** That keeps
  RLS switched on for our own code. The service key belongs only in
  `scripts/setup.mjs`.

- **Adding a field to a record means adding a line to
  `src/components/studio/schema.ts`** — not writing another form. The Studio
  renders from that table.

- **Everything the visitor can read is editable from `/studio`.** If you add
  visible copy, it goes in the database, not in a component.

## Environment facts

- **Next 16 renamed middleware → `proxy.ts`** (exports `proxy`). This Next
  version differs from training data — read `node_modules/next/dist/docs/`
  before assuming any API. See AGENTS.md.
- **Supabase DDL cannot run from an API key.** Schema changes mean pasting
  `supabase/schema.sql` into the dashboard SQL editor. `npm run setup` detects
  missing tables and prints the link.
- **`npm run setup` is idempotent** and verifies RLS on every run by attempting
  a forbidden anonymous write.
- **Copy `.env.example` to `.env.local` — never rename it.**
- **Node 24 required** for `scripts/setup.mjs` (it imports the TypeScript seed
  natively, no build step).
- **This shell collapses `\\` in `node -e` regexes** — use `indexOf`/`includes`
  instead. **Heredocs truncate around 200 lines** — use the Write tool.
- **Some files are CRLF** — match `\r?\n`, never `\n`.
- **The browser preview pane pauses `requestAnimationFrame` while hidden** and
  misreports `getComputedStyle().transform`. Entrance animations will look stuck
  at `opacity: 0`. Verify visually with a screenshot, not by measuring in JS.
