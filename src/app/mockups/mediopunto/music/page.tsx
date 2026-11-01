import Image from "next/image";
import Link from "next/link";
import { ClaveMark, MockupSwitcher, SongFan } from "@/components/mockups/mockup-art";
import { GEARS, GLASS, H1, H3, TileBand, cormorant, jost, serif } from "@/components/mockups/mediopunto-theme";
import { PHOTOS, PRACTICE_SONGS, SONG_COUNT, VENUE_INFO, allGears } from "@/components/mockups/mockup-data";

export const metadata = { title: "Mock-up · Mediopunto · Songs" };

export default function MediopuntoMusicMockupPage() {
  return (
    <main
      className={`${cormorant.variable} ${jost.variable} min-h-screen`}
      style={{ backgroundColor: GLASS.night, color: GLASS.ivory, fontFamily: "var(--mp-text)" }}
    >
      <MockupSwitcher current="mediopunto" page="music" />

      <header className="px-4 pb-14 pt-10 text-center md:px-10">
        <Image
          src={PHOTOS.mediopuntoWindow.src}
          alt={PHOTOS.mediopuntoWindow.alt}
          width={PHOTOS.mediopuntoWindow.width}
          height={PHOTOS.mediopuntoWindow.height}
          sizes="(max-width: 1024px) 100vw, 64rem"
          className="mx-auto w-full max-w-5xl rounded-t-[50%]"
          loading="eager"
          fetchPriority="high"
        />
        <p className="mt-10 text-xs uppercase tracking-[0.35em]" style={{ color: GLASS.amber }}>
          Practise at home · {SONG_COUNT} songs
        </p>
        <h1 className={`mt-3 italic ${H1}`} style={serif}>
          {SONG_COUNT} songs, {SONG_COUNT} windows
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg font-light">
          Each window is a song from the classes at {VENUE_INFO.shortName}. Every pane is one section, sized by how long it
          lasts and coloured by how to dance it. Choose one and the player lights it up as the music plays.
        </p>
      </header>

      <TileBand />
      <section className="px-4 py-16 md:px-10 md:py-20" style={{ backgroundColor: GLASS.plaster, color: GLASS.night }}>
        <ul className="mx-auto grid max-w-6xl gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICE_SONGS.map(({ song, title, duration }) => (
            <li key={song.id}>
              <Link href={`/music/${song.id}`} className="group block text-center">
                <SongFan song={song} palette={GEARS} lead={GLASS.lead} className="w-full transition-transform group-hover:-translate-y-1" />
                <p className={`mt-3 italic ${H3}`} style={serif}>
                  {title}
                </p>
                <p className="text-sm">{song.artist}</p>
                <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: GLASS.ruby }}>
                  {song.style} · {song.difficultyLevel} · {duration}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mx-auto mt-16 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-3 border-t pt-8 text-sm" style={{ borderColor: GLASS.lead }}>
          {allGears().map((gear) => (
            <li key={gear} className="flex items-center gap-2">
              <span className="h-3 w-6 rounded-t-full" style={{ backgroundColor: GEARS[gear] }} aria-hidden="true" />
              {gear}
            </li>
          ))}
        </ul>
      </section>
      <TileBand />

      <footer className="flex flex-col items-center gap-4 px-4 py-12 text-center">
        <ClaveMark color={GLASS.amber} className="h-6 w-48" />
        <p className="text-xs uppercase tracking-widest opacity-60">Art-direction mock-up, not the live site</p>
      </footer>
    </main>
  );
}
