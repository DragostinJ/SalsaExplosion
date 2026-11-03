import { describe, it, expect } from "vitest";
import {
  applyClipReviewReport,
  parseClipBreakdownInput,
  type ClipBreakdown,
  type ClipReviewReport,
} from "@/lib/moves/pro-clips";
import { buildMoveMapperResponseSchema } from "@/lib/moves/move-mapper-spec";

const clip: ClipBreakdown = {
  kind: "ritmoflow-clip-breakdown",
  version: 1,
  id: "paolo-alina-homenaje",
  youtubeVideoId: "Wh1zERcDWGM",
  title: "Paolo & Alina [Homenaje a la Música Cubana - Orq. Mercadonegro] Salsa @WorldLatinCongress",
  channelTitle: "World Latin Congress",
  dancers: ["Paolo", "Alina"],
  songId: "homenaje-a-la-musica-cubana",
  rows: [
    {
      start: "0:36",
      end: "0:46",
      type: "figure",
      mechanics: "Right-to-right hold; she turns to her right under his raised hand on 1-3, he closes on 5-7.",
      moveIds: ["exhibela"],
      match: "same",
      confidence: "medium",
    },
    {
      start: "0:46",
      end: "0:56",
      type: "figure",
      mechanics: "One-hand lead into a free spin for her, then back to open position with a dile que no.",
      moveIds: ["vacilala", "dile-que-no"],
      match: "variation",
      confidence: "low",
    },
  ],
};

const report = (over: Partial<ClipReviewReport>): ClipReviewReport => ({
  kind: "ritmoflow-clip-review",
  version: 1,
  reviewedBy: "Enrique",
  reviewedAt: "2026-11-03T09:00:00.000Z",
  clip,
  decisions: [
    { row: 0, decision: "confirmed", moveIds: ["exhibela"] },
    { row: 1, decision: "rejected", moveIds: [] },
  ],
  ...over,
});

describe("Applying a clip review report never drops or invents rows", () => {
  it("applies a report that decides every row exactly once", () => {
    const result = applyClipReviewReport({ report: report({}), existingClips: [] });
    expect(result.ok).toBe(true);
    expect(result.updatedClips[0]?.rows.map((r) => r.startSeconds)).toEqual([36]);
  });

  it("refuses a report with an undecided row", () => {
    const result = applyClipReviewReport({
      report: report({ decisions: [{ row: 0, decision: "confirmed", moveIds: ["exhibela"] }] }),
      existingClips: [],
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Row 2: no decision in the report");
    expect(result.updatedClips).toEqual([]);
  });

  it("refuses a row decided twice and a decision past the last row", () => {
    const twice = applyClipReviewReport({
      report: report({
        decisions: [
          { row: 0, decision: "confirmed", moveIds: ["exhibela"] },
          { row: 0, decision: "rejected", moveIds: [] },
          { row: 1, decision: "rejected", moveIds: [] },
        ],
      }),
      existingClips: [],
    });
    expect(twice.errors).toContain("Row 1: decided more than once in the report");

    const pastEnd = applyClipReviewReport({
      report: report({
        decisions: [
          { row: 0, decision: "confirmed", moveIds: ["exhibela"] },
          { row: 1, decision: "rejected", moveIds: [] },
          { row: 5, decision: "confirmed", moveIds: ["guapea"] },
        ],
      }),
      existingClips: [],
    });
    expect(pastEnd.errors).toContain("Decision for row 6: the clip only has 2 rows");
  });

  it("re-checks the clip itself: an unknown song or overlapping rows are refused", () => {
    const badSong = applyClipReviewReport({ report: report({ clip: { ...clip, songId: "not-a-song" } }), existingClips: [] });
    expect(badSong.ok).toBe(false);

    const overlapping = applyClipReviewReport({
      report: report({ clip: { ...clip, rows: [clip.rows[0]!, { ...clip.rows[1]!, start: "0:40" }] } }),
      existingClips: [],
    });
    expect(overlapping.ok).toBe(false);
    expect(overlapping.errors.join(" ")).toMatch(/overlaps/);
  });
});

describe("Move Mapper output and the clip importer agree", () => {
  type Node = { properties?: Record<string, Node>; required?: string[]; items?: Node };

  it("asks Gemini only for fields the importer accepts, and every field the importer requires", () => {
    const root = buildMoveMapperResponseSchema() as Node;
    const row = root.properties!.rows!.items!;
    const mapperRootKeys = Object.keys(root.properties!);
    const mapperRowKeys = Object.keys(row.properties!);

    // Every key the mapper can emit is known to the strict importer schema (unknown keys are refused)
    const importerRoot = parseClipBreakdownInput(JSON.stringify({ ...clip, extra: 1 }));
    expect(importerRoot.ok).toBe(false);
    for (const key of mapperRootKeys) expect(Object.keys(clip).concat("analysis")).toContain(key);
    for (const key of mapperRowKeys) {
      expect(["start", "end", "type", "mechanics", "moveIds", "match", "confidence", "musicalMoment", "newMove"]).toContain(key);
    }
    // And everything the mapper marks required is enough for the importer
    expect(root.required).toEqual(expect.arrayContaining(["kind", "version", "id", "youtubeVideoId", "title", "channelTitle", "dancers", "rows"]));
    expect(row.required).toEqual(expect.arrayContaining(["start", "end", "type", "mechanics", "moveIds", "match", "confidence"]));
  });

  it("imports a breakdown shaped exactly like the mapper schema", () => {
    const fromMapper = {
      ...clip,
      analysis: { model: "gemini", fps: 8, notes: "Fixed wide camera, one couple." },
    };
    const parsed = parseClipBreakdownInput("```json\n" + JSON.stringify(fromMapper) + "\n```");
    expect(parsed.errors).toBeUndefined();
    expect(parsed.ok).toBe(true);
  });
});
