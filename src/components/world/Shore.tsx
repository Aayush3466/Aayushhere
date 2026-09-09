/**
 * The foreground shore — a low band of warm sand grounding the viewer on land,
 * looking out to sea. A small rise on the left carries a few grass tufts. Kept
 * pale and low so it grounds without competing with content.
 */
export function Shore() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0"
      style={{ height: "15vh", minHeight: 90 }}
    >
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
      >
        {/* wet-sand edge where water meets land */}
        <path
          d="M0 60 Q160 30 320 52 Q560 84 820 70 Q1080 58 1440 82 L1440 62 Q1080 40 820 52 Q560 64 320 34 Q160 14 0 42 Z"
          fill="color-mix(in oklab, var(--color-sea-4) 45%, var(--color-ochre))"
          opacity="0.5"
        />
        {/* the sand */}
        <path
          d="M0 200 L0 84 Q160 54 320 76 Q560 108 820 94 Q1080 82 1440 106 L1440 200 Z"
          fill="color-mix(in oklab, var(--color-ochre) 42%, var(--color-paper))"
        />
        {/* stipple + a faint winding path */}
        <g fill="var(--color-ochre)" opacity="0.28">
          <circle cx="140" cy="140" r="1.6" />
          <circle cx="240" cy="160" r="1.4" />
          <circle cx="360" cy="130" r="1.5" />
          <circle cx="980" cy="150" r="1.5" />
          <circle cx="1120" cy="132" r="1.4" />
          <circle cx="1280" cy="158" r="1.6" />
        </g>
        {/* grass tufts on the left rise */}
        <g stroke="var(--color-sage)" strokeWidth="2" strokeLinecap="round" opacity="0.6">
          <path d="M70 96 L66 78 M74 96 L74 74 M78 96 L82 80" fill="none" />
          <path d="M120 104 L116 88 M124 104 L124 84 M128 104 L132 90" fill="none" />
        </g>
      </svg>
    </div>
  );
}
