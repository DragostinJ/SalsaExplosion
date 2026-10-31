import Link from "next/link";
import { ChevronRight, Music2 } from "lucide-react";
import type { ClassSongSummary } from "@/lib/music/class-songs";

interface ClassSongLinksProps {
  songs: readonly ClassSongSummary[];
  heading?: string;
}

/** Songs a teacher linked to a class, each opening the practice player. Renders nothing when empty. */
export function ClassSongLinks({ songs, heading = "Tonight's songs" }: ClassSongLinksProps) {
  if (songs.length === 0) return null;

  return (
    <section aria-label={heading} className="space-y-2" data-testid="class-song-links">
      <h2 className="text-xs font-black uppercase tracking-widest text-gold">{heading}</h2>
      <ul className="grid grid-cols-1 gap-2">
        {songs.map((song) => (
          <li key={song.id}>
            <Link
              href={`/music/${song.id}`}
              className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3 transition-colors hover:border-gold/50 focus-visible:outline-2 focus-visible:outline-gold"
            >
              <Music2 className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ivory">{song.title}</p>
                <p className="truncate text-xs text-ivory-muted">
                  {song.artist} · {song.style} · practise every section
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-ivory-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
