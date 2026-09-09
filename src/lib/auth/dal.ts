import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * THE DATA ACCESS LAYER
 * ---------------------
 * The authorization boundary. Every server action and every page that shows
 * owner-only data asks this module — never the proxy, never a client component,
 * never a prop passed down from one.
 *
 * Two conditions must BOTH hold to be the owner:
 *   1. a valid Supabase session (verified against the auth server, not just a
 *      decoded cookie — `getUser()` not `getSession()`), and
 *   2. a row in `admins` for that user id.
 *
 * Even so, this is defence in depth rather than the last line: Postgres RLS
 * independently refuses any write from a non-admin, so a bug here cannot become
 * a data breach.
 */

export interface AdminSession {
  userId: string;
  email: string;
  /** Request-scoped client already carrying the admin's session. */
  db: SupabaseClient;
}

/**
 * `cache` dedupes this per request, so a page and the three actions it triggers
 * share one verification instead of hitting the auth server four times.
 */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  const db = await getServerSupabase();
  if (!db) return null;

  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return null;

  // Authenticated is not the same as authorized: anyone with an account in this
  // Supabase project is authenticated. Only a row in `admins` is the owner.
  const { data: isAdmin, error: rpcError } = await db.rpc("is_admin");
  if (rpcError || isAdmin !== true) return null;

  return { userId: user.id, email: user.email ?? "", db };
});

/** True when a real backend is wired AND the caller is the owner. */
export async function isAdminRequest(): Promise<boolean> {
  return (await getAdmin()) !== null;
}

/**
 * For server actions: returns the admin or throws. Throwing (rather than
 * returning null) means a forgotten check can never silently fall through to a
 * write path.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorized. Sign in to the Studio first.");
  return admin;
}
