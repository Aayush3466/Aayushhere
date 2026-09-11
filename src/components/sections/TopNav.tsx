"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CompassRose } from "@/components/CompassRose";
import { useEnvironment } from "@/lib/store/environment";
import { useSections } from "@/lib/store/content-store";

/**
 * The voyage-nav: the name stays fixed on every chapter, live clocks show the
 * visitor's time and Aayush's Kathmandu time, chapters jump anywhere, and the
 * arrows sail between them. The active chapter carries a sliding ink underline.
 *
 * THE NAV IS ALSO THE CHART'S MINIMAP.
 *
 * There used to be a floating minimap pinned to the bottom-left corner, and it
 * collided with the content — unavoidably, because any fixed widget sitting over
 * a scrolling column will eventually be on top of something someone is reading.
 * On a portfolio that is the worst possible bug.
 *
 * Shrinking it would only have made the collision smaller. The real fix is that
 * chrome belongs with chrome: the route runs along the nav strip, inked where
 * you have been and dotted where you have not, with a wax seal under every
 * chapter you actually stopped at. Same two states as the full chart, so they
 * can never disagree — and it costs zero content space at any width, works
 * identically on a phone, and reads better besides, because the chapter names
 * ARE the places on the route.
 */
export function TopNav({
  index,
  onGo,
  name,
  visited,
  onOpenChart,
}: {
  index: number;
  onGo: (i: number) => void;
  name: string;
  /** Chapters actually reached — the nav draws the route and seals from this. */
  visited: ReadonlySet<number>;
  onOpenChart: () => void;
}) {
  const sections = useSections();
  const count = sections.length;
  const furthest = visited.size ? Math.max(...visited) : 0;
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Scroll ONLY the nav strip — never use scrollIntoView here, as it also
    // scrolls the overflow-hidden pager container and shoves the whole world.
    const nav = navRef.current;
    const btn = activeRef.current;
    if (!nav || !btn) return;
    const nb = nav.getBoundingClientRect();
    const bb = btn.getBoundingClientRect();
    const pad = 14;
    if (bb.left < nb.left + pad) {
      nav.scrollBy({ left: bb.left - nb.left - pad, behavior: "smooth" });
    } else if (bb.right > nb.right - pad) {
      nav.scrollBy({ left: bb.right - nb.right + pad, behavior: "smooth" });
    }
  }, [index]);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className="pointer-events-auto mx-auto flex max-w-6xl items-center gap-3 rounded-2xl px-3 py-2 sm:px-4"
        style={{
          // No backdrop-filter. It sat over the one part of the page that is
          // always in motion, so the blur was recomputed every single frame for
          // the whole strip — the largest fixed cost on the site, and worst
          // exactly where it hurts most (phones). A near-opaque paper strip
          // reads the same against this palette and costs nothing.
          // Fully opaque. It is a fixed chrome bar and content scrolls beneath
          // it; once the backdrop blur was removed, any transparency just let
          // headings read through the strip as they passed under.
          background: "var(--color-paper-panel)",
          border: "1px solid color-mix(in oklab, var(--color-paper-edge) 92%, transparent)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.6) inset, 0 16px 44px -24px rgba(58,46,26,0.55)",
        }}
      >
        <button
          type="button"
          onClick={() => onGo(0)}
          className="pop flex shrink-0 items-center gap-2"
          aria-label="Home"
        >
          {/* -18deg at the first chapter through +18deg at the last: the needle
              swings east across the voyage. */}
          <CompassRose
            size={30}
            heading={count > 1 ? -18 + (index / (count - 1)) * 36 : 0}
          />
          {/* On a phone the name was eating a third of the bar and squeezing the
              chapter strip down to one and a half clipped labels. The rose is
              the home button; the name is on the chart itself. */}
          <span className="hidden font-display text-sm font-semibold text-ink sm:block">
            {name}
          </span>
        </button>

        {/* chapters — scrollable on small screens */}
        <nav
          ref={navRef}
          className="flex flex-1 items-center gap-0.5 overflow-x-auto px-1 pl-2 [scrollbar-width:none] sm:gap-1 sm:pl-3"
        >
          {sections.map((s, i) => {
            const seen = visited.has(i);
            const sailed = i <= furthest;
            return (
              <button
                key={s.id}
                ref={i === index ? activeRef : undefined}
                type="button"
                onClick={() => onGo(i)}
                className={cn(
                  "pop relative shrink-0 rounded-md px-3 pb-3 pt-1.5 text-sm font-semibold sm:px-3.5 sm:pb-3.5 sm:pt-2",
                  i === index ? "" : "text-ink-faint hover:text-ink-soft",
                )}
                style={i === index ? { color: s.accent } : undefined}
              >
                <span className="font-display">{s.nav}</span>

                {/* THE ROUTE, drawn along the nav itself.
                    Inked where you have been, dotted where you have not —
                    exactly the two states the full chart uses, so the strip and
                    the chart never tell different stories. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-[9px] h-[1.5px] rounded-full"
                  style={
                    sailed
                      ? { background: "var(--color-terracotta)", opacity: 0.8 }
                      : {
                          color: "var(--color-ink-faint)",
                          backgroundImage:
                            "repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 6px)",
                          opacity: 0.5,
                        }
                  }
                />

                {/* a seal where you actually stopped */}
                {seen && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-[6.5px] left-1/2 h-[6px] w-[6px] -translate-x-1/2 rotate-45 rounded-[1px]"
                    style={{
                      background: s.accent,
                      // A ring in the paper colour so the seal punches cleanly
                      // through the route line rather than sitting on top of it.
                      boxShadow: "0 0 0 2px var(--color-paper-panel)",
                    }}
                  />
                )}

                {i === index && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 bottom-0 h-[2.5px] rounded-full"
                    style={{ background: s.accent }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <Clocks />
          {/* The way in to the chart on a phone, where the minimap is hidden. */}
          <button
            type="button"
            onClick={onOpenChart}
            aria-label="Open the chart"
            title="The chart (M)"
            className="pop grid h-10 w-10 place-items-center rounded-full border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper-panel)] text-ink-soft hover:text-ink"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
              <path d="M9 4v13.5M15 6.5V20" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5">
            <ArrowBtn dir="prev" disabled={index === 0} onClick={() => onGo(index - 1)} />
            <ArrowBtn dir="next" disabled={index === count - 1} onClick={() => onGo(index + 1)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Clocks() {
  const { localTime, kathmanduTime, phase } = useEnvironment();
  if (!localTime) return null;
  const glyph = phase === "night" ? "🌙" : phase === "dusk" ? "🌆" : phase === "dawn" ? "🌅" : "☀️";
  return (
    <div className="hidden items-center gap-2 text-xs text-ink-soft lg:flex">
      <span className="whitespace-nowrap">
        <span className="text-ink-faint">Kathmandu</span> <b className="font-display">{kathmanduTime}</b>
      </span>
      <span className="text-ink-faint">·</span>
      <span className="whitespace-nowrap">
        <span aria-hidden>{glyph}</span> <span className="text-ink-faint">You</span>{" "}
        <b className="font-display">{localTime}</b>
      </span>
    </div>
  );
}

function ArrowBtn({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "next" ? "Next chapter" : "Previous chapter"}
      className="pop grid h-10 w-10 place-items-center rounded-full border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper-panel)] text-ink disabled:cursor-not-allowed disabled:opacity-35"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {dir === "next" ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
      </svg>
    </button>
  );
}
