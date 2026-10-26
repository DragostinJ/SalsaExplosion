import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { title: true, startDate: true, venueName: true },
  });

  const title = event?.title || "Salsa Explosion Festival";
  const location = event?.venueName || "BOH Studios • Bournemouth";
  const dateFormatted = event?.startDate
    ? new Date(event.startDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "2026 Season";

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
              backgroundColor: "rgba(223, 122, 36, 0.15)",
              border: "1px solid rgba(223, 122, 36, 0.4)",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#DF7A24",
              textTransform: "uppercase",
            }}
          >
            Festival & Congress
          </div>
          <div style={{ fontSize: 18, color: "#8B8279", letterSpacing: "0.15em" }}>
            {location}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "#FAF8F5",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 26, color: "#C5BDB3" }}>
            {dateFormatted}
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
          <div style={{ fontSize: 20, color: "#EB4432", fontWeight: 600 }}>
            Online Festival Passes Available
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
