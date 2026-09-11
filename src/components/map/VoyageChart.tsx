"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionDef } from "@/lib/sections";
import {
  BAY_D,
  CHART_H,
  CHART_PLACES,
  CHART_W,
  COASTLINE_D,
  RIDGES,
  ROUTE_D,
  type Glyph,
} from "@/lib/map/chart";
import { cn } from "@/lib/utils";

/**
 * THE CHART
 * =========
 * The whole voyage, drawn. Eight territories on one coastline, the route inking
 * itself behind you as you travel, a seal stamped at every place you have
 * visited, and the ship sitting wherever you are now.
 *
 * This is the payoff for every other design decision on the site: until now the
 * map was a STYLE — everything looked like a chart without there being one.
 *
 * One component serves both the corner minimap and the full-screen view, because
 * they must never disagree about the geography. `compact` drops the labels and
 * the flourishes that only read at size, and turns off interaction.
 *
 * Performance notes, since this site earned them the hard way:
 *   · nothing here animates on a loop. The route, the ship and the seals move on
 *     CSS transitions triggered by a chapter change, and rest between them.
 *   · the arc-length lookup runs ONCE per mount, by sampling the rendered path.
 *     Measuring per frame is what makes SVG maps expensive.
 */
export function VoyageChart({
  index,
  visited,
  sections,
  onPick,
  compact = false,
  className,
}: {
  index: number;
  /** Indices the visitor has already arrived at. */
  visited: ReadonlySet<number>;
  /** Live chapter copy, so a rename in the Studio relabels the chart. */
  sections: SectionDef[];
  onPick?: (index: number) => void;
  compact?: boolean;
  className?: string;
}) {
  const routeRef = useRef<SVGPathElement>(null);
  /** Arc length at each place, and the route's total — measured once. */
  const [metrics, setMetrics] = useState<{ total: number; at: number[] } | null>(null);

  useEffect(() => {
    const path = routeRef.current;
    if (!path) return;

    const total = path.getTotalLength();
    if (!total) return;

    // Walk the path once at a coarse resolution and remember which length each
    // place sits nearest to. 300 samples over ~1500 units is well under a pixel
    // of error at chart scale, and it costs one pass on mount rather than a
    // measurement every time the chapter changes.
    const SAMPLES = 300;
    const best = CHART_PLACES.map(() => ({ d2: Infinity, len: 0 }));
    for (let s = 0; s <= SAMPLES; s++) {
      const len = (total * s) / SAMPLES;
      const pt = path.getPointAtLength(len);
      CHART_PLACES.forEach((place, i) => {
        const dx = pt.x - place.x;
        const dy = pt.y - place.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < best[i].d2) best[i] = { d2, len };
      });
    }
    setMetrics({ total, at: best.map((b) => b.len) });
  }, []);

  /**
   * How much of the coast has been inked.
   *
   * Measured to the FURTHEST place reached, not to the current one — sailing
   * back to re-read a chapter should not un-draw the map behind you. So the
   * route says "this much coast is surveyed", the seals say "I stopped here",
   * and the ship says "I am here now". Three different facts, which is exactly
   * the distinction a real chart makes.
   */
  const furthest = visited.size ? Math.max(...visited) : 0;
  const sailed = metrics ? (metrics.at[Math.max(furthest, index)] ?? 0) : 0;
  const atShip = metrics ? (metrics.at[index] ?? 0) : 0;

  /**
   * Where the boat sits. On the ROUTE, a little short of the marker rather than
   * on top of it — the place already has a landmark and a seal, and stacking a
   * third thing on the same point turns the most important pixel on the chart
   * into a smudge. At the very start there is nothing behind it, so it sits just
   * off the harbour instead, which reads as about to depart.
   */
  const [ship, setShip] = useState<{ x: number; y: number }>(CHART_PLACES[0]);
  useEffect(() => {
    const path = routeRef.current;
    if (!path || !metrics) return;
    const OFF = 36;
    const at = index === 0 ? Math.min(metrics.total, atShip + OFF) : Math.max(0, atShip - OFF);
    const pt = path.getPointAtLength(at);
    setShip({ x: pt.x, y: pt.y });
  }, [index, metrics, atShip]);

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className={cn("block h-auto w-full", className)}
      role={compact ? "img" : "group"}
      aria-label={compact ? "Chart of the voyage" : undefined}
    >
      {/* ---- the sheet ---- */}
      <rect
        x="0"
        y="0"
        width={CHART_W}
        height={CHART_H}
        fill="var(--color-paper-panel)"
      />

      {/* ---- sea, land, coastline ----
          The first pass had the land at 85% paper-deep over a 50% sea wash, and
          the two were so close that the coastline read as a crease in the sheet
          rather than as a shore. Water is water and land is land now. */}
      <rect x="0" y="0" width={CHART_W} height={CHART_H} fill="var(--color-sea-2)" opacity="0.62" />
      <path d={COASTLINE_D} fill="var(--color-paper-deep)" />
      <path
        d={COASTLINE_D}
        fill="color-mix(in oklab, var(--color-ochre) 14%, transparent)"
      />
      <path d={BAY_D} fill="var(--color-sea-3)" opacity="0.5" />
      <path
        d={COASTLINE_D}
        fill="none"
        stroke="var(--color-ink-soft)"
        strokeWidth={compact ? 3.4 : 2}
        opacity="0.5"
      />
      {/* a second line just inside the shore — how an engraver shows a beach */}
      <path
        d={COASTLINE_D}
        fill="none"
        stroke="var(--color-ink-faint)"
        strokeWidth={compact ? 1.6 : 0.9}
        opacity="0.4"
        transform="translate(0 9)"
      />

      {/* engraver's latitude hatching over the water — cheap, and it is the
          single detail that makes a blank area read as "sea" on old charts */}
      <g stroke="var(--color-teal-ink)" strokeWidth={compact ? 1.8 : 0.9} opacity="0.28">
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={i} d={`M${640 + i * 12},${600 - i * 6} H1240`} />
        ))}
      </g>

      {!compact && (
        <g stroke="var(--color-sage)" strokeWidth="1.5" fill="none" opacity="0.5">
          {RIDGES.map((d, i) => (
            <path key={i} d={d} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </g>
      )}

      {/* ---- the route ---- */}
      {/* The full course, drawn faintly: you can always see where the coast goes. */}
      <path
        ref={routeRef}
        d={ROUTE_D}
        fill="none"
        stroke="var(--color-ink-soft)"
        strokeWidth={compact ? 3 : 1.8}
        strokeDasharray={compact ? "6 9" : "2 10"}
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* ...and the part you have actually sailed, inked in over it. */}
      {metrics && (
        <path
          d={ROUTE_D}
          fill="none"
          stroke="var(--color-terracotta)"
          strokeWidth={compact ? 4.5 : 2.6}
          strokeLinecap="round"
          style={{
            strokeDasharray: metrics.total,
            strokeDashoffset: metrics.total - sailed,
            transition: "stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      )}

      {/* ---- the places ---- */}
      {CHART_PLACES.map((place, i) => {
        const def = sections[i];
        const accent = def?.accent ?? "var(--color-ink-soft)";
        const here = i === index;
        const seen = visited.has(i);

        return (
          <g key={place.id}>
            <g
              transform={`translate(${place.x} ${place.y})`}
              style={{
                opacity: seen || here ? 1 : 0.45,
                transition: "opacity 0.6s ease",
              }}
            >
              <PlaceGlyph glyph={place.glyph} accent={accent} compact={compact} />
              {/* A seal is stamped only once you have actually arrived — and not
                  on the place you are standing in, which the ship already marks. */}
              {seen && !here && <Seal accent={accent} compact={compact} />}
            </g>

            {!compact && def && (
              <Label place={place} label={def.nav} accent={accent} here={here} />
            )}

            {/* The hit target is generous and sits above everything — a 14px
                glyph is not something anybody can reliably click. */}
            {!compact && onPick && (
              <circle
                cx={place.x}
                cy={place.y}
                r="34"
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onPick(i)}
                role="button"
                tabIndex={0}
                aria-label={`Sail to ${def?.nav ?? place.id}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPick(i);
                  }
                }}
              />
            )}
          </g>
        );
      })}

      {/* ---- the ship ---- */}
      <g
        style={{
          transform: `translate(${ship.x}px, ${ship.y}px)`,
          transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <Ship compact={compact} />
      </g>

      {/* ---- marginalia: the chart's own voice, not a claim about anyone ---- */}
      {!compact && (
        <>
          <text
            x="1055"
            y="596"
            textAnchor="middle"
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: 26,
              fill: "var(--color-teal-ink)",
              opacity: 0.5,
            }}
          >
            open water
          </text>
          <text
            x="150"
            y="150"
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: 24,
              fill: "var(--color-ink-faint)",
              opacity: 0.5,
            }}
          >
            the interior, unsurveyed
          </text>
        </>
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

/** A hand-inked landmark per chapter, drawn at chart scale. */
function PlaceGlyph({
  glyph,
  accent,
  compact,
}: {
  glyph: Glyph;
  accent: string;
  compact: boolean;
}) {
  // The minimap is shown at roughly a sixth of the size, so its strokes have to
  // be scaled up or they vanish into a grey smudge.
  const w = compact ? 3.4 : 1.8;
  const common = {
    fill: "none",
    stroke: accent,
    strokeWidth: w,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const scale = compact ? 1.5 : 1;

  return (
    <g transform={`scale(${scale})`}>
      {glyph === "harbour" && (
        <g {...common}>
          <path d="M-14 8 H14" />
          <path d="M0 8 V-10" />
          <path d="M-7 -3 Q0 -9 7 -3" />
          <circle cx="0" cy="-12" r="2.4" fill={accent} stroke="none" />
        </g>
      )}
      {glyph === "temple" && (
        <g {...common}>
          <path d="M-11 9 H11" />
          <path d="M-8 9 V-1 H8 V9" />
          <path d="M-11 -1 L0 -9 L11 -1" />
          <path d="M0 -9 V-14" />
        </g>
      )}
      {glyph === "peaks" && (
        <g {...common}>
          <path d="M-15 8 L-5 -8 L2 2 L9 -12 L17 8 Z" />
          <path d="M-5 -8 l3 4 l3 -4" strokeWidth={w * 0.7} />
        </g>
      )}
      {glyph === "town" && (
        <g {...common}>
          <path d="M-14 9 H14" />
          <path d="M-12 9 V0 H-4 V9" />
          <path d="M-1 9 V-5 H7 V9" />
          <path d="M10 9 V-1 H14" />
        </g>
      )}
      {glyph === "plates" && (
        <g {...common}>
          <rect x="-13" y="-8" width="11" height="14" transform="rotate(-7 -7 -1)" />
          <rect x="1" y="-10" width="11" height="14" transform="rotate(6 6 -3)" />
        </g>
      )}
      {glyph === "waypoint" && (
        <g {...common}>
          <path d="M-10 6 H10" />
          <path d="M0 6 V-10" />
          <path d="M0 -10 L12 -6 L0 -2 Z" fill={accent} stroke="none" opacity="0.75" />
        </g>
      )}
      {glyph === "tavern" && (
        <g {...common}>
          <path d="M-9 8 H9" />
          <path d="M-7 -6 H7 L4 8 H-4 Z" />
          <path d="M7 -3 q6 3 0 6" />
        </g>
      )}
      {glyph === "lighthouse" && (
        <g {...common}>
          <path d="M-9 10 H9" />
          <path d="M-5 10 L-3 -6 H3 L5 10 Z" />
          <path d="M-4 -6 H4" />
          <path d="M-3 -10 Q0 -14 3 -10 Z" fill={accent} stroke="none" />
          <path d="M5 -9 l9 -4 M5 -6 l9 2" strokeWidth={w * 0.7} opacity="0.7" />
        </g>
      )}
    </g>
  );
}

/**
 * A wax seal, stamped where you have been.
 *
 * Deliberately small and slightly off-centre from the glyph — a seal pressed by
 * hand never lands square, and that single degree of wrongness is most of why it
 * reads as pressed rather than printed.
 */
function Seal({ accent, compact }: { accent: string; compact: boolean }) {
  const r = compact ? 10 : 7;
  return (
    <g transform={`translate(${compact ? 15 : 12} ${compact ? -15 : -12}) rotate(-9)`}>
      <path
        d="M0 -10 C5 -10 7 -7 9 -5 C11 -2 11 2 9 6 C7 9 4 10 0 10 C-4 10 -8 9 -10 6 C-12 2 -12 -2 -10 -5 C-8 -8 -5 -10 0 -10 Z"
        fill={accent}
        opacity="0.88"
        transform={`scale(${r / 10})`}
      />
      <circle
        cx="0"
        cy="0"
        r={r * 0.55}
        fill="none"
        stroke="var(--color-paper-panel)"
        strokeWidth={compact ? 1.4 : 0.9}
        opacity="0.6"
      />
    </g>
  );
}

/** The paper boat, marking where you are now. */
function Ship({ compact }: { compact: boolean }) {
  const s = compact ? 1.7 : 1;
  return (
    <g transform={`scale(${s})`}>
      {/* a soft wake so the boat sits ON the route rather than over it */}
      <ellipse cx="0" cy="12" rx="16" ry="4" fill="var(--color-sea-3)" opacity="0.45" />
      <path
        d="M-15 6 L15 6 L9 15 L-9 15 Z"
        fill="var(--color-paper-panel)"
        stroke="var(--color-ink-soft)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M0 4 L0 -14 L13 4 Z"
        fill="var(--color-paper-panel)"
        stroke="var(--color-ink-soft)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M0 -14 L-12 4 L0 4 Z"
        fill="var(--color-paper-deep)"
        stroke="var(--color-ink-soft)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** A hand-lettered place name, kept clear of the route. */
function Label({
  place,
  label,
  accent,
  here,
}: {
  place: (typeof CHART_PLACES)[number];
  label: string;
  accent: string;
  here: boolean;
}) {
  const off = 30;
  const pos =
    place.side === "left"
      ? { x: place.x - off, y: place.y + 6, anchor: "end" as const }
      : place.side === "right"
        ? { x: place.x + off, y: place.y + 6, anchor: "start" as const }
        : place.side === "above"
          ? { x: place.x, y: place.y - off, anchor: "middle" as const }
          : { x: place.x, y: place.y + off + 10, anchor: "middle" as const };

  return (
    <text
      x={pos.x}
      y={pos.y}
      textAnchor={pos.anchor}
      style={{
        fontFamily: "var(--font-hand)",
        fontSize: here ? 30 : 26,
        fill: here ? accent : "var(--color-ink-soft)",
        opacity: here ? 1 : 0.75,
        transition: "font-size 0.4s ease, opacity 0.4s ease",
        pointerEvents: "none",
      }}
    >
      {label}
    </text>
  );
}
