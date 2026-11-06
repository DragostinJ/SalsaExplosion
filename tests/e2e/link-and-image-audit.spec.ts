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
    // The sitemap only lists the canonical events; /events links to all of them
    const eventsHtml = await (await request.get("/events")).text();
    const eventRoutes = [...new Set([...eventsHtml.matchAll(/href="(\/events\/[a-z0-9-]+)/g)].map((m) => m[1]))];
    expect(eventRoutes.length).toBeGreaterThan(0);

    const consoleErrors: Array<{ route: string; message: string }> = [];
    const hydrationWarnings: Array<{ route: string; message: string }> = [];
    const pageErrors: Array<{ route: string; error: string }> = [];
    const failedResponses: Array<{ route: string; url: string; status: number }> = [];

    page.on("response", (response) => {
      if (response.status() >= 400 && !/youtube|ytimg|clerk/.test(response.url())) {
        failedResponses.push({ route: page.url(), url: response.url(), status: response.status() });
      }
    });

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
      ...eventRoutes,
      ...TIMBA_SONG_ANATOMY_DATA.map((s) => `/music/${s.id}`),
      // A sample of moves in the normal run, all of them with FULL_SWEEP=1
      ...getPublishedMoves().slice(0, process.env.FULL_SWEEP ? undefined : 15).map((m) => `/moves/${m.id}`),
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

        // Keep the query string: /music/<song>?section=<id> links are checked as they are
        const cleanHref = href.split("#")[0];
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
    expect(consoleErrors, `Console errors: ${JSON.stringify(consoleErrors)}`).toEqual([]);
    expect(failedResponses, `Failed requests: ${JSON.stringify(failedResponses)}`).toEqual([]);
  });

  test("old addresses redirect to the right pages", async ({ request }) => {
    for (const [from, to] of [["/schedule", "/classes"], ["/shop", "/pricing"], ["/dashboard/schedule", "/classes"]]) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(308);
      expect(response.headers().location, from).toBe(to);
    }
  });

  test("shared links show that page's own title and picture", async ({ page, request, baseURL }) => {
    const origin = baseURL || "http://localhost:3200";
    const [event] = upcomingCanonicalEvents();
    const [move] = getPublishedMoves();
    const [song] = TIMBA_SONG_ANATOMY_DATA;

    const readTags = async (route: string) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      return page.evaluate(() => {
        const meta = (property: string) => document.querySelector(`meta[property="${property}"]`)?.getAttribute("content") ?? "";
        return { title: meta("og:title"), description: meta("og:description"), image: meta("og:image") };
      });
    };
    const expectImageLoads = async (image: string) => {
      const url = new URL(image, origin);
      const response = await request.get(`${origin}${url.pathname}${url.search}`);
      expect(response.status(), image).toBe(200);
      expect(response.headers()["content-type"], image).toContain("image/");
    };

    const home = await readTags("/");
    expect(home.title.length).toBeGreaterThan(5);
    expect(home.description.length).toBeGreaterThan(10);
    await expectImageLoads(home.image);

    // An event without its own cover shares its own card, never the general school poster
    const eventTags = await readTags(`/events/${event.slug}`);
    expect(eventTags.title).not.toBe(home.title);
    expect(eventTags.image).toContain(`/events/${event.slug}`);
    await expectImageLoads(eventTags.image);

    const moveTags = await readTags(`/moves/${move.id}`);
    expect(moveTags.title).not.toBe(home.title);
    expect(moveTags.description).not.toBe(home.description);
    expect(moveTags.image).toContain(`/moves/${move.id}`);
    await expectImageLoads(moveTags.image);

    const songTags = await readTags(`/music/${song.id}`);
    expect(songTags.title).not.toBe(home.title);
    expect(songTags.description).not.toBe(home.description);
    expect(songTags.image).toContain(`/music/${song.id}`);
    await expectImageLoads(songTags.image);
  });
});
