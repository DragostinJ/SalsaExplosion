import { z } from "zod";
import {
  KEBAB_CASE_REGEX,
  MoveCategorySchema,
  type MoveCategory,
} from "./move-schema";
import {
  CurriculumLevelSchema,
  type CurriculumLevel,
} from "@/lib/constants/cuban-curriculum-2027";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { getAllMoves } from "./move-library";
import storedProClipsData from "./data/pro-clips.json";

// ==========================================
// 1. CLIP BREAKDOWN SCHEMAS & TYPES
// ==========================================

export const CLIP_ROW_TYPES = [
  "figure",
  "shine",
  "rumba",
  "body-movement",
  "musicality-accent",
  "show-trick",
  "other",
] as const;

export const ClipRowTypeSchema = z.enum(CLIP_ROW_TYPES);
export type ClipRowType = z.infer<typeof ClipRowTypeSchema>;

export const ClipRowMatchSchema = z.enum(["same", "variation", "not-in-library"]);
export type ClipRowMatch = z.infer<typeof ClipRowMatchSchema>;

export const ClipRowConfidenceSchema = z.enum(["high", "medium", "low"]);
export type ClipRowConfidence = z.infer<typeof ClipRowConfidenceSchema>;

export const ClipNewMoveSchema = z
  .object({
    name: z.string().trim().min(1, "New move name is required"),
    category: MoveCategorySchema,
    level: CurriculumLevelSchema,
  })
  .strict();
export type ClipNewMove = z.infer<typeof ClipNewMoveSchema>;

export const ClipAnalysisSchema = z
  .object({
    model: z.string().trim().min(1, "Analysis model name is required"),
    fps: z
      .number()
      .min(0.1, "fps must be at least 0.1")
      .max(60, "fps must not exceed 60"),
    notes: z.string(),
  })
  .strict();
export type ClipAnalysis = z.infer<typeof ClipAnalysisSchema>;

export const ClipBreakdownRowSchema = z
  .object({
    start: z.string().trim().min(1, "start timestamp is required"),
    end: z.string().trim().min(1, "end timestamp is required"),
    type: ClipRowTypeSchema,
    mechanics: z
      .string()
      .trim()
      .min(20, "mechanics must be at least 20 characters")
      .max(1200, "mechanics must not exceed 1200 characters"),
    moveIds: z.array(z.string().trim()),
    match: ClipRowMatchSchema,
    confidence: ClipRowConfidenceSchema,
    musicalMoment: z.string().trim().max(300, "musicalMoment must not exceed 300 characters").optional(),
    newMove: ClipNewMoveSchema.optional(),
  })
  .strict();
export type ClipBreakdownRow = z.infer<typeof ClipBreakdownRowSchema>;

export const ClipBreakdownSchema = z
  .object({
    kind: z.literal("ritmoflow-clip-breakdown"),
    version: z.literal(1),
    id: z
      .string()
      .trim()
      .regex(KEBAB_CASE_REGEX, "id must be in kebab-case (e.g. 'paolo-alina-homenaje')"),
    youtubeVideoId: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9_-]{11}$/, "youtubeVideoId must be an 11-character YouTube ID"),
    title: z.string().trim().min(1, "title is required"),
    channelTitle: z.string().trim().min(1, "channelTitle is required"),
    dancers: z
      .array(z.string().trim().min(1, "Dancer name cannot be empty"))
      .min(1, "At least 1 dancer is required")
      .max(6, "At most 6 dancers allowed"),
    songId: z.string().trim().optional(),
    analysis: ClipAnalysisSchema.optional(),
    rows: z
      .array(ClipBreakdownRowSchema)
      .min(1, "At least 1 row is required")
      .max(200, "At most 200 rows allowed"),
  })
  .strict();
export type ClipBreakdown = z.infer<typeof ClipBreakdownSchema>;

// ==========================================
// 2. STRICT TIMESTAMP PARSER
// ==========================================

/**
 * Strict timestamp parser for dance clip breakdowns.
 * Accepts "M:SS", "MM:SS", or "H:MM:SS" with an optional decimal fraction (e.g. "1:18.5").
 * Rejects numbers without colons ("118"), invalid seconds ("1:78", "0:60"),
 * negative values ("-1:18"), and non-string inputs.
 */
