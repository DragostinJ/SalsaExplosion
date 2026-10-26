import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

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

  it("verifies all gateway images have explicit aspect ratios and responsive size definitions", () => {
    Object.values(MEDIA_MANIFEST.gateways).forEach((gateway) => {
      expect(gateway.aspectRatio).toBe("16/10");
      expect(gateway.sizes).toContain("100vw");
      expect(gateway.width).toBeGreaterThan(0);
      expect(gateway.height).toBeGreaterThan(0);
    });
  });
});
