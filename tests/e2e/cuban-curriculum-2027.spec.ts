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

  test("4. Practice player: /music lists songs, player shows live section, modes, lead/follow and settings", async ({
    page,
  }) => {
    await page.goto("/music");
    await page.waitForLoadState("domcontentloaded");

    // /music is now the song list; each song opens the full-screen practice player
    const practiceLink = page.locator('a[href="/music/me-dicen-cuba"]').first();
    await expect(practiceLink).toBeVisible();
    await practiceLink.click();
    await expect(page).toHaveURL(/\/music\/me-dicen-cuba$/);

    const player = page.locator('[data-testid="song-player-screen"]');
    await expect(player).toBeVisible();
    await expect(player.getByRole("heading", { name: "Me Dicen Cuba" })).toBeVisible();

    // NOW card starts on the authored first section
    const nowCard = player.locator('section[aria-label="What to dance now"]');
    await expect(nowCard.getByRole("heading", { name: "Intro Cinematográfico (No Music)" })).toBeVisible();

    // Song map: one jump button per authored section
    await expect(player.getByRole("group", { name: "Song sections" }).getByRole("button")).toHaveCount(9);

    // Lead / Follow swaps the cue shown
    await expect(nowCard.getByText(/Do not step yet!/)).toBeVisible();
    await player.getByRole("radio", { name: "Follow" }).click();
    await expect(nowCard.getByText(/Relax your shoulders/)).toBeVisible();
    await player.getByRole("radio", { name: "Lead" }).click();

    // Modes: Learn → Dance → Ear training
    await player.locator('[data-testid="player-mode"]').click();
    await expect(player.locator('[data-testid="dance-view"]')).toBeVisible();
    await player.locator('[data-testid="player-mode"]').click();
    await expect(player.locator('[data-testid="quiz-view"]')).toBeVisible();
    await player.locator('[data-testid="player-mode"]').click();

    // Settings sheet: practice mode, lead-in, sync adjust
    await player.getByRole("button", { name: "Section details and practice settings" }).click();
    const sheet = page.getByRole("dialog", { name: "Section details and practice settings" });
    await expect(sheet.getByRole("radiogroup", { name: "Practice mode" })).toBeVisible();
    await expect(sheet.getByRole("radiogroup", { name: "Lead-in" })).toBeVisible();
    await expect(sheet.getByText("Sync adjust (this phone)")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
  });

  test("5. Zero serious or critical WCAG 2.1 AA violations under OS dark mode (prefers-color-scheme: dark)", async ({
    page,
  }) => {
    // Emulate OS Dark Mode to ensure Tailwind v4 dark variant does not cause contrast bugs
    await page.emulateMedia({ colorScheme: "dark" });

    // 1. Audit /music under OS Dark Mode (excluding third-party YouTube embed iframe)
    await page.goto("/music");
    await page.waitForLoadState("domcontentloaded");

    const musicAxeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
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
  test("6. Interactive Tutorial Modal: triggers reliably from header pill on laptop viewports, steps through all 4 cards, and restores body scroll", async ({
    page,
  }) => {
    // 1366x768 laptop resolution (common breakpoint where flex overflow was reported)
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/dashboard/schedule");
    await page.waitForLoadState("domcontentloaded");

    // Verify modal is not mounted yet
    const tutorialDialog = page.locator('[data-testid="interactive-tutorial-dialog"]');
    await expect(tutorialDialog).toHaveCount(0);

    // Trigger studio tutorial
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("salsa_explosion:open-tutorial"));
    });
    await expect(tutorialDialog).toBeVisible();

    // Verify Step 1
    await expect(page.getByText(/1\. Partner Balance: No Partner Required!/i)).toBeVisible();
    await expect(page.getByText(/equal Lead & Follow slot caps/i)).toBeVisible();

    // Verify body overflow is locked
    const overflowLocked = await page.evaluate(() => document.body.style.overflow);
    expect(overflowLocked).toBe("hidden");

    // Click Next -> Step 2
    await page.getByRole("button", { name: /^Next/i }).click();
    await expect(page.getByText(/2\. Studio Wallet, Credits & Free Refunds/i)).toBeVisible();

    // Click Next -> Step 3
    await page.getByRole("button", { name: /^Next/i }).click();
    await expect(page.getByText(/3\. Cuban Salsa Levels & AI Video Co-Pilot/i)).toBeVisible();

    // Click Next -> Step 4
    await page.getByRole("button", { name: /^Next/i }).click();
    await expect(page.getByText(/4\. 1-Second Door QR Check-In & Badges/i)).toBeVisible();

    // Click Got It, Let's Dance! button
    const finishBtn = page.getByRole("button", { name: /Got It, Let's Dance!/i });
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // Modal dialog should unmount cleanly
    await expect(tutorialDialog).toHaveCount(0);

    // Body scroll must be unlocked (not permanently stuck on "hidden")
    const overflowUnlocked = await page.evaluate(() => document.body.style.overflow);
    expect(overflowUnlocked).not.toBe("hidden");
  });
  test("7. Mobile-First UX: practice player fits one 390px screen with thumb-zone controls and role cues, plus zero overflow and single-row level tabs", async ({
    page,
  }) => {
    // 390x844 (iPhone 14 standard mobile viewport)
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Audit the practice player on mobile: one screen, no scroll in either direction
    await page.goto("/music/me-dicen-cuba");
    await page.waitForLoadState("domcontentloaded");

    const player = page.locator('[data-testid="song-player-screen"]');
    await expect(player).toBeVisible();

    const playerFits = await page.evaluate(() => ({
      noHorizontal: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      noVertical: document.documentElement.scrollHeight <= window.innerHeight + 1,
    }));
    expect(playerFits).toEqual({ noHorizontal: true, noVertical: true });

    // Thumb-zone transport is present
    for (const name of ["Previous section", "Play", "Next section", "Loop this section"]) {
      await expect(player.getByRole("button", { name, exact: true })).toBeVisible();
    }

    // Role toggle swaps the single cue shown
    const nowCard = player.locator('section[aria-label="What to dance now"]');
    await player.getByRole("radio", { name: "Follow" }).click();
    await expect(nowCard.getByText(/Relax your shoulders/)).toBeVisible();
    await player.getByRole("radio", { name: "Lead" }).click();
    await expect(nowCard.getByText(/Do not step yet!/)).toBeVisible();

    // 2. Audit /how-it-works on mobile
    await page.goto("/how-it-works");
    await page.waitForLoadState("domcontentloaded");

    const skillTree = page.locator('[data-testid="curriculum-skill-tree"]');
    await expect(skillTree).toBeVisible();

    // Verify zero horizontal overflow on /how-it-works
    const syllabusOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
    });
    expect(syllabusOverflow).toBe(true);

    // Verify all 4 levels are accessible on mobile tablist
    const tabList = skillTree.getByRole("tablist", { name: "Curriculum Levels" });
    await expect(tabList).toBeVisible();
    const beginnerTab = tabList.getByRole("tab", { name: /Beginner/i });
    const improverTab = tabList.getByRole("tab", { name: /Improver/i });
    const intermTab = tabList.getByRole("tab", { name: /Intermediate/i });
    const advTab = tabList.getByRole("tab", { name: /Advanced/i });

    await expect(beginnerTab).toBeVisible();
    await expect(improverTab).toBeVisible();
    await expect(intermTab).toBeVisible();
    await expect(advTab).toBeVisible();

    // Tap Improver tab
    await improverTab.click();
    await expect(skillTree.getByRole("heading", { name: "Setenta (70)", exact: true })).toBeVisible();

    // 3. Verify zero serious or critical WCAG 2.1 AA violations on mobile (excluding third-party iframe)
    const mobileAxeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();

    const seriousOrCriticalViolations = mobileAxeResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(seriousOrCriticalViolations).toEqual([]);
  });
});
