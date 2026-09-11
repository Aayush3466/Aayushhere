"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { animate, motion, useMotionValue } from "framer-motion";
import { SECTIONS, type SectionId } from "@/lib/sections";
import { clamp } from "@/lib/utils";
import { useContent, useSections } from "@/lib/store/content-store";
import { CHAPTER_ATTR, EntryCtx, SCROLLER_ATTR, type EntryEdge } from "./chapter-context";
import { useChapterNav } from "./useChapterNav";
import { ChartMinimap, ChartOverlay } from "@/components/map/ChartPanel";
import { TopNav } from "./TopNav";
import { HomeSection } from "./HomeSection";
import { EducationSection } from "./EducationSection";
import { ResearchSection } from "./ResearchSection";
import { ProjectsSection } from "./ProjectsSection";
import { GallerySection } from "./GallerySection";
import { ExperienceSection } from "./ExperienceSection";
/**
 * The game room carries a typing engine, a word corpus, code snippets and a
 * leaderboard store, none of which the first screen needs — and being a static
 * import put all of it in the initial bundle. Split out, it fetches when the
 * visitor gets within one chapter of it, which is long before they can see it.
 *
 * Deliberately WITHOUT `ssr: false`: the markup still server-renders, so the
 * chapter stays in the HTML for crawlers.
 */
const GamesSection = dynamic(() =>
  import("./GamesSection").then((m) => ({ default: m.GamesSection })),
);
import { ContactSection } from "./ContactSection";

/**
 * THE CHAPTERED VOYAGE
 * --------------------
 * Horizontal = travel between chapters. Vertical = read the chapter you are in,
 * and when it runs out, keep going and the map sails onward by itself.
 *
 * Two things here are load-bearing for how the site FEELS:
 *
 * 1. Only the active chapter and its two neighbours are mounted. Everything on
 *    this map is alive — drifting clouds, twinkling stars, breathing seas — and
 *    a browser cheerfully composites all of that for chapters nobody is looking
 *    at. Rendering eight at once meant paying for ~30 full-screen animated
 *    layers to show one. Neighbours stay mounted so a swipe reveals a chapter
 *    that is already laid out and already scrolled to the right place.
 *
 * 2. The track is driven by a motion value in real pixels rather than an
 *    animated `x` prop, because a finger dragging sideways has to move the sheet
 *    NOW — a page that only responds when you let go feels broken on a phone.
 */
/**
 * Arriving somewhere marks it. Folded into the same update as the index rather
 * than tracked by an effect watching it: an effect would mean a second render
 * every single time you change chapter, to record something already known at the
 * moment the decision was made.
 */
function reached(cur: ReadonlySet<number>, i: number): ReadonlySet<number> {
  if (cur.has(i)) return cur;
  const next = new Set(cur);
  next.add(i);
  return next;
}

