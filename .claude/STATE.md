# STATE — The Cartographer

Snapshot, not a log. Rewritten in place by `/handoff`. Last updated: 2026-09-09.

## Right now

The portfolio is feature-complete and running. Supabase is live and holds all
content; `/studio` edits it; the public map renders from the database with the
CV seed as a permanent fallback. Design elevation (paper system, plate tilt,
hero cartouche) is applied. Mobile collisions fixed.

Nothing is in flight.

## Next action

1. Sign in at `/studio` (ayushadhikari3466@gmail.com) and make one edit —
   confirm the header reaches "all changes saved". This is the ONLY part of the
   stack never exercised through a real browser session; everything under it is
   verified.
2. Change the Studio password: Studio → Account → Change password.
3. Fill the gaps the seed left empty: LinkedIn / GitHub / Scholar URLs
   (Profile → Socials), the CV upload (Profile → CV), project live URLs, and
   the Gallery (currently 0 plates).
4. Add project preview images — with a live URL set, "Fetch from live site"
   pulls the Open Graph image automatically.

## Blocked — waiting on me (Aayush)

- Nothing blocking. Supabase schema is applied and the admin account exists.

## Parked — wanted, but not now

- **git init + first commit.** The project has NO version control. The
  SessionStart hook's git half is inert until this exists.
  _Unparks when:_ you want history, branches, or Vercel deploy-from-GitHub.
- **Deploy to Vercel.** _Unparks when:_ content is filled in and the password
  has been changed.

## Recently shipped

No commit hashes — this project is not a git repository yet (see Parked).
Shipped this session, all verified against the live database:

- Supabase schema: 11 tables, RLS, storage bucket (`supabase/schema.sql`)
- `npm run setup` — provisions admin, seeds CV, verifies RLS on every run
- Real auth: `src/proxy.ts` (optimistic) + `src/lib/auth/dal.ts` (the real gate)
- Studio rebuilt: autosave, chapters, inbox, leaderboard, account
- Contact form → `messages` table + Resend email (stored first, emailed second);
  honeypot now accepts silently instead of returning a validation error
- Live metadata + OG share card read the database, not the seed (proved by
  swapping the tagline in the DB and reading it back out of `og:description`)
- Design: paper fibre/hand-cut edges, plate tilt+sheen, hero cartouche
- Mobile pass: wax seal / chat label / edge-nav no longer collide with content;
  the scroll cue says "swipe" on touch and "side-scroll" on a trackpad
- Inking loader runs once per browser session, not on every visit
- This session-continuity system: SessionStart hook, STATE.md, DECISIONS.md,
  `/handoff` skill, CLAUDE.md rules (hook tested, exits 0, degrades without git)

## Deferred on purpose

- **Studio UI verified via a temporary render harness, not a real login.** I do
  not type passwords into login forms. The harness (since deleted) proved every
  panel renders; the authenticated write path was proved separately at the API
  level. See "Next action" 1.
- **11 pre-existing `react-hooks` lint errors** in original files (CompassChat,
  TypingTest, SectionPager, SailTransition, GamesSection, content-store). Not
  introduced by the backend work; fixing them is a separate refactor.
- **setState-in-effect in `studio-store.tsx`** — same pattern as the existing
  content-store, on the localStorage fallback path that is dead now Supabase is
  configured. Left consistent with the codebase.

## Environment facts that will bite you

- **Next 16 renamed middleware → `proxy.ts`.** `src/proxy.ts` exports `proxy`,
  not `middleware`. Read `node_modules/next/dist/docs/` before assuming any
  Next API — this version differs from training data (see AGENTS.md).
- **Supabase DDL cannot run from an API key.** Schema changes mean pasting SQL
  into the dashboard SQL editor. `npm run setup` detects missing tables and
  prints the exact link.
- **`.env.example` must be COPIED, not renamed** to `.env.local` — renaming it
  once already destroyed the template.
- **Node 24 imports the TypeScript seed natively**, which is why
  `scripts/setup.mjs` needs no build step. On Node 20 it would fail.
- **Bash tool collapses `\\` in regexes.** Use string methods (`indexOf`,
  `includes`) in `node -e` one-liners, not `new RegExp` with escapes.
- **Heredocs truncate around 200 lines** in this shell. Use the Write tool for
  large files.
- **Windows CRLF**: some source files use `\r\n`. Match `\r?\n`, never `\n`.
- **The browser preview pane misreports `getComputedStyle().transform` and
  pauses `requestAnimationFrame` while hidden** — entrance animations look
  stuck at `opacity: 0` and transforms read as identity. Verify visually with a
  screenshot, not via JS measurement.
- Dev server: `npm run dev` → http://localhost:3000. `npm run setup` is
  idempotent and safe to re-run.
