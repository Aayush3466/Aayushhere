/**
 * A few ink birds, drawn as light double-arcs, drifting slowly across the sky.
 * Positioned with a real anchor so reduced motion leaves them resting in place.
 */
export function Birds() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="will-move absolute"
        style={{
          left: "16%",
          top: "24%",
          animation: "drift-across 90s ease-in-out -10s infinite alternate",
        }}
      >
        <svg viewBox="0 0 120 40" width="120" height="40">
          <g
            fill="none"
            stroke="var(--color-ink-soft)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.5"
          >
            <path d="M8 22 Q16 12 24 22 Q32 12 40 22" />
            <path d="M52 15 Q58 8 64 15 Q70 8 76 15" transform="scale(0.8)" />
            <path d="M84 26 Q90 19 96 26 Q102 19 108 26" transform="scale(0.9)" />
          </g>
        </svg>
      </div>
    </div>
  );
}
