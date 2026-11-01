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

/** Value of a custom property inside one CSS block (the first block whose selector matches) */
function tokenIn(css: string, blockStart: string, token: string): string | undefined {
  const from = css.indexOf(blockStart);
  if (from === -1) return undefined;
  const block = css.slice(from, css.indexOf("\n}", from));
  return block.match(new RegExp(`${token}:\\s*(#[0-9A-Fa-f]{6})`))?.[1];
}

describe("V1: ICAIC Poster design tokens (paper default + ink scope)", () => {
  const cssPath = path.resolve(__dirname, "../../src/app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  // Paper is the default surface (@theme); .theme-ink flips a subtree to the night-poster surface
  const paperTokens: Record<string, string> = {
    "--color-canvas": "#F1E6D0",
    "--color-surface-1": "#E9DCC1",
    "--color-surface-2": "#E2D2B4",
    "--color-surface-3": "#D8C7A6",
    "--color-line": "#BFAE8E",
    "--color-ivory": "#161311",
    "--color-ivory-muted": "#4E453B",
    "--color-gold": "#22418F",
    "--color-brand": "#EA4A33",
    "--color-success": "#0B6F6B",
    "--color-warning": "#8A5200",
    "--color-danger": "#B8301C",
    "--color-info": "#22418F",
  };
  const inkTokens: Record<string, string> = {
    "--color-canvas": "#161311",
    "--color-ivory": "#F1E6D0",
    "--color-ivory-muted": "#C8BBA2",
    "--color-gold": "#F4B41A",
    "--color-brand": "#C4321C",
    "--color-white": "#FAF4E6",
  };
  const posterInks = ["#F1E6D0", "#161311", "#E4412B", "#F4B41A", "#12938F", "#22418F"];

  it("declares the paper tokens in @theme and the ink tokens in .theme-ink", () => {
    for (const [token, hex] of Object.entries(paperTokens)) {
      expect(tokenIn(cssContent, "@theme {", token), `paper ${token}`).toBe(hex);
    }
    for (const [token, hex] of Object.entries(inkTokens)) {
      expect(tokenIn(cssContent, ".theme-ink {", token), `ink ${token}`).toBe(hex);
    }
  });

  it("declares the six ICAIC poster inks", () => {
    for (const hex of posterInks) {
      expect(cssContent.toUpperCase()).toContain(hex);
    }
  });

  it("keeps body text, muted text and accents at WCAG AA (>= 4.5:1) on both surfaces", () => {
    const textTokens = ["--color-ivory", "--color-ivory-muted", "--color-gold", "--color-success", "--color-warning", "--color-danger", "--color-info"];
    for (const [scope, blockStart] of [
      ["paper", "@theme {"],
      ["ink", ".theme-ink {"],
    ]) {
      const canvas = tokenIn(cssContent, blockStart, "--color-canvas") ?? "";
      for (const token of textTokens) {
        const value = tokenIn(cssContent, blockStart, token) ?? "";
        expect(getContrastRatio(value, canvas), `${scope} ${token} on canvas`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps brand CTA text readable: ink on the paper red, warm white on the ink red", () => {
    expect(getContrastRatio(paperTokens["--color-brand"], paperTokens["--color-ivory"])).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(inkTokens["--color-brand"], inkTokens["--color-white"])).toBeGreaterThanOrEqual(4.5);
  });
});
