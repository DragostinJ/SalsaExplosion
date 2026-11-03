import { KICKER, TYPE } from "@/components/poster/poster-kit";
import { getProClipsForMove, type StoredProClip } from "@/lib/moves/pro-clips";
import { formatSongTime } from "@/lib/music/song-timing";
import { joinDancerNames } from "@/lib/music/song-style";

/**
 * "Bailado por los pros": moments from professional dancers' YouTube clips where this move is
 * danced. Only rows a teacher confirmed against the video reach this list (pro-clips.json), so
 * nothing shows until the review desk at /instructor/clips has been used.
 */
export function ProClipsSection({ moveId, clips }: { moveId: string; clips?: readonly StoredProClip[] }) {
  const matches = getProClipsForMove(moveId, clips);
  if (matches.length === 0) return null;

  return (
    <section aria-labelledby="pros-heading" className="space-y-4">
      <p className={KICKER}>Los profesionales · danced by the pros</p>
      <h2 id="pros-heading" className={TYPE.section}>
        Bailado por los pros
      </h2>
      <ul className="grid gap-6 md:grid-cols-2">
        {matches.map(({ clip, matchingRows }) => {
          const first = matchingRows[0]!;
          const dancers = joinDancerNames(clip.dancers);
          return (
            <li key={clip.id} className="space-y-3 border-4 border-ink bg-paper p-4 text-ink">
              {/* Official embedded player only, never covered or hidden (YouTube terms) */}
              <div className="aspect-video w-full border-4 border-ink bg-ink">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${clip.youtubeVideoId}?rel=0&start=${Math.floor(first.startSeconds)}&end=${Math.ceil(first.endSeconds)}`}
                  title={`${dancers}: ${clip.title} (${clip.channelTitle})`}
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="h-full w-full"
                />
              </div>
              <p className="text-sm font-bold">
                {dancers} · {clip.channelTitle}
              </p>
              <ol className="space-y-2">
                {matchingRows.map((row) => (
                  <li key={row.startSeconds} className="border-t-2 border-ink pt-2 text-sm">
                    <a
                      href={`https://www.youtube.com/watch?v=${clip.youtubeVideoId}&t=${Math.floor(row.startSeconds)}s`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center font-bold tabular-nums underline underline-offset-4"
                    >
                      {formatSongTime(row.startSeconds)} – {formatSongTime(row.endSeconds)}
                    </a>
                    <p>{row.mechanics}</p>
                    {row.musicalMoment && <p className="mt-1 text-xs font-bold uppercase tracking-wider">{row.musicalMoment}</p>}
                  </li>
                ))}
              </ol>
              <p className="text-xs font-bold uppercase tracking-wider">Checked against the video by {clip.reviewedBy}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
