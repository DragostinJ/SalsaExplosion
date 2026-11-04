import { describe, expect, it } from "vitest";
import {
  aiStudioTime,
  chatMessage,
  clipWindow,
  formatMapperTime,
  mergePieceAnswers,
  planPieces,
  type MapperChatManifest,
} from "@/lib/moves/mapper-chat";
import { parseClipBreakdownInput } from "@/lib/moves/pro-clips";

const manifest: MapperChatManifest = {
  kind: "ritmoflow-mapper-chat",
  version: 1,
  id: "paolo-alina-test",
  youtubeVideoId: "Wh1zERcDWGM",
  title: "A real title",
  channelTitle: "A real channel",
  dancers: ["Paolo", "Alina"],
  focus: "moves",
  fps: 8,
  model: "Gemini 4 Argon",
  pieces: planPieces(29, 67, 20),
};

const MECHANICS = "Hold: open, his left holds her right. 1-3: both rock back. 5-7: she turns once to her right.";
const row = (start: string, end: string, moveIds: string[], extra: Record<string, unknown> = {}) => ({
  start,
  end,
  type: "figure",
  mechanics: MECHANICS,
  moveIds,
  match: moveIds.length ? "same" : "not-in-library",
  confidence: "medium",
  ...extra,
});
const answer = (rows: unknown[], model = "gemini-4-argon") =>
  JSON.stringify({ kind: "ritmoflow-clip-breakdown", version: 1, id: "chat-made-this-up", title: "Invented", analysis: { model, fps: 8, notes: "Some camera cuts." }, rows });

describe("Move Mapper chat: pieces and messages", () => {
  it("cuts a clip into equal pieces of at most the given length", () => {
    expect(planPieces(29, 67, 20)).toEqual([
      { number: 1, start: 29, end: 48 },
      { number: 2, start: 48, end: 67 },
    ]);
    expect(planPieces(4, 19, 20)).toEqual([{ number: 1, start: 4, end: 19 }]);
    expect(planPieces(0, 50, 20).map((p) => [p.start, p.end])).toEqual([
      [0, 16.7],
      [16.7, 33.3],
      [33.3, 50],
    ]);
    expect(() => planPieces(30, 10, 20)).toThrow();
  });

  it("writes times the way the instructions ask for", () => {
    expect(formatMapperTime(65)).toBe("1:05");
    expect(formatMapperTime(65.5)).toBe("1:05.5");
    expect(formatMapperTime(59.96)).toBe("1:00");
  });

  it("pads the clip by a second either side, in whole seconds, never before 0:00", () => {
    expect(clipWindow({ number: 1, start: 29, end: 48 })).toEqual({ start: 28, end: 49 });
    expect(clipWindow({ number: 1, start: 0.5, end: 10 })).toEqual({ start: 0, end: 11 });
    expect(clipWindow({ number: 2, start: 16.7, end: 33.3 })).toEqual({ start: 15, end: 35 });
  });

  it("writes the video settings the way AI Studio asks for them", () => {
    expect(aiStudioTime(3)).toBe("0h0m3s");
    expect(aiStudioTime(20)).toBe("0h0m20s");
    expect(aiStudioTime(68)).toBe("0h1m8s");
    expect(aiStudioTime(3725)).toBe("1h2m5s");
  });

  it("sends the same message as the Build app, with the song map only when given", () => {
    const message = chatMessage(manifest, manifest.pieces[0]);
    expect(message.split("\n")).toEqual([
      "Video: https://www.youtube.com/watch?v=Wh1zERcDWGM",
      "Piece: 0:29 to 0:48 (times in the original video)",
      "Clip id: paolo-alina-test",
      "Title: A real title",
      "Channel: A real channel",
      "Dancers: Paolo, Alina",
      "Frames per second: 8",
      "Focus: moves",
    ]);
    const withSong = chatMessage({ ...manifest, songId: "me-dicen-cuba", songMap: ["0:00-0:18 Intro"] }, manifest.pieces[0]);
    expect(withSong).toContain("Song id: me-dicen-cuba\nSong map:\n0:00-0:18 Intro\nFrames per second: 8");
  });
});

