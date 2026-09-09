/**
 * The sky: a warm parchment gradient with a low, soft sun-glow. Pure CSS so it
 * costs nothing and never jank. The horizon sits at ~52vh; the sea overlays below.
 */
export function Sky() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(179deg, var(--color-sky-top) 0%, var(--color-sky-low) 46%, color-mix(in oklab, var(--color-sky-low) 70%, var(--color-sea-1)) 52%)",
      }}
    >
      {/* the sun — a broad, warm bloom high on the left */}
      <div
        className="absolute"
        style={{
          left: "22%",
          top: "6%",
          width: "60vw",
          height: "60vw",
          maxWidth: 900,
          maxHeight: 900,
          transform: "translate(-40%, -35%)",
          background:
            "radial-gradient(circle at center, color-mix(in oklab, var(--color-sun) 92%, transparent) 0%, color-mix(in oklab, var(--color-sun) 34%, transparent) 34%, transparent 60%)",
        }}
      />
      {/* a faint haze band right at the horizon to soften sea/sky seam */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "44vh",
          height: "14vh",
          background:
            "linear-gradient(180deg, transparent, color-mix(in oklab, var(--color-haze) 40%, transparent) 60%, transparent)",
        }}
      />
    </div>
  );
}
