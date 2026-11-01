import { describe, it, expect } from "vitest";
import {
  applyMoveReviewReport,
  parseMoveReviewReport,
} from "@/lib/moves/move-review-apply";
import { moveFingerprint, type MoveReviewReport, type MoveReview } from "@/lib/moves/move-review";
import type { Move } from "@/lib/moves/move-schema";

describe("applyMoveReviewReport", () => {
  const seed1: Move = {
    id: "guapea",
    name: "Guapea",
    category: "Casino figure",
    level: "Beginner",
    eightCounts: 1,
    summary: "Basic",
    leaderSteps: [{ counts: "1-3", text: "step" }],
    followerSteps: [{ counts: "1-3", text: "step" }],
    commonMistakes: [],
    prerequisites: [],
    variations: [],
    tags: ["curriculum", "counts-unverified"],
    videos: [],
    reviewedBy: undefined,
  };

  const seed2: Move = {
    id: "dile-que-no",
    name: "Dile Que No",
    category: "Casino figure",
    level: "Beginner",
    eightCounts: 1,
    summary: "Transition",
    leaderSteps: [{ counts: "1-3", text: "step" }],
    followerSteps: [{ counts: "1-3", text: "step" }],
    commonMistakes: [],
    prerequisites: ["guapea"],
    variations: [],
    tags: ["curriculum"],
    videos: [],
    reviewedBy: undefined,
  };

  const existingSeeds = [seed1, seed2];
  const existingDrafts: Move[] = [];
  const existingReviews: MoveReview[] = [];

  it("applies valid approved review with matching fingerprint", () => {
    const fingerprint = moveFingerprint(seed1);
    const report: MoveReviewReport = {
      kind: "ritmoflow-move-review",
      version: 1,
      drafts: [],
      reviews: [
        {
          moveId: "guapea",
          reviewedBy: "Maestro Enrique",
          reviewedAt: "2026-11-01T15:30:00.000Z",
          basedOn: fingerprint,
          decision: "approved",
          countsVerified: true,
          edits: {
            summary: "Verified Cuban push-pull basic.",
          },
          videos: [
            {
              youtubeVideoId: "12345678901",
              channelTitle: "Salsa Explosion",
              title: "Guapea Video",
              embeddable: true,
              checkedAt: "2026-11-01T15:30:00.000Z",
            },
          ],
        },
      ],
    };

    const result = applyMoveReviewReport({
      report,
      existingSeeds,
      existingDrafts,
      existingReviews,
    });

    expect(result.errors).toHaveLength(0);
    expect(result.updatedReviews).toHaveLength(1);
    expect(result.appliedChanges).toHaveLength(1);
    expect(result.appliedChanges[0].action).toBe("approved");
  });

  it("refuses review for unknown move id", () => {
    const report: MoveReviewReport = {
      kind: "ritmoflow-move-review",
      version: 1,
      drafts: [],
      reviews: [
        {
          moveId: "non-existent-move",
          reviewedBy: "Teacher",
          reviewedAt: "2026-11-01T15:30:00.000Z",
          basedOn: "any-hash",
          decision: "approved",
          countsVerified: true,
          videos: [],
        },
      ],
    };

    const result = applyMoveReviewReport({
      report,
      existingSeeds,
      existingDrafts,
      existingReviews,
    });

    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors[0]).toContain('Unknown move id "non-existent-move"');
  });

  it("refuses stale review when basedOn does not match current fingerprint", () => {
    const report: MoveReviewReport = {
      kind: "ritmoflow-move-review",
      version: 1,
      drafts: [],
      reviews: [
        {
          moveId: "guapea",
          reviewedBy: "Maestro Enrique",
          reviewedAt: "2026-11-01T15:30:00.000Z",
          basedOn: "stale_hash_value",
          decision: "approved",
          countsVerified: true,
          videos: [],
        },
      ],
    };

    const result = applyMoveReviewReport({
      report,
      existingSeeds,
      existingDrafts,
      existingReviews,
    });

    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors[0]).toContain('Stale review for "guapea"');
  });

  it("refuses approved review if countsVerified is false", () => {
    const fingerprint = moveFingerprint(seed1);
    const report: MoveReviewReport = {
      kind: "ritmoflow-move-review",
      version: 1,
      drafts: [],
      reviews: [
        // Using as unknown to bypass TS for test
        {
          moveId: "guapea",
          reviewedBy: "Maestro Enrique",
          reviewedAt: "2026-11-01T15:30:00.000Z",
          basedOn: fingerprint,
          decision: "approved",
          countsVerified: false,
          videos: [],
        } as unknown as MoveReview,
      ],
    };

    const result = applyMoveReviewReport({
      report,
      existingSeeds,
      existingDrafts,
      existingReviews,
    });

    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors.some((e) => e.includes("lacks verified counts"))).toBe(true);
  });

  it("refuses draft id that clashes with an existing seed", () => {
    const clashingDraft: Move = {
      ...seed1, // Same ID "guapea"
      summary: "Attempt to overwrite seed with draft",
    };

    const report: MoveReviewReport = {
      kind: "ritmoflow-move-review",
      version: 1,
      drafts: [clashingDraft],
      reviews: [],
    };

    const result = applyMoveReviewReport({
      report,
      existingSeeds,
      existingDrafts,
      existingReviews,
    });

    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors[0]).toContain('clashes with an existing canonical curriculum move');
  });

  it("refuses review edits that cause MoveSchema to fail", () => {
    const fingerprint = moveFingerprint(seed1);
    const report: MoveReviewReport = {
      kind: "ritmoflow-move-review",
      version: 1,
      drafts: [],
      reviews: [
        {
          moveId: "guapea",
          reviewedBy: "Maestro Enrique",
          reviewedAt: "2026-11-01T15:30:00.000Z",
          basedOn: fingerprint,
          decision: "approved",
          countsVerified: true,
          edits: {
            eightCounts: 0, // Invalid: must be >= 1
          },
          videos: [],
        },
      ],
    };

    const result = applyMoveReviewReport({
      report,
      existingSeeds,
      existingDrafts,
      existingReviews,
    });

    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors.some((e) => e.includes("produce an invalid move"))).toBe(true);
  });

  it("preserves review history and stably orders reviews by moveId and reviewedAt", () => {
    const fingerprint = moveFingerprint(seed1);
    const earlierReview: MoveReview = {
      moveId: "guapea",
      reviewedBy: "Teacher 1",
      reviewedAt: "2026-11-01T10:00:00.000Z",
      basedOn: fingerprint,
      decision: "needs-work",
      countsVerified: false,
      videos: [],
    };

    const newReview: MoveReview = {
      moveId: "guapea",
      reviewedBy: "Teacher 2",
      reviewedAt: "2026-11-01T12:00:00.000Z",
      basedOn: fingerprint,
      decision: "approved",
      countsVerified: true,
      videos: [],
    };

    const report: MoveReviewReport = {
      kind: "ritmoflow-move-review",
      version: 1,
      drafts: [],
      reviews: [newReview],
    };

    const result = applyMoveReviewReport({
      report,
      existingSeeds,
      existingDrafts,
      existingReviews: [earlierReview],
    });

    expect(result.errors).toHaveLength(0);
    expect(result.updatedReviews).toHaveLength(2);
    expect(result.updatedReviews[0].reviewedBy).toBe("Teacher 1");
    expect(result.updatedReviews[1].reviewedBy).toBe("Teacher 2");
  });

  it("parses raw JSON report including markdown code fences", () => {
    const validJson = JSON.stringify({
      kind: "ritmoflow-move-review",
      version: 1,
      drafts: [],
      reviews: [],
    });

    expect(parseMoveReviewReport(validJson).report).toBeDefined();
    expect(parseMoveReviewReport("```json\n" + validJson + "\n```").report).toBeDefined();
    expect(parseMoveReviewReport("bad json").error).toBeDefined();
  });
});
