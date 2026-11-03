import { describe, expect, it } from "vitest";
import { getAllMoves } from "@/lib/moves/move-library";
import { checkMoveLibrary } from "@/lib/moves/move-health";
import type { Move } from "@/lib/moves/move-schema";

const base: Move = {
  id: "a",
  name: "Figure A",
  category: "Casino figure",
  level: "Improver",
  eightCounts: 1,
  summary: "A figure long enough to pass the short summary check easily.",
  leaderSteps: [{ counts: "1-3", text: "x" }, { counts: "5-7", text: "y" }],
  followerSteps: [{ counts: "1-3", text: "x" }, { counts: "5-7", text: "y" }],
  commonMistakes: [],
  prerequisites: [],
  variations: [],
  tags: [],
  videos: [],
};

describe("move library health", () => {
  it("has no errors in the real library (counts, labels, prerequisite loops)", () => {
    const errors = checkMoveLibrary(getAllMoves()).filter((i) => i.level === "error");
    expect(errors).toEqual([]);
  });

  it("catches counts past the move's length and repeated labels", () => {
    const issues = checkMoveLibrary([
      { ...base, leaderSteps: [{ counts: "1-8", text: "x" }, { counts: "9-16", text: "y" }] },
      { ...base, id: "b", name: "Figure B", eightCounts: 3, followerSteps: [{ counts: "1-8", text: "x" }, { counts: "1-8", text: "y" }] },
    ]);
    expect(issues.map((i) => `${i.id} ${i.rule}`)).toEqual(
      expect.arrayContaining(["a count-beyond-length", "b repeated-label"])
    );
  });

  it("catches prerequisite loops, self-references and unknown moves", () => {
    const issues = checkMoveLibrary([
      { ...base, prerequisites: ["b"] },
      { ...base, id: "b", name: "Figure B", prerequisites: ["a", "b", "ghost"] },
    ]);
    const rules = issues.map((i) => i.rule);
    expect(rules).toContain("prerequisite-loop");
    expect(rules).toContain("self-prerequisite");
    expect(rules).toContain("unknown-prerequisite");
  });

  it("warns about two entries with the same name", () => {
    const issues = checkMoveLibrary([base, { ...base, id: "a-copy", name: "Figure  A" }]);
    expect(issues).toEqual([expect.objectContaining({ id: "a-copy", rule: "same-name" })]);
  });
});
