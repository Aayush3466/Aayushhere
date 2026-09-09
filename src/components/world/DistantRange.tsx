/**
 * The Himalayas in haze — two ridgelines behind the horizon. The far ridge is
 * paler (atmospheric perspective); the near ridge carries a little hatching and
 * snow. Base is pinned to the horizon so it reads as land meeting sea.
 */
export function DistantRange() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0"
      style={{ bottom: "48vh", height: "40vh" }}
    >
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
      >
        {/* far ridge — hazy, cool */}
        <path
          d="M0 400 L0 232 L150 190 L260 226 L360 150 L470 214 L560 176 L690 236 L800 150 L930 220 L1040 178 L1160 232 L1280 176 L1440 224 L1440 400 Z"
          fill="var(--color-haze)"
          opacity="0.55"
        />
        {/* near ridge — a touch warmer / darker */}
        <path
          d="M0 400 L0 300 L120 268 L240 306 L340 214 L430 286 L540 236 L660 300 L780 214 L900 286 L1010 250 L1140 300 L1270 238 L1440 292 L1440 400 Z"
          fill="color-mix(in oklab, var(--color-indigo-ink) 34%, var(--color-haze))"
          opacity="0.5"
        />
        {/* snow caps on the tall near peaks */}
        <g fill="color-mix(in oklab, white 78%, var(--color-paper))" opacity="0.85">
          <path d="M340 214 L318 244 L332 240 L344 250 L356 238 L366 246 L340 214 Z" />
          <path d="M780 214 L760 242 L772 238 L784 248 L795 236 L804 244 L780 214 Z" />
        </g>
        {/* faint pencil hatching on the near ridge shadow side */}
        <g stroke="var(--color-indigo-ink)" strokeWidth="1" opacity="0.12">
          <line x1="340" y1="220" x2="368" y2="286" />
          <line x1="352" y1="222" x2="378" y2="284" />
          <line x1="780" y1="220" x2="808" y2="286" />
          <line x1="792" y1="224" x2="816" y2="286" />
        </g>
      </svg>
    </div>
  );
}