describe("Move Mapper chat: joining the answers", () => {
  it("takes the header from the run, never from the chat, and passes the clip importer's checks", () => {
    const result = mergePieceAnswers(manifest, [
      { piece: manifest.pieces[0], raw: "```json\n" + answer([row("0:30", "0:40", ["dile-que-no"])]) + "\n```" },
      { piece: manifest.pieces[1], raw: answer([row("0:50", "1:00", ["enchufla"])]) },
    ]);
    expect(result.missing).toEqual([]);
    expect(result.breakdown?.id).toBe("paolo-alina-test");
    expect(result.breakdown?.title).toBe("A real title");
    expect(result.breakdown?.analysis?.model).toBe("Gemini 4 Argon");
    expect(result.breakdown?.analysis?.notes).toContain("Piece 1: Some camera cuts.");
    expect(result.breakdown?.rows.map((r) => [r.start, r.end, r.moveIds])).toEqual([
      ["0:30", "0:40", ["dile-que-no"]],
      ["0:50", "1:00", ["enchufla"]],
    ]);
    expect(parseClipBreakdownInput(JSON.stringify(result.breakdown)).ok).toBe(true);
  });

  it("moves times counted from the clip's first frame onto the video's clock", () => {
    const result = mergePieceAnswers(manifest, [
      { piece: manifest.pieces[1], raw: answer([row("0:01", "0:09", ["enchufla"])]) },
    ]);
    // Piece 2's clip starts at 0:47, so 0:01 → 0:48 and 0:09 → 0:56
    expect(result.breakdown?.rows.map((r) => [r.start, r.end])).toEqual([["0:48", "0:56"]]);
    expect(result.notes.join(" ")).toContain("0:47 was added");
  });

  it("joins a figure split across the border between two pieces", () => {
    const result = mergePieceAnswers(manifest, [
      { piece: manifest.pieces[0], raw: answer([row("0:30", "0:41", ["dile-que-no"]), row("0:41", "0:48", ["enchufla"])]) },
      { piece: manifest.pieces[1], raw: answer([row("0:47", "0:58", ["enchufla"])]) },
    ]);
    expect(result.breakdown?.rows.map((r) => [r.start, r.end, r.moveIds.join()])).toEqual([
      ["0:30", "0:41", "dile-que-no"],
      ["0:41", "0:58", "enchufla"],
    ]);
  });

  it("ends a row where the next one starts when they overlap, and drops slivers", () => {
    const result = mergePieceAnswers(manifest, [
      {
        piece: manifest.pieces[0],
        raw: answer([row("0:30", "0:40", ["dile-que-no"]), row("0:38", "0:46", ["enchufla"]), row("0:46", "0:46.5", ["guapea"])]),
      },
    ]);
    expect(result.breakdown?.rows.map((r) => [r.start, r.end])).toEqual([
      ["0:30", "0:38"],
      ["0:38", "0:46"],
    ]);
  });

  it("leaves out broken rows with a reason, tidies empty extras and lists pieces still to run", () => {
    const result = mergePieceAnswers(manifest, [
      {
        piece: manifest.pieces[0],
        raw: answer([
          row("0:30", "0:40", ["dile-que-no"], { musicalMoment: "  ", newMove: { name: "x", category: "Casino figure", level: "Beginner" } }),
          row("0:40", "0:45", ["enchufla"], { mechanics: "too short" }),
          row("40", "0:45", ["enchufla"]),
        ]),
      },
      { piece: manifest.pieces[1], raw: "" },
    ]);
    expect(result.missing).toEqual([2]);
    expect(result.breakdown?.rows).toHaveLength(1);
    expect(result.breakdown?.rows[0]).not.toHaveProperty("musicalMoment");
    expect(result.breakdown?.rows[0]).not.toHaveProperty("newMove");
    expect(result.notes.join("\n")).toMatch(/row 2 left out: mechanics/);
    expect(result.notes.join("\n")).toMatch(/row 3 left out: its times "40"/);
  });

  it("warns when the chat says it is a different model from the one picked", () => {
    const result = mergePieceAnswers(manifest, [
      { piece: manifest.pieces[0], raw: answer([row("0:30", "0:40", ["dile-que-no"])], "gemini-3.1-flash-lite") },
    ]);
    expect(result.notes.join(" ")).toContain("Check the model picker");
    const same = mergePieceAnswers(manifest, [{ piece: manifest.pieces[0], raw: answer([row("0:30", "0:40", ["dile-que-no"])]) }]);
    expect(same.notes.join(" ")).not.toContain("Check the model picker");
  });

  it("says so when an answer is not JSON", () => {
    const result = mergePieceAnswers(manifest, [{ piece: manifest.pieces[0], raw: "Sorry, I can't watch videos." }]);
    expect(result.breakdown).toBeNull();
    expect(result.notes[0]).toContain("not complete JSON");
  });
});
