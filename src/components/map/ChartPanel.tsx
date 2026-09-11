"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SectionDef } from "@/lib/sections";
import { VoyageChart } from "./VoyageChart";

/**
 * THE CHART, PRESENTED
 * --------------------
 * The full-screen chart, opened with `M` or the nav's chart button.
 *
 * There was a corner minimap here too. It answered a real question — "where am
 * I in this thing?", which a horizontal site has to answer or it feels like a
 * corridor — but it answered it by floating over the content, and on a
 * portfolio a widget parked on top of someone's reading is the worst bug there
 * is. Shrinking it would only have made the collision smaller, so the question
 * moved to where chrome belongs: the nav strip now draws the route and the
 * seals (see `TopNav`). This file is just the chart itself.
 *
 * It lives inside the pager's root, which is `fixed inset-0` and NOT
 * transformed, so `absolute` here means the viewport. (The translated track is a
 * child of that root — rendering this inside the track instead would put it
 * several screens off to the side, the trap the reading rail fell into.)
 */
export function ChartOverlay({
  open,
  onClose,
  index,
  visited,
  sections,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  index: number;
  visited: ReadonlySet<number>;
  sections: SectionDef[];
  onPick: (i: number) => void;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "m" || e.key === "M") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        // `data-nav-ignore` so a scroll over the chart never sails the map.
        <motion.div
          data-nav-ignore
          className="absolute inset-0 z-[75] flex flex-col items-center justify-center px-4 py-6 sm:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <button
            type="button"
            aria-label="Close the chart"
            onClick={onClose}
            className="absolute inset-0 cursor-default"
            style={{ background: "color-mix(in oklab, var(--color-ink) 46%, transparent)" }}
          />

          <motion.div
            className="paper-panel relative w-full max-w-5xl overflow-hidden p-3 sm:p-5"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="mb-2 flex items-baseline gap-3 px-2 sm:mb-3">
              <h2 className="font-display text-xl font-semibold sm:text-2xl">The Chart</h2>
              <p className="hand hidden text-lg text-ink-faint sm:block">
                pick a territory to sail there
              </p>
              <p className="hand text-base text-ink-faint sm:hidden">drag · tap a place</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close the chart"
                className="pop ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:var(--color-paper-edge)] text-ink-soft hover:text-ink"
                style={{ background: "var(--color-paper-panel)" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            {/* On a phone the chart is held at a minimum width and panned.
                Scaled to fit a 375px screen its hand-lettered place names render
                at about six pixels — present, but not readable, which is worse
                than making someone drag. `data-nav-ignore` on the overlay is
                what lets this scroll sideways without sailing the map. */}
            <div className="overflow-x-auto overscroll-contain rounded-[10px] border border-[color:color-mix(in_oklab,var(--color-paper-edge)_70%,transparent)]">
              <div className="min-w-[620px] sm:min-w-0">
                <VoyageChart
                  index={index}
                  visited={visited}
                  sections={sections}
                  onPick={(i) => {
                    onPick(i);
                    onClose();
                  }}
                />
              </div>
            </div>

            <p className="hand mt-2 px-2 text-center text-base text-ink-faint sm:text-lg">
              {visited.size} of {sections.length} territories sealed · press{" "}
              <kbd className="font-display text-sm">M</kbd> to close the chart
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
