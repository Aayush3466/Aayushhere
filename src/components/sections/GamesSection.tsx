"use client";

import { useEffect, useState } from "react";
import { makeWordsText, randomSnippet, CODE_SNIPPETS } from "@/lib/games";

// Deterministic first text so server and client render identically (no random
// during SSR). Real random text is drawn on the client after mount / on restart.
const SEED_WORDS =
  "the quiet harbor holds a paper boat while the north wind maps a slow course over calm water and the lantern marks the coast for every sail that learns to read the chart";
import { useLeaderboard, topScores, type GameId } from "@/lib/store/leaderboard-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { Plate } from "./ui";
import { TypingTest, type TypingResult } from "@/components/games/TypingTest";
import { useSectionDef } from "@/lib/store/content-store";

export function GamesSection({ active }: { active: boolean }) {
  // Chapter copy, live-editable from the Studio.
  const DEF = useSectionDef("games");
  const [game, setGame] = useState<GameId>("words");
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const { scores, add } = useLeaderboard();

  const [text, setText] = useState<string>(
    game === "words" ? SEED_WORDS : CODE_SNIPPETS[0],
  );
  useEffect(() => {
    setText(game === "words" ? makeWordsText(32) : randomSnippet());
  }, [game, round]);

  function newRun(next?: GameId) {
    if (next) setGame(next);
    setResult(null);
    setRound((r) => r + 1);
  }

  function save() {
    if (!result) return;
    add({
      game,
      name: name.trim() || "Anonymous",
      location: location.trim() || undefined,
      wpm: result.wpm,
      accuracy: result.accuracy,
      seconds: result.seconds,
    });
    newRun();
  }

  const board = topScores(scores, game, 8);
  const field =
    "w-full rounded-lg border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper-panel)] px-3 py-2 text-ink outline-none focus:border-[color:var(--color-indigo-ink)]";

  return (
    <SectionShell
      active={active}
      accent={DEF.accent}
      eyebrow={DEF.eyebrow}
      title={DEF.title}
      subtitle={DEF.subtitle}
      background={<ChapterBackdrop variant="games" />}
    >
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        {/* the test */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Tab label="Words" on={game === "words"} onClick={() => newRun("words")} accent={DEF.accent} />
            <Tab label="JavaScript" on={game === "code"} onClick={() => newRun("code")} accent={DEF.accent} />
            <button
              type="button"
              onClick={() => newRun()}
              className="ml-auto hand text-lg text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              new text ↻
            </button>
          </div>

          {result ? (
            <Plate accent={DEF.accent}>
              <div className="flex flex-wrap items-end gap-6">
                <Stat big label="WPM" value={result.wpm} accent={DEF.accent} />
                <Stat label="accuracy" value={`${result.accuracy}%`} accent={DEF.accent} />
                <Stat label="time" value={`${result.seconds}s`} accent={DEF.accent} />
              </div>
              <hr className="ink-rule my-4" />
              <p className="hand text-lg text-ink-soft">put it on the leaderboard —</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className={field} placeholder="City, Country (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={save}
                  className="rounded-lg px-5 py-2.5 font-display font-semibold text-[color:var(--color-paper-panel)]"
                  style={{ background: DEF.accent }}
                >
                  Save run
                </button>
                <button type="button" onClick={() => newRun()} className="hand text-lg text-ink-soft underline underline-offset-4">
                  skip & retry
                </button>
              </div>
            </Plate>
          ) : (
            <>
              <TypingTest
                key={`${game}-${round}`}
                text={text}
                accent={DEF.accent}
                mono={game === "code"}
                onComplete={setResult}
              />
              <p className="mt-3 text-sm text-ink-faint">
                Just start typing — the clock begins on your first keystroke.
              </p>
            </>
          )}
        </div>

        {/* leaderboard */}
        <div>
          <h3 className="mb-3 font-display text-xl" style={{ color: DEF.accent }}>
            Leaderboard · {game === "words" ? "Words" : "JavaScript"}
          </h3>
          <div className="paper-panel-soft divide-y divide-[color:var(--color-paper-edge)] overflow-hidden">
            {board.length === 0 && (
              <p className="p-5 text-sm text-ink-faint">
                No runs yet — be the first to post a score.
              </p>
            )}
            {board.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="hand w-6 text-lg" style={{ color: DEF.accent }}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-semibold text-ink">{s.name}</p>
                  {s.location && <p className="truncate text-xs text-ink-faint">{s.location}</p>}
                </div>
                <div className="text-right">
                  <p className="font-display font-semibold" style={{ color: DEF.accent }}>
                    {s.wpm} wpm
                  </p>
                  <p className="text-xs text-ink-faint">{s.accuracy}%</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            Runs save to this browser now; with the backend they collect for
            everyone and appear in the Studio dashboard.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function Tab({ label, on, onClick, accent }: { label: string; on: boolean; onClick: () => void; accent: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[var(--radius-pill)] px-4 py-1.5 text-sm font-semibold transition-colors"
      style={{
        color: on ? "var(--color-paper-panel)" : accent,
        background: on ? accent : `color-mix(in oklab, ${accent} 12%, var(--color-paper-panel))`,
        border: `1px solid color-mix(in oklab, ${accent} 34%, transparent)`,
      }}
    >
      {label}
    </button>
  );
}

function Stat({ label, value, accent, big }: { label: string; value: string | number; accent: string; big?: boolean }) {
  return (
    <div>
      <p className={big ? "font-display text-5xl font-semibold" : "font-display text-2xl font-semibold"} style={{ color: accent }}>
        {value}
      </p>
      <p className="hand text-lg text-ink-faint">{label}</p>
    </div>
  );
}
