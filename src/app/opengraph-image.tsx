import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content";

export const alt = "Aayush Adhikari — An Illustrated Chart";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // Live profile, so the share card reflects Studio edits like everything else.
  const { profile } = await getSiteContent();
  const { name, tagline } = profile;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f3e9",
          color: "#2a2620",
          fontFamily: "serif",
          padding: 80,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 10, color: "#928975" }}>
          AN ILLUSTRATED CHART OF
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, marginTop: 8 }}>{name}</div>
        <div
          style={{
            display: "flex",
            width: 260,
            height: 4,
            background: "#c0883c",
            margin: "26px 0",
          }}
        />
        <div style={{ display: "flex", fontSize: 34, color: "#c2765a", maxWidth: 900 }}>{tagline}</div>
      </div>
    ),
    size,
  );
}
