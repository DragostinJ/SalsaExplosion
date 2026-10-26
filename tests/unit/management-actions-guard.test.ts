import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Management Actions Security & Modularization Guard", () => {
  const managementDir = path.resolve(process.cwd(), "src/actions/management");
  const modularFiles = [
    "checkin.actions.ts",
    "coaching.actions.ts",
    "events.actions.ts",
    "merch.actions.ts",
    "qa.actions.ts",
    "roster.actions.ts",
    "waitlist.actions.ts",
  ];

  it("verifies all modular management action files exist and declare 'use server'", () => {
    for (const fileName of modularFiles) {
      const filePath = path.join(managementDir, fileName);
      expect(fs.existsSync(filePath), `Modular file must exist: ${fileName}`).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain('"use server"');
    }
  });

  it("asserts each modular management action file imports the auth/role guard (static security check)", () => {
    for (const fileName of modularFiles) {
      const filePath = path.join(managementDir, fileName);
      const content = fs.readFileSync(filePath, "utf-8");
      const hasAuthGuard =
        content.includes("getOrProvisionCurrentUser") ||
        content.includes("canSwitchRoles");

      expect(
        hasAuthGuard,
        `File ${fileName} must import authentication/role guard from @/lib/auth-user`
      ).toBe(true);
    }
  });

  it("verifies the barrel management.actions.ts re-exports all submodules", () => {
    const barrelPath = path.resolve(process.cwd(), "src/actions/management.actions.ts");
    expect(fs.existsSync(barrelPath), "Barrel management.actions.ts must exist").toBe(true);
    const content = fs.readFileSync(barrelPath, "utf-8");

    expect(content).toContain('"use server"');
    expect(content).toContain('from "./management/checkin.actions"');
    expect(content).toContain('from "./management/coaching.actions"');
    expect(content).toContain('from "./management/merch.actions"');
    expect(content).toContain('from "./management/waitlist.actions"');
    expect(content).toContain('from "./management/qa.actions"');
    expect(content).toContain('from "./management/events.actions"');
    expect(content).toContain('from "./management/roster.actions"');
  });
});
