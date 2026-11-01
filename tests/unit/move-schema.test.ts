import { describe, it, expect } from "vitest";
import {
  MoveSchema,
  MoveVideoSchema,
  ComboSchema,
  isMoveDraft,
  validateCombo,
  type Move,
} from "@/lib/moves/move-schema";

describe("MoveSchema", () => {
  const sampleMoveData = {
    id: "dile-que-no",
    name: "Dile Que No",
    spanishName: "Dile Que No",
    category: "Casino figure" as const,
    level: "Beginner" as const,
    eightCounts: 1,
    summary: "The foundational cross-body transition in Cuban Casino.",
    leaderSteps: [
      { counts: "1-3", text: "Step forward-left opening the frame, lead follow across" },
      { counts: "5-7", text: "Pivot 180 degrees into open position with Guapea prep" },
    ],
    followerSteps: [
      { counts: "1-3", text: "Walk forward past the lead into open lane" },
      { counts: "5-7", text: "Pivot and collect weight facing partner" },
    ],
    commonMistakes: [
      "Linear cross-body pull instead of Cuban circular flow",
      "Rushing count 4 without pausing",
    ],
    prerequisites: ["guapea"],
    variations: ["Dile Que No con Vuelta"],
    ruedaCall: "Dile Que No" as const,
    curriculumId: "beg-pw-2",
    tags: ["core", "transition", "casino"],
    videos: [
      {
        youtubeVideoId: "dQw4w9WgXcQ",
        startSeconds: 10,
        endSeconds: 30,
        channelTitle: "Salsa Explosion",
        title: "Dile Que No Technique Breakdown",
        embeddable: true as const,
        checkedAt: "2026-11-01T12:00:00.000Z",
      },
    ],
    reviewedBy: undefined,
  };

  it("validates a fully populated valid move", () => {
    const result = MoveSchema.safeParse(sampleMoveData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("dile-que-no");
      expect(result.data.eightCounts).toBe(1);
      expect(isMoveDraft(result.data)).toBe(true);
    }
  });

  it("rejects non-kebab-case ids", () => {
    const invalidIds = ["DileQueNo", "dile_que_no", "dile que no", "DILE-QUE-NO", "-dile-"];
    for (const id of invalidIds) {
      const result = MoveSchema.safeParse({ ...sampleMoveData, id });
      expect(result.success).toBe(false);
    }
  });

  it("rejects invalid category", () => {
    const result = MoveSchema.safeParse({
      ...sampleMoveData,
      category: "Bachata Sensual",
    });
    expect(result.success).toBe(false);
  });

  it("rejects eightCounts less than 1 or non-integer", () => {
    expect(MoveSchema.safeParse({ ...sampleMoveData, eightCounts: 0 }).success).toBe(false);
    expect(MoveSchema.safeParse({ ...sampleMoveData, eightCounts: -1 }).success).toBe(false);
    expect(MoveSchema.safeParse({ ...sampleMoveData, eightCounts: 1.5 }).success).toBe(false);
  });

  it("rejects ruedaCall that is not in canonical RUEDA_CALLS", () => {
    const result = MoveSchema.safeParse({
      ...sampleMoveData,
      ruedaCall: "Not A Real Call",
    });
    expect(result.success).toBe(false);
  });

  it("correctly identifies drafts and reviewed moves", () => {
    const draft1 = MoveSchema.parse({ ...sampleMoveData, reviewedBy: undefined });
    const draft2 = MoveSchema.parse({ ...sampleMoveData, reviewedBy: "" });
    const draft3 = MoveSchema.parse({ ...sampleMoveData, reviewedBy: "   " });
    const reviewed = MoveSchema.parse({ ...sampleMoveData, reviewedBy: "Enrique Perez" });

    expect(isMoveDraft(draft1)).toBe(true);
    expect(isMoveDraft(draft2)).toBe(true);
    expect(isMoveDraft(draft3)).toBe(true);
    expect(isMoveDraft(reviewed)).toBe(false);
  });
});

