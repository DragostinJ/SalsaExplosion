import { z } from "zod";
import type { SongAnatomy } from "@/lib/constants/timba-song-anatomy";
import { applyBoundaryOverrides } from "@/lib/music/calibration";
import { validateSongTimeline } from "@/lib/music/song-timing";

/**
 * Applying the calibration panel's "Copy" report back to the song data
 * (scripts/apply-calibration.ts). Ear calibration is the trusted source for
 * section starts, but only against the map it was made from: a report whose
 * "from" times no longer match is stale (the song was re-timed) and is refused.
 */

const ChangeSchema = z.object({
  section: z.string().min(1),
  sectionName: z.string().optional(),
  from: z.number().nonnegative(),
  to: z.number().nonnegative(),
  shift: z.number().optional(),
});

const BeatFitSchema = z.object({
  section: z.string().min(1),
  bpm: z.number().positive(),
  phaseSeconds: z.number(),
  beatErrorMs: z.number().nonnegative(),
  taps: z.number().int().positive(),
});

const MarkSchema = z.object({
  section: z.string().optional(),
  heardAt: z.number().nonnegative(),
  mapStart: z.number().optional(),
});

export const CalibrationReportSchema = z.object({
  songId: z.string().min(1),
  videoId: z.string().optional(),
  authoredDurationSeconds: z.number().optional(),
  actualDurationSeconds: z.number().nullable().optional(),
  changes: z.array(ChangeSchema),
  beatFits: z.array(BeatFitSchema).default([]),
  marks: z.array(MarkSchema).default([]),
});

export type CalibrationReport = z.infer<typeof CalibrationReportSchema>;

/** A start is "unchanged" within this many seconds (the panel rounds to tenths). */
const SAME_START = 0.05;
/** Video vs map length difference worth a warning. */
const LENGTH_TOLERANCE_SECONDS = 2;

/**
 * Reports pasted as one JSON object, an array, inside ```fences```, or several
 * objects one after another (copied from the panel song by song).
 */
export function parseCalibrationReports(raw: string): { reports: CalibrationReport[]; errors: string[] } {
  const errors: string[] = [];
  const text = raw.replace(/```(?:json)?/gi, "");
  const values: unknown[] = [];
  let index = 0;
  while (index < text.length) {
    const start = text.slice(index).search(/[[{]/);
    if (start < 0) break;
    const from = index + start;
    const end = matchingBracket(text, from);
    if (end < 0) {
      errors.push(`Unclosed JSON starting at character ${from}.`);
      break;
    }
    try {
      values.push(JSON.parse(text.slice(from, end + 1)));
    } catch (error) {
      errors.push(`Not valid JSON at character ${from}: ${error instanceof Error ? error.message : "parse error"}`);
    }
    index = end + 1;
  }

  const reports: CalibrationReport[] = [];
  for (const value of values.flatMap((v) => (Array.isArray(v) ? v : [v]))) {
    const parsed = CalibrationReportSchema.safeParse(value);
    if (parsed.success) reports.push(parsed.data);
    else errors.push(`Not a calibration report: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
  }
  if (!reports.length && !errors.length) errors.push("No calibration report found in the input.");
  return { reports, errors };
}

/** Index of the bracket that closes the one at `from`, ignoring brackets inside strings. */
function matchingBracket(text: string, from: number): number {
  let depth = 0;
  let inString = false;
  for (let i = from; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (char === "\\") i++;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{" || char === "[") depth++;
    else if (char === "}" || char === "]") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export interface CalibrationResult {
  song: SongAnatomy;
  applied: { section: string; sectionName: string; from: number; to: number }[];
  errors: string[];
  warnings: string[];
}

export function applyCalibrationReport(song: SongAnatomy, report: CalibrationReport): CalibrationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const applied: CalibrationResult["applied"] = [];

  if (report.songId !== song.id) errors.push(`Report is for "${report.songId}", not "${song.id}".`);
  if (report.videoId && report.videoId !== song.youtubeVideoId) {
    errors.push(`Report was made on video ${report.videoId}, but the song now plays ${song.youtubeVideoId}.`);
  }

  const overrides: Record<string, number> = {};
  for (const change of report.changes) {
    const index = song.segments.findIndex((segment) => segment.id === change.section);
    if (index < 0) {
      errors.push(`Section ${change.section} isn't in the current map (was the song re-timed since this report?).`);
      continue;
    }
    if (index === 0) {
      errors.push(`Section ${change.section} is the first section; it always starts at 0.`);
      continue;
    }
    const segment = song.segments[index];
    if (Math.abs(segment.startTimeSeconds - change.from) > SAME_START) {
      errors.push(
        `Section ${change.section} now starts at ${segment.startTimeSeconds}, not ${change.from}: the map changed since this report, so it's stale.`
      );
      continue;
    }
    overrides[segment.id] = change.to;
    applied.push({ section: segment.id, sectionName: segment.sectionName, from: segment.startTimeSeconds, to: change.to });
  }

  if (report.actualDurationSeconds && Math.abs(report.actualDurationSeconds - song.durationSeconds) > LENGTH_TOLERANCE_SECONDS) {
    warnings.push(
      `The video was ${report.actualDurationSeconds}s long but the map says ${song.durationSeconds}s: check every boundary, not just the moved ones.`
    );
  }
  if (report.beatFits.length) {
    warnings.push(
      `Beat fits for ${report.beatFits.length} section(s) noted but not stored yet (they're for the future on-screen count).`
    );
  }
  if (!report.changes.length) warnings.push("The report moves no section starts (marks only).");

  if (errors.length) return { song, applied: [], errors, warnings };

  const segments = applyBoundaryOverrides(song.segments, overrides, song.durationSeconds);
  const updated: SongAnatomy = { ...song, segments };
  errors.push(...validateSongTimeline(updated));
  return errors.length ? { song, applied: [], errors, warnings } : { song: updated, applied, errors, warnings };
}
