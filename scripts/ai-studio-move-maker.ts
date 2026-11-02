/**
 * Writes the Google AI Studio move-maker setup from the app's own schemas and enums:
 *
 *   npx tsx scripts/ai-studio-move-maker.ts
 *
 * - docs/ai-studio-move-maker/system-instructions.txt  -> AI Studio "System instructions"
 * - docs/ai-studio-move-maker/response-schema.json     -> "Structured outputs" -> Edit
 * - docs/ai-studio-move-maker/response-schema-batch.json -> the same, for a batch of moves per run
 *
 * Re-run after changing categories, levels, rueda calls, or curriculum moves.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import {
  buildMoveMakerBatchResponseSchema,
  buildMoveMakerResponseSchema,
  buildMoveMakerSystemInstructions,
} from "../src/lib/moves/move-maker-spec";

const dir = "docs/ai-studio-move-maker";
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/system-instructions.txt`, buildMoveMakerSystemInstructions() + "\n");
writeFileSync(`${dir}/response-schema.json`, JSON.stringify(buildMoveMakerResponseSchema(), null, 2) + "\n");
writeFileSync(`${dir}/response-schema-batch.json`, JSON.stringify(buildMoveMakerBatchResponseSchema(), null, 2) + "\n");
console.log(`Wrote ${dir}/system-instructions.txt, response-schema.json and response-schema-batch.json`);
