# Decisions

Newest first. Append at the top; never rewrite an old entry. Each records what
was chosen, why (in Aayush's own words where they exist), and what was rejected.

---

## 2026-09-11 — The chart is a real chart

**Chosen:** a drawn coastline with all eight chapters on it — full-screen via
`M`, the nav, or a corner minimap that is always present. The route inks itself
to the furthest place reached, a wax seal stamps each place actually visited, and
the paper boat sits where you are now.

**Why:** Aayush asked for something that would make people "go out of mind", and
the honest answer was that the site had been drawn like a chart without there
being one — the metaphor was a style, unredeemed. Making it literal is the payoff
for every other design decision already taken, and unlike ornament it does real
work: a horizontal site has to answer "where am I in this thing?" or it feels
like a corridor.

**Rejected:** WebGL, a 3D scene, depth-of-field. They would fight the
hand-drawn identity and undo the whole performance pass. The rule held: nothing
on the chart animates on a loop.

**Three distinct facts, deliberately not merged:** the route says "this much
coast is surveyed" (and never un-draws when you sail back), the seals say "I
stopped here", the ship says "I am here now". Collapsing them into one progress
indicator would have been simpler and would have said less.

**Note:** geography lives in `chart.ts`, NOT on `SectionDef`, because
`SectionDef` is Studio-editable — renaming a chapter must never be able to move
the coastline. Labels do come from the editable side, so a rename relabels the
chart.

---

## 2026-09-11 — The nib writes on one canvas and stops when it dries

**Chosen:** the cursor lays a wet ink line that dries away behind it, drawn on a
single `<canvas>`, with the rAF loop running only while there is ink left.

**Why:** this replaces the thing that was measurably among the most expensive
elements on the page — a spring-following ring in `mix-blend-mode: multiply`,
which forced a backdrop read-back of the whole viewport on every mouse move. The
signature was worth keeping; the implementation was not. Verified: 100 pointer
moves laid 4373 inked pixels, and once dry the loop ran exactly one cleanup frame
and stopped.

**Rejected:** hiding the real cursor to draw a nib at the pointer. That trades
the thing every visitor aims with for decoration.

---

## 2026-09-11 — Headings do not stroke-draw themselves

**Chosen:** a nib rule inks itself under each chapter title on arrival. The
letters fade and rise as before.

**Why:** stroke-drawing real glyphs means rendering the heading as SVG text with
a stroke, which costs the crispness of real type, the ability to select it, and
correct wrapping — three things a portfolio cannot trade for one gesture. Inking
a rule beneath buys the same feeling for none of that.

---

## 2026-09-11 — Four more things that were animating invisibly

**Chosen:** `TitleReveal` drops its motion elements for plain text once the
reveal finishes; the region landmarks' and place scenes' blurred ellipses became
radial gradients; the scroll hint's loops are gated on whether it is shown;
Home's starfield is gated on the day phase.

**Why:** every one of these was the same mistake in different clothes — paying
forever for something that happens once, or animating something nobody can see.
The title pinned `will-change` on fourteen letters permanently and animated a
`filter`; fourteen SVG blur filters each demanded their own raster pass; the
scroll hint ran two infinite loops under a wrapper faded to zero on every chapter
but the first; and Home twinkled twenty-four stars by day, when `--star-opacity`
is 0 and none of them can be seen.

**Result:** on a content chapter, TWO running animations at rest, zero
`will-change` layers, zero backdrop-filters, one CSS filter. `will-change` layers
23 -> 9 on Home; CSS filters 20 -> 1.

**The lesson worth keeping:** these were all found by MEASURING the settled page
rather than by reading the code. Every one of them looked correct in the source.

---

## 2026-09-09 — Momentum is detected by its shape, not by a stopwatch

**Chosen:** the wheel handler ends a post-page "coast" when either the events
stop arriving (a 160ms gap) OR a delta arrives clearly larger than the smallest
one seen since the page turned. Listeners moved from the pager element to
`window`.

**Why:** Aayush: _"i put 2 finger then scroll sideways then it goes to another
page as it should... without moving the cursor when i again [swipe] it does not
go to next page but when i move it then again it works."_ Two causes, both real.
A gap-only test cannot tell a second swipe from the tail of the first, because a
second swipe keeps the gap small — so the map stayed stuck for as long as he kept
swiping, and moving the mouse only "fixed" it because moving takes longer than
the gap. And an element listener only sees what the browser routes to it, which
after a chapter change is the old, now-`inert` chapter or the chat launcher.

**Rejected:** simply shortening the gap. That trades a stuck map for a map that
skips three chapters on one flick — the failure the coast exists to prevent.
Momentum decays monotonically; watching for re-acceleration reads the actual
physics instead of guessing at a timeout.

---

## 2026-09-09 — Chapter index and arrival edge are one piece of state

**Chosen:** `{ index, from }` in a single `useState`, changed only through
functional updates. The mirrored ref remains, but only to answer "which chapter
can the visitor currently see" for boundary checks.

**Why:** found while testing the above. Two page turns dispatched before React
re-rendered both read the same mirrored ref, computed the same target, and the
second silently did nothing. A functional updater always sees the last committed
value. It only reproduces with the main thread blocked — which is exactly the
slow phone where dropping a gesture is least forgivable.

---

## 2026-09-09 — The overscroll threshold is shown, not hidden

**Chosen:** as the overscroll budget fills at a chapter's edge, the sheet leans
toward the next chapter in proportion to how hard you have pushed, and relaxes if
you stop. A sideways swipe now also commits on velocity, not distance alone.

**Why:** the budget makes the hand-over deliberate, but an invisible threshold
means pushing at a dead edge until the page changes at a moment you cannot
predict. Showing the door opening turns a hidden number into a physical one.
Judging a swipe on distance alone likewise punishes the quick confident flick —
the gesture of someone who already knows where they are going.

---

## 2026-09-09 — Every record can carry bullets, metrics and a timeline

**Chosen:** three optional fields — `highlights`, `metrics`, `milestones` — added
to publications, projects, experience and education at once, rendered by one
shared component and edited by three new Studio field types.

**Why:** Aayush: _"in each excperince in bukelt i can menitoen waht what i have
done... for eveyrseciotn make these feautres where i can add any type of info
bullet timeline everythin u can think of asoptional too."_ Putting them in the
shared contract rather than as bespoke fields on one record means the editor, the
sheet layout and the renderers are each written once, and adding them to a fifth
collection later is a line of schema.

**Rejected:** a single free-form rich-text field. It would have been faster and
it is what most portfolio CMSs do, but it makes every entry look different, can
never be laid out responsively, and cannot be read back by the chatbot or a
future CV export. Structured fields stay structured.

---

## 2026-09-09 — Prose about a person comes from the record, never from a regex

**Chosen:** `education.note` is a real editable field. The section chooses only
ARTWORK from the location, and anywhere it does not recognise gets a neutral
scholar's scene rather than a guess.

**Why:** the note was hardcoded as an India-or-else branch, so the third
education entry — from anywhere in the world — would have been captioned "school
in the Kathmandu valley, beneath Dharahara and the hills" under a degree earned
somewhere else entirely. Wrong prose about a real person's education is a worse
failure than a missing paragraph. It also broke the standing rule that everything
a visitor can read is editable from the Studio.

**Note:** because the site reads this from the database now, the two existing
notes would have blanked on the live site. The migration ends with two `update`
statements restoring the exact copy, applied only where the field is empty.

---

## 2026-09-09 — A publication filed anywhere still appears somewhere

**Chosen:** publications whose region is not one of the four research territories
collect under a final "Further work" group instead of being dropped.

**Why:** the Studio's Region select offers all eight regions; the Research
chapter iterated only the four with `research: true`. Choosing "Kathmandu" or
"The Horizon" — both offered, both plausible — made the paper render nowhere,
with no error. Silent data loss in a portfolio is the worst possible bug: you
would never know a paper was missing until someone asked about it.

---

## 2026-09-09 — Only three chapters are alive at once

**Chosen:** `SectionPager` mounts the active chapter and its two neighbours;
everything else renders nothing. Neighbours mount but are `.chapter-idle`
(`animation-play-state: paused`), and their backdrops skip stars, clouds and the
drifting glow entirely.

**Why:** Aayush: _"it feels wayy tooo laggy... i have shipped way heavier
wesiste and thye were smooth."_ He was right, and the cause was structural
rather than a matter of weight. Every one of the eight chapters was mounted in a
single 800vw row with its full living backdrop running — roughly thirty
full-screen animated layers being composited every frame in order to show one
eighth of them. No amount of tuning individual effects fixes that; the fix is to
stop rendering seven chapters nobody is looking at.

**Rejected:** unmounting the neighbours too. A swipe would then reveal a blank
chapter that mounts mid-transition, which trades a steady cost for a visible
stutter at the exact moment the visitor is watching.

---

## 2026-09-09 — No `backdrop-filter`, and blend modes only on hover

**Chosen:** removed every `backdrop-filter` (the nav strip, both edge buttons,
the scroll hint, `.paper-panel-soft`) in favour of near-opaque paper; removed
`mix-blend-mode` from the cursor ring and the sea glitter; moved `.sheen`'s
soft-light blend into its `:hover` rule; replaced the per-chapter `.paper-grain`
with a non-blended `.grain-inline`.

**Why:** both features force the compositor to read back what is underneath
them, which defeats layer caching. The site had four permanent blurs sitting
over the one part of the page that never stops moving, and nine stacked
full-viewport multiply layers — and a blended cursor ring that re-composited the
whole stack on every mouse move. Against this warm palette, opacity reads the
same as a blur and costs nothing. Measured after: zero backdrop-filters, one
blended layer, and it is occluded.

**Rejected:** keeping the nav blur behind a `@media (min-width: …)` guard.
Desktop was not fast either, and the effect is not worth a second code path.

---

## 2026-09-09 — Scrolling finishes a chapter before it turns the page

**Chosen:** vertical scroll is left completely alone while a chapter still has
content below the fold. At the foot, further downward intent fills a 190px
overscroll budget and only then sails onward; at the top, the same in reverse —
and sailing back lands you at the FOOT of the previous chapter, not its top.

**Why:** Aayush: _"if i scroll down if the particalr seciton is comaptle it
naturally goes to next seciton... first cometes its existing page content then
goes to next once thats comelted smothyl."_ The budget is what makes it feel
deliberate: paging the instant you touch the bottom edge makes a site feel like
it is fighting you. Landing at the previous chapter's foot is the other half —
returning someone to the top of a chapter they just read reads as the site
losing their place.

**Rejected:** a fixed post-page cooldown to absorb trackpad momentum. It also
ignores the visitor for most of a second right after they land somewhere new,
which reads as the page being stuck. The hook now detects when the flick stops
arriving (a 160ms gap) instead.

---

## 2026-09-09 — The phone gets real gestures; the column keeps native scrolling

**Chosen:** the chapter column is `touch-action: pan-y`. The browser keeps
vertical scrolling; horizontal drags reach us as cancelable events, move the
sheet live with resistance at the two ends of the voyage, and commit on release.
A vertical flick that both starts and ends pinned to a chapter boundary hands
over.

**Why:** Aayush: _"the main issue in the mobile it doesntot side scroll why is
that."_ Because there was no touch handler at all — the pager listened only to
`wheel` with `deltaX`, so on a phone the top-nav arrows were the only way to
change chapter. The `pan-y` split is deliberate: taking over vertical scrolling
to run it in JS is what makes hand-built pagers feel worse than the browser,
and during a native scroll `touchmove` is not cancelable anyway, so the vertical
hand-over is measured on release rather than fought for mid-gesture.

---

## 2026-09-09 — A card shows one sentence; the rest opens in a sheet

**Chosen:** `Expandable` — the card carries the first sentence (capped near 150
characters, cut at a sentence break where there is one), and "Read more" opens a
sheet: a bottom sheet on a phone, a centred dialog on a pointer device. No
affordance at all when the text already fits.

**Why:** Aayush: _"dont make all the infor viewable at first glance some 1
sentiec then .... when the user clicks on it it maizizeds to half screen."_ It
also fixes something he did not name: full abstracts in a grid made every tile a
different height, so the page read as rubble.

**Rejected:** CSS `line-clamp`. It cannot tell you whether it actually clipped
anything, so you either show a "read more" that opens nothing or measure the
element and thrash layout. Cutting the string decides it once, deterministically.

**Note:** the sheet renders through a portal, and that is not decoration — the
pager translates its track sideways, and a `position: fixed` element inside a
transformed ancestor is positioned against that ancestor, so a sheet rendered in
place would have opened several screens off to the right. The reading-progress
rail had exactly this bug and had been drawing off-screen unnoticed.

---

## 2026-09-09 — Published to GitHub under Aayush's name alone

**Chosen:** `github.com/Aayush3466/Aayushhere`, one initial commit authored and
committed as Aayush3466 <ayushadhikari3466@gmail.com>, with no Co-Authored-By
trailer and no Claude attribution anywhere in the history.

**Why:** "push the code at this github with my github account not claude". The
commit history of a portfolio is itself a professional artifact.

**Rejected:** pushing before auditing. The repo is PUBLIC and `.env.local` holds
the Supabase service-role key plus Resend and Groq keys. Confirmed the file is
git-ignored AND that no key, project ref or password appears in any committed
file, then un-ignored `.env.example` so the placeholder template still ships.

---

## 2026-09-09 — Chapter copy lives in the database, not in `sections.ts`

**Chosen:** a `site_sections` table; every eyebrow, title, subtitle and territory
ink is editable from Studio → Chapters. The compiled-in `SECTIONS` array stays as
the fallback and as the source of navigation order.

**Why:** "each and every field editable". Chapter headings are visible text on
the public site; leaving them in code would have made "everything is editable"
false in a way that only shows up later.

**Rejected:** mapping navigation over the database rows. Navigation is
index-based, so the chapter count must never depend on how many rows happen to
exist — `useSections()` maps over `SECTIONS` and layers live copy on top.

---

## 2026-09-09 — Metadata and the share card read the live profile

**Chosen:** `generateMetadata()` and `opengraph-image.tsx` call
`getSiteContent()` instead of importing the seed.

**Why:** renaming yourself in the Studio has to change the browser tab, the
Google result and the Slack link preview — not just the heading on the page.
Otherwise the site only *looks* editable.

**Rejected:** leaving metadata static for build-time speed. The page is ISR with
a 5-minute revalidate and on-demand revalidation from the Studio, so it costs
nothing at request time.

---

## 2026-09-09 — Security enforced by Postgres, not by application code

**Chosen:** row-level security on all 11 tables, gated on membership of an
`admins` table. Server actions use the *admin's own session*, never the
service-role key. `npm run setup` attempts a forbidden anonymous write on every
run and fails loudly if it succeeds.

**Why:** "i have added supabase credentials so that u can urself work in the
backend do whatever u can to make this work" — a portfolio with one admin and a
publishable key in every browser needs the database itself to refuse writes. A
bug in application code then cannot become a data breach.

**Rejected:** routing writes through the service-role key for reliability. It
would have switched RLS off for our own code, meaning our tests would prove
nothing about what an attacker can do.

---

## 2026-09-09 — Messages are stored before they are emailed

**Chosen:** `/api/contact` inserts into `messages` first and treats a stored
message as delivered; the Resend email is best-effort on top. The Studio inbox is
the durable record.

**Why:** email is the part that fails — a bounced key, a suspended domain, an
outage. A portfolio losing a collaboration enquiry to a transient 500 is the one
failure that actually costs something.

**Rejected:** the original `mailto:` form. It depended on the visitor having a
configured mail client and left no record on Aayush's side. Kept only as the
offline fallback.

---

## 2026-09-09 — The seed stays as a permanent fallback

**Chosen:** `getSiteContent()` degrades per-collection. A failed or empty
`gallery` query costs you the gallery, not the site.

**Why:** the portfolio is someone's public face; it must never render blank
because a network call failed or a table was half-migrated.

**Rejected:** failing loudly on a database error. Correct for an app, wrong for a
public shopfront.

---

## 2026-09-09 — Design elevation aimed at the shared paper system

**Chosen:** raise `.paper-panel` itself — fibre grain, hand-cut corner radii, cut
edge lighting — plus a pointer-reactive tilt on `Plate`, and a cartouche
treatment for the hero.

**Why:** "wherever u feel u can improve the UI then do it as this portfolio
website is of $10k dollar client". All 24 panels inherit from one class, so craft
invested there compounds across all eight chapters instead of decorating one
page. The existing design was already strong and idiomatic; this deepens it
rather than replacing it — "not typical AI tho it must be unique completing the
existing core idea".

**Rejected:** a visual redesign. The hand-drawn chart concept was well executed
and coherent; throwing it away would have destroyed the thing that makes the site
memorable.

---

## 2026-09-09 — The inking loader runs once per session

**Chosen:** `sessionStorage` flag; returning visitors skip straight to the map.

**Why:** a flourish is charming once and an obstacle every time after. Someone
coming back to check a link should land on the map, not queue for it.

**Rejected:** removing the loader. It does real work — it covers first paint of a
heavy illustrated scene, and it sets the tone.
