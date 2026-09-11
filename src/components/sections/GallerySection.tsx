"use client";

import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { cn } from "@/lib/utils";

const TILT = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.2];

/** A brass drawing pin, pushed through the top of a plate. */
function Pin() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      aria-hidden
      className="absolute -top-2 left-1/2 z-10 -translate-x-1/2"
      style={{ filter: "drop-shadow(0 2px 2px rgba(58,46,26,0.35))" }}
    >
      <circle cx="11" cy="9" r="6" fill="#c0883c" />
      <circle cx="9" cy="7" r="2.2" fill="#e6c489" opacity="0.85" />
      <path d="M11 14 L11 19" stroke="#8a6a3a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function GallerySection({ active }: { active: boolean }) {
  // Chapter copy, live-editable from the Studio.
  const DEF = useSectionDef("gallery");
  const { gallery } = useContent();
  const sorted = [...gallery].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return (
    <SectionShell
      active={active}
      accent={DEF.accent}
      eyebrow={DEF.eyebrow}
      title={DEF.title}
      subtitle={DEF.subtitle}
      background={<ChapterBackdrop variant="gallery" active={active} />}
    >
      {sorted.length === 0 ? (
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="paper-panel relative h-24 w-20"
                style={{ transform: `rotate(${TILT[i]}deg)` }}
              >
                <Pin />
              </div>
            ))}
          </div>
          <p className="text-ink-soft">
            The wall is bare. Pin your first sketches, result figures and photos
            from the Studio — they appear here beautifully placed, automatically.
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {sorted.map((g, i) => (
            <figure
              key={g.id}
              className={cn("paper-panel lift relative break-inside-avoid p-2", i % 2 ? "tip-r" : "tip-l")}
              style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}
            >
              {/* The chapter is called the sketch wall and the copy says
                  "pinned to the chart" — so the plates should be pinned. This is
                  the cheapest possible way to make a rotated rectangle read as a
                  physical thing on a board. */}
              <Pin />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.imageUrl}
                alt={g.caption ?? "Gallery image"}
                className="w-full rounded-[8px] object-cover"
                loading="lazy"
              />
              {g.caption && (
                <figcaption className="hand px-1 pb-1 pt-2 text-lg text-ink-soft">
                  {g.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
