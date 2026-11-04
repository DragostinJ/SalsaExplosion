/**
 * Routing, Move Library Screen-Print Art & JavaScript Bundle Budget E2E Suite
 *
 * Protects:
 * 1. Routing invariants:
 *    - Unknown paths (/this-page-does-not-exist) return HTTP 404 with the not-found page instead of redirecting to sign-in.
 *    - Private routes (/admin/classes) for unauthenticated visitors still redirect to sign-in.
 * 2. Move library screen-print visuals:
 *    - /moves displays a screen-print picture beside every move family heading with naturalWidth > 0.
 * 3. JavaScript budget protection:
 *    - Total script transferSize on key public routes (/, /moves, /music, /classes) must not exceed 650 KB.
 */

import { test, expect } from "@playwright/test";

test.describe("Routing & Error Handling", () => {
  test("unknown address returns HTTP 404 and displays not-found page without sign-in redirect", async ({
    page,
  }) => {
    const response = await page.goto("/this-page-does-not-exist", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBe(404);
    expect(page.url()).not.toMatch(/sign-in/);

    // Verify not-found page content rendered
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/404|not found|page not found|página no encontrada/i);
  });

  test("private staff route (/admin/classes) redirects unauthenticated visitor to sign-in", async ({
    page,
  }) => {
    await page.goto("/admin/classes", {
      waitUntil: "domcontentloaded",
    });

    expect(page.url()).toMatch(/sign-in/);
  });
});

test.describe("Move Library (/moves) Screen-Print Family Art", () => {
  test("every move family heading has its screen-print picture with naturalWidth > 0", async ({
    page,
  }) => {
    await page.goto("/moves", { waitUntil: "networkidle" });

    const familySections = page.locator("section[aria-labelledby^='family-']");
    const count = await familySections.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const section = familySections.nth(i);
      const heading = section.locator("h2[id^='family-']");
      await heading.scrollIntoViewIfNeeded();

      const img = section.locator("div.flex.items-center.gap-4 img").first();
      await expect(img).toBeVisible();

      // Verify the image loaded and has real dimensions
      await expect
        .poll(
          async () => {
            return await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          },
          {
            message: `Family picture in section ${i} failed to load natural width`,
            timeout: 10000,
          }
        )
        .toBeGreaterThan(0);
    }
  });
});

test.describe("JavaScript Transfer Size Budget (<= 650 KB)", () => {
  const ROUTES = ["/", "/moves", "/music", "/classes"] as const;

  for (const route of ROUTES) {
    test(`route "${route}" loads <= 650 KB of JavaScript transfer size`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "networkidle" });

      const totalScriptBytes = await page.evaluate(() => {
        const entries = performance.getEntriesByType(
          "resource"
        ) as PerformanceResourceTiming[];

        return entries
          .filter(
            (e) =>
              e.initiatorType === "script" ||
              e.name.endsWith(".js") ||
              e.name.includes(".js?")
          )
          .reduce((sum, e) => sum + (e.transferSize || 0), 0);
      });

      const totalScriptKb = Math.round(totalScriptBytes / 1024);
      console.log(`[JS Transfer Size] ${route}: ${totalScriptKb} KB (${totalScriptBytes} bytes)`);

      expect(totalScriptKb).toBeLessThanOrEqual(650);
    });
  }
});
