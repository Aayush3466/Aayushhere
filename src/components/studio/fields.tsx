"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LinkRef, Metric, Milestone, SkillGroup } from "@/lib/types";
import { uploadMedia } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

/**
 * THE FIELD KIT
 * -------------
 * Every editable field on the site is one of these. They share a look, a label
 * treatment and a focus ring, so a form assembled from them is coherent without
 * anyone styling a form.
 */

export const inputCls =
  "w-full rounded-lg border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper-panel)] px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint/60 focus:border-[color:var(--color-teal-ink)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--color-teal-ink)_22%,transparent)]";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </span>
        {hint && <span className="text-[0.7rem] text-ink-faint/80">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/* ---------------------------------- text ---------------------------------- */

export function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      className={inputCls}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Grows with its content, so long abstracts never live in a 3-line porthole. */
export function TextArea({
  value,
  onChange,
  placeholder,
  minRows = 3,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      className={cn(inputCls, "resize-none leading-relaxed")}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function UrlField({
  value,
  onChange,
  placeholder = "https://…",
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const v = value ?? "";
  return (
    <div className="flex gap-2">
      <input
        type="url"
        className={inputCls}
        value={v}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {v && (
        <a
          href={v}
          target="_blank"
          rel="noreferrer"
          title="Open in a new tab"
          className="shrink-0 rounded-lg border border-[color:var(--color-paper-edge)] px-3 py-2 text-sm transition-colors hover:bg-[color:var(--color-paper-deep)]"
          style={{ color: "var(--color-teal-ink)" }}
        >
          ↗
        </a>
      )}
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  options,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 text-sm text-ink-soft"
    >
      <span
        className="relative h-6 w-11 shrink-0 rounded-full border transition-colors"
        style={{
          background: value ? "var(--color-teal-ink)" : "var(--color-paper-deep)",
          borderColor: value ? "var(--color-teal-ink)" : "var(--color-paper-edge)",
        }}
      >
        <span
          className="absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform"
          style={{
            height: 18,
            width: 18,
            left: 3,
            transform: value ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </span>
      {label}
    </button>
  );
}

export function ColorField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const v = value || "#3f7c75";
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded-lg border border-[color:var(--color-paper-edge)] bg-transparent p-1"
        aria-label="Territory ink"
      />
      <input className={inputCls} value={v} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ---------------------------------- tags ---------------------------------- */

/**
 * Chips rather than a comma-separated string: the old field silently split on
 * every comma, so "Kathmandu, Nepal" became two tags and you could not tell
 * until it rendered on the public site.
 */
export function TagsField({
  value,
  onChange,
  placeholder = "Type and press Enter",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const items = value ?? [];

  function commit(raw?: string) {
    const t = (raw ?? draft).trim();
    if (!t) return;
    if (!items.some((x) => x.toLowerCase() === t.toLowerCase())) onChange([...items, t]);
    setDraft("");
  }

  return (
    <div
      className={cn(
        inputCls,
        "flex min-h-[2.6rem] flex-wrap items-center gap-1.5 py-1.5 focus-within:border-[color:var(--color-teal-ink)]",
      )}
    >
      {items.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2 py-0.5 text-xs"
          style={{
            color: "var(--color-teal-ink)",
            borderColor: "color-mix(in oklab, var(--color-teal-ink) 30%, transparent)",
            background: "color-mix(in oklab, var(--color-teal-ink) 10%, transparent)",
          }}
        >
          {t}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="opacity-60 transition-opacity hover:opacity-100"
            aria-label={`Remove ${t}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint/60"
        value={draft}
        placeholder={items.length ? "" : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && items.length) {
            onChange(items.slice(0, -1));
          }
        }}
        onBlur={() => commit()}
        // Pasting a list is the common case when moving text off a CV.
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (!/[,\n;]/.test(text)) return;
          e.preventDefault();
          const parts = text.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
          const merged = [...items];
          for (const p of parts) {
            if (!merged.some((x) => x.toLowerCase() === p.toLowerCase())) merged.push(p);
          }
          onChange(merged);
        }}
      />
    </div>
  );
}

/* --------------------------------- links ---------------------------------- */

export function LinksField({
  value,
  onChange,
}: {
  value: LinkRef[];
  onChange: (v: LinkRef[]) => void;
}) {
  const links = value ?? [];
  const set = (i: number, patch: Partial<LinkRef>) =>
    onChange(links.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-2">
      {links.map((l, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={cn(inputCls, "w-28 shrink-0")}
            placeholder="Paper"
            value={l.label}
            onChange={(e) => set(i, { label: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="https://…"
            value={l.url}
            onChange={(e) => set(i, { url: e.target.value })}
          />
          <button
            type="button"
            onClick={() => onChange(links.filter((_, j) => j !== i))}
            className="shrink-0 px-2 text-lg leading-none opacity-60 transition-opacity hover:opacity-100"
            style={{ color: "var(--color-terracotta)" }}
            aria-label="Remove link"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...links, { label: "", url: "" }])}
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-teal-ink)" }}
      >
        + add link
      </button>
    </div>
  );
}

/* --------------------------------- image ---------------------------------- */

/**
 * Paste a URL, drop a file, pick one, or pull the Open Graph image straight off
 * a project's live site. Uploads go to Supabase Storage and come back as a
 * permanent public URL — the old version base64'd files into the record, which
 * bloated every read of that row.
 */
export function ImageField({
  value,
  onChange,
  folder = "uploads",
  liveUrl,
  aspect = "16 / 9",
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  folder?: string;
  liveUrl?: string;
  aspect?: string;
}) {
  const [busy, setBusy] = useState<null | "upload" | "fetch">(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const url = value ?? "";

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy("upload");
    const res = await uploadMedia(file, folder);
    setBusy(null);
    if (res.ok && res.url) onChange(res.url);
    else setError(res.error ?? "Upload failed.");
  }

  async function autoFetch() {
    if (!liveUrl) return;
    setError(null);
    setBusy("fetch");
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(liveUrl)}`);
      const data = await res.json();
      if (data.image) onChange(data.image);
      else setError("That site doesn't publish a preview image.");
    } catch {
      setError("Couldn't reach that site.");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className="relative overflow-hidden rounded-lg border border-dashed transition-colors"
        style={{
          aspectRatio: url ? aspect : undefined,
          minHeight: url ? undefined : 104,
          borderColor: dragging ? "var(--color-teal-ink)" : "var(--color-paper-edge)",
          background: dragging
            ? "color-mix(in oklab, var(--color-teal-ink) 8%, var(--color-paper))"
            : "var(--color-paper)",
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center px-4 py-6 text-center text-sm text-ink-faint">
            {busy === "upload" ? "Uploading…" : "Drop an image here, or use the buttons below"}
          </div>
        )}

        {busy === "upload" && url && (
          <div className="absolute inset-0 grid place-items-center bg-[color:var(--color-paper)]/70 text-sm">
            Uploading…
          </div>
        )}
      </div>

      <input
        className={inputCls}
        placeholder="…or paste an image URL"
        value={url}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <label
          className="cursor-pointer underline underline-offset-4"
          style={{ color: "var(--color-teal-ink)" }}
        >
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0] ?? undefined)}
          />
        </label>

        {liveUrl !== undefined && (
          <button
            type="button"
            onClick={autoFetch}
            disabled={!liveUrl || busy !== null}
            className="underline underline-offset-4 disabled:opacity-40"
            style={{ color: "var(--color-teal-ink)" }}
          >
            {busy === "fetch" ? "fetching…" : "Fetch from live site"}
          </button>
        )}

        {url && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="underline underline-offset-4"
            style={{ color: "var(--color-terracotta)" }}
          >
            remove
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--color-terracotta)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* --------------------------------- file ----------------------------------- */

/** Same idea as ImageField, for the CV: any document, shown as a filename. */
export function FileField({
  value,
  onChange,
  folder = "documents",
  accept = ".pdf,application/pdf",
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  folder?: string;
  accept?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = value ?? "";
  const name = url ? decodeURIComponent(url.split("/").pop() ?? url) : "";

  return (
    <div className="space-y-2">
      {url && (
        <div className="flex items-center gap-2 rounded-lg border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper)] px-3 py-2 text-sm">
          <span aria-hidden>📄</span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate underline underline-offset-4"
            style={{ color: "var(--color-teal-ink)" }}
          >
            {name}
          </a>
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ color: "var(--color-terracotta)" }}
            aria-label="Remove file"
          >
            ×
          </button>
        </div>
      )}
      <input
        className={inputCls}
        placeholder="…or paste a URL"
        value={url}
        onChange={(e) => onChange(e.target.value)}
      />
      <label
        className="inline-block cursor-pointer text-sm underline underline-offset-4"
        style={{ color: "var(--color-teal-ink)" }}
      >
        {busy ? "Uploading…" : url ? "Replace file" : "Upload file"}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setError(null);
            setBusy(true);
            const res = await uploadMedia(file, folder);
            setBusy(false);
            if (res.ok && res.url) onChange(res.url);
            else setError(res.error ?? "Upload failed.");
          }}
        />
      </label>
      {error && (
        <p className="text-sm" style={{ color: "var(--color-terracotta)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------- images ---------------------------------- */

/** An ordered set of captioned figures — result plates on a publication. */
export function ImagesField({
  value,
  onChange,
  folder = "figures",
}: {
  value: { url: string; caption?: string }[];
  onChange: (v: { url: string; caption?: string }[]) => void;
  folder?: string;
}) {
  const images = value ?? [];

  return (
    <div className="space-y-3">
      {images.map((img, i) => (
        <div
          key={i}
          className="rounded-lg border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper)] p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-ink-faint">Figure {i + 1}</span>
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => {
                  const next = [...images];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChange(next);
                }}
                className="px-1 text-ink-faint disabled:opacity-30"
                aria-label="Move figure up"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={i === images.length - 1}
                onClick={() => {
                  const next = [...images];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  onChange(next);
                }}
                className="px-1 text-ink-faint disabled:opacity-30"
                aria-label="Move figure down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                style={{ color: "var(--color-terracotta)" }}
              >
                remove
              </button>
            </div>
          </div>

          <ImageField
            value={img.url}
            folder={folder}
            onChange={(url) => onChange(images.map((x, j) => (j === i ? { ...x, url } : x)))}
          />
          <input
            className={cn(inputCls, "mt-2")}
            placeholder="Caption (optional)"
            value={img.caption ?? ""}
            onChange={(e) =>
              onChange(images.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))
            }
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...images, { url: "", caption: "" }])}
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-teal-ink)" }}
      >
        + add a figure
      </button>
    </div>
  );
}

/* --------------------------------- skills --------------------------------- */

export function SkillsField({
  value,
  onChange,
}: {
  value: SkillGroup[];
  onChange: (v: SkillGroup[]) => void;
}) {
  const groups = value ?? [];
  const set = (i: number, patch: Partial<SkillGroup>) =>
    onChange(groups.map((g, j) => (j === i ? { ...g, ...patch } : g)));

  return (
    <div className="space-y-3">
      {groups.map((g, i) => (
        <div
          key={i}
          className="rounded-lg border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper)] p-3"
        >
          <div className="mb-2 flex gap-2">
            <input
              className={inputCls}
              placeholder="Group name — e.g. Machine Learning & AI"
              value={g.group}
              onChange={(e) => set(i, { group: e.target.value })}
            />
            <button
              type="button"
              onClick={() => onChange(groups.filter((_, j) => j !== i))}
              className="shrink-0 px-2 text-lg leading-none opacity-60 hover:opacity-100"
              style={{ color: "var(--color-terracotta)" }}
              aria-label="Remove group"
            >
              ×
            </button>
          </div>
          <TagsField value={g.items} onChange={(items) => set(i, { items })} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...groups, { group: "", items: [] }])}
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-teal-ink)" }}
      >
        + add a skill group
      </button>
    </div>
  );
}


/* ------------------------- the enrichment editors ------------------------- */

/**
 * A shared frame for the three repeatable list editors below: rows you can add,
 * reorder and delete, with one "add" affordance underneath. They look and behave
 * identically on purpose — once you have edited bullets you already know how to
 * edit metrics.
 */
function RowList({
  rows,
  onMove,
  onRemove,
  onAdd,
  addLabel,
  empty,
  children,
}: {
  rows: unknown[];
  onMove: (i: number, dir: -1 | 1) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
  addLabel: string;
  empty: string;
  children: (i: number) => ReactNode;
}) {
  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <p className="text-[0.78rem] italic text-ink-faint/80">{empty}</p>
      )}
      {rows.map((_, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <div className="flex flex-1 flex-wrap gap-2">{children(i)}</div>
          <div className="flex shrink-0 items-center">
            <RowBtn label="Move up" disabled={i === 0} onClick={() => onMove(i, -1)}>
              ↑
            </RowBtn>
            <RowBtn
              label="Move down"
              disabled={i === rows.length - 1}
              onClick={() => onMove(i, 1)}
            >
              ↓
            </RowBtn>
            <RowBtn label="Remove" danger onClick={() => onRemove(i)}>
              ×
            </RowBtn>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-teal-ink)" }}
      >
        + {addLabel}
      </button>
    </div>
  );
}

function RowBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-7 w-6 place-items-center text-base leading-none opacity-55 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
      style={{ color: danger ? "var(--color-terracotta)" : "var(--color-ink-soft)" }}
    >
      {children}
    </button>
  );
}

/** Generic list reorder used by all three editors. */
function moved<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/**
 * BULLETS. The single most useful field on the site — "what did you actually
 * do" is the question every reader is holding, and a paragraph answers it worse
 * than four lines do.
 *
 * Enter adds the next bullet, so writing a list never means reaching for the
 * mouse; backspace on an empty bullet removes it, the way every list editor
 * people already use behaves.
 */
export function ListField({
  value,
  onChange,
  placeholder = "Built X that did Y",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const rows = value ?? [];
  const set = (i: number, v: string) => onChange(rows.map((r, j) => (j === i ? v : r)));

  return (
    <RowList
      rows={rows}
      onMove={(i, d) => onChange(moved(rows, i, d))}
      onRemove={(i) => onChange(rows.filter((_, j) => j !== i))}
      onAdd={() => onChange([...rows, ""])}
      addLabel="add bullet"
      empty="No bullets yet — these show as a list on the card and in the detail sheet."
    >
      {(i) => (
        <input
          className={inputCls}
          placeholder={placeholder}
          value={rows[i]}
          autoFocus={rows[i] === "" && i === rows.length - 1}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onChange([...rows.slice(0, i + 1), "", ...rows.slice(i + 1)]);
            } else if (e.key === "Backspace" && rows[i] === "" && rows.length > 1) {
              e.preventDefault();
              onChange(rows.filter((_, j) => j !== i));
            }
          }}
        />
      )}
    </RowList>
  );
}

/** METRICS — the numbers that turn a claim into evidence. */
export function MetricsField({
  value,
  onChange,
}: {
  value: Metric[];
  onChange: (v: Metric[]) => void;
}) {
  const rows = value ?? [];
  const set = (i: number, patch: Partial<Metric>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <RowList
      rows={rows}
      onMove={(i, d) => onChange(moved(rows, i, d))}
      onRemove={(i) => onChange(rows.filter((_, j) => j !== i))}
      onAdd={() => onChange([...rows, { label: "", value: "" }])}
      addLabel="add metric"
      empty="No metrics yet — e.g. Accuracy / 98.2%, Dataset / 12k images."
    >
      {(i) => (
        <>
          <input
            className={cn(inputCls, "w-40 shrink-0")}
            placeholder="Accuracy"
            value={rows[i].label}
            onChange={(e) => set(i, { label: e.target.value })}
          />
          <input
            className={cn(inputCls, "flex-1")}
            placeholder="98.2%"
            value={rows[i].value}
            onChange={(e) => set(i, { value: e.target.value })}
          />
        </>
      )}
    </RowList>
  );
}

/** MILESTONES — a timeline inside a single entry. */
export function MilestonesField({
  value,
  onChange,
}: {
  value: Milestone[];
  onChange: (v: Milestone[]) => void;
}) {
  const rows = value ?? [];
  const set = (i: number, patch: Partial<Milestone>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <RowList
      rows={rows}
      onMove={(i, d) => onChange(moved(rows, i, d))}
      onRemove={(i) => onChange(rows.filter((_, j) => j !== i))}
      onAdd={() => onChange([...rows, { date: "", label: "", note: "" }])}
      addLabel="add milestone"
      empty="No milestones yet — stages inside this one entry, e.g. a promotion or a release."
    >
      {(i) => (
        <>
          <input
            className={cn(inputCls, "w-32 shrink-0")}
            placeholder="Mar 2024"
            value={rows[i].date ?? ""}
            onChange={(e) => set(i, { date: e.target.value })}
          />
          <input
            className={cn(inputCls, "min-w-[10rem] flex-1")}
            placeholder="Promoted to lead"
            value={rows[i].label}
            onChange={(e) => set(i, { label: e.target.value })}
          />
          <input
            className={cn(inputCls, "w-full")}
            placeholder="Optional note"
            value={rows[i].note ?? ""}
            onChange={(e) => set(i, { note: e.target.value })}
          />
        </>
      )}
    </RowList>
  );
}
