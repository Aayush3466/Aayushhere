"use client";

import type { SiteContent } from "@/lib/types";
import { ContentProvider } from "@/lib/store/content-store";
import { EnvironmentProvider } from "@/lib/store/environment";
import { InkingLoader } from "@/components/InkingLoader";
import { SectionPager } from "@/components/sections/SectionPager";
import { CompassChat } from "@/components/chat/CompassChat";
import { CursorFollower } from "@/components/CursorFollower";
import { AmbientSound } from "@/components/AmbientSound";

/**
 * The whole experience. The ContentProvider makes every chapter read from one
 * live, editable store (seed now, Supabase later), so Studio edits appear here
 * instantly.
 */
export function JourneyClient({ content }: { content: SiteContent }) {
  return (
    <EnvironmentProvider>
      <ContentProvider initial={content}>
        <InkingLoader />
        <SectionPager />
        <CompassChat />
        <CursorFollower />
        <AmbientSound />
      </ContentProvider>
    </EnvironmentProvider>
  );
}
