"use client";

import type { Education } from "@/lib/types";
import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { Plate, Pill, LinkList } from "./ui";
import { Reveal } from "@/components/ui/Reveal";
import { TajMahal, OdishaTemple, DharaharaScene } from "@/components/world/places";

/** Presentational framing per place — the records stay the source of truth. */
function framing(e: Education): { place: string; note: string } {
  if (/india/i.test(e.location ?? "")) {
    return {
      place: "Odisha, India",
      note: "Four years across the border on a fully-funded COMPEX scholarship — where the research began.",
    };
  }
  return {
    place: "Kathmandu, Nepal",
    note: "Home ground — school in the Kathmandu valley, beneath Dharahara and the hills.",
  };
}

export function EducationSection({ active }: { active: boolean }) {
  // Chapter copy, live-editable from the Studio.
  const DEF = useSectionDef("education");
  const content = useContent();
  const entries = [...content.education].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );

  return (
    <SectionShell
      active={active}
      accent={DEF.accent}
      eyebrow={DEF.eyebrow}
      title={DEF.title}
      subtitle={DEF.subtitle}
      background={<ChapterBackdrop variant="education" />}
    >
      <div className="space-y-16 sm:space-y-24">
        {entries.map((e, i) => {
          const india = /india/i.test(e.location ?? "");
          const f = framing(e);
          return (
            <Reveal key={e.id}>
            <article className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
              {/* artwork */}
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <div
                  className="relative flex min-h-[240px] items-end justify-center rounded-[var(--radius-panel)] px-4 pb-6 pt-10"
                  style={{
                    background:
                      "radial-gradient(120% 100% at 50% 20%, color-mix(in oklab, var(--color-sun) 40%, var(--color-paper-panel)), var(--color-paper-panel))",
                    border: "1px solid var(--color-paper-edge)",
                  }}
                >
                  {india ? (
                    <div className="flex items-end gap-3">
                      <OdishaTemple size={116} />
                      <TajMahal size={230} />
                    </div>
                  ) : (
                    <DharaharaScene size={260} />
                  )}
                  <span className="hand absolute left-4 top-3 text-xl text-ink-soft">
                    {f.place}
                  </span>
                </div>
              </div>

              {/* details */}
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <Plate accent={DEF.accent}>
                  <h3 className="text-2xl leading-snug">{e.degree}</h3>
                  <p className="mt-1 text-lg text-ink-soft">{e.institution}</p>
                  <p className="hand mt-1 text-lg text-ink-faint">
                    {[e.location, e.dates].filter(Boolean).join("  ·  ")}
                  </p>
                  {e.detail && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {e.detail.split("·").map((d) => (
                        <Pill key={d} accent={DEF.accent}>
                          {d.trim()}
                        </Pill>
                      ))}
                    </div>
                  )}
                  <p className="mt-4 leading-relaxed text-ink-soft">{f.note}</p>
                  {e.links && e.links.length > 0 && (
                    <LinkList links={e.links} accent={DEF.accent} />
                  )}
                </Plate>
              </div>
            </article>
            </Reveal>
          );
        })}

        {entries.length === 0 && (
          <p className="text-center text-ink-faint">
            No education recorded yet — add entries from the studio.
          </p>
        )}
      </div>
    </SectionShell>
  );
}
