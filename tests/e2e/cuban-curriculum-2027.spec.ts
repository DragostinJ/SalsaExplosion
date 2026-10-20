import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("H5: Progressive Disclosure, Reassurance Banner & Accessibility E2E", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(45000);
  });

  test("1. Renders reassurance banner, first-night focus mode, collapsible diagnostics, and dance gears drawer", async ({
    page,
  }) => {
    await page.goto("/how-it-works");
    await page.waitForLoadState("domcontentloaded");

    // 1. Skill tree and gears matrix sections exist
    const skillTree = page.locator('[data-testid="curriculum-skill-tree"]');
    const gearsMatrix = page.locator('[data-testid="cuban-dance-gears-matrix"]');

    await expect(skillTree).toBeVisible();
    await expect(gearsMatrix).toBeVisible();

    // 2. Reassurance banner from Maestro Enrique is rendered
    const reassuranceBanner = page.locator('[data-testid="curriculum-reassurance-banner"]');
    await expect(reassuranceBanner).toBeVisible();
    await expect(reassuranceBanner.getByText(/don't feel overwhelmed/i)).toBeVisible();
    await expect(reassuranceBanner.getByText(/your first night at boh studios/i)).toBeVisible();

    // 3. Test "Focus Mode: First-Night Essentials (3 Moves)"
    const focusModeBtn = reassuranceBanner.getByRole("button", {
      name: /focus mode/i,
    });
    await expect(focusModeBtn).toBeVisible();
    await focusModeBtn.click();

    // In focus mode, verify the 3 starter moves are shown
    await expect(skillTree.getByRole("heading", { name: "Paso Básico, Lateral y Atrás", exact: true })).toBeVisible();
    await expect(skillTree.getByRole("heading", { name: "Guapea", exact: true })).toBeVisible();
    await expect(skillTree.getByRole("heading", { name: "Dile Que No", exact: true })).toBeVisible();

    // Toggle back to full mode
    await focusModeBtn.click();

    // 4. Switch level tab to Improver
    const improverTab = skillTree.getByRole("tab", { name: /improver/i });
    await improverTab.click();
    await expect(skillTree.getByRole("heading", { name: "Setenta (70)", exact: true })).toBeVisible();
    await expect(skillTree.getByRole("heading", { name: /vac[ií]lala/i })).toBeVisible();

    // 5. Test Progressive Disclosure on skill cards: Un-confuser is initially collapsed
    const detailToggle = skillTree.locator('[data-testid="toggle-skill-details"]').first();
    await expect(detailToggle).toBeVisible();
    await detailToggle.click();

    // Now Un-Confuser Diagnostic should be visible
    await expect(skillTree.getByText(/un-confuser diagnostic:/i).first()).toBeVisible();

    // Test interactive practice status toggle on Setenta
    const statusToggleBtn = skillTree
      .getByRole("button", { name: /not started|practicing now|mastered/i })
      .first();
    await expect(statusToggleBtn).toBeVisible();
    await statusToggleBtn.click();
    await expect(
      skillTree.getByRole("button", { name: /practicing now/i }).first()
    ).toBeVisible();

    // 6. Test "Expand All Maestro Tips" toolbar button
    const expandAllBtn = skillTree.locator('[data-testid="toggle-all-maestro-tips"]');
    await expect(expandAllBtn).toBeVisible();
    await expandAllBtn.click();
    await expect(skillTree.getByText(/collapse all maestro tips/i)).toBeVisible();

    // 7. Test On-Demand Collapsible Gears Matrix
    // On /how-it-works, gears matrix starts collapsed as a teaser card
    const openGearsBtn = gearsMatrix.locator('[data-testid="toggle-dance-gears-guide"]');
    await expect(openGearsBtn).toBeVisible();
    await expect(gearsMatrix.getByText(/curious why advanced dancers change styles/i)).toBeVisible();

    // Click to open the full interactive guide
    await openGearsBtn.click();
    await expect(gearsMatrix.getByText(/timba song anatomy timeline/i)).toBeVisible();

    // Test Phase Switching in expanded guide
    const montunoBtn = gearsMatrix.getByRole("button", { name: /montuno/i }).first();
    await montunoBtn.click();
    await expect(gearsMatrix.getByText("2. The Call & Response (El Montuno)")).toBeVisible();

    const bombaBtn = gearsMatrix.getByRole("button", { name: /bomba/i }).first();
    await bombaBtn.click();
    await expect(gearsMatrix.getByText("4. The Bass Drop & Street Explosion (La Bomba / Presión)")).toBeVisible();
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

  test("4. Interactive Timba Song Anatomy Player on /music: switches tracks, scrubs timeline, and inspects moves", async ({
    page,
  }) => {
    await page.goto("/music");
    await page.waitForLoadState("domcontentloaded");

    const player = page.locator('[data-testid="timba-song-anatomy-player"]');
    await expect(player).toBeVisible();

    // Verify initial song is Me Dicen Cuba
    await expect(player.getByRole("heading", { name: "Me Dicen Cuba" })).toBeVisible();
    await expect(player.getByText("2-3 Son Clave")).toBeVisible();

    // Verify timeline segments exist (5 segments for Me Dicen Cuba)
    const seg0 = player.locator('[data-testid="timeline-segment-0"]');
    const seg2 = player.locator('[data-testid="timeline-segment-2"]');
    await expect(seg0).toBeVisible();
    await expect(seg2).toBeVisible();

    // Click segment 2 (Montuno)
    await seg2.click();

    // Verify HUD updates to Montuno
    const hud = player.locator('[data-testid="active-segment-hud"]');
    await expect(hud).toBeVisible();
    await expect(hud.getByText("Montuno")).toBeVisible();
    await expect(hud.getByText("Casino (Flow)")).toBeVisible();

    // Verify Un-Confuser alert is rendered
    const alert = player.locator('[data-testid="un-confuser-alert"]');
    await expect(alert).toBeVisible();

    // Verify clickable move pills are present and click one
    const movePill = player.locator('[data-testid^="move-pill-"]').first();
    await expect(movePill).toBeVisible();
    await movePill.click();

    // Verify inline move preview card opens
    const moveCard = player.locator('[data-testid="move-inspector-card"]');
    await expect(moveCard).toBeVisible();
    await expect(moveCard.getByText(/un-confuser tip/i)).toBeVisible();

    // Switch to "La Cosa Mala"
    const laCosaMalaTab = player.locator('[data-testid="select-song-la-cosa-mala"]');
    await expect(laCosaMalaTab).toBeVisible();
    await laCosaMalaTab.click();

    // Verify La Cosa Mala metadata and 8 segments
    await expect(player.getByRole("heading", { name: "La Cosa Mala" })).toBeVisible();
    await expect(player.getByText("2-3 Rumba Clave")).toBeVisible();
    const seg7 = player.locator('[data-testid="timeline-segment-7"]');
    await expect(seg7).toBeVisible();

    // Verify 8-Count Dancer Beat Bar exists
    const beatBar = player.locator('[data-testid="dancer-beat-bar"]');
    await expect(beatBar).toBeVisible();
    await expect(beatBar.getByText(/dancer rhythm bar/i)).toBeVisible();

    // Verify Clave Audio Helper Toggle works
    const claveBtn = player.locator('[data-testid="toggle-rhythm-audio"]');
    await expect(claveBtn).toBeVisible();
    await expect(claveBtn).toContainText("Clave Click: OFF");
    await claveBtn.click();
    await expect(claveBtn).toContainText("Clave Click: ON");
    await claveBtn.click();
    await expect(claveBtn).toContainText("Clave Click: OFF");

    // Verify In-Page Original Song Player Drawer Toggle works
    const streamToggle = player.locator('[data-testid="toggle-song-stream"]');
    await expect(streamToggle).toBeVisible();
    await streamToggle.click();

    const videoContainer = player.locator('[data-testid="embedded-youtube-player-container"]');
    await expect(videoContainer).toBeVisible();
    await expect(videoContainer.locator('[data-testid="youtube-iframe"]')).toBeVisible();

    await streamToggle.click();
    await expect(videoContainer).not.toBeVisible();

    // Verify zero serious or critical accessibility violations on /music
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const seriousOrCriticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(seriousOrCriticalViolations).toEqual([]);
  });

  test("5. Zero serious or critical WCAG 2.1 AA violations under OS dark mode (prefers-color-scheme: dark)", async ({
    page,
  }) => {
    // Emulate OS Dark Mode to ensure Tailwind v4 dark variant does not cause contrast bugs
    await page.emulateMedia({ colorScheme: "dark" });

    // 1. Audit /music under OS Dark Mode
    await page.goto("/music");
    await page.waitForLoadState("domcontentloaded");

    const musicAxeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const musicViolations = musicAxeResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(musicViolations).toEqual([]);

    // 2. Audit /dashboard/progression under OS Dark Mode
    await page.goto("/dashboard/progression");
    await page.waitForLoadState("domcontentloaded");

    const progressionAxeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const progressionViolations = progressionAxeResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(progressionViolations).toEqual([]);
  });
});
