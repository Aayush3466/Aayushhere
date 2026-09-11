import { REGIONS } from "@/lib/map/regions";
import { localId } from "@/lib/utils";
import type { CollectionKey } from "@/lib/types";

/**
 * WHAT EACH RECORD LOOKS LIKE IN THE STUDIO
 * -----------------------------------------
 * One declarative table describing every editable field of every collection.
 * The panels render from this, so adding a field to a record means adding a line
 * here — not writing another form.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "select"
  | "bool"
  | "tags"
  | "links"
  | "image"
  | "images"
  /** Repeatable one-line bullets — "what I actually did". */
  | "list"
  /** Repeatable label / value pairs — the numbers behind a claim. */
  | "metrics"
  /** Repeatable date / label / note — a timeline inside one entry. */
  | "milestones";

export interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Storage folder for uploads. */
  folder?: string;
  /** For image fields: the record key holding a live site to pull a preview from. */
  previewFrom?: string;
  /** Lay the field across both columns of the two-column form grid. */
  wide?: boolean;
}

export interface CollectionDef {
  key: CollectionKey;
  label: string;
  /** Sentence shown under the heading — what this collection is for. */
  blurb: string;
  /** The singular noun for one record, used in empty states and confirmations. */
  singular: string;
  /** Field whose value titles the row in the list. */
  titleKey: string;
  /** Field shown as grey supporting text next to the title. */
  subtitleKey?: string;
  /** Field holding a thumbnail, if this collection has one. */
  thumbKey?: string;
  fields: FieldSpec[];
  empty: () => Record<string, unknown>;
  /** Wording for the add button, e.g. "Add publication". */
  addLabel: string;
}

const regionOptions = REGIONS.map((r) => ({ value: r.key, label: r.name }));

