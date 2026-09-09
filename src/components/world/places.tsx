/**
 * PLACE-ART
 * ---------
 * Hand-inked landmark illustrations that give each education entry a real sense
 * of place: the Taj Mahal & an Odisha (Kalinga) temple for the COMPEX years in
 * India, and Dharahara over a Kathmandu skyline for home & school in Nepal.
 * Stylised silhouettes — warm, drawn, never photographic.
 */

const IVORY = "#f8f2e4";

export function TajMahal({ size = 220 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 152" width={size} height={(size * 152) / 200} className="overflow-visible" aria-hidden>
      <ellipse cx="100" cy="98" rx="94" ry="50" fill="#c9973f" opacity="0.13" style={{ filter: "blur(12px)" }} />
      <ellipse cx="100" cy="70" rx="46" ry="46" fill="#c9973f" opacity="0.1" style={{ filter: "blur(10px)" }} />
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
    <svg viewBox="0 0 230 168" width={size} height={(size * 168) / 230} className="overflow-visible" aria-hidden>
      <ellipse cx="115" cy="110" rx="110" ry="52" fill="#6e7b55" opacity="0.12" style={{ filter: "blur(13px)" }} />
      <ellipse cx="137" cy="80" rx="40" ry="46" fill="#c0883c" opacity="0.1" style={{ filter: "blur(11px)" }} />
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
    <svg viewBox="0 0 140 160" width={size} height={(size * 160) / 140} className="overflow-visible" aria-hidden>
      <ellipse cx="70" cy="100" rx="66" ry="60" fill="#b96a4c" opacity="0.12" style={{ filter: "blur(12px)" }} />
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
