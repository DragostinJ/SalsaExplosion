import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_INK, CountStrip } from "@/components/moves/move-poster-card";
import { CancionesTabs } from "@/components/navigation/door-tabs";
import { KICKER, TYPE } from "@/components/poster/poster-kit";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { getVisibleMoves, isDraftPreviewEnabled, songSectionsForMove } from "@/lib/moves/move-library";
import type { MoveStep } from "@/lib/moves/move-schema";
import { formatSongTime } from "@/lib/music/song-timing";
import { displaySongTitle } from "@/lib/music/song-style";
import { cn } from "@/lib/utils";

interface MovePageProps {
  params: Promise<{ moveId: string }>;
}

// Moves are published by a reviewed data change and a deploy, so every page is built ahead
export function generateStaticParams() {
  return getVisibleMoves().map((move) => ({ moveId: move.id }));
}
export const dynamicParams = false;

function findPublished(moveId: string) {
  return getVisibleMoves().find((move) => move.id === moveId);
}

export async function generateMetadata({ params }: MovePageProps): Promise<Metadata> {
  const move = findPublished((await params).moveId);
  if (!move) return {};
  return {
    title: `${move.spanishName ?? move.name}: how to dance it`,
    description: `${move.category} · ${move.level}. ${move.summary}`.slice(0, 160),
    alternates: { canonical: `/moves/${move.id}` },
  };
}

function Steps({ title, english, steps }: { title: string; english: string; steps: readonly MoveStep[] }) {
  return (
    <section className="border-4 border-ink bg-paper p-5">
      <h2 className={TYPE.card}>
        {title}
        <span className="mt-1 block font-sans text-sm font-bold normal-case tracking-normal">{english}</span>
      </h2>
      <ol className="mt-4 border-t-4 border-ink">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4 border-b-2 border-ink py-3">
            <span className="w-20 shrink-0 font-display text-xl">{step.counts}</span>
            <span className="text-sm">{step.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default async function MovePage({ params }: MovePageProps) {
  const move = findPublished((await params).moveId);
  if (!move) notFound();

  const ink = CATEGORY_INK[move.category];
  const video = move.videos[0];
  const sections = songSectionsForMove(move.id);
  const published = new Map(getVisibleMoves().map((m) => [m.id, m]));
  const songTitle = (songId: string) => {
    const song = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === songId);
    return song ? displaySongTitle(song.title) : songId;
  };

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl space-y-10 px-2.5 py-6 sm:px-6">
      <CancionesTabs current="/moves" />
      {isDraftPreviewEnabled() && (
        <p role="note" className="border-4 border-ink bg-poster-mustard px-4 py-3 text-sm font-bold text-ink">
          Local preview: this draft hasn&apos;t been checked by the teachers yet. The live site shows approved moves only.
        </p>
      )}

      {/* The move's poster */}
      <header className={cn("border-[6px] border-ink p-6 shadow-[12px_12px_0_var(--color-ink)] md:p-10", ink.bg, ink.text)}>
        <p className={KICKER}>
          {move.category} · {move.level} · {move.eightCounts} × 8
        </p>
        <h1 className={`mt-3 ${TYPE.section}`}>
          {move.spanishName ?? move.name}
          {move.spanishName && move.spanishName !== move.name && (
            <span className="mt-2 block font-sans text-lg font-bold normal-case leading-snug tracking-normal">{move.name}</span>
          )}
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-medium">{move.summary}</p>
        <CountStrip eightCounts={move.eightCounts} cell={ink.cell} className="mt-6" />
        <p className="mt-2 text-xs font-bold uppercase tracking-wider">Checked on the music by {move.reviewedBy}</p>
      </header>

      {video && (
        <section aria-labelledby="video-heading" className="space-y-3">
          <h2 id="video-heading" className={TYPE.card}>
            Míralo · watch it
          </h2>
          {/* Official embedded player only, never covered or hidden (YouTube terms) */}
          <div className="aspect-video w-full border-4 border-ink bg-ink">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?rel=0${video.startSeconds !== undefined ? `&start=${Math.floor(video.startSeconds)}` : ""}${video.endSeconds !== undefined ? `&end=${Math.floor(video.endSeconds)}` : ""}`}
              title={`${video.title} (${video.channelTitle})`}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="h-full w-full"
            />
          </div>
          <p className="text-sm">
            {video.title} · {video.channelTitle}
          </p>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Steps title="El que lleva" english="Leader" steps={move.leaderSteps} />
        <Steps title="La que sigue" english="Follower" steps={move.followerSteps} />
      </div>

      {sections.length > 0 && (
        <section aria-labelledby="songs-heading" className="space-y-4">
          <p className={KICKER}>Dónde bailarlo · where it fits</p>
          <h2 id="songs-heading" className={TYPE.section}>
            En las canciones
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {sections.map((link) => (
              <li key={`${link.songId}-${link.sectionId}`}>
                <Link
                  href={`/music/${link.songId}?section=${link.sectionId}`}
                  className="flex min-h-[64px] items-center gap-4 border-4 border-ink bg-paper px-4 py-3 hover:bg-poster-mustard"
                >
                  <span className="font-display text-xl tabular-nums">{formatSongTime(link.startTimeSeconds)}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{songTitle(link.songId)}</span>
                    <span className="block truncate text-sm">{link.sectionName}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(move.commonMistakes.length > 0 || move.variations.length > 0 || move.prerequisites.length > 0) && (
        <div className="grid gap-6 md:grid-cols-3">
          {move.commonMistakes.length > 0 && (
            <section className="border-t-4 border-ink pt-3">
              <h2 className={TYPE.card}>Ojo · watch out</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                {move.commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </section>
          )}
          {move.variations.length > 0 && (
            <section className="border-t-4 border-ink pt-3">
              <h2 className={TYPE.card}>Variaciones</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                {move.variations.map((variation) => (
                  <li key={variation}>{variation}</li>
                ))}
              </ul>
            </section>
          )}
          {move.prerequisites.length > 0 && (
            <section className="border-t-4 border-ink pt-3">
              <h2 className={TYPE.card}>Antes · learn first</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {move.prerequisites.map((id) => {
                  const before = published.get(id);
                  return (
                    <li key={id}>
                      {before ? (
                        <Link href={`/moves/${before.id}`} className="inline-flex min-h-[40px] items-center font-bold underline underline-offset-4">
                          {before.spanishName ?? before.name}
                        </Link>
                      ) : (
                        id
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}

      {move.ruedaCall && (
        <p className="border-4 border-ink bg-poster-mustard p-4 font-medium text-ink">
          In the rueda this is called <strong>{move.ruedaCall}</strong>.{" "}
          <Link href="/dashboard/rueda/tarjetas" className="font-bold underline underline-offset-4">
            Practise the calls →
          </Link>
        </p>
      )}
    </main>
  );
}
