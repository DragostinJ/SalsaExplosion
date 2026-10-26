import { test, expect } from "@playwright/test";

const ROUTES_TO_TEST = [
  "/",
  "/events",
  "/pricing",
  "/dashboard/schedule",
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

interface WindowWithCls extends Window {
  __clsEntries?: number[];
  __cumulativeLayoutShift?: number;
}

test.describe("M5: Header Layout-Shift (CLS) Stability", () => {
  for (const vp of VIEWPORTS) {
    for (const path of ROUTES_TO_TEST) {
      test(`verifies CLS < 0.02 on ${path} at ${vp.name} (${vp.width}px)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });

        // Collect layout shifts before page navigation starts
        await page.addInitScript(() => {
          const win = window as unknown as WindowWithCls;
          win.__clsEntries = [];
          win.__cumulativeLayoutShift = 0;

          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const shift = entry as any;
                if (!shift.hadRecentInput) {
                  const sources = (shift.sources || []).map((s: any) => s.node?.nodeName || "unknown");
                  win.__clsEntries?.push({ val: shift.value, sources });
                  win.__cumulativeLayoutShift = (win.__cumulativeLayoutShift ?? 0) + shift.value;
                }
              }
            });
            observer.observe({ type: "layout-shift", buffered: true });
          } catch {
            // PerformanceObserver not supported or failed
          }
        });

        const res = await page.goto(path, { waitUntil: "load" });
        expect(res?.status()).toBeLessThan(400);

        // Wait ~2.5s for hydration and late layout settlement
        await page.waitForTimeout(2500);

        const { cls, shifts } = await page.evaluate(() => {
          const win = window as unknown as WindowWithCls;
          return {
            cls: win.__cumulativeLayoutShift ?? 0,
            shifts: win.__clsEntries ?? [],
          };
        });

        test.info().annotations.push({
          type: "CLS_MEASUREMENT",
          description: `${path} @ ${vp.name}: CLS = ${cls}, shifts = ${JSON.stringify(shifts)}`,
        });

        expect(cls).toBeLessThan(0.02);
      });
    }
  }
});
