"use client";

import React from "react";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SongSegment, SegmentColorTheme } from "@/lib/constants/timba-song-anatomy";
import { THEME_STYLES, formatSeconds } from "./timba-types";

interface TimbaTimelineScrubberProps {
  currentTime: number;
  effectiveDuration: number;
  effectiveSegments: SongSegment[];
  activeSegmentIndex: number;
  isPlaying: boolean;
  playbackSpeed: 1 | 2 | 4;
  handleSeek: (time: number) => void;
  togglePlay: () => void;
  handleReset: () => void;
  setPlaybackSpeed: (speed: 1 | 2 | 4) => void;
}

export function TimbaTimelineScrubber({
  currentTime,
  effectiveDuration,
  effectiveSegments,
  activeSegmentIndex,
  isPlaying,
  playbackSpeed,
  handleSeek,
  togglePlay,
  handleReset,
  setPlaybackSpeed,
}: TimbaTimelineScrubberProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-stone-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gold" />
          Song Progression Timeline (Click Any Segment to Jump)
        </span>
        <span className="font-mono font-extrabold text-stone-200">
          {formatSeconds(currentTime)} / {formatSeconds(effectiveDuration)}
        </span>
      </div>

      {/* Multi-segment proportional bar */}
      <div
        role="region"
        aria-label="Song Segments Bar"
        className="relative h-11 sm:h-12 w-full rounded-xl sm:rounded-2xl border border-line overflow-hidden bg-surface-3 flex"
      >
        {effectiveSegments.map((segment, idx) => {
          const segmentDuration = segment.endTimeSeconds - segment.startTimeSeconds;
          const widthPct = (segmentDuration / effectiveDuration) * 100;
          const isSegmentActive = idx === activeSegmentIndex;
          const theme = THEME_STYLES[segment.colorTheme as SegmentColorTheme] ?? THEME_STYLES.slate;

          return (
            <button
              key={segment.id}
              type="button"
              data-testid={`timeline-segment-${idx}`}
              onClick={() => handleSeek(segment.startTimeSeconds)}
              title={`${segment.formattedRange} • ${segment.sectionName} (${segment.danceGear})`}
              style={{ width: `${widthPct}%` }}
              className={`relative h-full text-left transition-all px-1 sm:px-2 flex flex-col justify-center border-r border-white/10 last:border-r-0 ${
                isSegmentActive
                  ? "bg-amber-500/25 text-amber-200 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-inset ring-amber-400/60"
                  : theme.bgInactive
              }`}
            >
              <div className="truncate text-[10px] font-bold text-white">
                {widthPct < 12 ? (
                  <>
                    <span className="md:hidden text-[9px] font-bold">{idx + 1}</span>
                    <span className="hidden md:inline">{segment.sectionName}</span>
                  </>
                ) : (
                  <span>{segment.sectionName}</span>
                )}
              </div>
              <div className="hidden md:block truncate text-[9px] text-stone-300 font-semibold">
                {segment.danceGear}
              </div>
            </button>
          );
        })}

        {/* Live Playhead Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)] pointer-events-none z-10"
          style={{
            left: `${Math.min(
              100,
              (currentTime / effectiveDuration) * 100
            )}%`,
          }}
        />
      </div>

      {/* Mobile Quick-Jump Thumb-Friendly Segment Strip */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Mobile quick-jump timeline segments"
        className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-1 snap-x snap-mandatory focus:outline-none"
      >
        {effectiveSegments.map((segment, idx) => {
          const isSegmentActive = idx === activeSegmentIndex;
          return (
            <button
              key={`mobile-seg-${segment.id}`}
              type="button"
              data-testid={`mobile-segment-chip-${idx}`}
              onClick={() => handleSeek(segment.startTimeSeconds)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold shrink-0 transition-all border snap-start ${
                isSegmentActive
                  ? "bg-gold/25 border-gold/50 text-gold ring-1 ring-gold/50 shadow-xs"
                  : "border-line bg-surface-3 text-stone-400 hover:bg-surface-2 hover:text-stone-200"
              }`}
            >
              <span>{idx + 1}. {segment.sectionName}</span>
              <span className="ml-1 opacity-75 font-mono text-[9px]">{segment.formattedRange.split(" - ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Playback Controls & Range Scrubber */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            data-testid="playback-toggle"
            onClick={togglePlay}
            className="h-9 px-4 text-xs font-bold bg-brand hover:bg-brand-hover text-white rounded-xl shadow-xs"
          >
            {isPlaying ? (
              <>
                <Pause className="mr-1.5 h-3.5 w-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                {currentTime >= effectiveDuration ? "Replay" : "Play Along"}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-9 text-xs font-semibold rounded-xl border-line bg-surface-3 text-stone-200 hover:bg-surface-2 hover:text-white"
            title="Reset to 0:00"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>

          {/* Speed Toggle */}
          <div className="flex items-center rounded-xl border border-line bg-surface-3 p-0.5 text-xs">
            {([1, 2, 4] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  playbackSpeed === spd
                    ? "bg-gold text-stone-950 shadow-xs"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Slider Scrubber */}
        <div className="flex-1 max-w-xs flex items-center gap-2">
          <input
            type="range"
            aria-label="Timeline position scrubber"
            min={0}
            max={effectiveDuration}
            step={1}
            value={Math.floor(currentTime)}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
