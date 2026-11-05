import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Search engines ignore structured data with a made-up @type. The site once declared itself a
 * "DanceSchool", which schema.org does not define (schema.org/DanceSchool is a 404), so every
 * @type written in src must be one of these checked schema.org types. Add a type here only
 * after opening https://schema.org/<Type> and seeing it exists.
 */
const KNOWN_SCHEMA_ORG_TYPES = new Set([
  "Answer",
  "BreadcrumbList",
  "Course",
  "CourseInstance",
  "CreativeWork",
  "EducationalOrganization",
  "Event",
  "FAQPage",
  "GeoCoordinates",
  "LearningResource",
  "ListItem",
  "LocalBusiness",
  "Offer",
  "OpeningHoursSpecification",
  "Organization",
  "Person",
  "Place",
  "PostalAddress",
  "Question",
  "VideoObject",
]);

const REPO_ROOT = path.resolve(__dirname, "../../");

function typesWrittenInSrc(): Map<string, string[]> {
  const files = execSync("git ls-files src", { cwd: REPO_ROOT, encoding: "utf8" })
    .split("\n")
    .filter((f) => /\.(ts|tsx)$/.test(f));
  const found = new Map<string, string[]>();
  for (const file of files) {
    const text = fs.readFileSync(path.join(REPO_ROOT, file), "utf8");
    for (const match of text.matchAll(/["']@type["']\s*:\s*(\[[^\]]*\]|"[^"]*"|'[^']*')/g)) {
      for (const type of match[1].matchAll(/["']([A-Za-z]+)["']/g)) {
        found.set(type[1], [...(found.get(type[1]) ?? []), file]);
      }
    }
  }
  return found;
}

describe("JSON-LD uses real schema.org types", () => {
  it("finds the business entity's types", () => {
    const types = typesWrittenInSrc();
    expect(types.get("LocalBusiness")).toContain("src/components/seo/JsonLdSchema.tsx");
  });

  it("never writes a @type that schema.org does not define", () => {
    const unknown = [...typesWrittenInSrc()]
      .filter(([type]) => !KNOWN_SCHEMA_ORG_TYPES.has(type))
      .map(([type, files]) => `${type} (in ${[...new Set(files)].join(", ")})`);
    expect(unknown, `Check each on https://schema.org before adding it:\n${unknown.join("\n")}`).toEqual([]);
  });
});
