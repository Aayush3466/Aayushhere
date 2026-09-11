"use client";

import { useState } from "react";
import { useStudio } from "@/lib/store/studio-store";
import type { CollectionDef, FieldSpec } from "./schema";
import {
  Field,
  ImageField,
  ImagesField,
  LinksField,
  SelectField,
  TagsField,
  TextArea,
  TextField,
  Toggle,
  UrlField,
  ListField,
  MetricsField,
  MilestonesField,
} from "./fields";
import { cn } from "@/lib/utils";

type Rec = Record<string, unknown>;

/**
 * One collection, rendered entirely from its schema: a list you can reorder,
 * each row opening into a two-column form. Nothing here knows what a
 * publication or a project is — that lives in `schema.ts`.
 */
export function CollectionPanel({ def }: { def: CollectionDef }) {
  const store = useStudio();
  const items = (store.content[def.key] as unknown as Rec[]) ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? items.filter((it) =>
        JSON.stringify(it).toLowerCase().includes(query.trim().toLowerCase()),
      )
    : items;

  function add() {
    const item = def.empty();
    store.addItem(def.key, item as { id: string });
    setOpenId(item.id as string);
  }

  return (
    <section>
      <header className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">{def.label}</h2>
            <p className="mt-0.5 text-sm text-ink-faint">{def.blurb}</p>
          </div>
          <button
            onClick={add}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[color:var(--color-paper-panel)] transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--color-teal-ink)" }}
          >
            + {def.addLabel}
          </button>
        </div>

        {items.length > 4 && (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${def.label.toLowerCase()}…`}
            className="mt-4 w-full max-w-xs rounded-lg border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper-panel)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--color-teal-ink)]"
          />
        )}
      </header>

      {filtered.length === 0 && (
        <p className="paper-panel-soft px-5 py-8 text-center text-ink-faint">
          {items.length === 0
            ? `Nothing here yet — add your first ${def.singular}.`
            : "No matches."}
        </p>
      )}

      <ul className="space-y-2.5">
        {filtered.map((item) => {
          const id = item.id as string;
          const open = openId === id;
          const index = items.findIndex((x) => x.id === id);
          const title = (item[def.titleKey] as string)?.trim();
          const subtitle = def.subtitleKey ? (item[def.subtitleKey] as string) : "";
          const thumb = def.thumbKey ? (item[def.thumbKey] as string) : "";

          return (
            <li key={id} className="paper-panel overflow-hidden">
              <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
                {def.thumbKey && (
                  <div
                    className="hidden h-11 w-16 shrink-0 overflow-hidden rounded border border-[color:var(--color-paper-edge)] sm:block"
                    style={{ background: "var(--color-paper-deep)" }}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full place-items-center text-xs text-ink-faint">
                        —
                      </span>
                    )}
                  </div>
                )}

                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setOpenId(open ? null : id)}
                  aria-expanded={open}
                >
                  <span className="line-clamp-1 font-display font-semibold">
                    {title || <span className="text-ink-faint">(untitled)</span>}
                  </span>
                  {subtitle && (
                    <span className="line-clamp-1 text-sm text-ink-faint">{subtitle}</span>
                  )}
                </button>

                <div className="flex shrink-0 items-center gap-0.5">
                  <IconBtn
                    label="Move up"
                    disabled={index <= 0 || !!query}
                    onClick={() => store.moveItem(def.key, id, -1)}
                  >
                    ↑
                  </IconBtn>
                  <IconBtn
                    label="Move down"
                    disabled={index >= items.length - 1 || !!query}
                    onClick={() => store.moveItem(def.key, id, 1)}
                  >
                    ↓
                  </IconBtn>
                  <button
                    onClick={() => setOpenId(open ? null : id)}
                    className="rounded px-2.5 py-1 text-sm text-ink-soft transition-colors hover:bg-[color:var(--color-paper-deep)]"
                  >
                    {open ? "Done" : "Edit"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete “${title || "this entry"}”? This cannot be undone.`))
                        store.removeItem(def.key, id);
                    }}
                    className="rounded px-2 py-1 text-sm transition-colors hover:bg-[color:var(--color-paper-deep)]"
                    style={{ color: "var(--color-terracotta)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {open && (
                <div className="grid gap-4 border-t border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper)] px-4 py-5 sm:grid-cols-2">
                  {def.fields.map((f) => (
                    <FieldRenderer
                      key={f.key}
                      spec={f}
                      record={item}
                      onChange={(v) => store.updateItem(def.key, id, { [f.key]: v })}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function IconBtn({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="rounded px-1.5 py-1 text-ink-faint transition-colors hover:bg-[color:var(--color-paper-deep)] hover:text-ink disabled:pointer-events-none disabled:opacity-25"
    >
      {children}
    </button>
  );
}

/** Maps a schema field type onto the field kit. */
export function FieldRenderer({
  spec,
  record,
  onChange,
}: {
  spec: FieldSpec;
  record: Rec;
  onChange: (v: unknown) => void;
}) {
  const value = record[spec.key];

  const control = (() => {
    switch (spec.type) {
      case "textarea":
        return <TextArea value={value as string} onChange={onChange} placeholder={spec.placeholder} />;
      case "url":
        return <UrlField value={value as string} onChange={onChange} placeholder={spec.placeholder} />;
      case "select":
        return <SelectField value={value as string} onChange={onChange} options={spec.options ?? []} />;
      case "bool":
        return (
          <Toggle
            value={Boolean(value)}
            onChange={onChange}
            label={value ? "Yes — still running" : "No"}
          />
        );
      case "tags":
        return <TagsField value={(value as string[]) ?? []} onChange={onChange} />;
      case "links":
        return <LinksField value={(value as never) ?? []} onChange={onChange} />;
      case "image":
        return (
          <ImageField
            value={value as string}
            onChange={onChange}
            folder={spec.folder}
            liveUrl={spec.previewFrom ? ((record[spec.previewFrom] as string) ?? "") : undefined}
          />
        );
      case "images":
        return <ImagesField value={(value as never) ?? []} onChange={onChange} folder={spec.folder} />;
      case "list":
        return <ListField value={(value as string[]) ?? []} onChange={onChange} placeholder={spec.placeholder} />;
      case "metrics":
        return <MetricsField value={(value as never) ?? []} onChange={onChange} />;
      case "milestones":
        return <MilestonesField value={(value as never) ?? []} onChange={onChange} />;
      default:
        return <TextField value={value as string} onChange={onChange} placeholder={spec.placeholder} />;
    }
  })();

  // A toggle reads as a statement, not a labelled box, so it renders bare.
  if (spec.type === "bool") {
    return (
      <div className={cn("flex items-end pb-1", spec.wide && "sm:col-span-2")}>{control}</div>
    );
  }

  return (
    <Field label={spec.label} hint={spec.hint} className={cn(spec.wide && "sm:col-span-2")}>
      {control}
    </Field>
  );
}
