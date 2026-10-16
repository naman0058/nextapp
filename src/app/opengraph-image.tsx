import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — accessibility preflight tools`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0f172a 0%, #312e81 50%, #0f766e 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: 28, opacity: 0.85, margin: 0 }}>Accessibility preflight</p>
        <h1 style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, marginTop: 16, maxWidth: 900 }}>
          {siteConfig.name}
        </h1>
        <p style={{ fontSize: 32, marginTop: 24, maxWidth: 900, opacity: 0.9 }}>
          Web, social, image &amp; video checks before you publish
        </p>
      </div>
    ),
    { ...size },
  );
}
