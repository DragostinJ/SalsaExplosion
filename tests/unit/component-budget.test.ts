import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Component File Size & Modularization Budget (Milestone H7)", () => {
  it("enforces that key modularized components remain under 25KB", () => {
    const targetFiles = [
      "src/components/music/timba-song-anatomy-player.tsx",
      "src/components/recaps/class-recap-vault.tsx",
      "src/components/admin/studio-operations-workspace.tsx",
      "src/components/instructor/class-roster-workspace.tsx",
    ];

    for (const relPath of targetFiles) {
      const fullPath = path.resolve(process.cwd(), relPath);
      expect(fs.existsSync(fullPath), `File must exist: ${relPath}`).toBe(true);
      const stats = fs.statSync(fullPath);
      // 25KB budget = 25,600 bytes
      expect(
        stats.size,
        `File ${relPath} exceeds 25KB budget (actual: ${stats.size} bytes)`
      ).toBeLessThanOrEqual(25600);
    }
  });

  it("verifies extracted subcomponents exist and are valid modules", () => {
    const subcomponents = [
      "src/components/music/timba-player/timba-types.tsx",
      "src/components/music/timba-player/timba-beat-bar.tsx",
      "src/components/music/timba-player/timba-timeline-scrubber.tsx",
      "src/components/music/timba-player/timba-dancer-hud.tsx",
      "src/components/recaps/vault/recap-types.ts",
      "src/components/recaps/vault/recap-video-player.tsx",
      "src/components/recaps/vault/recap-staff-modal.tsx",
      "src/components/admin/operations/types.ts",
      "src/components/admin/operations/coaching-requests-tab.tsx",
      "src/components/admin/operations/merch-fulfillment-tab.tsx",
      "src/components/admin/operations/partner-waitlist-tab.tsx",
      "src/components/admin/operations/sentiment-feedback-tab.tsx",
      "src/components/instructor/roster/roster-sidebar.tsx",
      "src/components/instructor/roster/roster-balance-meters.tsx",
      "src/components/instructor/roster/roster-dancer-list.tsx",
      "src/components/instructor/roster/roster-recap-modal.tsx",
    ];

    for (const relPath of subcomponents) {
      const fullPath = path.resolve(process.cwd(), relPath);
      expect(fs.existsSync(fullPath), `Subcomponent must exist: ${relPath}`).toBe(true);
      const content = fs.readFileSync(fullPath, "utf-8");
      expect(content.length).toBeGreaterThan(50);
    }
  });
});