export function parseClipTimestamp(
  raw: string
): { ok: true; seconds: number } | { ok: false; error: string } {
  if (typeof raw !== "string") {
    return { ok: false, error: "Timestamp must be a string" };
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith("-")) {
    return { ok: false, error: `Negative timestamp "${raw}" is invalid` };
  }

  // Regex captures:
  // Group 1: optional hours (\d+) followed by colon
  // Group 2: minutes (\d{1,2})
  // Group 3: seconds ([0-5]\d) strictly 00-59
  // Group 4: optional decimal fraction (\d+)
  const match = trimmed.match(/^(?:(\d+):)?(\d{1,2}):([0-5]\d)(?:\.(\d+))?$/);
  if (!match) {
    return {
      ok: false,
      error: `Invalid timestamp format "${raw}". Expected "M:SS", "MM:SS", or "H:MM:SS" with seconds 00-59.`,
    };
  }

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = parseInt(match[2]!, 10);
  const seconds = parseInt(match[3]!, 10);
  const fraction = match[4] ? parseFloat(`0.${match[4]}`) : 0;

  // When hours are specified (H:MM:SS), minutes must be strictly 00-59
  if (match[1] !== undefined && minutes >= 60) {
    return {
      ok: false,
      error: `Invalid minutes "${minutes}" in H:MM:SS timestamp "${raw}". Minutes must be 00-59.`,
    };
  }

  const total = hours * 3600 + minutes * 60 + seconds + fraction;
  return { ok: true, seconds: total };
}

// ==========================================
// 3. CLIP BREAKDOWN PARSER & VALIDATOR
// ==========================================

export interface ParseClipBreakdownResult {
  ok: boolean;
  clip?: ClipBreakdown;
  errors?: string[];
}

/**
 * Parses and validates an AI Studio Move Mapper clip breakdown input.
 * Strips optional markdown JSON code fences, runs Zod schema validation,
 * and enforces domain business rules:
 *   1. start < end
 *   2. rows sorted by start and not overlapping (touching is fine)
 *   3. every moveId exists in the canonical library (getAllMoves())
 *   4. "same" and "variation" match types require at least one moveId
 *   5. newMove is permitted only when match is "not-in-library"
 *   6. songId, if provided, must exist in TIMBA_SONG_ANATOMY_DATA
 *
 * This function NEVER throws.
 */
export function parseClipBreakdownInput(raw: string): ParseClipBreakdownResult {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, errors: ["Input cannot be empty."] };
  }

  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch && fenceMatch[1]) {
    text = fenceMatch[1].trim();
  }

  let jsonParsed: unknown;
  try {
    jsonParsed = JSON.parse(text);
  } catch (err) {
    return {
      ok: false,
      errors: [
        `JSON syntax error: ${err instanceof Error ? err.message : String(err)}`,
      ],
    };
  }

  const zodResult = ClipBreakdownSchema.safeParse(jsonParsed);
  if (!zodResult.success) {
    const errors = zodResult.error.issues.map((iss) => {
      const path = iss.path.join(".");
      return path ? `Field "${path}": ${iss.message}` : iss.message;
    });
    return { ok: false, errors };
  }

  const clip = zodResult.data;
  const errors: string[] = [];

  // Verify songId if provided
  if (clip.songId) {
    const validSongIds = new Set(TIMBA_SONG_ANATOMY_DATA.map((s) => s.id));
    if (!validSongIds.has(clip.songId)) {
      errors.push(
        `Field "songId": song "${clip.songId}" not found in TIMBA_SONG_ANATOMY_DATA`
      );
    }
  }

  // Canonical move library verification
  const validMoves = getAllMoves();
  const validMoveIds = new Set(validMoves.map((m) => m.id));

  let prevStartSec: number | null = null;
  let prevEndSec: number | null = null;

  for (let i = 0; i < clip.rows.length; i++) {
    const row = clip.rows[i]!;
    const rowNum = i + 1;

    const startParse = parseClipTimestamp(row.start);
    if (!startParse.ok) {
      errors.push(`Row ${rowNum}, field "start": ${startParse.error}`);
    }

    const endParse = parseClipTimestamp(row.end);
    if (!endParse.ok) {
      errors.push(`Row ${rowNum}, field "end": ${endParse.error}`);
    }

    if (startParse.ok && endParse.ok) {
      // Rule: start < end
      if (startParse.seconds >= endParse.seconds) {
        errors.push(
          `Row ${rowNum}, field "end": end time (${row.end}) must be greater than start time (${row.start})`
        );
      }

      // Rule: sorted by start time
      if (prevStartSec !== null && startParse.seconds < prevStartSec) {
        errors.push(
          `Row ${rowNum}, field "start": rows must be sorted chronologically by start time (${row.start} < ${clip.rows[i - 1]!.start})`
        );
      }

      // Rule: not overlapping (touching is fine: start >= prevEnd)
      if (prevEndSec !== null && startParse.seconds < prevEndSec) {
        errors.push(
          `Row ${rowNum}, field "start": row start (${row.start}) overlaps with previous row end (${clip.rows[i - 1]!.end})`
        );
      }

      prevStartSec = startParse.seconds;
      prevEndSec = endParse.seconds;
    }

    // Rule: every moveId exists in getAllMoves()
    const unknownMoveIds = row.moveIds.filter((id) => !validMoveIds.has(id));
    if (unknownMoveIds.length > 0) {
      errors.push(
        `Row ${rowNum}, field "moveIds": unknown move ID(s): ${unknownMoveIds.join(", ")}`
      );
    }

    // Rule: "same" and "variation" need at least one moveId
    if (
      (row.match === "same" || row.match === "variation") &&
      row.moveIds.length === 0
    ) {
      errors.push(
        `Row ${rowNum}, field "moveIds": match type "${row.match}" requires at least one moveId`
      );
    }

    // Rule: newMove only with "not-in-library"
    if (row.newMove && row.match !== "not-in-library") {
      errors.push(
        `Row ${rowNum}, field "newMove": newMove can only be specified when match is "not-in-library"`
      );
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, clip };
}

