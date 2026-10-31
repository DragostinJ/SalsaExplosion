/**
 * Writes the Google AI Studio song-maker setup from the app's own enums:
 *
 *   npx tsx scripts/ai-studio-song-maker.ts
 *
 * - docs/ai-studio-song-maker/system-instructions.txt  -> AI Studio "System instructions"
 * - docs/ai-studio-song-maker/response-schema.json     -> "Structured outputs" -> Edit
 *
 * Re-run after changing gears, styles, timing modes or curriculum moves.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { buildSongMakerResponseSchema, buildSongMakerSystemInstructions } from "../src/lib/music/song-maker-spec";

const dir = "docs/ai-studio-song-maker";
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/system-instructions.txt`, buildSongMakerSystemInstructions() + "\n");
writeFileSync(`${dir}/response-schema.json`, JSON.stringify(buildSongMakerResponseSchema(), null, 2) + "\n");
console.log(`Wrote ${dir}/system-instructions.txt and ${dir}/response-schema.json`);
