"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SECTIONS, type SectionId } from "@/lib/sections";
import { clamp } from "@/lib/utils";
import { useContent, useSections } from "@/lib/store/content-store";
import { TopNav } from "./TopNav";
import { HomeSection } from "./HomeSection";
import { EducationSection } from "./EducationSection";
import { ResearchSection } from "./ResearchSection";
import { ProjectsSection } from "./ProjectsSection";
import { GallerySection } from "./GallerySection";
import { ExperienceSection } from "./ExperienceSection";
import { GamesSection } from "./GamesSection";
import { ContactSection } from "./ContactSection";

/**
 * THE CHAPTERED VOYAGE
 * Horizontal = travel between chapters (edge arrows, top nav, ← → keys, or a
 * horizontal trackpad swipe). Vertical = explore within the current chapter.
 */
export function SectionPager() {
  const content = useContent();
  const count = SECTIONS.length;
  const [index, setIndex] = useState(0);
  const idxRef = useRef(0);

  const go = useCallback(
    (i: number) => {
      const n = clamp(i, 0, count - 1);
      if (n === idxRef.current) return;
      idxRef.current = n;
      setIndex(n);
    },
    [count],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))
        return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(idxRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(idxRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const rootRef = useRef<HTMLDivElement>(null);
  const coolRef = useRef(0);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Only a deliberate, strongly-horizontal swipe pages chapters — casual or
      // diagonal scrolls are ignored so you never jump chapters by accident.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 2.2 && Math.abs(e.deltaX) > 55) {
        e.preventDefault();
        const now = Date.now();
        if (now - coolRef.current < 900) return;
        coolRef.current = now;
        go(idxRef.current + (e.deltaX > 0 ? 1 : -1));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 overflow-clip"
      style={{ background: "var(--color-paper)" }}
    >
      <TopNav index={index} onGo={go} name={content.profile.name} />
      <EdgeNav index={index} onGo={go} />
      <motion.div
        className="flex h-full"
        style={{ width: `${count * 100}vw` }}
        animate={{ x: `${-index * 100}vw` }}
        transition={{ type: "tween", duration: 0.62, ease: [0.4, 0, 0.2, 1] }}
      >
        {SECTIONS.map((s, i) => (
          <div key={s.id} className="h-full w-screen shrink-0">
            {renderSection(s.id, i === index, go)}
          </div>
        ))}
      </motion.div>
      <ScrollHint show={index === 0} />
      {/* cinematic framing vignette over the whole voyage */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background:
            "radial-gradient(135% 105% at 50% 32%, transparent 60%, color-mix(in oklab, var(--color-paper-deep) 42%, transparent))",
        }}
      />
    </div>
  );
}

/** A soft, blinking cue that the world scrolls sideways to the next chapter. */
function ScrollHint({ show }: { show: boolean }) {
  return (
    <motion.div
      className="pointer-events-none fixed bottom-5 left-1/2 z-40 -translate-x-1/2"
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-1.5"
        style={{
          background: "color-mix(in oklab, var(--color-paper-panel) 78%, transparent)",
          backdropFilter: "blur(6px)",
          border: "1px solid var(--color-paper-edge)",
        }}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Name the gesture the visitor actually has: you swipe a phone, you
            side-scroll a trackpad. Kept to one line so the cue never wraps. */}
        <span className="hand whitespace-nowrap text-base text-ink-soft sm:text-lg">
          <span className="sm:hidden">swipe to sail onward</span>
          <span className="hidden sm:inline">side-scroll to sail onward</span>
        </span>
        <motion.span
          aria-hidden
          className="text-lg"
          style={{ color: "var(--color-terracotta)" }}
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          →
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function EdgeNav({ index, onGo }: { index: number; onGo: (i: number) => void }) {
  const sections = useSections();
  const prev = index > 0 ? sections[index - 1] : null;
  const next = index < sections.length - 1 ? sections[index + 1] : null;
  return (
    <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-40 hidden items-center justify-between px-3 xl:flex">
      <span>
        {prev && (
          <EdgeBtn dir="prev" label={prev.nav} accent={prev.accent} onClick={() => onGo(index - 1)} />
        )}
      </span>
      <span>
        {next && (
          <EdgeBtn
            dir="next"
            label={next.nav}
            accent={next.accent}
            pulse={index === 0}
            onClick={() => onGo(index + 1)}
          />
        )}
      </span>
    </div>
  );
}

function EdgeBtn({
  dir,
  label,
  accent,
  onClick,
  pulse,
}: {
  dir: "prev" | "next";
  label: string;
  accent: string;
  onClick: () => void;
  pulse?: boolean;
}) {
  const chevron = dir === "next" ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={pulse ? { x: dir === "next" ? [0, 7, 0] : [0, -7, 0] } : undefined}
      transition={pulse ? { duration: 1.7, repeat: Infinity, ease: "easeInOut" } : undefined}
      className="pointer-events-auto flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-2.5 shadow-[0_10px_30px_-16px_rgba(58,46,26,0.6)] transition-transform hover:scale-[1.05]"
      style={{
        background: "color-mix(in oklab, var(--color-paper-panel) 82%, transparent)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--color-paper-edge)",
        color: accent,
      }}
      aria-label={dir === "next" ? `Next: ${label}` : `Back: ${label}`}
    >
      {dir === "prev" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{chevron}</svg>
      )}
      <span className="hand text-lg leading-none">{label}</span>
      {dir === "next" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{chevron}</svg>
      )}
    </motion.button>
  );
}

function renderSection(id: SectionId, active: boolean, go: (i: number) => void) {
  switch (id) {
    case "home":
      return <HomeSection onGo={go} />;
    case "education":
      return <EducationSection active={active} />;
    case "research":
      return <ResearchSection active={active} />;
    case "projects":
      return <ProjectsSection active={active} />;
    case "gallery":
      return <GallerySection active={active} />;
    case "experience":
      return <ExperienceSection active={active} />;
    case "games":
      return <GamesSection active={active} />;
    case "contact":
      return <ContactSection active={active} />;
    default:
      return null;
  }
}
