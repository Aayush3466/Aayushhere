import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/studio/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Studio · sign in",
  robots: { index: false, follow: false },
};

export default async function StudioLoginPage() {
  // Already signed in — don't make the owner look at a login form.
  if (await getAdmin()) redirect("/studio");
  return <LoginForm configured={isSupabaseConfigured()} />;
}
