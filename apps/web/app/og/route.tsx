import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const title = new URL(request.url).searchParams.get("title")?.slice(0, 80) || "DentaPulse";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#042f2e",
        color: "#f0fdfa",
        padding: "72px",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>
        DentaPulse
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 600, lineHeight: 1.15 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#99f6e4" }}>
          Rappels WhatsApp · Confirmations · Impayés
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
