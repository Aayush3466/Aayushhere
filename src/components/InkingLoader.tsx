"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * "Inking the map" — the first-load overlay. A little coastline draws itself,
 * then the sheet lifts to reveal the world. With reduced motion it simply shows
 * for a beat and fades, never animating strokes.
 */
/** Marks that this browser session has already watched the map ink itself. */
const SEEN_KEY = "cartographer:inked";

export function InkingLoader() {
  const [visible, setVisible] = useState(true);
  const [returning, setReturning] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    // Read the motion preference once so hot-reloads / preference changes can't
    // reset the dismiss timer (which would leave the loader up).
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // A flourish is charming once and an obstacle every time after. Someone
    // coming back to check a link should land on the map, not queue for it.
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode — treat every load as the first */
    }

    if (seen) {
      setReturning(true);
      setVisible(false);
      return;
    }

    const t = setTimeout(() => setVisible(false), reduced ? 400 : 2100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="inking"
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6"
          style={{ backgroundColor: "var(--color-paper)" }}
          initial={{ opacity: 1 }}
          // The sheet lifts away rather than dissolving in place.
          exit={{ opacity: 0, scale: reduce || returning ? 1 : 1.04 }}
          transition={{
            duration: returning ? 0.2 : 0.85,
            ease: [0.65, 0, 0.35, 1],
          }}
        >
          <div className="paper-grain opacity-[0.07]" aria-hidden />
          <svg
            width="150"
            height="150"
            viewBox="0 0 200 200"
            aria-hidden
            className="overflow-visible"
          >
            {/* a small landmass inking itself */}
            <path
              d="M40 132 C 52 108, 44 92, 66 82 C 84 74, 88 54, 112 58 C 138 62, 150 82, 160 104 C 168 122, 150 140, 128 146 C 104 152, 70 156, 40 132 Z"
              fill="none"
              stroke="var(--color-teal-ink)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={reduce ? undefined : "ink-draw"}
              style={{ "--len": 560 } as React.CSSProperties}
            />
            {/* dotted route */}
            <path
              d="M52 150 C 90 120, 120 120, 150 92"
              fill="none"
              stroke="var(--color-terracotta)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="1 8"
              className={reduce ? undefined : "ink-draw"}
              style={
                { "--len": 200, animationDelay: "0.5s", animationDuration: "1.4s" } as React.CSSProperties
              }
            />
            {/* an X marks a spot */}
            <g
              stroke="var(--color-ochre)"
              strokeWidth="2.4"
              strokeLinecap="round"
              className={reduce ? undefined : "ink-draw"}
              style={
                { "--len": 40, animationDelay: "1.2s", animationDuration: "0.6s" } as React.CSSProperties
              }
            >
              <line x1="145" y1="87" x2="155" y2="97" />
              <line x1="155" y1="87" x2="145" y2="97" />
            </g>
          </svg>

          <motion.p
            className="hand text-2xl"
            style={{ color: "var(--color-ink-soft)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            inking the map…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
