import { ImageResponse } from "next/og";

export const alt = "Salsa Explosion — Bournemouth Cuban Salsa & Rueda Academy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ICAIC poster inks (globals.css)
const PAPER = "#F1E6D0";
const INK = "#161311";
const RED = "#E8462F";
const MUSTARD = "#F4B41A";
const BLUE = "#22418F";

export default async function Image() {
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
        <div style={{ position: "absolute", right: -90, top: -60, width: 520, height: 520, borderRadius: 9999, backgroundColor: RED }} />
        <div style={{ position: "absolute", left: 0, bottom: 150, width: 420, height: 90, backgroundColor: MUSTARD }} />

        <div style={{ display: "flex", fontSize: 22, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase" }}>
          Bournemouth · Cuban salsa · BOH Studios
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em" }}>SALSA</div>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            EXPLO<span style={{ color: BLUE }}>S</span>ION
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            borderTop: `6px solid ${INK}`,
            paddingTop: 24,
            fontSize: 26,
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>Thursdays &amp; Sundays · £12 / £14 at the door</div>
          <div style={{ display: "flex" }}>Maestro Enrique Perez Valdes</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
