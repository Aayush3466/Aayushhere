"use client";

import { RESEARCH_REGIONS } from "@/lib/map/regions";
import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { Plate, Pill, LinkList } from "./ui";
import { Reveal } from "@/components/ui/Reveal";
import { Landmark } from "@/components/world/Landmark";

const STATUS: Record<string, string> = {
  published: "Published",
  "under-review": "Under review",
  submitted: "Submitted",
  manuscript: "Manuscript",
};

export function ResearchSection({ active }: { active: boolean }) {
  // Chapter copy, live-editable from the Studio.
  const DEF = useSectionDef("research");
  const content = useContent();
  return (
    <SectionShell
      active={active}
      accent={DEF.accent}
      eyebrow={DEF.eyebrow}
      title={DEF.title}
      subtitle={DEF.subtitle}
      background={<ChapterBackdrop variant="research" />}
    >
      <div className="space-y-16">
        {RESEARCH_REGIONS.map((region) => {
          const pubs = content.publications.filter((p) => p.region === region.key);
          const projs = content.projects.filter((p) => p.region === region.key);
          if (pubs.length === 0 && projs.length === 0) return null;

          return (
            <Reveal key={region.key}>
            <section>
              <div className="mb-6 flex items-center gap-4">
                <Landmark region={region.key} size={78} />
                <div>
                  <h3 className="text-2xl" style={{ color: region.accent }}>
                    {region.name}
                  </h3>
                  <p className="hand text-lg text-ink-soft">{region.blurb}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {pubs.map((p) => (
                  <Plate key={p.id} accent={region.accent} className="card-hover">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-display text-lg font-semibold leading-snug">
                        {p.title}
                      </h4>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {p.status && <Pill accent={region.accent}>{STATUS[p.status]}</Pill>}
                      {p.date && <span className="hand text-lg text-ink-faint">{p.date}</span>}
                    </div>
                    {p.venue && <p className="mt-2 text-sm italic text-ink-soft">{p.venue}</p>}
                    {p.authors && p.authors.length > 0 && (
                      <p className="mt-1 text-sm text-ink-faint">{p.authors.join(", ")}</p>
                    )}
                    {p.abstract && (
                      <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">
                        {p.abstract}
                      </p>
                    )}
                    <LinkList links={p.links} accent={region.accent} />
                  </Plate>
                ))}

                {projs.map((p) => (
                  <Plate key={p.id} accent={region.accent} className="card-hover">
                    <h4 className="font-display text-lg font-semibold leading-snug">
                      {p.title}
                    </h4>
                    <div className="mt-2">
                      <Pill accent={region.accent}>Research project</Pill>
                    </div>
                    {p.description && (
                      <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">
                        {p.description}
                      </p>
                    )}
                    <LinkList
                      links={[
                        ...(p.liveUrl ? [{ label: "Live", url: p.liveUrl }] : []),
                        ...(p.repoUrl ? [{ label: "Code", url: p.repoUrl }] : []),
                      ]}
                      accent={region.accent}
                    />
                  </Plate>
                ))}
              </div>
            </section>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
