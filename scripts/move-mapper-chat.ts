/**
 * The Move Mapper in a plain AI Studio chat (Google AI Pro allowance, Gemini 4 Argon), in two steps:
 *
 *   1. Prepare a run: cuts the clip into pieces and writes the exact chat message for each one.
 *        npx tsx scripts/move-mapper-chat.ts prepare --gold 1 --from 0:04 --to 0:19
 *        npx tsx scripts/move-mapper-chat.ts prepare --url https://www.youtube.com/watch?v=<id> \
 *          --from 0:29 --to 1:07 --id paolo-alina-homenaje --dancers "Paolo, Alina" --song <song id>
 *      Writes <out>/pieces.json, <out>/messages.md and an empty <out>/piece-01.json per piece.
 *      <out> defaults to ../mapper-answers/chat/<clip id>.
 *
 *   2. Join the answers: paste each chat answer into its piece-NN.json, then
 *        npx tsx scripts/move-mapper-chat.ts merge ../mapper-answers/chat/<clip id>
 *      Writes ../mapper-answers/chat/<clip id>.json, ready for /instructor/clips or the scorer:
 *        npx tsx scripts/score-move-mapper.ts ../mapper-answers/chat
 *
 * See docs/ai-studio-move-mapper/chat-version.md.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import {
  MAPPER_FOCUSES,
  MapperChatManifestSchema,
  aiStudioTime,
  chatMessage,
  clipWindow,
  formatMapperTime,
  mergePieceAnswers,
  planPieces,
  type MapperChatManifest,
} from "../src/lib/moves/mapper-chat";
import { goldClipId, songMapLines } from "../src/lib/moves/move-mapper-docs";
import { MOVE_MAPPER_GOLD_SET } from "../src/lib/moves/move-mapper-gold-set";
import { MAPPER_DEFAULT_FPS } from "../src/lib/moves/move-mapper-spec";
import { parseClipBreakdownInput, parseClipTimestamp } from "../src/lib/moves/pro-clips";
import { parseYouTubeVideoId } from "../src/lib/moves/youtube-url-parser";

const DEFAULT_MODEL = "Gemini 4 Argon";
const DEFAULT_PIECE_SECONDS = 20;

function fail(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function seconds(value: string | undefined, name: string): number {
  if (value === undefined) fail(`--${name} is required, as M:SS (for example --${name} 0:29)`);
  if (/^\d+(\.\d+)?$/.test(value)) return Number(value);
  const parsed = parseClipTimestamp(value);
  if (!parsed.ok) fail(`--${name} "${value}": ${parsed.error}`);
  return parsed.seconds;
}

const pieceFile = (dir: string, n: number) => path.join(dir, `piece-${String(n).padStart(2, "0")}.json`);

/** Title and channel as YouTube itself reports them (never typed from memory). */
async function oEmbed(videoId: string): Promise<{ title: string; channelTitle: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const { title, author_name: channelTitle } = body as Record<string, unknown>;
    return typeof title === "string" && typeof channelTitle === "string" ? { title, channelTitle } : null;
  } catch {
    return null;
  }
}

function messagesMarkdown(manifest: MapperChatManifest, dir: string): string {
  const pieces = manifest.pieces.map((piece) => {
    const window = clipWindow(piece);
    return `## Piece ${piece.number} of ${manifest.pieces.length} · ${formatMapperTime(piece.start)} to ${formatMapperTime(piece.end)}

1. ${piece.number === 1 ? "Start from the set-up chat (step 0)." : "Clear the chat (or delete the last message and its answer), so the last piece's video isn't sent again. Keep the system instructions and settings."}
2. Add the video https://www.youtube.com/watch?v=${manifest.youtubeVideoId} and open its video settings: start **${aiStudioTime(window.start)}**, end **${aiStudioTime(window.end)}** (${formatMapperTime(window.start)} to ${formatMapperTime(window.end)}), frame rate **${manifest.fps}**.
3. Paste this as the message and run it:

\`\`\`text
${chatMessage(manifest, piece)}
\`\`\`

4. Copy the whole answer into \`${path.basename(pieceFile(dir, piece.number))}\` in this folder and save.
`;
  });

  return `# Move Mapper chat: ${manifest.title}

Clip id \`${manifest.id}\` · ${manifest.channelTitle} · ${manifest.pieces.length} piece(s) at ${manifest.fps} frames per second · model **${manifest.model}**

## 0. Set up the chat (once per video)

1. AI Studio → new chat. Model: **${manifest.model}**.
2. System instructions: paste all of \`docs/ai-studio-move-mapper/system-instructions.txt\`.
3. Structured output: ON, with \`docs/ai-studio-move-mapper/response-schema.json\` (use \`response-schema-lite.json\` only if AI Studio says the schema is too big).
4. Leave temperature at its default.

${pieces.join("\n")}
## When every piece is saved

\`\`\`bash
npx tsx scripts/move-mapper-chat.ts merge "${dir.replace(/\\/g, "/")}"
\`\`\`

Or paste the answers to Claude.
`;
}

