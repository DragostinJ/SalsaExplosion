/**
 * Moving around the move library on a phone:
 * 1. The search survives opening a move and coming back (phone back button and "All moves").
 * 2. A "learn first" link leads to a move page with "Back to <the move you came from>",
 *    which returns to that move; a move opened from the list offers only "All moves".
 */

import { test, expect, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const results = (page: Page) => page.locator('section[aria-labelledby^="family-"] a[href^="/moves/"]');
const backBar = (page: Page) => page.getByRole("navigation", { name: "Back" });

/** A move whose "learn first" list links to another published move. */
async function moveWithLearnFirst(page: Page): Promise<string> {
  await page.goto("/moves");
  const hrefs = await page.$$eval('main a[href^="/moves/"]', (links) => links.map((a) => a.getAttribute("href") ?? ""));
  for (const href of [...new Set(hrefs)].slice(0, 60)) {
    await page.goto(href);
    if ((await page.locator('section:has(h2:text("Antes")) a[href^="/moves/"]').count()) > 0) return href;
  }
  throw new Error("No move with a 'learn first' link among the first 60");
}

test.describe("move library navigation", () => {
  test("keeps the search after opening a move and pressing back", async ({ page }) => {
    await page.goto("/moves");
    await page.getByRole("searchbox", { name: "Search moves" }).fill("dame");
    await expect(page).toHaveURL(/\/moves\?q=dame$/);
    const count = await page.locator("p[aria-live]").textContent();

    await results(page).first().click();
    await expect(page).toHaveURL(/\/moves\/[a-z0-9-]+$/);
    await page.goBack();

    await expect(page.getByRole("searchbox", { name: "Search moves" })).toHaveValue("dame");
    await expect(page.locator("p[aria-live]")).toHaveText(count ?? "");
  });

  test("'All moves' on a move page returns to the dancer's search", async ({ page }) => {
    await page.goto("/moves?q=dame");
    await expect(page.getByRole("searchbox", { name: "Search moves" })).toHaveValue("dame");
    await results(page).first().click();

    const allMoves = backBar(page).getByRole("link", { name: "All moves" });
    await expect(allMoves).toHaveAttribute("href", "/moves?q=dame");
    await expect(backBar(page)).not.toContainText("Back to");
    await allMoves.click();
    await expect(page.getByRole("searchbox", { name: "Search moves" })).toHaveValue("dame");
  });

  test("'Back to …' returns to the move whose 'learn first' link was tapped", async ({ page }) => {
    const start = await moveWithLearnFirst(page);
    const startName = (await page.locator("h1").first().innerText()).split("\n")[0].trim();

    await page.locator('section:has(h2:text("Antes")) a[href^="/moves/"]').first().click();
    await expect(page).not.toHaveURL(new RegExp(`${start}$`));

    const back = backBar(page).getByRole("link", { name: /^Back to / });
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute("href", start);
    await expect(back).toHaveText(new RegExp(`Back to ${startName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"));

    await back.click();
    await expect(page).toHaveURL(new RegExp(`${start}$`));
    // Back on the first move, which was opened directly: only "All moves"
    await expect(backBar(page)).not.toContainText("Back to");
  });
});