describe("MoveVideoSchema", () => {
  const validVideo = {
    youtubeVideoId: "12345678901",
    startSeconds: 15,
    endSeconds: 45,
    channelTitle: "Cuban Salsa Masters",
    title: "Enchufla Tutorial",
    embeddable: true as const,
    checkedAt: "2026-11-01T10:00:00Z",
  };

  it("accepts valid video with 11-char ID and embeddable: true", () => {
    const result = MoveVideoSchema.safeParse(validVideo);
    expect(result.success).toBe(true);
  });

  it("rejects non-11 char video IDs", () => {
    expect(MoveVideoSchema.safeParse({ ...validVideo, youtubeVideoId: "too-short" }).success).toBe(false);
    expect(MoveVideoSchema.safeParse({ ...validVideo, youtubeVideoId: "way-too-long-video-id" }).success).toBe(false);
  });

  it("rejects embeddable false", () => {
    expect(MoveVideoSchema.safeParse({ ...validVideo, embeddable: false }).success).toBe(false);
  });

  it("rejects endSeconds <= startSeconds", () => {
    expect(
      MoveVideoSchema.safeParse({ ...validVideo, startSeconds: 30, endSeconds: 20 }).success
    ).toBe(false);
    expect(
      MoveVideoSchema.safeParse({ ...validVideo, startSeconds: 20, endSeconds: 20 }).success
    ).toBe(false);
  });

  it("rejects invalid checkedAt dates", () => {
    expect(
      MoveVideoSchema.safeParse({ ...validVideo, checkedAt: "not-a-date" }).success
    ).toBe(false);
  });
});

describe("ComboSchema and helpers", () => {
  const move1: Move = {
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
    tags: ["core"],
    videos: [],
  };

  const move2: Move = {
    id: "enchufla",
    name: "Enchufla",
    category: "Casino figure",
    level: "Beginner",
    eightCounts: 1,
    summary: "Turn",
    leaderSteps: [{ counts: "1-3", text: "step" }],
    followerSteps: [{ counts: "1-3", text: "step" }],
    commonMistakes: [],
    prerequisites: [],
    variations: [],
    tags: ["core"],
    videos: [],
  };

  const move3: Move = {
    id: "setenta",
    name: "Setenta",
    category: "Casino figure",
    level: "Improver",
    eightCounts: 2,
    summary: "70",
    leaderSteps: [{ counts: "1-8", text: "step" }],
    followerSteps: [{ counts: "1-8", text: "step" }],
    commonMistakes: [],
    prerequisites: [],
    variations: [],
    tags: ["figure"],
    videos: [],
  };

  const movesMap = new Map<string, Move>([
    [move1.id, move1],
    [move2.id, move2],
    [move3.id, move3],
  ]);

  const lookup = (id: string) => movesMap.get(id);

  it("validates a combo with correct eightCounts sum", () => {
    const comboData = {
      id: "guapea-enchufla-setenta",
      name: "Guapea into Enchufla and Setenta",
      moveIds: ["guapea", "enchufla", "setenta"],
      eightCounts: 4, // 1 + 1 + 2
      level: "Improver" as const,
      gears: ["Casino (Smooth)", "Casino (Flow)"] as const,
    };

    const parsed = ComboSchema.safeParse(comboData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const check = validateCombo(parsed.data, lookup);
      expect(check.valid).toBe(true);
      expect(check.expected).toBe(4);
      expect(check.actual).toBe(4);
      expect(check.missingMoveIds).toHaveLength(0);
    }
  });

  it("detects when combo eightCounts does not match sum of move counts", () => {
    const comboData = {
      id: "guapea-enchufla-setenta",
      name: "Guapea into Enchufla and Setenta",
      moveIds: ["guapea", "enchufla", "setenta"],
      eightCounts: 3, // Mismatch: 1 + 1 + 2 = 4
      level: "Improver" as const,
      gears: ["Casino (Flow)"] as const,
    };

    const parsed = ComboSchema.parse(comboData);
    const check = validateCombo(parsed, lookup);
    expect(check.valid).toBe(false);
    expect(check.expected).toBe(4);
    expect(check.actual).toBe(3);
  });

  it("reports missing move ids in validateCombo", () => {
    const comboData = {
      id: "mystery-combo",
      name: "Mystery Combo",
      moveIds: ["guapea", "unknown-move"],
      eightCounts: 2,
      level: "Beginner" as const,
      gears: ["Casino (Smooth)"] as const,
    };

    const parsed = ComboSchema.parse(comboData);
    const check = validateCombo(parsed, lookup);
    expect(check.valid).toBe(false);
    expect(check.missingMoveIds).toEqual(["unknown-move"]);
  });
});
