import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { ACADEMY_GALLERY_PHOTOS } from "@/lib/academy-data";

describe("H5: Media Manifest & Asset Weight Integrity", () => {
  it("verifies all local poster assets in manifest exist in public directory and stay under 350KB", () => {
    const publicDir = path.resolve(process.cwd(), "public");

    Object.entries(MEDIA_MANIFEST.posters).forEach(([key, config]) => {
      const filePath = path.join(publicDir, config.src.replace(/^\//, ""));
      expect(fs.existsSync(filePath), `Poster asset ${config.src} must exist`).toBe(true);

      const stats = fs.statSync(filePath);
      const sizeKb = stats.size / 1024;
      expect(
        sizeKb,
        `Asset ${key} (${sizeKb.toFixed(1)} KB) should stay under 350KB`
      ).toBeLessThan(350);
    });
  });

  it("verifies all local studio photos, gateways, archive shots, and instructor portraits exist and are > 10KB", () => {
    const publicDir = path.resolve(process.cwd(), "public");
    const localPaths: string[] = [
      MEDIA_MANIFEST.heroPortrait.src,
      ...Object.values(MEDIA_MANIFEST.gateways).map((g) => g.src),
      ...Object.values(MEDIA_MANIFEST.archive),
      ...ACADEMY_GALLERY_PHOTOS.map((p) => p.imageUrl),
      ...Object.values(MEDIA_MANIFEST.instructors).filter((src) => src.startsWith("/images/")),
    ];

    for (const srcPath of localPaths) {
      const filePath = path.join(publicDir, srcPath.replace(/^\//, ""));
      expect(fs.existsSync(filePath), `Local photo ${srcPath} must exist on disk`).toBe(true);
      const stats = fs.statSync(filePath);
      expect(stats.size, `Local photo ${srcPath} must be > 10KB (not a blank placeholder)`).toBeGreaterThan(10 * 1024);
    }
  });

  it("verifies all gateway images have explicit aspect ratios and responsive size definitions", () => {
    Object.values(MEDIA_MANIFEST.gateways).forEach((gateway) => {
      expect(gateway.aspectRatio).toBe("16/10");
      expect(gateway.sizes).toContain("100vw");
      expect(gateway.width).toBeGreaterThan(0);
      expect(gateway.height).toBeGreaterThan(0);
    });
  });

  it("asserts key media-displaying components import MEDIA_MANIFEST and contain zero raw Unsplash or sample video literals", () => {
    const filesToCheck = [
      "src/app/page.tsx",
      "src/components/home/ArtHouseGallerySection.tsx",
      "src/components/about/studio-gallery.tsx",
      "src/components/beginners/first-class-prep-modal.tsx",
    ];

    for (const relPath of filesToCheck) {
      const fullPath = path.resolve(process.cwd(), relPath);
      expect(fs.existsSync(fullPath), `File ${relPath} must exist`).toBe(true);
      const content = fs.readFileSync(fullPath, "utf-8");

      expect(
        content.includes("MEDIA_MANIFEST"),
        `${relPath} must import and reference MEDIA_MANIFEST`
      ).toBe(true);
      expect(
        content.includes("images.unsplash.com"),
        `${relPath} must not contain hardcoded images.unsplash.com URLs`
      ).toBe(false);
      expect(
        content.includes("ForBiggerBlazes.mp4"),
        `${relPath} must not contain hardcoded ForBiggerBlazes.mp4 URLs`
      ).toBe(false);
    }
  });

  it("asserts no component in src/ references 134-byte blank dummy image placeholders", () => {
    const forbiddenPlaceholders = [
      "/images/rueda-social.jpg",
      "/images/boh-studios.jpg",
      "/images/congress-2025.jpg",
      "/images/enrique.jpg",
    ];

    function scanDir(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const item of list) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          results = results.concat(scanDir(itemPath));
        } else if (/\.(tsx?|jsx?|json|css|md)$/.test(item)) {
          results.push(itemPath);
        }
      }
      return results;
    }

    const srcFiles = scanDir(path.resolve(process.cwd(), "src"));

    for (const file of srcFiles) {
      const content = fs.readFileSync(file, "utf-8");
      for (const forbidden of forbiddenPlaceholders) {
        expect(
          content.includes(forbidden),
          `File ${path.relative(process.cwd(), file)} must not reference blank placeholder ${forbidden}`
        ).toBe(false);
      }
    }
  });
});
