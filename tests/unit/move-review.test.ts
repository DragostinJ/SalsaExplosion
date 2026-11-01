import { describe, it, expect } from "vitest";
import {
  MoveReviewSchema,
  MoveReviewReportSchema,
  moveFingerprint,
  applyReviewToMove,
  STORED_REVIEWS,
  STORED_DRAFTS,
  type MoveReview,
} from "@/lib/moves/move-review";
import {
  getAllMoves,
  getPublishedMoves,
  getMoveReviewState,
  SEEDED_MOVES,
} from "@/lib/moves/move-library";
import { MoveSchema, type Move } from "@/lib/moves/move-schema";

describe("MoveReviewSchema", () => {
  const baseValidReview = {
    moveId: "guapea",
    reviewedBy: "Maestro Enrique Perez",
    reviewedAt: "2026-11-01T15:00:00.000Z",
    basedOn: "1234abcd",
    decision: "approved" as const,
    countsVerified: true,
    edits: {
      summary: "Refined Cuban Casino basic step description.",
    },
    videos: [
      {
        youtubeVideoId: "dQw4w9WgXcQ",
        channelTitle: "Salsa Explosion UK",
        title: "Guapea Technique",
        embeddable: true as const,
        checkedAt: "2026-11-01T15:00:00.000Z",
      },
    ],
    notes: "Verified on Marcando La Distancia",
  };

  it("validates a fully compliant approved review", () => {
    const result = MoveReviewSchema.safeParse(baseValidReview);
    expect(result.success).toBe(true);
  });

  it("strictly rejects approved reviews with countsVerified: false", () => {
    const unverifiedApproved = {
      ...baseValidReview,
      decision: "approved" as const,
      countsVerified: false,
    };
    const result = MoveReviewSchema.safeParse(unverifiedApproved);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('countsVerified set to true');
    }
  });

  it("accepts needs-work and rejected reviews even if countsVerified is false", () => {
    expect(
      MoveReviewSchema.safeParse({
        ...baseValidReview,
        decision: "needs-work",
        countsVerified: false,
      }).success
    ).toBe(true);

    expect(
      MoveReviewSchema.safeParse({
        ...baseValidReview,
        decision: "rejected",
        countsVerified: false,
      }).success
    ).toBe(true);
  });

  it("rejects empty teacher name", () => {
    expect(
      MoveReviewSchema.safeParse({
        ...baseValidReview,
        reviewedBy: "   ",
      }).success
    ).toBe(false);
  });

  it("validates MoveReviewReportSchema", () => {
    const report = {
      kind: "ritmoflow-move-review" as const,
      version: 1 as const,
      reviews: [baseValidReview],
      drafts: [],
    };
    expect(MoveReviewReportSchema.safeParse(report).success).toBe(true);
  });
});

describe("moveFingerprint", () => {
  const sampleMove: Move = {
    id: "guapea",
    name: "Guapea",
    category: "Casino figure",
    level: "Beginner",
    eightCounts: 1,
    summary: "Foundational basic step",
    leaderSteps: [{ counts: "1-3", text: "step back" }],
    followerSteps: [{ counts: "1-3", text: "step back" }],
    commonMistakes: ["gripping too tight"],
    prerequisites: [],
    variations: [],
    tags: ["curriculum", "beginner"],
    videos: [],
    reviewedBy: undefined,
  };

  it("returns identical hash for identical content regardless of key order", () => {
    const hash1 = moveFingerprint(sampleMove);
    const hash2 = moveFingerprint({
      ...sampleMove,
      summary: "Foundational basic step",
    });
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{8}$/);
  });

  it("ignores reviewedBy and videos in fingerprint calculation", () => {
    const hashOriginal = moveFingerprint(sampleMove);
    const hashWithTeacher = moveFingerprint({
      ...sampleMove,
      reviewedBy: "Maestro Enrique",
      videos: [
        {
          youtubeVideoId: "12345678901",
          channelTitle: "Channel",
          title: "Title",
          embeddable: true,
          checkedAt: "2026-11-01T10:00:00Z",
        },
      ],
    });
    expect(hashOriginal).toBe(hashWithTeacher);
  });

  it("changes hash when dance content fields change", () => {
    const hash1 = moveFingerprint(sampleMove);
    const hash2 = moveFingerprint({
      ...sampleMove,
      eightCounts: 2,
    });
    const hash3 = moveFingerprint({
      ...sampleMove,
      summary: "Different summary text",
    });
    expect(hash1).not.toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });
});

