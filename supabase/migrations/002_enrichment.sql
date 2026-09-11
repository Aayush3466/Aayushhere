-- =============================================================================
-- 002 — the enrichment set
-- =============================================================================
-- Adds bullets, metrics and per-entry timelines to every content record, plus
-- the education note that used to be hardcoded in the page.
--
-- HOW TO RUN THIS
--   Supabase DDL cannot be executed from an API key, so `npm run setup` cannot
--   apply it. Paste this whole file into the Supabase dashboard SQL editor and
--   run it once:  Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- Until you do, the public site is unaffected (a missing column is simply
-- absent from `select *`, and every reader degrades to undefined) — but SAVING
-- one of these fields from the Studio will fail, because the column is not
-- there to write to. Run it before you next edit content.
--
-- Safe to run more than once: every statement is `if not exists`.
-- =============================================================================

alter table public.publications
  add column if not exists highlights text[] not null default '{}',
  add column if not exists metrics    jsonb  not null default '[]'::jsonb,
  add column if not exists milestones jsonb  not null default '[]'::jsonb;

alter table public.projects
  add column if not exists highlights text[] not null default '{}',
  add column if not exists metrics    jsonb  not null default '[]'::jsonb,
  add column if not exists milestones jsonb  not null default '[]'::jsonb;

alter table public.experience
  add column if not exists highlights text[] not null default '{}',
  add column if not exists metrics    jsonb  not null default '[]'::jsonb,
  add column if not exists milestones jsonb  not null default '[]'::jsonb;

alter table public.education
  add column if not exists note       text,
  add column if not exists highlights text[] not null default '{}',
  add column if not exists metrics    jsonb  not null default '[]'::jsonb,
  add column if not exists milestones jsonb  not null default '[]'::jsonb;

-- -----------------------------------------------------------------------------
-- Put the education notes back.
--
-- These two paragraphs used to be hardcoded in EducationSection, chosen by
-- regex-matching "india" against the location — so they were never in the
-- database at all. Moving them onto the record is the fix, but that would blank
-- them on the live site until they were retyped. These restore the exact copy
-- that was showing, and only where the field is still empty, so they will never
-- overwrite something you have edited yourself.
-- -----------------------------------------------------------------------------

update public.education
   set note = 'Four years across the border on a fully-funded COMPEX scholarship — where the research began.'
 where id = 'edu-btech' and (note is null or note = '');

update public.education
   set note = 'Home ground — school in the Kathmandu valley, beneath Dharahara and the hills.'
 where id = 'edu-class12' and (note is null or note = '');
