import Image from "next/image";
import { CubanMusicHubClient } from "@/components/music/cuban-music-hub-client";
import { KICKER, TYPE } from "@/components/poster/poster-kit";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { SONG_COUNT, VENUE_INFO } from "@/lib/site-content";

export const metadata = {
  title: "Cuban Music & Social Playlists | Salsa Explosion Bournemouth",
  description:
    "Curated Cuban Son, Casino, and Timba music tracks recommended by Maestro Enrique Perez Valdes. Master timing, clave, and find beat 1 on the dance floor.",
};

const RADIO = MEDIA_MANIFEST.mockupGraphics.radio;

export default function CubanMusicPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl space-y-8 px-2.5 py-6 sm:px-6 lg:px-8">
      <header className="grid items-end gap-4 px-1.5 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className={KICKER}>Practica en casa · {SONG_COUNT} canciones</p>
          <h1 className={`mt-3 ${TYPE.hero}`}>
            La lista
            <span className="mt-4 block font-sans text-lg font-bold normal-case leading-snug tracking-normal md:text-2xl">
              Practise the class songs, section by section
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-lg font-medium">
            Every song from the Thursday and Sunday classes at {VENUE_INFO.shortName}. Pick one, press play, and dance what the
            music asks for: the player shows what to dance now and what comes next.
          </p>
        </div>
        <div className="md:col-span-4">
          <Image
            src={RADIO.src}
            alt={RADIO.alt}
            width={RADIO.width}
            height={RADIO.height}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="mx-auto w-full max-md:hidden"
          />
        </div>
      </header>

      <CubanMusicHubClient />
    </main>
  );
}
