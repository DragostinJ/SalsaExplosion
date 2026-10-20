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
});
