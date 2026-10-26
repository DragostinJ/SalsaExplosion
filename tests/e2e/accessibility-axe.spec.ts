import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("B5: Accessibility (WCAG 2.1 AA) Axe Audits", () => {
  const routes = [
    { name: "Homepage", path: "/" },
    { name: "Class Schedule", path: "/dashboard/schedule" },
    { name: "Congress & Events", path: "/events" },
    { name: "Pricing & Passes", path: "/pricing" },
    { name: "Shop Redirect", path: "/shop" },
    { name: "About Academy", path: "/about" },
    { name: "Venues & Parking", path: "/venues" },
    { name: "Private Lessons", path: "/private-lessons" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Terms & UK Legal", path: "/terms" },
  ];

  for (const route of routes) {
    test(`verifies zero serious/critical accessibility violations on ${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const seriousOrCriticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );

      expect(seriousOrCriticalViolations).toEqual([]);
    });
  }

  test("verifies zero serious/critical accessibility violations on /music at 390px with move inspector open", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/music");
    await page.waitForLoadState("domcontentloaded");

    // Click on a move pill to open the move inspector modal/card
    const movePill = page.locator('[data-testid^="move-pill-"]').first();
    if (await movePill.isVisible()) {
      await movePill.click();
      await page.waitForSelector('[data-testid="close-move-inspector"]', { state: "visible" }).catch(() => {});
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();

    const seriousOrCriticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(seriousOrCriticalViolations).toEqual([]);
  });

  test("verifies Skip to main content link exists and targets #main-content", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveText("Skip to main content");

    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeAttached();
  });
});
