import { ImageResponse } from "next/og";

export const alt = "Salsa Explosion — Bournemouth Cuban Salsa & Rueda Academy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#080706",
          padding: 80,
          fontFamily: "sans-serif",
          color: "#FAF8F5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "rgba(235, 68, 50, 0.15)",
              border: "1px solid rgba(235, 68, 50, 0.4)",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#EB4432",
              textTransform: "uppercase",
            }}
          >
            Bournemouth, UK
          </div>
          <div style={{ fontSize: 18, color: "#8B8279", letterSpacing: "0.15em" }}>
            BOH STUDIOS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "#FAF8F5",
            }}
          >
            SALSA EXPLOSION
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#C5BDB3",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            Bournemouth Cuban Salsa & Rueda de Casino Academy directed by Cuban maestro Enrique Perez Valdes.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: 32,
          }}
        >
          <div style={{ fontSize: 20, color: "#DF7A24", fontWeight: 600 }}>
            Thursdays & Sundays • £12 / £14 at the door
          </div>
          <div style={{ fontSize: 20, color: "#8B8279" }}>
            salsaexplosion.co.uk
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
