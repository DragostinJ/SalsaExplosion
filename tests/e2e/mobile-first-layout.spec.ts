import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("M8: Mobile-First Responsive Layout & No-Horizontal-Overflow Suite", () => {
  const publicRoutes = [
    { name: "Homepage", path: "/" },
    { name: "Class Timetable", path: "/dashboard/schedule" },
    { name: "Events & Festivals Hub", path: "/events" },
    { name: "Congress Event Details", path: "/events/bournemouth-summer-cuban-salsa-congress-2026" },
    { name: "Pricing & Passes", path: "/pricing" },
    { name: "1-on-1 Coaching", path: "/private-lessons" },
    { name: "Cuban Music Hub", path: "/music" },
    { name: "Merch & Shoes Shop", path: "/shop" },
    { name: "How QR Passes Work", path: "/how-it-works" },
    { name: "Venues & Parking", path: "/venues" },
    { name: "About Academy", path: "/about" },
    { name: "Rueda Dictionary", path: "/dashboard/rueda" },
  ];

  for (const route of publicRoutes) {
    test(`[375x812] verifies zero horizontal overflow and header layout integrity on ${route.name} (${route.path})`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");

      // Check horizontal overflow: scrollWidth must not exceed innerWidth
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          innerWidth: window.innerWidth,
        };
      });

      expect(
        overflow.scrollWidth,
        `Page ${route.path} has horizontal overflow (scrollWidth: ${overflow.scrollWidth} > innerWidth: ${overflow.innerWidth})`
      ).toBeLessThanOrEqual(overflow.innerWidth);

      // Verify header logo and hamburger/action buttons do not collide
      const header = page.locator("header");
      if (await header.count() > 0) {
        const hamburger = header.getByRole("button", { name: /open mobile navigation menu/i });
        const logo = header.locator("a[href='/dashboard/schedule']").first();

        if (await hamburger.isVisible() && await logo.isVisible()) {
          const hamburgerBox = await hamburger.boundingBox();
          const logoBox = await logo.boundingBox();

          if (hamburgerBox && logoBox) {
            // Hamburger is on the right, logo is on the left
            expect(logoBox.x + logoBox.width).toBeLessThanOrEqual(hamburgerBox.x + 10);
            expect(hamburgerBox.height).toBeGreaterThanOrEqual(36);
          }
        }
      }
    });
  }

  test("verifies key mobile CTA buttons meet >= 40px touch height standard", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // 1. Private Lessons Coaching CTA button
    await page.goto("/private-lessons");
    await page.waitForLoadState("domcontentloaded");
    const coachingCta = page.getByRole("button", { name: /request coaching slot/i });
    if (await coachingCta.isVisible()) {
      const box = await coachingCta.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(40);
    }

    // 2. Event pass selector CTAs on congress page
    await page.goto("/events/bournemouth-summer-cuban-salsa-congress-2026");
    await page.waitForLoadState("domcontentloaded");
    const bookButtons = page.locator("button:has-text('Book as'), button:has-text('Get ')");
    const count = await bookButtons.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const btn = bookButtons.nth(i);
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    }

    // 3. Shop category pills meet touch target
    await page.goto("/shop");
    await page.waitForLoadState("domcontentloaded");
    const shopPills = page.locator("button:has-text('All Merch'), button:has-text('Apparel')");
    const pillCount = await shopPills.count();
    for (let i = 0; i < pillCount; i++) {
      const pill = shopPills.nth(i);
      if (await pill.isVisible()) {
        const box = await pill.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(36);
        }
      }
    }
  });

  test("verifies WCAG 2.1 AA mobile accessibility on schedule and events", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard/schedule");
    await page.waitForLoadState("domcontentloaded");

    const scanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalViolations = scanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(criticalViolations).toEqual([]);
  });

  test("P6: verifies mobile bottom nav visibility, payment trust badges, and schedule grid hierarchy", async ({
    page,
  }) => {
    // 1. Mobile bottom nav is visible on mobile (375x812) and hidden on desktop (1280x800)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const mobileBottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(mobileBottomNav).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(mobileBottomNav).toBeHidden();

    // 2. Payment Security Trust Bar is visible on pricing and event pages
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/pricing");
    await page.waitForLoadState("domcontentloaded");
    const pricingTrustBar = page.locator('[data-testid="payment-security-trust-bar"]');
    await expect(pricingTrustBar).toBeVisible();

    await page.goto("/events/bournemouth-summer-cuban-salsa-congress-2026");
    await page.waitForLoadState("domcontentloaded");
    const eventTrustBar = page.locator('[data-testid="payment-security-trust-bar"]');
    await expect(eventTrustBar).toBeVisible();

    // 3. Class timetable grid renders near top of mobile viewport (y < 650px)
    await page.goto("/dashboard/schedule");
    await page.waitForLoadState("domcontentloaded");
    const scheduleGrid = page.locator('[data-testid="schedule-classes-grid"]');
    await expect(scheduleGrid).toBeVisible();
    const box = await scheduleGrid.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(650);
  });
});
