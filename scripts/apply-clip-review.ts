/**
 * CLI script to apply audited pro clip reviews from the teacher console.
 *
 * Usage:
 *   npx tsx scripts/apply-clip-review.ts <report.json>            # dry run: preview changes
 *   npx tsx scripts/apply-clip-review.ts <report.json> --write    # commit changes to data files
 *   cat report.json | npx tsx scripts/apply-clip-review.ts -      # read from stdin
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  parseClipReviewReport,
  applyClipReviewReport,
  StoredProClipSchema,
  type StoredProClip,
} from "../src/lib/moves/pro-clips";

const StoredProClipsSchema = z.array(StoredProClipSchema);

const PRO_CLIPS_FILE = path.resolve(
  __dirname,
  "../src/lib/moves/data/pro-clips.json"
);

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const fileArg = args.find((a) => !a.startsWith("--"));

  if (!fileArg) {
    console.error(
      "Usage: npx tsx scripts/apply-clip-review.ts <report.json | -> [--write]"
    );
    process.exit(1);
  }

  let rawInput: string;
  try {
    rawInput =
      fileArg === "-" ? readFileSync(0, "utf8") : readFileSync(fileArg, "utf8");
  } catch (err) {
    console.error(
      `Failed to read input: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }

  const { report, error: parseError } = parseClipReviewReport(rawInput);
  if (parseError || !report) {
    console.error(`\n✗ ${parseError || "Failed to parse report."}`);
    process.exit(1);
  }

  console.log(`\n========================================================`);
  console.log(` RitmoFlow Pro Clip Review Application Autopilot`);
  console.log(` Report kind: ${report.kind} (v${report.version})`);
  console.log(` Clip: ${report.clip.id} ("${report.clip.title}")`);
  console.log(` Reviewed by: ${report.reviewedBy} at ${report.reviewedAt}`);
  console.log(`========================================================\n`);

  // Start empty only when the file doesn't exist. A file that can't be read or parsed stops the
  // script: carrying on with [] and --write would erase every clip already stored.
  let existingClips: StoredProClip[] = [];
  if (existsSync(PRO_CLIPS_FILE)) {
    try {
      existingClips = StoredProClipsSchema.parse(JSON.parse(readFileSync(PRO_CLIPS_FILE, "utf8")));
    } catch (err) {
      console.error(
        `\n✗ ${path.basename(PRO_CLIPS_FILE)} is not a valid list of pro clips, so nothing was changed: ${
          err instanceof Error ? err.message : String(err)
        }\n`
      );
      process.exit(1);
    }
  }

  const result = applyClipReviewReport({
    report,
    existingClips,
  });

  console.log("Decision Breakdown:");
  console.log(`  ✓ Confirmed: ${result.counts.confirmed} rows`);
  console.log(`  ? Unsure:    ${result.counts.unsure} rows`);
  console.log(`  ✗ Rejected:  ${result.counts.rejected} rows\n`);

  if (result.errors.length > 0) {
    console.error("Refusals & Validation Errors:");
    for (const e of result.errors) {
      console.error(`  ✗ ${e}`);
    }
    console.error("\nNo changes were applied due to the errors above.\n");
    process.exit(1);
  }

  const appliedClip = result.updatedClips.find((c) => c.id === report.clip.id);
  console.log(`Proposed Stored Clip: ${report.clip.id}`);
  console.log(`  - Confirmed figures attached: ${appliedClip?.rows.length ?? 0}`);
  for (const r of appliedClip?.rows ?? []) {
    console.log(
      `    • ${r.startSeconds}s–${r.endSeconds}s [${r.type}]: ${r.moveIds.join(", ")}`
    );
  }

  if (!write) {
    console.log(
      `\n[DRY RUN] Everything validated cleanly. No files were modified.`
    );
    console.log(
      `Pass '--write' to persist confirmed clip figures to ${path.basename(
        PRO_CLIPS_FILE
      )}.\n`
    );
    process.exit(0);
  }

  // Persist to data file (sorted by id, 2-space JSON, trailing newline)
  writeFileSync(
    PRO_CLIPS_FILE,
    JSON.stringify(result.updatedClips, null, 2) + "\n",
    "utf8"
  );

  console.log(`\n✓ Successfully persisted updates!`);
  console.log(
    `  - ${PRO_CLIPS_FILE} (${result.updatedClips.length} total pro clips stored)`
  );
  console.log(`\nNext step: run 'npm test' to verify library integrity.\n`);
}

main().catch((err) => {
  console.error("Unhandled error in apply-clip-review:", err);
  process.exit(1);
});
