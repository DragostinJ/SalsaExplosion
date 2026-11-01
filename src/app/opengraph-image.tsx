import { ImageResponse } from "next/og";
import { POSTER_HEX } from "@/components/poster/poster-kit";
import { cartelAssets } from "@/lib/cartel";

export const alt = "Salsa Explosion — Bournemouth Cuban Salsa & Rueda Academy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const { paper: PAPER, ink: INK, red: RED, mustard: MUSTARD, blue: BLUE } = POSTER_HEX;

export default async function Image() {
  const { anton, archivoBlack, couple } = await cartelAssets();
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
          fontFamily: "Archivo Black",
          color: INK,
        }}
      >
        {/* Poster shapes: the red sun, a mustard band and the dancing couple */}
        <div style={{ position: "absolute", right: -90, top: -60, width: 520, height: 520, borderRadius: 9999, backgroundColor: RED }} />
        <div style={{ position: "absolute", left: 0, bottom: 150, width: 420, height: 90, backgroundColor: MUSTARD }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={couple} width={380} height={380} style={{ position: "absolute", right: 40, top: 60 }} alt="" />

        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.3em", textTransform: "uppercase" }}>
          Bournemouth · Cuban salsa · BOH Studios
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: 170, lineHeight: 0.88 }}>SALSA</div>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: 170, lineHeight: 0.88 }}>
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
            fontSize: 21,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>Thursdays &amp; Sundays · £12 / £14 at the door</div>
          <div style={{ display: "flex" }}>Maestro Enrique</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, style: "normal", weight: 400 },
        { name: "Archivo Black", data: archivoBlack, style: "normal", weight: 400 },
      ],
    }
  );
}
