import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Component File Size & Modularization Budget (Milestone H7)", () => {
  it("enforces that key modularized components remain under 25KB", () => {
    const targetFiles = [
      "src/components/music/song-player/song-player-screen.tsx",
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
      "src/components/music/song-player/now-card-views.tsx",
      "src/components/music/song-player/player-controls.tsx",
      "src/components/music/song-player/song-map-bar.tsx",
      "src/components/music/song-player/section-list.tsx",
      "src/components/music/song-player/song-player-more-sheet.tsx",
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

  it("enforces that no server action file in src/actions exceeds the 25KB budget (Milestone Q7)", () => {
    const actionsDir = path.resolve(process.cwd(), "src/actions");
    function getActionFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let files: string[] = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files = files.concat(getActionFiles(full));
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
          files.push(full);
        }
      }
      return files;
    }

    const actionFiles = getActionFiles(actionsDir);
    expect(actionFiles.length).toBeGreaterThan(10);

    for (const filePath of actionFiles) {
      const stats = fs.statSync(filePath);
      const relative = path.relative(process.cwd(), filePath);
      expect(
        stats.size,
        `Action file ${relative} exceeds 25KB budget (actual: ${stats.size} bytes)`
      ).toBeLessThanOrEqual(25600);
    }
  });
});
