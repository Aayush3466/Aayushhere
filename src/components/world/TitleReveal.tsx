"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * The name, inked in letter by letter — each glyph rises and settles, like a
 * brush laying down. The accessible name is on the wrapper, so a screen reader
 * reads one word rather than fourteen letters.
 *
 * Two things here were quietly expensive, and both are the same mistake in
 * different clothes: paying forever for something that happens once.
 *
 * 1. Every letter carried `will-change: transform, filter` as a hardcoded style.
 *    `will-change` is a promise to the compositor to keep a layer ready, so the
 *    name was pinning one layer per letter for the entire visit, to serve an
 *    animation that finished three seconds in.
 * 2. It animated `filter: blur()`. Filters are not compositor-accelerated, so
 *    every letter repainted on every frame of its reveal.
 *
 * So: no filter, and once the reveal has finished the motion elements are
 * dropped for plain text. Nothing is retained, because there is nothing left to
 * animate.
 */
export function TitleReveal({
  text,
  className,
  delay = 2.15,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const letters = Array.from(text);
  const [settled, setSettled] = useState(false);

  // Reduced motion, or the reveal already played: plain text, zero machinery.
  if (reduce || settled) {
    return <span className={className}>{text}</span>;
  }

  const last = letters.length - 1;

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden style={{ display: "inline-block" }}>
        {letters.map((ch, i) =>
          ch === " " ? (
            <span key={i} style={{ display: "inline-block", width: "0.26em" }}>
              &nbsp;
            </span>
          ) : (
            <motion.span
              key={i}
              style={{ display: "inline-block" }}
              // opacity / y / rotate only — all of which the compositor can do
              // without repainting the glyph.
              initial={{ opacity: 0, y: "0.55em", rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                duration: 0.72,
                delay: delay + i * 0.044,
                ease: [0.2, 0.75, 0.25, 1],
              }}
              // The last letter to land tells the whole title it can stand down.
              onAnimationComplete={i === last ? () => setSettled(true) : undefined}
            >
              {ch}
            </motion.span>
          ),
        )}
      </span>
    </span>
  );
}
