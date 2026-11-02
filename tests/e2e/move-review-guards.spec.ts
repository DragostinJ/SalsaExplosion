import { test, expect } from "@playwright/test";

test.describe("Move Library Review Staff Route Guards", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(45000);
  });

  test("1. Anonymous visitor navigating to /instructor/moves redirects to sign-in without leaking move data", async ({
    page,
  }) => {
    await page.goto("/instructor/moves", { waitUntil: "domcontentloaded" });
    const url = page.url();
    expect(url).toMatch(/sign-in/);

    // Verify draft UI / text was never rendered
    await expect(page.getByText("Curriculum Review Desk")).not.toBeVisible();
    await expect(page.getByText("Counts Unverified")).not.toBeVisible();
  });

  test("2. Anonymous visitor navigating to /instructor/moves/guapea redirects to sign-in without leaking draft text", async ({
    page,
  }) => {
    await page.goto("/instructor/moves/guapea", { waitUntil: "domcontentloaded" });
    const url = page.url();
    expect(url).toMatch(/sign-in/);

    // Verify draft details were not exposed to anonymous visitor
    await expect(page.getByText("Foundational open-position dance step")).not.toBeVisible();
    await expect(page.getByText("Teacher Review & Verification")).not.toBeVisible();
  });

  test("3. Anonymous visitor navigating to /instructor/moves/import redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/instructor/moves/import", { waitUntil: "domcontentloaded" });
    const url = page.url();
    expect(url).toMatch(/sign-in/);

    await expect(page.getByText("Import Move Maker Drafts")).not.toBeVisible();
  });

  test("4. Anonymous visitor navigating to /instructor/clips redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/instructor/clips", { waitUntil: "domcontentloaded" });
    const url = page.url();
    expect(url).toMatch(/sign-in/);

    await expect(page.getByText("Pro Clips Review Desk")).not.toBeVisible();
  });
});
