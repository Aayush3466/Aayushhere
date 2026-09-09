"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/dal";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/env";

export interface AuthResult {
  ok: boolean;
  error?: string;
}

/**
 * Sign in to the Studio.
 *
 * Note what happens on a wrong password versus an account that exists but is not
 * an admin: both produce the same message. Distinguishing them would let anyone
 * use this form to discover which email addresses have accounts.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const db = await getServerSupabase();
  if (!db) return { ok: false, error: "The backend isn't configured yet." };

  const clean = email.trim().toLowerCase();
  if (!clean || !password) return { ok: false, error: "Enter your email and password." };

  const { data, error } = await db.auth.signInWithPassword({ email: clean, password });
  if (error || !data.user) {
    return { ok: false, error: "That email and password don't match." };
  }

  const { data: isAdmin } = await db.rpc("is_admin");
  if (isAdmin !== true) {
    // Authenticated but not the owner — drop the session again immediately.
    await db.auth.signOut();
    return { ok: false, error: "That email and password don't match." };
  }

  revalidatePath("/studio");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const db = await getServerSupabase();
  if (db) await db.auth.signOut();
  revalidatePath("/studio");
  redirect("/studio/login");
}

/**
 * Change the Studio password.
 *
 * The current password is re-verified on a THROWAWAY client that persists
 * nothing — using the request's own client would rotate the session cookie as a
 * side effect of the check, and a failed check would then leave the admin in a
 * confusing half-signed-in state.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<AuthResult> {
  try {
    const { db, email } = await requireAdmin();

    if (newPassword.length < 10) {
      return { ok: false, error: "Use at least 10 characters." };
    }
    if (newPassword === currentPassword) {
      return { ok: false, error: "That's the password you already have." };
    }

    const probe = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: wrong } = await probe.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (wrong) return { ok: false, error: "Your current password isn't right." };

    const { error } = await db.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not change the password." };
  }
}
