/**
 * PLACE-ART
 * ---------
 * Hand-inked landmark illustrations that give each education entry a real sense
 * of place: the Taj Mahal & an Odisha (Kalinga) temple for the COMPEX years in
 * India, and Dharahara over a Kathmandu skyline for home & school in Nepal.
 * Stylised silhouettes — warm, drawn, never photographic.
 *
 * `size` is a MAXIMUM, not a fixed width. Each scene renders fluid so it shrinks
 * with its column instead of overflowing it — a fixed-width SVG in a two-column
 * grid is exactly how the Education plates ended up sliced off at the right.
 */

const IVORY = "#f8f2e4";

/**
 * The soft haze behind each landmark.
 *
 * These were blurred ellipses — `filter: blur(12px)` and friends. An SVG filter
 * forces its own raster pass and is not compositor-accelerated, and Education
 * keeps up to three of these scenes mounted at once (the chapter you are on plus
 * its neighbours), so the site was carrying half a dozen filter regions to draw
 * something a gradient draws for free. A radial gradient is the same glow with
 * no filter at all.
 *
 * Gradient ids are document-global for inline SVG, which is why each one is
 * named after the scene that owns it.
 */
function Glow({
  id,
  color,
  cx,
  cy,
  rx,
  ry,
  opacity,
}: {
  id: string;
  color: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  opacity: number;
}) {
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <stop offset="55%" stopColor={color} stopOpacity={opacity * 0.55} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} />
    </>
  );
}

export function TajMahal({ size = 220 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 200 152"
      width="100%"
      style={{ maxWidth: size }}
      className="h-auto overflow-visible"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      <Glow id="glow-taj-base" color="#c9973f" cx={100} cy={98} rx={104} ry={58} opacity={0.2} />
      <Glow id="glow-taj-dome" color="#c9973f" cx={100} cy={70} rx={56} ry={56} opacity={0.16} />
      <g fill={IVORY} stroke="#b98a3e" strokeWidth="2" strokeLinejoin="round">
        <rect x="12" y="128" width="176" height="12" rx="1.5" />
        {/* minarets */}
        <rect x="30" y="52" width="9" height="76" rx="3.5" />
        <rect x="161" y="52" width="9" height="76" rx="3.5" />
        <path d="M28 53 Q34.5 42 41 53 Z" />
        <path d="M159 53 Q165.5 42 172 53 Z" />
        <rect x="28" y="80" width="13" height="3" />
        <rect x="159" y="80" width="13" height="3" />
        {/* main block */}
        <path d="M56 128 V72 H144 V128 Z" />
        <path d="M58 72 Q64 62 70 72 Z" />
        <path d="M130 72 Q136 62 142 72 Z" />
        {/* iwan */}
        <path d="M86 128 V102 Q100 80 114 102 V128 Z" fill="#efe3c8" />
        {/* drum + onion dome */}
        <rect x="83" y="62" width="34" height="10" />
        <path d="M81 64 Q81 30 100 22 Q119 30 119 64 Z" />
        <path d="M100 22 V10" strokeWidth="2" />
        <circle cx="100" cy="8" r="2.6" fill="#b98a3e" stroke="none" />
      </g>
    </svg>
  );
}

export function DharaharaScene({ size = 240 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 230 168"
      width="100%"
      style={{ maxWidth: size }}
      className="h-auto overflow-visible"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      <Glow id="glow-dhara-base" color="#6e7b55" cx={115} cy={110} rx={122} ry={60} opacity={0.19} />
      <Glow id="glow-dhara-tower" color="#c0883c" cx={137} cy={80} rx={50} ry={56} opacity={0.16} />
      {/* hills */}
      <path
        d="M0 150 Q60 116 120 138 Q180 118 230 146 V168 H0 Z"
        fill="#6e7b55"
        opacity="0.35"
      />
      {/* Newari pagoda */}
      <g fill={IVORY} stroke="#c2765a" strokeWidth="2" strokeLinejoin="round">
        <rect x="28" y="118" width="46" height="34" />
        <path d="M22 118 L51 100 L80 118 Z" />
        <path d="M28 102 L51 86 L74 102 Z" />
        <path d="M34 88 L51 74 L68 88 Z" />
        <path d="M51 74 V66" /><circle cx="51" cy="64" r="2.2" fill="#c2765a" stroke="none" />
      </g>
      {/* Dharahara tower */}
      <g fill={IVORY} stroke="#b98a3e" strokeWidth="2" strokeLinejoin="round">
        <path d="M120 152 L124 60 H150 L154 152 Z" />
        <rect x="119" y="66" width="36" height="4" />
        <rect x="121" y="96" width="32" height="3" />
        <path d="M124 60 Q137 42 150 60 Z" />
        <path d="M137 42 V30" /><circle cx="137" cy="28" r="2.6" fill="#b98a3e" stroke="none" />
      </g>
      {/* a couple of prayer flags */}
      <g stroke="#3f7c75" strokeWidth="1" opacity="0.6">
        <path d="M137 34 Q170 30 196 44" fill="none" strokeDasharray="1 5" />
      </g>
    </svg>
  );
}

