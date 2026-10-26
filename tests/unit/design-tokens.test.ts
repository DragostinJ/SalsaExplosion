import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RgbColor {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length !== 6) {
    throw new Error(`Invalid hex color length: "${hex}"`);
  }
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return { r, g, b };
}

function channelLuminance(channel8Bit: number): number {
  const c = channel8Bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(color: RgbColor): number {
  const r = channelLuminance(color.r);
  const g = channelLuminance(color.g);
  const b = channelLuminance(color.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("V1: Design Tokens & Canonical Palette Verification", () => {
  const cssPath = path.resolve(__dirname, "../../src/app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  const expectedTokens: Record<string, string> = {
    "--color-canvas": "#080706",
    "--color-surface-1": "#0E0C0A",
    "--color-surface-2": "#14110F",
    "--color-surface-3": "#1C1917",
    "--color-line": "#26221F",
    "--color-ivory": "#F5F2EB",
    "--color-brand": "#D9381E",
    "--color-brand-hover": "#B82D16",
    "--color-gold": "#FBBF24",
    "--color-success": "#10B981",
    "--color-danger": "#F43F5E",
  };

  it("verifies all canonical Havana Obsidian design tokens are declared in globals.css", () => {
    for (const [tokenName, tokenHex] of Object.entries(expectedTokens)) {
      const tokenRegex = new RegExp(`${tokenName}:\\s*${tokenHex}`, "i");
      expect(
        tokenRegex.test(cssContent),
        `Expected token ${tokenName}: ${tokenHex} to exist in globals.css`
      ).toBe(true);
    }
  });

  it("verifies the primary brand CTA color passes WCAG AA contrast ratio (>= 4.5:1) against pure white text", () => {
    const brandHex = expectedTokens["--color-brand"];
    const whiteHex = "#FFFFFF";
    const contrastRatio = getContrastRatio(brandHex, whiteHex);

    expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies gold accent color has strong contrast against dark canvas", () => {
    const goldHex = expectedTokens["--color-gold"];
    const canvasHex = expectedTokens["--color-canvas"];
    const contrastRatio = getContrastRatio(goldHex, canvasHex);

    expect(contrastRatio).toBeGreaterThanOrEqual(7.0);
  });
});
