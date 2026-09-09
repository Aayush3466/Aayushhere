# The Cartographer — Aayush Adhikari's illustrated portfolio

A hand-drawn "explorer's chart" portfolio. One continuous map you travel: Home →
Education → Research → Projects → Gallery → Experience → Games → Contact.
Next.js 16 · React 19 · TypeScript · Tailwind v4 · Framer Motion · Supabase.

Every word, record, image and chapter heading on the public map is editable from
`/studio` by a single signed-in owner. Nothing is hard-coded into a page.

## Run it

Requires **Node 20+** (Node 24 recommended — the setup script imports the
TypeScript seed directly).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Backend setup (once)

1. Create a project at [supabase.com](https://supabase.com), then copy
   `.env.example` → `.env.local` and fill in the three Supabase values from
   **Project Settings → API**.

2. Create the tables. DDL cannot be run with an API key, so this step is manual:
   open your project's **SQL Editor → New query**, paste the whole of
   [`supabase/schema.sql`](supabase/schema.sql), and press **Run**. It is
   idempotent — re-running it is safe.

3. Provision the owner account and seed the database from the CV:

   ```bash
   npm run setup
   ```

   It creates the admin user, grants it write access, seeds any empty table, and
   then verifies the security rules by actually attempting a forbidden write. It
   prints a generated password **once** — save it, then change it from
   **Studio → Account**.

Useful variants:

```bash
npm run setup -- --password "your-own-password"   # choose the password yourself
npm run setup -- --email you@example.com          # a different owner address
npm run setup -- --force-seed                     # overwrite tables with the CV seed
```

Re-running `npm run setup` never overwrites content you have edited unless you
pass `--force-seed`.

## The Studio

Go to **/studio** and sign in. Edits save themselves as you type; the header
tells you whether changes are only on screen, saving, or safely stored.

| Panel | What it edits |
| --- | --- |
| Profile | Name, tagline, bio, location, email, portrait, CV, socials, skills |
| Chapters | Every eyebrow, title, subtitle and territory ink on the map |
| Publications | Papers, authors, abstracts, links, result figures |
| Projects | Summary, tech, live/repo URLs, preview image (auto-fetchable) |
| Experience · Education | The logbook and the degrees |
| Gallery | Plates and photographs, uploaded straight to Supabase Storage |
| Chatbot facts | Extra things the compass-bot may tell visitors |
| Messages | Everything sent from the contact form |
| Leaderboard | Every visitor's typing run, with moderation |
| Account | Change the Studio password |

Images and the CV upload from the browser directly to Supabase Storage and come
back as permanent public URLs.

## How the security works

One admin, enforced by the database rather than by application code:

- The public may **read** published content, **post** one game score, and
  **send** a message. That is the entire list.
- Every write requires a row in `admins` for the signed-in user. This is checked
  by Postgres row-level security, so a leaked publishable key still cannot change
  a single field — `npm run setup` proves this on every run by attempting an
  anonymous write and confirming it is refused.
- The contact inbox is write-only to the public: a visitor can send a message and
  can never read one.
- `/studio` is additionally gated in `src/proxy.ts` (an optimistic redirect) and
  in `src/lib/auth/dal.ts` (the real check, next to the data).

## Other keys (all optional)

- **Chatbot model** — set either `GROQ_API_KEY` or `GEMINI_API_KEY` for
  open-ended, reply-in-any-language answers. Retrieval works with no key at all.
- **Resend** (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`) — emails you each contact
  message. Messages are stored in the database first, so nothing is lost if
  email delivery fails.

## Deploy (Vercel)

Push to GitHub → import in Vercel → add the same env vars in Project Settings →
deploy. Set `NEXT_PUBLIC_SITE_URL` to your real domain. Runs on the free tier.

## Structure

- `supabase/schema.sql` — tables, row-level security, storage bucket.
- `scripts/setup.mjs` — one-shot provisioning, seeding and verification.
- `src/data/seed.ts` — the CV as data; seeds a fresh database and is the fallback
  whenever Supabase is unreachable, so the site is never blank.
- `src/lib/content.ts` — the single read path for the whole public map.
- `src/lib/supabase/map.ts` — the only file that knows the database is snake_case.
- `src/lib/actions/` — every write, each re-checking authorization.
- `src/components/sections/` — the chaptered voyage.
- `src/components/world/` — the illustrated art (sea, sky, landmarks, avatar…).
- `src/components/studio/` — the admin studio.
