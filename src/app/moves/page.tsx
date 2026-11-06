import Image from "next/image";
import { MoveLibraryFilters, type FamilyArt } from "@/components/moves/move-library-filters";
import { toMoveCardData } from "@/components/moves/move-poster-card";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { CancionesTabs } from "@/components/navigation/door-tabs";
import { KICKER, POSTER_BLOCKS, TYPE } from "@/components/poster/poster-kit";
import { getVisibleMoves, isDraftPreviewEnabled } from "@/lib/moves/move-library";
import { MOVE_FAMILIES } from "@/lib/site-content";

export const metadata = {
  title: "La biblioteca de pasos: the move library",
  description:
    "Cuban casino figures, rueda calls, shines and body movement: what the leader and the follower do, how many 8-counts it takes, and the songs where it fits.",
  alternates: { canonical: "/moves" },
};

const art = MEDIA_MANIFEST.mockupGraphics;
const pick = ({ src, width, height }: { src: string; width: number; height: number }) => ({ src, width, height });
const FAMILY_ART: FamilyArt = {
  "Casino figure": pick(art.familyCasino),
  "Rueda call": pick(art.familyRueda),
  "Shine / suelta": pick(art.familyShine),
  "Body movement": pick(art.familyBody),
  Rumba: pick(art.familyRumba),
  Son: pick(art.familySon),
  Reparto: pick(art.familyReparto),
  "Afro-Cuban Orishas": pick(art.familyOrishas),
};

/** The whole library is public (owner, 2026-11-02) except moves a teacher rejected or marked as needing work. */
export default function MovesPage() {
  // Only the fields the cards and the search use: the full moves (steps, notes, mistakes) would
  // triple the size of this page.
  const moves = getVisibleMoves().map(toMoveCardData);
  const preview = isDraftPreviewEnabled();

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl space-y-10 px-2.5 py-6 sm:px-6 lg:px-8">
      <CancionesTabs current="/moves" />
      {preview && (
        <p role="note" className="border-4 border-ink bg-poster-mustard px-4 py-3 text-sm font-bold text-ink">
          Local preview: this also shows moves a teacher marked as needing work. The live site hides those and rejected ones.
        </p>
      )}
      <header className="px-1.5">
        <p className={KICKER}>
          Practica en casa · {moves.length} {moves.length === 1 ? "paso" : "pasos"}
        </p>
        <h1 className={`mt-3 ${TYPE.section}`}>
          La biblioteca de pasos
          <span className="mt-3 block font-sans text-lg font-bold normal-case leading-snug tracking-normal">The move library</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-medium">
          Casino figures, rueda calls, shines and more: what the leader and the follower do, how many 8-counts it takes, and the
          songs where it fits. Spot something off? Tell a teacher in class and they&apos;ll fix it or take it down.
        </p>
      </header>

      {moves.length === 0 ? (
        <section aria-labelledby="coming-heading" className="space-y-8">
          <div className="flex items-center gap-6 border-4 border-ink bg-poster-mustard p-6 text-ink">
            <div className="flex-1">
              <h2 id="coming-heading" className={TYPE.card}>
                Próximamente · coming soon
              </h2>
              <p className="mt-2 max-w-2xl font-medium">
                Maestro Enrique is checking every move on the music. The first ones appear here as soon as they&apos;re approved.
              </p>
            </div>
            <Image
              src={MEDIA_MANIFEST.mockupGraphics.camera.src}
              alt=""
              width={MEDIA_MANIFEST.mockupGraphics.camera.width}
              height={MEDIA_MANIFEST.mockupGraphics.camera.height}
              sizes="8rem"
              className="hidden w-32 shrink-0 sm:block"
            />
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MOVE_FAMILIES.map((family, index) => {
              const block = POSTER_BLOCKS[index % POSTER_BLOCKS.length];
              return (
                <li key={family.name} className={`border-4 border-ink ${block.bg}`}>
                  <div className="relative m-3 aspect-[4/3] overflow-hidden border-4 border-ink">
                    <Image src={family.photo.src} alt={family.photo.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                  </div>
                  <div className={`px-4 pb-5 ${block.text}`}>
                    <h3 className={`font-display ${TYPE.card}`}>{family.spanish}</h3>
                    <p className="mt-1 text-sm font-medium">
                      {family.name}: {family.note}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <MoveLibraryFilters moves={moves} familyArt={FAMILY_ART} />
      )}
    </main>
  );
}
