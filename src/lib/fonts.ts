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

export const fontDisplay = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--ff-display",
  display: "swap",
});

export const fontBody = Spectral({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--ff-body",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const fontHand = Caveat({
  subsets: ["latin"],
  variable: "--ff-hand",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const fontClassNames = `${fontDisplay.variable} ${fontBody.variable} ${fontHand.variable}`;
