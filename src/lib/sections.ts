/**
 * THE CHAPTERS
 * ------------
 * The site is a horizontal voyage across these chapters; entering one scrolls
 * vertically through its details. Order == travel order. Adding a chapter here
 * makes it appear in the pager and the top voyage-nav automatically.
 */
export type SectionId =
  | "home"
  | "education"
  | "research"
  | "projects"
  | "gallery"
  | "experience"
  | "games"
  | "contact";

export interface SectionDef {
  id: SectionId;
  nav: string; // short label in the top nav
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: string; // territory ink for this chapter
}

export const SECTIONS: SectionDef[] = [
  {
    id: "home",
    nav: "Home",
    eyebrow: "An illustrated chart of",
    title: "The Chart",
    subtitle: "set your heading",
    accent: "#43506b",
  },
  {
    id: "education",
    nav: "Education",
    eyebrow: "Origins & study",
    title: "Where it was formed",
    subtitle: "from Kathmandu to a COMPEX scholarship in India",
    accent: "#c0883c",
  },
  {
    id: "research",
    nav: "Research",
    eyebrow: "The research highlands",
    title: "Research",
    subtitle: "cybersecurity · bioinformatics · language · vision",
    accent: "#3f7c75",
  },
  {
    id: "projects",
    nav: "Projects",
    eyebrow: "The development coast",
    title: "Projects & builds",
    subtitle: "shipped, living work you can open",
    accent: "#c2765a",
  },
  {
    id: "gallery",
    nav: "Gallery",
    eyebrow: "The sketch wall",
    title: "Gallery",
    subtitle: "plates, figures & photographs, pinned to the chart",
    accent: "#b07a3e",
  },
  {
    id: "experience",
    nav: "Experience",
    eyebrow: "The logbook",
    title: "Experience",
    subtitle: "roles, research and service",
    accent: "#6e7b55",
  },
  {
    id: "games",
    nav: "Games",
    eyebrow: "The game room",
    title: "Test your speed",
    subtitle: "type fast — earn a place on the leaderboard",
    accent: "#43506b",
  },
  {
    id: "contact",
    nav: "Contact",
    eyebrow: "The horizon",
    title: "Where we sail next",
    subtitle: "collaborations, roles & a hello",
    accent: "#3f7c75",
  },
];

export const SECTION_INDEX: Record<SectionId, number> = SECTIONS.reduce(
  (acc, s, i) => {
    acc[s.id] = i;
    return acc;
  },
  {} as Record<SectionId, number>,
);
