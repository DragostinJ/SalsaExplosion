"use client";

import { useEffect, useState } from "react";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";
import { countAt, sectionStartAnchor, type CountAnchor } from "@/lib/music/tap-tempo";
import { cn } from "@/lib/utils";

interface CountPreviewProps {
  label: string;
  getExactTime: () => number;
  /** Count from a fixed "1" (fitted taps)... */
  anchor?: CountAnchor | null;
  /** ...or from the start of whichever section is playing, at `bpm` */
  segments?: readonly SongSegment[];
  bpm?: number;
}

/**
 * Calibration-only 1-8 count driven by the media clock (read every animation
 * frame, re-rendering only when the beat changes). Used to judge by eye and ear
 * whether a beat grid really lands on the music before dancers ever see a count.
 */
export function CountPreview({ label, getExactTime, anchor = null, segments, bpm = 0 }: CountPreviewProps) {
  const [state, setState] = useState<{ count: number; beat: number } | null>(null);
  // Primitives as effect deps: a new anchor object with the same numbers doesn't restart the loop
  const oneAt = anchor?.oneAtSeconds ?? null;
  const period = anchor?.periodSeconds ?? null;

  useEffect(() => {
    const anchorAt = (time: number): CountAnchor | null => {
      if (segments) return sectionStartAnchor(segments, bpm, time);
      return oneAt !== null && period !== null ? { oneAtSeconds: oneAt, periodSeconds: period } : null;
    };
    let frame = 0;
    let lastBeat = Number.NaN;
    const tick = () => {
      const time = getExactTime();
      const current = anchorAt(time);
      const next = current ? countAt(current, time) : null;
      const beat = next ? next.beat : Number.NaN;
      if (beat !== lastBeat && !(Number.isNaN(beat) && Number.isNaN(lastBeat))) {
        lastBeat = beat;
        setState(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [getExactTime, oneAt, period, segments, bpm]);

  const count = state?.count ?? null;
  return (
    <div className="flex items-center gap-3" data-testid="count-preview">
      <span
        key={state?.beat}
        className={cn(
          "flex h-12 w-12 shrink-0 animate-[pulse_0.35s_ease-out_1] items-center justify-center rounded-xl font-mono text-2xl font-bold",
          count === 1 ? "bg-danger text-canvas" : count === 5 ? "bg-warning text-canvas" : "bg-surface-2"
        )}
        aria-live="off"
      >
        {count ?? "–"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate">{label}</p>
        <div className="mt-1 flex gap-1" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                count === index + 1 ? (index === 0 ? "bg-danger" : index === 4 ? "bg-warning" : "bg-ivory") : "bg-line"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
