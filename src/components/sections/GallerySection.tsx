"use client";

import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";

const TILT = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.2];

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
      background={<ChapterBackdrop variant="gallery" />}
    >
      {sorted.length === 0 ? (
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="paper-panel h-24 w-20"
                style={{ transform: `rotate(${TILT[i]}deg)` }}
              />
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
              className="paper-panel break-inside-avoid overflow-hidden p-2"
              style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}
            >
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