export const COLLECTIONS: CollectionDef[] = [
  {
    key: "publications",
    singular: "publication",
    label: "Publications",
    blurb: "Papers, preprints and manuscripts. These raise the Research Highlands.",
    titleKey: "title",
    subtitleKey: "venue",
    addLabel: "Add publication",
    fields: [
      { key: "title", label: "Title", type: "textarea", wide: true },
      { key: "venue", label: "Venue", type: "text", placeholder: "Journal or conference" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "", label: "—" },
          { value: "published", label: "Published" },
          { value: "under-review", label: "Under review" },
          { value: "submitted", label: "Submitted" },
          { value: "manuscript", label: "Manuscript" },
        ],
      },
      { key: "date", label: "Date", type: "text", placeholder: "2024" },
      { key: "region", label: "Region", type: "select", options: regionOptions, hint: "where it sits on the map" },
      { key: "authors", label: "Authors", type: "tags", wide: true },
      { key: "abstract", label: "Abstract", type: "textarea", wide: true },
      { key: "links", label: "Links", type: "links", hint: "Paper · DOI · Code", wide: true },
      { key: "resultImages", label: "Result figures", type: "images", folder: "publications", wide: true },
    ],
    empty: () => ({
      id: localId("pub"),
      title: "New publication",
      region: "cybersecurity",
      authors: [],
      links: [],
      resultImages: [],
    }),
  },
  {
    key: "projects",
    singular: "project",
    label: "Projects",
    blurb: "Shipped, living work. Anything with a live URL can pull its own preview.",
    titleKey: "title",
    subtitleKey: "summary",
    thumbKey: "previewImage",
    addLabel: "Add project",
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "type",
        label: "Type",
        type: "select",
        options: [
          { value: "website", label: "Website" },
          { value: "app", label: "App" },
          { value: "research-project", label: "Research project" },
        ],
      },
      { key: "region", label: "Region", type: "select", options: regionOptions },
      { key: "date", label: "Date", type: "text", placeholder: "2025" },
      { key: "summary", label: "Summary", type: "textarea", hint: "one line, shown on the card", wide: true },
      { key: "description", label: "Description", type: "textarea", wide: true },
      { key: "highlights", label: "Highlights", type: "list", hint: "what you actually did", wide: true },
      { key: "metrics", label: "Metrics", type: "metrics", hint: "numbers that back it up", wide: true },
      { key: "milestones", label: "Timeline", type: "milestones", hint: "stages within this entry", wide: true },
      { key: "tech", label: "Tech", type: "tags", wide: true },
      { key: "liveUrl", label: "Live URL", type: "url" },
      { key: "repoUrl", label: "Repository", type: "url" },
      {
        key: "previewImage",
        label: "Preview image",
        type: "image",
        folder: "projects",
        previewFrom: "liveUrl",
        wide: true,
      },
    ],
    empty: () => ({
      id: localId("proj"),
      title: "New project",
      type: "website",
      region: "development",
      tech: [],
      previewSource: null,
    }),
  },
  {
    key: "experience",
    singular: "role",
    label: "Experience",
    blurb: "Roles, research posts and service — the ship's logbook.",
    titleKey: "role",
    subtitleKey: "org",
    addLabel: "Add role",
    fields: [
      { key: "role", label: "Role", type: "text" },
      { key: "org", label: "Organisation", type: "text" },
      { key: "startDate", label: "Start", type: "text", placeholder: "Jan 2024" },
      { key: "endDate", label: "End", type: "text", placeholder: "leave blank if ongoing" },
      { key: "ongoing", label: "Ongoing", type: "bool" },
      { key: "summary", label: "Summary", type: "textarea", wide: true },
      { key: "highlights", label: "Highlights", type: "list", hint: "what you actually did", wide: true },
      { key: "metrics", label: "Metrics", type: "metrics", hint: "numbers that back it up", wide: true },
      { key: "milestones", label: "Timeline", type: "milestones", hint: "stages within this entry", wide: true },
      { key: "links", label: "Links", type: "links", wide: true },
    ],
    empty: () => ({ id: localId("exp"), role: "New role", org: "", ongoing: false, links: [] }),
  },
  {
    key: "education",
    singular: "entry",
    label: "Education",
    blurb: "Degrees, scholarships and honours.",
    titleKey: "degree",
    subtitleKey: "institution",
    addLabel: "Add entry",
    fields: [
      { key: "degree", label: "Degree", type: "text" },
      { key: "institution", label: "Institution", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "dates", label: "Dates", type: "text", placeholder: "2021 — 2025" },
      { key: "detail", label: "Detail", type: "textarea", hint: "CGPA · scholarship · honours", wide: true },
      { key: "note", label: "Note", type: "textarea", hint: "the paragraph shown under this entry", wide: true },
      { key: "highlights", label: "Highlights", type: "list", hint: "what you actually did", wide: true },
      { key: "metrics", label: "Metrics", type: "metrics", hint: "numbers that back it up", wide: true },
      { key: "milestones", label: "Timeline", type: "milestones", hint: "stages within this entry", wide: true },
      { key: "links", label: "Links", type: "links", wide: true },
    ],
    empty: () => ({ id: localId("edu"), degree: "New entry", institution: "", links: [] }),
  },
  {
    key: "gallery",
    singular: "plate",
    label: "Gallery",
    blurb: "Plates, figures and photographs pinned to the sketch wall.",
    titleKey: "caption",
    thumbKey: "imageUrl",
    addLabel: "Add plate",
    fields: [
      { key: "imageUrl", label: "Image", type: "image", folder: "gallery", wide: true },
      { key: "caption", label: "Caption", type: "text", wide: true },
      { key: "tags", label: "Tags", type: "tags", wide: true },
    ],
    empty: () => ({ id: localId("img"), imageUrl: "", caption: "", tags: [] }),
  },
  {
    key: "chatbotFacts",
    singular: "fact",
    label: "Chatbot facts",
    blurb: "Extra things the compass-bot may tell visitors, beyond your records.",
    titleKey: "fact",
    addLabel: "Add fact",
    fields: [{ key: "fact", label: "Fact", type: "textarea", wide: true }],
    empty: () => ({ id: localId("fact"), fact: "" }),
  },
];

export const COLLECTION_BY_KEY = Object.fromEntries(
  COLLECTIONS.map((c) => [c.key, c]),
) as Record<CollectionKey, CollectionDef>;
