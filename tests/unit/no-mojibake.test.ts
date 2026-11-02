import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Mojibake happens when text encoded in UTF-8 (such as Spanish accented vowels,
 * British pound symbols "£", em dashes, or typographic bullet dots "·") is decoded
 * or rewritten by tools assuming a legacy single-byte encoding like Windows-1251
 * (Cyrillic) or Windows-1252 (Latin-1).
 *
 * In a Cuban salsa academy platform that manages Spanish song titles, figure mechanics,
 * lyric accents, GBP door pricing, and JSON-LD structured data for search engines,
 * mojibake ruins public search snippets, breaks copy, and corrupts data integrity.
 * This test ensures no corrupted byte sequences enter the repository.
 */

const MOJIBAKE_SEQUENCES: readonly string[] = [
  "В·",
  "ВЈ",
  "В«",
  "В»",
  "вЂ",
  "Г©",
  "Г±",
  "Гі",
  "Г¡",
  "Гє",
  "Ã©",
  "Ã±",
  "Ã³",
  "Ã¡",
  "Ãº",
  "â€",
  "Â·",
  "Â£",
];

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".webp",
  ".jfif",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp3",
  ".wav",
  ".pdf",
  ".zip",
]);

describe("Mojibake guard", () => {
  it("tracked text files contain zero UTF-8-read-as-cp1251 or cp1252 corrupted sequences", () => {
    const rawFileList = execSync(
      "git ls-files src tests scripts docs AGENTS.md README.md",
      { encoding: "utf8" }
    );
    const files = rawFileList.split(/\r?\n/).filter(Boolean);

    const violations: { file: string; line: number; sequence: string; preview: string }[] = [];

    for (const file of files) {
      const normalizedPath = file.replace(/\\/g, "/");

      // Exclude the guard test itself to allow matching sequence definitions
      if (normalizedPath.endsWith("tests/unit/no-mojibake.test.ts")) {
        continue;
      }

      const ext = path.extname(normalizedPath).toLowerCase();
      if (BINARY_EXTENSIONS.has(ext)) {
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
        for (const seq of MOJIBAKE_SEQUENCES) {
          if (line.includes(seq)) {
            violations.push({
              file: normalizedPath,
              line: i + 1,
              sequence: seq,
              preview: line.trim(),
            });
          }
        }
      }
    }

    if (violations.length > 0) {
      const formatted = violations
        .map(
          (v) =>
            `File: ${v.file}:${v.line} [seq: ${JSON.stringify(v.sequence)}] -> ${v.preview}`
        )
        .join("\n");
      expect.fail(
        `Found ${violations.length} mojibake violation(s):\n${formatted}`
      );
    }

    expect(violations).toHaveLength(0);
  });
});
