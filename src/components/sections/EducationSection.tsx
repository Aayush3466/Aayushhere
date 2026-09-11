"use client";

import type { Education } from "@/lib/types";
import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { Pill, LinkList } from "./ui";
import { Reveal } from "@/components/ui/Reveal";
import { Disclosure, Teaser } from "@/components/ui/Expandable";
import { CARD_BULLETS, FullDetail, Highlights, Metrics, hasHiddenDetail } from "./enrichment";
import { TajMahal, OdishaTemple, DharaharaScene, ScholarScene } from "@/components/world/places";

/**
 * Which skyline to draw for a place.
 *
 * This used to also return a hardcoded PARAGRAPH about the entry — an
 * India-or-else branch that would have written "school in the Kathmandu valley"
 * underneath a degree earned anywhere in the world the moment a third entry was
 * added. Prose about someone's education has to come from the record; the note
 * is `e.note` now, editable in the Studio like everything else a visitor reads.
 *
 * The artwork still has to choose, but it chooses honestly: a recognised place
 * gets its own landmark, and anywhere unrecognised gets the neutral scene rather
 * than a confidently wrong one.
 */
type Scene = "india" | "nepal" | "generic";

function sceneFor(e: Education): Scene {
  const where = `${e.location ?? ""} ${e.institution ?? ""}`.toLowerCase();
  if (where.includes("india") || where.includes("odisha")) return "india";
  if (where.includes("nepal") || where.includes("kathmandu")) return "nepal";
  return "generic";
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
      background={<ChapterBackdrop variant="education" active={active} />}
    >
      <div className="space-y-16 sm:space-y-24">
        {entries.map((e, i) => {
          const scene = sceneFor(e);
          return (
            <Reveal key={e.id}>
            <article className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
              {/* artwork */}
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                {/* `overflow-hidden` matters: the scenes deliberately paint a
                    soft glow outside their viewBox, and without a clipping frame
                    that glow — and, at the md breakpoint, the artwork itself —
                    spilled past the column and read as a plate cut off at the
                    right. */}
                <div
                  className="relative flex min-h-[220px] items-end justify-center overflow-hidden rounded-[var(--radius-panel)] px-5 pb-6 pt-11 sm:min-h-[250px]"
                  style={{
                    background:
                      "radial-gradient(120% 100% at 50% 20%, color-mix(in oklab, var(--color-sun) 40%, var(--color-paper-panel)), var(--color-paper-panel))",
                    border: "1px solid var(--color-paper-edge)",
                  }}
                >
                  {scene === "india" && (
                    <div className="flex w-full max-w-[360px] items-end justify-center gap-3">
                      <div className="min-w-0 basis-[33%]">
                        <OdishaTemple size={120} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <TajMahal size={232} />
                      </div>
                    </div>
                  )}
                  {scene === "nepal" && (
                    <div className="w-full max-w-[290px]">
                      <DharaharaScene size={290} />
                    </div>
                  )}
                  {scene === "generic" && (
                    <div className="w-full max-w-[260px]">
                      <ScholarScene />
                    </div>
                  )}
                  {e.location && (
                    <span className="hand absolute left-4 top-3 text-xl text-ink-soft">
                      {e.location}
                    </span>
                  )}
                </div>
              </div>

              {/* details */}
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                {/* The note is short as written today, so it shows in full and
                    the card stays unclickable — the affordance and the sheet
                    only appear if it ever outgrows a sentence. */}
                <Disclosure
                  plate
                  accent={DEF.accent}
                  text={e.note}
                  expandable={hasHiddenDetail(e)}
                  title={e.degree}
                  meta={[e.institution, e.location, e.dates].filter(Boolean).join("  ·  ")}
                  detail={
                    <FullDetail record={e} accent={DEF.accent}>
                      {e.links && e.links.length > 0 && (
                        <LinkList links={e.links} accent={DEF.accent} />
                      )}
                    </FullDetail>
                  }
                >
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
                  <Teaser className="mt-4 leading-relaxed text-ink-soft" />
                  <Metrics items={e.metrics} accent={DEF.accent} />
                  <Highlights items={e.highlights} accent={DEF.accent} limit={CARD_BULLETS} />
                  {e.links && e.links.length > 0 && (
                    <LinkList links={e.links} accent={DEF.accent} />
                  )}
                </Disclosure>
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
