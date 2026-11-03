import { z } from "zod";
import { KEBAB_CASE_REGEX, MoveCategorySchema } from "./move-schema";
import { CurriculumLevelSchema } from "@/lib/constants/cuban-curriculum-2027";
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

/**
 * The rules about the clip as a whole: a known songId, and rows whose times parse, run
 * forwards (start < end), are sorted by start and never overlap (touching is fine).
 * Shared by the breakdown parser and by applying a review report, whose clip is re-checked.
 */
export function clipTimelineErrors(clip: Pick<ClipBreakdown, "songId" | "rows">): string[] {
  const errors: string[] = [];

  if (clip.songId && !TIMBA_SONG_ANATOMY_DATA.some((s) => s.id === clip.songId)) {
    errors.push(`Field "songId": song "${clip.songId}" not found in TIMBA_SONG_ANATOMY_DATA`);
  }

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
  }

  return errors;
}

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
  const errors: string[] = clipTimelineErrors(clip);

  // Canonical move library verification
  const validMoves = getAllMoves();
  const validMoveIds = new Set(validMoves.map((m) => m.id));

  for (let i = 0; i < clip.rows.length; i++) {
    const row = clip.rows[i]!;
    const rowNum = i + 1;

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
// 4. REVIEW REPORT SCHEMAS & PARSER
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

/**
 * Parses raw JSON string (supporting optional markdown fences) into a validated ClipReviewReport.
 */
export function parseClipReviewReport(raw: string): {
  ok: boolean;
  report?: ClipReviewReport;
  error?: string;
} {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, error: "Report payload cannot be empty." };
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const text = (fenced && fenced[1] ? fenced[1] : raw).trim();

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    return {
      ok: false,
      error: `JSON syntax error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const parsed = ClipReviewReportSchema.safeParse(json);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    return { ok: false, error: `Invalid clip review report: ${details}` };
  }

  return { ok: true, report: parsed.data };
}

// ==========================================
// 5. STORED PRO CLIPS SCHEMA, APPLICATION & HELPERS
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

export interface ApplyClipReviewResult {
  ok: boolean;
  updatedClips: StoredProClip[];
  counts: {
    confirmed: number;
    unsure: number;
    rejected: number;
  };
  errors: string[];
}

/**
 * Pure function: applies an audited ClipReviewReport to an existing collection of stored pro clips.
 *   - Verifies all move IDs in decisions exist in the library.
 *   - Only confirmed rows are retained.
 *   - The teacher's edited moveIds win over AI Studio suggestions.
 *   - Idempotently replaces any existing clip sharing the same id.
 *   - Sorts clips alphabetically by id with confirmed rows sorted by startSeconds.
 */
export function applyClipReviewReport(input: {
  report: ClipReviewReport;
  existingClips: readonly StoredProClip[];
  validMoveIds?: Set<string>;
}): ApplyClipReviewResult {
  const { report, existingClips } = input;
  const validMoveIds = input.validMoveIds ?? new Set(getAllMoves().map((m) => m.id));

  // The report's clip must still pass the whole-clip rules (it may have been edited by hand)
  const errors: string[] = clipTimelineErrors(report.clip);
  let confirmed = 0;
  let unsure = 0;
  let rejected = 0;

  // Build decision lookup by row index. Every row needs exactly one decision, so a partial or
  // hand-edited report can never drop rows quietly.
  const rowCount = report.clip.rows.length;
  const decisionByRow = new Map<number, ClipRowDecision>();
  for (const dec of report.decisions) {
    if (dec.row >= rowCount) {
      errors.push(`Decision for row ${dec.row + 1}: the clip only has ${rowCount} rows`);
      continue;
    }
    if (decisionByRow.has(dec.row)) {
      errors.push(`Row ${dec.row + 1}: decided more than once in the report`);
      continue;
    }
    decisionByRow.set(dec.row, dec);

    // Verify move IDs against canonical library
    const unknown = dec.moveIds.filter((id) => !validMoveIds.has(id));
    if (unknown.length > 0) {
      errors.push(
        `Row ${dec.row + 1}: unknown move ID(s) in report decision: ${unknown.join(", ")}`
      );
    }
  }

  // Count decision types
  for (let idx = 0; idx < rowCount; idx++) {
    const decision = decisionByRow.get(idx);
    if (!decision) {
      errors.push(`Row ${idx + 1}: no decision in the report`);
      continue;
    }
    if (decision.decision === "confirmed") confirmed++;
    else if (decision.decision === "rejected") rejected++;
    else unsure++;
  }

  if (errors.length > 0) {
    return {
      ok: false,
      updatedClips: [...existingClips],
      counts: { confirmed, unsure, rejected },
      errors,
    };
  }

  // Construct confirmed rows only
  const confirmedRows: StoredProClipRow[] = [];
  for (let idx = 0; idx < report.clip.rows.length; idx++) {
    const row = report.clip.rows[idx]!;
    const decision = decisionByRow.get(idx);
    if (decision?.decision !== "confirmed") continue;

    const startParse = parseClipTimestamp(row.start);
    const endParse = parseClipTimestamp(row.end);
    if (!startParse.ok || !endParse.ok) {
      errors.push(`Row ${idx + 1}: timestamp parse failure during review application.`);
      continue;
    }

    // Teacher's edited moveIds win over the AI's
    const effectiveMoveIds = decision.moveIds;

    confirmedRows.push({
      startSeconds: startParse.seconds,
      endSeconds: endParse.seconds,
      type: row.type,
      moveIds: effectiveMoveIds,
      mechanics: row.mechanics,
      ...(row.musicalMoment ? { musicalMoment: row.musicalMoment } : {}),
      ...(decision.note ? { note: decision.note } : {}),
    });
  }

  if (errors.length > 0) {
    return {
      ok: false,
      updatedClips: [...existingClips],
      counts: { confirmed, unsure, rejected },
      errors,
    };
  }

  // Sort rows chronologically by startSeconds
  confirmedRows.sort((a, b) => a.startSeconds - b.startSeconds);

  const updatedClip: StoredProClip = {
    id: report.clip.id,
    youtubeVideoId: report.clip.youtubeVideoId,
    title: report.clip.title,
    channelTitle: report.clip.channelTitle,
    dancers: report.clip.dancers,
    ...(report.clip.songId ? { songId: report.clip.songId } : {}),
    reviewedBy: report.reviewedBy,
    reviewedAt: report.reviewedAt,
    rows: confirmedRows,
  };

  // Idempotent replacement: map by clip id
  const clipsMap = new Map<string, StoredProClip>();
  for (const c of existingClips) {
    clipsMap.set(c.id, c);
  }
  clipsMap.set(updatedClip.id, updatedClip);

  // Return sorted by clip id
  const sortedClips = Array.from(clipsMap.values()).sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  return {
    ok: true,
    updatedClips: sortedClips,
    counts: { confirmed, unsure, rejected },
    errors: [],
  };
}

const STORED_PRO_CLIPS: readonly StoredProClip[] = (
  storedProClipsData as unknown[]
).map((raw) => StoredProClipSchema.parse(raw));

/**
 * Returns all stored pro clips.
 */
export function getProClips(): readonly StoredProClip[] {
  return STORED_PRO_CLIPS;
}

export interface ProClipWithMatchingRows extends StoredProClip {
  clip: StoredProClip;
  matchingRows: readonly StoredProClipRow[];
}

/**
 * Returns all pro clips containing confirmed breakdowns for a specific move ID,
 * with matching rows ordered by start time.
 */
export function getProClipsForMove(
  moveId: string,
  clips: readonly StoredProClip[] = getProClips()
): readonly ProClipWithMatchingRows[] {
  const result: ProClipWithMatchingRows[] = [];

  for (const clip of clips) {
    const matchingRows = clip.rows
      .filter((r) => r.moveIds.includes(moveId))
      .sort((a, b) => a.startSeconds - b.startSeconds);

    if (matchingRows.length > 0) {
      result.push({
        ...clip,
        clip,
        matchingRows,
      });
    }
  }

  return result;
}

/**
 * Returns all pro clips recorded to a specific song ID,
 * with matching rows ordered by start time.
 */
export function getProClipsForSong(
  songId: string,
  clips: readonly StoredProClip[] = getProClips()
): readonly ProClipWithMatchingRows[] {
  const result: ProClipWithMatchingRows[] = [];

  for (const clip of clips) {
    if (clip.songId === songId) {
      const sortedRows = [...clip.rows].sort(
        (a, b) => a.startSeconds - b.startSeconds
      );
      result.push({
        ...clip,
        clip,
        matchingRows: sortedRows,
      });
    }
  }

  return result;
}
