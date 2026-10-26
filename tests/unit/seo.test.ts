import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("H3: SEO, Metadata, Sitemap & Robots Validation", () => {
  it("generates a clean sitemap containing all public pages and excluding private ones", () => {
    const sitemapEntries = sitemap();
    const urls = sitemapEntries.map((e) => e.url);

    // Verify key public landing and gateway pages exist
    expect(urls.some((u) => u === "https://salsaexplosion.co.uk" || u.endsWith("/"))).toBe(true);
    expect(urls.some((u) => u.includes("/dashboard/schedule"))).toBe(true);
    expect(urls.some((u) => u.includes("/events"))).toBe(true);
    expect(urls.some((u) => u.includes("/pricing"))).toBe(true);
    expect(urls.some((u) => u.includes("/venues"))).toBe(true);
    expect(urls.some((u) => u.includes("/music"))).toBe(true);
    expect(urls.some((u) => u.includes("/shop"))).toBe(true);
    expect(urls.some((u) => u.includes("/how-it-works"))).toBe(true);

    // Verify private pages are excluded
    expect(urls.some((u) => u.includes("/admin"))).toBe(false);
    expect(urls.some((u) => u.includes("/instructor"))).toBe(false);
    expect(urls.some((u) => u.includes("/checkin"))).toBe(false);
    expect(urls.some((u) => u.includes("/dashboard/progression"))).toBe(false);
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
