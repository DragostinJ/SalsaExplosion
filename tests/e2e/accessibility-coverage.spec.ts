import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Task 4: Comprehensive Accessibility Sweep
 * Covers WCAG 2.1 AA (serious and critical) across all public routes
 * at both 1440x900 desktop and 390x844 mobile viewports,
 * open interactive states (mobile nav sheet, practice player details sheet),
 * and keyboard navigation compliance.
 */

const STATIC_PUBLIC_ROUTES = [
  { name: "Homepage", path: "/" },
  { name: "Class Schedule", path: "/classes" },
  { name: "Events & Festivals", path: "/events" },
  { name: "Pricing & Passes", path: "/pricing" },
  { name: "About Academy", path: "/about" },
  { name: "Venues & Parking", path: "/venues" },
  { name: "Private Lessons", path: "/private-lessons" },
  { name: "How It Works", path: "/how-it-works" },
  { name: "Terms & UK Legal", path: "/terms" },
  { name: "Move Library", path: "/moves" },
  { name: "Rueda Curriculum", path: "/rueda" },
  { name: "Music Timba Anatomy", path: "/music" },
  { name: "Poster Desk Cartel", path: "/cartel" },
  { name: "Not Found Route", path: "/this-page-does-not-exist" },
];

const VIEWPORTS = [
  { name: "Desktop (1440x900)", width: 1440, height: 900 },
  { name: "Mobile (390x844)", width: 390, height: 844 },
];

