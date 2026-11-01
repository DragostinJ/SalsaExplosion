import Link from "next/link";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { DANCE_GEAR_LEGEND } from "@/lib/music/dance-gear-legend";
import { formatSongTime } from "@/lib/music/song-timing";
import { displaySongTitle } from "@/lib/music/song-style";
import { cn } from "@/lib/utils";

/** Number inks for the poster rows (all read on paper) */
const NUMBER_INKS = ["text-poster-red", "text-poster-teal", "text-poster-blue", "text-ink"];

/** Song list for /music: each numbered poster row opens the full-screen practice player. */
export function SongPracticeList() {
  return (
    <section aria-labelledby="practice-mode-heading">
      <h2 id="practice-mode-heading" className="sr-only">
        Practice mode: what to dance in every section
      </h2>
      <ol className="border-t-4 border-ink">
        {TIMBA_SONG_ANATOMY_DATA.map((song, index) => (
          <li key={song.id} className="border-b-4 border-ink">
            <Link
              href={`/music/${song.id}`}
              className="group grid min-h-[88px] grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 gap-y-3 px-2 py-4 transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-gold md:grid-cols-[5rem_minmax(0,1fr)_16rem_12rem] md:items-center md:px-4"
            >
              <span className={cn("font-display text-5xl leading-none tabular-nums", NUMBER_INKS[index % NUMBER_INKS.length])}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-3xl leading-none group-hover:underline">
                  {displaySongTitle(song.title)}
                </span>
                <span className="mt-1 block truncate text-sm font-medium">{song.artist}</span>
              </span>
              {/* Mini song map in the shared gear inks */}
              <span className="col-span-2 flex h-5 border-2 border-ink md:col-span-1" aria-hidden="true">
                {song.segments.map((segment) => (
                  <span
                    key={segment.id}
                    className={cn("h-full", DANCE_GEAR_LEGEND[segment.danceGear].fillClass)}
                    style={{ flexGrow: Math.max(segment.endTimeSeconds - segment.startTimeSeconds, 1) }}
                  />
                ))}
              </span>
              <span className="col-span-2 flex flex-wrap gap-2 text-xs font-bold uppercase md:col-span-1 md:justify-end">
                <span data-testid="song-style-chip" className="border-2 border-ink px-2 py-0.5">{song.style}</span>
                <span className="px-1 py-0.5">{song.difficultyLevel}</span>
                <span className="px-1 py-0.5 tabular-nums">
                  {formatSongTime(song.durationSeconds)} · {song.bpm} BPM
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
