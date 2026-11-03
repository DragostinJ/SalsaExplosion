import { describe, expect, it } from "vitest";
import { addUnsureNote, applyMoveCheck, parseMoveCheckAnswer } from "@/lib/moves/move-check";
import { parseMoveInput } from "@/lib/moves/move-import";
import { hasUnsureNote, type Move } from "@/lib/moves/move-schema";
import { STORED_DRAFTS } from "@/lib/moves/move-review";

const draft: Move = {
  id: "test-figure",
  name: "Test Figure",
  category: "Casino figure",
  level: "Improver",
  eightCounts: 1,
  summary: "The leader turns the follower to her right.",
  leaderSteps: [
    { counts: "1-3", text: "Rock back with his left foot, right hand on her back." },
    { counts: "5-7", text: "Lead her turn with his right hand." },
  ],
  followerSteps: [{ counts: "1-3", text: "Rock back with her right foot and step on 4." }],
  commonMistakes: ["Pulling the arm down.", "Pulling the arm early."],
  prerequisites: [],
  variations: ["With a hand change."],
  tags: [],
  videos: [],
};

const answer = (fixes: object[], flags: object[] = [], batch = "check-01") =>
  parseMoveCheckAnswer(JSON.stringify({ batch, fixes, flags }));

describe("applyMoveCheck", () => {
  it("applies a fix whose text is found exactly once, inside one step", () => {
    const result = applyMoveCheck({
      drafts: [draft],
      answers: [answer([{ id: "test-figure", field: "leaderSteps", from: "his right hand.", to: "his left hand.", kind: "hold", why: "Open hold" }])],
    });
    expect(result.fixes[0]).toMatchObject({ key: "check-01#0", outcome: "applied" });
    expect(result.drafts[0].leaderSteps[1].text).toBe("Lead her turn with his left hand.");
    expect(result.drafts[0].leaderSteps[0].text).toBe(draft.leaderSteps[0].text);
    expect(result.changedIds).toEqual(["test-figure"]);
  });

  it("refuses text that isn't there or is there twice, and changes nothing", () => {
    const result = applyMoveCheck({
      drafts: [draft],
      answers: [
        answer([
          { id: "test-figure", field: "summary", from: "to her left", to: "x", kind: "direction" },
          { id: "test-figure", field: "commonMistakes", from: "Pulling the arm", to: "x", kind: "wording" },
          { id: "nope", field: "summary", from: "a", to: "b", kind: "wording" },
        ]),
      ],
    });
    expect(result.fixes.map((f) => f.outcome)).toEqual(["no-match", "ambiguous", "unknown-move"]);
    expect(result.drafts[0]).toEqual(draft);
  });

  it("turns skipped fixes and flags into UNSURE notes for the teachers", () => {
    const result = applyMoveCheck({
      drafts: [draft],
      answers: [
        answer(
          [{ id: "test-figure", field: "followerSteps", from: "step on 4", to: "pause on 4", kind: "counts", why: "Casino pauses on 4" }],
          [{ id: "test-figure", issue: "Confirm which hand changes in the variation" }]
        ),
      ],
      skip: new Set(["check-01#0"]),
    });
    expect(result.fixes[0].outcome).toBe("skipped");
    expect(result.drafts[0].followerSteps[0].text).toBe(draft.followerSteps[0].text);
    expect(result.drafts[0].notes).toContain('UNSURE (check): Casino pauses on 4 (it suggested "pause on 4" for "step on 4").');
    expect(result.drafts[0].notes).toContain("UNSURE (check): Confirm which hand changes in the variation.");
    expect(hasUnsureNote(result.drafts[0])).toBe(true);
  });

  it("leaves a move a teacher already reviewed alone", () => {
    const result = applyMoveCheck({
      drafts: [draft],
      answers: [answer([{ id: "test-figure", field: "summary", from: "her right", to: "her left", kind: "direction" }], [{ id: "test-figure", issue: "x" }])],
      reviewedIds: new Set(["test-figure"]),
    });
    expect(result.fixes[0].outcome).toBe("reviewed-move");
    expect(result.drafts[0]).toEqual(draft);
  });

  it("won't let a fix break the move", () => {
    const result = applyMoveCheck({
      drafts: [draft],
      answers: [answer([{ id: "test-figure", field: "summary", from: "The leader turns the follower to her right.", to: "", kind: "wording" }])],
    });
    expect(result.fixes[0].outcome).toBe("invalid-result");
    expect(result.drafts[0]).toEqual(draft);
  });
});

describe("move check answers", () => {
  it("reads the JSON out of a Gemini code block", () => {
    const parsed = parseMoveCheckAnswer('Here you go:\n```json\n{"batch":"check-07","fixes":[],"flags":[]}\n```');
    expect(parsed.batch).toBe("check-07");
  });

  it("rejects a reply in the wrong shape", () => {
    expect(() => parseMoveCheckAnswer('{"moves":[]}')).toThrow();
  });

  it("adds each UNSURE note once", () => {
    const once = addUnsureNote("UNSURE: name varies.", "Check the counts");
    expect(addUnsureNote(once, "Check the counts")).toBe(once);
  });
});

describe("draft notes", () => {
  it("survive the Move Maker import now that the schema has them", () => {
    const { moves, errors } = parseMoveInput(JSON.stringify({ moves: [{ ...draft, notes: "UNSURE: counts vary." }] }));
    expect(errors).toEqual([]);
    expect(moves[0].notes).toBe("UNSURE: counts vary.");
  });

  it("are back on every stored draft", () => {
    expect(STORED_DRAFTS.length).toBeGreaterThan(200);
    expect(STORED_DRAFTS.filter((m) => !m.notes)).toEqual([]);
  });
});
