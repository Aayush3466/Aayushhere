/**
 * Soft parchment clouds crossing the sky at different speeds and heights. Each
 * has a real `left` anchor so that when motion is reduced (animations disabled)
 * they simply rest on-screen instead of drifting off.
 */
const CLOUDS = [
  { left: "8%", top: "12%", scale: 1.1, opacity: 0.7, dur: 120, delay: -20 },
  { left: "52%", top: "8%", scale: 0.7, opacity: 0.5, dur: 165, delay: -70 },
  { left: "74%", top: "20%", scale: 0.9, opacity: 0.6, dur: 140, delay: -110 },
  { left: "34%", top: "26%", scale: 0.55, opacity: 0.42, dur: 190, delay: -150 },
];

function Puff({ opacity }: { opacity: number }) {
  return (
    <svg viewBox="0 0 140 60" width="180" height="77">
      <path
        d="M16,50 C6,50 3,37 14,34 C11,21 29,16 36,25 C42,9 68,9 72,27 C85,18 102,27 97,40 C110,42 110,54 97,54 L22,54 C17,54 15,52 16,50 Z"
        fill="color-mix(in oklab, white 82%, var(--color-paper))"
        opacity={opacity}
      />
      <path
        d="M22,54 L97,54"
        stroke="var(--color-ink-faint)"
        strokeWidth="0.8"
        opacity={opacity * 0.4}
      />
    </svg>
  );
}

export function Clouds() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="will-move absolute"
          style={{
            left: c.left,
            top: c.top,
            animation: `cloud-cross ${c.dur}s linear ${c.delay}s infinite`,
          }}
        >
          <div style={{ transform: `scale(${c.scale})` }}>
            <Puff opacity={c.opacity} />
          </div>
        </div>
      ))}
    </div>
  );
}
