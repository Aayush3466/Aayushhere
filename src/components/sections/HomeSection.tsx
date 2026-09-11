"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { SECTION_INDEX, type SectionId } from "@/lib/sections";
import { useContent } from "@/lib/store/content-store";
import { useEnvironment } from "@/lib/store/environment";
import { Sky } from "@/components/world/Sky";
import { Stars } from "@/components/world/Stars";
import { DistantRange } from "@/components/world/DistantRange";
import { Clouds } from "@/components/world/Clouds";
import { Birds } from "@/components/world/Birds";
import { Sea } from "@/components/world/Sea";
import { Shore } from "@/components/world/Shore";
import { PaperBoat } from "@/components/world/PaperBoat";
import { Lighthouse } from "@/components/world/Lighthouse";
import { InkAvatar } from "@/components/world/InkAvatar";
import { TitleReveal } from "@/components/world/TitleReveal";
import { WaxSeal, Flourish, RegistrationMarks } from "@/components/ui/Flourish";
import { CompassRose } from "@/components/CompassRose";
import { Magnetic } from "@/components/ui/Magnetic";

const CHIPS: { id: SectionId; label: string }[] = [
  { id: "education", label: "Education" },
  { id: "research", label: "Research" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

function Parallax({ d, children }: { d: number; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `translate3d(calc(var(--mx, 0) * ${d}px), calc(var(--my, 0) * ${(d * 0.66).toFixed(1)}px), 0)`,
        transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}

export function HomeSection({ onGo, active = true }: { onGo: (index: number) => void; active?: boolean }) {
  const reduce = useReducedMotion();
  const { profile } = useContent();
  // `--star-opacity` is 0 by day, so rendering the field then means 24 elements
  // twinkling on a timer to show nothing at all. ChapterBackdrop already gates
  // it this way; Home was rendering its own copy unconditionally.
  const { phase } = useEnvironment();
  const starlit = phase === "dusk" || phase === "night";
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Home stays mounted while you read chapter two, so without this it would
    // keep answering every mouse move on the whole site to parallax a vista
    // that is a screen-width off to the left.
    if (reduce || !active) return;
    const el = rootRef.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const onMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.setProperty("--mx", nx.toFixed(3));
          el.style.setProperty("--my", ny.toFixed(3));
        });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce, active]);

  const wrap: Variants = {
    hidden: {},
    show: {
      transition: { delayChildren: reduce ? 0 : 1.6, staggerChildren: reduce ? 0 : 0.12 },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden">
      {/* the living vista — layers lean with the pointer for depth */}
      <Sky />
      {starlit && <Stars />}
      <Parallax d={6}>
        <DistantRange />
      </Parallax>
      <Parallax d={13}>
        <Clouds />
      </Parallax>
      <Parallax d={17}>
        <Birds />
      </Parallax>
      <Parallax d={9}>
        <Lighthouse />
      </Parallax>
      <Sea />
      <Parallax d={22}>
        <PaperBoat style={{ top: "64vh", left: "62%" }} width={104} />
      </Parallax>
      <Shore />

      {/* readable arrival */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5">
        <motion.div
          className="flex w-full max-w-2xl flex-col items-center text-center"
          variants={wrap}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="w-full">
            <div className="paper-panel cartouche relative overflow-hidden px-8 py-7 sm:px-14 sm:py-9">
              {/* The chart's own compass, printed into the sheet rather than on it. */}
              <div
                className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.05]"
                aria-hidden
              >
                <CompassRose size={360} />
              </div>

              <RegistrationMarks />

              {/* Kathmandu, to the minute — where the voyage begins. */}
              <span className="hand pointer-events-none absolute left-7 top-5 hidden text-[0.78rem] text-ink-faint/75 sm:block">
                27°43′N
              </span>
              <span className="hand pointer-events-none absolute right-7 top-5 hidden text-[0.78rem] text-ink-faint/75 sm:block">
                85°19′E
              </span>

              <div className="pointer-events-none absolute bottom-3 right-3 hidden rotate-[8deg] opacity-95 sm:bottom-4 sm:right-4 sm:block">
                <WaxSeal initials="AA" size={68} />
              </div>
              <div className="relative flex flex-col items-center gap-3">
                <InkAvatar size={104} />
                <p className="map-eyebrow">An illustrated chart of</p>
                <h1 className="text-[clamp(2.4rem,7vw,4.4rem)] leading-[1.02]">
                  <TitleReveal text={profile.name} delay={reduce ? 0 : 2.0} />
                </h1>
                <motion.span
                  className="block h-[3px] rounded-full"
                  style={{ background: "var(--color-ochre)", transformOrigin: "left", width: "min(340px,70%)" }}
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, delay: reduce ? 0 : 2.9, ease: [0.65, 0, 0.35, 1] }}
                />
                <p className="hand text-xl sm:text-2xl" style={{ color: "var(--color-terracotta)" }}>
                  {profile.tagline}
                </p>
                <Flourish accent="var(--color-ochre)" className="mt-1 opacity-70" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="mt-6">
            <p className="hand mb-3 text-xl text-ink-soft">set your heading —</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {CHIPS.map((c) => (
                <Magnetic key={c.id} strength={0.5}>
                  <button
                    type="button"
                    onClick={() => onGo(SECTION_INDEX[c.id])}
                    className="paper-panel card-hover px-4 py-2 font-display text-sm font-semibold text-ink"
                  >
                    {c.label}
                  </button>
                </Magnetic>
              ))}
            </div>
            <p className="mt-5 hidden text-sm text-ink-faint [@media(min-width:640px)_and_(min-height:800px)]:block">
              …or use the arrows up top to sail the whole coast, chapter by chapter.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
