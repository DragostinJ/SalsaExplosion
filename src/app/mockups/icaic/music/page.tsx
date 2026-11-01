import Image from "next/image";
import Link from "next/link";
import { ClaveMark, MockupSwitcher, SongScore } from "@/components/mockups/mockup-art";
import {
  BIG,
  GEARS,
  H1,
  H3,
  INK,
  POSTER_COLORS,
  anton,
  archivo,
  display,
  paper,
} from "@/components/mockups/icaic-theme";
import { GRAPHICS, PRACTICE_SONGS, SONG_COUNT, VENUE_INFO, allGears } from "@/components/mockups/mockup-data";

export const metadata = { title: "Mock-up · ICAIC Poster · Songs" };

const STEPS = [
  { word: "Escoge", text: "Pick a song from the list. Each one opens the full-screen practice player." },
  { word: "Ahora", text: "The NOW card tells you what to dance in this section: gear, timing, moves." },
  { word: "Después", text: "The NEXT strip warns you a few seconds before the music changes." },
] as const;

export default function IcaicMusicMockupPage() {
  return (
    <main
      className={`${anton.variable} ${archivo.variable} min-h-screen`}
      style={{ ...paper(GRAPHICS.paperTexture.src), color: INK.ink, fontFamily: "var(--ic-text)" }}
    >
      <MockupSwitcher current="icaic" page="music" />

      <header className="grid items-end gap-6 px-4 pb-10 pt-8 md:grid-cols-12 md:px-10 md:pt-12">
        <div className="md:col-span-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em]">
            Practica en casa · {SONG_COUNT} canciones
          </p>
          <h1 className={`mt-3 uppercase ${H1}`} style={display}>
            La lista
          </h1>
          <p className="mt-5 max-w-lg text-lg font-medium">
            Every song from the Thursday and Sunday classes at {VENUE_INFO.shortName}, mapped section by section. Pick one,
            press play, and dance what the music asks for.
          </p>
        </div>
        <div className="md:col-span-4">
          <Image
            src={GRAPHICS.radio.src}
            alt={GRAPHICS.radio.alt}
            width={GRAPHICS.radio.width}
            height={GRAPHICS.radio.height}
            sizes="(max-width: 768px) 60vw, 25vw"
            className="mx-auto w-3/5 md:w-full"
          />
        </div>
      </header>

      <ol className="border-t-4" style={{ borderColor: INK.ink }}>
        {PRACTICE_SONGS.map(({ song, title, duration }, index) => (
          <li key={song.id} className="border-b-4" style={{ borderColor: INK.ink }}>
            <Link
              href={`/music/${song.id}`}
              className="group grid min-h-[96px] grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 px-4 py-5 transition-colors hover:bg-black/5 md:grid-cols-[6rem_minmax(0,1fr)_18rem_13rem] md:items-center md:px-10"
            >
              <span className={`tabular-nums ${BIG}`} style={{ ...display, color: POSTER_COLORS[index % POSTER_COLORS.length] }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className={`block truncate uppercase ${H3} group-hover:underline`} style={display}>
                  {title}
                </span>
                <span className="mt-1 block truncate text-sm font-medium">{song.artist}</span>
              </span>
              <span className="col-span-2 md:col-span-1">
                <SongScore song={song} palette={GEARS} className="h-5 border-2" gap={0} />
              </span>
              <span className="col-span-2 flex flex-wrap gap-2 text-xs font-bold uppercase md:col-span-1 md:justify-end">
                <span className="border-2 px-2 py-0.5" style={{ borderColor: INK.ink }}>
                  {song.style}
                </span>
                <span className="px-1 py-0.5">{song.difficultyLevel}</span>
                <span className="px-1 py-0.5 tabular-nums">
                  {duration} · {song.bpm} BPM
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <section className="grid gap-10 px-4 py-14 md:grid-cols-12 md:px-10 md:py-20" style={{ backgroundColor: INK.ink, color: INK.paper }}>
        <div className="md:col-span-5">
          <h2 className={`uppercase ${BIG}`} style={display}>
            Los colores
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm font-semibold">
            {allGears().map((gear) => (
              <li key={gear} className="flex items-center gap-2">
                <span className="h-4 w-6 shrink-0 border" style={{ backgroundColor: GEARS[gear], borderColor: INK.paper }} aria-hidden="true" />
                {gear}
              </li>
            ))}
          </ul>
        </div>
        <ol className="grid gap-6 md:col-span-7 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.word} className="border-t-4 pt-4" style={{ borderColor: POSTER_COLORS[index] }}>
              <p className={`uppercase ${H3}`} style={{ ...display, color: POSTER_COLORS[index] }}>
                {index + 1}. {step.word}
              </p>
              <p className="mt-2 text-sm">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-col items-start gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <ClaveMark color={INK.red} tickColor={INK.ink} className="h-6 w-48" />
        <p className="text-xs uppercase tracking-wider opacity-70">Art-direction mock-up, not the live site</p>
      </footer>
    </main>
  );
}
