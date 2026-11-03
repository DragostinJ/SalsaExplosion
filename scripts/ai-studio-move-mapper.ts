/**
 * Writes the Google AI Studio Move Mapper setup from the app's own move library and songs:
 *
 *   npx tsx scripts/ai-studio-move-mapper.ts
 *
 * - docs/ai-studio-move-mapper/system-instructions.txt   -> mapper pass "System instructions"
 * - docs/ai-studio-move-mapper/response-schema.json      -> mapper pass "Structured outputs"
 * - docs/ai-studio-move-mapper/response-schema-lite.json -> the same without the move-id list,
 *   for when AI Studio says the schema is too big
 * - docs/ai-studio-move-mapper/segmenter-instructions.txt and segmenter-schema.json -> pass 1
 * - docs/ai-studio-move-mapper/gold-set.md               -> the clips with a known answer
 * - docs/ai-studio-move-mapper/song-maps.md              -> each song's sections, for "Song map:"
 *
 * Re-run after the move library changes (new moves, renamed ids) or a song is added.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import {
  buildMoveMapperResponseSchema,
  buildMoveMapperSegmenterInstructions,
  buildMoveMapperSegmenterSchema,
  buildMoveMapperSystemInstructions,
} from "../src/lib/moves/move-mapper-spec";
import { buildGoldSetMarkdown, buildSongMapsMarkdown } from "../src/lib/moves/move-mapper-docs";

const dir = "docs/ai-studio-move-mapper";
const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";

mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/system-instructions.txt`, buildMoveMapperSystemInstructions());
writeFileSync(`${dir}/response-schema.json`, json(buildMoveMapperResponseSchema()));
writeFileSync(`${dir}/response-schema-lite.json`, json(buildMoveMapperResponseSchema({ moveIdEnum: false })));
writeFileSync(`${dir}/segmenter-instructions.txt`, buildMoveMapperSegmenterInstructions());
writeFileSync(`${dir}/segmenter-schema.json`, json(buildMoveMapperSegmenterSchema()));
writeFileSync(`${dir}/gold-set.md`, buildGoldSetMarkdown());
writeFileSync(`${dir}/song-maps.md`, buildSongMapsMarkdown());
console.log(`Wrote the Move Mapper setup to ${dir}/`);
