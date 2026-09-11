import type { RegionKey } from "@/lib/types";

/**
 * THE GEOGRAPHY
 * -------------
 * The map is one continuous coastline. Regions are fixed territory laid out in a
 * single order; content records attach to a region via their `region` field.
 * `t` is the region's position along the guided-camera path (0 = arrival at the
 * origin, 1 = the Horizon). The journey never dead-ends: after the last region
 * the coast simply opens onto the Horizon.
 */

export type RegionKind =
  | "origin"
  | "crossing"
  | "highland"
  | "coast"
  | "horizon";

export interface RegionDef {
  key: RegionKey;
  /** Name lettered on the map. */
  name: string;
  /** Sub-label / short hand-drawn caption shown on the paper panel. */
  blurb: string;
  kind: RegionKind;
  /** Position along the guided path, 0..1. */
  t: number;
  /** Ink accent for this territory (hex, used by SVG art + panel accents). */
  accent: string;
  /** A pale wash of the accent for fills behind art. */
  tint: string;
  /** True for the four Research Highlands regions. */
  research?: boolean;
}

export const REGIONS: RegionDef[] = [
  {
    key: "kathmandu",
    name: "Kathmandu",
    blurb: "Where the voyage begins — home in the Himalayas.",
    kind: "origin",
    t: 0.0,
    accent: "#43506B",
    tint: "#E4E6EC",
  },
  {
    key: "india",
    name: "The COMPEX Crossing",
    blurb: "A scholarship flight-path inks itself across to India — four years of study.",
    kind: "crossing",
    t: 0.14,
    accent: "#C0883C",
    tint: "#F0E6D2",
  },
  {
    key: "cybersecurity",
    name: "The Cybersecurity Range",
    blurb: "Intrusion detection & DDoS defence, carved into hybrid models.",
    kind: "highland",
    t: 0.3,
    accent: "#4B587A",
    tint: "#E4E7EE",
    research: true,
  },
  {
    key: "bioinformatics",
    name: "The Bioinformatics Coast",
    blurb: "Genes, optimization and ensembles along a quiet shore.",
    kind: "highland",
    t: 0.44,
    accent: "#3F7C75",
    tint: "#DDE9E5",
    research: true,
  },
  {
    key: "nlp",
    name: "The Mental-Health Forest",
    blurb: "Language, emotion and wellbeing, read at scale.",
    kind: "highland",
    t: 0.58,
    accent: "#6E7B55",
    tint: "#E6E9DC",
    research: true,
  },
  {
    key: "vision",
    name: "The Computer Vision Shore",
    blurb: "Images learned pixel by pixel — currency, x-rays, denominations.",
    kind: "highland",
    t: 0.72,
    accent: "#C2765A",
    tint: "#F1E1D8",
    research: true,
  },
  {
    key: "development",
    name: "The Development Coast",
    blurb: "Shipped, living work — websites & apps you can open.",
    kind: "coast",
    t: 0.86,
    accent: "#C0883C",
    tint: "#F1E7D3",
  },
  {
    key: "horizon",
    name: "The Horizon",
    blurb: "A lighthouse, and the question of where we sail next.",
    kind: "horizon",
    t: 1.0,
    accent: "#3F7C75",
    tint: "#DDE9E5",
  },
];

const REGION_BY_KEY: Record<RegionKey, RegionDef> = REGIONS.reduce(
  (acc, r) => {
    acc[r.key] = r;
    return acc;
  },
  {} as Record<RegionKey, RegionDef>,
);

export function getRegion(key: RegionKey): RegionDef {
  // Never undefined. Callers destructure the result straight into SVG attrs, so
  // one unrecognised key from the database would take a whole chapter down —
  // and the whole read path is built on degrading rather than throwing.
  return REGION_BY_KEY[key] ?? REGION_BY_KEY.horizon;
}

/** The four Research Highlands, in journey order. */
export const RESEARCH_REGIONS = REGIONS.filter((r) => r.research);

/** Explorer's route -> where the camera first lands. The whole map stays open. */
export type ExploreRoute = "research" | "build" | "wander";

export const ROUTE_START: Record<ExploreRoute, RegionKey> = {
  research: "cybersecurity",
  build: "development",
  wander: "kathmandu",
};

export const ROUTE_COPY: Record<
  ExploreRoute,
  { title: string; hint: string }
> = {
  research: {
    title: "Review my research",
    hint: "Begin deep in the Research Highlands.",
  },
  build: {
    title: "See what I've built",
    hint: "Set sail on the Development Coast.",
  },
  wander: {
    title: "Just let me wander",
    hint: "Start at home and roam the whole chart.",
  },
};