export function OdishaTemple({ size = 150 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 140 160"
      width="100%"
      style={{ maxWidth: size }}
      className="h-auto overflow-visible"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      <Glow id="glow-odisha" color="#b96a4c" cx={70} cy={100} rx={76} ry={70} opacity={0.19} />
      <g fill={IVORY} stroke="#b96a4c" strokeWidth="2" strokeLinejoin="round">
        {/* jagamohana */}
        <path d="M12 150 V110 H70 V150 Z" />
        <path d="M8 110 L41 82 L74 110 Z" />
        <path d="M18 96 L41 80 L64 96 Z" fill="#efe3c8" />
        {/* rekha deul */}
        <path d="M72 150 V68 Q76 40 92 26 Q108 40 112 68 V150 Z" />
        <ellipse cx="92" cy="24" rx="13" ry="5" />
        <path d="M92 19 V8" /><circle cx="92" cy="6" r="2.6" fill="#b96a4c" stroke="none" />
      </g>
      {/* ribs */}
      <g stroke="#b96a4c" strokeWidth="1" opacity="0.4" fill="none">
        <path d="M84 148 V44" /><path d="M92 148 V32" /><path d="M100 148 V44" />
      </g>
    </svg>
  );
}

/**
 * The neutral scene: a lectern, books and a pennant under an arch.
 *
 * Every entry needs SOMETHING drawn, and the alternative was to keep guessing —
 * the old code drew Dharahara over the Kathmandu valley for any location it did
 * not recognise, which would have put a Nepali skyline under a degree earned in
 * Berlin. A scene that says "study" and nothing about geography is the honest
 * default; add a landmark here when a place earns one.
 */
export function ScholarScene({ size = 240 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 220 160"
      width="100%"
      style={{ maxWidth: size }}
      className="h-auto overflow-visible"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      <Glow id="glow-scholar" color="#b98a3e" cx={110} cy={112} rx={110} ry={54} opacity={0.19} />
      {/* the arch */}
      <g fill="none" stroke="#b98a3e" strokeWidth="2" strokeLinejoin="round">
        <path d="M46 146 V74 Q110 18 174 74 V146" />
        <path d="M62 146 V80 Q110 38 158 80 V146" opacity="0.5" />
      </g>
      {/* lectern */}
      <g fill={IVORY} stroke="#c2765a" strokeWidth="2" strokeLinejoin="round">
        <path d="M84 146 V120 H136 V146 Z" />
        <path d="M78 120 L110 104 L142 120 Z" />
      </g>
      {/* a short stack of books */}
      <g fill={IVORY} stroke="#6e7b55" strokeWidth="1.8" strokeLinejoin="round">
        <rect x="150" y="132" width="34" height="7" rx="1.5" />
        <rect x="153" y="125" width="28" height="7" rx="1.5" />
        <rect x="147" y="118" width="38" height="7" rx="1.5" />
      </g>
      {/* pennant */}
      <g stroke="#3f7c75" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M110 104 V64" />
        <path d="M110 66 L136 74 L110 82 Z" fill="#3f7c75" opacity="0.55" stroke="none" />
      </g>
      <circle cx="110" cy="61" r="2.6" fill="#3f7c75" />
    </svg>
  );
}
