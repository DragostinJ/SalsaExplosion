import { test, expect } from "@playwright/test";
import { diagnosePage, type CardDoctorProblem } from "./helpers/card-doctor";
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

const DEFAULT_VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

const ALL_VIEWPORTS = [
  { name: "phone-320", width: 320, height: 568 },
  { name: "phone-360", width: 360, height: 740 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "phone-430", width: 430, height: 932 },
  { name: "tablet-640", width: 640, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

async function navigateAndSettle(page: import("@playwright/test").Page, path: string) {
  await page.goto(path, { waitUntil: "load", timeout: 45000 });
  // Wait for main container and resolved streaming content
  await page.locator("main, #main-content, body").first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  // Wait for headings to ensure Suspense streaming resolved
  await page.locator("h1, h2, h3").first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
  await page.evaluate(async () => {
    if (document.fonts) {
      await document.fonts.ready;
    }
  });
}

function formatProblem(p: CardDoctorProblem): string {
  return `[${p.kind}] on ${p.route} (${p.width}px): ${p.selector} -> "${p.textPreview}" (measured: ${JSON.stringify(p.measured)})`;
}

test.describe("Card Integrity & Layout Breakage Checker", () => {
  const isFullSweep = Boolean(process.env.FULL_SWEEP);

  if (!isFullSweep) {
    // ----------------------------------------------------
    // DEFAULT MODE (< 3 minutes in normal test suite)
    // ----------------------------------------------------
    for (const vp of DEFAULT_VIEWPORTS) {
      test.describe(`${vp.name} (${vp.width}px)`, () => {
        test.use({ viewport: { width: vp.width, height: vp.height } });

        for (const route of STATIC_ROUTES) {
          test(`checks card integrity on static route ${route}`, async ({ page }) => {
            await navigateAndSettle(page, route);
            const problems = await diagnosePage(page, route, vp.width, { takeScreenshots: true });
            if (problems.length > 0) {
              const summary = problems.map(formatProblem).join("\n");
              expect(problems, `Found ${problems.length} broken card/layout issue(s):\n${summary}`).toEqual([]);
            }
          });
        }

        // Sample key dynamic routes
        test("checks card integrity on sample event", async ({ page }) => {
          const route = "/events/sbk-night-extravaganza-nov-2026";
          await navigateAndSettle(page, route);
          const problems = await diagnosePage(page, route, vp.width, { takeScreenshots: true });
          expect(problems, problems.map(formatProblem).join("\n")).toEqual([]);
        });

        test("checks card integrity on sample move", async ({ page }) => {
          const route = "/moves/guapea";
          await navigateAndSettle(page, route);
          const problems = await diagnosePage(page, route, vp.width, { takeScreenshots: true });
          expect(problems, problems.map(formatProblem).join("\n")).toEqual([]);
        });

        test("checks card integrity on sample song", async ({ page }) => {
          const route = "/music/me-dicen-cuba";
          await navigateAndSettle(page, route);
          const problems = await diagnosePage(page, route, vp.width, { takeScreenshots: true });
          expect(problems, problems.map(formatProblem).join("\n")).toEqual([]);
        });
      });
    }
  } else {
    // ----------------------------------------------------
    // FULL_SWEEP=1 MODE (Tonight's exhaustive sweep)
    // ----------------------------------------------------
    test.describe("Full Sweep: All Widths & Routes", () => {
      // 1. Static routes across all 10 viewports
      for (const vp of ALL_VIEWPORTS) {
        for (const route of STATIC_ROUTES) {
          test(`[FullSweep] ${route} @ ${vp.width}px (${vp.name})`, async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await navigateAndSettle(page, route);
            const problems = await diagnosePage(page, route, vp.width, { takeScreenshots: true });
            if (problems.length > 0) {
              test.info().annotations.push({
                type: "CARD_DOCTOR_FINDING",
                description: problems.map(formatProblem).join("; "),
              });
            }
            expect(problems, problems.map(formatProblem).join("\n")).toEqual([]);
          });
        }
      }

      // 2. Dynamic pages from /sitemap.xml at 320, 390, 1440
      const DYNAMIC_WIDTHS = [
        { width: 320, height: 568 },
        { width: 390, height: 844 },
        { width: 1440, height: 900 },
      ];

      test("[FullSweep] Crawl and audit all dynamic sitemap URLs", async ({ page, request }) => {
        test.setTimeout(600_000); // 10 minutes

        const sitemapRes = await request.get("/sitemap.xml");
        expect(sitemapRes.status()).toBe(200);
        const sitemapXml = await sitemapRes.text();
        const locRegex = /<loc>(.*?)<\/loc>/g;
        const sitemapPaths: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = locRegex.exec(sitemapXml)) !== null) {
          try {
            const rawUrl = match[1].trim();
            const p = new URL(rawUrl).pathname;
            if (p.startsWith("/events/") || p.startsWith("/moves/") || p.startsWith("/music/")) {
              sitemapPaths.push(p);
            }
          } catch {}
        }

        const allProblems: CardDoctorProblem[] = [];

        for (const vp of DYNAMIC_WIDTHS) {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          for (const path of sitemapPaths) {
            await navigateAndSettle(page, path);
            const probs = await diagnosePage(page, path, vp.width, { takeScreenshots: true });
            if (probs.length > 0) {
              allProblems.push(...probs);
              test.info().annotations.push({
                type: "DYNAMIC_ROUTE_FINDING",
                description: probs.map(formatProblem).join("; "),
              });
            }
          }
        }

        expect(allProblems, allProblems.map(formatProblem).join("\n")).toEqual([]);
      });

      // 3. Practice player: all songs and all linkable sections at 320, 360, 390
      const PLAYER_VIEWPORTS = [
        { width: 320, height: 568 },
        { width: 360, height: 640 },
        { width: 390, height: 844 },
      ];

      test("[FullSweep] Practice Player all sections and zero-scroll audit", async ({ page }) => {
        test.setTimeout(600_000);

        const playerProblems: CardDoctorProblem[] = [];
        const zeroScrollViolations: string[] = [];

        for (const vp of PLAYER_VIEWPORTS) {
          await page.setViewportSize({ width: vp.width, height: vp.height });

          for (const song of TIMBA_SONG_ANATOMY_DATA) {
            // Test root song
            const rootPath = `/music/${song.id}`;
            await navigateAndSettle(page, rootPath);
            const baseProbs = await diagnosePage(page, rootPath, vp.width, { takeScreenshots: true });
            playerProblems.push(...baseProbs);

            // Check zero-scroll requirement on normal root size
            const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
            if (scrollHeight > vp.height + 2) {
              zeroScrollViolations.push(`${rootPath} @ ${vp.width}x${vp.height} (scrollHeight: ${scrollHeight} > ${vp.height})`);
            }

            // Test each linkable section (> index 0)
            const linkableSegments = song.segments.slice(1);
            for (const seg of linkableSegments) {
              const secPath = `/music/${song.id}?section=${encodeURIComponent(seg.id)}`;
              await navigateAndSettle(page, secPath);
              const probs = await diagnosePage(page, secPath, vp.width, { takeScreenshots: true });
              playerProblems.push(...probs);
            }
          }
        }

        if (zeroScrollViolations.length > 0) {
          test.info().annotations.push({
            type: "ZERO_SCROLL_FINDINGS",
            description: zeroScrollViolations.join("\n"),
          });
        }

        expect(playerProblems, playerProblems.map(formatProblem).join("\n")).toEqual([]);
      });

      // 4. /cartel/pared print PDF audit at 1440px
      test("[FullSweep] /cartel/pared PDF page count audit", async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await navigateAndSettle(page, "/cartel/pared");
        const pdfBuffer = await page.pdf({ format: "A3", printBackground: true });
        const pdfText = pdfBuffer.toString("latin1");
        const pageCount = pdfText.match(/\/Type\s*\/Page\b/g)?.length || 1;

        test.info().annotations.push({
          type: "A3_WALL_POSTER_PDF",
          description: `/cartel/pared generated ${pageCount} A3 page(s) (size: ${pdfBuffer.length} bytes)`,
        });

        expect(pageCount, "Wall poster should fit exactly 1 page").toBe(1);
      });

      // 5. Open interactive states at 320, 390, 1440
      const OPEN_STATE_WIDTHS = [320, 390, 1440];
      for (const w of OPEN_STATE_WIDTHS) {
        test(`[FullSweep] Open states @ ${w}px`, async ({ page }) => {
          await page.setViewportSize({ width: w, height: 844 });

          // Mobile menu (on phones)
          if (w <= 430) {
            await navigateAndSettle(page, "/");
            const menuBtn = page.locator('button[aria-label*="menu" i], button[data-testid="mobile-menu-trigger"]');
            if (await menuBtn.isVisible()) {
              await menuBtn.click();
              await page.waitForTimeout(300);
              const probs = await diagnosePage(page, "/#menu-open", w, { takeScreenshots: true });
              expect(probs).toEqual([]);
              await page.keyboard.press("Escape").catch(() => {});
            }
          }

          // /moves filters and empty result
          await navigateAndSettle(page, "/moves?q=zzzz");
          const emptyProbs = await diagnosePage(page, "/moves?q=zzzz", w, { takeScreenshots: true });
          expect(emptyProbs).toEqual([]);

          // /rueda/tarjetas flipped cards
          await navigateAndSettle(page, "/rueda/tarjetas");
          const cardTrigger = page.locator("button, [role='button']").filter({ hasText: /flip|voltear|tarjeta/i }).first();
          if (await cardTrigger.isVisible()) {
            await cardTrigger.click();
            await page.waitForTimeout(200);
            const cardProbs = await diagnosePage(page, "/rueda/tarjetas#flipped", w, { takeScreenshots: true });
            expect(cardProbs).toEqual([]);
          }

          // Live banner demo states
          for (const demo of ["thursday", "sunday", "monday"]) {
            const demoRoute = `/?liveDemo=${demo}`;
            await navigateAndSettle(page, demoRoute);
            const bannerProbs = await diagnosePage(page, demoRoute, w, { takeScreenshots: true });
            expect(bannerProbs).toEqual([]);
          }
        });
      }

      // 6. Big text reflow simulation (125% and 150%)
      const BIG_TEXT_WIDTHS = [360, 390];
      const BIG_TEXT_ROUTES = [
        "/",
        "/events/sbk-night-extravaganza-nov-2026",
        "/moves/guapea",
        "/music/me-dicen-cuba",
      ];

      for (const w of BIG_TEXT_WIDTHS) {
        for (const scale of [1.25, 1.5]) {
          test(`[FullSweep] Big text (${scale * 100}%) on ${w}px`, async ({ page }) => {
            await page.setViewportSize({ width: w, height: 844 });
            for (const r of BIG_TEXT_ROUTES) {
              await navigateAndSettle(page, r);
              // Scale root font size
              await page.evaluate((s) => {
                document.documentElement.style.fontSize = `${s * 100}%`;
              }, scale);
              await page.waitForTimeout(100);

              const probs = await diagnosePage(page, `${r}#text-${scale * 100}`, w, { takeScreenshots: true });
              // Record severe spills or overlaps
              if (probs.length > 0) {
                test.info().annotations.push({
                  type: "BIG_TEXT_FINDING",
                  description: `${r} @ ${scale * 100}%: ${probs.map(formatProblem).join("; ")}`,
                });
              }
            }
          });
        }
      }
    });
  }
});
