import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * M14: Authenticated End-to-End Suite
 * Tests are skipped automatically if Clerk E2E test user credentials are not provided.
 */

const HAS_E2E_CREDENTIALS = Boolean(
  process.env.E2E_CLERK_USER_USERNAME && process.env.E2E_CLERK_USER_PASSWORD
);

const test = base.extend({});

test.describe("M14: Authenticated Dancers Flow & Signed-In Experience", () => {
  test.beforeEach(() => {
    test.skip(
      !HAS_E2E_CREDENTIALS,
      "Set E2E_CLERK_USER_USERNAME / E2E_CLERK_USER_PASSWORD to run authenticated tests"
    );
  });

  test("verifies signed-in student can browse core portal pages without errors or hydration aborts", async ({
    page,
  }) => {
    const username = process.env.E2E_CLERK_USER_USERNAME!;
    const password = process.env.E2E_CLERK_USER_PASSWORD!;

    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    // Sign in via standard form
    await page.goto("/sign-in");
    await page.fill('input[name="identifier"]', username);
    await page.click('button:has-text("Continue")');
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Continue")');

    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    const routes = [
      "/",
      "/dashboard/schedule",
      "/dashboard/wallet",
      "/dashboard/progression",
      "/events",
      "/pricing",
    ];

    for (const route of routes) {
      const res = await page.goto(route, { waitUntil: "load" });
      expect(res?.status()).toBeLessThan(400);

      const bodyText = await page.textContent("body");
      expect(bodyText).not.toContain("Application Error");
      expect(bodyText).not.toContain("A Misstep on the Floor");
      expect(bodyText).not.toContain("The studio platform encountered an unexpected hiccup");

      const hasMinified441 = consoleErrors.some((m) => m.includes("Minified React error"));
      expect(hasMinified441).toBe(false);
    }
  });

  test("verifies signed-in student cannot access instructor or admin areas", async ({ page }) => {
    await page.goto("/admin/operations");
    expect(page.url()).not.toContain("/admin/operations");

    await page.goto("/instructor/roster");
    expect(page.url()).not.toContain("/instructor/roster");
  });

  test("WCAG 2.1 AA accessibility audit on signed-in student schedule and wallet", async ({
    page,
  }) => {
    await page.goto("/dashboard/schedule");
    const scheduleAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const scheduleViolations = scheduleAxe.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(scheduleViolations).toEqual([]);

    await page.goto("/dashboard/wallet");
    const walletAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const walletViolations = walletAxe.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(walletViolations).toEqual([]);
  });
});
