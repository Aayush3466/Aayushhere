"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The name, inked in letter by letter — each glyph rises out of a soft blur and
 * settles, like a brush laying down. Accessible name is preserved via aria-label.
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
              style={{ display: "inline-block", willChange: "transform, filter" }}
              initial={
                reduce
                  ? false
                  : { opacity: 0, y: "0.55em", filter: "blur(7px)", rotate: -5 }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotate: 0 }}
              transition={{
                duration: 0.72,
                delay: reduce ? 0 : delay + i * 0.044,
                ease: [0.2, 0.75, 0.25, 1],
              }}
            >
              {ch}
            </motion.span>
          ),
        )}
      </span>
    </span>
  );
}
