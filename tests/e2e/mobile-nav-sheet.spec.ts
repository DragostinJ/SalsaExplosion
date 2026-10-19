import { test, expect } from "@playwright/test";

test.describe("B4: Responsive Mobile Navigation Sheet", () => {
  test("opens slide-in drawer on mobile (375px), verifies personas, and closes on Escape", async ({ page }) => {
    // Set mobile viewport (iPhone SE / standard mobile)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard/schedule");
    await page.waitForLoadState("domcontentloaded");

    // Hamburger button should be visible on mobile
    const hamburgerBtn = page.getByRole("button", { name: /open mobile navigation menu/i });
    await expect(hamburgerBtn).toBeVisible();

    // Click hamburger to open drawer
    await hamburgerBtn.click();

    // Drawer modal dialog should be visible
    const sheetDialog = page.getByRole("dialog", { name: /mobile navigation menu/i });
    await expect(sheetDialog).toBeVisible();

    // Verify Dancer persona links exist
    await expect(sheetDialog.getByText(/dancer workspace/i)).toBeVisible();
    await expect(sheetDialog.getByRole("link", { name: /schedule & booking/i })).toBeVisible();
    await expect(sheetDialog.getByRole("link", { name: /bournemouth venues/i })).toBeVisible();

    // Take screenshot of mobile drawer open
    await page.screenshot({ path: "test-results/mobile-nav-375px.png" });

    // Press Escape to verify accessible dismiss
    await page.keyboard.press("Escape");
    await expect(sheetDialog).not.toBeVisible();
  });

  test("opens slide-in drawer on tablet (768px) and closes on close button click", async ({ page }) => {
    // Set tablet viewport (iPad Mini / Portrait Tablet)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard/schedule");
    await page.waitForLoadState("domcontentloaded");

    const hamburgerBtn = page.getByRole("button", { name: /open mobile navigation menu/i });
    await expect(hamburgerBtn).toBeVisible();
    await hamburgerBtn.click();

    const sheetDialog = page.getByRole("dialog", { name: /mobile navigation menu/i });
    await expect(sheetDialog).toBeVisible();

    // Take screenshot of tablet drawer open
    await page.screenshot({ path: "test-results/mobile-nav-768px.png" });

    // Click close button
    const closeBtn = page.getByRole("button", { name: /close menu/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(sheetDialog).not.toBeVisible();
  });
});
