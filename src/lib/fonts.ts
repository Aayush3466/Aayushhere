import { Fraunces, Spectral, Caveat } from "next/font/google";

/**
 * TYPE SYSTEM
 * -----------
 * - Display: Fraunces — a characterful, warm serif with real personality for
 *   headings and the cartographer's voice. Variable, so weights are free.
 * - Body: Spectral — an elegant serif drawn for on-screen legibility; it carries
 *   long reading passages on the clean paper panels without fatigue.
 * - Hand: Caveat — a genuine hand-lettered face, used ONLY for map labels,
 *   signposts and marginalia so the world reads as drawn, not typeset.
 *
 * All three are exposed as CSS variables and mapped to Tailwind's
 * `font-display` / `font-body` / `font-hand` utilities in globals.css.
 */

/*
 * WHAT IS DECLARED HERE IS WHAT GETS DOWNLOADED.
 *
 * This block used to ship 1.3 MB of font files across fifty requests, and it was
 * comfortably the slowest thing about a cold first visit — which is the one
 * moment a portfolio cannot afford to be slow. Almost none of it was used:
 *
 *   · Fraunces was requested as a variable font in BOTH normal and italic, two
 *     files at 130 KB and 105 KB. Display italic appears nowhere on the site.
 *   · Its WONK axis was requested and then pinned to 0 in `globals.css`, so we
 *     paid for a whole axis of outlines to keep them switched off.
 *   · Spectral was requested at four weights in two styles — eight faces — for a
 *     page that uses regular, semibold, and italic in two places.
 *   · Caveat was requested at four weights. The hand-lettering is all one.
 *
 * Every face removed below is one the site never asked for. Nothing about the
 * design changes; the page simply stops downloading things to ignore them.
 */

export const fontDisplay = Fraunces({
  subsets: ["latin"],
  // opsz drives `font-optical-sizing: auto`, SOFT is set on every heading. WONK
  // is not; it was pinned to 0.
  axes: ["opsz", "SOFT"],
  variable: "--ff-display",
  display: "swap",
});

export const fontBody = Spectral({
  subsets: ["latin"],
  variable: "--ff-body",
  display: "swap",
  // 400 for reading, 600 for emphasis. Italic is used for publication venues.
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const fontHand = Caveat({
  subsets: ["latin"],
  variable: "--ff-hand",
  display: "swap",
  // One weight. Nothing on the site sets a bold hand — `.hand` inherits 400 —
  // and this face is expensive: the latin subset alone is 73 KB, second only to
  // the display variable font.
  weight: ["400"],
});

export const fontClassNames = `${fontDisplay.variable} ${fontBody.variable} ${fontHand.variable}`;
