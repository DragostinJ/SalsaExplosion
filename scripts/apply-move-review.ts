/**
 * CLI script to apply move reviews and imported drafts from the teacher console.
 *
 * Usage:
 *   npx tsx scripts/apply-move-review.ts <report.json>            # dry run: preview changes
 *   npx tsx scripts/apply-move-review.ts <report.json> --write    # commit changes to data files
 *   cat report.json | npx tsx scripts/apply-move-review.ts -      # read from stdin
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SEEDED_MOVES } from "../src/lib/moves/move-library";
import {
  STORED_DRAFTS,
  STORED_REVIEWS,
} from "../src/lib/moves/move-review";
import {
  parseMoveReviewReport,
  applyMoveReviewReport,
} from "../src/lib/moves/move-review-apply";

const REVIEWS_FILE = path.resolve(__dirname, "../src/lib/moves/data/move-reviews.json");
const DRAFTS_FILE = path.resolve(__dirname, "../src/lib/moves/data/move-drafts.json");

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const fileArg = args.find((a) => !a.startsWith("--"));

  if (!fileArg) {
    console.error(
      "Usage: npx tsx scripts/apply-move-review.ts <report.json | -> [--write]"
    );
    process.exit(1);
  }

  let rawInput: string;
  try {
    rawInput = fileArg === "-" ? readFileSync(0, "utf8") : readFileSync(fileArg, "utf8");
  } catch (err) {
    console.error(`Failed to read input: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const { report, error: parseError } = parseMoveReviewReport(rawInput);
  if (parseError || !report) {
    console.error(`\n✗ ${parseError}`);
    process.exit(1);
  }

  console.log(`\n========================================================`);
  console.log(` RitmoFlow Move Review Application Autopilot`);
  console.log(` Report kind: ${report.kind} (v${report.version})`);
  console.log(` Incoming reviews: ${report.reviews.length} | Incoming drafts: ${report.drafts.length}`);
  console.log(`========================================================\n`);

  const result = applyMoveReviewReport({
    report,
    existingSeeds: SEEDED_MOVES,
    existingDrafts: STORED_DRAFTS,
    existingReviews: STORED_REVIEWS,
  });

  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const w of result.warnings) {
      console.warn(`  ! ${w}`);
    }
    console.log("");
  }

  if (result.errors.length > 0) {
    console.error("Refusals & Errors:");
    for (const e of result.errors) {
      console.error(`  ✗ ${e}`);
    }
    console.error("\nNo changes were applied due to the errors above.\n");
    process.exit(1);
  }

  console.log("Proposed Changes:");
  for (const change of result.appliedChanges) {
    const symbol =
      change.action === "approved"
        ? "✓"
        : change.action === "needs-work"
        ? "⚠"
        : change.action === "draft-added"
        ? "+"
        : "✗";
    console.log(`  ${symbol} [${change.action.toUpperCase()}] ${change.moveName} (${change.moveId})`);
    console.log(`    ${change.summary}`);
  }

  if (!write) {
    console.log(`\n[DRY RUN] Everything validated cleanly. No files were modified.`);
    console.log(`Pass '--write' to persist reviews to ${path.basename(REVIEWS_FILE)} and drafts to ${path.basename(DRAFTS_FILE)}.\n`);
    process.exit(0);
  }

  // Persist files
  writeFileSync(REVIEWS_FILE, JSON.stringify(result.updatedReviews, null, 2) + "\n");
  writeFileSync(DRAFTS_FILE, JSON.stringify(result.updatedDrafts, null, 2) + "\n");

  console.log(`\n✓ Successfully persisted updates!`);
  console.log(`  - ${REVIEWS_FILE} (${result.updatedReviews.length} total reviews)`);
  console.log(`  - ${DRAFTS_FILE} (${result.updatedDrafts.length} total drafts)`);
  console.log(`\nNext step: run 'npm test' to verify full library integrity.\n`);
}

main().catch((err) => {
  console.error("Unhandled error in apply-move-review:", err);
  process.exit(1);
});