async function prepare(argv: string[]) {
  const { values } = parseArgs({
    args: argv,
    options: {
      gold: { type: "string" },
      url: { type: "string" },
      from: { type: "string" },
      to: { type: "string" },
      id: { type: "string" },
      title: { type: "string" },
      channel: { type: "string" },
      dancers: { type: "string" },
      song: { type: "string" },
      focus: { type: "string", default: "moves" },
      fps: { type: "string", default: String(MAPPER_DEFAULT_FPS) },
      piece: { type: "string", default: String(DEFAULT_PIECE_SECONDS) },
      model: { type: "string", default: DEFAULT_MODEL },
      out: { type: "string" },
    },
  });

  let videoId: string | null = null;
  let id = values.id;
  let title = values.title;
  let channelTitle = values.channel;
  if (values.gold) {
    const index = Number(values.gold) - 1;
    const clip = MOVE_MAPPER_GOLD_SET[index];
    if (!clip) fail(`--gold must be 1 to ${MOVE_MAPPER_GOLD_SET.length}`);
    videoId = clip.youtubeVideoId;
    id ??= goldClipId(index, clip.figure);
    title ??= clip.title;
    channelTitle ??= clip.channelTitle;
  } else {
    if (!values.url) fail("Give --url <YouTube link> or --gold <1-26>");
    videoId = parseYouTubeVideoId(values.url);
    if (!videoId) fail(`Not a YouTube link: ${values.url}`);
  }
  if (!title || !channelTitle) {
    const found = await oEmbed(videoId);
    if (!found) fail("Couldn't read the title and channel from YouTube. Give them with --title and --channel, exactly as on YouTube.");
    title ??= found.title;
    channelTitle ??= found.channelTitle;
  }
  if (!id) fail('--id is required: a kebab-case clip id, for example --id paolo-alina-homenaje');

  const focus = MAPPER_FOCUSES.find((f) => f === values.focus);
  if (!focus) fail(`--focus must be ${MAPPER_FOCUSES.join(" or ")}`);
  let songMap: string[] | undefined;
  if (values.song) {
    songMap = songMapLines(values.song) ?? fail(`Unknown song id "${values.song}" (see docs/ai-studio-move-mapper/song-maps.md)`);
  }

  const parsed = MapperChatManifestSchema.safeParse({
    kind: "ritmoflow-mapper-chat",
    version: 1,
    id,
    youtubeVideoId: videoId,
    title,
    channelTitle,
    dancers: (values.dancers ?? "unknown").split(",").map((d) => d.trim()).filter(Boolean),
    ...(values.song ? { songId: values.song, songMap } : {}),
    focus,
    fps: Number(values.fps),
    model: values.model,
    pieces: planPieces(seconds(values.from, "from"), seconds(values.to, "to"), Number(values.piece)),
  });
  if (!parsed.success) fail(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"));
  const manifest = parsed.data;

  const dir = path.resolve(values.out ?? path.join("..", "mapper-answers", "chat", manifest.id));
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "pieces.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(path.join(dir, "messages.md"), messagesMarkdown(manifest, dir));
  for (const piece of manifest.pieces) {
    const file = pieceFile(dir, piece.number);
    if (!existsSync(file)) writeFileSync(file, "");
  }

  console.log(`\n${manifest.title} · ${manifest.channelTitle}`);
  for (const piece of manifest.pieces) {
    const w = clipWindow(piece);
    console.log(`  piece ${piece.number}: ${formatMapperTime(piece.start)}-${formatMapperTime(piece.end)}  (video settings ${aiStudioTime(w.start)} to ${aiStudioTime(w.end)})`);
  }
  console.log(`\nOpen ${path.join(dir, "messages.md")} and follow it.\n`);
}

function merge(argv: string[]) {
  const dir = argv.find((a) => !a.startsWith("--"));
  if (!dir) fail("Usage: npx tsx scripts/move-mapper-chat.ts merge <run folder>");
  const manifestFile = path.join(dir, "pieces.json");
  if (!existsSync(manifestFile)) fail(`No pieces.json in ${dir}. Run "prepare" first.`);
  const parsed = MapperChatManifestSchema.safeParse(JSON.parse(readFileSync(manifestFile, "utf8")));
  if (!parsed.success) fail(`pieces.json is damaged: ${parsed.error.issues[0]?.message}`);
  const manifest = parsed.data;

  const answers = manifest.pieces.map((piece) => {
    const file = pieceFile(dir, piece.number);
    return { piece, raw: existsSync(file) ? readFileSync(file, "utf8") : "" };
  });
  const result = mergePieceAnswers(manifest, answers);

  if (result.missing.length > 0) console.log(`\nStill to run: piece ${result.missing.join(", ")}.`);
  if (result.notes.length > 0) console.log(`\nNotes:\n${result.notes.map((n) => `  - ${n}`).join("\n")}`);
  if (!result.breakdown) fail("No usable rows yet, so nothing was written.");

  const out = path.join(path.dirname(path.resolve(dir)), `${manifest.id}.json`);
  const json = `${JSON.stringify(result.breakdown, null, 2)}\n`;
  writeFileSync(out, json);

  console.log(`\n${result.breakdown.rows.length} rows:`);
  for (const row of result.breakdown.rows) {
    const names = row.moveIds.length > 0 ? row.moveIds.join(" + ") : row.match;
    console.log(`  ${row.start.padStart(6)}-${row.end.padEnd(6)} ${row.type.padEnd(17)} ${row.confidence.padEnd(6)} ${names}`);
  }

  const check = parseClipBreakdownInput(json);
  if (check.ok) console.log(`\nValid. Saved ${out}\nPaste it into /instructor/clips, or send it to Claude.\n`);
  else console.log(`\nSaved ${out}, but /instructor/clips will refuse it until these are fixed:\n${(check.errors ?? []).map((e) => `  - ${e}`).join("\n")}\n`);
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (command === "prepare") await prepare(rest);
  else if (command === "merge") merge(rest);
  else fail("Usage: npx tsx scripts/move-mapper-chat.ts prepare|merge ... (see the top of this file)");
}

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));
