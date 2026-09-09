import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSiteContent } from "@/lib/content";
import { getAdmin } from "@/lib/auth/dal";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { StudioApp } from "@/components/studio/StudioApp";
import type { InboxMessage, ScoreRow } from "@/components/studio/types";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false, nocache: true },
};

/** Never cache the owner's workspace. */
export const dynamic = "force-dynamic";

/**
 * The private Studio.
 *
 * The proxy has already bounced anonymous visitors, but this check is the one
 * that actually matters — it runs next to the data and is not skippable by a
 * crafted request.
 */
export default async function StudioPage() {
  const configured = isSupabaseConfigured();
  const admin = await getAdmin();

  if (configured && !admin) redirect("/studio/login");

  const content = await getSiteContent();

  // Owner-only collections. Both are gated by RLS as well, so a failure here
  // means "empty", never "someone else's data".
  let messages: InboxMessage[] = [];
  let scores: ScoreRow[] = [];

  if (admin) {
    const [m, s] = await Promise.all([
      admin.db.from("messages").select("*").order("created_at", { ascending: false }).limit(200),
      admin.db.from("scores").select("*").order("wpm", { ascending: false }).limit(200),
    ]);
    messages = (m.data ?? []) as InboxMessage[];
    scores = (s.data ?? []) as ScoreRow[];
  }

  return (
    <StudioApp
      initial={content}
      remote={Boolean(admin)}
      adminEmail={admin?.email ?? ""}
      messages={messages}
      scores={scores}
    />
  );
}
