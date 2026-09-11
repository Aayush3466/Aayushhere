"use client";

import type { SectionId } from "@/lib/sections";
import { Clouds } from "@/components/world/Clouds";
import { Stars } from "@/components/world/Stars";
import { useEnvironment } from "@/lib/store/environment";

/**
 * A soft, themed wash behind each chapter — enough to give the page a distinct
 * sense of place, kept low-contrast so the paper panels above stay perfectly
 * readable. One variant per chapter.
 *
 * Everything that MOVES here is gated on `active`. The pager keeps the two
 * neighbouring chapters mounted so a swipe reveals a page that is already laid
 * out, but a drifting cloud and a breathing glow that nobody can see are pure
 * cost — an offscreen chapter gets the wash and the horizon, and nothing else.
 */
export function ChapterBackdrop({
  variant,
  active = true,
}: {
  variant: SectionId;
  active?: boolean;
}) {
  const { phase } = useEnvironment();
  // Stars are invisible by day (`--star-opacity: 0`) — so by day they are 36
  // elements twinkling on a timer to show nothing at all.
  const starlit = phase === "dusk" || phase === "night";
  const clouded =
    variant === "home" ||
    variant === "education" ||
    variant === "gallery" ||
    variant === "contact";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: gradient(variant) }} />
      {/* a soft light that slowly drifts — keeps the page you're on quietly alive */}
      <div
        className="absolute"
        style={{
          left: "10%",
          top: "16%",
          width: "58vw",
          height: "58vw",
          maxWidth: 720,
          maxHeight: 720,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-sun) 42%, transparent), transparent 62%)",
          animation: active ? "glow-drift 20s ease-in-out infinite" : undefined,
        }}
      />
      {active && starlit && <Stars />}

      {active && clouded && <Clouds />}

      {/* a faint horizon silhouette per place */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[46vh] w-full"
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
      >
        {variant === "education" && (
          <g fill="#b98a3e" opacity="0.14">
            {/* far minarets + domes hint */}
            <path d="M300 400 V250 Q360 190 420 250 V400 Z" />
            <rect x="356" y="150" width="8" height="110" />
            <path d="M980 400 V270 Q1030 210 1080 270 V400 Z" />
          </g>
        )}
        {variant === "research" && (
          <g fill="#3f7c75" opacity="0.13">
            <path d="M0 400 L220 250 L360 330 L560 220 L760 320 L980 240 L1200 330 L1440 250 L1440 400 Z" />
          </g>
        )}
        {variant === "projects" && (
          <g stroke="#c2765a" strokeWidth="1" opacity="0.12" fill="none">
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={i} x1={i * 85} y1="0" x2={i * 85} y2="400" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 70} x2="1440" y2={i * 70} />
            ))}
          </g>
        )}
        {variant === "experience" && (
          <g stroke="#6e7b55" strokeWidth="2" opacity="0.13" fill="none">
            <path d="M0 330 Q360 300 720 330 Q1080 360 1440 320" />
            <path d="M0 370 Q360 340 720 370 Q1080 400 1440 360" />
          </g>
        )}
        {variant === "contact" && (
          <g fill="#3f7c75" opacity="0.16">
            <path d="M1180 400 V210 L1196 210 L1204 400 Z" />
            <path d="M1176 210 Q1200 186 1224 210 Z" />
          </g>
        )}
      </svg>

      {/* The paper grain ties every chapter to the same hand-made sheet.
          `.grain-inline`, not `.paper-grain`: the latter is `position: fixed`,
          and a fixed element inside the pager's translated track resolves
          against the TRACK — so each chapter was laying down a grain layer eight
          screens wide, in multiply blend, and stacking eight of them. */}
      <div className="grain-inline" style={{ opacity: 0.07 }} />
    </div>
  );
}

function gradient(variant: SectionId): string {
  switch (variant) {
    case "education":
      return "linear-gradient(180deg, var(--color-sky-top) 0%, color-mix(in oklab, var(--color-ochre) 12%, var(--color-paper)) 60%, color-mix(in oklab, var(--color-ochre) 20%, var(--color-paper)) 100%)";
    case "research":
      return "linear-gradient(180deg, var(--color-sky-top) 0%, color-mix(in oklab, var(--color-teal-ink) 10%, var(--color-paper)) 55%, color-mix(in oklab, var(--color-sea-2) 60%, var(--color-paper)) 100%)";
    case "projects":
      return "linear-gradient(180deg, var(--color-sky-top) 0%, var(--color-paper) 55%, color-mix(in oklab, var(--color-terracotta) 12%, var(--color-paper)) 100%)";
    case "experience":
      return "linear-gradient(180deg, var(--color-sky-top) 0%, color-mix(in oklab, var(--color-sage) 12%, var(--color-paper)) 100%)";
    case "gallery":
      return "linear-gradient(180deg, var(--color-sky-top) 0%, color-mix(in oklab, var(--color-ochre) 9%, var(--color-paper)) 55%, color-mix(in oklab, var(--color-ochre) 15%, var(--color-paper)) 100%)";
    case "games":
      return "linear-gradient(180deg, var(--color-sky-top) 0%, color-mix(in oklab, var(--color-indigo-ink) 9%, var(--color-paper)) 60%, color-mix(in oklab, var(--color-indigo-ink) 15%, var(--color-paper)) 100%)";
    case "contact":
      return "linear-gradient(180deg, color-mix(in oklab, var(--color-sun) 30%, var(--color-sky-top)) 0%, color-mix(in oklab, var(--color-terracotta) 14%, var(--color-paper)) 46%, color-mix(in oklab, var(--color-sea-3) 55%, var(--color-paper)) 100%)";
    default:
      return "linear-gradient(180deg, var(--color-sky-top) 0%, var(--color-sky-low) 100%)";
  }
}
