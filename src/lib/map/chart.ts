import type { SectionId } from "@/lib/sections";

/**
 * THE CHART'S GEOMETRY
 * --------------------
 * Where each chapter sits on the drawn map, and the route that joins them.
 *
 * Keyed by CHAPTER, not by region. Regions (`regions.ts`) are the territory
 * content attaches to; chapters are what a visitor actually travels between, so
 * the thing you navigate on a map has to be one place per chapter.
 *
 * Coordinates live here rather than on `SectionDef` because `SectionDef` is
 * editable from the Studio — someone renaming a chapter should never be able to
 * move the coastline. Labels DO come from the editable side, so a rename flows
 * onto the chart; only the geography is fixed.
 */

export interface ChartPlace {
  id: SectionId;
  /** Position in the chart's own 1200 x 620 coordinate space. */
  x: number;
  y: number;
  /** Which landmark to draw at this place. */
  glyph: Glyph;
  /** Which side of the point the label sits on, so labels never collide. */
  side: "left" | "right" | "above" | "below";
}

export type Glyph =
  | "harbour"
  | "temple"
  | "peaks"
  | "town"
  | "plates"
  | "waypoint"
  | "tavern"
  | "lighthouse";

/** The chart's coordinate space. Everything below is expressed in it. */
export const CHART_W = 1200;
export const CHART_H = 620;

/**
 * The voyage, west to east. The route is a coastline read left to right with
 * real vertical wander — a straight line of eight dots would read as a progress
 * bar with decoration on it, not as a place.
 */
export const CHART_PLACES: ChartPlace[] = [
  { id: "home", x: 112, y: 452, glyph: "harbour", side: "below" },
  { id: "education", x: 268, y: 298, glyph: "temple", side: "left" },
  { id: "research", x: 438, y: 172, glyph: "peaks", side: "above" },
  { id: "projects", x: 622, y: 322, glyph: "town", side: "below" },
  { id: "gallery", x: 778, y: 182, glyph: "plates", side: "above" },
  { id: "experience", x: 916, y: 352, glyph: "waypoint", side: "below" },
  { id: "games", x: 1040, y: 232, glyph: "tavern", side: "above" },
  { id: "contact", x: 1122, y: 470, glyph: "lighthouse", side: "left" },
];

/**
 * A smooth route that passes exactly THROUGH every place.
 *
 * Catmull-Rom converted to cubic Béziers: interpolating rather than
 * approximating, so a place marker and the line that reaches it can never drift
 * apart. Coordinates are emitted at fixed precision because this string is
 * rendered on the server and again on the client — an unrounded float would
 * differ in its last digit between the two and trip a hydration mismatch.
 */
export function routeThrough(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  const f = (n: number) => n.toFixed(1);
  const d = [`M${f(points[0].x)},${f(points[0].y)}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    // 1/6 is the standard Catmull-Rom -> Bézier tangent scale; it keeps the
    // curve taut enough to read as an inked line rather than a rubber band.
    const k = 1 / 6;
    const c1x = p1.x + (p2.x - p0.x) * k;
    const c1y = p1.y + (p2.y - p0.y) * k;
    const c2x = p2.x - (p3.x - p1.x) * k;
    const c2y = p2.y - (p3.y - p1.y) * k;
    d.push(`C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2.x)},${f(p2.y)}`);
  }
  return d.join(" ");
}

export const ROUTE_D = routeThrough(CHART_PLACES);

/**
 * The land the route crosses, and the bay it ends at.
 *
 * Hand-authored rather than generated: a coastline's whole job is to look drawn,
 * and nothing generated from a formula ever does.
 */
export const COASTLINE_D =
  "M-20,268 C70,214 138,186 214,206 C286,225 330,124 420,116 C512,108 556,196 636,244 C702,284 742,120 812,128 C880,136 900,238 966,262 C1030,285 1074,236 1122,300 C1168,360 1214,404 1240,470 L1240,660 L-20,660 Z";

/** The bay in the south-east, where the lighthouse stands. */
export const BAY_D =
  "M1240,470 C1180,438 1120,452 1062,498 C1004,544 960,560 900,556 C848,552 806,588 776,660 L1240,660 Z";

/** A few inland ridges, purely to give the land relief. */
export const RIDGES: string[] = [
  "M196,252 l22,-26 l22,26",
  "M242,244 l26,-30 l26,30",
  "M392,166 l30,-34 l30,34",
  "M452,158 l26,-30 l26,30",
  "M508,182 l22,-26 l22,26",
  "M690,214 l24,-28 l24,28",
  "M856,236 l22,-26 l22,26",
];
