"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Flourish } from "@/components/ui/Flourish";

/**
 * A chapter shell: the vertical-scroll container for one section. Its themed
 * background stays pinned (sticky) while the details scroll over it, and the
 * column grows downward as content is added — so future records just extend the
 * page. Entering a chapter resets it to the top for a clean arrival.
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
  const [prog, setProg] = useState(0);

  useEffect(() => {
    if (active && ref.current) ref.current.scrollTop = 0;
  }, [active]);

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
      onScroll={(e) => {
        const el = e.currentTarget;
        const max = el.scrollHeight - el.clientHeight;
        setProg(max > 8 ? el.scrollTop / max : 0);
      }}
      className="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain"
    >
      {active && (
        <div
          aria-hidden
          className="fixed right-0 top-0 z-40 w-[3px]"
          style={{ height: `${prog * 100}vh`, background: `linear-gradient(180deg, ${accent}, transparent)` }}
        />
      )}
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
