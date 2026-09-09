"use client";

import { useState, useTransition } from "react";
import { useStudio } from "@/lib/store/studio-store";
import type { SocialLink } from "@/lib/types";
import {
  ColorField,
  Field,
  FileField,
  ImageField,
  SkillsField,
  TextArea,
  TextField,
  inputCls,
} from "./fields";
import type { InboxMessage, ScoreRow } from "./types";
import {
  clearScores,
  deleteMessage,
  deleteScore,
  setMessageRead,
} from "@/lib/actions/content";
import { changePassword, signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

function Card({
  title,
  children,
  note,
}: {
  title?: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="paper-panel p-5">
      {title && <h3 className="mb-1 font-display text-lg font-semibold">{title}</h3>}
      {note && <p className="mb-4 text-sm text-ink-faint">{note}</p>}
      {!note && title && <div className="mb-4" />}
      {children}
    </div>
  );
}

/* --------------------------------- profile -------------------------------- */

export function ProfilePanel() {
  const { content, updateProfile } = useStudio();
  const p = content.profile;
  const socials = p.socials ?? [];

  const setSocial = (i: number, patch: Partial<SocialLink>) =>
    updateProfile({ socials: socials.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  return (
    <section className="space-y-5">
      <header>
        <h2 className="font-display text-2xl">Profile</h2>
        <p className="mt-0.5 text-sm text-ink-faint">
          Who the chart belongs to. This feeds the homepage, the share card and the chatbot.
        </p>
      </header>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextField value={p.name} onChange={(v) => updateProfile({ name: v })} />
          </Field>
          <Field label="Location">
            <TextField value={p.location} onChange={(v) => updateProfile({ location: v })} />
          </Field>
          <Field label="Tagline" hint="one line, under your name" className="sm:col-span-2">
            <TextField value={p.tagline} onChange={(v) => updateProfile({ tagline: v })} />
          </Field>
          <Field label="Short bio" className="sm:col-span-2">
            <TextArea value={p.shortBio} onChange={(v) => updateProfile({ shortBio: v })} minRows={4} />
          </Field>
          <Field label="Email">
            <TextField
              type="email"
              value={p.email}
              onChange={(v) => updateProfile({ email: v })}
            />
          </Field>
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card title="Portrait" note="Shown as the inked avatar on the map.">
          <ImageField
            value={p.avatar}
            onChange={(v) => updateProfile({ avatar: v })}
            folder="profile"
            aspect="1 / 1"
          />
        </Card>
        <Card title="CV" note="Offered as a download on the Horizon.">
          <FileField
            value={p.cvFileUrl}
            onChange={(v) => updateProfile({ cvFileUrl: v })}
            folder="cv"
          />
        </Card>
      </div>

      <Card title="Socials" note="Anything with an empty URL is hidden on the public site.">
        <div className="space-y-2">
          {socials.map((s, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                className={cn(inputCls, "w-32 shrink-0")}
                placeholder="LinkedIn"
                value={s.platform}
                onChange={(e) => setSocial(i, { platform: e.target.value })}
              />
              <input
                className={cn(inputCls, "w-24 shrink-0")}
                placeholder="icon"
                value={s.icon}
                onChange={(e) => setSocial(i, { icon: e.target.value })}
                title="Icon key — mail, linkedin, github, scholar, link"
              />
              <input
                className={cn(inputCls, "min-w-[12rem] flex-1")}
                placeholder="https://…"
                value={s.url}
                onChange={(e) => setSocial(i, { url: e.target.value })}
              />
              <button
                type="button"
                onClick={() => updateProfile({ socials: socials.filter((_, j) => j !== i) })}
                className="px-2 text-lg leading-none opacity-60 hover:opacity-100"
                style={{ color: "var(--color-terracotta)" }}
                aria-label="Remove social link"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateProfile({ socials: [...socials, { platform: "", url: "", icon: "link" }] })
            }
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--color-teal-ink)" }}
          >
            + add social
          </button>
        </div>
      </Card>

      <Card title="Skills" note="Grouped as the ship's instruments; the chatbot reads these too.">
        <SkillsField value={p.skills ?? []} onChange={(v) => updateProfile({ skills: v })} />
      </Card>
    </section>
  );
}

/* ------------------------------ chapter copy ------------------------------ */

export function SectionsPanel() {
  const { content, updateSection } = useStudio();
  const sections = content.sections ?? [];

  return (
    <section className="space-y-5">
      <header>
        <h2 className="font-display text-2xl">Chapters</h2>
        <p className="mt-0.5 text-sm text-ink-faint">
          The words on each leg of the voyage — and the ink that colours it.
        </p>
      </header>

      {sections.map((s) => (
        <div key={s.id} className="paper-panel p-5" style={{ borderTopColor: s.accent, borderTopWidth: 3 }}>
          <div className="mb-4 flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: s.accent }}
              aria-hidden
            />
            <h3 className="font-display font-semibold">{s.nav || s.id}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nav label" hint="short — top of the screen">
              <TextField value={s.nav} onChange={(v) => updateSection(s.id, { nav: v })} />
            </Field>
            <Field label="Eyebrow" hint="small caps above the title">
              <TextField value={s.eyebrow} onChange={(v) => updateSection(s.id, { eyebrow: v })} />
            </Field>
            <Field label="Title">
              <TextField value={s.title} onChange={(v) => updateSection(s.id, { title: v })} />
            </Field>
            <Field label="Subtitle">
              <TextField value={s.subtitle} onChange={(v) => updateSection(s.id, { subtitle: v })} />
            </Field>
            <Field label="Territory ink" className="sm:col-span-2">
              <ColorField value={s.accent} onChange={(v) => updateSection(s.id, { accent: v })} />
            </Field>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------------------------------- inbox --------------------------------- */

export function InboxPanel({ initial }: { initial: InboxMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [, start] = useTransition();

  const unread = messages.filter((m) => !m.read).length;

  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-display text-2xl">Messages</h2>
        <p className="mt-0.5 text-sm text-ink-faint">
          {messages.length === 0
            ? "Anything sent from the Horizon contact form lands here."
            : `${messages.length} message${messages.length === 1 ? "" : "s"}${
                unread ? ` · ${unread} unread` : ""
              }`}
        </p>
      </header>

      {messages.length === 0 && (
        <p className="paper-panel-soft px-5 py-8 text-center text-ink-faint">
          No messages yet.
        </p>
      )}

      <ul className="space-y-2.5">
        {messages.map((m) => (
          <li
            key={m.id}
            className="paper-panel p-4"
            style={{
              borderLeftWidth: m.read ? 1 : 3,
              borderLeftColor: m.read ? undefined : "var(--color-teal-ink)",
            }}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display font-semibold">{m.name}</span>
              <a
                href={`mailto:${m.email}`}
                className="text-sm underline underline-offset-4"
                style={{ color: "var(--color-teal-ink)" }}
              >
                {m.email}
              </a>
              <span className="ml-auto text-xs text-ink-faint">
                {new Date(m.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{m.body}</p>
            <div className="mt-3 flex gap-4 text-sm">
              <button
                onClick={() =>
                  start(async () => {
                    const next = !m.read;
                    setMessages((list) =>
                      list.map((x) => (x.id === m.id ? { ...x, read: next } : x)),
                    );
                    await setMessageRead(m.id, next);
                  })
                }
                className="underline underline-offset-4"
                style={{ color: "var(--color-teal-ink)" }}
              >
                mark as {m.read ? "unread" : "read"}
              </button>
              <button
                onClick={() =>
                  start(async () => {
                    if (!confirm("Delete this message?")) return;
                    setMessages((list) => list.filter((x) => x.id !== m.id));
                    await deleteMessage(m.id);
                  })
                }
                className="underline underline-offset-4"
                style={{ color: "var(--color-terracotta)" }}
              >
                delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------- leaderboard ------------------------------ */

export function ScoresPanel({ initial }: { initial: ScoreRow[] }) {
  const [scores, setScores] = useState(initial);
  const [, start] = useTransition();

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Leaderboard</h2>
          <p className="mt-0.5 text-sm text-ink-faint">
            Every visitor&rsquo;s typing run, fastest first.
          </p>
        </div>
        {scores.length > 0 && (
          <button
            onClick={() =>
              start(async () => {
                if (!confirm("Clear every recorded run? This cannot be undone.")) return;
                setScores([]);
                await clearScores();
              })
            }
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--color-terracotta)" }}
          >
            clear all
          </button>
        )}
      </header>

      {scores.length === 0 ? (
        <p className="paper-panel-soft px-5 py-8 text-center text-ink-faint">No runs yet.</p>
      ) : (
        <div className="paper-panel divide-y divide-[color:var(--color-paper-edge)] overflow-hidden">
          {scores.map((s, i) => (
            <div
              key={s.id}
              className="grid grid-cols-[1.6rem_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-2.5 text-sm"
            >
              <span className="text-ink-faint">{i + 1}</span>
              <span className="truncate font-medium">
                {s.name}
                {s.location && <span className="text-ink-faint"> · {s.location}</span>}
              </span>
              <span
                className="rounded px-2 py-0.5 text-xs"
                style={{ background: "var(--color-paper-deep)" }}
              >
                {s.game}
              </span>
              <span className="font-display font-semibold" style={{ color: "var(--color-teal-ink)" }}>
                {s.wpm} wpm
              </span>
              <span className="text-ink-faint">{Number(s.accuracy).toFixed(0)}%</span>
              <button
                onClick={() =>
                  start(async () => {
                    setScores((list) => list.filter((x) => x.id !== s.id));
                    await deleteScore(s.id);
                  })
                }
                className="text-ink-faint transition-colors hover:text-[color:var(--color-terracotta)]"
                aria-label={`Delete ${s.name}'s run`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* --------------------------------- account -------------------------------- */

export function AccountPanel({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next !== confirmPw) {
      setMsg({ ok: false, text: "The two new passwords don't match." });
      return;
    }
    start(async () => {
      const res = await changePassword(current, next);
      if (res.ok) {
        setMsg({ ok: true, text: "Password changed. It's active immediately." });
        setCurrent("");
        setNext("");
        setConfirmPw("");
      } else {
        setMsg({ ok: false, text: res.error ?? "Could not change the password." });
      }
    });
  }

  return (
    <section className="space-y-5">
      <header>
        <h2 className="font-display text-2xl">Account</h2>
        <p className="mt-0.5 text-sm text-ink-faint">
          The single owner account for this chart.
        </p>
      </header>

      <Card title="Signed in as">
        <p className="font-display text-lg">{email}</p>
        <p className="mt-1 text-sm text-ink-faint">
          To change the email itself, use Supabase → Authentication → Users.
        </p>
      </Card>

      <Card
        title="Change password"
        note="Takes effect immediately. Other devices stay signed in until their session expires."
      >
        <form onSubmit={submit} className="max-w-md space-y-3">
          {/* Helps password managers associate the credential with this account. */}
          <input type="text" hidden readOnly autoComplete="username" value={email} />
          <Field label="Current password">
            <input
              type="password"
              autoComplete="current-password"
              className={inputCls}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </Field>
          <Field label="New password" hint="at least 10 characters">
            <input
              type="password"
              autoComplete="new-password"
              className={inputCls}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              autoComplete="new-password"
              className={inputCls}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
          </Field>

          {msg && (
            <p
              className="text-sm"
              style={{ color: msg.ok ? "var(--color-teal-ink)" : "var(--color-terracotta)" }}
            >
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[color:var(--color-paper-panel)] disabled:opacity-60"
            style={{ background: "var(--color-teal-ink)" }}
          >
            {pending ? "Changing…" : "Change password"}
          </button>
        </form>
      </Card>

      <Card title="Session">
        <button
          onClick={() => void signOut()}
          className="rounded-lg border border-[color:var(--color-paper-edge)] px-4 py-2 text-sm transition-colors hover:bg-[color:var(--color-paper-deep)]"
        >
          Sign out
        </button>
      </Card>
    </section>
  );
}
