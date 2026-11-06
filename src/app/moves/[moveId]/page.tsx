import type { Metadata } from "next";
import { clampDescription, moveTitle } from "@/lib/seo/search-snippets";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MoveBackBar, TrailLink } from "@/components/moves/move-back-bar";
import { CATEGORY_INK, CountStrip } from "@/components/moves/move-poster-card";
import { ProClipsSection } from "@/components/moves/pro-clips-section";
import { CancionesTabs } from "@/components/navigation/door-tabs";
import { KICKER, TYPE } from "@/components/poster/poster-kit";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { getVisibleMoves, isDraftPreviewEnabled, isTeacherChecked, songSectionsForMove } from "@/lib/moves/move-library";
import type { MoveStep } from "@/lib/moves/move-schema";
import { formatSongTime } from "@/lib/music/song-timing";
import { buildMoveJsonLd, jsonLdHtml } from "@/lib/seo/move-jsonld";
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
  const title = moveTitle(move.spanishName ?? move.name);
  const description = clampDescription(`${move.category} · ${move.level}. ${move.summary}`);
  return {
    title,
    description,
    alternates: { canonical: `/moves/${move.id}` },
    // Without these, a shared link shows the site's general title and description
    openGraph: { title, description, url: `/moves/${move.id}`, siteName: "Salsa Explosion", locale: "en_GB", type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [`/moves/${move.id}/opengraph-image`] },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildMoveJsonLd(move)) }} />
      <CancionesTabs current="/moves" />
      {isDraftPreviewEnabled() && (
        <p role="note" className="border-4 border-ink bg-poster-mustard px-4 py-3 text-sm font-bold text-ink">
          Local preview: this draft hasn&apos;t been checked by the teachers yet. The live site shows approved moves only.
        </p>
      )}

      <div className="space-y-3">
        <MoveBackBar moveId={move.id} moveName={move.spanishName ?? move.name} />

        {/* The move's poster */}
        <header className={cn("border-[6px] border-ink p-6 shadow-[12px_12px_0_var(--color-ink)] md:p-10", ink.bg, ink.text)}>
          <p className={KICKER}>
            {move.category} · {move.level} ·{" "}
            <span className="whitespace-nowrap">{move.eightCounts} × 8</span>
          </p>
          <h1 className={`mt-3 ${TYPE.section} max-[360px]:text-4xl`}>
            {move.spanishName ?? move.name}
            {move.spanishName && move.spanishName !== move.name && (
              <span className="mt-2 block font-sans text-lg font-bold normal-case leading-snug tracking-normal">{move.name}</span>
            )}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium">{move.summary}</p>
          <CountStrip eightCounts={move.eightCounts} cell={ink.cell} className="mt-6" />
          <p className="mt-2 text-xs font-bold uppercase tracking-wider">
            {isTeacherChecked(move)
              ? `Checked on the music by ${move.reviewedBy}`
              : "Spot something off? Tell a teacher in class"}
          </p>
        </header>
      </div>

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

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Image
            src={MEDIA_MANIFEST.mockupGraphics.footprints.src}
            alt=""
            width={MEDIA_MANIFEST.mockupGraphics.footprints.width}
            height={MEDIA_MANIFEST.mockupGraphics.footprints.height}
            sizes="5rem"
            className="w-16 shrink-0 sm:w-20"
          />
          <p className={KICKER}>Paso a paso · step by step</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Steps title="El que lleva" english="Leader" steps={move.leaderSteps} />
          <Steps title="La que sigue" english="Follower" steps={move.followerSteps} />
        </div>
      </div>

      <ProClipsSection moveId={move.id} />

      {sections.length > 0 && (
        <section aria-labelledby="songs-heading" className="space-y-4">
          <p className={KICKER}>Dónde bailarlo · where it fits</p>
          <h2 id="songs-heading" className={TYPE.section}>
            En las canciones
          </h2>
          <ul className="grid min-w-0 max-w-full gap-3 md:grid-cols-2">
            {sections.map((link) => (
              <li key={`${link.songId}-${link.sectionId}`} className="min-w-0 max-w-full">
                <Link
                  href={`/music/${link.songId}?section=${link.sectionId}`}
                  className="flex min-h-[64px] min-w-0 max-w-full items-center gap-4 border-4 border-ink bg-paper px-4 py-3 hover:bg-poster-mustard"
                >
                  <span className="font-display text-xl tabular-nums shrink-0">{formatSongTime(link.startTimeSeconds)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words font-bold">{songTitle(link.songId)}</span>
                    <span className="block break-words text-sm">{link.sectionName}</span>
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
                        <TrailLink
                          fromMoveId={move.id}
                          href={`/moves/${before.id}`}
                          className="inline-flex min-h-[40px] items-center font-bold underline underline-offset-4"
                        >
                          {before.spanishName ?? before.name}
                        </TrailLink>
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
          <Link href="/rueda/tarjetas" className="font-bold underline underline-offset-4">
            Practise the calls →
          </Link>
        </p>
      )}
    </main>
  );
}
