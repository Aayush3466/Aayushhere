"use client";

import { useState } from "react";
import Link from "next/link";
import type { SiteContent } from "@/lib/types";
import { StudioProvider, useStudio } from "@/lib/store/studio-store";
import { COLLECTIONS } from "./schema";
import { CollectionPanel } from "./CollectionPanel";
import { AccountPanel, InboxPanel, ProfilePanel, ScoresPanel, SectionsPanel } from "./panels";
import type { InboxMessage, ScoreRow } from "./types";
import { CompassRose } from "@/components/CompassRose";

type Tab = string;

export function StudioApp({
  initial,
  remote,
  adminEmail,
  messages,
  scores,
}: {
  initial: SiteContent;
  remote: boolean;
  adminEmail: string;
  messages: InboxMessage[];
  scores: ScoreRow[];
}) {
  return (
    <StudioProvider initial={initial} remote={remote}>
      <Shell adminEmail={adminEmail} messages={messages} scores={scores} />
    </StudioProvider>
  );
}

function Shell({
  adminEmail,
  messages,
  scores,
}: {
  adminEmail: string;
  messages: InboxMessage[];
  scores: ScoreRow[];
}) {
  const { content, remote } = useStudio();
  const [tab, setTab] = useState<Tab>("profile");

  const unread = messages.filter((m) => !m.read).length;

  const nav: { key: Tab; label: string; count?: number; badge?: number }[] = [
    { key: "profile", label: "Profile" },
    { key: "chapters", label: "Chapters", count: (content.sections ?? []).length },
    ...COLLECTIONS.map((c) => ({
      key: c.key as Tab,
      label: c.label,
      count: (content[c.key] as unknown as unknown[])?.length ?? 0,
    })),
    { key: "messages", label: "Messages", count: messages.length, badge: unread },
    { key: "scores", label: "Leaderboard", count: scores.length },
    { key: "account", label: "Account" },
  ];

  return (
    <div className="min-h-[100dvh]" style={{ background: "var(--color-paper)" }}>
      <div className="paper-grain" aria-hidden />

      <header className="sticky top-0 z-20 border-b border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper)]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <CompassRose size={26} />
          <h1 className="font-display text-base font-semibold sm:text-lg">
            The Cartographer <span className="text-ink-faint">· Studio</span>
          </h1>

          <SaveBadge />

          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link
              href="/"
              target="_blank"
              className="underline-offset-4 hover:underline"
              style={{ color: "var(--color-teal-ink)" }}
            >
              View site ↗
            </Link>
          </div>
        </div>
      </header>

      {!remote && (
        <div
          className="relative z-10 border-b px-5 py-2.5 text-center text-sm"
          style={{
            background: "color-mix(in oklab, var(--color-ochre) 14%, var(--color-paper))",
            borderColor: "color-mix(in oklab, var(--color-ochre) 30%, transparent)",
          }}
        >
          No backend connected — edits are saved to this browser only. Add Supabase
          keys and run <code>npm run setup</code> to make them permanent.
        </div>
      )}

      <div className="relative z-10 mx-auto grid max-w-6xl gap-7 px-5 py-7 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-row flex-wrap gap-1 self-start md:sticky md:top-20 md:flex-col">
          {nav.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors"
              style={{
                background: tab === n.key ? "var(--color-teal-ink)" : "transparent",
                color: tab === n.key ? "var(--color-paper-panel)" : "var(--color-ink-soft)",
              }}
            >
              <span className="flex-1">{n.label}</span>
              {n.badge ? (
                <span
                  className="rounded-[var(--radius-pill)] px-1.5 text-[0.68rem] font-semibold"
                  style={{
                    background: "var(--color-terracotta)",
                    color: "var(--color-paper-panel)",
                  }}
                >
                  {n.badge}
                </span>
              ) : n.count !== undefined ? (
                <span
                  className="text-[0.7rem] tabular-nums"
                  style={{ opacity: tab === n.key ? 0.7 : 0.5 }}
                >
                  {n.count}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <main className="min-w-0">
          {tab === "profile" && <ProfilePanel />}
          {tab === "chapters" && <SectionsPanel />}
          {tab === "messages" && <InboxPanel initial={messages} />}
          {tab === "scores" && <ScoresPanel initial={scores} />}
          {tab === "account" && <AccountPanel email={adminEmail} />}
          {COLLECTIONS.map(
            (c) => tab === c.key && <CollectionPanel key={c.key} def={c} />,
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * The honesty indicator. It distinguishes "typed but not sent", "sending" and
 * "safely on the server", because on an autosaving editor the difference is the
 * only thing standing between the owner and losing work by closing the tab.
 */
function SaveBadge() {
  const { save, remote, flush } = useStudio();
  if (!remote) return null;

  const map = {
    clean: { text: "", color: "" },
    pending: { text: "unsaved changes", color: "var(--color-ochre)" },
    saving: { text: "saving…", color: "var(--color-ink-faint)" },
    saved: { text: "all changes saved", color: "var(--color-teal-ink)" },
    error: { text: save.error ?? "save failed", color: "var(--color-terracotta)" },
  } as const;

  const s = map[save.state];
  if (!s.text) return null;

  return (
    <span className="ml-2 flex items-center gap-2 text-sm" style={{ color: s.color }}>
      {save.state === "saving" && (
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full"
          style={{ background: "currentColor" }}
          aria-hidden
        />
      )}
      <span className="hidden sm:inline">{s.text}</span>
      {save.state === "error" && (
        <button onClick={() => void flush()} className="underline underline-offset-4">
          retry
        </button>
      )}
    </span>
  );
}
