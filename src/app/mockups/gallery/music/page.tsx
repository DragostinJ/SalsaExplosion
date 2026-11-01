import Image from "next/image";
import Link from "next/link";
import { ClaveMark, MockupSwitcher, SongScore } from "@/components/mockups/mockup-art";
import { GEARS, H1, H3, WALL, WallLabel, instrument, serif } from "@/components/mockups/gallery-theme";
import { PHOTOS, PRACTICE_SONGS, SONG_COUNT, VENUE_INFO, allGears } from "@/components/mockups/mockup-data";

export const metadata = { title: "Mock-up · Gallery · Songs" };

export default function GalleryMusicMockupPage() {
  return (
    <main
      className={`${instrument.variable} min-h-screen`}
      style={{ backgroundColor: WALL.obsidian, color: WALL.ivory, fontFamily: "var(--font-geist-sans)" }}
    >
      <MockupSwitcher current="gallery" page="music" />

      <header className="px-4 pb-14 pt-10 md:px-12 md:pt-16">
        <div className="border p-2" style={{ borderColor: WALL.line, backgroundColor: WALL.frame }}>
          <Image
            src={PHOTOS.congaStage.src}
            alt={PHOTOS.congaStage.alt}
            width={PHOTOS.congaStage.width}
            height={PHOTOS.congaStage.height}
            sizes="100vw"
            className="aspect-[16/9] w-full object-cover md:aspect-[21/8]"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <WallLabel number={1} title="Tumbadora at night" medium="The room before the music starts" note="Editorial image" />
        <div className="mt-12 grid gap-8 md:grid-cols-12 md:items-end">
          <h1 className={`md:col-span-7 ${H1}`} style={serif}>
            The <em style={{ color: WALL.crimson }}>catalogue</em>
          </h1>
          <p className="text-sm md:col-span-5" style={{ color: WALL.ash }}>
            {SONG_COUNT} works from the Thursday and Sunday classes at {VENUE_INFO.name}, each scored section by section.
            Open one and the player shows what to dance now, and what comes next.
          </p>
        </div>
      </header>

      <ol className="border-t px-4 md:px-12" style={{ borderColor: WALL.line }}>
        {PRACTICE_SONGS.map(({ song, title, duration }, index) => (
          <li key={song.id} className="border-b" style={{ borderColor: WALL.line }}>
            <Link
              href={`/music/${song.id}`}
              className="group grid min-h-[96px] gap-x-8 gap-y-3 py-6 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,22rem)] md:items-center"
            >
              <span className="text-xs uppercase tracking-widest" style={{ color: WALL.amber }}>
                Cat. {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className={`block truncate ${H3} group-hover:italic`} style={serif}>
                  {title}
                </span>
                <span className="mt-1 block truncate text-xs uppercase tracking-widest" style={{ color: WALL.ash }}>
                  {song.artist} · {song.style} · {song.difficultyLevel} · {duration} · {song.bpm} BPM
                </span>
              </span>
              <SongScore song={song} palette={GEARS} className="h-2" gap={2} />
            </Link>
          </li>
        ))}
      </ol>

      <section className="px-4 py-16 md:px-12">
        <p className="text-xs uppercase tracking-widest" style={{ color: WALL.ash }}>
          Key to the scores
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {allGears().map((gear) => (
            <li key={gear} className="flex items-center gap-2">
              <span className="h-2 w-8" style={{ backgroundColor: GEARS[gear] }} aria-hidden="true" />
              {gear}
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex flex-col gap-5 border-t px-4 py-12 md:flex-row md:items-center md:justify-between md:px-12" style={{ borderColor: WALL.line }}>
        <ClaveMark color={WALL.crimson} tickColor={WALL.ash} className="h-5 w-40" />
        <p className="text-xs uppercase tracking-widest" style={{ color: WALL.ash }}>
          Art-direction mock-up, not the live site
        </p>
      </footer>
    </main>
  );
}
