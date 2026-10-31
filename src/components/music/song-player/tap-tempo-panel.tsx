"use client";

import { useState } from "react";
import { Hand, RotateCcw, Save } from "lucide-react";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";
import { findSegmentIndexAt } from "@/lib/music/song-timing";
import { fitBeatGrid, MIN_TAPS, type BeatFit } from "@/lib/music/tap-tempo";
import { cn } from "@/lib/utils";

export interface SectionBeatFit {
  section: string;
  bpm: number;
  phaseSeconds: number;
  beatErrorMs: number;
  taps: number;
}

interface TapTempoPanelProps {
  segments: readonly SongSegment[];
  songBpm: number;
  getExactTime: () => number;
  fits: readonly SectionBeatFit[];
  onSaveFit: (fit: SectionBeatFit) => void;
}

const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;

/**
 * Calibration helper: tap along to the beat of one section (16-32 taps), and
 * a least-squares fit gives its exact BPM and where the beats fall. Saved fits
 * go into the calibration "Copy" report for the future on-screen count.
 */
export function TapTempoPanel({ segments, songBpm, getExactTime, fits, onSaveFit }: TapTempoPanelProps) {
  const [taps, setTaps] = useState<number[]>([]);
  const fit: BeatFit | null = fitBeatGrid(taps);
  const sectionIndex = taps.length ? findSegmentIndexAt(segments, taps[0]) : -1;
  const section = sectionIndex >= 0 ? segments[sectionIndex] : null;
  const barsBpm =
    section?.bars !== undefined ? (240 * section.bars) / (section.endTimeSeconds - section.startTimeSeconds) : null;

  const save = () => {
    if (!fit || !section) return;
    onSaveFit({
      section: section.id,
      bpm: round(fit.bpm, 2),
      phaseSeconds: round(fit.phaseSeconds, 3),
      beatErrorMs: round(fit.beatErrorMs, 1),
      taps: fit.tapsUsed,
    });
    setTaps([]);
  };

  return (
    <div className="mt-2 space-y-1.5 border-t border-warning-line pt-2" data-testid="tap-tempo">
      <button
        type="button"
        // pointerdown, not click: fires on touch without the click delay
        onPointerDown={() => setTaps((previous) => [...previous, getExactTime()])}
        className="flex min-h-[56px] w-full touch-manipulation select-none items-center justify-center gap-2 rounded-xl bg-warning font-bold text-canvas"
      >
        <Hand className="h-5 w-5" aria-hidden="true" />
        Tap on every beat ({taps.length})
      </button>
      <p className="font-mono">
        {fit
          ? `${round(fit.bpm, 1)} BPM · beats ±${round(fit.beatErrorMs, 1)} ms · ${fit.tapsUsed} taps${fit.tapsDropped ? ` (${fit.tapsDropped} ignored)` : ""}`
          : `Tap ${Math.max(0, MIN_TAPS - taps.length)} more (16-32 is best) · song ${songBpm} BPM`}
      </p>
      {section && (
        <p className="truncate text-ivory-muted">
          {section.sectionName}
          {barsBpm !== null && ` · map: ${section.bars} bars ≈ ${round(barsBpm, 1)} BPM`}
        </p>
      )}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={save}
          disabled={!fit || !section}
          className="flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-xl border border-warning-line px-2 font-semibold disabled:opacity-40"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save for this section
        </button>
        <button
          type="button"
          onClick={() => setTaps([])}
          disabled={taps.length === 0}
          aria-label="Clear taps"
          className="flex min-h-[40px] w-10 items-center justify-center rounded-xl border border-warning-line disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {fits.length > 0 && (
        <ul className="max-h-16 space-y-0.5 overflow-y-auto font-mono">
          {fits.map((saved) => (
            <li key={saved.section} className={cn("flex justify-between gap-2", saved.beatErrorMs > 15 && "text-danger")}>
              <span className="truncate">{segments.find((s) => s.id === saved.section)?.sectionName ?? saved.section}</span>
              <span>
                {saved.bpm} · ±{saved.beatErrorMs}ms
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
