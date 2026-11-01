import { ImageResponse } from "next/og";
import { POSTER_HEX } from "@/components/poster/poster-kit";
import { DOOR_PRICING, VENUE_INFO } from "@/lib/academy-data";
import {
  CARTEL_SIZES,
  CartelDaySchema,
  CartelFormatSchema,
  cartelAssets,
  cartelSchedule,
  nextClassNight,
  spanishDate,
} from "@/lib/cartel";

const { paper: PAPER, ink: INK, red: RED, mustard: MUSTARD, blue: BLUE } = POSTER_HEX;

/**
 * GET /cartel/jueves?formato=story|post: tonight's class poster as a PNG for Instagram
 * (story 1080×1920 or feed post 1080×1350), drawn from the canonical timetable.
 */
export async function GET(request: Request, { params }: { params: Promise<{ dia: string }> }) {
  const day = CartelDaySchema.safeParse((await params).dia);
  if (!day.success) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const format = CartelFormatSchema.parse(url.searchParams.get("formato") ?? undefined);
  const { width, height } = CARTEL_SIZES[format];
  const story = format === "story";
  const schedule = cartelSchedule(day.data);
  const classes = schedule.sessions.filter((session) => !session.isSocial);
  const social = schedule.sessions.find((session) => session.isSocial);
  const date = spanishDate(nextClassNight(schedule.dayOfWeekNumber)).split(" ").slice(1).join(" ");
  const { anton, archivoBlack, couple, rueda } = await cartelAssets();
  // The couple fills the story's top half, and the feed post's empty half on short nights
  const showArt = story || classes.length <= 2;

  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: PAPER,
          padding: story ? 72 : 56,
          fontFamily: "Archivo Black",
          color: INK,
        }}
      >
        {/* Poster shapes: the red sun and a mustard band */}
        <div style={{ position: "absolute", right: -170, top: story ? 150 : 40, width: 640, height: 640, borderRadius: 9999, backgroundColor: RED }} />
        <div style={{ position: "absolute", left: 0, top: story ? 410 : 330, width: 600, height: story ? 110 : 90, backgroundColor: MUSTARD }} />
        {/* ImageResponse draws plain <img> elements; next/image doesn't apply here */}
        {showArt && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={couple}
            width={story ? 430 : 400}
            height={story ? 430 : 400}
            style={{ position: "absolute", right: story ? 40 : 60, top: story ? 380 : 760 }}
            alt=""
          />
        )}
        {/* A short night leaves the story's lower half free: the rueda fills it */}
        {story && classes.length <= 2 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={rueda} width={560} height={560} style={{ position: "absolute", left: 260, top: 1140 }} alt="" />
        )}

        <div style={{ display: "flex", fontSize: 24, letterSpacing: 5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          Salsa Explosion · {VENUE_INFO.shortName}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: story ? 40 : 24 }}>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: story ? 270 : 230, lineHeight: 0.86, textTransform: "uppercase" }}>
            {day.data}
          </div>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: story ? 88 : 70, color: BLUE, textTransform: "uppercase" }}>{date}</div>
        </div>

        {/* The night's classes */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: story ? 330 : 40, borderTop: `8px solid ${INK}` }}>
          {classes.map((session) => (
            <div key={session.id} style={{ display: "flex", alignItems: "center", borderBottom: `4px solid ${INK}`, padding: story ? "14px 0" : "12px 0" }}>
              <div style={{ display: "flex", width: story ? 230 : 200, fontFamily: "Anton", fontSize: story ? 84 : 68 }}>{session.time}</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", fontSize: story ? 32 : 30, lineHeight: 1.1 }}>{session.title}</div>
                <div style={{ display: "flex", fontSize: story ? 24 : 22, marginTop: 6, textTransform: "uppercase" }}>
                  {session.level} · {session.instructor}
                </div>
              </div>
            </div>
          ))}
        </div>

        {social && (
          <div style={{ display: "flex", marginTop: story ? 32 : 20, backgroundColor: RED, padding: "14px 24px", fontFamily: "Anton", fontSize: story ? 60 : 48, textTransform: "uppercase" }}>
            Y después: la fiesta · {social.time}
          </div>
        )}

        {/* The door price, as a ticket stub */}
        <div style={{ display: "flex", marginTop: "auto", border: `6px solid ${INK}`, backgroundColor: PAPER }}>
          <div style={{ display: "flex", flexShrink: 0, alignItems: "center", padding: "0 24px", borderRight: `6px dashed ${INK}`, fontFamily: "Anton", fontSize: story ? 72 : 64, whiteSpace: "nowrap" }}>
            £{DOOR_PRICING.oneClassPounds} / £{DOOR_PRICING.twoClassesPounds}
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px 24px", fontSize: story ? 30 : 26, textTransform: "uppercase" }}>
            <div style={{ display: "flex" }}>Paga en la puerta</div>
            <div style={{ display: "flex", fontSize: story ? 24 : 22 }}>Pay at the door · no partner needed</div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: story ? 26 : 22, textTransform: "uppercase" }}>
          Practise tonight&apos;s songs: {url.host}/music
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        { name: "Anton", data: anton, style: "normal", weight: 400 },
        { name: "Archivo Black", data: archivoBlack, style: "normal", weight: 400 },
      ],
      headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" },
    }
  );
}
