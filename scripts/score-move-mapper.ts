/**
 * Scores AI Studio Move Mapper answers against the gold set:
 *
 *   npx tsx scripts/score-move-mapper.ts answers/*.json
 *
 * Each file holds one breakdown, as copied from AI Studio (a ```json fence is fine).
 * See docs/ai-studio-move-mapper/gold-set.md for what the verdicts mean.
 */
import { readFileSync } from "node:fs";
import { parseScoredBreakdown, scoreGoldSet, type ScoredBreakdown } from "../src/lib/moves/move-mapper-score";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: npx tsx scripts/score-move-mapper.ts <breakdown.json> [...]");
  process.exit(1);
}

const breakdowns: ScoredBreakdown[] = [];
for (const file of files) {
  const parsed = parseScoredBreakdown(readFileSync(file, "utf8"));
  if (parsed) breakdowns.push(parsed);
  else console.warn(`Skipped ${file}: not a breakdown with youtubeVideoId and rows`);
}

const report = scoreGoldSet(breakdowns);
for (const s of report.scores) {
  const others = s.otherConfidentIds.length > 0 ? `  (also named: ${s.otherConfidentIds.join(", ")})` : "";
  console.log(`${s.verdict.padEnd(9)} ${s.clip.figure.padEnd(24)} ${s.clip.youtubeVideoId}${others}`);
}

const count = (...verdicts: string[]) => report.scores.filter((s) => verdicts.includes(s.verdict)).length;
const named = report.scores.filter((s) => s.clip.expected.length > 0).length;
const unknown = report.scores.length - named;
console.log(`\nNamed figures: ${count("seen")} seen + ${count("heard")} heard of ${named}; low-only ${count("low-only")}, missed ${count("miss")}`);
if (unknown > 0) console.log(`Not in our library: ${count("honest")} honest, ${count("forced")} forced of ${unknown}`);
if (report.ignored.length > 0) console.log(`Not in the gold set (ignored): ${report.ignored.join(", ")}`);
if (report.missing.length > 0) console.log(`Still to run: ${report.missing.map((c) => c.figure).join(", ")}`);
