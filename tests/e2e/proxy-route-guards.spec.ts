import { test, expect } from "@playwright/test";

test.describe("Proxy & Role Route Guards (A4)", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(45000);
  });

  test("1. Anonymous user attempting to access /admin/analytics redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/admin/analytics", { waitUntil: "domcontentloaded" });
    const url = page.url();
    expect(url).toMatch(/sign-in/);
  });

  test("2. Anonymous user attempting to access /instructor/roster redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/instructor/roster", { waitUntil: "domcontentloaded" });
    const url = page.url();
    expect(url).toMatch(/sign-in/);
  });

  test("3. Anonymous user attempting to access /dashboard/schedule redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard/schedule", { waitUntil: "domcontentloaded" });
    const url = page.url();
    expect(url).toMatch(/sign-in/);
  });

  test("4. Public routes remain freely accessible without authentication", async ({
    page,
  }) => {
    // Landing page
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(page.url()).not.toMatch(/sign-in/);
    await expect(page.locator("h1")).toBeVisible();

    // Events directory
    await page.goto("/events", { waitUntil: "domcontentloaded" });
    expect(page.url()).not.toMatch(/sign-in/);

    // Pricing
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    expect(page.url()).not.toMatch(/sign-in/);

    // Venues
    await page.goto("/venues", { waitUntil: "domcontentloaded" });
    expect(page.url()).not.toMatch(/sign-in/);

    // Music hub
    await page.goto("/music", { waitUntil: "domcontentloaded" });
    expect(page.url()).not.toMatch(/sign-in/);
  });
});
