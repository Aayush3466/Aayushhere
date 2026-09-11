"use client";

import type { Enrichable, Metric, Milestone } from "@/lib/types";

/**
 * HOW BULLETS, METRICS AND TIMELINES LOOK
 * ---------------------------------------
 * Written once and used by every chapter, because the alternative is four
 * subtly different bullet styles that make one page feel like four sites.
 *
 * The card/sheet split follows the same rule as the teaser: a card shows enough
 * to decide with, the sheet shows everything. So the card gets the first few
 * bullets and the metrics row — metrics are short, high-signal, and the single
 * best reason to keep reading — and the full list plus the timeline live behind
 * the click.
 */

/** How many bullets a card shows before deferring the rest to the sheet. */
const CARD_BULLETS = 3;

export function Highlights({
  items,
  accent,
  limit,
}: {
  items?: string[];
  accent: string;
  /** Omit to show them all (the sheet); pass a number to cap them (a card). */
  limit?: number;
}) {
  const all = (items ?? []).filter((s) => s.trim());
  if (all.length === 0) return null;
  const shown = limit ? all.slice(0, limit) : all;
  const hidden = all.length - shown.length;

  return (
    <ul className="mt-3 space-y-1.5">
      {shown.map((h, i) => (
        <li key={i} className="flex gap-2.5 text-[0.95rem] leading-relaxed text-ink-soft">
          {/* A drawn nib-mark rather than a disc — a round bullet is the one
              element that would look typeset on a hand-inked chart. */}
          <span
            aria-hidden
            className="mt-[0.62em] h-[5px] w-[5px] shrink-0 rotate-45 rounded-[1px]"
            style={{ background: accent, opacity: 0.75 }}
          />
          <span className="min-w-0">{h}</span>
        </li>
      ))}
      {hidden > 0 && (
        <li className="hand pl-[15px] text-base text-ink-faint">
          + {hidden} more {hidden === 1 ? "point" : "points"}
        </li>
      )}
    </ul>
  );
}

export function Metrics({ items, accent }: { items?: Metric[]; accent: string }) {
  const all = (items ?? []).filter((m) => m.label || m.value);
  if (all.length === 0) return null;
  return (
    <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
      {all.map((m, i) => (
        <div key={i}>
          <dd className="num font-display text-xl font-semibold leading-none" style={{ color: accent }}>
            {m.value}
          </dd>
          <dt className="hand mt-1 text-base leading-none text-ink-faint">{m.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function Timeline({ items, accent }: { items?: Milestone[]; accent: string }) {
  const all = (items ?? []).filter((m) => m.label || m.date);
  if (all.length === 0) return null;
  return (
    <ol className="relative mt-5 space-y-4 pl-5">
      <span
        aria-hidden
        className="absolute bottom-1.5 left-[3px] top-1.5 w-px border-l border-dotted"
        style={{ borderColor: `color-mix(in oklab, ${accent} 60%, transparent)` }}
      />
      {all.map((m, i) => (
        <li key={i} className="relative">
          <span
            aria-hidden
            className="absolute -left-5 top-[0.42em] h-[7px] w-[7px] rounded-full"
            style={{ background: accent, opacity: 0.85 }}
          />
          {m.date && <p className="hand text-base leading-none text-ink-faint">{m.date}</p>}
          <p className="mt-0.5 font-display text-[0.98rem] font-semibold text-ink">{m.label}</p>
          {m.note && <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{m.note}</p>}
        </li>
      ))}
    </ol>
  );
}

/**
 * Everything a record carries beyond its prose, laid out for the detail sheet.
 * Sections pass this straight to `Disclosure`'s `detail` slot.
 */
export function FullDetail({
  record,
  accent,
  children,
}: {
  record: Enrichable;
  accent: string;
  /** Anything section-specific — links, tech chips — appended at the foot. */
  children?: React.ReactNode;
}) {
  return (
    <>
      <Metrics items={record.metrics} accent={accent} />
      <Highlights items={record.highlights} accent={accent} />
      <Timeline items={record.milestones} accent={accent} />
      {children}
    </>
  );
}

/**
 * Is there anything on this record the card does not already show?
 *
 * Sections pass this to `Disclosure` so a record with a one-line summary but a
 * page of bullets still opens. Metrics are excluded deliberately: the card shows
 * every metric already, so they are never a reason on their own to open a sheet.
 */
export function hasHiddenDetail(record: Enrichable): boolean {
  return (
    (record.highlights?.filter((h) => h.trim()).length ?? 0) > CARD_BULLETS ||
    (record.milestones?.filter((m) => m.label || m.date).length ?? 0) > 0
  );
}

export { CARD_BULLETS };
