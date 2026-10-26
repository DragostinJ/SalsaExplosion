import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("M16: Loading Skeletons for Dynamic Routes", () => {
  const loadingPaths = [
    "src/app/dashboard/loading.tsx",
    "src/app/dashboard/wallet/loading.tsx",
    "src/app/dashboard/progression/loading.tsx",
    "src/app/events/[slug]/loading.tsx",
    "src/app/admin/loading.tsx",
    "src/app/instructor/loading.tsx",
    "src/app/private-lessons/loading.tsx",
  ];

  for (const relativePath of loadingPaths) {
    it(`verifies ${relativePath} exists, exports a default component, and includes aria-busy`, () => {
      const fullPath = path.resolve(process.cwd(), relativePath);
      expect(fs.existsSync(fullPath), `File ${relativePath} must exist`).toBe(true);

      const content = fs.readFileSync(fullPath, "utf-8");
      expect(content).toMatch(/export\s+default\s+function/);
      expect(content).toContain('aria-busy="true"');
      expect(content).toContain('role="status"');
      // Must not contain h1 to prevent heading structure clashes
      expect(content).not.toMatch(/<h1[\s>]/);
    });
  }
});
