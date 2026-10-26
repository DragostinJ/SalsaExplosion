import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllSourceFiles(fullPath, fileList);
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe("V5: Visual Consistency & Design Drift Guard", () => {
  const rootSrc = path.resolve(__dirname, "../../src");
  const appAndComponents = [
    path.join(rootSrc, "app"),
    path.join(rootSrc, "components"),
  ];

  const allFiles = appAndComponents.flatMap((dir) => getAllSourceFiles(dir));

  // Files with intentional print-fidelity or fallback canvas overrides
  const EXCLUDED_PRINT_AND_STORY_FILES = [
    "src[\\\\/]app[\\\\/]instructor[\\\\/]roster[\\\\/]print[\\\\/]page.tsx",
    "src[\\\\/]components[\\\\/]ui[\\\\/]scannable-qr-code.tsx",
    "src[\\\\/]app[\\\\/]global-error.tsx",
    "src[\\\\/]components[\\\\/]progression[\\\\/]promotion-certificate-card.tsx",
  ];

  function isExcluded(filePath: string): boolean {
    return EXCLUDED_PRINT_AND_STORY_FILES.some((pattern) =>
      new RegExp(pattern).test(filePath)
    );
  }

  it("proves zero occurrences of legacy text-text-muted across all app and components", () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.includes("text-text-muted")) {
          violations.push({
            file: path.relative(rootSrc, file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Found legacy text-text-muted violations:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("proves zero occurrences of text-zinc-950 in production UI", () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of allFiles) {
      if (isExcluded(file)) continue;
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.includes("text-zinc-950")) {
          violations.push({
            file: path.relative(rootSrc, file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Found text-zinc-950 violations:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("proves zero deprecated zinc, slate, or gray Tailwind classes in public pages and components", () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const forbiddenPattern = /\b(text|bg|border)-(zinc|slate|gray)-(?:50|100|200|300|400|500|600|700|800|900|950)\b/;

    for (const file of allFiles) {
      if (isExcluded(file)) continue;
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (forbiddenPattern.test(line)) {
          violations.push({
            file: path.relative(rootSrc, file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Found forbidden neutral color classes (zinc/slate/gray). Use canonical stone-* or semantic tokens instead:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("proves raw hex colors in className are restricted to allowlisted tokens", () => {
    const violations: { file: string; line: number; text: string }[] = [];
    // Matches arbitrary hexes inside className strings like bg-[#...] or text-[#...]
    const rawHexClassPattern = /(?:bg|text|border)-\[#([0-9a-fA-F]{3,8})\]/g;
    // Allowlist official 3rd-party social brand colors (e.g., Facebook official brand blue)
    const ALLOWLISTED_EXTERNAL_BRAND_HEXES = new Set(["0866ff", "0756d6"]);

    for (const file of allFiles) {
      if (isExcluded(file)) continue;
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        const matches = Array.from(line.matchAll(rawHexClassPattern));
        const disallowed = matches.filter(
          (m) => !ALLOWLISTED_EXTERNAL_BRAND_HEXES.has(m[1].toLowerCase())
        );
        if (disallowed.length > 0) {
          violations.push({
            file: path.relative(rootSrc, file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Found raw hex codes inside Tailwind class strings. Use canonical design tokens (bg-canvas, bg-surface-1, bg-brand, text-gold, etc.):\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("proves zero dark: variant classes remain across all app and components", () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of allFiles) {
      if (isExcluded(file)) continue;
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (/\bdark:/.test(line)) {
          violations.push({
            file: path.relative(rootSrc, file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Found dead dark: variant classes. All UI must use canonical dark tokens unconditionally:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("proves zero references to banned legacy cream/beige color strings (#F4ECE1, #faf7f2)", () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const bannedColors = ["#f4ece1", "#faf7f2"];

    for (const file of allFiles) {
      if (isExcluded(file)) continue;
      const content = fs.readFileSync(file, "utf-8").toLowerCase();
      bannedColors.forEach((color) => {
        if (content.includes(color)) {
          violations.push({
            file: path.relative(rootSrc, file),
            line: 1,
            text: `Contains banned legacy color ${color}`,
          });
        }
      });
    }

    expect(
      violations,
      `Found legacy cream/beige color strings. All views must use the unified deep obsidian-black palette:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("Q3: proves zero forbidden raw palette classes (purple, indigo, cyan, orange, teal) in production TSX", () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const forbiddenPattern = /\b(?:bg|text|border|ring)-(?:purple|indigo|cyan|orange|teal)-\d+\b/;

    for (const file of allFiles) {
      if (isExcluded(file) || !file.endsWith(".tsx")) continue;
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (forbiddenPattern.test(line)) {
          violations.push({
            file: path.relative(rootSrc, file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Found forbidden raw palette classes (purple/indigo/cyan/orange/teal). Use semantic tokens (gold, role-lead, info, etc.):\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("Q3: proves raw non-brand/status palette classes are capped strictly at <= 150 across TSX files", () => {
    let totalRawMatches = 0;
    const rawPattern = /\b(?:bg|text|border|ring)-(?:purple|indigo|cyan|orange|teal|blue|sky)-\d+\b/g;

    for (const file of allFiles) {
      if (isExcluded(file) || !file.endsWith(".tsx")) continue;
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(rawPattern);
      if (matches) {
        totalRawMatches += matches.length;
      }
    }

    expect(totalRawMatches).toBeLessThanOrEqual(150);
  });

  it("Q3: proves bg-gradient-to occurrences are capped strictly at <= 25 across all TSX files", () => {
    let totalGradients = 0;
    const gradientPattern = /\bbg-gradient-to-[a-z]+\b/g;

    for (const file of allFiles) {
      if (!file.endsWith(".tsx")) continue;
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(gradientPattern);
      if (matches) {
        totalGradients += matches.length;
      }
    }

    expect(totalGradients).toBeLessThanOrEqual(25);
  });
});
