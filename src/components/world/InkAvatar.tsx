import { cn } from "@/lib/utils";

/**
 * A refined ink portrait of Aayush — swept quiff, sunglasses, a tailored navy
 * suit with peak lapels, knotted tie and pocket square, with soft shading and a
 * few ink splashes. Stylised, not photographic; for an exact likeness, upload a
 * photo in /studio to run through a sketch filter.
 */
export function InkAvatar({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      width={size}
      height={(size * 240) / 200}
      className={cn("overflow-visible", className)}
      role="img"
      aria-label="Illustrated portrait of Aayush Adhikari"
    >
      {/* ink splashes */}
      <g fill="var(--color-terracotta)" opacity="0.14">
        <circle cx="38" cy="54" r="8" />
        <circle cx="28" cy="76" r="3.5" />
        <circle cx="172" cy="60" r="10" />
        <circle cx="182" cy="44" r="3" />
        <circle cx="150" cy="38" r="2.2" />
      </g>

      {/* suit */}
      <path d="M22 240 C22 176 58 158 100 158 C142 158 178 176 178 240 Z" fill="#2b374f" />
      <path d="M100 158 C142 158 178 176 178 240 L152 240 C152 192 130 173 100 168 Z" fill="#25314a" opacity="0.55" />
      {/* shirt */}
      <path d="M80 162 L100 214 L120 162 Z" fill="#f7f3ea" />
      <path d="M82 162 L100 182 L90 162 Z" fill="#e9e3d6" />
      <path d="M118 162 L100 182 L110 162 Z" fill="#e9e3d6" />
      {/* peak lapels */}
      <path d="M80 162 L100 214 L84 178 L73 168 Z" fill="#222d44" />
      <path d="M120 162 L100 214 L116 178 L127 168 Z" fill="#222d44" />
      {/* tie */}
      <path d="M94 178 L100 172 L106 178 L103 189 L97 189 Z" fill="#3a2f2a" />
      <path d="M97 189 L100 232 L103 189 Z" fill="#2a2620" />
      {/* pocket square */}
      <path d="M137 197 l11 -4 -3 9 z" fill="#f7f3ea" />

      {/* neck + shade */}
      <path d="M88 146 h24 v20 q-12 8 -24 0 z" fill="#e7d0b2" />
      <path d="M100 150 v16 q6 4 12 0 v-6 q-6 4 -12 -4 z" fill="#d6ba96" opacity="0.5" />

      {/* ears */}
      <ellipse cx="58" cy="116" rx="6" ry="8" fill="#eed7ba" stroke="var(--color-ink)" strokeWidth="1.3" />
      <ellipse cx="142" cy="116" rx="6" ry="8" fill="#eed7ba" stroke="var(--color-ink)" strokeWidth="1.3" />

      {/* head — refined jaw */}
      <path
        d="M60 100 C60 70 78 60 100 60 C122 60 140 70 140 100 C140 128 124 150 100 152 C76 150 60 128 60 100 Z"
        fill="#f0dcc0"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
      {/* soft cheek shade */}
      <path d="M129 104 C133 122 122 141 105 150 C121 143 129 125 129 104 Z" fill="#dcc09c" opacity="0.5" />

      {/* hair — clean side-part quiff */}
      <path
        d="M58 98 C55 62 80 46 106 50 C130 54 144 74 140 98 C138 84 130 74 116 70 C122 78 123 86 120 92 C110 76 88 72 74 82 C66 87 60 92 58 98 Z"
        fill="#241f18"
      />
      <path d="M78 66 C90 58 104 58 116 64" fill="none" stroke="#3a332a" strokeWidth="2" strokeLinecap="round" />

      {/* brows */}
      <path d="M74 100 q10 -4 20 0" fill="none" stroke="#241f18" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M106 100 q10 -4 20 0" fill="none" stroke="#241f18" strokeWidth="2.4" strokeLinecap="round" />

      {/* sunglasses — wayfarer */}
      <g fill="#17130f">
        <rect x="66" y="106" width="30" height="20" rx="7" />
        <rect x="104" y="106" width="30" height="20" rx="7" />
        <rect x="95" y="112" width="10" height="4" rx="2" />
        <path d="M66 110 L54 106" stroke="#17130f" strokeWidth="3" strokeLinecap="round" />
        <path d="M134 110 L146 106" stroke="#17130f" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M72 111 L84 110" stroke="white" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />

      {/* nose + smile */}
      <path d="M100 126 l-4 10 l6 0" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M86 142 Q100 150 114 142" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />

      {/* ink flecks */}
      <g fill="var(--color-ink)" opacity="0.5">
        <circle cx="152" cy="150" r="2" />
        <circle cx="47" cy="150" r="1.6" />
      </g>
    </svg>
  );
}
