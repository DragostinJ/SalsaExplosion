import Image from "next/image";
import { MovePosterCard } from "@/components/moves/move-poster-card";
import { CancionesTabs } from "@/components/navigation/door-tabs";
import { KICKER, POSTER_BLOCKS, TYPE } from "@/components/poster/poster-kit";
import { getPublishedMoves } from "@/lib/moves/move-library";
import { MOVE_CATEGORIES } from "@/lib/moves/move-schema";
import { MOVE_FAMILIES } from "@/lib/site-content";

export const metadata = {
  title: "La biblioteca de pasos: the move library",
  description:
    "Cuban casino figures, rueda calls, shines and body movement taught at Salsa Explosion, each checked by the teachers on the music: steps for leader and follower, counts and videos.",
  alternates: { canonical: "/moves" },
};

/** Dancers only ever see moves a teacher approved with the counts checked on the music. */
export default function MovesPage() {
  const moves = getPublishedMoves();
  const families = MOVE_CATEGORIES.map((category) => ({
    category,
    moves: moves.filter((move) => move.category === category),
  })).filter((family) => family.moves.length > 0);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl space-y-10 px-2.5 py-6 sm:px-6 lg:px-8">
      <CancionesTabs current="/moves" />
      <header className="px-1.5">
        <p className={KICKER}>
          Practica en casa · {moves.length} {moves.length === 1 ? "paso" : "pasos"}
        </p>
        <h1 className={`mt-3 ${TYPE.section}`}>
          La biblioteca de pasos
          <span className="mt-3 block font-sans text-lg font-bold normal-case leading-snug tracking-normal">The move library</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-medium">
          Every move from the classes: what the leader and the follower do, how many 8-counts it takes, and the songs where it
          fits. A teacher checks each one on the music before it appears here.
        </p>
      </header>

      {families.length === 0 ? (
        <section aria-labelledby="coming-heading" className="space-y-8">
          <div className="border-4 border-ink bg-poster-mustard p-6 text-ink">
            <h2 id="coming-heading" className={TYPE.card}>
              Próximamente · coming soon
            </h2>
            <p className="mt-2 max-w-2xl font-medium">
              Maestro Enrique is checking every move on the music. The first ones appear here as soon as they&apos;re approved.
            </p>
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
        families.map((family) => (
          <section key={family.category} aria-labelledby={`family-${family.category}`} className="space-y-4">
            <h2 id={`family-${family.category}`} className={TYPE.section}>
              {family.category}
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {family.moves.map((move, index) => (
                <li key={move.id}>
                  <MovePosterCard move={move} number={index + 1} href={`/moves/${move.id}`} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
