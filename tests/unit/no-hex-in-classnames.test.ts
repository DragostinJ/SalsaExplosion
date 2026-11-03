import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Design System Invariant Guard: Zero Bleed / No Hex in Classnames
 *
 * Enforces AGENTS.md section 3 ("Zero Bleed: no random hex codes"):
 * - Components must use semantic tokens (e.g. `var(--color-ink)`, `bg-paper`, `text-ink`)
 *   rather than hardcoded hex color literals in Tailwind arbitrary values.
 * - Prevents raw hex values such as `#161311` inside `shadow-[..._#161311]` or other arbitrary
 *   bracket classes `[...]`.
 */

const HEX_IN_BRACKET_REGEX = /\[[^\]\s"']*#[0-9a-fA-F]{3,8}[^\]\s"']*\]/g;

/**
 * Explicit allowlist of files with documented, verified reasons.
 */
const ALLOWLIST_RULES: readonly {
  matches: (filePath: string) => boolean;
  reason: string;
}[] = [
  {
    matches: (filePath) => filePath.includes("opengraph-image.tsx"),
    reason:
      "OpenGraph dynamic image generation routes execute in isolated edge/Node runtimes without standard CSS stylesheets",
  },
  {
    matches: (filePath) => filePath.includes("/cartel/"),
    reason:
      "Physical poster generation endpoints produce downloadable image buffers requiring fixed canvas ink values",
  },
  {
    matches: (filePath) => filePath === "src/app/global-error.tsx",
    reason:
      "Next.js global-error boundary renders when root layout fails and global CSS may not be loaded",
  },
  {
    matches: (filePath) =>
      filePath.startsWith("src/app/mockups/") ||
      filePath.startsWith("src/components/mockups/"),
    reason:
      "Design system mockups contain deliberate visual exploration palettes and comparison swatches",
  },
  {
    matches: (filePath) =>
      filePath === "src/components/ui/scannable-qr-code.tsx",
    reason:
      "High-density physical optical scanner contrast requires hardcoded high-contrast light and dark fills",
  },
];

function isAllowlisted(filePath: string): boolean {
  return ALLOWLIST_RULES.some((rule) => rule.matches(filePath));
}

describe("No hex in classnames guard", () => {
  it("tracked .tsx files under src/app and src/components contain zero hex colors in Tailwind arbitrary values", () => {
    const rawFileList = execSync("git ls-files src/app src/components", {
      encoding: "utf8",
    });
    const files = rawFileList.split(/\r?\n/).filter(Boolean);

    const violations: {
      file: string;
      line: number;
      value: string;
      preview: string;
    }[] = [];

    for (const file of files) {
      const normalizedPath = file.replace(/\\/g, "/");

      // Only check TSX components
      if (!normalizedPath.endsWith(".tsx")) {
        continue;
      }

      // Check against explicit allowlist
      if (isAllowlisted(normalizedPath)) {
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
        let match: RegExpExecArray | null;

        // Reset regex state per line
        HEX_IN_BRACKET_REGEX.lastIndex = 0;

        while ((match = HEX_IN_BRACKET_REGEX.exec(line)) !== null) {
          violations.push({
            file: normalizedPath,
            line: i + 1,
            value: match[0],
            preview: line.trim(),
          });
        }
      }
    }

    if (violations.length > 0) {
      const summary = violations
        .map(
          (v) =>
            `${v.file}:${v.line} found arbitrary hex "${v.value}"\n    Preview: ${v.preview}`
        )
        .join("\n");
      expect.fail(
        `Found ${violations.length} hex-in-classnames violation(s):\n${summary}`
      );
    }

    expect(violations).toHaveLength(0);
  });
});
