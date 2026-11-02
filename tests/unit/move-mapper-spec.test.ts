import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getPublishedMoves } from "@/lib/moves/move-library";
import {
  CLIP_BREAKDOWN_KIND,
  CLIP_CONFIDENCES,
  CLIP_MATCHES,
  CLIP_ROW_TYPES,
  buildMoveMapperResponseSchema,
  buildMoveMapperSegmenterInstructions,
  buildMoveMapperSegmenterSchema,
  buildMoveMapperSystemInstructions,
} from "@/lib/moves/move-mapper-spec";
import { buildGoldSetMarkdown, buildSongMapsMarkdown } from "@/lib/moves/move-mapper-docs";
import { MOVE_MAPPER_GOLD_SET } from "@/lib/moves/move-mapper-gold-set";
import { parseScoredBreakdown, scoreAgainstGold, scoreGoldSet } from "@/lib/moves/move-mapper-score";

const docs = path.resolve(__dirname, "../../docs/ai-studio-move-mapper");
const read = (file: string) => readFileSync(path.join(docs, file), "utf8");
const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";

type Node = {
  enum?: string[];
  items?: Node;
  properties?: Record<string, Node>;
};
const rowOf = (schema: unknown) => (schema as Node).properties!.rows.items!.properties!;

describe("AI Studio Move Mapper setup", () => {
  it("checked-in files match the generator (run: npx tsx scripts/ai-studio-move-mapper.ts)", () => {
    expect(read("system-instructions.txt")).toBe(buildMoveMapperSystemInstructions());
    expect(read("response-schema.json")).toBe(json(buildMoveMapperResponseSchema()));
    expect(read("response-schema-lite.json")).toBe(json(buildMoveMapperResponseSchema({ moveIdEnum: false })));
    expect(read("segmenter-instructions.txt")).toBe(buildMoveMapperSegmenterInstructions());
    expect(read("segmenter-schema.json")).toBe(json(buildMoveMapperSegmenterSchema()));
    expect(read("gold-set.md")).toBe(buildGoldSetMarkdown());
    expect(read("song-maps.md")).toBe(buildSongMapsMarkdown());
  });

  it("only lets Gemini name moves dancers can see, and the lite schema drops that list", () => {
    const ids = getPublishedMoves().map((m) => m.id);
    expect(rowOf(buildMoveMapperResponseSchema()).moveIds.items!.enum).toEqual(ids);
    expect(rowOf(buildMoveMapperResponseSchema({ moveIdEnum: false })).moveIds.items!.enum).toBeUndefined();
    for (const id of ids) expect(buildMoveMapperSystemInstructions()).toContain(`- ${id} | `);
  });

  it("uses the clip-breakdown vocabulary the importer expects", () => {
    const root = buildMoveMapperResponseSchema() as Node;
    const row = rowOf(root);
    expect(root.properties!.kind.enum).toEqual([CLIP_BREAKDOWN_KIND]);
    expect(row.type.enum).toEqual([...CLIP_ROW_TYPES]);
    expect(row.match.enum).toEqual([...CLIP_MATCHES]);
    expect(row.confidence.enum).toEqual([...CLIP_CONFIDENCES]);
  });
});

describe("Move Mapper gold set", () => {
  const library = new Set(getPublishedMoves().map((m) => m.id));

  it("has unique, well-formed videos whose answers are real library moves", () => {
    const videoIds = MOVE_MAPPER_GOLD_SET.map((c) => c.youtubeVideoId);
    expect(new Set(videoIds).size).toBe(videoIds.length);
    for (const clip of MOVE_MAPPER_GOLD_SET) {
      expect(clip.youtubeVideoId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      for (const id of clip.expected) expect(library.has(id), `${id} is not in the library`).toBe(true);
    }
  });

  it("keeps the honesty checks honest: their figures really are missing from the library", () => {
    const unknown = MOVE_MAPPER_GOLD_SET.filter((c) => c.expected.length === 0);
    expect(unknown.length).toBeGreaterThanOrEqual(2);
    const names = getPublishedMoves().map((m) => `${m.name} ${m.spanishName ?? ""}`.toLowerCase());
    expect(names.some((n) => n.includes("tornillo"))).toBe(false);
    expect(names.some((n) => /\b85\b|ochenta y cinco/.test(n))).toBe(false);
  });
});

describe("Move Mapper scoring", () => {
  const kentucky = MOVE_MAPPER_GOLD_SET.find((c) => c.youtubeVideoId === "WjEmeSgWHg0")!;
  const tornillo = MOVE_MAPPER_GOLD_SET.find((c) => c.figure === "Tornillo")!;
  const row = (over: Record<string, unknown>) => ({
    moveIds: [],
    match: "same",
    confidence: "high",
    mechanics: "Right-to-right hold, she turns to her left under his arm.",
    type: "figure",
    ...over,
  });
  const breakdown = (videoId: string, rows: Record<string, unknown>[]) =>
    parseScoredBreakdown(JSON.stringify({ youtubeVideoId: videoId, rows: rows.map(row) }))!;

  it("separates seen, heard, low-only and missed answers", () => {
    const seen = breakdown(kentucky.youtubeVideoId, [{ moveIds: ["enchufla", "kentucky"] }]);
    expect(scoreAgainstGold(seen, kentucky)).toEqual({ clip: kentucky, verdict: "seen", otherConfidentIds: ["enchufla"] });

    const heard = breakdown(kentucky.youtubeVideoId, [{ moveIds: ["kentucky"], mechanics: "Name heard: Kentucky. Two hands..." }]);
    expect(scoreAgainstGold(heard, kentucky).verdict).toBe("heard");

    const low = breakdown(kentucky.youtubeVideoId, [{ moveIds: ["kentucky"], confidence: "low" }]);
    expect(scoreAgainstGold(low, kentucky).verdict).toBe("low-only");

    const miss = breakdown(kentucky.youtubeVideoId, [{ moveIds: ["setenta"] }]);
    expect(scoreAgainstGold(miss, kentucky).verdict).toBe("miss");
  });

  it("rewards 'not-in-library' on a figure we lack and flags forced names", () => {
    const honest = breakdown(tornillo.youtubeVideoId, [
      { moveIds: ["guapea"] },
      { match: "not-in-library", newMove: { name: "Tornillo" } },
    ]);
    expect(scoreAgainstGold(honest, tornillo).verdict).toBe("honest");

    const forced = breakdown(tornillo.youtubeVideoId, [
      { moveIds: ["enroscate"], match: "variation" },
      { type: "show-trick", match: "not-in-library" },
    ]);
    expect(scoreAgainstGold(forced, tornillo).verdict).toBe("forced");
  });

  it("reads fenced AI Studio output and reports ignored and missing clips", () => {
    const fenced = "```json\n" + JSON.stringify({ youtubeVideoId: kentucky.youtubeVideoId, rows: [row({ moveIds: ["kentucky"] })] }) + "\n```";
    const parsed = parseScoredBreakdown(fenced);
    expect(parsed?.rows).toHaveLength(1);
    expect(parseScoredBreakdown("not json")).toBeNull();

    const report = scoreGoldSet([parsed!, breakdown("Wh1zERcDWGM", [{}])]);
    expect(report.scores.map((s) => s.verdict)).toEqual(["seen"]);
    expect(report.ignored).toEqual(["Wh1zERcDWGM"]);
    expect(report.missing).toHaveLength(MOVE_MAPPER_GOLD_SET.length - 1);
  });
});
