import { z } from "zod";
import {
  MoveSchema,
  MoveStepSchema,
  MoveVideoSchema,
  CurriculumLevelSchema,
  type Move,
} from "./move-schema";
import storedReviewsData from "./data/move-reviews.json";
import storedDraftsData from "./data/move-drafts.json";

/**
 * Staff review decision for a drafted move.
 */
export const MoveReviewDecisionSchema = z.enum(["approved", "needs-work", "rejected"]);
export type MoveReviewDecision = z.infer<typeof MoveReviewDecisionSchema>;

/**
 * Optional edits replacing specific textual or structural properties of a move.
 */
export const MoveEditsSchema = z.object({
  name: z.string().min(1).optional(),
  spanishName: z.string().optional(),
  level: CurriculumLevelSchema.optional(),
  eightCounts: z.number().int().min(1).optional(),
  summary: z.string().min(1).optional(),
  leaderSteps: z.array(MoveStepSchema).min(1).optional(),
  followerSteps: z.array(MoveStepSchema).min(1).optional(),
  commonMistakes: z.array(z.string()).optional(),
  variations: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
});
export type MoveEdits = z.infer<typeof MoveEditsSchema>;

/**
 * MoveReview record submitted by a teacher.
 * Invariant: An "approved" review MUST have countsVerified === true.
 */
export const MoveReviewSchema = z
  .object({
    moveId: z.string().min(1, "moveId is required"),
    reviewedBy: z.string().trim().min(1, "reviewedBy teacher name is required"),
    reviewedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "reviewedAt must be a valid ISO date string",
    }),
    basedOn: z.string().min(1, "basedOn draft fingerprint is required"),
    decision: MoveReviewDecisionSchema,
    countsVerified: z.boolean(),
    edits: MoveEditsSchema.optional(),
    videos: z.array(MoveVideoSchema).default([]),
    notes: z.string().optional(),
  })
  .refine(
    (data) => data.decision !== "approved" || data.countsVerified === true,
    {
      message: 'An "approved" review MUST have countsVerified set to true. Never publish unverified counts.',
      path: ["countsVerified"],
    }
  );
export type MoveReview = z.infer<typeof MoveReviewSchema>;

/**
 * Schema for review batch reports exported from the review console.
 */
export const MoveReviewReportSchema = z.object({
  kind: z.literal("ritmoflow-move-review"),
  version: z.literal(1),
  reviews: z.array(MoveReviewSchema),
  drafts: z.array(MoveSchema),
});
export type MoveReviewReport = z.infer<typeof MoveReviewReportSchema>;

/**
 * Input for the video oEmbed validation server action.
 */
export const CheckMoveVideoOembedInputSchema = z.object({
  videoId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{11}$/, "Must be an 11-character YouTube video ID"),
});
export type CheckMoveVideoOembedInput = z.infer<typeof CheckMoveVideoOembedInputSchema>;

export const MoveVideoOembedResultSchema = z.object({
  success: z.boolean(),
  videoId: z.string(),
  title: z.string().optional(),
  channelTitle: z.string().optional(),
  availability: z.enum(["ok", "not-embeddable", "unavailable", "unknown"]),
  checkedAt: z.string().optional(),
  error: z.string().optional(),
});
export type MoveVideoOembedResult = z.infer<typeof MoveVideoOembedResultSchema>;

/**
 * Deterministic fingerprint of a move's content fields (excluding reviewedBy and videos).
 * Uses FNV-1a 32-bit hash on key-sorted content to ensure exact matching between browser and server.
 */
export function moveFingerprint(move: Partial<Move>): string {
  const contentKeys = [
    "category",
    "commonMistakes",
    "curriculumId",
    "eightCounts",
    "followerSteps",
    "id",
    "leaderSteps",
    "level",
    "name",
    "prerequisites",
    "ruedaCall",
    "spanishName",
    "summary",
    "tags",
    "variations",
  ] as const;

  const content: Record<string, unknown> = {};
  for (const key of contentKeys) {
    if (key in move && (move as Record<string, unknown>)[key] !== undefined) {
      content[key] = (move as Record<string, unknown>)[key];
    }
  }

  const str = JSON.stringify(content);
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Stored reviews and drafts validated at module load time.
 * If data files are malformed, it throws immediately.
 */
export const STORED_REVIEWS: readonly MoveReview[] = Object.freeze(
  z.array(MoveReviewSchema).parse(storedReviewsData)
);

export const STORED_DRAFTS: readonly Move[] = Object.freeze(
  z.array(MoveSchema).parse(storedDraftsData)
);

/**
 * Applies a review to a base move.
 * For "approved", applies edits, populates reviewedBy, replaces videos, and removes "counts-unverified".
 * For "needs-work" or "rejected", preserves teacher notes and keeps the move unapproved.
 */
export function applyReviewToMove(baseMove: Move, review: MoveReview): Move {
  if (review.decision === "approved") {
    const edits = review.edits ?? {};
    const updatedTags = (baseMove.tags ?? []).filter((t) => t !== "counts-unverified");

    const merged: Move = {
      ...baseMove,
      name: edits.name ?? baseMove.name,
      spanishName:
        edits.spanishName !== undefined
          ? edits.spanishName.trim() || undefined
          : baseMove.spanishName,
      level: edits.level ?? baseMove.level,
      eightCounts: edits.eightCounts ?? baseMove.eightCounts,
      summary: edits.summary ?? baseMove.summary,
      leaderSteps: edits.leaderSteps ?? baseMove.leaderSteps,
      followerSteps: edits.followerSteps ?? baseMove.followerSteps,
      commonMistakes: edits.commonMistakes ?? baseMove.commonMistakes,
      variations: edits.variations ?? baseMove.variations,
      prerequisites: edits.prerequisites ?? baseMove.prerequisites,
      videos: review.videos,
      tags: updatedTags,
      reviewedBy: review.reviewedBy,
    };

    return MoveSchema.parse(merged);
  }

  if (review.decision === "needs-work") {
    return {
      ...baseMove,
      reviewedBy: undefined,
      videos: review.videos.length > 0 ? review.videos : baseMove.videos,
    };
  }

  // rejected: kept for teachers but flagged
  return {
    ...baseMove,
    reviewedBy: undefined,
    tags: Array.from(new Set([...baseMove.tags, "review-rejected"])),
  };
}
