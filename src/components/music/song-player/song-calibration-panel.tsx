"use client";

import { useState } from "react";
import { Copy, Crosshair, TriangleAlert } from "lucide-react";
import type { SongAnatomy } from "@/lib/constants/timba-song-anatomy";
import { formatSongTime, getDurationMismatchSeconds } from "@/lib/music/song-timing";

interface CalibrationMark {
  markedAt: number;
  nearestSectionId: string;
  authoredStart: number;
  diffSeconds: number;
}

interface SongCalibrationPanelProps {
  song: SongAnatomy;
  currentTime: number;
  actualDurationSeconds: number | null;
  getExactTime: () => number;
}

/**
 * Curator tool (open the player with ?calibrate=1). Tap "Mark" the moment you
 * HEAR a section change; the panel shows how far that is from the authored
 * boundary so the data file can be corrected. Nothing is saved anywhere.
 */
export function SongCalibrationPanel({
  song,
  currentTime,
  actualDurationSeconds,
  getExactTime,
}: SongCalibrationPanelProps) {
  const [marks, setMarks] = useState<CalibrationMark[]>([]);
  const [copied, setCopied] = useState(false);
  const durationMismatch = getDurationMismatchSeconds(song, actualDurationSeconds);

  const addMark = () => {
    const markedAt = getExactTime();
    // Compare against every authored boundary (section starts after the first)
    const boundaries = song.segments.slice(1);
    const nearest = boundaries.reduce((best, segment) =>
      Math.abs(segment.startTimeSeconds - markedAt) < Math.abs(best.startTimeSeconds - markedAt)
        ? segment
        : best
    , boundaries[0] ?? song.segments[0]);
    setMarks((previous) => [
      {
        markedAt,
        nearestSectionId: nearest.id,
        authoredStart: nearest.startTimeSeconds,
        diffSeconds: markedAt - nearest.startTimeSeconds,
      },
      ...previous,
    ]);
  };

  const copyMarks = async () => {
    const report = {
      songId: song.id,
      videoId: song.youtubeVideoId,
      authoredDurationSeconds: song.durationSeconds,
      actualDurationSeconds,
      marks: [...marks].reverse().map((mark) => ({
        section: mark.nearestSectionId,
        authoredStart: mark.authoredStart,
        heardAt: Math.round(mark.markedAt * 10) / 10,
        diff: Math.round(mark.diffSeconds * 10) / 10,
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
        <span className="font-bold uppercase tracking-widest text-warning">Calibration</span>
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
          onClick={copyMarks}
          disabled={marks.length === 0}
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-warning-line px-3 font-semibold disabled:opacity-40"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {marks.length > 0 && (
        <ul className="mt-2 max-h-24 space-y-0.5 overflow-y-auto font-mono">
          {marks.map((mark, index) => (
            <li key={`${mark.markedAt}-${index}`} className="flex justify-between gap-2">
              <span>
                {formatSongTime(mark.markedAt, true)} → {mark.nearestSectionId} ({formatSongTime(mark.authoredStart)})
              </span>
              <span className={Math.abs(mark.diffSeconds) >= 0.5 ? "text-danger" : "text-success"}>
                {mark.diffSeconds >= 0 ? "+" : ""}
                {mark.diffSeconds.toFixed(1)}s
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
