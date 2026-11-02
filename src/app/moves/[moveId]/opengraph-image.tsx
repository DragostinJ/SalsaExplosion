import { ImageResponse } from "next/og";
import { POSTER_HEX } from "@/components/poster/poster-kit";
import { cartelAssets } from "@/lib/cartel";
import { getVisibleMoves } from "@/lib/moves/move-library";
import type { MoveCategory } from "@/lib/moves/move-schema";

export const alt = "The move as a poster card from the Salsa Explosion move library";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The move family's poster ink and the text colour that reads on it (as on the library cards) */
const FAMILY_INK: Record<MoveCategory, { bg: string; text: string }> = {
  "Casino figure": { bg: POSTER_HEX.teal, text: POSTER_HEX.ink },
  "Rueda call": { bg: POSTER_HEX.mustard, text: POSTER_HEX.ink },
  "Shine / suelta": { bg: POSTER_HEX.pink, text: POSTER_HEX.ink },
  "Body movement": { bg: POSTER_HEX.ink, text: POSTER_HEX.paper },
  Rumba: { bg: POSTER_HEX.red, text: POSTER_HEX.ink },
  Son: { bg: POSTER_HEX.blue, text: POSTER_HEX.paper },
  Reparto: { bg: POSTER_HEX.ink, text: POSTER_HEX.paper },
  "Afro-Cuban Orishas": { bg: POSTER_HEX.plum, text: POSTER_HEX.paper },
};

/** Share card for a move: its name as a poster in the family's ink, with the 8-count strip. */
export default async function Image({ params }: { params: Promise<{ moveId: string }> }) {
  const { moveId } = await params;
  const move = getVisibleMoves().find((m) => m.id === moveId);
  const { anton, archivoBlack } = await cartelAssets();
  const ink = move ? FAMILY_INK[move.category] : FAMILY_INK["Casino figure"];
  const title = move ? (move.spanishName ?? move.name) : "La biblioteca de pasos";
  const bars = Math.min(move?.eightCounts ?? 1, 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: ink.bg,
          color: ink.text,
          fontFamily: "Archivo Black",
          padding: 56,
          border: `14px solid ${POSTER_HEX.ink}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, textTransform: "uppercase" }}>
          <div style={{ display: "flex" }}>Salsa Explosion · la biblioteca de pasos</div>
          {move && <div style={{ display: "flex", border: `4px solid ${ink.text}`, padding: "2px 12px" }}>{move.level}</div>}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontFamily: "Anton",
            fontSize: title.length > 20 ? 96 : 132,
            lineHeight: 0.92,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        {move && (
          <div style={{ display: "flex", marginTop: 14, fontSize: 28, textTransform: "uppercase" }}>
            {move.category} · {move.eightCounts} × 8
          </div>
        )}
        {/* The count strip, every count numbered: steps filled, the pauses on 4 and 8 hollow */}
        <div style={{ display: "flex", gap: 28, marginTop: "auto" }}>
          {Array.from({ length: bars }, (_, bar) => (
            <div key={bar} style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <div
                  key={count}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 58,
                    fontSize: 26,
                    border: `4px solid ${ink.text}`,
                    backgroundColor: count % 4 === 0 ? "transparent" : ink.text,
                    color: count % 4 === 0 ? ink.text : ink.bg,
                  }}
                >
                  {count}
                </div>
              ))}
            </div>
          ))}
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
