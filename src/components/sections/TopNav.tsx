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
 */
export function TopNav({
  index,
  onGo,
  name,
  onOpenChart,
}: {
  index: number;
  onGo: (i: number) => void;
  name: string;
  onOpenChart: () => void;
}) {
  const sections = useSections();
  const count = sections.length;
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
          background: "color-mix(in oklab, var(--color-paper-panel) 95%, transparent)",
          border: "1px solid color-mix(in oklab, var(--color-paper-edge) 92%, transparent)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.6) inset, 0 16px 44px -24px rgba(58,46,26,0.55)",
        }}
      >
        <button
          type="button"
          onClick={() => onGo(0)}
          className="flex shrink-0 items-center gap-2"
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
          {sections.map((s, i) => (
            <button
              key={s.id}
              ref={i === index ? activeRef : undefined}
              type="button"
              onClick={() => onGo(i)}
              className={cn(
                "relative shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 sm:px-3",
                i === index ? "" : "text-ink-faint hover:text-ink-soft",
              )}
              style={i === index ? { color: s.accent } : undefined}
            >
              <span className="font-display">{s.nav}</span>
              {i === index && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-2 -bottom-0.5 h-[2.5px] rounded-full"
                  style={{ background: s.accent }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <Clocks />
          {/* The way in to the chart on a phone, where the minimap is hidden. */}
          <button
            type="button"
            onClick={onOpenChart}
            aria-label="Open the chart"
            title="The chart (M)"
            className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper-panel)] text-ink-soft transition-all hover:-translate-y-0.5 hover:text-ink"
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
      className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper-panel)] text-ink transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {dir === "next" ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
      </svg>
    </button>
  );
}
