# STATE — The Cartographer

Snapshot, not a log. Rewritten in place by `/handoff`. Last updated: 2026-09-09.

## The Chart + the craft pass — DONE, verified, and pushed

### The Chart

`src/lib/map/chart.ts` holds the geometry (keyed by CHAPTER, not region —
chapters are what you navigate). The route is Catmull-Rom converted to cubic
Béziers so it passes exactly THROUGH every place, emitted at fixed decimals so
the SSR and client path strings are byte-identical.

`src/components/map/VoyageChart.tsx` draws it: sea, landmass, coastline with a
beach line, engraver's latitude hatching, inland ridges, eight landmark glyphs,
hand-lettered labels taken from `SectionDef.nav` (so a Studio rename relabels
the chart), the route, the seals, the ship, and the chart's own marginalia.
One component serves both the minimap and the full view so they can never
disagree about the geography.

`src/components/map/ChartPanel.tsx` presents it: a full-screen overlay (`M`,
the minimap, or the nav's chart button; Escape or `M` closes) and a persistent
corner minimap on sm+. On a phone the chart is held at `min-w-[620px]` and
panned — scaled to fit 375px its labels render at ~6px, which is worse than
making someone drag.

Three facts, deliberately distinct: the ROUTE inks to the furthest place
reached (so sailing back never un-draws the map), the SEALS mark where you
actually stopped, and the SHIP shows where you are now — sitting on the route
just short of the marker, because three things on one point is a smudge.

Arc length is sampled ONCE per mount (300 samples) to find each place's
position along the path. Nothing on the chart animates on a loop; the route,
ship and seals move on CSS transitions and rest between them.

### The craft pass

- **`NibCursor`** replaces `CursorFollower`. A wet ink line that follows the
  pointer and dries away, on ONE canvas — no DOM node per point, no blend mode,
  no filter. Verified: 100 moves laid 4373 inked pixels, and after drying the
  loop ran exactly ONE more cleanup frame and stopped. Zero idle cost. Desktop
  pointers only; nothing for coarse pointers or reduced motion.
- **Chapter arrival inks itself** — a nib rule draws in under the title. The
  glyphs are deliberately NOT stroke-drawn: that means SVG text with a stroke,
  which costs real-type crispness, selection and correct wrapping.
- **The compass rose swings** from -18deg to +18deg across the voyage.
- **A coffee ring** on the sheet (lg+), and **brass pins** on the gallery plates
  including the empty-state placeholders.

### Performance re-evaluation — and four more wastes found and fixed

Measured in-browser, settled, with the loader gone (timers throttle while the
preview pane is hidden, which distorted the first few readings):

| | content chapter (Research) | Home (the heaviest) |
|---|---|---|
| idle running animations | **2** | 12 + starfield |
| `will-change` layers | **0** | 9 (the vista decor) |
| `backdrop-filter` | **0** | **0** |
| blended layers | 1 (occluded grain) | 1 |
| CSS filters | **1** (chat drop-shadow) | 1 |
| mounted chapters | 3 | 2 |

Found while measuring, all fixed:
1. **`TitleReveal` pinned `will-change: transform, filter` on EVERY letter**,
   permanently, for an animation that finished three seconds in — and animated
   `filter: blur()`, which is not compositor-accelerated. Now opacity/y/rotate
   only, and the motion elements are dropped for plain text once the reveal
   completes. `will-change` layers 23 -> 9; framer animations 33 -> 1.
2. **Eight SVG `blur()` filters on Research** (two per region landmark) and six
   more in `places.tsx`. Replaced with radial gradients — same glow, no filter
   region. CSS filters 20 -> 1.
3. **The scroll hint ran two infinite loops on every chapter**, underneath a
   wrapper faded to opacity 0. Gated on `show`.
4. **Home rendered 24 twinkling stars by day**, when `--star-opacity` is 0 —
   two dozen elements animating to show nothing. Gated on phase, the way
   `ChapterBackdrop` already did.

### Navigation regression — all still green

- forward chain by scrolling alone across all 8 chapters, never mid-chapter
- two trackpad flicks back-to-back -> two chapters (the reported bug)
- touch swipe left/right pages
- the chart opens, offers 8 targets, reports the seal count, sails and closes

## Round 2 — DONE (verified)

### The trackpad bug Aayush reported — real, and it had TWO causes

"2-finger sideways scroll pages once; without moving the cursor it stops working;
move the mouse and it works again."

1. **The coast could never be broken by a second swipe.** After a page turn the
   hook swallowed wheel events until a 160ms GAP appeared, to eat the trackpad's
   momentum tail. A second swipe arriving while that tail was still running keeps
   the gap small, so it was eaten as if it were momentum — and stayed eaten for
   as long as you kept swiping. Moving the mouse "fixed" it only because moving
   takes longer than 160ms.
   → Now also detects RE-ACCELERATION: momentum only decays, so a delta clearly
   larger than the smallest seen since the page turned means fingers are back on.
2. **Listeners were on the pager element, so delivery depended on what was under
   the cursor** — after a chapter change that is the old, now-`inert` chapter, or
   the chat launcher (a sibling of the pager, whose events never reach it).
   → Bound to `window`. `data-nav-ignore` still excludes the chat and sheets.

**A third bug surfaced while testing it:** two page turns dispatched before React
re-rendered both read the same mirrored index ref and computed the same target,
so the second silently did nothing. Index + arrival edge are now ONE piece of
state changed through functional updates, so travel is resolved against the last
committed value regardless of render timing. Only reproducible with the main
thread blocked — but that is precisely the slow-phone case.

Verified with synthetic trackpad flicks (rise + decaying tail, real time burned
with a busy-wait so timer throttling could not distort it):
- one flick + long tail → exactly ONE chapter
- two flicks, the second starting while the first's tail is still arriving →
  TWO chapters (this is the gesture that used to stick)
- full vertical chain across all 8 chapters still works, never mid-chapter

### Also done in round 2

- **Wheel/touch listeners on `window`**, velocity-based swipe commit (a short
  sharp flick now counts, not just a long drag), and **live overscroll feedback**
  — the sheet leans toward the next chapter in proportion to how far past the
  edge you have pushed, so the hand-over threshold is visible instead of hidden.
  It relaxes if you stop pushing.
- **Focus follows the chapter.** It could previously be stranded in a subtree
  that had just become `inert`, dropping the keyboard to `<body>`.
- **B1 fixed — publications no longer vanish.** The Studio offers all 8 regions
  but Research renders only the 4 research ones, so a paper filed elsewhere
  rendered NOWHERE. Anything unclaimed now collects under "Further work".
  `getRegion()` also no longer returns undefined for an unknown key (callers
  destructure it straight into SVG attributes).
- **B2 fixed — Education no longer invents prose.** The note and the artwork were
  chosen by regex-matching "india" against the location; a third entry from
  anywhere else would have been given the Kathmandu note and the Dharahara
  skyline. The note is now `education.note`, a real editable field, and an
  unrecognised place gets a neutral `ScholarScene` instead of a confidently wrong
  landmark.

### Rich record fields — DONE

`highlights` (bullets), `metrics` (label/value), `milestones` (a timeline inside
one entry) — all optional, on publications, projects, experience AND education,
plus `education.note`. One shared renderer (`sections/enrichment.tsx`) so all
four chapters present them identically; three new Studio editors (`list`,
`metrics`, `milestones`) with add/reorder/delete, Enter for the next bullet.
Card shows metrics + the first 3 bullets; the sheet shows everything. A record
with a one-line summary but many bullets still opens (`expandable`), so nothing
is ever stranded.

Verified visually end to end with temporary placeholder data, since the live
database has none yet — that scaffolding has been reverted (`git diff` on
`.env.local` and `content.ts` is empty).

## Migration 002 — APPLIED

Aayush ran `supabase/migrations/002_enrichment.sql` on 2026-09-11. Verified
against the live database: `publications`, `projects`, `experience` and
`education` all carry `highlights` / `metrics` / `milestones`, and
`education.note` came back with the restored prose. The Studio can save the new
fields.

## Shipped this session

Performance + navigation overhaul is DONE and verified in a browser. Working
tree is dirty — nothing committed yet.

### Why it was laggy (all fixed)

1. **All 8 chapters mounted and animating at once.** `SectionPager` rendered
   every section into one 800vw flex row, so 7 idle chapters each kept running a
   full `ChapterBackdrop` (36 twinkling stars, a `glow-drift` blob, drifting
   clouds, a horizon SVG) plus Home's whole vista. ~30 full-screen animated
   layers composited every frame to show one.
   → Now only the active chapter and its two neighbours mount, and the
   neighbours are `.chapter-idle` (`animation-play-state: paused`) with their
   decor not rendered at all.
2. **Nine stacked full-viewport `mix-blend-mode: multiply` layers.**
   `.paper-grain` is `position: fixed`, and a fixed element inside the pager's
   translated track resolves against THE TRACK — so each chapter laid down a
   grain layer eight screens wide, in multiply blend.
   → New `.grain-inline` (absolute, no blend). Measured in-browser: 1 blended
   layer left, and it is occluded.
3. **`CursorFollower` blended in multiply while spring-following the pointer** —
   every mouse move re-composited the viewport. → plain alpha.
4. **Four permanent `backdrop-filter: blur()` passes** over continuously
   animating content (TopNav 14px+saturate, both EdgeBtns, ScrollHint, every
   `.paper-panel-soft`). → all removed; measured 0 remaining.
5. **`SectionShell` called `setProg` in `onScroll`** — a React re-render of every
   card in the chapter on every scroll event. → the rail now lives in the pager
   and is written straight to the DOM in a rAF.
6. **`EnvironmentProvider` re-rendered the whole tree every 15s** to redraw a
   clock that changes once a minute. → only commits when the rendered value
   actually changes.
7. `.sheen::before` gave every plate a permanent soft-light layer for an effect
   invisible until hover → blend attached on `:hover` only. Sea 5 wave bands → 3.
   Stars 36 → 24. `gsap` (never imported) removed; dead `SailTransition.tsx`
   deleted.

Also fixed: the reading-progress rail was `fixed` inside the translated track,
so it had been drawing eight screens off-screen the whole time.

### Navigation (rebuilt)

`src/components/sections/useChapterNav.ts` is now the single place that decides
when the map sails. **Vertical scroll finishes the chapter first**: while there
is content below the fold it is an ordinary scroll and the hook does not touch
it; at the foot, further downward intent fills a 190px overscroll budget and
then pages. Up at the top does the reverse and lands at the FOOT of the previous
chapter (`EntryCtx`), so you never lose your place.

**Mobile side-scroll works because there was previously no touch handler at
all** — the old pager only listened to `wheel`/`deltaX`. Now: the column is
`touch-action: pan-y` (browser keeps native vertical scroll), horizontal drags
arrive cancelable and move the sheet live with edge resistance, and a vertical
flick that starts and ends pinned to a chapter boundary hands over.

Momentum is handled by detecting when the flick stops arriving (160ms gap), not
by a fixed cooldown — a fixed cooldown made the page ignore you for most of a
second right after you landed somewhere new.

### Verified in a real browser (localhost, dev + prod build both clean)

- Forward chain across all 8 chapters, one at a time, never mid-chapter
- Backward chain lands at the previous chapter's foot (scrollTop == max)
- Hard flick mid-chapter does NOT page
- Touch: left swipe → next, right swipe → back, boundary flick → hands over
- Measured on a live chapter: 0 backdrop-filters, 1 blended layer,
  0 `will-change` layers, 41 running animations (36 of them the starfield)
- Sheet opens/closes, Escape closes, portal positions against the viewport

### Content / visual

- **Education** artwork overflowed its column at the `md` breakpoint (fixed-width
  SVGs, 358px minimum in a 328px column, plus glows painted outside the viewBox).
  Scenes are fluid now (`size` is a max) and the frame clips. Verified at 790px.
- **Progressive disclosure** — `src/components/ui/Expandable.tsx`. Card shows one
  sentence (~150 char cap); the sheet holds the rest — bottom sheet on a phone
  (min 42vh / max 76vh), centred dialog on desktop. Rendered through a PORTAL,
  which is mandatory: a `fixed` sheet inside the translated track would open
  several screens to the right. No affordance when the text already fits.
  Applied to Research (publications + research projects), Projects, Experience,
  Education.
  **The WHOLE CARD opens it**, not just the link — `Disclosure` puts the handler
  on the card and ignores clicks that land on a link, button, field, or an active
  text selection. The link stays as the visible affordance and the keyboard path;
  the card is deliberately NOT focusable, because wrapping real links in a
  focusable card nests interactive elements and costs a screen-reader user more
  than it gains a mouse user. `Plate`/`Tilt` now accept DOM props so a plate can
  carry the handler. Verified: clicking the preview art or the heading opens the
  sheet; clicking a link inside the card does not.
- **Projects** cards were a bare `p-1` wrapper so the frame border ran against
  the card edge → now a `paper-panel` with the preview inset, softer frame edge.
- **Ambient sound** was 0.09 gain through a 500Hz lowpass — inaudible. Now 0.4
  through 820Hz. NOT verified by ear (no audio here); verified the values only.

### Lint

7 `react-hooks` errors remain, all pre-existing (InkingLoader, CompassChat,
TypingTest, GamesSection, content-store, leaderboard-store, studio-store). Was
11; SectionPager and SailTransition are off the list. Nothing new introduced.

## Next action

Everything in the codebase is done and pushed. What remains is CONTENT, and it
is Aayush's to write — he said so explicitly.

1. **Fill the site in.** This is now the only thing standing between it and
   being genuinely good. Gallery has 0 plates, no project has a live URL or a
   preview image, the CV is not uploaded, and the socials are empty. A chart of
   eight territories reads WORSE when six are thin, not better.
2. The new fields are the ones worth using: `highlights` (bullets — what you
   actually did), `metrics` (the numbers that make a claim evidence), and
   `milestones` (a timeline inside one entry).
3. Change the Studio password: Studio -> Account -> Change password.
4. Deploy: import the repo on Vercel, copy the env vars from `.env.local`, set
   `NEXT_PUBLIC_SITE_URL` to the real domain.
5. Confirm the ambient sound level by ear — it was raised from 0.09 to 0.4 gain
   through an 820Hz lowpass, and that change has never been heard, only measured.
6. Confirm the gesture thresholds on a real phone. `WHEEL_BUDGET`,
   `SWIPE_COMMIT` and `PULL_COMMIT` in `useChapterNav.ts` are the dials.

### Approved but not built (from the plan Aayush picked from)

- **Deep links** — `/#research`, `?plate=<id>` opening a sheet directly, back
  button sailing back. Still the biggest functional gap: you cannot link to a
  chapter or a project.
- **Case-study mode** — a project sheet expanding to a full chapter-length read.
- **Command palette** (Cmd-K) over chapters, projects and papers.
- Print-to-CV, live repo signals, per-project pages for SEO.

## Blocked — waiting on me (Aayush)

- Nothing blocking. Supabase schema is applied and the admin account exists.

## Parked — wanted, but not now

- **Deploy to Vercel.** Import github.com/Aayush3466/Aayushhere, then add the
  same env vars from .env.local in Project Settings and set NEXT_PUBLIC_SITE_URL
  to the real domain. _Unparks when:_ content is filled in and the password has
  been changed.

## Recently shipped

Repo: github.com/Aayush3466/Aayushhere (public), branch `main`.

- `61ae467` — everything below, in one initial commit. Verified before pushing
  that `.env.local` is git-ignored and that no key, project ref or password
  appears anywhere in the committed content.

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
