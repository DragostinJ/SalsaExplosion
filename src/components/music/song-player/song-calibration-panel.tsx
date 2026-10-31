"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Crosshair, Play, RotateCcw, TriangleAlert } from "lucide-react";
import type { SongAnatomy } from "@/lib/constants/timba-song-anatomy";
import { formatSongTime, getDurationMismatchSeconds } from "@/lib/music/song-timing";
import { clampBoundary, describeBoundaryChanges, nearestBoundaryIndex } from "@/lib/music/calibration";
import { cn } from "@/lib/utils";
import { resetBoundaryOverrides, setBoundaryOverride, useCalibratedSegments } from "./calibration-store";

interface CalibrationMark {
  markedAt: number;
  boundaryIndex: number;
}

interface SongCalibrationPanelProps {
  song: SongAnatomy;
  currentTime: number;
  actualDurationSeconds: number | null;
  getExactTime: () => number;
  seek: (cueSeconds: number) => void;
  play: () => void;
}

/** How far before a boundary "Hear it" starts playing. */
const HEAR_LEAD_SECONDS = 3;
const NUDGES = [-1, -0.1, 0.1, 1] as const;

const smallButton =
  "flex min-h-[40px] items-center justify-center gap-1 rounded-xl border border-warning-line px-2 font-semibold disabled:opacity-40";

/**
 * Curator tool (open the player with ?calibrate=1). Tap "Mark change" the
 * moment you HEAR a section change, then move that section start (or apply
 * the mark) and "Hear it" again: the cards use the adjusted map live. "Copy"
 * gives the changes to paste back into the song data. Nothing is saved online.
 */
export function SongCalibrationPanel({
  song,
  currentTime,
  actualDurationSeconds,
  getExactTime,
  seek,
  play,
}: SongCalibrationPanelProps) {
  const segments = useCalibratedSegments(song, true);
  const [marks, setMarks] = useState<CalibrationMark[]>([]);
  const [selected, setSelected] = useState(1);
  const [copied, setCopied] = useState(false);
  const durationMismatch = getDurationMismatchSeconds(song, actualDurationSeconds);
  const changes = describeBoundaryChanges(song.segments, segments);

  const boundaryIndex = Math.min(Math.max(selected, 1), segments.length - 1);
  const boundary = segments[boundaryIndex];
  const authoredStart = song.segments[boundaryIndex]?.startTimeSeconds ?? 0;
  const shift = boundary ? boundary.startTimeSeconds - authoredStart : 0;
  const latestMark = marks[0];

  const moveBoundary = (index: number, proposed: number) => {
    const target = segments[index];
    if (!target || index === 0) return;
    setBoundaryOverride(song, target.id, clampBoundary(segments, index, proposed));
  };

  const addMark = () => {
    const markedAt = getExactTime();
    const index = nearestBoundaryIndex(segments, markedAt);
    setMarks((previous) => [{ markedAt, boundaryIndex: index }, ...previous]);
    setSelected(index);
  };

  const hearBoundary = () => {
    if (!boundary) return;
    seek(Math.max(0, boundary.startTimeSeconds - HEAR_LEAD_SECONDS));
    play();
  };

  const copyReport = async () => {
    const report = {
      songId: song.id,
      videoId: song.youtubeVideoId,
      authoredDurationSeconds: song.durationSeconds,
      actualDurationSeconds,
      changes,
      marks: [...marks].reverse().map((mark) => ({
        section: segments[mark.boundaryIndex]?.id,
        heardAt: Math.round(mark.markedAt * 10) / 10,
        mapStart: segments[mark.boundaryIndex]?.startTimeSeconds,
      })),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-warning-line bg-warning-soft p-3 text-xs text-ivory">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold uppercase tracking-widest text-warning">
          Calibration{changes.length > 0 && ` · ${changes.length} changed`}
        </span>
        <span className="font-mono text-sm">{formatSongTime(currentTime, true)}</span>
      </div>

      <p className="mt-1 text-ivory-muted">
        Video length:{" "}
        {actualDurationSeconds ? formatSongTime(actualDurationSeconds, true) : "loading…"} · map length:{" "}
        {formatSongTime(song.durationSeconds)}
      </p>
      {durationMismatch !== null && (
        <p className="mt-1 flex items-start gap-1.5 text-warning">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Video is {Math.abs(durationMismatch).toFixed(1)}s {durationMismatch > 0 ? "longer" : "shorter"} than the
          map. Check every boundary before trusting the cues.
        </p>
      )}

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={addMark}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-warning font-bold text-canvas"
        >
          <Crosshair className="h-4 w-4" aria-hidden="true" />
          Mark change
        </button>
        <button
          type="button"
          onClick={copyReport}
          disabled={marks.length === 0 && changes.length === 0}
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-warning-line px-3 font-semibold disabled:opacity-40"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {boundary && (
        <div className="mt-2 space-y-1.5 border-t border-warning-line pt-2" data-testid="calibration-nudge">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelected(Math.max(1, boundaryIndex - 1))}
              disabled={boundaryIndex <= 1}
              aria-label="Previous section start"
              className={cn(smallButton, "w-10")}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="min-w-0 flex-1 truncate text-center">
              <span className="font-bold">
                {boundaryIndex + 1}. {boundary.sectionName}
              </span>{" "}
              <span className="font-mono">{formatSongTime(boundary.startTimeSeconds, true)}</span>
              {shift !== 0 && (
                <span className="font-mono text-warning">
                  {" "}
                  ({shift > 0 ? "+" : ""}
                  {shift.toFixed(1)}s)
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setSelected(Math.min(segments.length - 1, boundaryIndex + 1))}
              disabled={boundaryIndex >= segments.length - 1}
              aria-label="Next section start"
              className={cn(smallButton, "w-10")}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex gap-1.5">
            {NUDGES.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => moveBoundary(boundaryIndex, boundary.startTimeSeconds + step)}
                className={cn(smallButton, "flex-1 font-mono")}
              >
                {step > 0 ? "+" : "−"}
                {Math.abs(step) >= 1 ? `${Math.abs(step)}s` : Math.abs(step)}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            <button type="button" onClick={hearBoundary} className={cn(smallButton, "flex-1")}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Hear it
            </button>
            <button
              type="button"
              onClick={() => latestMark && moveBoundary(latestMark.boundaryIndex, latestMark.markedAt)}
              disabled={!latestMark}
              className={cn(smallButton, "flex-1")}
            >
              <Crosshair className="h-4 w-4" aria-hidden="true" />
              Use last mark
            </button>
            <button
              type="button"
              onClick={() => resetBoundaryOverrides(song.id)}
              disabled={changes.length === 0}
              aria-label="Undo all changes"
              className={cn(smallButton, "w-10")}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {marks.length > 0 && (
        <ul className="mt-2 max-h-20 space-y-0.5 overflow-y-auto font-mono">
          {marks.map((mark, index) => {
            const target = segments[mark.boundaryIndex];
            const diff = target ? mark.markedAt - target.startTimeSeconds : 0;
            return (
              <li key={`${mark.markedAt}-${index}`} className="flex justify-between gap-2">
                <span className="truncate">
                  {formatSongTime(mark.markedAt, true)} → {mark.boundaryIndex + 1}. {target?.sectionName}
                </span>
                <span className={Math.abs(diff) >= 0.5 ? "text-danger" : "text-success"}>
                  {diff >= 0 ? "+" : ""}
                  {diff.toFixed(1)}s
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
