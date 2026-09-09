"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CollectionKey, Profile, SiteContent } from "@/lib/types";
import type { SectionDef } from "@/lib/sections";
import {
  deleteRecord,
  reorderCollection,
  saveProfile,
  saveRecord,
  saveSection,
} from "@/lib/actions/content";

/**
 * THE STUDIO STORE
 * ----------------
 * Editing is optimistic: a keystroke updates the screen immediately and the
 * write is queued. Queued writes coalesce per record — typing a 40-character
 * title sends one save, not forty — and the status line always tells the truth
 * about what is on the server versus what is only on screen.
 *
 * Without Supabase configured it degrades to the old localStorage behaviour, so
 * the Studio is still fully usable before any backend exists.
 */

const LOCAL_KEY = "cartographer:content:v1";
const DEBOUNCE_MS = 800;

export type SaveState = "clean" | "pending" | "saving" | "saved" | "error";

type Item = { id: string; order?: number } & Record<string, unknown>;

interface Studio {
  content: SiteContent;
  remote: boolean;
  save: { state: SaveState; error?: string; inFlight: number };
  updateProfile: (patch: Partial<Profile>) => void;
  addItem: (k: CollectionKey, item: Item) => void;
  updateItem: (k: CollectionKey, id: string, patch: Record<string, unknown>) => void;
  removeItem: (k: CollectionKey, id: string) => void;
  moveItem: (k: CollectionKey, id: string, dir: -1 | 1) => void;
  updateSection: (id: string, patch: Partial<SectionDef>) => void;
  /** Force every queued write out now — used before navigating away. */
  flush: () => Promise<void>;
}

const Ctx = createContext<Studio | null>(null);

