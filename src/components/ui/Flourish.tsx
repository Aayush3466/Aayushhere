import { cn } from "@/lib/utils";

/**
 * A hand-inked swash divider with a centre diamond — the kind of ornament an
 * old chart uses to separate passages. Accent-tinted, purely decorative.
 */
export function Flourish({ accent, className }: { accent: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      className={cn("h-4 w-52", className)}
      fill="none"
      stroke={accent}
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M8 12 C 48 4, 78 4, 104 12" opacity="0.55" />
      <path d="M232 12 C 192 4, 162 4, 136 12" opacity="0.55" />
      <path d="M104 12 C 96 20, 92 20, 84 14" opacity="0.4" />
      <path d="M136 12 C 144 20, 148 20, 156 14" opacity="0.4" />
      <g fill={accent} stroke="none">
        <path d="M120 5 L126 12 L120 19 L114 12 Z" />
        <circle cx="120" cy="12" r="1.6" fill="var(--color-paper-panel)" />
      </g>
    </svg>
  );
}

/**
 * A wax-seal monogram — a signature stamp of craft. Give it the initials.
 */
export function WaxSeal({
  initials,
  size = 84,
  accent = "var(--color-terracotta)",
  className,
}: {
  initials: string;
  size?: number;
  accent?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("select-none", className)}
      aria-hidden
    >
      {/* irregular wax blob */}
      <path
        d="M50 6 C 66 6, 74 14, 82 20 C 92 28, 96 40, 92 54 C 89 66, 94 76, 84 84 C 74 92, 62 90, 50 93 C 38 96, 26 92, 18 84 C 9 76, 12 64, 9 52 C 6 40, 10 28, 20 20 C 29 13, 34 6, 50 6 Z"
        fill={accent}
        opacity="0.9"
      />
      <circle cx="50" cy="50" r="30" fill="none" stroke="var(--color-paper-panel)" strokeWidth="1.5" opacity="0.55" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="var(--color-paper-panel)" strokeWidth="0.8" opacity="0.35" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--color-paper-panel)"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, letterSpacing: "-0.04em" }}
      >
        {initials}
      </text>
    </svg>
  );
}

/**
 * Engraver's registration marks — the small crosses a printer sets at the
 * corners of a plate to align each colour pass. Purely period detail: they say
 * "this sheet came off a press" more economically than any amount of texture.
 */
export function RegistrationMarks({ className }: { className?: string }) {
  const mark = (style: React.CSSProperties) => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      className="absolute"
      style={style}
      aria-hidden
    >
      <path d="M6.5 0.5 V13 M0.5 6.5 H13" opacity="0.5" />
      <circle cx="6.5" cy="6.5" r="3.1" opacity="0.4" />
    </svg>
  );

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 text-ink-faint", className)}
      aria-hidden
    >
      {mark({ top: 7, left: 7 })}
      {mark({ top: 7, right: 7 })}
      {mark({ bottom: 7, left: 7 })}
      {mark({ bottom: 7, right: 7 })}
    </div>
  );
}
