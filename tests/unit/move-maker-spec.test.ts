import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MoveCategorySchema } from "@/lib/moves/move-schema";
import { CurriculumLevelSchema } from "@/lib/constants/cuban-curriculum-2027";
import { RUEDA_CALLS, NO_RUEDA_CALL } from "@/lib/music/rueda-calls";
import {
  buildMoveMakerResponseSchema,
  buildMoveMakerSystemInstructions,
} from "@/lib/moves/move-maker-spec";

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
  });
});
