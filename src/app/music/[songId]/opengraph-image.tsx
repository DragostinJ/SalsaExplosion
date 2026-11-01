import { ImageResponse } from "next/og";
import { DARK_TEXT_GEARS, GEAR_HEX, POSTER_HEX } from "@/components/poster/poster-kit";
import { cartelAssets } from "@/lib/cartel";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { formatSongTime } from "@/lib/music/song-timing";
import { displaySongTitle } from "@/lib/music/song-style";

export const alt = "The song's map, section by section, from the Salsa Explosion practice player";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card for a practice song: the title as a poster and the song as coloured stripes. */
export default async function Image({ params }: { params: Promise<{ songId: string }> }) {
  const { songId } = await params;
  const song = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === songId);
  const { anton, archivoBlack } = await cartelAssets();
  const fullTitle = song ? displaySongTitle(song.title) : "La lista";
  // "Esto Está (Live at Le New Morning, Paris)": the bracket goes on its own smaller line
  const bracket = fullTitle.indexOf(" (");
  const title = bracket > 0 ? fullTitle.slice(0, bracket) : fullTitle;
  const subtitle = bracket > 0 ? fullTitle.slice(bracket + 1) : null;
  const segments = song?.segments ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: POSTER_HEX.paper,
          color: POSTER_HEX.ink,
          fontFamily: "Archivo Black",
          padding: 48,
          gap: 48,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative" }}>
          <div style={{ position: "absolute", left: -110, bottom: -110, width: 300, height: 300, borderRadius: 9999, backgroundColor: POSTER_HEX.red }} />
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 3, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Salsa Explosion · practica en casa
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontFamily: "Anton",
              fontSize: title.length > 22 ? 76 : 104,
              lineHeight: 0.92,
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          {subtitle && <div style={{ display: "flex", marginTop: 10, fontSize: 24, textTransform: "uppercase" }}>{subtitle}</div>}
          {song && (
            <div style={{ display: "flex", alignSelf: "flex-start", marginTop: 18, fontSize: 30, backgroundColor: POSTER_HEX.mustard, padding: "4px 14px" }}>
              {song.artist}
            </div>
          )}
          {song && (
            <div style={{ display: "flex", marginTop: 18, fontSize: 24, textTransform: "uppercase" }}>
              {song.style} · {song.bpm} BPM · {formatSongTime(song.durationSeconds)} · {segments.length} sections
            </div>
          )}
          <div style={{ display: "flex", marginTop: "auto", borderTop: `6px solid ${POSTER_HEX.ink}`, paddingTop: 18, fontSize: 26, textTransform: "uppercase" }}>
            What to dance in every section →
          </div>
        </div>

        {/* The song, one stripe per section: height = its length */}
        <div style={{ display: "flex", flexDirection: "column", width: 440, border: `6px solid ${POSTER_HEX.ink}` }}>
          {segments.map((segment) => (
            <div
              key={segment.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexGrow: Math.max(segment.endTimeSeconds - segment.startTimeSeconds, 1),
                padding: "0 12px",
                backgroundColor: GEAR_HEX[segment.danceGear],
                color: DARK_TEXT_GEARS.has(segment.danceGear) ? POSTER_HEX.ink : POSTER_HEX.paper,
                fontSize: segments.length > 12 ? 14 : 17,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", maxWidth: 330, overflow: "hidden", whiteSpace: "nowrap" }}>{segment.sectionName}</div>
              <div style={{ display: "flex" }}>{formatSongTime(segment.startTimeSeconds)}</div>
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
