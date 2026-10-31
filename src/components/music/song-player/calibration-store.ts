"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { SongAnatomy, SongSegment } from "@/lib/constants/timba-song-anatomy";
import { applyBoundaryOverrides, type BoundaryOverrides } from "@/lib/music/calibration";

/**
 * Boundary nudges made in calibration mode, per song. Kept in localStorage so
 * a refresh mid-session doesn't lose work. Only applied while ?calibrate=1 is
 * on: normal playback always uses the authored map.
 */

const EMPTY: BoundaryOverrides = Object.freeze({});
const cache = new Map<string, BoundaryOverrides>();
const listeners = new Set<() => void>();

const storageKey = (songId: string) => `ritmoflow:calibration:${songId}`;

function read(songId: string): BoundaryOverrides {
  const cached = cache.get(songId);
  if (cached) return cached;
  let value: BoundaryOverrides = EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(songId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const entries = Object.entries(parsed).filter(
        (entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1])
      );
      if (entries.length) value = Object.freeze(Object.fromEntries(entries));
    }
  } catch {
    // Storage blocked: start empty
  }
  cache.set(songId, value);
  return value;
}

function write(songId: string, value: BoundaryOverrides) {
  cache.set(songId, value);
  try {
    if (Object.keys(value).length) window.localStorage.setItem(storageKey(songId), JSON.stringify(value));
    else window.localStorage.removeItem(storageKey(songId));
  } catch {
    // Storage blocked: keep in memory only
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setBoundaryOverride(song: SongAnatomy, sectionId: string, start: number) {
  const authored = song.segments.find((segment) => segment.id === sectionId)?.startTimeSeconds;
  const next: Record<string, number> = { ...read(song.id) };
  if (authored === start) delete next[sectionId];
  else next[sectionId] = start;
  write(song.id, Object.freeze(next));
}

export function resetBoundaryOverrides(songId: string) {
  write(songId, EMPTY);
}

/** The section map the player should use: authored, or adjusted while calibrating. */
export function useCalibratedSegments(song: SongAnatomy, enabled: boolean): SongSegment[] {
  const overrides = useSyncExternalStore(
    subscribe,
    () => (enabled ? read(song.id) : EMPTY),
    () => EMPTY
  );
  return useMemo(
    () =>
      overrides === EMPTY ? song.segments : applyBoundaryOverrides(song.segments, overrides, song.durationSeconds),
    [overrides, song.segments, song.durationSeconds]
  );
}
