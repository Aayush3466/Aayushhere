"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Flourish } from "@/components/ui/Flourish";
import { SCROLLER_ATTR, useEntryEdge } from "./chapter-context";

/**
 * A chapter shell: the vertical-scroll column for one section. Its themed
 * background stays pinned (sticky) while the details scroll over it, and the
 * column grows downward as content is added — so future records just extend the
 * page.
 *
 * The column reports itself to the pager, which is what lets "keep scrolling
 * past the end and the map sails onward" work. Note there is no scroll state in
 * React here at all: the reading-progress rail is painted by the pager straight
 * to the DOM. It used to be a `setState` in `onScroll`, which re-rendered every
 * card in the chapter on every scroll event — the single easiest thing on the
 * page to mistake for "the site is heavy".
 */
export function SectionShell({
  active,
  accent,
  eyebrow,
  title,
  subtitle,
  background,
  children,
}: {
  active: boolean;
  accent: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  background?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const entryEdge = useEntryEdge();

  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    // Sailing forward drops you at the top of the new chapter; sailing back
    // returns you to the foot of the one you were reading, which is where you
    // actually left off.
    el.scrollTop = entryEdge === "bottom" ? el.scrollHeight : 0;
  }, [active, entryEdge]);

  const box: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
  };
  const rise: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div
      ref={ref}
      {...{ [SCROLLER_ATTR]: "" }}
      className="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain"
      // The browser keeps vertical scrolling (native, threaded, smooth) and the
      // pager gets sideways gestures as cancelable events. This one line is why
      // swiping between chapters works on a phone at all.
      style={{ touchAction: "pan-y" }}
    >
      <div className="pointer-events-none sticky top-0 -mb-[100dvh] h-[100dvh] overflow-hidden">
        {background}
      </div>
      <div className="relative z-10 mx-auto min-h-[100dvh] w-full max-w-5xl px-5 pb-28 pt-[92px] sm:px-8">
        <motion.header
          className="mb-12 text-center sm:mb-16"
          variants={box}
          initial="hidden"
          animate={active ? "show" : "hidden"}
        >
          <motion.div variants={rise} className="flex items-center justify-center gap-3">
            <span
              className="h-px w-8 sm:w-14"
              style={{ background: `linear-gradient(90deg, transparent, color-mix(in oklab, ${accent} 60%, transparent))` }}
            />
            <p className="map-eyebrow" style={{ color: accent }}>
              {eyebrow}
            </p>
            <span
              className="h-px w-8 sm:w-14"
              style={{ background: `linear-gradient(90deg, color-mix(in oklab, ${accent} 60%, transparent), transparent)` }}
            />
          </motion.div>
          <motion.h2
            variants={rise}
            className="mt-3 text-[clamp(2.4rem,6vw,3.9rem)]"
            style={{ color: accent }}
          >
            {title}
          </motion.h2>
          {/* A nib rule that draws itself under the title on arrival.
              The GLYPHS are deliberately not stroke-drawn: doing that means
              rendering the heading as SVG text with a stroke, which costs the
              crispness of real type, the ability to select it, and correct
              wrapping. Inking a rule beneath it buys the same gesture for none
              of that. */}
          <motion.svg
            key={`rule-${active}`}
            viewBox="0 0 300 10"
            className="mx-auto mt-1 h-2.5 w-[min(300px,72%)] overflow-visible"
            fill="none"
            aria-hidden
          >
            <motion.path
              d="M2 6 C 60 2, 110 8, 150 5 C 195 2, 245 8, 298 4"
              stroke={accent}
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.7"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: active ? 1 : 0 }}
              transition={{
                duration: reduce ? 0 : 1.05,
                delay: reduce ? 0 : 0.45,
                ease: [0.65, 0, 0.35, 1],
              }}
            />
          </motion.svg>
          {subtitle && (
            <motion.p variants={rise} className="hand mt-2 text-xl text-ink-soft sm:text-2xl">
              {subtitle}
            </motion.p>
          )}
          <motion.div variants={rise}>
            <Flourish accent={accent} className="mx-auto mt-5 opacity-80" />
          </motion.div>
        </motion.header>
        {children}
      </div>
    </div>
  );
}
