"use client";

import type { Project } from "@/lib/types";
import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { Pill, TechChips, LinkList } from "./ui";
import { Reveal } from "@/components/ui/Reveal";
import { Disclosure, Teaser } from "@/components/ui/Expandable";
import { CARD_BULLETS, FullDetail, Highlights, Metrics, hasHiddenDetail } from "./enrichment";

const TYPE_LABEL: Record<string, string> = {
  website: "Website",
  app: "Application",
  "research-project": "Research project",
};

/** A framed browser-window preview — real OG thumbnail when present, an honest
 *  drawn placeholder when not (the studio's link-preview fills these later). */
function BrowserFrame({ project }: { project: Project }) {
  const host = project.liveUrl
    ? project.liveUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    : "preview";
  return (
    <div className="overflow-hidden rounded-[10px] border border-[color:color-mix(in_oklab,var(--color-paper-edge)_70%,transparent)] shadow-[0_14px_32px_-22px_rgba(58,46,26,0.45)]">
      <div className="flex items-center gap-2 border-b border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper-deep)] px-3 py-2">
        <span className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#c2765a" }} />
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#c0883c" }} />
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#6e7b55" }} />
        </span>
        <span className="mx-auto max-w-[70%] truncate rounded-[var(--radius-pill)] bg-[color:var(--color-paper-panel)] px-3 py-0.5 text-xs text-ink-faint">
          {host}
        </span>
      </div>
      <div className="relative aspect-[16/10] bg-[color:var(--color-paper-panel)]">
        {project.previewImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.previewImage}
            alt={`${project.title} preview`}
            className="h-full w-full object-cover"
          />
        ) : (
          <PreviewPlaceholder />
        )}
      </div>
    </div>
  );
}

function PreviewPlaceholder() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 200 130" className="h-full w-full opacity-60" aria-hidden>
        <g stroke="var(--color-paper-edge)" strokeWidth="2" fill="none">
          <rect x="18" y="20" width="90" height="10" rx="3" />
          <rect x="18" y="40" width="164" height="6" rx="3" />
          <rect x="18" y="54" width="150" height="6" rx="3" />
          <rect x="18" y="72" width="70" height="42" rx="4" />
          <rect x="98" y="72" width="84" height="42" rx="4" />
        </g>
      </svg>
      <span className="hand absolute bottom-2 right-3 text-lg text-ink-faint">
        preview to come
      </span>
    </div>
  );
}

export function ProjectsSection({ active }: { active: boolean }) {
  // Chapter copy, live-editable from the Studio.
  const DEF = useSectionDef("projects");
  const content = useContent();
  const projects = [...content.projects].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );

  return (
    <SectionShell
      active={active}
      accent={DEF.accent}
      eyebrow={DEF.eyebrow}
      title={DEF.title}
      subtitle={DEF.subtitle}
      background={<ChapterBackdrop variant="projects" active={active} />}
    >
      <div className="grid gap-8 sm:gap-10 md:grid-cols-2">
        {projects.map((p, i) => {
          const links = [
            ...(p.liveUrl ? [{ label: "Visit live", url: p.liveUrl }] : []),
            ...(p.repoUrl ? [{ label: "Source", url: p.repoUrl }] : []),
          ];
          return (
          <Reveal key={p.id} delay={(i % 2) * 0.08} className="flex">
            {/* The preview used to sit flush inside a bare `p-1` wrapper, so the
                frame's border ran hard against the card's own edge and the whole
                grid read as cramped. It is a paper plate now, with the preview
                inset in it the way a print would be mounted — and the whole
                plate, preview included, opens the detail. */}
            <Disclosure
              as="article"
              className="paper-panel card-hover flex w-full flex-col p-4 sm:p-5"
              accent={DEF.accent}
              text={p.description ?? p.summary}
              expandable={hasHiddenDetail(p)}
              title={p.title}
              cta="See the detail"
              meta={[TYPE_LABEL[p.type] ?? p.type, p.date].filter(Boolean).join("  ·  ")}
              detail={
                <FullDetail record={p} accent={DEF.accent}>
                  {p.tech && <TechChips items={p.tech} accent={DEF.accent} />}
                  <LinkList links={links} accent={DEF.accent} />
                </FullDetail>
              }
            >
            <BrowserFrame project={p} />
            <div className="mt-5 px-0.5 pb-0.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <Pill accent={DEF.accent}>{TYPE_LABEL[p.type] ?? p.type}</Pill>
                {p.date && <span className="hand text-lg text-ink-faint">{p.date}</span>}
              </div>
              <Teaser className="mt-2 leading-relaxed text-ink-soft" />
              <Metrics items={p.metrics} accent={DEF.accent} />
              <Highlights items={p.highlights} accent={DEF.accent} limit={CARD_BULLETS} />
              {/* Five chips on the card, the full stack in the sheet — a tile
                  that lists twelve technologies is a wall, not a summary. */}
              {p.tech && <TechChips items={p.tech.slice(0, 5)} accent={DEF.accent} />}
              <LinkList links={links} accent={DEF.accent} />
            </div>
            </Disclosure>
          </Reveal>
          );
        })}
      </div>

      {projects.length === 0 && (
        <p className="text-center text-ink-faint">
          No projects yet — add websites & apps from the studio and their previews
          appear here automatically.
        </p>
      )}
    </SectionShell>
  );
}
