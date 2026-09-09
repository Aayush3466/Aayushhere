/**
 * A folded paper boat the visitor can later nudge along the coast. For now it
 * rides the swell (see `anim-boat`). Kept to empty water so it never crowds text.
 */
export function PaperBoat({
  className,
  style,
  width = 118,
}: {
  className?: string;
  style?: React.CSSProperties;
  width?: number;
}) {
  return (
    <div aria-hidden className={className} style={{ position: "absolute", ...style }}>
      {/* the bob/rotate lives on an inner wrapper so callers can position freely */}
      <div className="anim-boat will-move">
        <svg viewBox="0 0 120 86" width={width} height={width * 0.72} className="overflow-visible">
          {/* faint reflection on the water */}
          <ellipse cx="60" cy="80" rx="46" ry="4" fill="var(--color-ink)" opacity="0.08" />
          {/* hull */}
          <path
            d="M10 52 L110 52 L92 72 Q60 78 28 72 Z"
            fill="var(--color-paper-panel)"
            stroke="var(--color-ink)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* folded sail / hat */}
          <path
            d="M18 52 L60 14 L102 52 Z"
            fill="color-mix(in oklab, var(--color-paper-panel) 92%, white)"
            stroke="var(--color-ink)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* centre fold */}
          <path d="M60 14 L60 52" stroke="var(--color-ink-soft)" strokeWidth="1" opacity="0.8" />
          {/* a hair of ochre so it reads warm, not clinical */}
          <path d="M60 14 L102 52 L60 52 Z" fill="var(--color-ochre)" opacity="0.12" />
        </svg>
      </div>
    </div>
  );
}