export function StudioProvider({
  initial,
  remote,
  children,
}: {
  initial: SiteContent;
  remote: boolean;
  children: ReactNode;
}) {
  const [content, setContent] = useState<SiteContent>(initial);
  const [state, setState] = useState<SaveState>("clean");
  const [error, setError] = useState<string | undefined>();
  const [inFlight, setInFlight] = useState(0);

  /**
   * Latest content, readable from a pending timer without re-creating it.
   * Kept in sync from an effect rather than during render — writing a ref while
   * rendering is not safe under concurrent React. Mutations also set it
   * synchronously, so a flush that fires between render and effect still sees
   * the newest data.
   */
  const latest = useRef(content);
  useEffect(() => {
    latest.current = content;
  }, [content]);

  /** Keys awaiting a write: "profile", "section:home", "projects:proj_x". */
  const dirty = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ----------------------------- local fallback ---------------------------- */

  useEffect(() => {
    if (remote) return;
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setContent(JSON.parse(raw) as SiteContent);
    } catch {
      /* private mode — stay in memory */
    }
  }, [remote]);

  const persistLocal = useCallback((next: SiteContent) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    } catch {
      /* quota — stay in memory */
    }
  }, []);

  /* -------------------------------- flushing ------------------------------- */

  const flush = useCallback(async () => {
    if (!remote) return;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    const keys = [...dirty.current];
    dirty.current.clear();
    if (!keys.length) return;

    setState("saving");
    setInFlight((n) => n + keys.length);

    const c = latest.current;
    const jobs = keys.map(async (key) => {
      if (key === "profile") return saveProfile(c.profile);

      // Split on the FIRST colon only — record ids may contain colons.
      const sep = key.indexOf(":");
      const kind = key.slice(0, sep);
      const id = key.slice(sep + 1);

      if (kind === "section") {
        const s = (c.sections ?? []).find((x) => x.id === id);
        return s ? saveSection(s) : { ok: true as const };
      }

      const collection = kind as CollectionKey;
      const list = c[collection] as unknown as Item[] | undefined;
      const record = list?.find((x) => x.id === id);
      // Absent means it was deleted before this flush — the delete already went.
      return record ? saveRecord(collection, record) : { ok: true as const };
    });

    const results = await Promise.all(jobs);
    setInFlight((n) => Math.max(0, n - keys.length));

    const failed = results.find((r) => !r.ok);
    if (failed && "error" in failed) {
      setState("error");
      setError(failed.error);
    } else {
      setState(dirty.current.size ? "pending" : "saved");
      setError(undefined);
    }
  }, [remote]);

  /** Mark a record dirty and restart the debounce window. */
  const queue = useCallback(
    (key: string) => {
      if (!remote) return;
      dirty.current.add(key);
      setState("pending");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), DEBOUNCE_MS);
    },
    [flush, remote],
  );

  /** Writes that must not wait: creations, deletions, reordering. */
  const immediate = useCallback(
    async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
      if (!remote) return;
      setState("saving");
      setInFlight((n) => n + 1);
      const res = await fn();
      setInFlight((n) => Math.max(0, n - 1));
      if (!res.ok) {
        setState("error");
        setError(res.error);
      } else {
        setState(dirty.current.size ? "pending" : "saved");
        setError(undefined);
      }
    },
    [remote],
  );

  /* ------------------------------- mutations ------------------------------- */

  const mutate = useCallback(
    (fn: (c: SiteContent) => SiteContent) => {
      setContent((prev) => {
        const next = fn(prev);
        latest.current = next;
        if (!remote) persistLocal(next);
        return next;
      });
    },
    [remote, persistLocal],
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      mutate((c) => ({ ...c, profile: { ...c.profile, ...patch } }));
      queue("profile");
    },
    [mutate, queue],
  );

  const updateItem = useCallback(
    (k: CollectionKey, id: string, patch: Record<string, unknown>) => {
      mutate((c) => ({
        ...c,
        [k]: (c[k] as unknown as Item[]).map((x) =>
          x.id === id ? { ...x, ...patch } : x,
        ),
      }));
      queue(`${k}:${id}`);
    },
    [mutate, queue],
  );

  const addItem = useCallback(
    (k: CollectionKey, item: Item) => {
      const order = ((latest.current[k] as unknown as Item[]) ?? []).length + 1;
      const withOrder = { ...item, order };
      mutate((c) => ({ ...c, [k]: [...(c[k] as unknown as Item[]), withOrder] }));
      void immediate(() => saveRecord(k, withOrder));
    },
    [mutate, immediate],
  );

  const removeItem = useCallback(
    (k: CollectionKey, id: string) => {
      // Drop any queued edit for a record that is about to stop existing.
      dirty.current.delete(`${k}:${id}`);
      mutate((c) => ({
        ...c,
        [k]: (c[k] as unknown as Item[]).filter((x) => x.id !== id),
      }));
      void immediate(() => deleteRecord(k, id));
    },
    [mutate, immediate],
  );

  const moveItem = useCallback(
    (k: CollectionKey, id: string, dir: -1 | 1) => {
      let ids: string[] = [];
      mutate((c) => {
        const arr = [...(c[k] as unknown as Item[])];
        const i = arr.findIndex((x) => x.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return c;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        const renumbered = arr.map((x, idx) => ({ ...x, order: idx + 1 }));
        ids = renumbered.map((x) => x.id);
        return { ...c, [k]: renumbered };
      });
      if (ids.length) void immediate(() => reorderCollection(k, ids));
    },
    [mutate, immediate],
  );

  const updateSection = useCallback(
    (id: string, patch: Partial<SectionDef>) => {
      mutate((c) => ({
        ...c,
        sections: (c.sections ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }));
      queue(`section:${id}`);
    },
    [mutate, queue],
  );

  /* --------------------------- leaving the page ---------------------------- */

  useEffect(() => {
    if (!remote) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current.size || inFlight > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [remote, inFlight]);

  const value = useMemo<Studio>(
    () => ({
      content,
      remote,
      save: { state, error, inFlight },
      updateProfile,
      addItem,
      updateItem,
      removeItem,
      moveItem,
      updateSection,
      flush,
    }),
    [content, remote, state, error, inFlight, updateProfile, addItem, updateItem, removeItem, moveItem, updateSection, flush],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudio(): Studio {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudio must be used within <StudioProvider>");
  return ctx;
}
