import { test, expect } from "@playwright/test";

/**
 * Task 5: Layout Stability (CLS & LCP) Audit
 *
 * Requirements:
 * - At 390x844 and 1440x900 on /, /classes, /events, /moves, /music, /pricing, /about:
 *   - Collect layout-shift entries with a PerformanceObserver (buffered: true, ignore hadRecentInput).
 *   - Once the page has finished loading, scroll to the bottom in steps of one viewport,
 *     waiting for network to go idle after each.
 *   - Assert total CLS below 0.1, with no exceptions.
 * - On the same pages, every visible <img> must have width and height attributes,
 *   or a computed aspect-ratio other than "auto" (or aspect-ratio on container per AGENTS.md 1.3).
 * - Record the LCP element (tag plus src or text start) and LCP time as test annotations.
 */

const TARGET_PAGES = [
  { name: "Homepage", path: "/" },
  { name: "Class Schedule", path: "/classes" },
  { name: "Events & Festivals", path: "/events" },
  { name: "Move Library", path: "/moves" },
  { name: "Music Timba Anatomy", path: "/music" },
  { name: "Pricing & Passes", path: "/pricing" },
  { name: "About Academy", path: "/about" },
];

const VIEWPORTS = [
  { name: "Mobile (390x844)", width: 390, height: 844 },
  { name: "Desktop (1440x900)", width: 1440, height: 900 },
];

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  element?: Element | null;
  startTime: number;
}

interface WindowWithPerformanceAudits extends Window {
  __clsScore?: number;
  __lcpEntry?: LargestContentfulPaintEntry | null;
}

test.describe("Task 5: Layout Stability & CLS/LCP Audits", () => {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of TARGET_PAGES) {
        test(`layout stability and image constraints on ${route.name} (${route.path})`, async ({ page }) => {
          await page.goto(route.path);
          // Wait until the page has finished arriving before scrolling. On /classes the class list
          // streams in about a second after DOMContentLoaded; scrolling to the footer before that
          // made the test watch the footer being pushed down (0.47), a shift no visitor at the top
          // of the page sees (measured 0 from a normal start on 2026-11-05).
          await page.waitForLoadState("networkidle");
          await expect
            .poll(() => page.evaluate(() => document.querySelector("main")?.getBoundingClientRect().height ?? 0))
            .toBeGreaterThan(200);

          // Setup PerformanceObserver for layout-shift and LCP
          await page.evaluate(() => {
            const win = window as unknown as WindowWithPerformanceAudits;
            win.__clsScore = 0;
            win.__lcpEntry = null;

            const clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const shift = entry as unknown as LayoutShiftEntry;
                if (!shift.hadRecentInput) {
                  win.__clsScore = (win.__clsScore ?? 0) + shift.value;
                }
              }
            });
            clsObserver.observe({ type: "layout-shift", buffered: true });

            const lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                win.__lcpEntry = entries[entries.length - 1] as unknown as LargestContentfulPaintEntry;
              }
            });
            lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
          });

          // Scroll to the bottom in steps of one viewport, waiting for network to go idle after each
          const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
          let currentScroll = 0;
          while (currentScroll < scrollHeight) {
            currentScroll += vp.height;
            await page.evaluate((y) => window.scrollTo(0, y), currentScroll);
            await page.waitForLoadState("networkidle").catch(() => {});
            await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
          }

          // Retrieve CLS score, LCP element, and inspect all visible images
          const metrics = await page.evaluate(() => {
            const win = window as unknown as WindowWithPerformanceAudits;
            const lcp = win.__lcpEntry;
            let lcpInfo = null;
            if (lcp) {
              const el = lcp.element as HTMLElement | null;
              const tag = el ? el.tagName : "UNKNOWN";
              const src = el ? (el.getAttribute("src") || (el as HTMLImageElement).src || "") : "";
              const text = el ? (el.textContent || "").trim().slice(0, 50) : "";
              lcpInfo = {
                startTime: lcp.startTime,
                tag,
                src: src ? src.slice(-60) : "",
                text,
              };
            }

            const imgs = Array.from(document.querySelectorAll("img"));
            const unconstrainedImgs = [];

            for (const img of imgs) {
              const rect = img.getBoundingClientRect();
              const style = window.getComputedStyle(img);
              const isVisible = rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
              if (!isVisible) continue;

              const hasWidthAttr = img.hasAttribute("width") && img.getAttribute("width") !== "";
              const hasHeightAttr = img.hasAttribute("height") && img.getAttribute("height") !== "";
              const imgAspect = Boolean(style.aspectRatio && style.aspectRatio !== "auto");

              const parent = img.parentElement;
              const parentAspect = Boolean(
                parent &&
                window.getComputedStyle(parent).aspectRatio &&
                window.getComputedStyle(parent).aspectRatio !== "auto"
              );

              if (!hasWidthAttr && !hasHeightAttr && !imgAspect && !parentAspect) {
                unconstrainedImgs.push({
                  src: img.getAttribute("src") || img.src,
                  className: img.className,
                });
              }
            }

            return {
              cls: win.__clsScore ?? 0,
              lcp: lcpInfo,
              unconstrainedImgs,
            };
          });

          // Record LCP element & timing as test annotations
          if (metrics.lcp) {
            test.info().annotations.push({
              type: "LCP",
              description: `${metrics.lcp.startTime.toFixed(1)}ms on <${metrics.lcp.tag}> ${metrics.lcp.src ? `src="${metrics.lcp.src}"` : `text="${metrics.lcp.text}"`}`,
            });
          }

          // Assert every visible <img> has width/height or computed aspect-ratio constraint
          expect(metrics.unconstrainedImgs).toEqual([]);

          // Google's "good" threshold, with no exceptions: a passing test must mean a stable page
          expect(metrics.cls, `${route.path} [${vp.name}] layout shift`).toBeLessThan(0.1);
        });
      }
    });
  }
});
