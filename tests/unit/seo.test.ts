import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { vi } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: { event: { findMany: vi.fn() } } }));
import robots from "@/app/robots";

describe("H3: SEO, Metadata, Sitemap & Robots Validation", () => {
  it("lists events from the database, and still works if the database can't be read", async () => {
    vi.mocked(prisma.event.findMany).mockResolvedValueOnce([{ slug: "nye-latin-fiesta-the-big-one-2026" }] as never);
    expect((await sitemap()).some((e) => e.url.endsWith("/events/nye-latin-fiesta-the-big-one-2026"))).toBe(true);

    vi.mocked(prisma.event.findMany).mockRejectedValueOnce(new Error("database down"));
    expect((await sitemap()).some((e) => e.url.endsWith("/events"))).toBe(true);
  });

  it("generates a clean sitemap containing all public pages and excluding private ones", async () => {
    const sitemapEntries = await sitemap();
    const urls = sitemapEntries.map((e) => e.url);

    // Verify key public landing and gateway pages exist
    // Base URL comes from NEXT_PUBLIC_APP_URL when set (Prisma-backed imports load .env)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://salsaexplosion.co.uk";
    expect(urls.some((u) => u === baseUrl || u.endsWith("/"))).toBe(true);
    expect(urls.some((u) => u.includes("/classes"))).toBe(true);
    expect(urls.some((u) => u.includes("/events"))).toBe(true);
    expect(urls.some((u) => u.includes("/pricing"))).toBe(true);
    expect(urls.some((u) => u.includes("/venues"))).toBe(true);
    expect(urls.some((u) => u.includes("/music"))).toBe(true);
    expect(urls.some((u) => u.includes("/how-it-works"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/music/me-dicen-cuba"))).toBe(true);

    // Verify private pages are excluded
    expect(urls.some((u) => u.includes("/admin"))).toBe(false);
    expect(urls.some((u) => u.includes("/instructor"))).toBe(false);
    expect(urls.some((u) => u.includes("/checkin"))).toBe(false);
    expect(urls.some((u) => u.includes("/dashboard/progression"))).toBe(false);

    // Redirects never belong in a sitemap: /shop goes to /pricing, /review to sign-in
    expect(urls.some((u) => u.endsWith("/shop"))).toBe(false);
    expect(urls.some((u) => u.endsWith("/review"))).toBe(false);
  });

  it("configures robots.txt disallowing admin, instructor, checkin and private dashboard routes", () => {
    const robotsConfig = robots();
    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];

    const standardRule = rules.find((r) => r.userAgent === "*");
    expect(standardRule).toBeDefined();

    const disallow = (standardRule?.disallow || []) as string[];
    expect(disallow).toContain("/api/");
    expect(disallow).toContain("/admin/");
    expect(disallow).toContain("/instructor/");
    expect(disallow).toContain("/checkin/");
    expect(disallow).toContain("/dashboard/progression");
    expect(robotsConfig.sitemap).toMatch(/sitemap\.xml$/);
  });
});
