import { describe, it, expect } from "vitest";
import { parseMoveInput } from "@/lib/moves/move-import";
import { isMoveDraft } from "@/lib/moves/move-schema";

describe("move-import: parseMoveInput", () => {
  const validMoveRaw = {
    id: "enchufla-doble",
    name: "Enchufla Doble",
    spanishName: "Enchúfla Doble",
    category: "Casino figure",
    level: "Improver",
    eightCounts: 2,
    summary: "Two successive Enchufla turns with continuous perimeter travel.",
    leaderSteps: [
      { counts: "1-3", text: "Back break on left foot, guide follow inside turn" },
      { counts: "5-7", text: "Step across to outside perimeter" },
      { counts: "second 1-3", text: "Second inside turn guide with right hand tap" },
      { counts: "second 5-7", text: "Resolve into open circular Guapea" },
    ],
    followerSteps: [
      { counts: "1-3", text: "Inside pivot under lead's arm" },
      { counts: "5-7", text: "Step forward around circle" },
      { counts: "second 1-3", text: "Second consecutive inside turn" },
      { counts: "second 5-7", text: "Collect weight in open position" },
    ],
    commonMistakes: ["Pulling follow's shoulder rather than creating open arch"],
    prerequisites: ["guapea", "enchufla"],
    variations: ["Enchufla Doble con Alarde"],
    ruedaCall: "Enchufla Doble",
    tags: ["turn", "improver", "rueda"],
  };

  it("parses valid raw JSON object", () => {
    const raw = JSON.stringify(validMoveRaw);
    const result = parseMoveInput(raw);

    expect(result.errors).toHaveLength(0);
    expect(result.moves).toHaveLength(1);
    expect(result.moves[0].id).toBe("enchufla-doble");
    expect(result.moves[0].videos).toEqual([]);
    expect(isMoveDraft(result.moves[0])).toBe(true);
  });

  it("parses JSON wrapped inside markdown code fences", () => {
    const raw = "```json\n" + JSON.stringify(validMoveRaw, null, 2) + "\n```";
    const result = parseMoveInput(raw);

    expect(result.errors).toHaveLength(0);
    expect(result.moves).toHaveLength(1);
    expect(result.moves[0].name).toBe("Enchufla Doble");
  });

  it("parses array of moves", () => {
    const raw = JSON.stringify([
      validMoveRaw,
      {
        ...validMoveRaw,
        id: "enchufla-con-alarde",
        name: "Enchufla con Alarde",
        ruedaCall: "Enchufla",
      },
    ]);
    const result = parseMoveInput(raw);

    expect(result.errors).toHaveLength(0);
    expect(result.moves).toHaveLength(2);
    expect(result.moves[1].id).toBe("enchufla-con-alarde");
  });

  it("parses object with { 'moves': [...] } wrapper", () => {
    const raw = JSON.stringify({ moves: [validMoveRaw] });
    const result = parseMoveInput(raw);

    expect(result.errors).toHaveLength(0);
    expect(result.moves).toHaveLength(1);
  });

  it("returns error on empty or invalid JSON", () => {
    expect(parseMoveInput("").errors).toContain("Please paste Move Maker JSON output first.");
    expect(parseMoveInput("not valid json").errors[0]).toMatch(/Not valid JSON/);
  });

  it("returns errors for Zod validation failures", () => {
    const invalid = {
      ...validMoveRaw,
      id: "Invalid_ID_Not_Kebab",
      category: "Not Real Category",
      eightCounts: -1,
    };
    const result = parseMoveInput(JSON.stringify(invalid));
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("detects duplicate IDs within the imported batch", () => {
    const raw = JSON.stringify([validMoveRaw, validMoveRaw]);
    const result = parseMoveInput(raw);

    expect(result.errors.some((e) => e.includes("Duplicate move id"))).toBe(true);
  });

  it("warns if move ID already exists in seeded curriculum", () => {
    const existing = {
      ...validMoveRaw,
      id: "guapea", // Already in SEEDED_MOVES
    };
    const result = parseMoveInput(JSON.stringify(existing));

    expect(result.warnings.some((w) => w.includes("already exists in the curriculum"))).toBe(true);
  });

  it("warns on unknown prerequisites", () => {
    const withUnknownPrereq = {
      ...validMoveRaw,
      prerequisites: ["guapea", "non-existent-fantasy-move"],
    };
    const result = parseMoveInput(JSON.stringify(withUnknownPrereq));

    expect(
      result.warnings.some((w) => w.includes('Unknown prerequisite "non-existent-fantasy-move"'))
    ).toBe(true);
  });

  it("warns on unrecognized ruedaCall", () => {
    const withBogusCall = {
      ...validMoveRaw,
      ruedaCall: "Spin Around Fast And Yell",
    };
    const result = parseMoveInput(JSON.stringify(withBogusCall));

    expect(
      result.warnings.some((w) => w.includes("not recognized in canonical RUEDA_CALLS"))
    ).toBe(true);
  });

  it("warns when eightCounts doesn't match step counts", () => {
    // Mismatch 1: eightCounts is 1, but step mentions 9-16
    const mismatch1 = {
      ...validMoveRaw,
      eightCounts: 1,
      leaderSteps: [
        { counts: "1-8", text: "Basic step" },
        { counts: "9-16", text: "Second step" },
      ],
      followerSteps: [{ counts: "1-16", text: "Continuous motion" }],
    };
    const result1 = parseMoveInput(JSON.stringify(mismatch1));
    expect(
      result1.warnings.some((w) => w.includes("eightCounts is declared as 1, but step labels reference counts beyond 8"))
    ).toBe(true);

    // Mismatch 2: eightCounts is 2, but step only gives single 1-3 and 5-7
    const mismatch2 = {
      ...validMoveRaw,
      eightCounts: 2,
      leaderSteps: [
        { counts: "1-3", text: "Single step" },
        { counts: "5-7", text: "Single resolution" },
      ],
      followerSteps: [
        { counts: "1-3", text: "Single step" },
        { counts: "5-7", text: "Single resolution" },
      ],
    };
    const result2 = parseMoveInput(JSON.stringify(mismatch2));
    expect(
      result2.warnings.some((w) => w.includes("eightCounts is declared as 2, but step breakdown only appears to cover a single 8-count"))
    ).toBe(true);
  });
});
