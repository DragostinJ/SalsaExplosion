import { MoveSchema, type Move } from "./move-schema";
import {
  MoveReviewReportSchema,
  applyReviewToMove,
  moveFingerprint,
  type MoveReview,
  type MoveReviewReport,
} from "./move-review";
import { checkEightCountAlignment } from "./move-import";

export interface AppliedMoveChange {
  moveId: string;
  moveName: string;
  action: "approved" | "needs-work" | "rejected" | "draft-added";
  summary: string;
}

export interface ApplyMoveReviewResult {
  updatedReviews: MoveReview[];
  updatedDrafts: Move[];
  appliedChanges: AppliedMoveChange[];
  errors: string[];
  warnings: string[];
}

/**
 * Parses raw JSON string (supporting markdown fences) into MoveReviewReport.
 */
export function parseMoveReviewReport(raw: string): {
  report?: MoveReviewReport;
  error?: string;
} {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = (fenced ? fenced[1] : raw).trim();

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    return { error: `Not valid JSON: ${err instanceof Error ? err.message : "parse error"}` };
  }

  const parsed = MoveReviewReportSchema.safeParse(json);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    return { error: `Invalid move review report: ${details}` };
  }

  return { report: parsed.data };
}

/**
 * Pure function: validates and merges a MoveReviewReport against current seeds, drafts, and reviews.
 */
export function applyMoveReviewReport(input: {
  report: MoveReviewReport;
  existingSeeds: readonly Move[];
  existingDrafts: readonly Move[];
  existingReviews: readonly MoveReview[];
}): ApplyMoveReviewResult {
  const { report, existingSeeds, existingDrafts, existingReviews } = input;
  const errors: string[] = [];
  const warnings: string[] = [];
  const appliedChanges: AppliedMoveChange[] = [];

  // Track draft updates
  const draftsMap = new Map<string, Move>();
  for (const draft of existingDrafts) {
    draftsMap.set(draft.id, draft);
  }

  // Known seeds map
  const seedIds = new Set(existingSeeds.map((s) => s.id));

  // 1. Process new drafts from report.drafts
  const newValidDrafts: Move[] = [];
  for (const draft of report.drafts) {
    // Must be a draft
    if (draft.reviewedBy && draft.reviewedBy.trim() !== "") {
      errors.push(`Draft "${draft.id}" cannot have reviewedBy pre-populated.`);
      continue;
    }

    // Refuse draft id clashing with seeds
    if (seedIds.has(draft.id)) {
      errors.push(
        `Draft id "${draft.id}" clashes with an existing canonical curriculum move.`
      );
      continue;
    }

    // Refuse draft id clashing with existing drafts (unless updating it)
    if (draftsMap.has(draft.id)) {
      errors.push(
        `Draft id "${draft.id}" clashes with an existing unapproved draft.`
      );
      continue;
    }

    // Validate with MoveSchema
    const parseCheck = MoveSchema.safeParse(draft);
    if (!parseCheck.success) {
      errors.push(
        `Draft "${draft.id}" failed schema validation: ${parseCheck.error.message}`
      );
      continue;
    }

    // Alignment warning
    const alignmentWarning = checkEightCountAlignment(draft);
    if (alignmentWarning) {
      warnings.push(alignmentWarning);
    }

    draftsMap.set(draft.id, draft);
    newValidDrafts.push(draft);
    appliedChanges.push({
      moveId: draft.id,
      moveName: draft.name,
      action: "draft-added",
      summary: `Imported new AI-drafted move (${draft.category}, ${draft.level}, ${draft.eightCounts} eight-count(s)).`,
    });
  }

  // Combined available moves to review against
  const allAvailableMoves = new Map<string, Move>();
  for (const s of existingSeeds) allAvailableMoves.set(s.id, s);
  for (const d of draftsMap.values()) allAvailableMoves.set(d.id, d);

  // 2. Process reviews
  const newReviews: MoveReview[] = [];

  for (const review of report.reviews) {
    const move = allAvailableMoves.get(review.moveId);

    // Refuse unknown move ids
    if (!move) {
      errors.push(`Unknown move id "${review.moveId}" in review.`);
      continue;
    }

    // Refuse stale review (fingerprint mismatch)
    const currentFingerprint = moveFingerprint(move);
    if (review.basedOn !== currentFingerprint) {
      errors.push(
        `Stale review for "${move.id}": review is based on fingerprint ${review.basedOn}, but current move fingerprint is ${currentFingerprint}.`
      );
      continue;
    }

    // Refuse approved review without countsVerified
    if (review.decision === "approved" && !review.countsVerified) {
      errors.push(
        `Refused: approved review for "${move.id}" by ${review.reviewedBy} lacks verified counts.`
      );
      continue;
    }

    // Refuse edits that make the move fail MoveSchema
    try {
      const merged = applyReviewToMove(move, review);

      // Check alignment warnings on merged move
      const alignmentWarning = checkEightCountAlignment(merged);
      if (alignmentWarning) {
        warnings.push(alignmentWarning);
      }

      // Check missing prerequisites
      for (const prereq of merged.prerequisites) {
        if (!allAvailableMoves.has(prereq)) {
          warnings.push(
            `${merged.id}: Prerequisite "${prereq}" does not exist in the move library.`
          );
        }
      }
    } catch (err) {
      errors.push(
        `Review edits for "${move.id}" produce an invalid move: ${err instanceof Error ? err.message : "merge error"}`
      );
      continue;
    }

    newReviews.push(review);

    let summary = `Decision: ${review.decision} by ${review.reviewedBy}.`;
    if (review.decision === "approved") {
      summary += ` Verified ${review.edits?.eightCounts ?? move.eightCounts} eight-count(s) on music. Attached ${review.videos.length} video(s).`;
    } else if (review.notes) {
      summary += ` Note: ${review.notes}`;
    }

    appliedChanges.push({
      moveId: move.id,
      moveName: move.name,
      action: review.decision,
      summary,
    });
  }

  // If any errors were encountered, do not produce updated outputs
  if (errors.length > 0) {
    return {
      updatedReviews: [],
      updatedDrafts: [],
      appliedChanges: [],
      errors,
      warnings,
    };
  }

  // Build combined reviews list: keep earlier reviews as history, latest one wins
  const combinedReviews = [...existingReviews, ...newReviews];
  // Sort stably by moveId, then reviewedAt ascending (newest review last)
  combinedReviews.sort((a, b) => {
    if (a.moveId !== b.moveId) return a.moveId.localeCompare(b.moveId);
    return new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime();
  });

  // Build updated drafts list sorted by id
  const updatedDrafts = Array.from(draftsMap.values());
  updatedDrafts.sort((a, b) => a.id.localeCompare(b.id));

  return {
    updatedReviews: combinedReviews,
    updatedDrafts,
    appliedChanges,
    errors: [],
    warnings,
  };
}
