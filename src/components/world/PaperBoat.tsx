/**
 * A folded paper boat the visitor can later nudge along the coast. For now it
 * rides the swell (see `anim-boat`). Kept to empty water so it never crowds text.
 */
export function PaperBoat({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // Fluid, and it no longer forces `position: absolute` on itself. It used to
    // take a pixel width and pin its own position, which meant the caller could
    // not make it smaller on a phone or let it sail — the boat owned where it
    // was, so it could only ever be parked.
    <div aria-hidden className={className} style={style}>
      {/* the bob/rotate lives on an inner wrapper so it composes with the sail */}
      <div className="anim-boat will-move">
        <svg
          viewBox="0 0 120 86"
          width="100%"
          className="h-auto overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* faint reflection on the water */}
          <ellipse cx="60" cy="80" rx="48" ry="4.5" fill="var(--color-ink)" opacity="0.13" />
          {/* hull */}
          <path
            d="M10 52 L110 52 L92 72 Q60 78 28 72 Z"
            fill="var(--color-paper-panel)"
            stroke="var(--color-ink)"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          {/* folded sail / hat */}
          <path
            d="M18 52 L60 14 L102 52 Z"
            fill="color-mix(in oklab, var(--color-paper-panel) 92%, white)"
            stroke="var(--color-ink)"
            strokeWidth="1.7"
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
