/**
 * THE TRANSLATION LAYER
 * ---------------------
 * The only file in the codebase that knows the database speaks snake_case.
 * Everything above it — the map, the Studio, the chatbot — sees the exact shapes
 * declared in `src/lib/types.ts` and never learns where content came from.
 *
 * Rule: every mapper is total and defensive. A row with a NULL in it must still
 * produce a valid record, because the renderers collapse around missing fields
 * rather than crash on them.
 */

import type {
  ChatbotFact,
  Education,
  Experience,
  GalleryImage,
  LinkRef,
  Profile,
  Project,
  ProjectType,
  Publication,
  PublicationStatus,
  RegionKey,
  ResultImage,
  SkillGroup,
  SocialLink,
} from "@/lib/types";
import type { SectionDef, SectionId } from "@/lib/sections";

type Row = Record<string, unknown>;

/* --------------------------------- coercion -------------------------------- */

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

/** Optional text: empty strings collapse to undefined so renderers can skip. */
const opt = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s : undefined;
};

const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : Number(v) || fallback;

const bool = (v: unknown): boolean => v === true;

const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** jsonb columns arrive as parsed JSON already, but never trust the shape. */
const links = (v: unknown): LinkRef[] =>
  Array.isArray(v)
    ? v
        .filter((x): x is Row => !!x && typeof x === "object")
        .map((x) => ({ label: str(x.label), url: str(x.url) }))
        .filter((l) => l.label || l.url)
    : [];

const resultImages = (v: unknown): ResultImage[] =>
  Array.isArray(v)
    ? v
        .filter((x): x is Row => !!x && typeof x === "object")
        .map((x) => ({ url: str(x.url), caption: opt(x.caption) }))
        .filter((i) => i.url)
    : [];

const socials = (v: unknown): SocialLink[] =>
  Array.isArray(v)
    ? v
        .filter((x): x is Row => !!x && typeof x === "object")
        .map((x) => ({
          platform: str(x.platform),
          url: str(x.url),
          icon: str(x.icon, "link"),
        }))
        .filter((s) => s.platform)
    : [];

const skills = (v: unknown): SkillGroup[] =>
  Array.isArray(v)
    ? v
        .filter((x): x is Row => !!x && typeof x === "object")
        .map((x) => ({ group: str(x.group), items: strArray(x.items) }))
        .filter((g) => g.group)
    : [];

/* ------------------------------- row -> record ------------------------------ */

export function toProfile(r: Row): Profile {
  return {
    name: str(r.name),
    tagline: str(r.tagline),
    shortBio: str(r.short_bio),
    location: str(r.location),
    email: str(r.email),
    cvFileUrl: opt(r.cv_file_url),
    avatar: opt(r.avatar),
    socials: socials(r.socials),
    skills: skills(r.skills),
  };
}

export function toPublication(r: Row): Publication {
  return {
    id: str(r.id),
    title: str(r.title),
    venue: opt(r.venue),
    status: opt(r.status) as PublicationStatus | undefined,
    date: opt(r.date),
    authors: strArray(r.authors),
    abstract: opt(r.abstract),
    region: str(r.region, "cybersecurity") as RegionKey,
    links: links(r.links),
    resultImages: resultImages(r.result_images),
    order: num(r.sort_order),
  };
}

export function toProject(r: Row): Project {
  return {
    id: str(r.id),
    title: str(r.title),
    type: str(r.type, "website") as ProjectType,
    summary: opt(r.summary),
    description: opt(r.description),
    date: opt(r.date),
    tech: strArray(r.tech),
    liveUrl: opt(r.live_url),
    repoUrl: opt(r.repo_url),
    previewImage: opt(r.preview_image),
    previewSource: (opt(r.preview_source) as "auto" | "manual" | undefined) ?? null,
    region: str(r.region, "development") as RegionKey,
    order: num(r.sort_order),
  };
}

export function toExperience(r: Row): Experience {
  return {
    id: str(r.id),
    role: str(r.role),
    org: str(r.org),
    startDate: opt(r.start_date),
    endDate: opt(r.end_date),
    ongoing: bool(r.ongoing),
    summary: opt(r.summary),
    links: links(r.links),
    order: num(r.sort_order),
  };
}

