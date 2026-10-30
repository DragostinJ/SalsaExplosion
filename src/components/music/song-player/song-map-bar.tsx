"use client";

import type { SongSegment } from "@/lib/constants/timba-song-anatomy";
import { DANCE_GEAR_LEGEND } from "@/lib/music/dance-gear-legend";
import { formatSongTime } from "@/lib/music/song-timing";
import { cn } from "@/lib/utils";

interface SongMapBarProps {
  segments: readonly SongSegment[];
  durationSeconds: number;
  currentTime: number;
  activeIndex: number;
  /** Section being previewed in the NOW card (outlined on the map), null when live */
  previewIndex?: number | null;
  /** Ear-training: sections after this index are drawn neutral so colours don't give answers away */
  concealAfterIndex?: number | null;
  onSelectSection: (index: number) => void;
}

/**
 * Colour-coded map of the whole song. Each block is one section, sized by its
 * length and coloured by its dance gear. Tapping a block jumps to the exact
 * authored start of that section (never to an in-between second).
 */
export function SongMapBar({
  segments,
  durationSeconds,
  currentTime,
  activeIndex,
  previewIndex = null,
  concealAfterIndex = null,
  onSelectSection,
}: SongMapBarProps) {
  const progress = durationSeconds > 0 ? Math.min(1, currentTime / durationSeconds) : 0;

  return (
    <div className="space-y-1">
      <div className="relative flex h-10 items-center gap-0.5" role="group" aria-label="Song sections">
        {segments.map((segment, index) => {
          const gear = DANCE_GEAR_LEGEND[segment.danceGear];
          const widthPercent =
            ((segment.endTimeSeconds - segment.startTimeSeconds) / durationSeconds) * 100;
          const isActive = index === activeIndex;
          const isPreviewed = index === previewIndex;
          const isConcealed = concealAfterIndex !== null && index > concealAfterIndex;
          return (
            <button
              key={segment.id}
              type="button"
              onClick={() => onSelectSection(index)}
              aria-label={
                isConcealed
                  ? `Jump to section ${index + 1} at ${formatSongTime(segment.startTimeSeconds)}`
                  : `Jump to ${segment.sectionName} at ${formatSongTime(segment.startTimeSeconds)}`
              }
              aria-current={isActive ? "step" : undefined}
              style={{ width: `${widthPercent}%` }}
              className="flex h-full min-w-[6px] items-center focus-visible:outline-2 focus-visible:outline-gold"
            >
              <span
                className={cn(
                  "block w-full rounded-sm transition-all",
                  isConcealed ? "bg-line" : gear.fillClass,
                  isActive ? "h-4 opacity-100" : "h-2.5 opacity-45",
                  isPreviewed && "h-4 opacity-100 ring-2 ring-ivory ring-offset-1 ring-offset-canvas"
                )}
              />
            </button>
          );
        })}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1 bottom-1 w-0.5 rounded-full bg-ivory shadow-[0_0_6px] shadow-ivory/80"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between font-mono text-[11px] text-ivory-muted">
        <span>{formatSongTime(currentTime)}</span>
        <span>
          Section {activeIndex + 1}/{segments.length}
        </span>
        <span>{formatSongTime(durationSeconds)}</span>
      </div>
    </div>
  );
}
