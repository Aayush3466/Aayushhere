import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./env";

/**
 * A cookie-free, publishable-key client for PUBLIC reads and public writes.
 *
 * Deliberately separate from `server.ts`: that one carries the visitor's cookies
 * to resolve a session, which forces every page that touches it to render
 * dynamically. The public map has no session to resolve — it only touches rows whose RLS
 * policies already name `anon` — so it uses this client and stays cacheable.
 */
let cached: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
