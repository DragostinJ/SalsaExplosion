import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { DANCE_GEAR_LEGEND } from "@/lib/music/dance-gear-legend";
import { formatSongTime } from "@/lib/music/song-timing";
import { cn } from "@/lib/utils";

/** Song list for /music: each row opens the full-screen practice player. */
export function SongPracticeList() {
  return (
    <section aria-labelledby="practice-mode-heading" className="space-y-2">
      <h2 id="practice-mode-heading" className="text-xs font-black uppercase tracking-widest text-gold">
        Practice mode · what to dance in every section
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {TIMBA_SONG_ANATOMY_DATA.map((song) => (
          <li key={song.id}>
            <Link
              href={`/music/${song.id}`}
              className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3 transition-colors hover:border-gold/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ivory">
                  {song.title.replace(/\s*\(Official Video\)/i, "")}
                </p>
                <p className="truncate text-xs text-ivory-muted">
                  {song.artist} · {song.difficultyLevel} · {formatSongTime(song.durationSeconds)}
                </p>
                {/* Mini song map in the shared gear colours */}
                <div className="mt-1.5 flex h-1.5 gap-px overflow-hidden rounded-full" aria-hidden="true">
                  {song.segments.map((segment) => (
                    <span
                      key={segment.id}
                      className={cn("h-full", DANCE_GEAR_LEGEND[segment.danceGear].fillClass)}
                      style={{
                        width: `${((segment.endTimeSeconds - segment.startTimeSeconds) / song.durationSeconds) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-ivory-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
