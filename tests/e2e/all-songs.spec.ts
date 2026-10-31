import { test, expect } from "@playwright/test";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";

test.describe("All Songs Browser E2E Suite", () => {
  // Give ample timeout for looping through all 14 songs on production build
  test.setTimeout(180_000);

  test("verifies /music lists every song exactly once and each song player satisfies zero-scroll and preview integrity", async ({
    page,
  }) => {
    // 1. Verify /music catalog lists every song exactly once in the practice player list
    await page.setViewportSize({ width: 390, height: 844 });
    const catalogResponse = await page.goto("/music", { waitUntil: "domcontentloaded" });
    expect(catalogResponse?.status()).toBeLessThan(400);

    const practiceSection = page.locator('section[aria-labelledby="practice-mode-heading"]');
    await expect(practiceSection).toBeVisible();

    const songCards = practiceSection.locator("li a");
    expect(await songCards.count()).toBe(TIMBA_SONG_ANATOMY_DATA.length);

    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      const songLink = practiceSection.locator(`a[href="/music/${song.id}"]`);
      const count = await songLink.count();
      expect(
        count,
        `Expected song ${song.id} to be listed exactly once on /music practice list, but found ${count}`
      ).toBe(1);
    }

    // Set up console error listener
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => {
      consoleErrors.push(`[pageerror] ${err.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore third-party YouTube / Google cross-origin iframe network noise
        if (
          text.includes("doubleclick.net") ||
          text.includes("googleads") ||
          text.includes("youtube.com/api/stats") ||
          text.includes("ytimg.com") ||
          text.includes("play.google.com") ||
          text.includes("ERR_BLOCKED_BY_CLIENT")
        ) {
          return;
        }
        consoleErrors.push(`[console.error] ${text}`);
      }
    });

    // 2. Loop over every song in TIMBA_SONG_ANATOMY_DATA
    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      consoleErrors.length = 0;
      const firstSegment = song.segments[0];
      const middleIndex = Math.floor(song.segments.length / 2);
      const middleSegment = song.segments[middleIndex];

      // Step A: /music/<id> loads without 500 or console errors
      const response = await page.goto(`/music/${song.id}`, { waitUntil: "load" });
      expect(
        response?.status(),
        `Expected 200 OK for /music/${song.id}, received ${response?.status()}`
      ).toBeLessThan(400);

      // Wait for load plus ~2 seconds (YouTube iframe never goes networkidle)
      await page.waitForTimeout(2000);

      expect(
        consoleErrors,
        `Console errors encountered on /music/${song.id}: ${consoleErrors.join("; ")}`
      ).toEqual([]);

      // Step B: The NOW card shows the first section's sectionName
      const nowCard = page.locator('section[aria-label="What to dance now"]');
      await expect(nowCard).toBeVisible();
      await expect(nowCard.getByText(firstSegment.sectionName).first()).toBeVisible();

      // Step C: Zero scroll: document.documentElement.scrollHeight <= innerHeight and scrollWidth <= innerWidth
      const dimensions = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));

      expect(
        dimensions.scrollHeight,
        `Song ${song.id} has vertical scroll overflow: scrollHeight ${dimensions.scrollHeight} > innerHeight ${dimensions.innerHeight}`
      ).toBeLessThanOrEqual(dimensions.innerHeight);

      expect(
        dimensions.scrollWidth,
        `Song ${song.id} has horizontal scroll overflow: scrollWidth ${dimensions.scrollWidth} > innerWidth ${dimensions.innerWidth}`
      ).toBeLessThanOrEqual(dimensions.innerWidth);

      // Step D: /music/<id>?section=<id of middle section> shows that section as preview
      const previewResponse = await page.goto(`/music/${song.id}?section=${middleSegment.id}`, {
        waitUntil: "load",
      });
      expect(
        previewResponse?.status(),
        `Expected 200 OK for preview on /music/${song.id}?section=${middleSegment.id}, received ${previewResponse?.status()}`
      ).toBeLessThan(400);

      await page.waitForTimeout(500);

      const previewCard = page.locator('section[aria-label="Section preview"]');
      await expect(previewCard).toBeVisible();
      await expect(previewCard.getByText(middleSegment.sectionName).first()).toBeVisible();

      const previewDimensions = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));

      expect(
        previewDimensions.scrollHeight,
        `Song ${song.id} preview has vertical scroll overflow: scrollHeight ${previewDimensions.scrollHeight} > innerHeight ${previewDimensions.innerHeight}`
      ).toBeLessThanOrEqual(previewDimensions.innerHeight);

      expect(
        previewDimensions.scrollWidth,
        `Song ${song.id} preview has horizontal scroll overflow: scrollWidth ${previewDimensions.scrollWidth} > innerWidth ${previewDimensions.innerWidth}`
      ).toBeLessThanOrEqual(previewDimensions.innerWidth);
    }
  });
});
