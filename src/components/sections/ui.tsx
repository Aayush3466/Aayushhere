"use client";

import type { ReactNode } from "react";
import type { LinkRef } from "@/lib/types";
import { Tilt } from "@/components/ui/Tilt";
import { cn } from "@/lib/utils";

/**
 * A clean paper reading plate — the readability law, everywhere content lives.
 *
 * Every card on the site is one of these, so the plate is where craft pays
 * compound interest: the lean-toward-the-cursor and the travelling highlight are
 * added once here and appear in all eight chapters.
 */
export function Plate({
  children,
  className,
  accent,
  /** Turn the lean off for plates that are already in motion (map labels). */
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
  tilt?: boolean;
}) {
  const style = accent ? { borderTopColor: accent, borderTopWidth: 3 } : undefined;
  const classes = cn("paper-panel p-6 sm:p-8", className);

  if (!tilt) {
    return (
      <div className={classes} style={style}>
        {children}
      </div>
    );
  }

  return (
    <Tilt className={classes} style={style}>
      {children}
    </Tilt>
  );
}

export function TechChips({ items, accent }: { items: string[]; accent: string }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className="rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium transition-colors"
          style={{
            color: accent,
            backgroundColor: `color-mix(in oklab, ${accent} 12%, var(--color-paper-panel))`,
            border: `1px solid color-mix(in oklab, ${accent} 30%, transparent)`,
          }}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

export function LinkList({ links, accent }: { links: LinkRef[]; accent: string }) {
  const shown = (links ?? []).filter((l) => l.url);
  if (!shown.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
      {shown.map((l) => (
        <a
          key={l.url + l.label}
          href={l.url}
          target="_blank"
          rel="noreferrer"
          className="ink-link group inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: accent }}
        >
          {l.label}
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}

/** A soft status/label pill. */
export function Pill({ children, accent }: { children: ReactNode; accent: string }) {
  return (
    <span
      className="num inline-block rounded-[var(--radius-pill)] px-3 py-0.5 text-xs font-semibold"
      style={{
        color: accent,
        backgroundColor: `color-mix(in oklab, ${accent} 14%, var(--color-paper-panel))`,
        border: `1px solid color-mix(in oklab, ${accent} 32%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}
