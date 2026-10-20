import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("M6: 2027 Cuban Salsa Curriculum Skill Tree & Gears Matrix E2E", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(45000);
  });

  test("1. Renders skill tree, gears matrix, level tabs, and un-confuser diagnostics", async ({
    page,
  }) => {
    await page.goto("/how-it-works");
    await page.waitForLoadState("domcontentloaded");

    // 1. Skill tree and gears matrix sections exist
    const skillTree = page.locator('[data-testid="curriculum-skill-tree"]');
    const gearsMatrix = page.locator('[data-testid="cuban-dance-gears-matrix"]');

    await expect(skillTree).toBeVisible();
    await expect(gearsMatrix).toBeVisible();

    // 2. Beginner skills are shown by default
    await expect(skillTree.getByRole("heading", { name: "Guapea", exact: true })).toBeVisible();
    await expect(skillTree.getByRole("heading", { name: "Dile Que No", exact: true })).toBeVisible();

    // 3. Switch level tab to Improver
    const improverTab = skillTree.getByRole("tab", { name: /improver/i });
    await improverTab.click();
    await expect(skillTree.getByRole("heading", { name: "Setenta (70)", exact: true })).toBeVisible();
    await expect(skillTree.getByRole("heading", { name: /vac[ií]lala/i })).toBeVisible();

    // 4. Test Un-Confuser Diagnostics and interactive practice status toggle
    await expect(
      skillTree.getByText(/un-confuser diagnostic:/i).first()
    ).toBeVisible();

    const statusToggleBtn = skillTree
      .getByRole("button", { name: /not started|practicing now|mastered/i })
      .first();
    await expect(statusToggleBtn).toBeVisible();
    await statusToggleBtn.click();
    await expect(
      skillTree.getByRole("button", { name: /practicing now/i }).first()
    ).toBeVisible();

    // 5. Test Pillar Filter: click "Solo Footwork & Shines"
    const soloPillar = skillTree.getByRole("button", {
      name: /solo footwork & shines/i,
    });
    if (await soloPillar.isVisible()) {
      await soloPillar.click();
      // Should show solo shines/body movement
      await expect(skillTree.getByText(/rumba guaguancó basics/i)).toBeVisible();
    }

    // 6. Test Timba 4-Phase Song Anatomy in gearsMatrix
    await expect(
      gearsMatrix.getByText(/timba song anatomy timeline/i)
    ).toBeVisible();

    // Click "Montuno" phase button
    const montunoBtn = gearsMatrix.getByRole("button", { name: /montuno/i }).first();
    await montunoBtn.click();
    await expect(
      gearsMatrix.getByText("2. The Call & Response (El Montuno)")
    ).toBeVisible();

    // Click "Bomba/Presión" phase button
    const bombaBtn = gearsMatrix.getByRole("button", { name: /bomba/i }).first();
    await bombaBtn.click();
    await expect(
      gearsMatrix.getByText("4. The Bass Drop & Street Explosion (La Bomba / Presión)")
    ).toBeVisible();
  });

  test("2. Zero horizontal overflow on 390px mobile viewport (iPhone 14)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/how-it-works");
    await page.waitForLoadState("domcontentloaded");

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        innerWidth: window.innerWidth,
      };
    });

    expect(
      overflow.scrollWidth,
      `Horizontal overflow detected on /how-it-works (scrollWidth: ${overflow.scrollWidth} > innerWidth: ${overflow.innerWidth})`
    ).toBeLessThanOrEqual(overflow.innerWidth);
  });

  test("3. Zero serious or critical WCAG 2.1 AA accessibility violations", async ({
    page,
  }) => {
    await page.goto("/how-it-works");
    await page.waitForLoadState("domcontentloaded");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const seriousOrCriticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(seriousOrCriticalViolations).toEqual([]);
  });
});