export function SectionPager() {
  const content = useContent();
  const sections = useSections();
  const count = SECTIONS.length;

  // Index and arrival edge move together, in ONE piece of state, and every
  // change goes through a functional update.
  //
  // They were two separate `useState`s driven from a mirrored ref, and that had
  // a real hole: two page turns dispatched before React re-rendered would both
  // read the same stale ref and compute the same target, so the second one
  // silently did nothing. A functional updater always sees the last committed
  // value, whether or not a render has happened in between — which matters
  // exactly when the main thread is busy, i.e. on the slow phone where dropping
  // a gesture is least forgivable.
  const [nav, setNav] = useState<{
    index: number;
    from: EntryEdge;
    /** Territories actually arrived at — drives the chart's seals. */
    visited: ReadonlySet<number>;
  }>({ index: 0, from: "top", visited: new Set([0]) });
  const index = nav.index;
  const entryEdge = nav.from;
  const visited = nav.visited;
  // Mirrors what is actually ON SCREEN, for the gesture handlers' boundary
  // checks — which is the right question for them, since the DOM they measure
  // has not changed either until React commits.
  const idxRef = useRef(0);

  const [chartOpen, setChartOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  /** The scrolling column of a given chapter, or null if it has none (Home). */
  const columnOf = useCallback(
    (i: number) =>
      rootRef.current?.querySelector<HTMLDivElement>(
        `[${CHAPTER_ATTR}="${i}"] [${SCROLLER_ATTR}]`,
      ) ?? null,
    [],
  );

  // ---- geometry --------------------------------------------------------
  // One chapter is exactly the pager's own width. Measuring beats `100vw`,
  // which on mobile disagrees with the visual viewport often enough to leave a
  // sliver of the next chapter showing.
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  useEffect(() => {
    const measure = () => {
      const w = rootRef.current?.clientWidth ?? 0;
      widthRef.current = w;
      setWidth(w);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  const x = useMotionValue(0);
  useEffect(() => {
    if (!width) return;
    const controls = animate(x, -index * width, {
      type: "spring",
      stiffness: 230,
      damping: 32,
      mass: 0.85,
    });
    return () => controls.stop();
  }, [index, width, x]);

  // ---- travel ----------------------------------------------------------
  const go = useCallback(
    (i: number, from: EntryEdge = "top") => {
      setNav((cur) => {
        const n = clamp(i, 0, count - 1);
        return n === cur.index ? cur : { index: n, from, visited: reached(cur.visited, n) };
      });
    },
    [count],
  );

  // Mirrored from an effect rather than written during render. Travel itself no
  // longer depends on this being fresh — `pageBy` resolves relatively — so a
  // frame of lag here is harmless, and it is genuinely the value the gesture
  // handlers want: which chapter the visitor can currently see.
  useEffect(() => {
    idxRef.current = index;
  }, [index]);

  /** Relative travel — always resolved against the latest committed chapter. */
  const pageBy = useCallback(
    (dir: 1 | -1) =>
      setNav((cur) => {
        const n = clamp(cur.index + dir, 0, count - 1);
        return n === cur.index
          ? cur
          : {
              index: n,
              from: dir === 1 ? "top" : "bottom",
              visited: reached(cur.visited, n),
            };
      }),
    [count],
  );

  const drag = useCallback(
    (px: number | null) => {
      const base = -idxRef.current * widthRef.current;
      if (px === null) {
        animate(x, base, { type: "spring", stiffness: 260, damping: 34 });
      } else {
        x.set(base + px);
      }
    },
    [x],
  );

  const getScroller = useCallback(() => columnOf(idxRef.current), [columnOf]);

  useChapterNav({
    root: rootRef,
    scroller: getScroller,
    index: useCallback(() => idxRef.current, []),
    count,
    width: useCallback(() => widthRef.current, []),
    page: pageBy,
    drag,
  });

  // ---- reading progress -------------------------------------------------
  // Lives up here rather than inside the shell for two reasons: a `fixed`
  // element inside the translated track resolves against the TRACK, not the
  // viewport (so the old rail was drawn eight screens off to the right), and
  // writing the height straight to the node keeps scrolling out of React
  // entirely — the previous `setProg` re-rendered the whole chapter on every
  // single scroll event.
  useEffect(() => {
    const rail = railRef.current;
    const sc = columnOf(index);
    if (!rail) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const el = columnOf(index);
      if (!el) {
        rail.style.height = "0px";
        return;
      }
      const max = el.scrollHeight - el.clientHeight;
      rail.style.height = max > 8 ? `${(el.scrollTop / max) * 100}vh` : "0px";
    };
    paint();
    if (!sc) return;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      sc.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [index, columnOf]);

  // Paging can strand the keyboard on an element that just became `inert`, at
  // which point the browser drops focus to <body> and the next Tab starts from
  // the top of the document. Move it onto the chapter that just arrived — but
  // only if focus was already inside the map, so arriving visitors and people
  // typing in the chat are left alone. `preventScroll` matters: focusing inside
  // a scroll column would otherwise scroll it, undoing the arrival position.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const root = rootRef.current;
    const active = document.activeElement;
    if (!root || (active && active !== document.body && !root.contains(active))) return;
    root
      .querySelector<HTMLElement>(`[${CHAPTER_ATTR}="${index}"]`)
      ?.focus({ preventScroll: true });
  }, [index]);

  // `M` for the chart. Guarded against text fields and shielded subtrees for the
  // same reason the pager's own keys are: nobody typing an email wants the map
  // to open on them.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "m" && e.key !== "M") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (el?.closest?.("input, textarea, select, [contenteditable='true'], [data-nav-ignore]"))
        return;
      e.preventDefault();
      setChartOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const accent = sections[index]?.accent ?? "#43506b";

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 overflow-clip"
      style={{ background: "var(--color-paper)", touchAction: "pan-y" }}
    >
      <TopNav
        index={index}
        onGo={go}
        name={content.profile.name}
        onOpenChart={() => setChartOpen(true)}
      />
      <EdgeNav index={index} onGo={go} />

      <EntryCtx.Provider value={entryEdge}>
      <motion.div className="flex h-full" style={{ width: `${count * 100}%`, x }}>
        {SECTIONS.map((s, i) => {
          // Mount the chapter you're in and the ones on either side of it.
          const near = Math.abs(i - index) <= 1;
          return (
            <div
              key={s.id}
              {...{ [CHAPTER_ATTR]: i }}
              // Focusable only as a landing spot for the keyboard after a page
              // turn; -1 keeps it out of the Tab order itself.
              tabIndex={-1}
              className={i === index ? "h-full shrink-0" : "chapter-idle h-full shrink-0"}
              style={{ width: `${100 / count}%`, outline: "none" }}
              aria-hidden={i !== index}
              // A chapter you cannot see must not be reachable by Tab either.
              inert={i !== index}
            >
              {near && renderSection(s.id, i === index, go)}
            </div>
          );
        })}
      </motion.div>
      </EntryCtx.Provider>

      {/* how far through this chapter you are */}
      <div
        ref={railRef}
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 z-40 w-[3px]"
        style={{ height: 0, background: `linear-gradient(180deg, ${accent}, transparent)` }}
      />

      <ChartMinimap
        index={index}
        visited={visited}
        sections={sections}
        onOpen={() => setChartOpen(true)}
      />
      <ChartOverlay
        open={chartOpen}
        onClose={() => setChartOpen(false)}
        index={index}
        visited={visited}
        sections={sections}
        onPick={(i) => go(i)}
      />

      <ScrollHint show={index === 0} />

      {/* One blemish on the sheet, always in the same place. */}
      <div
        aria-hidden
        className="coffee-ring pointer-events-none absolute bottom-[27%] right-[9%] z-20 hidden lg:block"
      />

      {/* cinematic framing vignette over the whole voyage */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            "radial-gradient(135% 105% at 50% 32%, transparent 60%, color-mix(in oklab, var(--color-paper-deep) 42%, transparent))",
        }}
      />
    </div>
  );
}

