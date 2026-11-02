import {
  MOVE_CATEGORIES,
  MoveCategorySchema,
} from "./move-schema";
import { CurriculumLevelSchema } from "@/lib/constants/cuban-curriculum-2027";
import { NO_RUEDA_CALL, RUEDA_CALLS } from "@/lib/music/rueda-calls";
import { SEEDED_MOVES } from "./move-library";

/**
 * Setup for Google AI Studio "move maker": system instructions and structured-output schema,
 * built directly from the Zod schemas and canonical enums.
 * Regenerate with: npx tsx scripts/ai-studio-move-maker.ts
 */

/** The OpenAPI subset Gemini's structured output accepts (shared with the move mapper). */
export type JsonSchema =
  | { type: "string"; description?: string; format?: "enum"; enum?: string[] }
  | { type: "number" | "integer"; description?: string; minimum?: number; maximum?: number }
  | { type: "boolean"; description?: string }
  | {
      type: "array";
      description?: string;
      items: JsonSchema;
      minItems?: number;
      maxItems?: number;
    }
  | {
      type: "object";
      description?: string;
      properties: Record<string, JsonSchema>;
      required?: string[];
      propertyOrdering?: string[];
    };

const text = (description: string): JsonSchema => ({ type: "string", description });
const choice = (values: readonly string[], description: string): JsonSchema => ({
  type: "string",
  format: "enum",
  enum: [...values],
  description,
});

export function buildMoveMakerSystemInstructions(): string {
  const categories = MOVE_CATEGORIES.map((c) => `- "${c}"`).join("\n");
  const levels = CurriculumLevelSchema.options.map((l) => `- "${l}"`).join("\n");
  const canonicalMoveIds = SEEDED_MOVES.map((m) => `${m.id} (${m.name})`).join("; ");

  return `You are the Move Maker for RitmoFlow, the Salsa Explosion UK (Bournemouth) Cuban dance curriculum.

WHAT THE APP DOES WITH YOUR OUTPUT
RitmoFlow uses your structured move entries to teach social dancers, teachers, and students authentic Cuban Casino figures, Rueda calls, shines, body movement, rumba, and son. Entries are linked to timba song sections so dancers can practise moves to real musical sections (montunos, mambos, despelote).

HOW TO WORK (one move per run)
1. Use authentic Cuban Casino and Afro-Cuban dance terminology (e.g. Guapea, Dile Que No, Enchufla, Vacílala, Paseo, Sacala/Exhíbela, Sombrero, Setenta). Never use linear Cross-Body Lead or generic ballroom salsa terms.
2. Timing: Cuban Casino is stepped on 1-2-3 (pause 4) and 5-6-7 (pause 8). Clearly separate leader and follower mechanics.
3. Steps breakdown: Provide count-by-count mechanics for both leader (leaderSteps) and follower (followerSteps), grouping counts cleanly (e.g. "1-3", "5-7", or "1-8").
4. Safety first: Any dips, drops, neck-wraps, duck-unders, or lifts must include explicit safety guidance in commonMistakes and notes (e.g. never pulling the neck, maintaining core balance, supporting own weight, knee bend).
5. Prerequisites: Recommend existing move IDs that must be mastered before attempting this move. Choose from the existing move list whenever applicable.
6. If unsure about exact arm angles, historical origin, or count variations, state your uncertainty clearly in the "notes" field.
7. CRITICAL RULE: NEVER invent or output YouTube video IDs, channels, or URLs. The schema deliberately has NO videos field. Videos are discovered and verified separately via the YouTube Data API.

ALLOWED CATEGORIES:
${categories}

ALLOWED LEVELS:
${levels}

EXISTING CURRICULUM MOVE IDS (use for prerequisites):
${canonicalMoveIds}
`;
}

/**
 * Structured-output schema for AI Studio (OpenAPI subset Gemini supports).
 * Note: Gemini rejects maxItems on arrays of complex objects; we do not use maxItems.
 * Note: The schema deliberately omits 'videos' to prevent AI hallucinated video IDs.
 */
export function buildMoveMakerResponseSchema(): JsonSchema {
  const stepProperties: Record<string, JsonSchema> = {
    counts: text('Dance count range, e.g. "1-3", "5-7", or "1-8"'),
    text: text("Clear, biomechanical breakdown of what this partner does during these counts"),
  };
  const stepKeys = Object.keys(stepProperties);

  const rootProperties: Record<string, JsonSchema> = {
    id: text('Unique kebab-case identifier, e.g. "enchufla-doble" or "setenta-con-alarde"'),
    name: text('Move name as used in class or social dancing, e.g. "Enchufla Doble"'),
    spanishName: text('Authentic Spanish name or phrase, e.g. "Enchúfla Doble"'),
    category: choice(MoveCategorySchema.options, "Canonical dance category"),
    level: choice(CurriculumLevelSchema.options, "Curriculum level"),
    eightCounts: {
      type: "integer",
      description: "How many 8-counts the complete figure takes (minimum 1, usually 1 or 2)",
    },
    summary: text("Concise 1-2 sentence overview of the movement, circular trajectory, and connection"),
    leaderSteps: {
      type: "array",
      description: "Step-by-step breakdown for the leader",
      minItems: 1,
      items: {
        type: "object",
        properties: stepProperties,
        required: stepKeys,
        propertyOrdering: stepKeys,
      },
    },
    followerSteps: {
      type: "array",
      description: "Step-by-step breakdown for the follower",
      minItems: 1,
      items: {
        type: "object",
        properties: stepProperties,
        required: stepKeys,
        propertyOrdering: stepKeys,
      },
    },
    commonMistakes: {
      type: "array",
      description: "Frequent errors made by social dancers (leading with arms, linear pulling, posture)",
      items: { type: "string" },
    },
    prerequisites: {
      type: "array",
      description: "Kebab-case move IDs that dancers should master before this figure",
      items: { type: "string" },
    },
    variations: {
      type: "array",
      description: "Common variations or embellishments of this move",
      items: { type: "string" },
    },
    ruedaCall: choice(
      [NO_RUEDA_CALL, ...RUEDA_CALLS],
      'Canonical Rueda call name if shouted in Rueda de Casino, or "none"'
    ),
    curriculumId: text('Curriculum ID if this maps to a 2027 curriculum item (e.g. "beg-pw-3"), otherwise empty string'),
    tags: {
      type: "array",
      description: "Descriptive tags, e.g. ['turn', 'hammerlock', 'advanced-wrap']",
      items: { type: "string" },
    },
    notes: text("Teacher / mentor notes, including any safety warnings or points of uncertainty"),
  };

  const rootKeys = Object.keys(rootProperties);
  return {
    type: "object",
    properties: rootProperties,
    required: rootKeys,
    propertyOrdering: rootKeys,
  };
}

/**
 * The same move entry wrapped as { moves: [...] }, so one AI Studio run can draft a batch.
 * The importer at /instructor/moves/import accepts this shape as it is.
 */
export function buildMoveMakerBatchResponseSchema(): JsonSchema {
  return {
    type: "object",
    properties: {
      moves: {
        type: "array",
        description: "One complete entry per move requested, in the order requested",
        minItems: 1,
        items: buildMoveMakerResponseSchema(),
      },
    },
    required: ["moves"],
    propertyOrdering: ["moves"],
  };
}
