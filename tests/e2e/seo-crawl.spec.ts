import { test, expect } from "@playwright/test";

/**
 * Task 6: SEO & Link Integrity Crawl
 *
 * Requirements:
 * - Read /sitemap.xml from the server and test every URL:
 *   - Status 200
 *   - Exactly one <h1>
 *   - Unique <title> across sitemap
 *   - Unique meta description of 70–160 chars across sitemap
 *   - Canonical link whose path equals page path
 *   - og:image present
 *   - JSON-LD blocks parse and have @context "https://schema.org"
 *   - Every <img> has an alt attribute
 * - Check every internal <a href> link (< 400 or redirect to /sign-in).
 * - Collect all failures with URL and rule, not just the first.
 */

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}

test.describe("Task 6: SEO & Sitemap Link Integrity Crawl", () => {
  test("audits all sitemap URLs for SEO metadata, canonicals, schema.org, and internal links", async ({
    request,
  }) => {
    test.setTimeout(180 * 1000);

    // 1. Fetch /sitemap.xml
    const sitemapRes = await request.get("/sitemap.xml");
    expect(sitemapRes.status()).toBe(200);

    const sitemapXml = await sitemapRes.text();
    const locRegex = /<loc>(.*?)<\/loc>/g;
    const sitemapPaths: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = locRegex.exec(sitemapXml)) !== null) {
      try {
        const rawUrl = match[1].trim();
        const path = new URL(rawUrl).pathname;
        sitemapPaths.push(path);
      } catch {
        // if already a path
        sitemapPaths.push(match[1].trim());
      }
    }

    expect(sitemapPaths.length).toBeGreaterThan(200);

    const violations: Array<{ url: string; rule: string; detail: string }> = [];
    const titlesMap = new Map<string, string[]>();
    const descriptionsMap = new Map<string, string[]>();
    const internalLinks = new Set<string>();

    for (const path of sitemapPaths) {
      const res = await request.get(path);
      if (res.status() !== 200) {
        violations.push({
          url: path,
          rule: "HTTP Status 200",
          detail: `Received status ${res.status()}`,
        });
        continue;
      }

      const html = await res.text();

      // Exactly one <h1>
      const h1Count = (html.match(/<h1\b[^>]*>/gi) || []).length;
      if (h1Count !== 1) {
        violations.push({
          url: path,
          rule: "Single <h1> Tag",
          detail: `Found ${h1Count} <h1> tags`,
        });
      }

      // <title>
      const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";
      if (!title) {
        violations.push({
          url: path,
          rule: "Title Present",
          detail: "Missing <title> tag",
        });
      } else {
        if (!titlesMap.has(title)) titlesMap.set(title, []);
        titlesMap.get(title)!.push(path);
      }

      // Meta description (70 - 160 characters)
      const descMatch =
        html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i) ||
        html.match(/<meta\b[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i);
      const rawDesc = descMatch ? descMatch[1].trim() : "";
      const decodedDesc = decodeHtmlEntities(rawDesc);

      if (!decodedDesc) {
        violations.push({
          url: path,
          rule: "Meta Description Present",
          detail: "Missing meta description",
        });
      } else {
        if (decodedDesc.length < 70 || decodedDesc.length > 160) {
          violations.push({
            url: path,
            rule: "Meta Description Length (70-160)",
            detail: `Length is ${decodedDesc.length}: "${decodedDesc}"`,
          });
        }
        if (!descriptionsMap.has(decodedDesc)) descriptionsMap.set(decodedDesc, []);
        descriptionsMap.get(decodedDesc)!.push(path);
      }

      // Canonical link
      const canonMatch =
        html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["'][^>]*>/i) ||
        html.match(/<link\b[^>]*href=["']([\s\S]*?)["'][^>]*rel=["']canonical["'][^>]*>/i);
      if (!canonMatch) {
        violations.push({
          url: path,
          rule: "Canonical Tag Present",
          detail: "Missing canonical link",
        });
      } else {
        let canonPath = canonMatch[1].trim();
        try {
          if (canonPath.startsWith("http")) {
            canonPath = new URL(canonPath).pathname;
          }
        } catch {}
        const normCanon = canonPath !== "/" && canonPath.endsWith("/") ? canonPath.slice(0, -1) : canonPath;
        const normPath = path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
        if (normCanon !== normPath) {
          violations.push({
            url: path,
            rule: "Canonical Path Match",
            detail: `Expected "${normPath}", got "${normCanon}"`,
          });
        }
      }

      // og:image
      const ogMatch =
        html.match(/<meta\b[^>]*property=["']og:image["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i) ||
        html.match(/<meta\b[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:image["'][^>]*>/i);
      if (!ogMatch || !ogMatch[1]?.trim()) {
        violations.push({
          url: path,
          rule: "og:image Present",
          detail: "Missing og:image meta tag",
        });
      }

      // JSON-LD blocks
      const jsonLdBlocks = html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      for (const block of jsonLdBlocks) {
        try {
          const parsed = JSON.parse(block[1].trim());
          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of items) {
            const ctx = item["@context"];
            if (ctx !== "https://schema.org" && ctx !== "http://schema.org") {
              violations.push({
                url: path,
                rule: "JSON-LD @context",
                detail: `Invalid @context: ${ctx}`,
              });
            }
          }
        } catch (e: unknown) {
          violations.push({
            url: path,
            rule: "JSON-LD Parsing",
            detail: `JSON syntax error: ${(e as Error).message}`,
          });
        }
      }

      // <img> alt attributes
      const imgTags = html.matchAll(/<img\b[^>]*>/gi);
      for (const imgTag of imgTags) {
        if (!/alt=["'][\s\S]*?["']/i.test(imgTag[0])) {
          violations.push({
            url: path,
            rule: "Image Alt Attribute",
            detail: `Missing alt attribute on: ${imgTag[0].slice(0, 60)}`,
          });
        }
      }

      // Internal <a href> collection
      const aTags = html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi);
      for (const aTag of aTags) {
        const href = aTag[1].trim();
        if (
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("javascript:")
        ) {
          continue;
        }
        try {
          let linkPath = href;
          if (
            href.startsWith("http://localhost:3200") ||
            href.startsWith("http://localhost:3000") ||
            href.startsWith("https://salsaexplosion.co.uk")
          ) {
            linkPath = new URL(href).pathname;
          } else if (href.startsWith("http://") || href.startsWith("https://")) {
            continue; // external link
          }
          const cleanPath = linkPath.split("#")[0].split("?")[0];
          if (cleanPath) internalLinks.add(cleanPath);
        } catch {}
      }
    }

    // Title uniqueness
    for (const [title, paths] of titlesMap.entries()) {
      if (paths.length > 1) {
        for (const p of paths) {
          violations.push({
            url: p,
            rule: "Title Uniqueness",
            detail: `Shared title across ${paths.length} pages: "${title}"`,
          });
        }
      }
    }

    // Description uniqueness
    for (const [desc, paths] of descriptionsMap.entries()) {
      if (paths.length > 1) {
        for (const p of paths) {
          violations.push({
            url: p,
            rule: "Description Uniqueness",
            detail: `Shared description across ${paths.length} pages: "${desc}"`,
          });
        }
      }
    }

    // Internal links verification (< 400 or redirect to /sign-in)
    const brokenLinks: Array<{ link: string; status: number }> = [];
    for (const link of internalLinks) {
      const res = await request.get(link, { maxRedirects: 0 });
      const status = res.status();
      // Redirects (301, 302, 307, 308) or 200 are valid
      if (status >= 400) {
        brokenLinks.push({ link, status });
        violations.push({
          url: link,
          rule: "Internal Link Integrity (<400)",
          detail: `Broken internal link returned status ${status}`,
        });
      }
    }

    if (violations.length > 0) {
      const formatted = violations
        .map((v) => `[${v.rule}] ${v.url} -> ${v.detail}`)
        .join("\n");
      expect(violations, `SEO Crawl encountered ${violations.length} violations:\n${formatted}`).toEqual([]);
    }
  });
});
