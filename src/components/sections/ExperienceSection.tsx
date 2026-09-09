"use client";

import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { Plate, Pill, LinkList } from "./ui";
import { Reveal } from "@/components/ui/Reveal";

export function ExperienceSection({ active }: { active: boolean }) {
  // Chapter copy, live-editable from the Studio.
  const DEF = useSectionDef("experience");
  const content = useContent();
  const roles = [...content.experience].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );

  return (
    <SectionShell
      active={active}
      accent={DEF.accent}
      eyebrow={DEF.eyebrow}
      title={DEF.title}
      subtitle={DEF.subtitle}
      background={<ChapterBackdrop variant="experience" />}
    >
      <ol className="relative mx-auto max-w-2xl">
        <span
          aria-hidden
          className="absolute bottom-6 left-[13px] top-6 w-px border-l-2 border-dotted"
          style={{ borderColor: `color-mix(in oklab, ${DEF.accent} 55%, transparent)` }}
        />
        {roles.map((x) => (
          <li key={x.id} className="relative flex gap-6 pb-10 last:pb-0">
            <span
              className="relative z-10 mt-2 h-7 w-7 shrink-0 rounded-full"
              style={{ background: "var(--color-paper-panel)", boxShadow: `0 0 0 2px ${DEF.accent}` }}
            >
              <span
                className="absolute inset-[7px] rounded-full"
                style={{ background: DEF.accent, opacity: x.ongoing ? 1 : 0.35 }}
              />
            </span>
            <Reveal className="flex-1">
            <Plate accent={DEF.accent} className="card-hover w-full">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-xl font-semibold">{x.role}</h3>
                {x.ongoing && <Pill accent={DEF.accent}>Ongoing</Pill>}
              </div>
              <p className="mt-1 text-lg text-ink-soft">{x.org}</p>
              <p className="hand mt-1 text-lg text-ink-faint">
                {[x.startDate, x.ongoing ? "present" : x.endDate]
                  .filter(Boolean)
                  .join("  –  ")}
              </p>
              {x.summary && (
                <p className="mt-3 leading-relaxed text-ink-soft">{x.summary}</p>
              )}
              {x.links && x.links.length > 0 && (
                <LinkList links={x.links} accent={DEF.accent} />
              )}
            </Plate>
            </Reveal>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
