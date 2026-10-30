"use client";

import { useEffect, useRef } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { SongDanceGear, SongSegment } from "@/lib/constants/timba-song-anatomy";
import { DANCE_GEAR_LEGEND, ENERGY_LABELS } from "@/lib/music/dance-gear-legend";
import { formatSongTime } from "@/lib/music/song-timing";
import { cn } from "@/lib/utils";

export type DancerRole = "leader" | "follower";

export const LATENCY_STEP_SECONDS = 0.05;
export const LATENCY_LIMIT_SECONDS = 0.5;

interface SongPlayerMoreSheetProps {
  open: boolean;
  onClose: () => void;
  segment: SongSegment;
  role: DancerRole;
  latencyOffsetSeconds: number;
  onChangeLatency: (seconds: number) => void;
}

export function SongPlayerMoreSheet({
  open,
  onClose,
  segment,
  role,
  latencyOffsetSeconds,
  onChangeLatency,
}: SongPlayerMoreSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const otherRole: DancerRole = role === "leader" ? "follower" : "leader";
  const otherCue = otherRole === "leader" ? segment.leaderCue : segment.followerCue;
  const clampLatency = (value: number) =>
    Math.round(Math.max(-LATENCY_LIMIT_SECONDS, Math.min(LATENCY_LIMIT_SECONDS, value)) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-canvas/70 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Section details"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface-2 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-ivory"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">
            {formatSongTime(segment.startTimeSeconds)} – {formatSongTime(segment.endTimeSeconds)}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-1 font-display text-xl font-bold">{segment.sectionName}</h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">Listen for</dt>
            <dd className="mt-0.5">{segment.musicalTrigger}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">
              {otherRole === "leader" ? "Leader" : "Follower"} cue
            </dt>
            <dd className="mt-0.5">{otherCue}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-widest text-danger">Common mistake</dt>
            <dd className="mt-0.5">{segment.commonMistakeWarning}</dd>
          </div>
          {segment.handGesture && (
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">Rueda call</dt>
              <dd className="mt-0.5">{segment.handGesture}</dd>
            </div>
          )}
        </dl>

        <section className="mt-5 border-t border-line pt-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">Song map colours</h3>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(DANCE_GEAR_LEGEND) as SongDanceGear[]).map((gear) => {
              const style = DANCE_GEAR_LEGEND[gear];
              const Icon = style.icon;
              return (
                <li key={gear} className="flex items-center gap-2 text-xs">
                  <span className={cn("h-3 w-3 shrink-0 rounded-sm", style.fillClass)} aria-hidden="true" />
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", style.textClass)} aria-hidden="true" />
                  <span>
                    {style.shortLabel} <span className="text-ivory-muted">· {ENERGY_LABELS[style.energy]}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-5 border-t border-line pt-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">Sync adjust (this phone)</h3>
          <p className="mt-1 text-xs text-ivory-muted">
            Using Bluetooth earbuds? If the cards change before you hear the change, add delay.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              aria-label="Show cues earlier"
              onClick={() => onChangeLatency(clampLatency(latencyOffsetSeconds - LATENCY_STEP_SECONDS))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-3"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[5rem] text-center font-mono text-sm" aria-live="polite">
              {latencyOffsetSeconds >= 0 ? "+" : ""}
              {latencyOffsetSeconds.toFixed(2)}s
            </span>
            <button
              type="button"
              aria-label="Show cues later"
              onClick={() => onChangeLatency(clampLatency(latencyOffsetSeconds + LATENCY_STEP_SECONDS))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-3"
            >
              <Plus className="h-4 w-4" />
            </button>
            {latencyOffsetSeconds !== 0 && (
              <button
                type="button"
                onClick={() => onChangeLatency(0)}
                className="min-h-[40px] px-3 text-xs font-semibold text-gold underline-offset-4 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
