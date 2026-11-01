import Image from "next/image";
import Link from "next/link";
import { MockupSwitcher, SongScore } from "@/components/mockups/mockup-art";
import { GEARS as CARD_GEARS } from "@/components/mockups/gallery-theme";
import {
  FEATURED_SONG,
  MOCKUP_DIRECTIONS,
  PHOTOS,
  SCORE_SONGS,
  SONG_COUNT,
  type GearPalette,
} from "@/components/mockups/mockup-data";
import { displaySongTitle } from "@/lib/music/song-style";

export const metadata = { title: "Compare art directions" };

/** Each direction's look, summarised for the comparison cards. */
const CARD_STYLE = {
  icaic: {
    background: "#F1E6D0",
    text: "#161311",
    accent: "#E4412B",
    swatches: ["#E4412B", "#F4B41A", "#12938F", "#22418F", "#161311"],
    fonts: "Anton + Archivo",
    photo: PHOTOS.laVueltaHero,
  },
  mediopunto: {
    background: "#120E0C",
    text: "#F5F2EB",
    accent: "#E0A02A",
    swatches: ["#A3212C", "#E0A02A", "#23509A", "#1F7552", "#EFE5D3"],
    fonts: "Cormorant Garamond + Jost",
    photo: PHOTOS.mediopuntoLight,
  },
  gallery: {
    background: "#080706",
    text: "#F5F2EB",
    accent: "#DC2626",
    swatches: ["#080706", "#F5F2EB", "#DC2626", "#F59E0B", "#9A9187"],
    fonts: "Instrument Serif + Geist",
    photo: PHOTOS.rumbaSolar,
  },
} as const;

export default function MockupComparePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <MockupSwitcher current="compare" />
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Salsa Explosion · art direction</p>
        <h1 className="mt-3 text-4xl font-bold md:text-6xl">Three directions, same content</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Every page uses the same real schedule, prices, venue and songs. Only the look changes. Open each one on your
          phone too: the layouts are built for it.
        </p>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {MOCKUP_DIRECTIONS.map((direction) => {
            const style = CARD_STYLE[direction.slug];
            const palette = Object.fromEntries(
              FEATURED_SONG.segments.map((segment, index) => [segment.danceGear, style.swatches[index % style.swatches.length]])
            ) as GearPalette;
            return (
              <li
                key={direction.slug}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10"
                style={{ backgroundColor: style.background, color: style.text }}
              >
                <Link href={`/mockups/${direction.slug}`} tabIndex={-1} aria-hidden="true">
                  <Image
                    src={style.photo.src}
                    alt=""
                    width={style.photo.width}
                    height={style.photo.height}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="aspect-[16/10] w-full object-cover transition-opacity hover:opacity-90"
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2 className="text-2xl font-bold">{direction.name}</h2>
                  <p className="text-sm opacity-80">{direction.summary}</p>
                  <div className="flex gap-1.5" aria-label="Palette">
                    {style.swatches.map((swatch) => (
                      <span key={swatch} className="h-6 flex-1 rounded border border-white/10" style={{ backgroundColor: swatch }} />
                    ))}
                  </div>
                  <SongScore song={FEATURED_SONG} palette={palette} className="h-2" gap={2} />
                  <p className="text-xs uppercase tracking-wider opacity-70">Type: {style.fonts}</p>
                  <div className="mt-auto flex flex-wrap gap-x-5">
                    <Link href={`/mockups/${direction.slug}`} className="inline-flex min-h-[44px] items-center font-semibold" style={{ color: style.accent }}>
                      Home →
                    </Link>
                    <Link href={`/mockups/${direction.slug}/music`} className="inline-flex min-h-[44px] items-center font-semibold" style={{ color: style.accent }}>
                      Song list →
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 rounded-2xl border border-white/10 p-5 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Already working on the live site</p>
          <h2 className="mt-2 text-2xl font-bold">The practice player</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Whichever look you choose, this is what dancers use at home today: every section of the song, what to dance
            now and what comes next, in time with the music. Best on a phone.
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {SCORE_SONGS.map((song) => (
              <li key={song.id}>
                <Link href={`/music/${song.id}`} className="block rounded-xl border border-white/10 p-4 hover:border-white/30">
                  <span className="block font-semibold">{displaySongTitle(song.title)}</span>
                  <span className="block text-xs uppercase tracking-wider text-white/60">
                    {song.artist} · {song.segments.length} sections
                  </span>
                  <SongScore song={song} palette={CARD_GEARS} className="mt-3 h-2" gap={2} />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/music" className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-amber-400">
            All {SONG_COUNT} songs →
          </Link>
        </div>

        <p className="mt-10 text-sm text-white/60">
          Photos: AI-generated editorial images for atmosphere (prompts in docs/design-and-roadmap). Teachers and the
          venue use real photos. These pages are hidden from search engines.
        </p>
      </section>
    </main>
  );
}
