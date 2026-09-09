import { getSiteContent } from "@/lib/content";
import { JourneyClient } from "@/components/JourneyClient";

/**
 * The whole public experience is one continuous map. This server component reads
 * all content once (SSR, great for SEO + first paint) and hands it to the client
 * voyage shell, which renders it through the shared rendering machine.
 */
/**
 * Statically rendered, refreshed every few minutes, and revalidated instantly
 * whenever the Studio saves. Visitors get a prerendered page; the owner never
 * waits to see an edit go live.
 */
export const revalidate = 300;

export default async function Page() {
  const content = await getSiteContent();
  return <JourneyClient content={content} />;
}
