"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { TABLE, TO_ROW, fromProfile, fromSection } from "@/lib/supabase/map";
import type { CollectionKey, Profile } from "@/lib/types";
import type { SectionDef } from "@/lib/sections";

/**
 * THE WRITE PATH
 * --------------
 * Every mutation the Studio can perform. Three rules hold for all of them:
 *
 *   1. `requireAdmin()` first, always — it throws rather than returning, so a
 *      missing check cannot silently fall through to a write.
 *   2. Writes go through the ADMIN'S OWN session client, never the service-role
 *      key. That keeps RLS switched on for our own code, so a bug here is
 *      refused by Postgres instead of quietly succeeding.
 *   3. Every success revalidates the public map, so an edit is live immediately
 *      while the site itself stays statically cached for visitors.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Turns any thrown error into a result the Studio can render calmly. */
async function run(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
    revalidatePath("/");
    revalidatePath("/studio");
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Something went wrong saving that.";
    return { ok: false, error };
  }
}

/* --------------------------------- profile -------------------------------- */

export async function saveProfile(patch: Partial<Profile>): Promise<ActionResult> {
  return run(async () => {
    const { db } = await requireAdmin();
    const row = fromProfile(patch);
    const { error } = await db.from("profile").upsert({ id: 1, ...row });
    if (error) throw new Error(error.message);
  });
}

/* ------------------------------- collections ------------------------------ */

export async function saveRecord(
  collection: CollectionKey,
  record: Record<string, unknown>,
): Promise<ActionResult> {
  return run(async () => {
    const { db } = await requireAdmin();
    const table = TABLE[collection];
    if (!table) throw new Error(`Unknown collection "${collection}".`);

    const toRow = TO_ROW[collection] as (r: Record<string, unknown>) => Record<string, unknown>;
    const row = toRow(record);
    if (!row.id) throw new Error("A record cannot be saved without an id.");

    const { error } = await db.from(table).upsert(row);
    if (error) throw new Error(error.message);
  });
}

export async function deleteRecord(
  collection: CollectionKey,
  id: string,
): Promise<ActionResult> {
  return run(async () => {
    const { db } = await requireAdmin();
    const table = TABLE[collection];
    if (!table) throw new Error(`Unknown collection "${collection}".`);
    const { error } = await db.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message);
  });
}

/**
 * Reordering writes the whole new order in one round-trip. `ids` is the complete
 * list in its new order, so a dropped or duplicated id can't leave the
 * collection half-sorted.
 */
export async function reorderCollection(
  collection: CollectionKey,
  ids: string[],
): Promise<ActionResult> {
  return run(async () => {
    const { db } = await requireAdmin();
    const table = TABLE[collection];
    if (!table) throw new Error(`Unknown collection "${collection}".`);

    const results = await Promise.all(
      ids.map((id, i) => db.from(table).update({ sort_order: i + 1 }).eq("id", id)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);
  });
}

/* ------------------------------ chapter copy ------------------------------ */

export async function saveSection(
  section: Partial<SectionDef> & { id: string; order?: number },
): Promise<ActionResult> {
  return run(async () => {
    const { db } = await requireAdmin();
    const { error } = await db.from("site_sections").upsert(fromSection(section));
    if (error) throw new Error(error.message);
  });
}

/* -------------------------------- moderation ------------------------------ */

export async function deleteScore(id: string): Promise<ActionResult> {
  return run(async () => {
    const { db } = await requireAdmin();
    const { error } = await db.from("scores").delete().eq("id", id);
    if (error) throw new Error(error.message);
  });
}

export async function clearScores(): Promise<ActionResult> {
  return run(async () => {
    const { db } = await requireAdmin();
    // `neq` on a never-null column is PostgREST's way of saying "every row";
    // a bare delete() with no filter is refused as a safety measure.
    const { error } = await db.from("scores").delete().neq("game", "__none__");
    if (error) throw new Error(error.message);
  });
}

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  return run(async () => {
    const { db } = await requireAdmin();
    const { error } = await db.from("messages").update({ read }).eq("id", id);
    if (error) throw new Error(error.message);
  });
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  return run(async () => {
    const { db } = await requireAdmin();
    const { error } = await db.from("messages").delete().eq("id", id);
    if (error) throw new Error(error.message);
  });
}
