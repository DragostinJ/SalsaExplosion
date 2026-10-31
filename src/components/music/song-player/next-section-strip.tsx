"use client";

import type { SongSegment } from "@/lib/constants/timba-song-anatomy";
import { DANCE_GEAR_LEGEND, ENERGY_LABELS } from "@/lib/music/dance-gear-legend";
import { formatSongTime } from "@/lib/music/song-timing";
import { cn } from "@/lib/utils";

interface NextSectionStripProps {
  next: SongSegment | undefined;
  isGetReady: boolean;
  isQuiz: boolean;
  /** Real seconds (playback rate applied) until the next section starts */
  secondsUntilNext: number | null;
}

/**
 * The NEXT strip under the NOW card. It keeps one fixed height: both rows are
 * single lines, and the final section uses the same layout. Otherwise "Get ready ·
 * Casino smooth · Medium" wrapped on 360px phones and the last section swapped in
 * a shorter box, so the NOW card jumped right at a section change.
 */
export function NextSectionStrip({ next, isGetReady, isQuiz, secondsUntilNext }: NextSectionStripProps) {
  const gear = next ? DANCE_GEAR_LEGEND[next.danceGear] : null;
  const highlight = isGetReady && !isQuiz ? gear : null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2 transition-colors",
        highlight ? cn(highlight.chipClass, "animate-pulse") : "border-line bg-surface-2"
      )}
    >
      <span
        className={cn("h-8 w-1.5 shrink-0 rounded-full", gear && !isQuiz ? gear.fillClass : "bg-line")}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-ivory-muted">
          {!next || !gear
            ? "Final section"
            : isQuiz
              ? "Next · listen for it"
              : `${isGetReady ? "Get ready" : "Next"} · ${gear.shortLabel} · ${ENERGY_LABELS[gear.energy]}`}
        </p>
        <p className="truncate text-sm font-semibold">
          {!next ? "Dance it out until the end" : isQuiz ? "???" : next.sectionName}
        </p>
      </div>
      {next && (
        <span className={cn("shrink-0 font-mono text-base font-bold", highlight?.textClass)}>
          {secondsUntilNext !== null ? formatSongTime(Math.ceil(secondsUntilNext)) : ""}
        </span>
      )}
    </div>
  );
}
