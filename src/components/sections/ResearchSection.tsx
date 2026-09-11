"use client";

import { useMemo } from "react";
import { RESEARCH_REGIONS, getRegion } from "@/lib/map/regions";
import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { Pill, LinkList } from "./ui";
import { Reveal } from "@/components/ui/Reveal";
import { Disclosure, Teaser } from "@/components/ui/Expandable";
import { CARD_BULLETS, FullDetail, Highlights, Metrics, hasHiddenDetail } from "./enrichment";
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

  /**
   * Every publication lands SOMEWHERE.
   *
   * The Studio's Region select offers all eight regions, but only four of them
   * are research territory — so a paper filed under "Kathmandu" or "The
   * Horizon" used to render nowhere at all. No error, no warning: you saved it,
   * and the site quietly dropped it. Anything that falls outside the research
   * regions now collects in a final group rather than disappearing.
   */
  const shown = useMemo(() => {
    const claimed = new Set<string>();
    const groups = RESEARCH_REGIONS.map((region) => {
      const pubs = content.publications.filter((p) => p.region === region.key);
      const projs = content.projects.filter((p) => p.region === region.key);
      pubs.forEach((p) => claimed.add(p.id));
      return { region, pubs, projs };
    }).filter((g) => g.pubs.length > 0 || g.projs.length > 0);

    const orphans = content.publications.filter((p) => !claimed.has(p.id));
    if (orphans.length > 0) {
      groups.push({
        // A real region key, so the landmark and ink still resolve — the
        // Horizon is the honest home for work that hasn't been given a
        // territory yet.
        region: {
          ...getRegion("horizon"),
          name: "Further work",
          blurb: "papers not yet filed to a research territory",
        },
        pubs: orphans,
        projs: [],
      });
    }
    return groups;
  }, [content.publications, content.projects]);

  return (
    <SectionShell
      active={active}
      accent={DEF.accent}
      eyebrow={DEF.eyebrow}
      title={DEF.title}
      subtitle={DEF.subtitle}
      background={<ChapterBackdrop variant="research" active={active} />}
    >
      <div className="space-y-16">
        {shown.map(({ region, pubs, projs }) => {

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
                  <Disclosure
                    key={p.id}
                    plate
                    accent={region.accent}
                    className="card-hover"
                    text={p.abstract}
                    expandable={hasHiddenDetail(p)}
                    title={p.title}
                    cta="Read the abstract"
                    meta={
                      <>
                        {[p.venue, p.date].filter(Boolean).join("  ·  ")}
                        {p.authors && p.authors.length > 0 && (
                          <span className="mt-1 block">{p.authors.join(", ")}</span>
                        )}
                      </>
                    }
                    detail={
                      <FullDetail record={p} accent={region.accent}>
                        <LinkList links={p.links} accent={region.accent} />
                      </FullDetail>
                    }
                  >
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
                    {/* The author list is reference material, not a reason to
                        read the paper — it belongs in the sheet, not the tile. */}
                    <Teaser className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft" />
                    <Metrics items={p.metrics} accent={region.accent} />
                    <Highlights items={p.highlights} accent={region.accent} limit={CARD_BULLETS} />
                    <LinkList links={p.links} accent={region.accent} />
                  </Disclosure>
                ))}

                {projs.map((p) => {
                  const links = [
                    ...(p.liveUrl ? [{ label: "Live", url: p.liveUrl }] : []),
                    ...(p.repoUrl ? [{ label: "Code", url: p.repoUrl }] : []),
                  ];
                  return (
                    <Disclosure
                      key={p.id}
                      plate
                      accent={region.accent}
                      className="card-hover"
                      text={p.description}
                      expandable={hasHiddenDetail(p)}
                      title={p.title}
                      cta="See the detail"
                      meta="Research project"
                      detail={
                        <FullDetail record={p} accent={region.accent}>
                          <LinkList links={links} accent={region.accent} />
                        </FullDetail>
                      }
                    >
                      <h4 className="font-display text-lg font-semibold leading-snug">
                        {p.title}
                      </h4>
                      <div className="mt-2">
                        <Pill accent={region.accent}>Research project</Pill>
                      </div>
                      <Teaser className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft" />
                      <Metrics items={p.metrics} accent={region.accent} />
                      <Highlights items={p.highlights} accent={region.accent} limit={CARD_BULLETS} />
                      <LinkList links={links} accent={region.accent} />
                    </Disclosure>
                  );
                })}
              </div>
            </section>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
