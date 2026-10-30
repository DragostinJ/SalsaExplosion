import type { SongAnatomy, SongSegment } from "@/lib/constants/timba-song-anatomy";

/**
 * Pure timing helpers for the section-by-section song player.
 *
 * Segment times are authored against the song's primary YouTube video
 * (`youtubeVideoId`). Every lookup here treats a segment as the half-open
 * interval [start, end), so a boundary second always belongs to the NEW section.
 */

/** Seconds of difference between authored and real video length we tolerate before warning. */
export const DURATION_TOLERANCE_SECONDS = 2;

/** Within this many seconds of a section start, "previous" goes to the section before. */
export const PREVIOUS_SECTION_RESTART_WINDOW_SECONDS = 3;

/** Index of the section playing at `timeSeconds` (clamped to the first/last section). */
export function findSegmentIndexAt(segments: readonly SongSegment[], timeSeconds: number): number {
  if (segments.length === 0) return -1;
  if (!(timeSeconds > segments[0].startTimeSeconds)) return 0;

  // Binary search for the last segment whose start <= time
  let low = 0;
  let high = segments.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (segments[mid].startTimeSeconds <= timeSeconds) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low;
}

/** Seconds until the next section starts, or null when already in the last section. */
export function secondsUntilNextSection(
  segments: readonly SongSegment[],
  timeSeconds: number
): number | null {
  const index = findSegmentIndexAt(segments, timeSeconds);
  const next = segments[index + 1];
  if (!next) return null;
  return Math.max(0, next.startTimeSeconds - timeSeconds);
}

/**
 * Where "previous section" should seek: restart the current section unless we
 * are within the first few seconds of it, in which case go one section back.
 */
export function previousSectionSeekTarget(
  segments: readonly SongSegment[],
  timeSeconds: number
): number {
  const index = findSegmentIndexAt(segments, timeSeconds);
  if (index < 0) return 0;
  const current = segments[index];
  const intoSection = timeSeconds - current.startTimeSeconds;
  if (intoSection > PREVIOUS_SECTION_RESTART_WINDOW_SECONDS || index === 0) {
    return current.startTimeSeconds;
  }
  return segments[index - 1].startTimeSeconds;
}

/** Where "next section" should seek, or null when already in the last section. */
export function nextSectionSeekTarget(
  segments: readonly SongSegment[],
  timeSeconds: number
): number | null {
  const index = findSegmentIndexAt(segments, timeSeconds);
  return segments[index + 1]?.startTimeSeconds ?? null;
}

/** Authored-minus-real duration difference, or null when within tolerance / unknown. */
export function getDurationMismatchSeconds(
  song: Pick<SongAnatomy, "durationSeconds">,
  actualDurationSeconds: number | null | undefined
): number | null {
  if (!actualDurationSeconds || actualDurationSeconds <= 0) return null;
  const diff = actualDurationSeconds - song.durationSeconds;
  return Math.abs(diff) >= DURATION_TOLERANCE_SECONDS ? diff : null;
}

/**
 * Structural problems in a song's section timeline: sections must start at 0,
 * be sorted, contiguous (no gaps or overlaps) and end exactly at durationSeconds.
 */
export function validateSongTimeline(song: SongAnatomy): string[] {
  const problems: string[] = [];
  const { segments } = song;
  if (segments.length === 0) return ["song has no sections"];

  if (segments[0].startTimeSeconds !== 0) {
    problems.push(`first section starts at ${segments[0].startTimeSeconds}s instead of 0s`);
  }

  segments.forEach((segment, index) => {
    if (segment.endTimeSeconds <= segment.startTimeSeconds) {
      problems.push(`${segment.id} has no length`);
    }
    const next = segments[index + 1];
    if (next && next.startTimeSeconds !== segment.endTimeSeconds) {
      const kind = next.startTimeSeconds > segment.endTimeSeconds ? "gap" : "overlap";
      problems.push(
        `${kind} between ${segment.id} (ends ${segment.endTimeSeconds}s) and ${next.id} (starts ${next.startTimeSeconds}s)`
      );
    }
  });

  const last = segments[segments.length - 1];
  if (last.endTimeSeconds !== song.durationSeconds) {
    problems.push(`last section ends at ${last.endTimeSeconds}s but song lasts ${song.durationSeconds}s`);
  }

  return problems;
}

/** m:ss for whole seconds; m:ss.s when `withTenths` (used by calibration mode). */
export function formatSongTime(seconds: number, withTenths = false): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe - minutes * 60;
  const whole = Math.floor(rest);
  const padded = whole < 10 ? `0${whole}` : `${whole}`;
  if (!withTenths) return `${minutes}:${padded}`;
  return `${minutes}:${padded}.${Math.floor((rest - whole) * 10)}`;
}
