import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Commercial Invariant Guard: Retired Offers Copy
 *
 * As of 2026-11-01 / 2026-11-02, Maestro Enrique formalized Salsa Explosion UK's
 * real-world business model (AGENTS.md section 2):
 * - Weekly classes at BOH Studios are strictly paid at the door (£12 for 1 class, £14 for 2).
 * - There are NO online class credits, class-credit packs, monthly memberships, subscriptions,
 *   welcome credits, free welcome passes, or referral rewards.
 * - Booking a class only tells the teachers who is coming; it is free and takes no credits.
 * - Online ticketing via Stripe is reserved exclusively for festivals and special events.
 *
 * This test audits all tracked TypeScript sources under `src/app`, `src/components`,
 * and `src/lib` to prevent retired commercial terms from returning to dancer-facing copy.
 */

const RETIRED_OFFER_PHRASES: readonly string[] = [
  "welcome pass",
  "welcome credit",
  "class credit",
  "class pack",
  "membership",
  "subscription",
];

/**
 * Explicit allowlist of files with documented, verified reasons.
 * Only internal backend services or architecture comments explaining the retirement are permitted.
 */
const ALLOWLIST: Record<string, string> = {
  // Hard boundary webhook handler for legacy subscriptions and Stripe synchronization
  "src/app/api/webhooks/stripe/route.ts":
    "Stripe webhook handler maintaining legacy subscription status synchronization in database",

  // Analytics admin page documenting why retired products are excluded from calculations
  "src/app/admin/analytics/page.tsx":
    "Code comments documenting that door classes, retired class packs, and memberships are excluded from online analytics",

  // Canonical academy data registry documenting the retirement date
  "src/lib/academy-data.ts":
    "Code comments documenting the 2026-11-01 retirement of class packs and monthly memberships",

  // User auth provisioning model mapping legacy database columns and retirement comment
  "src/lib/auth-user.ts":
    "Prisma user mapping including legacy subscription relation and code comment documenting class credits retirement",
};

describe("Retired offers copy guard", () => {
  it("tracked .ts and .tsx files under src/app, src/components, and src/lib contain no retired commercial offers", () => {
    const rawFileList = execSync("git ls-files src/app src/components src/lib", {
      encoding: "utf8",
    });
    const files = rawFileList.split(/\r?\n/).filter(Boolean);

    const violations: {
      file: string;
      line: number;
      phrase: string;
      preview: string;
    }[] = [];

    for (const file of files) {
      const normalizedPath = file.replace(/\\/g, "/");

      // Only inspect TypeScript and TSX source files
      if (!normalizedPath.endsWith(".ts") && !normalizedPath.endsWith(".tsx")) {
        continue;
      }

      // Check against explicit allowlist
      if (ALLOWLIST[normalizedPath]) {
        continue;
      }

      const absolutePath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(absolutePath)) {
        continue;
      }

      const content = fs.readFileSync(absolutePath, "utf8");
      const lines = content.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        for (const phrase of RETIRED_OFFER_PHRASES) {
          if (lowerLine.includes(phrase)) {
            violations.push({
              file: normalizedPath,
              line: i + 1,
              phrase,
              preview: line.trim(),
            });
          }
        }
      }
    }

    if (violations.length > 0) {
      const summary = violations
        .map(
          (v) =>
            `${v.file}:${v.line} matched phrase "${v.phrase}"\n    Preview: ${v.preview}`
        )
        .join("\n");
      expect.fail(
        `Found ${violations.length} retired offer violation(s) in dancer-facing source files:\n${summary}`
      );
    }

    expect(violations).toHaveLength(0);
  });
});
