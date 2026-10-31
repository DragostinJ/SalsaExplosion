"use client";

import { CircleCheck } from "lucide-react";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";
import { DANCE_GEAR_LEGEND } from "@/lib/music/dance-gear-legend";
import { formatSongTime } from "@/lib/music/song-timing";
import { cn } from "@/lib/utils";

interface SectionListProps {
  segments: readonly SongSegment[];
  activeIndex: number;
  mastered: ReadonlySet<string>;
  onSelectSection: (index: number) => void;
  className?: string;
}

/** Whole-song overview for wide screens (fills the space under the video). */
export function SectionList({ segments, activeIndex, mastered, onSelectSection, className }: SectionListProps) {
  return (
    <ol className={cn("min-h-0 space-y-1 overflow-y-auto pr-1", className)} aria-label="All sections">
      {segments.map((segment, index) => {
        const gear = DANCE_GEAR_LEGEND[segment.danceGear];
        const isActive = index === activeIndex;
        return (
          <li key={segment.id}>
            <button
              type="button"
              onClick={() => onSelectSection(index)}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex min-h-[44px] w-full items-center gap-3 rounded-xl border px-3 text-left",
                isActive ? cn("border-transparent", gear.chipClass) : "border-line bg-surface-2 hover:bg-surface-3"
              )}
            >
              <span className={cn("h-7 w-1.5 shrink-0 rounded-full", gear.fillClass)} aria-hidden="true" />
              <span className="w-10 shrink-0 font-mono text-xs text-ivory-muted">
                {formatSongTime(segment.startTimeSeconds)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{segment.sectionName}</span>
              <span className={cn("shrink-0 text-xs font-bold", gear.textClass)}>{gear.shortLabel}</span>
              {mastered.has(segment.id) && (
                <CircleCheck className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
