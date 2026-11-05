import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ICAIC poster inks
const PAPER = "#F1E6D0";
const INK = "#161311";
const RED = "#E4412B";
const MUSTARD = "#F4B41A";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let event = null;
  try {
    event = await prisma.event.findUnique({
      where: { slug },
      select: { title: true, startDate: true, venueName: true },
    });
  } catch {
    // Fallback handled below
  }

  const title = event?.title || "Salsa Explosion Festival";
  const location = event?.venueName || "BOH Studios · Bournemouth";
  const dateFormatted = event?.startDate
    ? new Date(event.startDate).toLocaleDateString("en-GB", {
        timeZone: "Europe/London",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Temporada 2026 / 2027";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          backgroundColor: PAPER,
          padding: 72,
          fontFamily: "sans-serif",
          color: INK,
        }}
      >
        {/* Poster shapes: the red sun and a mustard band */}
        <div
          style={{
            position: "absolute",
            right: -90,
            top: -60,
            width: 520,
            height: 520,
            borderRadius: 9999,
            backgroundColor: RED,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 150,
            width: 420,
            height: 90,
            backgroundColor: MUSTARD,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>Bournemouth · {location}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900, zIndex: 10 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              marginTop: 16,
              color: INK,
            }}
          >
            {dateFormatted}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            borderTop: `6px solid ${INK}`,
            paddingTop: 24,
            fontSize: 24,
            fontWeight: 800,
            textTransform: "uppercase",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex" }}>Online Festival Passes · Salsa Explosion</div>
          <div style={{ display: "flex" }}>salsaexplosion.co.uk</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
