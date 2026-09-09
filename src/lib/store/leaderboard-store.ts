"use client";

import { useCallback, useEffect, useState } from "react";
import { localId } from "@/lib/utils";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * THE GAME-ROOM LEADERBOARD
 *
 * With Supabase configured this is a shared board: every visitor's run is
 * written to `scores` (an insert the RLS policy grants to `anon`) and everyone
 * sees the same rankings. Without it, runs stay in the visitor's own browser so
 * the game room still works offline.
 *
 * The public API is identical in both modes, so the game components never learn
 * which one is in play.
 */

export type GameId = "words" | "code";

export interface ScoreEntry {
  id: string;
  game: GameId;
  name: string;
  location?: string;
  wpm: number;
  accuracy: number; // 0..100
  seconds: number;
  date: string; // ISO
}

const KEY = "cartographer:scores:v1";
const remote = () => isSupabaseConfigured();

/* ------------------------------- local mode ------------------------------- */

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

function saveScores(list: ScoreEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* quota / private mode — stay in memory */
  }
}

export function recordScore(entry: Omit<ScoreEntry, "id" | "date">): ScoreEntry {
  const full: ScoreEntry = {
    ...entry,
    id: localId("score"),
    date: new Date().toISOString(),
  };
  saveScores([full, ...loadScores()].slice(0, 500));
  return full;
}

/* ------------------------------- shared mode ------------------------------ */

type Row = {
  id: string;
  game: GameId;
  name: string;
  location: string | null;
  wpm: number;
  accuracy: number | string;
  seconds: number;
  created_at: string;
};

const fromRow = (r: Row): ScoreEntry => ({
  id: r.id,
  game: r.game,
  name: r.name,
  location: r.location ?? undefined,
  wpm: r.wpm,
  // numeric(5,2) comes back as a string from PostgREST.
  accuracy: Number(r.accuracy),
  seconds: r.seconds,
  date: r.created_at,
});

async function fetchScores(): Promise<ScoreEntry[]> {
  const db = getBrowserSupabase();
  if (!db) return [];
  const { data, error } = await db
    .from("scores")
    .select("*")
    .order("wpm", { ascending: false })
    .limit(300);
  if (error || !data) return [];
  return (data as Row[]).map(fromRow);
}

/* ---------------------------------- hook ---------------------------------- */

export function useLeaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  const refresh = useCallback(() => {
    if (remote()) void fetchScores().then(setScores);
    else setScores(loadScores());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback((entry: Omit<ScoreEntry, "id" | "date">) => {
    // Show the run on the board immediately; reconcile with the server after.
    const optimistic: ScoreEntry = {
      ...entry,
      id: localId("score"),
      date: new Date().toISOString(),
    };
    setScores((prev) => [optimistic, ...prev]);

    if (!remote()) {
      recordScore(entry);
      return optimistic;
    }

    const db = getBrowserSupabase();
    if (db) {
      void db
        .from("scores")
        .insert({
          game: entry.game,
          name: entry.name.slice(0, 40),
          location: entry.location?.slice(0, 60) ?? null,
          wpm: Math.round(entry.wpm),
          accuracy: Number(entry.accuracy.toFixed(2)),
          seconds: Math.round(entry.seconds),
        })
        .then(({ error }) => {
          // Re-read on success so the row carries its real id and ranking;
          // on failure drop the optimistic entry rather than show a phantom.
          if (error) setScores((prev) => prev.filter((s) => s.id !== optimistic.id));
          else void fetchScores().then(setScores);
        });
    }
    return optimistic;
  }, []);

  const clear = useCallback(() => {
    if (!remote()) saveScores([]);
    setScores([]);
  }, []);

  return { scores, add, clear, refresh };
}

/** Best run per name for a game, fastest first. */
export function topScores(scores: ScoreEntry[], game: GameId, limit = 10): ScoreEntry[] {
  const best = new Map<string, ScoreEntry>();
  for (const s of scores.filter((s) => s.game === game)) {
    const key = s.name.toLowerCase();
    const cur = best.get(key);
    if (!cur || s.wpm > cur.wpm) best.set(key, s);
  }
  return [...best.values()].sort((a, b) => b.wpm - a.wpm).slice(0, limit);
}
