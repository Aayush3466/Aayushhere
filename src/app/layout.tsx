import type { Metadata, Viewport } from "next";
import { fontClassNames } from "@/lib/fonts";
import { getSiteContent } from "@/lib/content";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Metadata is generated from the LIVE profile, not the seed.
 *
 * This is the difference between a portfolio that is editable and one that only
 * looks editable: renaming yourself in the Studio has to change the browser tab,
 * the Google result and the link preview people paste into Slack — not just the
 * heading on the page.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSiteContent();
  const name = profile.name || "Portfolio";
  const title = `${name} — An Illustrated Chart`;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s · ${name}` },
    description: profile.shortBio,
    keywords: [
      name,
      // The skill groups the owner actually maintains beat a frozen list.
      ...(profile.skills ?? []).flatMap((g) => g.items).slice(0, 12),
      "portfolio",
    ],
    authors: [{ name }],
    creator: name,
    openGraph: {
      type: "website",
      url: siteUrl,
      title,
      description: profile.tagline,
      siteName: `${name} · The Cartographer`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: profile.tagline,
    },
    robots: { index: true, follow: true },
    alternates: { canonical: siteUrl },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f3e9",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontClassNames} h-full antialiased`}>
      <body className="relative min-h-full">
        {/* Fixed paper substrate — grain + vignette sit behind everything. */}
        <div className="paper-grain" aria-hidden="true" />
        <div className="paper-vignette" aria-hidden="true" />
        <div className="relative z-10 flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
