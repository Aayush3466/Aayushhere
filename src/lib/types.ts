import type { SectionDef } from "@/lib/sections";

/**
 * THE DATA CONTRACT
 * -----------------
 * Every piece of content on the public map is one of these records. The public
 * site, the studio, the chatbot, and (later) Supabase all speak exactly these
 * shapes. This is what makes the "one rendering machine" possible: there is only
 * one description of what a Publication / Project / etc. *is*, so anything added
 * later is drawn by the same components and is born already-designed.
 *
 * Design rule: every field beyond the essentials is OPTIONAL. The renderers must
 * collapse cleanly around whatever is missing — never leave an empty slot.
 */

/** The geography of the world. Regions are fixed map territory; records attach to them. */
export type RegionKey =
  | "kathmandu" // origin / home — the Himalayas
  | "india" // the COMPEX crossing — education
  | "cybersecurity" // Research Highlands: the Cybersecurity range
  | "bioinformatics" // Research Highlands: the Bioinformatics coast
  | "nlp" // Research Highlands: the NLP / Mental-Health forest
  | "vision" // Research Highlands: the Computer Vision shore
  | "development" // the Development Coast — shipped websites & apps
  | "horizon"; // the Horizon — lighthouse, roles sought & contact

export interface LinkRef {
  label: string; // e.g. "Paper", "arXiv", "Code", "DOI"
  url: string;
}

export interface ResultImage {
  url: string;
  caption?: string;
}

/**
 * THE ENRICHMENT SET
 * ------------------
 * Three optional shapes every record can carry. They exist because a portfolio
 * entry is not one paragraph — a role is a list of things you actually did, a
 * project is a claim plus the numbers backing it, and a long engagement has
 * stages inside it. Making these part of the shared contract (rather than
 * bespoke fields on one record type) means the Studio editor, the sheet layout
 * and the renderers are each written once and every collection gets them.
 *
 * All optional, always. A record with none of them renders exactly as it does
 * today — the design rule that every field beyond the essentials must collapse
 * cleanly still holds.
 */

/** One measured claim: "Accuracy" / "98.2%". Renders as a stat row. */
export interface Metric {
  label: string;
  value: string;
}

/** One dated step inside a single entry — a promotion, a phase, a release. */
export interface Milestone {
  date?: string;
  label: string;
  note?: string;
}

export interface Enrichable {
  /** What you actually did, as bullets. The most useful field on the site. */
  highlights?: string[];
  /** Numbers that back the claim up. */
  metrics?: Metric[];
  /** A timeline within this one entry. */
  milestones?: Milestone[];
}

export type PublicationStatus =
  | "published"
  | "under-review"
  | "submitted"
  | "manuscript";

export interface Publication extends Enrichable {
  id: string;
  title: string;
  venue?: string;
  status?: PublicationStatus;
  date?: string; // free-form; year is fine ("2024"), full ISO is fine too
  authors?: string[];
  abstract?: string;
  region: RegionKey;
  links: LinkRef[];
  resultImages: ResultImage[];
  order?: number;
}

export type ProjectType = "website" | "app" | "research-project";

export interface Project extends Enrichable {
  id: string;
  title: string;
  type: ProjectType;
  summary?: string;
  description?: string;
  date?: string;
  tech?: string[];
  liveUrl?: string;
  repoUrl?: string;
  previewImage?: string;
  /** Honest provenance of the preview thumbnail, surfaced in the studio UI. */
  previewSource?: "auto" | "manual" | null;
  region: RegionKey;
  order?: number;
}

export interface Experience extends Enrichable {
  id: string;
  role: string;
  org: string;
  startDate?: string;
  endDate?: string;
  ongoing: boolean;
  summary?: string;
  links?: LinkRef[];
  order?: number;
}

export interface Education extends Enrichable {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  dates?: string;
  detail?: string; // CGPA, scholarship, honours
  /**
   * The paragraph under the entry. Was hardcoded in the section as an
   * India-or-else branch, which would have written prose about the Kathmandu
   * valley beneath a degree earned anywhere else.
   */
  note?: string;
  links?: LinkRef[];
  order?: number;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  tags?: string[];
  order?: number;
}

export interface SocialLink {
  platform: string; // "LinkedIn", "GitHub", "Google Scholar", "Email"...
  url: string;
  icon: string; // icon key resolved by the hand-drawn icon set
}

export interface SkillGroup {
  group: string; // e.g. "Machine Learning & AI"
  items: string[];
}

export interface Profile {
  name: string;
  tagline: string;
  shortBio: string;
  location: string;
  email: string;
  cvFileUrl?: string;
  socials: SocialLink[];
  avatar?: string;
  /** Grouped skill inventory — displayed as the ship's instruments and read by the bot. */
  skills?: SkillGroup[];
}

export interface ChatbotFact {
  id: string;
  fact: string;
}

/** The complete site — one object the map, studio, and chatbot all read. */
export interface SiteContent {
  profile: Profile;
  publications: Publication[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  gallery: GalleryImage[];
  chatbotFacts: ChatbotFact[];
  /** Chapter copy (eyebrow/title/subtitle/ink) — editable like any other record. */
  sections?: SectionDef[];
}

/** Which collections a record can live in — used generically by the studio. */
export type CollectionKey =
  | "publications"
  | "projects"
  | "experience"
  | "education"
  | "gallery"
  | "chatbotFacts";
