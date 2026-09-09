-- ============================================================================
-- THE CARTOGRAPHER — DATABASE
-- ----------------------------------------------------------------------------
-- One idempotent script. Safe to re-run: it only ever adds or replaces.
--
-- Shape rule: these tables mirror `src/lib/types.ts` exactly, in snake_case.
-- `src/lib/supabase/map.ts` is the only place that translates between the two,
-- so the rendering machine never learns where content came from.
--
-- Security model: ONE admin. The public may read published content, post a game
-- score, and send a message; nothing else. Every write is gated on membership of
-- `admins`, enforced by Postgres (RLS) rather than by application code — so even
-- a leaked publishable key cannot change a single field.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ================================================================= admin gate
-- Membership here is what makes a logged-in user the owner. Seeded once by
-- `npm run studio:admin`, using the service-role key.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- The single source of truth for "may this request write?".
-- SECURITY DEFINER so RLS policies can consult `admins` without the caller
-- needing read access to it; search_path is pinned to defeat shadowing.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $fn$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$fn$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- =================================================================== content
-- Ids stay `text` so records created in the Studio keep their id when they sync,
-- and so the seed file imports unchanged.

create table if not exists public.profile (
  id           smallint primary key default 1,
  name         text not null default '',
  tagline      text not null default '',
  short_bio    text not null default '',
  location     text not null default '',
  email        text not null default '',
  cv_file_url  text,
  avatar       text,
  socials      jsonb not null default '[]'::jsonb,
  skills       jsonb not null default '[]'::jsonb,
  updated_at   timestamptz not null default now(),
  constraint profile_is_singleton check (id = 1)
);

create table if not exists public.publications (
  id            text primary key,
  title         text not null default '',
  venue         text,
  status        text,
  date          text,
  authors       text[] not null default '{}',
  abstract      text,
  region        text not null default 'cybersecurity',
  links         jsonb not null default '[]'::jsonb,
  result_images jsonb not null default '[]'::jsonb,
  sort_order    integer not null default 0,
  updated_at    timestamptz not null default now()
);

create table if not exists public.projects (
  id             text primary key,
  title          text not null default '',
  type           text not null default 'website',
  summary        text,
  description    text,
  date           text,
  tech           text[] not null default '{}',
  live_url       text,
  repo_url       text,
  preview_image  text,
  preview_source text,
  region         text not null default 'development',
  sort_order     integer not null default 0,
  updated_at     timestamptz not null default now()
);

create table if not exists public.experience (
  id         text primary key,
  role       text not null default '',
  org        text not null default '',
  start_date text,
  end_date   text,
  ongoing    boolean not null default false,
  summary    text,
  links      jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id          text primary key,
  degree      text not null default '',
  institution text not null default '',
  location    text,
  dates       text,
  detail      text,
  links       jsonb not null default '[]'::jsonb,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.gallery (
  id         text primary key,
  image_url  text not null default '',
  caption    text,
  tags       text[] not null default '{}',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.chatbot_facts (
  id         text primary key,
  fact       text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- The chapter copy itself is content too: every eyebrow, title, subtitle and
-- territory ink on the public map is editable from the Studio.
create table if not exists public.site_sections (
  id         text primary key,
  nav        text not null default '',
  eyebrow    text not null default '',
  title      text not null default '',
  subtitle   text not null default '',
  accent     text not null default '#3f7c75',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Visitors' typing runs. Public may insert (bounded), everyone may read.
create table if not exists public.scores (
  id         uuid primary key default gen_random_uuid(),
  game       text not null,
  name       text not null,
  location   text,
  wpm        integer not null,
  accuracy   numeric(5,2) not null,
  seconds    integer not null,
  created_at timestamptz not null default now(),
  constraint scores_game_valid check (game in ('words','code')),
  constraint scores_name_len   check (char_length(name) between 1 and 40),
  constraint scores_loc_len    check (location is null or char_length(location) <= 60),
  -- Bounds are the anti-nonsense guard: a human cannot type 400 wpm.
  constraint scores_wpm_sane   check (wpm between 0 and 400),
  constraint scores_acc_sane   check (accuracy between 0 and 100),
  constraint scores_time_sane  check (seconds between 5 and 600)
);

create index if not exists scores_game_wpm_idx on public.scores (game, wpm desc);

-- Messages from the lighthouse contact form, kept so nothing is lost to a
-- bounced email.
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  body       text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now(),
  constraint messages_name_len check (char_length(name) between 1 and 80),
  constraint messages_mail_len check (char_length(email) between 3 and 160),
  constraint messages_body_len check (char_length(body) between 1 and 5000)
);

create index if not exists messages_created_idx on public.messages (created_at desc);

-- ---------------------------------------------------------------- updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

do $do$
declare t text;
begin
  foreach t in array array[
    'profile','publications','projects','experience',
    'education','gallery','chatbot_facts','site_sections'
  ] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$I', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$I
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $do$;

-- ======================================================================= RLS
alter table public.admins        enable row level security;
alter table public.profile       enable row level security;
alter table public.publications  enable row level security;
alter table public.projects      enable row level security;
alter table public.experience    enable row level security;
alter table public.education     enable row level security;
alter table public.gallery       enable row level security;
alter table public.chatbot_facts enable row level security;
alter table public.site_sections enable row level security;
alter table public.scores        enable row level security;
alter table public.messages      enable row level security;

-- Public content: world-readable, admin-writable.
do $do$
declare t text;
begin
  foreach t in array array[
    'profile','publications','projects','experience',
    'education','gallery','chatbot_facts','site_sections'
  ] loop
    execute format('drop policy if exists "%1$s_read"  on public.%1$I', t);
    execute format('drop policy if exists "%1$s_write" on public.%1$I', t);

    execute format(
      'create policy "%1$s_read" on public.%1$I
         for select to anon, authenticated using (true)', t);

    -- One FOR ALL policy carrying both USING and WITH CHECK covers
    -- insert / update / delete in a single, auditable rule.
    execute format(
      'create policy "%1$s_write" on public.%1$I
         for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $do$;

-- The admin roster is readable only by that admin, and is never writable from
-- the client at all — it is seeded with the service-role key.
drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Scores: anyone may post a run and read the board; only the admin may delete
-- (moderation). No updates by anyone — a posted run is immutable.
drop policy if exists "scores_read"   on public.scores;
drop policy if exists "scores_insert" on public.scores;
drop policy if exists "scores_delete" on public.scores;
create policy "scores_read"   on public.scores for select to anon, authenticated using (true);
create policy "scores_insert" on public.scores for insert to anon, authenticated with check (true);
create policy "scores_delete" on public.scores for delete to authenticated using (public.is_admin());

-- Messages: write-only for the public (a visitor may send, never read the
-- inbox); the admin reads and manages.
drop policy if exists "messages_insert" on public.messages;
drop policy if exists "messages_admin"  on public.messages;
create policy "messages_insert" on public.messages for insert to anon, authenticated with check (true);
create policy "messages_admin"  on public.messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =================================================================== storage
-- One public bucket for every uploaded asset: gallery plates, project preview
-- thumbnails, the avatar, the CV.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media_public_read" on storage.objects;
drop policy if exists "media_admin_write" on storage.objects;

create policy "media_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

create policy "media_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
