"use client";

import { useState } from "react";
import { Hand, RotateCcw, Save } from "lucide-react";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";
import { findSegmentIndexAt } from "@/lib/music/song-timing";
import { fitBeatGrid, MIN_TAPS, shiftAnchor, type BeatFit } from "@/lib/music/tap-tempo";
import { cn } from "@/lib/utils";
import { CountPreview } from "./count-preview";

export interface SectionBeatFit {
  section: string;
  bpm: number;
  phaseSeconds: number;
  /** Media time of a "1" (first tap, moved by the 1↔5 / ±1 beat buttons) */
  oneAtSeconds: number;
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
const smallButton =
  "flex min-h-[40px] flex-1 items-center justify-center rounded-xl border border-warning-line px-2 font-semibold";

/**
 * Calibration helper: start on a "1" and tap every beat of one section (16-32
 * taps). A least-squares fit gives its exact BPM and where the beats fall; the
 * live 1-8 count shows whether that grid really lands on the music (fix a wrong
 * "1" with 1↔5 or ±1 beat). The map count beside it counts from each section's
 * start at the song BPM, which shows whether the map itself sits on the 1.
 * Nothing here reaches dancers: fits only go into the "Copy" report.
 */
export function TapTempoPanel({ segments, songBpm, getExactTime, fits, onSaveFit }: TapTempoPanelProps) {
  const [taps, setTaps] = useState<number[]>([]);
  const [oneShift, setOneShift] = useState(0);
  const fit: BeatFit | null = fitBeatGrid(taps);
  const sectionIndex = taps.length ? findSegmentIndexAt(segments, taps[0]) : -1;
  const section = sectionIndex >= 0 ? segments[sectionIndex] : null;
  const barsBpm =
    section?.bars !== undefined ? (240 * section.bars) / (section.endTimeSeconds - section.startTimeSeconds) : null;

  const anchor = fit ? shiftAnchor({ oneAtSeconds: fit.phaseSeconds, periodSeconds: fit.periodSeconds }, oneShift) : null;

  const clear = () => {
    setTaps([]);
    setOneShift(0);
  };

  const save = () => {
    if (!fit || !section || !anchor) return;
    onSaveFit({
      section: section.id,
      bpm: round(fit.bpm, 2),
      phaseSeconds: round(fit.phaseSeconds, 3),
      oneAtSeconds: round(anchor.oneAtSeconds, 3),
      beatErrorMs: round(fit.beatErrorMs, 1),
      taps: fit.tapsUsed,
    });
    clear();
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
        {taps.length ? `Tap every beat (${taps.length})` : "Start on a 1, then tap every beat"}
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

      {fit && (
        <>
          <CountPreview
            label={`Your taps${oneShift ? ` (1 moved ${oneShift > 0 ? "+" : ""}${oneShift} beats)` : ": 1 = your first tap"}`}
            getExactTime={getExactTime}
            anchor={anchor}
          />
          <div className="flex gap-1.5">
            <button type="button" onClick={() => setOneShift((shift) => shift - 1)} className={smallButton}>
              −1 beat
            </button>
            <button type="button" onClick={() => setOneShift((shift) => (shift + 4) % 8)} className={smallButton}>
              1 ↔ 5
            </button>
            <button type="button" onClick={() => setOneShift((shift) => shift + 1)} className={smallButton}>
              +1 beat
            </button>
          </div>
        </>
      )}
      <CountPreview
        label={`Map: from each section start at ${songBpm} BPM`}
        getExactTime={getExactTime}
        segments={segments}
        bpm={songBpm}
      />

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
          onClick={clear}
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
