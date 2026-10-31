import { formatSecondsToTime, type SongSegment } from "@/lib/constants/timba-song-anatomy";

/**
 * Ear-calibration helpers (player opened with ?calibrate=1).
 *
 * A curator moves section STARTS (the boundary between two sections) while
 * listening; the player applies the adjusted map live so the cue flips at the
 * new time. Nothing here touches the media clock: only the section map moves.
 */

/** sectionId -> adjusted start time in seconds (never the first section) */
export type BoundaryOverrides = Readonly<Record<string, number>>;

/** A section can't be squeezed shorter than this while nudging. */
export const MIN_SECTION_SECONDS = 1;

const roundTenth = (seconds: number) => Math.round(seconds * 10) / 10;

/** Section map with the overrides applied; ends always follow the next start. */
export function applyBoundaryOverrides(
  segments: readonly SongSegment[],
  overrides: BoundaryOverrides,
  durationSeconds: number
): SongSegment[] {
  const starts = segments.map((segment, index) =>
    index === 0 ? 0 : (overrides[segment.id] ?? segment.startTimeSeconds)
  );
  return segments.map((segment, index) => {
    const start = starts[index];
    const end = index === segments.length - 1 ? durationSeconds : starts[index + 1];
    if (start === segment.startTimeSeconds && end === segment.endTimeSeconds) return segment;
    return {
      ...segment,
      startTimeSeconds: start,
      endTimeSeconds: end,
      formattedRange: `${formatSecondsToTime(start)} - ${formatSecondsToTime(end)}`,
    };
  });
}

/** Keep a moved boundary between its neighbours, rounded to 0.1s. */
export function clampBoundary(segments: readonly SongSegment[], index: number, proposed: number): number {
  if (index <= 0 || index >= segments.length) return segments[Math.max(0, index)]?.startTimeSeconds ?? 0;
  const lower = segments[index - 1].startTimeSeconds + MIN_SECTION_SECONDS;
  const upper = segments[index].endTimeSeconds - MIN_SECTION_SECONDS;
  return roundTenth(Math.min(Math.max(proposed, lower), upper));
}

export interface BoundaryChange {
  section: string;
  sectionName: string;
  from: number;
  to: number;
  shift: number;
}

/** Only the boundaries that moved, in song order (what to paste back into the data file). */
export function describeBoundaryChanges(
  original: readonly SongSegment[],
  adjusted: readonly SongSegment[]
): BoundaryChange[] {
  return original.flatMap((segment, index) => {
    const to = adjusted[index]?.startTimeSeconds ?? segment.startTimeSeconds;
    if (index === 0 || to === segment.startTimeSeconds) return [];
    return [
      {
        section: segment.id,
        sectionName: segment.sectionName,
        from: segment.startTimeSeconds,
        to,
        shift: roundTenth(to - segment.startTimeSeconds),
      },
    ];
  });
}

/** Index of the boundary (section start, never 0) closest to a heard time. */
export function nearestBoundaryIndex(segments: readonly SongSegment[], seconds: number): number {
  let best = 1;
  for (let index = 1; index < segments.length; index++) {
    if (Math.abs(segments[index].startTimeSeconds - seconds) < Math.abs(segments[best].startTimeSeconds - seconds)) {
      best = index;
    }
  }
  return Math.min(best, Math.max(segments.length - 1, 0));
}
