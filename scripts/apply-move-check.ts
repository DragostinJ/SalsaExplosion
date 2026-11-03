/**
 * Applies the Gemini "move check" answers (docs/move-library/gemini-move-check.md) to the drafts.
 *
 * Usage:
 *   npx tsx scripts/apply-move-check.ts <answers folder or files...>                 # dry run: report only
 *   npx tsx scripts/apply-move-check.ts <answers...> --skip skip.txt --write         # apply
 *
 * The report lists every fix as applied / no-match / ambiguous, grouped by kind, with its key
 * (e.g. check-03#7). Read the hold, direction, counts and contradiction fixes against the move,
 * put the keys of any you don't trust in skip.txt (one per line), then run with --write. Skipped
 * fixes and every flag become "UNSURE (check):" notes for the teachers.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MoveSchema, type Move } from "../src/lib/moves/move-schema";
import { STORED_REVIEWS } from "../src/lib/moves/move-review";
import { applyMoveCheck, parseMoveCheckAnswer, type MoveCheckAnswer } from "../src/lib/moves/move-check";

const DRAFTS_FILE = path.resolve(__dirname, "../src/lib/moves/data/move-drafts.json");

const args = process.argv.slice(2);
const write = args.includes("--write");
const skipIndex = args.indexOf("--skip");
const skipFile = skipIndex >= 0 ? args[skipIndex + 1] : undefined;
const inputs = args.filter((a, i) => !a.startsWith("--") && !(skipIndex >= 0 && i === skipIndex + 1));

if (inputs.length === 0) {
  console.error("Usage: npx tsx scripts/apply-move-check.ts <answers folder or files...> [--skip skip.txt] [--write]");
  process.exit(1);
}

const files = inputs.flatMap((p) =>
  statSync(p).isDirectory()
    ? readdirSync(p)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((f) => path.join(p, f))
    : [p]
);

const answers: MoveCheckAnswer[] = [];
const seenBatches = new Map<string, string>();
for (const file of files) {
  let answer: MoveCheckAnswer;
  try {
    answer = parseMoveCheckAnswer(readFileSync(file, "utf8"));
  } catch {
    // Other gemini-code files in Downloads (move drafts, song maps) aren't check answers.
    console.log(`  - ignored ${path.basename(file)} (not a move check answer)`);
    continue;
  }
  const earlier = seenBatches.get(answer.batch);
  if (earlier) {
    console.log(`  ! ${answer.batch} appears twice: using ${path.basename(file)}, ignoring ${earlier}`);
    answers.splice(answers.findIndex((a) => a.batch === answer.batch), 1);
  }
  seenBatches.set(answer.batch, path.basename(file));
  answers.push(answer);
}
answers.sort((a, b) => a.batch.localeCompare(b.batch));

const skip = new Set(
  skipFile
    ? readFileSync(skipFile, "utf8")
        .split(/\r?\n/)
        // The first word of each line is a key like check-03#7; anything after it is a comment.
        .map((l) => l.trim().split(/\s+/)[0])
        .filter((k) => /#\d+$/.test(k))
    : []
);

// Kept exactly as stored (parsing would drop fields the schema doesn't list); only checked here.
const drafts = JSON.parse(readFileSync(DRAFTS_FILE, "utf8")) as Move[];
for (const d of drafts) {
  const ok = MoveSchema.safeParse(d);
  if (!ok.success) throw new Error(`${d.id} in move-drafts.json is invalid: ${ok.error.issues[0]?.message}`);
}
const reviewedIds = new Set(STORED_REVIEWS.map((r) => r.moveId));
const result = applyMoveCheck({ drafts, answers, skip, reviewedIds });

const byOutcome = (o: string) => result.fixes.filter((f) => f.outcome === o);
console.log(`\nBatches: ${answers.map((a) => a.batch).join(", ") || "none"}`);
console.log(
  `Fixes: ${result.fixes.length} · applied ${byOutcome("applied").length} · skipped ${byOutcome("skipped").length} · ` +
    `no match ${byOutcome("no-match").length} · ambiguous ${byOutcome("ambiguous").length} · other ${
      result.fixes.length - ["applied", "skipped", "no-match", "ambiguous"].reduce((n, o) => n + byOutcome(o).length, 0)
    }`
);
console.log(`Flags turned into UNSURE notes: ${result.flagsAdded.length} · moves changed: ${result.changedIds.length}\n`);

for (const kind of ["hold", "direction", "counts", "contradiction", "safety", "wording"]) {
  const rows = result.fixes.filter((f) => f.fix.kind === kind);
  if (rows.length === 0) continue;
  console.log(`== ${kind} (${rows.length})`);
  for (const r of rows) {
    console.log(`  [${r.outcome}] ${r.key} ${r.fix.id}.${r.fix.field}: "${r.fix.from}" -> "${r.fix.to}"`);
    if (r.fix.why) console.log(`      why: ${r.fix.why}`);
    if (r.detail) console.log(`      ${r.detail}`);
  }
}
if (result.flagsAdded.length) {
  console.log(`== flags (${result.flagsAdded.length})`);
  for (const f of result.flagsAdded) console.log(`  ${f.id}: ${f.issue}`);
}

if (write) {
  writeFileSync(DRAFTS_FILE, JSON.stringify(result.drafts, null, 2) + "\n");
  console.log(`\nWrote ${DRAFTS_FILE}. Next: npx tsx scripts/ai-studio-move-mapper.ts, then npm test.`);
} else {
  console.log("\nDry run: nothing written. Add --write to apply.");
}
