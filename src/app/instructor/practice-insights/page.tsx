import type { Metadata } from "next";
import Link from "next/link";
import { Repeat, Undo2 } from "lucide-react";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { getPracticeHotspotsAction } from "@/actions/practice-stats.actions";
import { formatSongTime } from "@/lib/music/song-timing";
import { buildSectionLink } from "@/lib/music/section-link";

export const metadata: Metadata = {
  title: "Practice Hotspots | Salsa Explosion Faculty",
  description: "Song sections students loop or replay most in the practice player.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DAYS = 30;

export default async function PracticeInsightsPage() {
  await requireRole(STAFF_ROLES);
  const hotspots = await getPracticeHotspotsAction(DAYS);

  return (
    <div className="min-h-screen bg-canvas text-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <InstructorNav />
        <h1 className="font-display text-2xl font-bold">Practice hotspots</h1>
        <p className="mt-1 mb-6 text-sm text-ivory-muted">
          Sections students looped or went back to most in the last {DAYS} days: a good list of what to cover in
          class. Counts are anonymous and each visitor counts once per section.
        </p>

        {hotspots.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface-2 p-4 text-sm text-ivory-muted">
            No practice data yet. It appears as students loop sections or tap &ldquo;previous&rdquo; in the player.
          </p>
        ) : (
          <ol className="space-y-2" data-testid="practice-hotspots">
            {hotspots.map((spot, index) => (
              <li key={`${spot.songId}-${spot.sectionId}`}>
                <Link
                  href={buildSectionLink("", spot.songId, spot.sectionId)}
                  className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3 transition-colors hover:border-gold/50"
                >
                  <span className="w-6 shrink-0 text-center font-mono text-sm text-gold">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{spot.sectionName}</p>
                    <p className="truncate text-xs text-ivory-muted">
                      {spot.songTitle} · {formatSongTime(spot.startTimeSeconds)}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs" title="Times looped">
                    <Repeat className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                    {spot.loops}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs" title="Times replayed">
                    <Undo2 className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                    {spot.replays}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
