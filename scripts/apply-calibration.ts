/**
 * Applies ear-calibration reports (the "Copy" button in /music/<song>?calibrate=1)
 * to the song data.
 *
 *   npx tsx scripts/apply-calibration.ts reports.json            # dry run: shows what would move
 *   npx tsx scripts/apply-calibration.ts reports.json --write    # updates timba-song-anatomy.ts
 *
 * The file may hold one report, several pasted one after another, or an array.
 * Stale reports (made before the song was re-timed) are refused, never guessed.
 * After --write, run `npm test` (timeline and label checks for every song).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { getSongAnatomyById, type SongAnatomy } from "../src/lib/constants/timba-song-anatomy";
import { applyCalibrationReport, parseCalibrationReports } from "../src/lib/music/calibration-report";
import { formatSongTime } from "../src/lib/music/song-timing";

const DATA_FILE = "src/lib/constants/timba-song-anatomy.ts";
const RULE = "  // -----------------------------------------------------------------";

const [input, ...flags] = process.argv.slice(2);
if (!input) {
  console.error("Usage: npx tsx scripts/apply-calibration.ts <reports.json> [--write]");
  process.exit(1);
}
const write = flags.includes("--write");

const { reports, errors: parseErrors } = parseCalibrationReports(readFileSync(input, "utf8"));
parseErrors.forEach((error) => console.error(`✗ ${error}`));

let data = readFileSync(DATA_FILE, "utf8");
let changedSongs = 0;
let refused = 0;
const today = new Date().toISOString().slice(0, 10);

for (const report of reports) {
  const song = getSongAnatomyById(report.songId);
  console.log(`\n== ${report.songId}`);
  if (!song) {
    console.error(`✗ No song with id "${report.songId}".`);
    refused++;
    continue;
  }
  const result = applyCalibrationReport(song, report);
  result.warnings.forEach((warning) => console.warn(`! ${warning}`));
  if (result.errors.length) {
    result.errors.forEach((error) => console.error(`✗ ${error}`));
    console.error("  Nothing applied for this song.");
    refused++;
    continue;
  }
  for (const move of result.applied) {
    const shift = move.to - move.from;
    console.log(
      `  ${move.section} ${move.sectionName}: ${formatSongTime(move.from, true)} → ${formatSongTime(move.to, true)} (${shift > 0 ? "+" : ""}${shift.toFixed(1)}s)`
    );
  }
  if (!result.applied.length) continue;
  if (write) {
    data = replaceSongEntry(data, result.song, `Ear-calibrated ${today}: ${result.applied.length} start(s) moved.`);
    changedSongs++;
  }
}

if (write && changedSongs) {
  writeFileSync(DATA_FILE, data);
  console.log(`\nWrote ${changedSongs} song(s) to ${DATA_FILE}. Now run: npm test`);
} else if (!write) {
  console.log("\nDry run: nothing written. Add --write to apply.");
}
if (refused || parseErrors.length) process.exitCode = 1;

/** Swap one song's object in the data file, keeping its header comment and adding a note to it. */
function replaceSongEntry(text: string, song: SongAnatomy, note: string): string {
  const idMatch = new RegExp(`\\n    "?id"?: "${song.id}",`).exec(text);
  if (!idMatch) throw new Error(`Couldn't find ${song.id} in ${DATA_FILE}`);
  const objectStart = text.lastIndexOf("\n  {", idMatch.index);
  const closingRule = text.lastIndexOf(RULE, objectStart);
  if (closingRule < 0 || text.slice(closingRule, idMatch.index).includes("\n  },")) {
    throw new Error(`Couldn't find the header comment above ${song.id}; not touching the file.`);
  }
  const end = text.indexOf("\n  },", idMatch.index) + "\n  },".length;
  const body = JSON.stringify(song, null, 2)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `${text.slice(0, closingRule)}  // ${note}\n${text.slice(closingRule, objectStart)}\n${body},${text.slice(end)}`;
}
