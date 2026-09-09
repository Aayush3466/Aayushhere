import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./env";

let cached: SupabaseClient | null = null;

/**
 * Browser Supabase client (auth + reads from client components).
 * Returns `null` when Supabase isn't configured yet — callers fall back to the
 * local store, so the studio works before any backend exists.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
