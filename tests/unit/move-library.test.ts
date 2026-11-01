import { describe, it, expect } from "vitest";
import {
  SEEDED_MOVES,
  findMove,
  songSectionsForMove,
  movesForSection,
  sectionBars,
  comboFitsSection,
} from "@/lib/moves/move-library";
import { MoveSchema, type Combo } from "@/lib/moves/move-schema";
import { CUBAN_CURRICULUM_DATA } from "@/lib/constants/cuban-curriculum-2027";
import {
  TIMBA_SONG_ANATOMY_DATA,
  type SongAnatomy,
} from "@/lib/constants/timba-song-anatomy";

describe("move-library: SEEDED_MOVES", () => {
  it("seeds exactly one Move per CUBAN_CURRICULUM_DATA item (30 items)", () => {
    expect(SEEDED_MOVES).toHaveLength(CUBAN_CURRICULUM_DATA.length);
    expect(SEEDED_MOVES).toHaveLength(30);
  });

  it("every seeded move adheres strictly to MoveSchema and starts as a draft", () => {
    for (const move of SEEDED_MOVES) {
      const parsed = MoveSchema.safeParse(move);
      expect(parsed.success).toBe(true);
      expect(move.reviewedBy).toBeUndefined();
      expect(move.videos).toEqual([]);
      expect(move.eightCounts).toBeGreaterThanOrEqual(1);
    }
  });

  it("seeds Setenta with eightCounts: 2 and no counts-unverified tag", () => {
    const setenta = findMove("setenta");
    expect(setenta).toBeDefined();
    expect(setenta?.curriculumId).toBe("imp-pw-1");
    expect(setenta?.eightCounts).toBe(2);
    expect(setenta?.tags).not.toContain("counts-unverified");
  });

  it("seeds Guapea with eightCounts: 1 and no counts-unverified tag", () => {
    const guapea = findMove("guapea");
    expect(guapea).toBeDefined();
    expect(guapea?.curriculumId).toBe("beg-pw-1");
    expect(guapea?.eightCounts).toBe(1);
    expect(guapea?.tags).not.toContain("counts-unverified");
  });

  it("tags unverified moves with 'counts-unverified'", () => {
    const unverifiedMove = findMove("imp-pw-2"); // Setenta Complicado
    expect(unverifiedMove).toBeDefined();
    expect(unverifiedMove?.tags).toContain("counts-unverified");
    expect(unverifiedMove?.eightCounts).toBe(1);
  });

  it("finds moves by either kebab-case ID or curriculumId", () => {
    expect(findMove("dile-que-no")?.id).toBe("dile-que-no");
    expect(findMove("beg-pw-2")?.id).toBe("dile-que-no");
  });
});

describe("move-library: songSectionsForMove and movesForSection", () => {
  it("finds song sections using recommendedMoveSlugs and ruedaCall === handGesture", () => {
    // Guapea is recommended across many sections and called in Rueda
    const guapeaSections = songSectionsForMove("guapea");
    expect(guapeaSections.length).toBeGreaterThan(0);

    for (const sectionLink of guapeaSections) {
      expect(sectionLink.songId).toBeDefined();
      expect(sectionLink.sectionId).toBeDefined();
      expect(sectionLink.sectionName).toBeDefined();
      expect(sectionLink.startTimeSeconds).toBeGreaterThanOrEqual(0);
    }
  });

  it("finds sections when passed curriculumId directly", () => {
    const sectionsBySlug = songSectionsForMove("beg-pw-1");
    const sectionsById = songSectionsForMove("guapea");
    expect(sectionsBySlug).toEqual(sectionsById);
  });

  it("retrieves moves for a section in temba-tumba-timba", () => {
    const temba = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "temba-tumba-timba");
    expect(temba).toBeDefined();
    if (!temba) return;

    // vanvan-seg-2 recommends beg-pw-2, beg-pw-1, beg-pw-5 and has handGesture 'Dile Que No'
    const moves = movesForSection(temba, "vanvan-seg-2");
    expect(moves.length).toBeGreaterThanOrEqual(3);

    const ids = moves.map((m) => m.id);
    expect(ids).toContain("guapea");
    expect(ids).toContain("dile-que-no");
    expect(ids).toContain("exhibela");
  });
});