export function toEducation(r: Row): Education {
  return {
    id: str(r.id),
    degree: str(r.degree),
    institution: str(r.institution),
    location: opt(r.location),
    dates: opt(r.dates),
    detail: opt(r.detail),
    links: links(r.links),
    order: num(r.sort_order),
  };
}

export function toGalleryImage(r: Row): GalleryImage {
  return {
    id: str(r.id),
    imageUrl: str(r.image_url),
    caption: opt(r.caption),
    tags: strArray(r.tags),
    order: num(r.sort_order),
  };
}

export function toChatbotFact(r: Row): ChatbotFact {
  return { id: str(r.id), fact: str(r.fact) };
}

export function toSection(r: Row): SectionDef {
  return {
    id: str(r.id) as SectionId,
    nav: str(r.nav),
    eyebrow: str(r.eyebrow),
    title: str(r.title),
    subtitle: str(r.subtitle),
    accent: str(r.accent, "#3f7c75"),
  };
}

/* ------------------------------- record -> row ------------------------------ */
/*
 * Writes are explicit rather than generic: an accidental extra key in a patch
 * would be rejected by PostgREST and fail the whole save, so each mapper names
 * exactly the columns it owns. `undefined` values are dropped by the caller so
 * partial patches stay partial.
 */

const drop = <T extends Row>(row: T): Row =>
  Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));

export function fromProfile(p: Partial<Profile>): Row {
  return drop({
    name: p.name,
    tagline: p.tagline,
    short_bio: p.shortBio,
    location: p.location,
    email: p.email,
    cv_file_url: p.cvFileUrl,
    avatar: p.avatar,
    socials: p.socials,
    skills: p.skills,
  });
}

export function fromPublication(p: Partial<Publication>): Row {
  return drop({
    id: p.id,
    title: p.title,
    venue: p.venue,
    status: p.status || null,
    date: p.date,
    authors: p.authors,
    abstract: p.abstract,
    region: p.region,
    links: p.links,
    result_images: p.resultImages,
    sort_order: p.order,
  });
}

export function fromProject(p: Partial<Project>): Row {
  return drop({
    id: p.id,
    title: p.title,
    type: p.type,
    summary: p.summary,
    description: p.description,
    date: p.date,
    tech: p.tech,
    live_url: p.liveUrl,
    repo_url: p.repoUrl,
    preview_image: p.previewImage,
    preview_source: p.previewSource ?? undefined,
    region: p.region,
    sort_order: p.order,
  });
}

export function fromExperience(e: Partial<Experience>): Row {
  return drop({
    id: e.id,
    role: e.role,
    org: e.org,
    start_date: e.startDate,
    end_date: e.endDate,
    ongoing: e.ongoing,
    summary: e.summary,
    links: e.links,
    sort_order: e.order,
  });
}

export function fromEducation(e: Partial<Education>): Row {
  return drop({
    id: e.id,
    degree: e.degree,
    institution: e.institution,
    location: e.location,
    dates: e.dates,
    detail: e.detail,
    links: e.links,
    sort_order: e.order,
  });
}

export function fromGalleryImage(g: Partial<GalleryImage>): Row {
  return drop({
    id: g.id,
    image_url: g.imageUrl,
    caption: g.caption,
    tags: g.tags,
    sort_order: g.order,
  });
}

export function fromChatbotFact(f: Partial<ChatbotFact> & { order?: number }): Row {
  return drop({ id: f.id, fact: f.fact, sort_order: f.order });
}

export function fromSection(s: Partial<SectionDef> & { order?: number }): Row {
  return drop({
    id: s.id,
    nav: s.nav,
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    accent: s.accent,
    sort_order: s.order,
  });
}

/**
 * Which mapper belongs to which collection. The Studio writes generically, so
 * this table is what keeps that generic code type-safe at the boundary.
 */
export const TO_ROW = {
  publications: fromPublication,
  projects: fromProject,
  experience: fromExperience,
  education: fromEducation,
  gallery: fromGalleryImage,
  chatbotFacts: fromChatbotFact,
} as const;

/** Database table name for each collection key used in the app. */
export const TABLE = {
  publications: "publications",
  projects: "projects",
  experience: "experience",
  education: "education",
  gallery: "gallery",
  chatbotFacts: "chatbot_facts",
} as const;
