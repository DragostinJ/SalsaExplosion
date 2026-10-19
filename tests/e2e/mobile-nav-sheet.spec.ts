import { test, expect } from "@playwright/test";

test.describe("B4 & M8: Responsive Mobile Navigation Sheet & Full Viewport assertions", () => {
  test("opens slide-in drawer on mobile (375x812), verifies bounding box height >= 750px, persona routes, and closes on Escape", async ({ page }) => {
    // Set standard mobile viewport (iPhone X/12/13/14: 375x812)
    await page.setViewportSize({ width: 375, height: 812 });
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

    // Assert drawer panel takes the full viewport height (>= 750px on an 812px height screen)
    const drawerPanel = page.getByTestId("mobile-nav-panel");
    await expect(drawerPanel).toBeVisible();
    const box = await drawerPanel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(750);

    // Verify Dancer persona links exist and are visible
    await expect(sheetDialog.getByText(/dancer workspace/i)).toBeVisible();
    await expect(sheetDialog.getByRole("link", { name: /schedule & booking/i })).toBeVisible();
    await expect(sheetDialog.getByRole("link", { name: /bournemouth venues/i })).toBeVisible();
    await expect(sheetDialog.getByRole("link", { name: /rueda call dictionary/i })).toBeVisible();
    await expect(sheetDialog.getByRole("link", { name: /1-on-1 private lessons/i })).toBeVisible();
    await expect(sheetDialog.getByRole("link", { name: /cuban music/i })).toBeVisible();
    await expect(sheetDialog.getByRole("link", { name: /merch & dance shoes/i })).toBeVisible();
    await expect(sheetDialog.getByRole("link", { name: /how qr passes work/i })).toBeVisible();

    // Take screenshot of mobile drawer open
    await page.screenshot({ path: "test-results/mobile-nav-375px.png" });

    // Press Escape to verify accessible dismiss
    await page.keyboard.press("Escape");
    await expect(sheetDialog).not.toBeVisible();
  });

  test("opens slide-in drawer on tablet (768x1024) and closes on close button click", async ({ page }) => {
    // Set tablet viewport (iPad Mini / Portrait Tablet)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard/schedule");
    await page.waitForLoadState("domcontentloaded");

    const hamburgerBtn = page.getByRole("button", { name: /open mobile navigation menu/i });
    await expect(hamburgerBtn).toBeVisible();
    await hamburgerBtn.click();

    const sheetDialog = page.getByRole("dialog", { name: /mobile navigation menu/i });
    await expect(sheetDialog).toBeVisible();

    // Assert drawer panel bounding box height on tablet
    const drawerPanel = page.getByTestId("mobile-nav-panel");
    const box = await drawerPanel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(950);

    // Take screenshot of tablet drawer open
    await page.screenshot({ path: "test-results/mobile-nav-768px.png" });

    // Click close button
    const closeBtn = page.getByRole("button", { name: /close menu/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(sheetDialog).not.toBeVisible();
  });
});
