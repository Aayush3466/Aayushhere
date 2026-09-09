/**
 * A small lighthouse far down the coast — the Horizon, promised from the very
 * first frame. Its beam sweeps slowly. Self-positioned near the horizon, right.
 */
export function Lighthouse({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ position: "absolute", right: "11vw", top: "37vh", width: 64, ...style }}
    >
      <svg viewBox="0 0 80 150" width="64" height="120" className="overflow-visible">
        {/* sweeping beam */}
        <g
          style={{
            transformOrigin: "40px 40px",
            animation: "beam-sweep 9s ease-in-out infinite",
          }}
        >
          <path d="M40 40 L-40 8 L-40 78 Z" fill="var(--color-sun)" opacity="0.5" />
        </g>

        {/* rock */}
        <path
          d="M8 150 Q6 128 22 126 Q40 118 58 126 Q74 128 72 150 Z"
          fill="color-mix(in oklab, var(--color-indigo-ink) 30%, var(--color-haze))"
          opacity="0.7"
        />
        {/* tower */}
        <path d="M31 128 L27 58 L53 58 L49 128 Z" fill="var(--color-paper-panel)" stroke="var(--color-ink-soft)" strokeWidth="1" />
        {/* red bands */}
        <path d="M30 112 L50 112 L49.2 98 L30.8 98 Z" fill="var(--color-terracotta)" opacity="0.9" />
        <path d="M28.6 84 L51.4 84 L50.6 70 L29.4 70 Z" fill="var(--color-terracotta)" opacity="0.9" />
        {/* gallery + lantern */}
        <rect x="25" y="50" width="30" height="8" rx="1.5" fill="var(--color-ink-soft)" />
        <path d="M30 50 L30 38 L50 38 L50 50 Z" fill="color-mix(in oklab, var(--color-sun) 70%, white)" stroke="var(--color-ink-soft)" strokeWidth="1" />
        {/* dome */}
        <path d="M28 38 Q40 24 52 38 Z" fill="var(--color-ink)" />
        <circle cx="40" cy="24" r="1.8" fill="var(--color-ink)" />
      </svg>
    </div>
  );
}
