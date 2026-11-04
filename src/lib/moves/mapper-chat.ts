/**
 * The Move Mapper as a plain AI Studio chat. The chat runs on the user's Google AI Pro allowance
 * (and Gemini 4 Argon) instead of the free API key the Build app spends, but it cannot cut the
 * video or join the answers. This module does those two jobs, the same way the Build app did
 * (docs/ai-studio-move-mapper/build-app-prompt.md, sections 4, 5 and 7):
 *
 * - planPieces + chatMessage: equal pieces of at most ~20 s and the exact message for each one;
 * - mergePieceAnswers: one ritmoflow-clip-breakdown from the per-piece answers.
 */
import { z } from "zod";
import { ClipBreakdownRowSchema, ClipBreakdownSchema, parseClipTimestamp, type ClipBreakdown, type ClipBreakdownRow } from "./pro-clips";
import { KEBAB_CASE_REGEX } from "./move-schema";

/** Each piece is sent with this much video either side, so a figure on the border is seen whole. */
export const PIECE_PADDING_SECONDS = 1;
/** Rows from neighbouring pieces this close together, naming the same moves, are one row. */
const BORDER_JOIN_GAP_SECONDS = 1;
/** Shorter rows are noise from the padding. */
const MIN_ROW_SECONDS = 1;

export const MAPPER_FOCUSES = ["moves", "musicality"] as const;

const PieceSchema = z
  .object({
    number: z.number().int().min(1),
    start: z.number().min(0),
    end: z.number().positive(),
  })
  .strict()
  .refine((piece) => piece.end > piece.start, "A piece must end after it starts");
export type MapperPiece = z.infer<typeof PieceSchema>;

/** pieces.json: everything the merge needs, written when the run is prepared. */
export const MapperChatManifestSchema = z
  .object({
    kind: z.literal("ritmoflow-mapper-chat"),
    version: z.literal(1),
    id: z.string().regex(KEBAB_CASE_REGEX, "The clip id must be kebab-case"),
    youtubeVideoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
    title: z.string().min(1),
    channelTitle: z.string().min(1),
    dancers: z.array(z.string().min(1)).min(1).max(6),
    songId: z.string().optional(),
    songMap: z.array(z.string()).optional(),
    focus: z.enum(MAPPER_FOCUSES),
    fps: z.number().min(0.1).max(60),
    model: z.string().min(1),
    pieces: z.array(PieceSchema).min(1),
  })
  .strict();
export type MapperChatManifest = z.infer<typeof MapperChatManifestSchema>;

const round1 = (seconds: number) => Math.round(seconds * 10) / 10;

/** "M:SS", or "M:SS.s" when the time has tenths. */
export function formatMapperTime(seconds: number): string {
  const tenths = Math.round(seconds * 10);
  const minutes = Math.floor(tenths / 600);
  const rest = (tenths - minutes * 600) / 10;
  const whole = Math.floor(rest);
  const fraction = Math.round((rest - whole) * 10);
  return `${minutes}:${String(whole).padStart(2, "0")}${fraction ? `.${fraction}` : ""}`;
}

/** Splits from..to into equal pieces no longer than maxPieceSeconds. */
export function planPieces(from: number, to: number, maxPieceSeconds: number): MapperPiece[] {
  if (!(to > from) || from < 0) throw new Error("The clip must end after it starts, at 0:00 or later");
  if (!(maxPieceSeconds >= 5)) throw new Error("Pieces must be at least 5 seconds long");
  const count = Math.max(1, Math.ceil((to - from) / maxPieceSeconds - 1e-9));
  const size = (to - from) / count;
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    start: round1(from + i * size),
    end: i === count - 1 ? to : round1(from + (i + 1) * size),
  }));
}

/**
 * What to type in the chat's video settings for a piece: 1 s either side, never before 0:00, in
 * whole seconds (AI Studio's boxes take whole seconds, so the merge adds exactly what was typed).
 */
export function clipWindow(piece: MapperPiece): { start: number; end: number } {
  return {
    start: Math.max(0, Math.floor(piece.start - PIECE_PADDING_SECONDS)),
    end: Math.ceil(piece.end + PIECE_PADDING_SECONDS),
  };
}

