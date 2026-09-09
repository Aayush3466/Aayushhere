# Decisions

Newest first. Append at the top; never rewrite an old entry. Each records what
was chosen, why (in Aayush's own words where they exist), and what was rejected.

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
