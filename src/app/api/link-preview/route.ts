import { NextRequest, NextResponse } from "next/server";

/**
 * Fetches a URL's Open Graph title + image so a pasted project link gets an
 * automatic thumbnail in the Studio. No API key needed. If a site exposes no
 * usable preview, the Studio offers a one-click screenshot-upload fallback.
 */
export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) return NextResponse.json({ error: "missing url" }, { status: 400 });

  let url: URL;
  try {
    url = new URL(target.startsWith("http") ? target : `https://${target}`);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { "user-agent": "Mozilla/5.0 (compatible; CartographerBot/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    const html = (await res.text()).slice(0, 400_000);

    const meta = (prop: string) => {
      const a = html.match(
        new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"),
      );
      const b = html.match(
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"),
      );
      return (a?.[1] ?? b?.[1])?.trim();
    };

    let image = meta("og:image") || meta("twitter:image");
    if (image && image.startsWith("/")) image = url.origin + image;
    const title =
      meta("og:title") || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

    return NextResponse.json({
      title: decodeEntities(title),
      image: image || null,
      host: url.host,
    });
  } catch {
    return NextResponse.json({ error: "fetch-failed", image: null }, { status: 200 });
  }
}

function decodeEntities(s?: string): string | undefined {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
