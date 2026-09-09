import "server-only";
import { SEED } from "@/data/seed";
import type { SiteContent } from "@/lib/types";
import { SECTIONS } from "@/lib/sections";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPublicClient } from "@/lib/supabase/read";
import {
  toChatbotFact,
  toEducation,
  toExperience,
  toGalleryImage,
  toProfile,
  toProject,
  toPublication,
  toSection,
} from "@/lib/supabase/map";

/**
 * THE ONE READ PATH (server side)
 * -------------------------------
 * The entire public map renders from this single function. With Supabase keys
 * present it reads the live tables; without them — or if the database is
 * unreachable, empty, or half-migrated — it returns the seed instead.
 *
 * That fallback is the point: the portfolio is someone's public face, so it must
 * never render blank because a network call failed. Every collection degrades
 * independently, so a broken `gallery` table costs you the gallery, not the site.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const withSections: SiteContent = { ...SEED, sections: SECTIONS };
  if (!isSupabaseConfigured()) return withSections;

  const db = getPublicClient();
  if (!db) return withSections;

  try {
    const [profile, pubs, projects, exp, edu, gallery, facts, sections] =
      await Promise.all([
        db.from("profile").select("*").eq("id", 1).maybeSingle(),
        db.from("publications").select("*").order("sort_order"),
        db.from("projects").select("*").order("sort_order"),
        db.from("experience").select("*").order("sort_order"),
        db.from("education").select("*").order("sort_order"),
        db.from("gallery").select("*").order("sort_order"),
        db.from("chatbot_facts").select("*").order("sort_order"),
        db.from("site_sections").select("*").order("sort_order"),
      ]);

    // A collection is used only when the query succeeded AND returned rows;
    // anything else keeps that part of the seed, so the map is always complete.
    const rows = <T>(
      res: { data: unknown; error: unknown },
      map: (r: Record<string, unknown>) => T,
      fallback: T[],
    ): T[] => {
      if (res.error || !Array.isArray(res.data) || res.data.length === 0)
        return fallback;
      return (res.data as Record<string, unknown>[]).map(map);
    };

    return {
      profile:
        !profile.error && profile.data
          ? toProfile(profile.data as Record<string, unknown>)
          : SEED.profile,
      publications: rows(pubs, toPublication, SEED.publications),
      projects: rows(projects, toProject, SEED.projects),
      experience: rows(exp, toExperience, SEED.experience),
      education: rows(edu, toEducation, SEED.education),
      gallery: rows(gallery, toGalleryImage, SEED.gallery),
      chatbotFacts: rows(facts, toChatbotFact, SEED.chatbotFacts),
      sections: rows(sections, toSection, SECTIONS),
    };
  } catch {
    // Network down, DNS failure, project paused — show the seed, not an error.
    return withSections;
  }
}
