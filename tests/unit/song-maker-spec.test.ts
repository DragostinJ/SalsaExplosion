import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SongDanceGearSchema, SongStyleSchema, TimingModeSchema } from "@/lib/constants/timba-song-anatomy";
import { CUBAN_CURRICULUM_DATA } from "@/lib/constants/cuban-curriculum-2027";
import { buildSongMakerResponseSchema, buildSongMakerSystemInstructions, GEAR_GUIDE } from "@/lib/music/song-maker-spec";

const docs = path.resolve(__dirname, "../../docs/ai-studio-song-maker");

type Schema = { properties: Record<string, { enum?: string[]; items?: Schema & { enum?: string[] } }> };

describe("AI Studio song maker setup", () => {
  it("restricts every label to the values the importer accepts", () => {
    const root = buildSongMakerResponseSchema() as unknown as Schema;
    const segment = root.properties.segments.items as Schema;
    expect(root.properties.style.enum).toEqual(SongStyleSchema.options);
    expect(segment.properties.danceGear.enum).toEqual(SongDanceGearSchema.options);
    expect(segment.properties.timingMode.enum).toEqual(TimingModeSchema.options);
    expect(segment.properties.recommendedMoveSlugs.items?.enum).toEqual(CUBAN_CURRICULUM_DATA.map((move) => move.id));
    for (const gear of SongDanceGearSchema.options) expect(GEAR_GUIDE[gear]).toBeDefined();
  });

  it("asks for m:ss before the seconds (Gemini typed 1:18 as 118 when the seconds came first)", () => {
    const root = buildSongMakerResponseSchema() as unknown as { properties: { segments: { items: { propertyOrdering: string[] } } } };
    const order = root.properties.segments.items.propertyOrdering;
    expect(order.indexOf("formattedRange")).toBeLessThan(order.indexOf("startTimeSeconds"));
  });

  it("checked-in files match the generator (run: npx tsx scripts/ai-studio-song-maker.ts)", () => {
    expect(readFileSync(path.join(docs, "system-instructions.txt"), "utf8")).toBe(buildSongMakerSystemInstructions() + "\n");
    expect(JSON.parse(readFileSync(path.join(docs, "response-schema.json"), "utf8"))).toEqual(buildSongMakerResponseSchema());
  });
});
