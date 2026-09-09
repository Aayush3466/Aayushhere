"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Profile, SiteContent } from "@/lib/types";
import { SECTIONS, type SectionDef, type SectionId } from "@/lib/sections";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * THE LIVE CONTENT STORE
 * ----------------------
 * One editable source the public site, the Studio and the chatbot all share.
 * It boots from the server-provided seed, then (on the client) layers any local
 * edits saved in localStorage — so the Studio edits show up live everywhere with
 * zero backend. When Supabase is wired, this provider swaps its persistence for
 * Supabase reads/writes and nothing else changes.
 */

const KEY = "cartographer:content:v1";

/** Collections that are arrays of `{ id }` records. */
export type ArrayCollection =
  | "publications"
  | "projects"
  | "experience"
  | "education"
  | "gallery"
  | "chatbotFacts";

type Item = { id: string; order?: number };

interface Store {
  content: SiteContent;
  /** true once localStorage has been read (avoids clobbering saved edits). */
  hydrated: boolean;
  dirty: boolean; // has the local copy diverged from seed?
  updateProfile: (patch: Partial<Profile>) => void;
  addItem: (k: ArrayCollection, item: Item) => void;
  updateItem: (k: ArrayCollection, id: string, patch: Record<string, unknown>) => void;
  removeItem: (k: ArrayCollection, id: string) => void;
  moveItem: (k: ArrayCollection, id: string, dir: -1 | 1) => void;
  resetAll: () => void;
}

const Ctx = createContext<Store | null>(null);

export function ContentProvider({
  initial,
  children,
}: {
  initial: SiteContent;
  children: ReactNode;
}) {
  const [content, setContent] = useState<SiteContent>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    // With a real backend, the server payload IS the truth. Leftover local edits
    // from the pre-Supabase era must never shadow it, or the owner would see a
    // stale site in the one browser they edited from.
    if (isSupabaseConfigured()) {
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setContent(JSON.parse(raw) as SiteContent);
        setDirty(true);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const mutate = useCallback((fn: (c: SiteContent) => SiteContent) => {
    setContent((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* quota / private mode — stay in memory */
      }
      return next;
    });
    setDirty(true);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Profile>) =>
      mutate((c) => ({ ...c, profile: { ...c.profile, ...patch } })),
    [mutate],
  );

  const addItem = useCallback(
    (k: ArrayCollection, item: Item) =>
      mutate((c) => ({ ...c, [k]: [...(c[k] as Item[]), item] })),
    [mutate],
  );

  const updateItem = useCallback(
    (k: ArrayCollection, id: string, patch: Record<string, unknown>) =>
      mutate((c) => ({
        ...c,
        [k]: (c[k] as Item[]).map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    [mutate],
  );

  const removeItem = useCallback(
    (k: ArrayCollection, id: string) =>
      mutate((c) => ({ ...c, [k]: (c[k] as Item[]).filter((x) => x.id !== id) })),
    [mutate],
  );

  const moveItem = useCallback(
    (k: ArrayCollection, id: string, dir: -1 | 1) =>
      mutate((c) => {
        const arr = [...(c[k] as Item[])];
        const i = arr.findIndex((x) => x.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return c;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        arr.forEach((x, idx) => (x.order = idx + 1));
        return { ...c, [k]: arr };
      }),
    [mutate],
  );

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setContent(initial);
    setDirty(false);
  }, [initial]);

  return (
    <Ctx.Provider
      value={{
        content,
        hydrated,
        dirty,
        updateProfile,
        addItem,
        updateItem,
        removeItem,
        moveItem,
        resetAll,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useContentStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useContentStore must be used within <ContentProvider>");
  return ctx;
}

/** Convenience: just the current content. */
export function useContent(): SiteContent {
  return useContentStore().content;
}

/**
 * Chapter copy for one section, live-editable.
 *
 * Falls back to the compiled-in defaults whenever the database has no row for
 * this chapter, so a half-seeded `site_sections` table can never blank out a
 * heading on the public map.
 */
export function useSectionDef(id: SectionId): SectionDef {
  const { sections } = useContent();
  return (
    sections?.find((s) => s.id === id) ?? SECTIONS.find((s) => s.id === id)!
  );
}

/**
 * All chapters, in travel order, with live copy layered onto the compiled-in
 * list. Mapping over SECTIONS rather than over the database rows is deliberate:
 * navigation is index-based, so the length must never depend on how many rows
 * happen to exist.
 */
export function useSections(): SectionDef[] {
  const { sections } = useContent();
  if (!sections?.length) return SECTIONS;
  return SECTIONS.map((s) => sections.find((x) => x.id === s.id) ?? s);
}
