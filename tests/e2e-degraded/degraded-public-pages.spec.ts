import { test, expect } from "@playwright/test";
import { UPCOMING_EVENTS } from "../../src/lib/academy-data";

const DEGRADED_ROUTES_TO_TEST = [
  "/",
  "/about",
  "/events",
  `/events/${UPCOMING_EVENTS[0].slug}`,
  "/pricing",
  "/private-lessons",
  "/schedule",
  "/dashboard/schedule",
  "/dashboard/rueda",
  "/music",
  "/venues",
  "/terms",
  "/how-it-works",
  "/shop",
  "/sign-in",
];

test.describe("M15: Degraded Cold-Start & DB-Down Resilience", () => {
  for (const route of DEGRADED_ROUTES_TO_TEST) {
    test(`renders ${route} successfully without crashing with 500 or application error`, async ({
      page,
    }) => {
      const res = await page.goto(route, { waitUntil: "load" });
      expect(res?.status()).toBeLessThan(400);

      const bodyText = await page.textContent("body");
      expect(bodyText).not.toContain("Application Error");
      expect(bodyText).not.toContain("A Misstep on the Floor");
      expect(bodyText).not.toContain("The studio platform encountered an unexpected hiccup");
    });
  }

  test("verifies event detail page on degraded fallback displays purchases-unavailable notice and disables checkout", async ({
    page,
  }) => {
    await page.goto(`/events/${UPCOMING_EVENTS[0].slug}`);

    const notice = page.locator('[data-testid="event-purchases-unavailable"]');
    await expect(notice).toBeVisible();

    const buttons = page.locator("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const text = (await btn.textContent()) || "";
      if (text.includes("Pass") || text.includes("Book") || text.includes("Register")) {
        const ariaDisabled = await btn.getAttribute("aria-disabled");
        const isDisabled = await btn.isDisabled();
        expect(isDisabled || ariaDisabled === "true").toBe(true);
      }
    }
  });
});
