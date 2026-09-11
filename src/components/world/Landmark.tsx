import type { RegionKey } from "@/lib/types";
import { getRegion } from "@/lib/map/regions";

/**
 * Each region is a place on the chart, drawn as a small hand-inked landmark in
 * its own territory ink. One component, switched by region key — so a new record
 * dropped into any region is already sitting in a fully-drawn world.
 */
export function Landmark({ region, size = 132 }: { region: RegionKey; size?: number }) {
  const { accent, tint } = getRegion(region);
  const common = {
    fill: tint,
    stroke: accent,
    strokeWidth: 2.4,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  return (
    <svg viewBox="0 0 140 110" width={size} height={(size * 110) / 140} className="overflow-visible">
      {/* watercolor bloom behind the motif — makes the line-art read as painted */}
      {/* The haze behind the landmark, as a gradient rather than a blurred
          ellipse. Research draws one of these per region, so two SVG filter
          regions per landmark was eight filters on one chapter — each its own
          raster pass, none of them compositor-accelerated, all to draw a soft
          edge a gradient gives away for nothing. */}
      <defs>
        <radialGradient id={`lm-haze-${region}`}>
          <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="70" cy="64" rx="66" ry="46" fill={`url(#lm-haze-${region})`} />
      {region === "kathmandu" && (
        <g {...common}>
          <path d="M6 100 L44 30 L66 62 L86 22 L134 100 Z" />
          <path d="M44 30 L34 44 L44 40 L52 50 L60 40 L44 30 Z" fill="#fbf8f0" stroke="none" />
          <path d="M86 22 L76 38 L86 34 L95 46 L104 34 L86 22 Z" fill="#fbf8f0" stroke="none" />
          <g stroke={accent} strokeWidth="1" opacity="0.35" fill="none">
            <path d="M44 44 L60 92" /><path d="M52 46 L66 92" />
          </g>
        </g>
      )}

      {region === "india" && (
        <g {...common}>
          {/* an open book — study */}
          <path d="M12 78 Q40 64 70 76 Q100 64 128 78 L128 40 Q100 28 70 40 Q40 28 12 40 Z" />
          <path d="M70 40 L70 76" fill="none" />
          <g stroke={accent} strokeWidth="1" opacity="0.4" fill="none">
            <path d="M24 46 Q44 40 64 48" /><path d="M24 56 Q44 50 64 58" />
            <path d="M76 48 Q96 40 116 46" /><path d="M76 58 Q96 50 116 56" />
          </g>
        </g>
      )}

      {region === "cybersecurity" && (
        <g {...common}>
          {/* a shield */}
          <path d="M70 8 L118 26 Q118 76 70 100 Q22 76 22 26 Z" />
          <circle cx="70" cy="50" r="9" fill="#fbf8f0" stroke="none" />
          <path d="M70 50 L70 66" stroke={accent} strokeWidth="4" />
        </g>
      )}

      {region === "bioinformatics" && (
        <g fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round">
          {/* a DNA helix */}
          <path d="M46 10 C 96 34, 96 62, 46 96" />
          <path d="M94 10 C 44 34, 44 62, 94 96" />
          <g strokeWidth="2" opacity="0.7">
            <path d="M52 26 L88 26" /><path d="M64 40 L76 40" />
            <path d="M64 66 L76 66" /><path d="M52 80 L88 80" />
          </g>
        </g>
      )}

      {region === "nlp" && (
        <g {...common}>
          {/* a forest tree */}
          <path d="M64 100 L64 62" stroke={accent} strokeWidth="6" fill="none" />
          <path d="M70 20 Q104 34 92 58 Q108 74 78 78 Q72 96 64 78 Q34 82 44 58 Q30 36 60 34 Q58 16 70 20 Z" />
        </g>
      )}

      {region === "vision" && (
        <g {...common}>
          {/* an eye / lens */}
          <path d="M12 55 Q70 14 128 55 Q70 96 12 55 Z" />
          <circle cx="70" cy="55" r="18" fill="#fbf8f0" stroke={accent} />
          <circle cx="70" cy="55" r="8" fill={accent} stroke="none" />
        </g>
      )}

      {region === "development" && (
        <g {...common}>
          {/* a little coastal town */}
          <rect x="24" y="52" width="30" height="48" rx="2" />
          <rect x="58" y="34" width="26" height="66" rx="2" />
          <rect x="88" y="60" width="28" height="40" rx="2" />
          <g stroke={accent} strokeWidth="2" fill="none" opacity="0.6">
            <path d="M64 74 L58 82 L64 90" /><path d="M78 74 L84 82 L78 90" />
          </g>
        </g>
      )}

      {region === "horizon" && (
        <g {...common}>
          {/* a lighthouse */}
          <path d="M54 100 L58 40 L82 40 L86 100 Z" />
          <path d="M56 82 L84 82 M55 64 L85 64" stroke={accent} strokeWidth="3" />
          <rect x="55" y="26" width="30" height="14" rx="1.5" />
          <path d="M58 26 Q70 10 82 26 Z" fill={accent} stroke="none" />
          <g stroke={accent} strokeWidth="2" opacity="0.5" fill="none">
            <path d="M86 33 L112 24" /><path d="M86 33 L112 42" />
          </g>
        </g>
      )}
    </svg>
  );
}
