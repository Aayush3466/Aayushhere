"use client";

import type { Project } from "@/lib/types";
import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { Pill, TechChips, LinkList } from "./ui";
import { Reveal } from "@/components/ui/Reveal";

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
    <div className="overflow-hidden rounded-xl border border-[color:var(--color-paper-edge)] shadow-[0_18px_40px_-24px_rgba(58,46,26,0.5)]">
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
      background={<ChapterBackdrop variant="projects" />}
    >
      <div className="grid gap-10 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 0.08} className="flex">
            <article className="card-hover flex w-full flex-col rounded-2xl p-1">
            <BrowserFrame project={p} />
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <Pill accent={DEF.accent}>{TYPE_LABEL[p.type] ?? p.type}</Pill>
                {p.date && <span className="hand text-lg text-ink-faint">{p.date}</span>}
              </div>
              {(p.summary || p.description) && (
                <p className="mt-2 leading-relaxed text-ink-soft">
                  {p.description ?? p.summary}
                </p>
              )}
              {p.tech && <TechChips items={p.tech} accent={DEF.accent} />}
              <LinkList
                links={[
                  ...(p.liveUrl ? [{ label: "Visit live", url: p.liveUrl }] : []),
                  ...(p.repoUrl ? [{ label: "Source", url: p.repoUrl }] : []),
                ]}
                accent={DEF.accent}
              />
            </div>
            </article>
          </Reveal>
        ))}
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
