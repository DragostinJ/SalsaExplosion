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
 *    - Our own compressed JavaScript on key public routes (/, /moves, /music, /classes) stays <= 450 KB.
 *    - Third-party scripts (Clerk, about 390 KB) are reported, not asserted: Clerk serves the
 *      newest clerk-js 5.x from its CDN, so its size changes without a change in this repo.
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

      const img = section.locator('[data-testid="family-art-image"]').first();
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

test.describe("JavaScript budget (our own code <= 450 KB compressed)", () => {
  const ROUTES = ["/", "/moves", "/music", "/classes"] as const;
  const OWN_BUDGET_KB = 450;

  interface ScriptLoad {
    sameOrigin: boolean;
    bodyBytes: number;
    immutable: boolean;
  }

  for (const route of ROUTES) {
    test(`route "${route}" ships <= ${OWN_BUDGET_KB} KB of our own JavaScript`, async ({
      page,
      baseURL,
    }) => {
      // Bytes as they came over the network. The Performance API reports 0 for cross-origin
      // scripts without Timing-Allow-Origin, which hid most of Clerk's 390 KB from the old count.
      const origin = new URL(baseURL ?? "http://localhost:3000").origin;
      const loads: Promise<ScriptLoad>[] = [];
      page.on("requestfinished", (request) => {
        if (request.resourceType() !== "script") return;
        // blob: workers are built in the page from code already downloaded; no network bytes
        if (!/^https?:/.test(request.url())) return;
        loads.push(
          Promise.all([request.sizes(), request.response()]).then(([sizes, response]) => ({
            sameOrigin: new URL(request.url()).origin === origin,
            bodyBytes: sizes.responseBodySize,
            immutable: (response?.headers()["cache-control"] ?? "").includes("immutable"),
          }))
        );
      });

      await page.goto(route, { waitUntil: "networkidle" });
      const scripts = await Promise.all(loads);
      const own = scripts.filter((s) => s.sameOrigin);

      // `next dev` serves unminified, uncached chunks; the budget is for production builds.
      test.skip(
        own.length === 0 || own.some((s) => !s.immutable),
        "JS budget needs a production server (next start)"
      );

      const kb = (list: ScriptLoad[]) =>
        Math.round(list.reduce((sum, s) => sum + s.bodyBytes, 0) / 1024);
      const ownKb = kb(own);
      const thirdPartyKb = kb(scripts.filter((s) => !s.sameOrigin));

      test.info().annotations.push({
        type: "js-size",
        description: `${route}: own ${ownKb} KB, third-party ${thirdPartyKb} KB, total ${ownKb + thirdPartyKb} KB`,
      });

      expect(ownKb).toBeLessThanOrEqual(OWN_BUDGET_KB);
    });
  }
});
