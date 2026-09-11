/**
 * The living sea. Several wave bands, each twice the viewport wide with an even
 * number of wave periods, drift horizontally and loop seamlessly (translate
 * -50% returns to an identical crest). Bands are stacked back-to-front, lighter
 * near the horizon to darker near the viewer, giving real watercolor depth.
 */

// One tile: 4 wave periods across a 200-unit viewBox → seamless at -50% drift.
const WAVE_TOP =
  "M0,30 C12.5,16 12.5,16 25,30 C37.5,44 37.5,44 50,30 C62.5,16 62.5,16 75,30 C87.5,44 87.5,44 100,30 C112.5,16 112.5,16 125,30 C137.5,44 137.5,44 150,30 C162.5,16 162.5,16 175,30 C187.5,44 187.5,44 200,30";
const WAVE = `${WAVE_TOP} L200,300 L0,300 Z`;

function WaveBand({
  top,
  color,
  opacity,
  dur,
  reverse = false,
  foam = false,
}: {
  top: number | string;
  color: string;
  opacity: number;
  dur: number;
  reverse?: boolean;
  foam?: boolean;
}) {
  return (
    <div
      className="will-move absolute left-0"
      style={{
        top,
        bottom: 0,
        width: "200%",
        animation: `wave-drift ${dur}s linear infinite ${reverse ? "reverse" : "normal"}`,
      }}
    >
      <svg
        viewBox="0 0 200 300"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
      >
        <path d={WAVE} fill={color} opacity={opacity} />
        {foam && (
          <path
            d={WAVE_TOP}
            fill="none"
            stroke="white"
            strokeOpacity="0.5"
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}

export function Sea() {
  return (
    <div
      aria-hidden
      className="anim-bob absolute inset-x-0 overflow-hidden"
      style={{
        top: "52vh",
        bottom: 0,
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--color-sea-1) 80%, var(--color-sky-low)) 0%, var(--color-sea-2) 22%, var(--color-sea-3) 62%, var(--color-sea-4) 100%)",
      }}
    >
      {/* sun glitter on the water, under the sun */}
      <div
        className="absolute"
        style={{
          left: "8%",
          top: 0,
          width: "34%",
          height: "70%",
          // Painted straight on rather than blended: this layer rides the
          // sea's bob animation, so a blend mode here re-composites the water
          // beneath it on every frame of a loop that never ends.
          background:
            "radial-gradient(60% 90% at 40% 0%, color-mix(in oklab, var(--color-sun) 78%, transparent), transparent 70%)",
          opacity: 0.55,
        }}
      />

      {/* Three bands, not five. Each is a 200%-wide layer drifting forever;
          the two that were removed sat behind the others and read as depth that
          the remaining gradient already provides. */}
      <WaveBand top={0} color="color-mix(in oklab, var(--color-sea-2) 85%, white)" opacity={0.7} dur={34} foam />
      <WaveBand top={58} color="color-mix(in oklab, var(--color-sea-3) 88%, white)" opacity={0.82} dur={24} reverse foam />
      <WaveBand top={150} color="var(--color-sea-4)" opacity={0.92} dur={30} />

      {/* the near shoreline foam line */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "40%",
          background:
            "linear-gradient(180deg, transparent, color-mix(in oklab, var(--color-sea-4) 60%, var(--color-ink)) 140%)",
          opacity: 0.35,
        }}
      />
    </div>
  );
}
