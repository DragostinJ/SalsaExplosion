import { test, expect } from "@playwright/test";

test.describe("V5: Visual Design Synchronization & Drift Prevention", () => {
  const routes = [
    { name: "Homepage", path: "/" },
    { name: "About Academy", path: "/about" },
    { name: "Venues & Parking", path: "/venues" },
    { name: "Congress & Events", path: "/events" },
    { name: "Pricing & Passes", path: "/pricing" },
    { name: "Class Timetable", path: "/dashboard/schedule" },
    { name: "Cuban Music Hub", path: "/music" },
  ];

  test("verifies all core routes share the canonical ICAIC paper canvas (#F1E6D0)", async ({
    page,
  }) => {
    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");

      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      expect(
        bodyBg,
        `Page ${route.name} (${route.path}) body backgroundColor should be rgb(241, 230, 208) (#F1E6D0)`
      ).toBe("rgb(241, 230, 208)");
    }
  });

  test("verifies primary header CTA has canonical brand background (rgb(234, 74, 51)) across desktop pages", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");

      const cta = page.locator('[data-testid="site-header-book-cta"]');
      await expect(cta).toBeVisible();

      const ctaBg = await cta.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(
        ctaBg,
        `Page ${route.name} (${route.path}) site-header-book-cta backgroundColor should be rgb(234, 74, 51)`
      ).toBe("rgb(234, 74, 51)");
    }
  });

  test("verifies consistent H1 font sizes across all inner pages with PageHeader at desktop (1280px) and mobile (390px)", async ({
    page,
  }) => {
    const innerRoutes = routes.filter((r) => r.path !== "/" && r.path !== "/music");

    // Test Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    let desktopH1FontSize: string | null = null;

    for (const route of innerRoutes) {
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");

      const pageHeader = page.locator('[data-testid="page-header"]');
      await expect(pageHeader).toBeVisible();

      const h1 = pageHeader.locator("h1");
      await expect(h1).toBeVisible();

      const fontSize = await h1.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      if (!desktopH1FontSize) {
        desktopH1FontSize = fontSize;
      } else {
        expect(
          fontSize,
          `Desktop H1 font-size on ${route.name} (${fontSize}) should match ${desktopH1FontSize}`
        ).toBe(desktopH1FontSize);
      }
    }

    // Test Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    let mobileH1FontSize: string | null = null;

    for (const route of innerRoutes) {
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");

      const pageHeader = page.locator('[data-testid="page-header"]');
      await expect(pageHeader).toBeVisible();

      const h1 = pageHeader.locator("h1");
      await expect(h1).toBeVisible();

      const fontSize = await h1.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      if (!mobileH1FontSize) {
        mobileH1FontSize = fontSize;
      } else {
        expect(
          fontSize,
          `Mobile H1 font-size on ${route.name} (${fontSize}) should match ${mobileH1FontSize}`
        ).toBe(mobileH1FontSize);
      }
    }
  });

  test("verifies zero horizontal overflow at mobile viewport (390px) on all routes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
        };
      });

      expect(
        overflow.scrollWidth,
        `Page ${route.name} (${route.path}) horizontal overflow at 390px: scrollWidth (${overflow.scrollWidth}) > clientWidth (${overflow.clientWidth})`
      ).toBeLessThanOrEqual(overflow.clientWidth + 1);
    }
  });
});