test.describe("Task 4: Accessibility Coverage & WCAG 2.1 AA Audits", () => {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name} viewport audits`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of STATIC_PUBLIC_ROUTES) {
        test(`zero serious/critical violations on ${route.name} (${route.path})`, async ({ page }) => {
          await page.goto(route.path);
          await page.waitForLoadState("domcontentloaded");

          const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze();

          const violations = results.violations.filter(
            (v) => v.impact === "serious" || v.impact === "critical"
          );
          expect(violations).toEqual([]);
        });
      }

      test("zero serious/critical violations on first event page", async ({ page }) => {
        await page.goto("/events");
        await page.waitForLoadState("domcontentloaded");
        const eventLink = await page.locator('a[href^="/events/"]:not([href="/events"])').first().getAttribute("href");
        expect(eventLink).toBeTruthy();
        await page.goto(eventLink!);
        await page.waitForLoadState("domcontentloaded");

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const violations = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical"
        );
        expect(violations).toEqual([]);
      });

      test("zero serious/critical violations on first move page", async ({ page }) => {
        await page.goto("/moves");
        await page.waitForLoadState("domcontentloaded");
        const moveLink = await page.locator('a[href^="/moves/"]:not([href="/moves"])').first().getAttribute("href");
        expect(moveLink).toBeTruthy();
        await page.goto(moveLink!);
        await page.waitForLoadState("domcontentloaded");

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const violations = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical"
        );
        expect(violations).toEqual([]);
      });

      test("zero serious/critical violations on first music practice player", async ({ page }) => {
        await page.goto("/music");
        await page.waitForLoadState("domcontentloaded");
        const musicLink = await page.locator('a[href^="/music/"]:not([href="/music"])').first().getAttribute("href");
        expect(musicLink).toBeTruthy();
        await page.goto(musicLink!);
        await page.waitForLoadState("domcontentloaded");

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .exclude("iframe")
          .analyze();

        const violations = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical"
        );
        expect(violations).toEqual([]);
      });
    });
  }

  test.describe("Mobile 390px Open States", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("zero serious/critical violations with mobile navigation sheet open", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const menuBtn = page.locator('button[aria-label="Open mobile navigation menu"], button[aria-label="Open More Menu"]').first();
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();

      const sheet = page.locator('[data-testid="mobile-nav-panel"]').first();
      await expect(sheet).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const violations = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );
      expect(violations).toEqual([]);
    });

    test("zero serious/critical violations on /moves with filter options visible", async ({ page }) => {
      await page.goto("/moves");
      await page.waitForLoadState("domcontentloaded");

      const filterSection = page.locator('[role="group"][aria-label="Level"]');
      await expect(filterSection).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const violations = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );
      expect(violations).toEqual([]);
    });

    test("zero serious/critical violations with practice player details sheet open", async ({ page }) => {
      await page.goto("/music");
      await page.waitForLoadState("domcontentloaded");
      const musicLink = await page.locator('a[href^="/music/"]:not([href="/music"])').first().getAttribute("href");
      await page.goto(musicLink || "/music/me-dicen-cuba");
      await page.waitForLoadState("domcontentloaded");

      const detailsBtn = page.locator('button[aria-label="Section details and practice settings"]');
      if (await detailsBtn.isVisible()) {
        await detailsBtn.click();
        const moreSheet = page.locator('[role="dialog"]').first();
        await expect(moreSheet).toBeVisible();
      }

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .exclude("iframe")
        .analyze();

      const violations = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );
      expect(violations).toEqual([]);
    });
  });

  test.describe("Keyboard Navigation & Focus Indicator Verification", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    const keyRoutes = [
      { name: "Homepage", path: "/" },
      { name: "Class Schedule", path: "/classes" },
    ];

    for (const route of keyRoutes) {
      test(`tabbing 25 times on ${route.name} maintains visible focus indicator on focused elements`, async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState("domcontentloaded");

        for (let i = 1; i <= 25; i++) {
          await page.keyboard.press("Tab");

          const elementState = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;

            // Scroll into view if needed to verify viewport visibility
            el.scrollIntoView({ block: "nearest", inline: "nearest" });
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            const isDisplayed = style.display !== "none" && style.visibility !== "hidden";
            const hasSize = rect.width > 0 && rect.height > 0;
            const inViewport = (
              rect.top < window.innerHeight &&
              rect.bottom > 0 &&
              rect.left < window.innerWidth &&
              rect.right > 0
            );

            const outlineStyle = style.outlineStyle;
            const outlineWidth = parseFloat(style.outlineWidth) || 0;
            const hasOutline = outlineStyle !== "none" && outlineWidth > 0;

            const boxShadow = style.boxShadow;
            const hasBoxShadow = Boolean(boxShadow && boxShadow !== "none");

            return {
              tag: el.tagName,
              isDisplayed,
              hasSize,
              inViewport,
              hasIndicator: hasOutline || hasBoxShadow,
            };
          });

          if (elementState) {
            expect(elementState.isDisplayed).toBe(true);
            expect(elementState.hasSize).toBe(true);
            expect(elementState.inViewport).toBe(true);
            expect(elementState.hasIndicator).toBe(true);
          }
        }
      });
    }

    test("tabbing 25 times on practice player maintains visible focus indicator (excluding iframe)", async ({ page }) => {
      await page.goto("/music");
      await page.waitForLoadState("domcontentloaded");
      const musicLink = await page.locator('a[href^="/music/"]:not([href="/music"])').first().getAttribute("href");
      await page.goto(musicLink || "/music/me-dicen-cuba");
      await page.waitForLoadState("domcontentloaded");

      for (let i = 1; i <= 25; i++) {
        await page.keyboard.press("Tab");

        const elementState = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;

          // Exclude YouTube iframe
          if (el.tagName === "IFRAME" || el.id === "widget2" || el.closest("iframe")) {
            return { isIframe: true };
          }

          el.scrollIntoView({ block: "nearest", inline: "nearest" });
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);

          const isDisplayed = style.display !== "none" && style.visibility !== "hidden";
          const hasSize = rect.width > 0 && rect.height > 0;
          const inViewport = (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
          );

          const outlineStyle = style.outlineStyle;
          const outlineWidth = parseFloat(style.outlineWidth) || 0;
          const hasOutline = outlineStyle !== "none" && outlineWidth > 0;

          const boxShadow = style.boxShadow;
          const hasBoxShadow = Boolean(boxShadow && boxShadow !== "none");

          return {
            isIframe: false,
            tag: el.tagName,
            isDisplayed,
            hasSize,
            inViewport,
            hasIndicator: hasOutline || hasBoxShadow,
          };
        });

        if (elementState && !elementState.isIframe) {
          expect(elementState.isDisplayed).toBe(true);
          expect(elementState.hasSize).toBe(true);
          expect(elementState.inViewport).toBe(true);
          expect(elementState.hasIndicator).toBe(true);
        }
      }
    });
  });

  test.describe("Mobile 390px Navigation Keyboard Interaction", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("mobile navigation sheet opens via keyboard and closes with Escape", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const menuBtn = page.locator('button[aria-label="Open mobile navigation menu"]').first();
      await menuBtn.focus();
      await page.keyboard.press("Enter");

      const sheet = page.locator('[data-testid="mobile-nav-panel"]');
      await expect(sheet).toBeVisible();

      // Escape key closes it
      await page.keyboard.press("Escape");
      await expect(sheet).not.toBeVisible();
    });
  });
});
