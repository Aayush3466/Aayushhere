import { cn } from "@/lib/utils";

/**
 * A hand-inked compass rose. Purely decorative here; the interactive navigation
 * compass (built in the journey phase) reuses this artwork.
 */
export function CompassRose({
  className,
  size = 120,
  spin = false,
  /**
   * Degrees to swing the needle. The nav passes the direction of travel, so the
   * compass reads the voyage instead of merely decorating it — the needle leans
   * east as you sail east.
   */
  heading = 0,
}: {
  className?: string;
  size?: number;
  spin?: boolean;
  heading?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("select-none", className)}
      role="img"
      aria-label="Compass rose"
      style={{
        transform: `rotate(${heading}deg)`,
        transition: "transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* faint outer ring, slightly wobbled so it reads hand-drawn */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="var(--color-ink-faint)"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <circle
        cx="50"
        cy="50"
        r="41.5"
        fill="none"
        stroke="var(--color-ink-faint)"
        strokeWidth="0.5"
        opacity="0.5"
      />

      {/* tick marks every 30° — coords rounded so SSR and client render
          byte-identical strings (avoids a float-precision hydration mismatch) */}
      <g stroke="var(--color-ink-soft)" strokeWidth="0.7" opacity="0.55">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const rOuter = 41.5;
          const rInner = i % 3 === 0 ? 36 : 38.5;
          const round = (n: number) => Math.round(n * 100) / 100;
          return (
            <line
              key={i}
              x1={round(50 + rOuter * Math.sin(a))}
              y1={round(50 - rOuter * Math.cos(a))}
              x2={round(50 + rInner * Math.sin(a))}
              y2={round(50 - rInner * Math.cos(a))}
            />
          );
        })}
      </g>

      <g className={spin ? "origin-center [animation:soft-sway_9s_ease-in-out_infinite]" : ""}>
        {/* east-west + secondary points (muted) */}
        <polygon points="50,50 32,50 50,42" fill="var(--color-ink-soft)" opacity="0.5" />
        <polygon points="50,50 68,50 50,58" fill="var(--color-ink-soft)" opacity="0.5" />
        <polygon points="50,50 50,32 58,50" fill="var(--color-ink-soft)" opacity="0.35" />
        <polygon points="50,50 50,68 42,50" fill="var(--color-ink-soft)" opacity="0.35" />

        {/* the north-south needle */}
        <polygon points="50,10 44,50 50,50" fill="var(--color-terracotta)" />
        <polygon points="50,10 56,50 50,50" fill="#a85e42" />
        <polygon points="50,90 44,50 50,50" fill="var(--color-ink)" />
        <polygon points="50,90 56,50 50,50" fill="var(--color-ink-soft)" />
      </g>

      {/* hub */}
      <circle cx="50" cy="50" r="2.4" fill="var(--color-paper-panel)" stroke="var(--color-ink)" strokeWidth="0.8" />

      {/* cardinal letters */}
      <g
        fill="var(--color-ink)"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        fontSize="8"
        textAnchor="middle"
      >
        <text x="50" y="8.5">N</text>
        <text x="94" y="53">E</text>
        <text x="50" y="99">S</text>
        <text x="6" y="53">W</text>
      </g>
    </svg>
  );
}