/** A time the way AI Studio's video settings want it: "0h0m3s", "0h1m8s". */
export function aiStudioTime(seconds: number): string {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 3600)}h${Math.floor((whole % 3600) / 60)}m${whole % 60}s`;
}

/** The user message for one piece, line for line what the Build app sends. */
export function chatMessage(manifest: MapperChatManifest, piece: MapperPiece): string {
  const lines = [
    `Video: https://www.youtube.com/watch?v=${manifest.youtubeVideoId}`,
    `Piece: ${formatMapperTime(piece.start)} to ${formatMapperTime(piece.end)} (times in the original video)`,
    `Clip id: ${manifest.id}`,
    `Title: ${manifest.title}`,
    `Channel: ${manifest.channelTitle}`,
    `Dancers: ${manifest.dancers.join(", ")}`,
  ];
  if (manifest.songId) lines.push(`Song id: ${manifest.songId}`);
  if (manifest.songMap?.length) lines.push(`Song map:\n${manifest.songMap.join("\n")}`);
  lines.push(`Frames per second: ${manifest.fps}`, `Focus: ${manifest.focus}`);
  return lines.join("\n");
}

// ------------------------------------------------------------------
// Joining the answers
// ------------------------------------------------------------------

export interface PieceAnswer {
  piece: MapperPiece;
  /** The chat's answer as pasted (a ```json fence is fine). Empty = not run yet. */
  raw: string;
}

interface TimedRow {
  row: ClipBreakdownRow;
  start: number;
  end: number;
  piece: number;
}

export interface MergeResult {
  /** The breakdown, or null when no piece gave usable rows. */
  breakdown: ClipBreakdown | null;
  /** Pieces still to run (empty answer files). */
  missing: number[];
  /** Things the user should know, in plain words. */
  notes: string[];
}

const AnswerSchema = z
  .object({
    rows: z.array(z.unknown()),
    analysis: z.object({ model: z.string().optional(), notes: z.string().optional() }).passthrough().optional(),
  })
  .passthrough();

function stripFence(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return (fenced?.[1] ?? raw).trim();
}

/** Optional text the chat filled with nothing, and a newMove where the schema forbids one, are left out. */
function tidyRow(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  const row = { ...(value as Record<string, unknown>) };
  if (typeof row.musicalMoment === "string" && !row.musicalMoment.trim()) delete row.musicalMoment;
  if (row.match !== "not-in-library") delete row.newMove;
  return row;
}

function sameMoves(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/** Reads one piece's answer and puts its rows on the original video's clock. */
function timedRows(answer: PieceAnswer, notes: string[]): { rows: TimedRow[]; model?: string; analysisNotes?: string } {
  const label = `Piece ${answer.piece.number}`;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripFence(answer.raw));
  } catch {
    notes.push(`${label}: the answer is not complete JSON (copy the whole answer, from { to }).`);
    return { rows: [] };
  }
  const shape = AnswerSchema.safeParse(parsed);
  if (!shape.success) {
    notes.push(`${label}: the answer has no "rows" list.`);
    return { rows: [] };
  }

  const rows: { row: ClipBreakdownRow; start: number; end: number }[] = [];
  shape.data.rows.forEach((value, i) => {
    const row = ClipBreakdownRowSchema.safeParse(tidyRow(value));
    if (!row.success) {
      notes.push(`${label}, row ${i + 1} left out: ${row.error.issues.map((issue) => `${issue.path.join(".") || "row"} ${issue.message}`).join("; ")}.`);
      return;
    }
    const start = parseClipTimestamp(row.data.start);
    const end = parseClipTimestamp(row.data.end);
    if (!start.ok || !end.ok) {
      notes.push(`${label}, row ${i + 1} left out: its times "${row.data.start}" to "${row.data.end}" are not M:SS.`);
      return;
    }
    rows.push({ row: row.data, start: start.seconds, end: end.seconds });
  });

  // The clip-relative test (build prompt, section 4): rows that only make sense counted from the
  // clip's first frame get the clip start added. When they fit both readings, the instructions'
  // reading (original video times) wins and the teacher is told to check.
  const window = clipWindow(answer.piece);
  const clipLength = window.end - window.start;
  const fits = (from: number, to: number) => rows.every((r) => r.start >= from - 0.5 && r.end <= to + 0.5);
  const fitsRelative = window.start > 0 && rows.length > 0 && fits(0, clipLength);
  const fitsOriginal = fits(window.start, window.end);
  const relative = fitsRelative && !fitsOriginal;
  if (relative) notes.push(`${label}: the times were counted from the start of the clip, so ${formatMapperTime(window.start)} was added to each.`);
  else if (fitsRelative && fitsOriginal) notes.push(`${label}: the times fit both the clip and the whole video; kept as given. Check one row against the video.`);
  const shift = relative ? window.start : 0;

  const timed: TimedRow[] = [];
  for (const r of rows) {
    const start = Math.max(answer.piece.start, r.start + shift);
    const end = Math.min(answer.piece.end, r.end + shift);
    if (end - start >= MIN_ROW_SECONDS) timed.push({ row: r.row, start, end, piece: answer.piece.number });
  }
  return { rows: timed, model: shape.data.analysis?.model, analysisNotes: shape.data.analysis?.notes };
}

