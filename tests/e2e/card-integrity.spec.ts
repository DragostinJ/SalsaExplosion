import { test, expect, webkit, type Page } from "@playwright/test";
import { blockingProblems, diagnosePage, formatProblems, saveProblemShot, settlePage } from "./helpers/card-doctor";
import { upcomingCanonicalEvents } from "@/lib/academy-data";
import { getPublishedMoves } from "@/lib/moves/move-library";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";

const STATIC_ROUTES = [
  "/",
  "/classes",
  "/events",
  "/pricing",
  "/about",
  "/venues",
  "/private-lessons",
  "/how-it-works",
  "/terms",
  "/moves",
  "/rueda",
  "/rueda/tarjetas",
  "/music",
  "/cartel",
  "/sign-in",
  "/sign-up",
  "/this-page-does-not-exist",
];

const PHONE = { width: 390, height: 844 };
const SMALL_PHONE = { width: 320, height: 568 };
const DESKTOP = { width: 1440, height: 900 };
const ALL_WIDTHS = [
  SMALL_PHONE,
  { width: 360, height: 740 },
  PHONE,
  { width: 430, height: 932 },
  { width: 640, height: 900 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  DESKTOP,
  { width: 1920, height: 1080 },
];

// Read from the data, so the spec keeps working as events pass and the library grows
const eventRoutes = upcomingCanonicalEvents().map((event) => `/events/${event.slug}`);
const sampleRoutes = [...eventRoutes, `/moves/${getPublishedMoves()[0].id}`, `/music/${TIMBA_SONG_ANATOMY_DATA[0].id}`];

async function expectClean(page: Page, route: string, width: number) {
  await settlePage(page, route);
  const problems = blockingProblems(await diagnosePage(page));
  if (problems.length > 0) await saveProblemShot(page, route, width);
  expect(problems, formatProblems(route, width, problems)).toEqual([]);
}

test.describe("Card integrity", () => {
  if (!process.env.FULL_SWEEP) {
    for (const size of [PHONE, DESKTOP]) {
      test.describe(`${size.width}px`, () => {
        test.use({ viewport: size });
        for (const route of STATIC_ROUTES) {
          test(`static ${route}`, async ({ page }) => {
            await expectClean(page, route, size.width);
          });
        }
      });
    }
    for (const size of [SMALL_PHONE, PHONE, DESKTOP]) {
      test.describe(`${size.width}px, pages built from data`, () => {
        test.use({ viewport: size });
        for (const route of sampleRoutes) {
          test(route, async ({ page }) => {
            await expectClean(page, route, size.width);
          });
        }
      });
    }
    return;
  }

  // FULL_SWEEP=1: everything. About 25 minutes on a production build.
  async function sweep(page: Page, routes: readonly string[], sizes: readonly { width: number; height: number }[], options: { checkOverlap?: boolean; scroll?: boolean } = {}) {
    const report: string[] = [];
    for (const size of sizes) {
      await page.setViewportSize(size);
      for (const route of routes) {
        await settlePage(page, route, { scroll: options.scroll });
        const problems = blockingProblems(await diagnosePage(page, { checkOverlap: options.checkOverlap }));
        if (problems.length > 0) {
          await saveProblemShot(page, route, size.width);
          report.push(formatProblems(route, size.width, problems));
        }
      }
    }
    expect(report, report.join("\n")).toEqual([]);
  }

  test.beforeEach(async ({ context }) => {
    test.setTimeout(0);
    // Layout doesn't depend on the embed, so don't load it hundreds of times
    await context.route(/youtube\.com|youtube-nocookie\.com|ytimg\.com|googlevideo\.com/, (route) => route.abort());
  });

  test("static routes at 10 widths", async ({ page }) => {
    await sweep(page, STATIC_ROUTES, ALL_WIDTHS);
  });

  test("every event", async ({ page, request }) => {
    const html = await (await request.get("/events")).text();
    const routes = [...new Set([...html.matchAll(/href="(\/events\/[a-z0-9-]+)/g)].map((m) => m[1]))];
    expect(routes.length).toBeGreaterThan(0);
    await sweep(page, routes, [SMALL_PHONE, { width: 360, height: 740 }, PHONE, { width: 768, height: 1024 }, DESKTOP]);
  });

  test("every move", async ({ page }) => {
    await sweep(page, getPublishedMoves().map((move) => `/moves/${move.id}`), [SMALL_PHONE, PHONE, DESKTOP], { checkOverlap: false });
  });

  test("every section of every song stays on one screen", async ({ page }) => {
    const routes = TIMBA_SONG_ANATOMY_DATA.flatMap((song) => [
      `/music/${song.id}`,
      ...song.segments.slice(1).map((segment) => `/music/${song.id}?section=${encodeURIComponent(segment.id)}`),
    ]);
    const tooTall: string[] = [];
    for (const size of [PHONE, { width: 360, height: 640 }, SMALL_PHONE]) {
      await page.setViewportSize(size);
      for (const route of routes) {
        await settlePage(page, route, { scroll: false });
        await page.locator("[data-testid='song-player-screen']").waitFor();
        const diagnosis = await diagnosePage(page, { checkOverlap: false });
        if (diagnosis.scrollHeight > diagnosis.innerHeight + 1) tooTall.push(`${route} at ${size.width}x${size.height}: ${diagnosis.scrollHeight}px`);
      }
    }
    expect(tooTall, tooTall.join("\n")).toEqual([]);
  });

  test("iPhone browser", async () => {
    const browser = await webkit.launch();
    const context = await browser.newContext({ viewport: PHONE, baseURL: test.info().project.use.baseURL });
    const page = await context.newPage();
    await sweep(page, [...STATIC_ROUTES, ...sampleRoutes], [PHONE, SMALL_PHONE]);
    await browser.close();
  });

  test("large text setting, listed rather than failed", async ({ page }) => {
    for (const size of [{ width: 360, height: 740 }, PHONE]) {
      await page.setViewportSize(size);
      for (const percent of [125, 150]) {
        for (const route of [...STATIC_ROUTES, ...sampleRoutes]) {
          await settlePage(page, route);
          await page.evaluate((value) => {
            document.documentElement.style.fontSize = `${value}%`;
          }, percent);
          await page.waitForTimeout(100);
          const problems = blockingProblems(await diagnosePage(page, { checkOverlap: false }));
          if (problems.length > 0) test.info().annotations.push({ type: `large text ${percent}% at ${size.width}px`, description: formatProblems(route, size.width, problems) });
        }
      }
    }
  });
});