/** A soft, blinking cue naming the gesture the visitor actually has. */
function ScrollHint({ show }: { show: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-5 left-1/2 z-40 -translate-x-1/2"
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-1.5"
        style={{
          background: "color-mix(in oklab, var(--color-paper-panel) 92%, transparent)",
          border: "1px solid var(--color-paper-edge)",
        }}
        // Gated on `show`. The outer wrapper fades to opacity 0 on every chapter
        // but the first, and these two loops used to keep running underneath it
        // forever — animating something nobody can see, on every page.
        animate={show ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
        transition={
          show
            ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      >
        {/* Scrolling onward is now the primary gesture on every device, so name
            that first; the sideways swipe is the shortcut, not the requirement. */}
        <span className="hand whitespace-nowrap text-base text-ink-soft sm:text-lg">
          <span className="sm:hidden">scroll on — or swipe</span>
          <span className="hidden sm:inline">keep scrolling to sail onward</span>
        </span>
        <motion.span
          aria-hidden
          className="text-lg"
          style={{ color: "var(--color-terracotta)" }}
          animate={show ? { x: [0, 5, 0] } : { x: 0 }}
          transition={
            show
              ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0 }
          }
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
    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-40 hidden items-center justify-between px-3 xl:flex">
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
      className="pop pointer-events-auto flex items-center gap-1.5 rounded-[var(--radius-pill)] px-4 py-3 shadow-[0_10px_30px_-16px_rgba(58,46,26,0.6)]"
      style={{
        background: "color-mix(in oklab, var(--color-paper-panel) 94%, transparent)",
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
      return <HomeSection onGo={go} active={active} />;
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
