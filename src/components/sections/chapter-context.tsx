"use client";

import { createContext, useContext } from "react";

/**
 * WHERE A CHAPTER PUTS YOU WHEN YOU ARRIVE
 * ----------------------------------------
 * Sail forward and you land at the top of the new chapter. Sail BACK and you
 * land at the foot of the previous one — which is where you actually left it.
 * Returning someone to the top of a chapter they just scrolled through reads as
 * the site losing your place.
 *
 * The pager sets this in the same update as the chapter index, so by the time a
 * shell's "I am active now" effect runs, this already says how it got here.
 */
export type EntryEdge = "top" | "bottom";

export const EntryCtx = createContext<EntryEdge>("top");

export function useEntryEdge(): EntryEdge {
  return useContext(EntryCtx);
}

/**
 * The pager finds the active chapter's scrolling column by looking for these two
 * attributes rather than keeping a registry of elements. Boundary checks happen
 * a handful of times per gesture, so a scoped `querySelector` costs nothing —
 * and unlike a registry it cannot go stale when chapters mount and unmount.
 */
export const CHAPTER_ATTR = "data-chapter";
export const SCROLLER_ATTR = "data-chapter-scroll";
