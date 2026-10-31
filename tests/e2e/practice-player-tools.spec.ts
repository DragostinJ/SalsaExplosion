import { test, expect } from "@playwright/test";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { linkedStartSeconds } from "@/lib/music/section-link";
import { formatSongTime } from "@/lib/music/song-timing";

test.describe("Practice Player Tools & Engagement E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(45000);
  });

  // Task 1.a: /music at 390x844 mobile viewport
  test("1a. /music on 390x844 mobile viewport fits without horizontal overflow and displays style chips", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/music", { waitUntil: "domcontentloaded" });

    // Verify zero horizontal page overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);

    // Verify song list items exist and style chips are visible
    const songLinks = page.locator('section[aria-labelledby="practice-mode-heading"] li a');
    const songCount = await songLinks.count();
    expect(songCount).toBeGreaterThan(0);

    for (let i = 0; i < songCount; i++) {
      const row = songLinks.nth(i);
      await expect(row).toBeVisible();

      // Verify chevron icon is visible within the row
      const chevron = row.locator("svg");
      await expect(chevron.last()).toBeVisible();

      // Verify style chip ("Timba", "Cuban Salsa", "Puerto Rican Salsa", etc.)
      const styleChip = row.locator("span.rounded-full");
      await expect(styleChip).toBeVisible();
      const chipText = await styleChip.textContent();
      expect(chipText?.trim().length).toBeGreaterThan(0);
    }
  });

  // Task 1.b: Section links on /music/tremenda-pinta?section=<despelote-id>
  test("1b. /music/tremenda-pinta section link shows NOW card as Section preview and iframe start time", async ({
    page,
  }) => {
    const tremendaPinta = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "tremenda-pinta");
    expect(tremendaPinta).toBeDefined();
    const despeloteIndex = tremendaPinta!.segments.findIndex(
      (seg) => seg.danceGear === "Despelote / Reparto" || seg.sectionName.toLowerCase().includes("despelote")
    );
    expect(despeloteIndex).toBeGreaterThan(0);
    const targetSegment = tremendaPinta!.segments[despeloteIndex];
    const expectedStartParam = linkedStartSeconds(tremendaPinta!.segments, despeloteIndex);

    await page.goto(`/music/${tremendaPinta!.id}?section=${targetSegment.id}`, {
      waitUntil: "domcontentloaded",
    });

    // The NOW card should indicate "Section preview"
    const nowSection = page.locator('section[aria-label="Section preview"]');
    await expect(nowSection).toBeVisible();

    // Verify section name is visible
    await expect(page.getByText(targetSegment.sectionName).first()).toBeVisible();

    // Verify YouTube iframe src contains the dynamically computed start parameter
    const iframe = page.locator("iframe");
    await expect(iframe).toBeAttached();
    const src = await iframe.getAttribute("src");
    expect(src).toContain(`start=${expectedStartParam}`);
  });

  // Task 1.c: Share button in details sheet
  test("1c. Info sheet contains 'Share this section' and copies link with ?section=<id> to clipboard", async ({
    page,
    context,
  }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // Override navigator.share to undefined to test clipboard fallback cleanly
    await page.addInitScript(() => {
      delete (navigator as unknown as { share?: unknown }).share;
    });

    await page.goto("/music/me-dicen-cuba", { waitUntil: "domcontentloaded" });

    // Open Section details sheet using the info button
    const infoButton = page.getByRole("button", { name: /Section details and practice settings/i });
    await expect(infoButton).toBeVisible();
    await infoButton.click();

    // The dialog should be open
    const sheet = page.getByRole("dialog", { name: /Section details and practice settings/i });
    await expect(sheet).toBeVisible();

    // Click "Share this section" button
    const shareButton = sheet.getByRole("button", { name: /Share this section/i });
    await expect(shareButton).toBeVisible();
    await shareButton.click();

    // Button should transition text to "Link copied"
    await expect(sheet.getByText("Link copied")).toBeVisible();

    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("/music/me-dicen-cuba?section=");
  });

  // Task 1.d: Calibration mode (?calibrate=1)
  test("1d. /music/me-dicen-cuba?calibrate=1 allows nudging section boundary and undoing changes", async ({
    page,
  }) => {
    // Ensure clean localStorage
    await page.addInitScript(() => {
      localStorage.clear();
    });

    const meDicenCuba = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "me-dicen-cuba");
    expect(meDicenCuba).toBeDefined();
    // Calibration selects index 1 by default (second section)
    const sectionIndex = 1;
    const initialSegment = meDicenCuba!.segments[sectionIndex];
    const initialStart = initialSegment.startTimeSeconds;
    const initialFormatted = formatSongTime(initialStart, true);
    const nudgedFormatted = formatSongTime(initialStart + 1, true);
    const nudgedMapLabel = `at ${formatSongTime(initialStart + 1)}`;

    await page.goto(`/music/${meDicenCuba!.id}?calibrate=1`, { waitUntil: "domcontentloaded" });

    const nudgeContainer = page.locator('[data-testid="calibration-nudge"]');
    await expect(nudgeContainer).toBeVisible();

    // Authored start of section 2
    await expect(nudgeContainer.getByText(initialFormatted)).toBeVisible();

    // Click "+1s" nudge button
    const plusOneButton = nudgeContainer.getByRole("button", { name: "+1s" });
    await expect(plusOneButton).toBeVisible();
    await plusOneButton.click();

    // Nudge row updates to new time (+1.0s)
    await expect(nudgeContainer.getByText(nudgedFormatted)).toBeVisible();
    await expect(nudgeContainer.getByText("(+1.0s)")).toBeVisible();

    // Song map button for that section now announces the nudged start time
    const sectionMapButton = page.locator(`button[aria-label*="${nudgedMapLabel}"]`);
    await expect(sectionMapButton.first()).toBeVisible();

    // Click "Undo all changes" button
    const undoButton = nudgeContainer.getByRole("button", { name: /Undo all changes/i });
    await expect(undoButton).toBeVisible();
    await undoButton.click();

    // Restores original start time
    await expect(nudgeContainer.getByText(initialFormatted)).toBeVisible();
  });

  // Task 1.e: Without ?calibrate=1, ignores leftover calibration in localStorage
  test("1e. Without ?calibrate=1, leftover overrides in localStorage are ignored", async ({
    page,
  }) => {
    const meDicenCuba = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "me-dicen-cuba");
    expect(meDicenCuba).toBeDefined();
    const sectionIndex = 1;
    const segment = meDicenCuba!.segments[sectionIndex];
    const authoredMapLabel = `at ${formatSongTime(segment.startTimeSeconds)}`;
    const syntheticOverrideTime = segment.startTimeSeconds + 7;
    const overriddenMapLabel = `at ${formatSongTime(syntheticOverrideTime)}`;

    // Seed localStorage with a mock calibration override
    await page.addInitScript(
      ({ songId, segId, overrideTime }) => {
        localStorage.setItem(
          `ritmoflow:calibration:${songId}`,
          JSON.stringify({ [segId]: overrideTime })
        );
      },
      {
        songId: meDicenCuba!.id,
        segId: segment.id,
        overrideTime: syntheticOverrideTime,
      }
    );

    await page.goto(`/music/${meDicenCuba!.id}`, { waitUntil: "domcontentloaded" });

    // The calibration panel should not be rendered
    const nudgeContainer = page.locator('[data-testid="calibration-nudge"]');
    await expect(nudgeContainer).toHaveCount(0);

    // The map button for section 2 must still reflect authored start time (not synthetic override)
    const sectionMapButton = page.locator(`button[aria-label*="${authoredMapLabel}"]`);
    await expect(sectionMapButton.first()).toBeVisible();

    const overriddenButton = page.locator(`button[aria-label*="${overriddenMapLabel}"]`);
    await expect(overriddenButton).toHaveCount(0);
  });

  // Task 1.f: API route security tests (/api/cron/daily and /api/email/unsubscribe)
  test("1f. /api/cron/daily answers 401 without auth, and /api/email/unsubscribe handles invalid tokens", async ({
    page,
    request,
  }) => {
    // 1. /api/cron/daily without Authorization header returns 401 Unauthorized
    const cronRes = await request.get("/api/cron/daily");
    expect(cronRes.status()).toBe(401);
    const cronJson = await cronRes.json();
    expect(cronJson.error).toBe("unauthorized");

    // 2. /api/email/unsubscribe with invalid query params renders invalid link message
    await page.goto("/api/email/unsubscribe?u=invalid-user&t=invalid-token", {
      waitUntil: "domcontentloaded",
    });
    const bodyText = await page.textContent("body");
    expect(bodyText).toContain("isn't valid");
  });

  // Task 1.g: Role redirection for signed-out visitors (/instructor/practice-insights and /instructor/song-maps)
  test("1g. /instructor/practice-insights and /instructor/song-maps safely redirect signed-out visitors", async ({
    page,
  }) => {
    // Practice insights
    const resInsights = await page.goto("/instructor/practice-insights", {
      waitUntil: "domcontentloaded",
    });
    expect(resInsights?.status()).not.toBe(500);
    expect(page.url()).toMatch(/sign-in/);

    // Song maps importer
    const resMaps = await page.goto("/instructor/song-maps", {
      waitUntil: "domcontentloaded",
    });
    expect(resMaps?.status()).not.toBe(500);
    expect(page.url()).toMatch(/sign-in/);
  });
});

