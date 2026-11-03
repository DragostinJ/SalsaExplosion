import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MoveCategorySchema } from "@/lib/moves/move-schema";
import { CurriculumLevelSchema } from "@/lib/constants/cuban-curriculum-schema";
import { RUEDA_CALLS, NO_RUEDA_CALL } from "@/lib/music/rueda-calls";
import {
  buildMoveMakerBatchResponseSchema,
  buildMoveMakerResponseSchema,
  buildMoveMakerSystemInstructions,
} from "@/lib/moves/move-maker-spec";
import { parseMoveInput } from "@/lib/moves/move-import";

const docs = path.resolve(__dirname, "../../docs/ai-studio-move-maker");

type SchemaProperty = {
  type: string;
  format?: string;
  enum?: string[];
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
};

type Schema = {
  type: string;
  properties: Record<string, SchemaProperty>;
  required?: string[];
  propertyOrdering?: string[];
};

describe("AI Studio move maker setup", () => {
  it("restricts categories, levels, and rueda calls to canonical values", () => {
    const root = buildMoveMakerResponseSchema() as unknown as Schema;
    expect(root.properties.category.enum).toEqual(MoveCategorySchema.options);
    expect(root.properties.level.enum).toEqual(CurriculumLevelSchema.options);
    expect(root.properties.ruedaCall.enum).toEqual([NO_RUEDA_CALL, ...RUEDA_CALLS]);
  });

  it("never includes a 'videos' field in the schema (Gemini hallucinates YouTube IDs)", () => {
    const root = buildMoveMakerResponseSchema() as unknown as Schema;
    expect(root.properties.videos).toBeUndefined();
    if (root.required) {
      expect(root.required).not.toContain("videos");
    }
  });

  it("checked-in files match the generator (run: npx tsx scripts/ai-studio-move-maker.ts)", () => {
    expect(readFileSync(path.join(docs, "system-instructions.txt"), "utf8")).toBe(
      buildMoveMakerSystemInstructions() + "\n"
    );
    expect(JSON.parse(readFileSync(path.join(docs, "response-schema.json"), "utf8"))).toEqual(
      buildMoveMakerResponseSchema()
    );
    expect(JSON.parse(readFileSync(path.join(docs, "response-schema-batch.json"), "utf8"))).toEqual(
      buildMoveMakerBatchResponseSchema()
    );
  });

  it("the batch schema wraps the single-move schema as { moves: [...] }", () => {
    const batch = buildMoveMakerBatchResponseSchema() as unknown as Schema;
    expect(batch.required).toEqual(["moves"]);
    expect(batch.properties.moves.type).toBe("array");
    expect(batch.properties.moves.items).toEqual(buildMoveMakerResponseSchema());
  });

  it("a batch reply in that shape goes straight into the importer", () => {
    const draft = (id: string, name: string) => ({
      id,
      name,
      spanishName: name,
      category: "Casino figure",
      level: "Improver",
      eightCounts: 1,
      summary: "A test figure.",
      leaderSteps: [{ counts: "1-3", text: "Lead the turn." }, { counts: "5-7", text: "Recover." }],
      followerSteps: [{ counts: "1-3", text: "Turn." }, { counts: "5-7", text: "Recover." }],
      commonMistakes: [],
      prerequisites: ["guapea"],
      variations: [],
      ruedaCall: "none",
      curriculumId: "",
      tags: ["test"],
      notes: "",
    });
    const result = parseMoveInput(
      JSON.stringify({ moves: [draft("cubanito-test", "Cubanito"), draft("cubanita-test", "Cubanita")] })
    );
    expect(result.errors).toEqual([]);
    expect(result.moves.map((m) => m.id)).toEqual(["cubanito-test", "cubanita-test"]);
    expect(result.moves.every((m) => !m.reviewedBy)).toBe(true);
  });
});
