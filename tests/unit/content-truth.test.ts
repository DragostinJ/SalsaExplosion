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

describe("H1: Content Truth & Fact Consistency Guard", () => {
  const rootSrc = path.resolve(__dirname, "../../src");
  const allFiles = getAllSourceFiles(rootSrc);

  it("proves zero occurrences of legacy venue 'Woodlands' across production source", () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (/Woodlands/i.test(line) && !line.includes("/* Historical venue: Woodlands")) {
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
      `Found legacy 'Woodlands' venue violations. BOH Studios Bournemouth is the single residency venue:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("proves zero occurrences of contradictory '33 years' stat across production source", () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (/33\s*years/i.test(line) && !line.includes("/* Historical:")) {
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
      `Found contradictory '33 years' violations. Canonical heritage is '25+ years':\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("proves zero occurrences of legacy 'Video Vault' copy (renamed to 'Class Recaps')", () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (/Video\s*Vault/i.test(line) && !line.includes("/* Historical:")) {
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
      `Found legacy 'Video Vault' violations. User-facing terminology is 'Class Recaps':\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("proves zero occurrences of contradictory 'unlimited monthly' pass promises", () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (/unlimited\s*monthly/i.test(line) && !line.includes("/* Historical:")) {
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
      `Found 'unlimited monthly' violations. Weekly classes are pay-at-the-door (£12/£14):\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });

  it("proves 24-hour timetable format is strictly enforced (zero 12-hour AM/PM formats in copy)", () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const amPmPattern = /\b\d{1,2}(?::\d{2})?\s?(?:AM|PM)\b/;

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (amPmPattern.test(line) && !line.includes("/* Historical:")) {
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
      `Found 12-hour AM/PM time format violations. Use 24-hour format (e.g. 19:00, 20:15, 02:00):\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    ).toEqual([]);
  });
});