/** Joins figures split across a piece border, then makes sure no two rows overlap. */
function joinRows(rows: TimedRow[]): TimedRow[] {
  const sorted = [...rows].sort((a, b) => a.start - b.start || a.end - b.end);
  const joined: TimedRow[] = [];
  for (const next of sorted) {
    const prev = joined.at(-1);
    if (
      prev &&
      prev.piece !== next.piece &&
      next.start - prev.end < BORDER_JOIN_GAP_SECONDS &&
      prev.row.type === next.row.type &&
      sameMoves(prev.row.moveIds, next.row.moveIds)
    ) {
      const longer = next.end - next.start > prev.end - prev.start ? next : prev;
      joined[joined.length - 1] = { row: longer.row, start: prev.start, end: Math.max(prev.end, next.end), piece: next.piece };
      continue;
    }
    joined.push({ ...next });
  }
  for (let i = 0; i < joined.length - 1; i++) {
    if (joined[i].end > joined[i + 1].start) joined[i].end = joined[i + 1].start;
  }
  return joined.filter((r) => r.end - r.start >= MIN_ROW_SECONDS);
}

/** One clip breakdown from the chat's per-piece answers. Header fields come from the manifest, never from the chat. */
export function mergePieceAnswers(manifest: MapperChatManifest, answers: readonly PieceAnswer[]): MergeResult {
  const notes: string[] = [];
  const missing = answers.filter((a) => !a.raw.trim()).map((a) => a.piece.number);
  const all: TimedRow[] = [];
  const pieceNotes: string[] = [];
  const modelsSaid = new Set<string>();

  for (const answer of answers) {
    if (!answer.raw.trim()) continue;
    const result = timedRows(answer, notes);
    all.push(...result.rows);
    if (result.model?.trim()) modelsSaid.add(result.model.trim());
    if (result.analysisNotes?.trim()) pieceNotes.push(`Piece ${answer.piece.number}: ${result.analysisNotes.trim()}`);
  }

  const squash = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (modelsSaid.size > 0 && ![...modelsSaid].some((m) => squash(m).includes(squash(manifest.model)))) {
    notes.push(`The chat called itself ${[...modelsSaid].join(", ")}, but the run was set up for ${manifest.model}. Check the model picker.`);
  }

  const rows = joinRows(all);
  if (rows.length === 0) return { breakdown: null, missing, notes };

  const breakdown: ClipBreakdown = {
    kind: "ritmoflow-clip-breakdown",
    version: 1,
    id: manifest.id,
    youtubeVideoId: manifest.youtubeVideoId,
    title: manifest.title,
    channelTitle: manifest.channelTitle,
    dancers: manifest.dancers,
    ...(manifest.songId ? { songId: manifest.songId } : {}),
    analysis: {
      model: manifest.model,
      fps: manifest.fps,
      notes: [`AI Studio chat, ${manifest.pieces.length} piece(s) of the video, joined by scripts/move-mapper-chat.ts.`, ...pieceNotes].join(" "),
    },
    rows: rows.map((r) => ({ ...r.row, start: formatMapperTime(r.start), end: formatMapperTime(r.end) })),
  };
  // Shape check here; the library and timeline rules are checked by the caller with parseClipBreakdownInput
  const shape = ClipBreakdownSchema.safeParse(breakdown);
  if (!shape.success) notes.push(...shape.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));
  return { breakdown, missing, notes };
}
