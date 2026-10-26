import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("M13: Static Route Guard Defence-in-Depth Audit", () => {
  const appRoot = path.resolve(process.cwd(), "src", "app");

  function getPageFiles(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...getPageFiles(fullPath));
      } else if (entry.name === "page.tsx") {
        results.push(fullPath);
      }
    }
    return results;
  }

  it("verifies every page in src/app/admin/ enforces requireRole(", () => {
    const adminPages = getPageFiles(path.join(appRoot, "admin"));
    expect(adminPages.length).toBeGreaterThan(0);

    for (const pageFile of adminPages) {
      const content = fs.readFileSync(pageFile, "utf-8");
      expect(
        content.includes("requireRole("),
        `Admin route at ${pageFile} must call requireRole()`
      ).toBe(true);
    }
  });

  it("verifies every page in src/app/instructor/ enforces requireRole(", () => {
    const instructorPages = getPageFiles(path.join(appRoot, "instructor"));
    expect(instructorPages.length).toBeGreaterThan(0);

    for (const pageFile of instructorPages) {
      const content = fs.readFileSync(pageFile, "utf-8");
      expect(
        content.includes("requireRole("),
        `Instructor route at ${pageFile} must call requireRole()`
      ).toBe(true);
    }
  });

  it("verifies protected progression, recaps, and checkin pages redirect unauthenticated users to /sign-in", () => {
    const progressionPath = path.join(appRoot, "dashboard", "progression", "page.tsx");
    const recapsPath = path.join(appRoot, "dashboard", "recaps", "page.tsx");
    const checkinPath = path.join(appRoot, "checkin", "[sessionId]", "page.tsx");

    const progressionContent = fs.readFileSync(progressionPath, "utf-8");
    const recapsContent = fs.readFileSync(recapsPath, "utf-8");
    const checkinContent = fs.readFileSync(checkinPath, "utf-8");

    expect(progressionContent).toContain('redirect("/sign-in")');
    expect(recapsContent).toContain('redirect("/sign-in")');
    expect(checkinContent).toContain('redirect("/sign-in")');
  });

  it("verifies wallet and referral pages safely handle null user (!user branch)", () => {
    const walletPath = path.join(appRoot, "dashboard", "wallet", "page.tsx");
    const referralsPath = path.join(appRoot, "dashboard", "referrals", "page.tsx");

    const walletContent = fs.readFileSync(walletPath, "utf-8");
    const referralsContent = fs.readFileSync(referralsPath, "utf-8");

    expect(walletContent).toMatch(/if\s*\(!user\)/);
    expect(referralsContent).toMatch(/if\s*\(!user\)/);
  });
});