describe("move-library: sectionBars and comboFitsSection (Temba & Marcando)", () => {
  const temba = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "temba-tumba-timba") as SongAnatomy;
  const marcando = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "marcando-la-distancia") as SongAnatomy;

  it("returns explicit bars for sections that have bars defined", () => {
    const coro1 = temba.segments.find((s) => s.id === "vanvan-seg-3")!;
    expect(coro1.bars).toBe(8);
    expect(sectionBars(temba, coro1)).toBe(8);

    const tema2 = temba.segments.find((s) => s.id === "vanvan-seg-4")!;
    expect(tema2.bars).toBe(13);
    expect(sectionBars(temba, tema2)).toBe(13);
  });

  it("computes estimated bars using round((end - start) * bpm / 240) when bars is missing", () => {
    // Synthetic section without explicit bars
    const syntheticSection = {
      ...temba.segments[0],
      bars: undefined,
      startTimeSeconds: 0,
      endTimeSeconds: 30, // 30s at 107 BPM -> 30 * 107 / 240 = 13.375 -> 13 bars
    };

    expect(sectionBars(temba, syntheticSection)).toBe(13);
  });

  it("evaluates comboFitsSection correctly on Temba Tumba Timba Coro 1 (8 bars)", () => {
    const coro1 = temba.segments.find((s) => s.id === "vanvan-seg-3")!;
    expect(coro1.bars).toBe(8);

    // Combo A: 2 eightCounts = 4 bars (divides 8 evenly: 8 % 4 === 0)
    const combo2EightCounts: Combo = {
      id: "guapea-dilequeno",
      name: "Guapea into Dile Que No",
      moveIds: ["guapea", "dile-que-no"],
      eightCounts: 2,
      level: "Beginner",
      gears: ["Casino (Flow)"],
    };
    expect(comboFitsSection(combo2EightCounts, temba, coro1)).toBe(true);

    // Combo B: 4 eightCounts = 8 bars (fits exactly: 8 % 8 === 0)
    const combo4EightCounts: Combo = {
      id: "four-count-combo",
      name: "Four Count Combo",
      moveIds: ["guapea", "dile-que-no", "setenta"],
      eightCounts: 4,
      level: "Improver",
      gears: ["Casino (Flow)"],
    };
    expect(comboFitsSection(combo4EightCounts, temba, coro1)).toBe(true);

    // Combo C: 3 eightCounts = 6 bars (8 % 6 === 2 !== 0, does not fit evenly)
    const combo3EightCounts: Combo = {
      id: "three-count-combo",
      name: "Three Count Combo",
      moveIds: ["guapea", "setenta"],
      eightCounts: 3,
      level: "Improver",
      gears: ["Casino (Flow)"],
    };
    expect(comboFitsSection(combo3EightCounts, temba, coro1)).toBe(false);
  });

  it("evaluates comboFitsSection on Marcando La Distancia sections", () => {
    // marcando-seg-2: 8 bars (Tema 1)
    const tema1 = marcando.segments.find((s) => s.id === "marcando-seg-2")!;
    expect(sectionBars(marcando, tema1)).toBe(8);

    const combo2EightCounts: Combo = {
      id: "two-eight-count-combo",
      name: "Two Eight Count Combo",
      moveIds: ["guapea", "dile-que-no"],
      eightCounts: 2, // 4 bars
      level: "Beginner",
      gears: ["Casino (Smooth)"],
    };
    expect(comboFitsSection(combo2EightCounts, marcando, tema1)).toBe(true);

    // marcando-seg-5: 17 bars (Montuno 1). 17 % 4 = 1 !== 0, combo does not divide 17
    const montuno1 = marcando.segments.find((s) => s.id === "marcando-seg-5")!;
    expect(sectionBars(marcando, montuno1)).toBe(17);
    expect(comboFitsSection(combo2EightCounts, marcando, montuno1)).toBe(false);
  });
});