// ==========================================
// 4. REVIEW REPORT SCHEMAS
// ==========================================

export const ClipReviewDecisionTypeSchema = z.enum([
  "confirmed",
  "unsure",
  "rejected",
]);
export type ClipReviewDecisionType = z.infer<typeof ClipReviewDecisionTypeSchema>;

export const ClipRowDecisionSchema = z
  .object({
    row: z.number().int().nonnegative("row index must be non-negative"),
    decision: ClipReviewDecisionTypeSchema,
    moveIds: z.array(z.string().trim()),
    note: z.string().trim().optional(),
  })
  .strict();
export type ClipRowDecision = z.infer<typeof ClipRowDecisionSchema>;

export const ClipReviewReportSchema = z
  .object({
    kind: z.literal("ritmoflow-clip-review"),
    version: z.literal(1),
    reviewedBy: z.string().trim().min(1, "reviewedBy teacher name is required"),
    reviewedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "reviewedAt must be a valid ISO date string",
    }),
    clip: ClipBreakdownSchema,
    decisions: z.array(ClipRowDecisionSchema).min(1, "At least 1 decision is required"),
  })
  .strict();
export type ClipReviewReport = z.infer<typeof ClipReviewReportSchema>;

// ==========================================
// 5. STORED PRO CLIPS SCHEMA & DATA HELPERS
// ==========================================

export const StoredProClipRowSchema = z
  .object({
    startSeconds: z.number().nonnegative(),
    endSeconds: z.number().nonnegative(),
    type: ClipRowTypeSchema,
    moveIds: z.array(z.string()),
    mechanics: z.string(),
    musicalMoment: z.string().optional(),
    note: z.string().optional(),
  })
  .strict();
export type StoredProClipRow = z.infer<typeof StoredProClipRowSchema>;

export const StoredProClipSchema = z
  .object({
    id: z.string().regex(KEBAB_CASE_REGEX),
    youtubeVideoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
    title: z.string().min(1),
    channelTitle: z.string().min(1),
    dancers: z.array(z.string().min(1)).min(1).max(6),
    songId: z.string().optional(),
    reviewedBy: z.string().min(1),
    reviewedAt: z.string(),
    rows: z.array(StoredProClipRowSchema),
  })
  .strict();
export type StoredProClip = z.infer<typeof StoredProClipSchema>;

const STORED_PRO_CLIPS: readonly StoredProClip[] = (
  storedProClipsData as unknown[]
).map((raw) => StoredProClipSchema.parse(raw));

/**
 * Returns all stored pro clips.
 */
export function getProClips(): readonly StoredProClip[] {
  return STORED_PRO_CLIPS;
}

export interface ProClipWithMatchingRows {
  clip: StoredProClip;
  matchingRows: readonly StoredProClipRow[];
}

/**
 * Returns all pro clips containing confirmed breakdowns for a specific move ID,
 * with matching rows ordered by start time.
 */
export function getProClipsForMove(
  moveId: string
): readonly ProClipWithMatchingRows[] {
  const result: ProClipWithMatchingRows[] = [];

  for (const clip of STORED_PRO_CLIPS) {
    const matchingRows = clip.rows
      .filter((r) => r.moveIds.includes(moveId))
      .sort((a, b) => a.startSeconds - b.startSeconds);

    if (matchingRows.length > 0) {
      result.push({
        clip,
        matchingRows,
      });
    }
  }

  return result;
}

/**
 * Returns all pro clips recorded to a specific song ID,
 * with rows ordered by start time.
 */
export function getProClipsForSong(
  songId: string
): readonly ProClipWithMatchingRows[] {
  const result: ProClipWithMatchingRows[] = [];

  for (const clip of STORED_PRO_CLIPS) {
    if (clip.songId === songId) {
      const sortedRows = [...clip.rows].sort(
        (a, b) => a.startSeconds - b.startSeconds
      );
      result.push({
        clip,
        matchingRows: sortedRows,
      });
    }
  }

  return result;
}
