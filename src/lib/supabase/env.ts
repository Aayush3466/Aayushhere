/**
 * Supabase is wired LAST. Until the keys below are set in `.env.local`, the site
 * runs entirely on the local seed + studio store, so everything is previewable
 * and editable with zero backend. The moment these exist, the data layer flips
 * to Supabase with no other code changes.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True only when both public Supabase keys are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
