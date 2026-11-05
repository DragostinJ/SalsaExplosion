import { test, expect } from "@playwright/test";
import { upcomingCanonicalEvents } from "@/lib/academy-data";
import { getPublishedMoves } from "@/lib/moves/move-library";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";

const STATIC_ROUTES = [
  "/",
  "/classes",
  "/events",
  "/pricing",
  "/venues",
  "/music",
  "/rueda",
  "/rueda/tarjetas",
  "/moves",
  "/about",
  "/how-it-works",
  "/private-lessons",
  "/terms",
  "/cartel",
  "/cartel/jueves",
  "/cartel/domingo",
  "/cartel/pared",
];

test.describe("Task 3: Broken Links, Images, and Console Errors Sweep", () => {
  test.describe.configure({ mode: "serial", timeout: 120000 });

  test("crawls all public routes, checks links, images, console errors, and hydration", async ({
    page,
    request,
    baseURL,
  }) => {
    const origin = baseURL || "http://localhost:3200";

    const consoleErrors: Array<{ route: string; message: string }> = [];
    const hydrationWarnings: Array<{ route: string; message: string }> = [];
    const pageErrors: Array<{ route: string; error: string }> = [];

    page.on("console", (msg) => {
      const text = msg.text();
      const currentUrl = page.url();
      if (msg.type() === "error") {
        consoleErrors.push({ route: currentUrl, message: text });
      }
      if (
        text.includes("Hydration failed") ||
        text.includes("did not match") ||
        text.includes("server/client")
      ) {
        hydrationWarnings.push({ route: currentUrl, message: text });
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push({ route: page.url(), error: err.message });
    });

    // Collect all public routes: static + events + sample moves + songs
    const allRoutes = [
      ...STATIC_ROUTES,
      ...upcomingCanonicalEvents().map((e) => `/events/${e.slug}`),
      ...TIMBA_SONG_ANATOMY_DATA.map((s) => `/music/${s.id}`),
      // Representative sample of moves across categories
      ...getPublishedMoves().slice(0, 15).map((m) => `/moves/${m.id}`),
    ];

    const discoveredInternalLinks = new Set<string>();
    const brokenImages: Array<{ route: string; src: string; reason: string }> = [];

    // 1. Visit each route, extract internal links, check images and console
    for (const route of allRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      // Step scroll to trigger lazy loaded images
      await page.evaluate(async () => {
        const scrollHeight = document.body.scrollHeight;
        const step = window.innerHeight || 800;
        for (let y = 0; y < scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 30));
        }
        window.scrollTo(0, 0);
      });

      // Check all rendered <img> tags on this page
      const imageStatus = await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll("img"));
        const results: Array<{ src: string; naturalWidth: number; complete: boolean }> = [];
        for (const img of imgs) {
          if (!img.complete && img.src) {
            try {
              await Promise.race([
                img.decode(),
                new Promise((_, reject) => setTimeout(reject, 1500)),
              ]);
            } catch {}
          }
          results.push({
            src: img.currentSrc || img.src,
            naturalWidth: img.naturalWidth,
            complete: img.complete,
          });
        }
        return results;
      });

      for (const img of imageStatus) {
        if (!img.src) continue;
        if (img.naturalWidth === 0) {
          brokenImages.push({
            route,
            src: img.src,
            reason: img.complete ? "naturalWidth is 0" : "failed to load",
          });
        }
      }

      // Extract all internal <a> links
      const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a[href]"))
          .map((a) => a.getAttribute("href") || "")
          .filter(Boolean);
      });

      for (const href of hrefs) {
        // Skip external, mailto, tel, api, javascript
        if (
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("javascript:") ||
          href.startsWith("/api/")
        ) {
          continue;
        }

        // Clean query/hash
        const cleanHref = href.split("#")[0].split("?")[0];
        if (cleanHref && cleanHref.startsWith("/")) {
          discoveredInternalLinks.add(cleanHref);
        }
      }
    }

    // 2. Verify all discovered internal links return 200 OK via HTTP request
    const brokenLinks: Array<{ link: string; status: number }> = [];
    for (const link of discoveredInternalLinks) {
      // Don't test non-existent page 404 test links
      if (link === "/this-page-does-not-exist") continue;

      try {
        const res = await request.get(link);
        if (res.status() >= 400) {
          brokenLinks.push({ link, status: res.status() });
        }
      } catch {
        brokenLinks.push({ link, status: 0 });
      }
    }

    console.log(`Discovered & checked ${discoveredInternalLinks.size} unique internal links.`);
    console.log(`Broken links: ${brokenLinks.length}`);
    console.log(`Broken images: ${brokenImages.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`Hydration warnings: ${hydrationWarnings.length}`);
    console.log(`Page errors: ${pageErrors.length}`);

    expect(brokenLinks, `Broken links found: ${JSON.stringify(brokenLinks)}`).toEqual([]);
    expect(brokenImages, `Broken images found: ${JSON.stringify(brokenImages)}`).toEqual([]);
    expect(hydrationWarnings, `Hydration warnings: ${JSON.stringify(hydrationWarnings)}`).toEqual([]);
    expect(pageErrors, `Page errors: ${JSON.stringify(pageErrors)}`).toEqual([]);
  });

  test("audits social share previews (OpenGraph) on homepage and SB&K Night event", async ({
    page,
    request,
    baseURL,
  }) => {
    const origin = baseURL || "http://localhost:3200";

    const testRoutes = ["/", "/events/sbk-night-extravaganza-nov-2026"];

    for (const route of testRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const ogMeta = await page.evaluate(() => {
        const getMeta = (prop: string) =>
          document.querySelector(`meta[property="${prop}"]`)?.getAttribute("content") ||
          document.querySelector(`meta[name="${prop}"]`)?.getAttribute("content") ||
          "";

        return {
          title: getMeta("og:title") || getMeta("twitter:title"),
          description: getMeta("og:description") || getMeta("twitter:description"),
          image: getMeta("og:image") || getMeta("twitter:image"),
        };
      });

      console.log(`OG preview for ${route}:`, ogMeta);

      expect(ogMeta.title.length, `og:title on ${route} must not be empty`).toBeGreaterThan(5);
      expect(ogMeta.description.length, `og:description on ${route} must not be empty`).toBeGreaterThan(10);
      expect(ogMeta.image.length, `og:image on ${route} must not be empty`).toBeGreaterThan(5);

      // Verify og:image resolves to HTTP 200 on test origin
      const targetUrl = new URL(ogMeta.image, origin);
      targetUrl.port = new URL(origin).port;
      targetUrl.hostname = new URL(origin).hostname;
      const imgRes = await request.get(targetUrl.toString());
      expect(imgRes.status(), `og:image ${targetUrl.toString()} must return 200`).toBe(200);
    }
  });
});