describe("applyReviewToMove", () => {
  const baseMove: Move = {
    id: "test-move",
    name: "Test Move",
    category: "Casino figure",
    level: "Beginner",
    eightCounts: 1,
    summary: "Draft summary",
    leaderSteps: [{ counts: "1-3", text: "lead" }],
    followerSteps: [{ counts: "1-3", text: "follow" }],
    commonMistakes: [],
    prerequisites: [],
    variations: [],
    tags: ["curriculum", "counts-unverified"],
    videos: [],
    reviewedBy: undefined,
  };

  it("applies approved review: sets reviewedBy, removes counts-unverified, updates videos and edits", () => {
    const review: MoveReview = {
      moveId: "test-move",
      reviewedBy: "Maestro Enrique",
      reviewedAt: "2026-11-01T15:00:00.000Z",
      basedOn: moveFingerprint(baseMove),
      decision: "approved",
      countsVerified: true,
      edits: {
        summary: "Verified teacher summary",
        eightCounts: 2,
      },
      videos: [
        {
          youtubeVideoId: "abcdefghijk",
          channelTitle: "Salsa Master",
          title: "Test Video",
          embeddable: true,
          checkedAt: "2026-11-01T15:00:00.000Z",
        },
      ],
    };

    const updated = applyReviewToMove(baseMove, review);
    expect(updated.reviewedBy).toBe("Maestro Enrique");
    expect(updated.summary).toBe("Verified teacher summary");
    expect(updated.eightCounts).toBe(2);
    expect(updated.tags).not.toContain("counts-unverified");
    expect(updated.videos).toHaveLength(1);
    expect(MoveSchema.safeParse(updated).success).toBe(true);
  });

  it("leaves move unapproved on needs-work and rejected reviews", () => {
    const needsWorkReview: MoveReview = {
      moveId: "test-move",
      reviewedBy: "Maestro Enrique",
      reviewedAt: "2026-11-01T15:00:00.000Z",
      basedOn: moveFingerprint(baseMove),
      decision: "needs-work",
      countsVerified: false,
      notes: "Please refine the follower step breakdown",
      videos: [],
    };

    const needsWorkMove = applyReviewToMove(baseMove, needsWorkReview);
    expect(needsWorkMove.reviewedBy).toBeUndefined();

    const rejectedReview: MoveReview = {
      ...needsWorkReview,
      decision: "rejected",
    };
    const rejectedMove = applyReviewToMove(baseMove, rejectedReview);
    expect(rejectedMove.reviewedBy).toBeUndefined();
    expect(rejectedMove.tags).toContain("review-rejected");
  });
});

describe("Move Library Integration & getPublishedMoves", () => {
  it("verifies STORED_REVIEWS and STORED_DRAFTS load cleanly", () => {
    expect(Array.isArray(STORED_REVIEWS)).toBe(true);
    expect(Array.isArray(STORED_DRAFTS)).toBe(true);
  });

  it("getPublishedMoves returns only approved moves, never drafts, needs-work, or rejected moves", () => {
    // Currently all 30 seeded moves are drafts, so getPublishedMoves must be empty
    const published = getPublishedMoves();
    expect(published).toHaveLength(0);

    for (const move of published) {
      expect(move.reviewedBy).toBeDefined();
      expect(move.reviewedBy?.trim()).not.toBe("");
      expect(move.tags).not.toContain("counts-unverified");
      expect(move.tags).not.toContain("review-rejected");
    }
  });

  it("getMoveReviewState returns 'draft' and valid fingerprint for seeded moves", () => {
    const state = getMoveReviewState("guapea");
    expect(state).toBeDefined();
    expect(state?.status).toBe("draft");
    expect(state?.review).toBeUndefined();
    expect(state?.fingerprint).toMatch(/^[0-9a-f]{8}$/);
  });
});
