import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Content Security Policy Guard (Milestone C1 & C2)", () => {
  const nextConfigPath = path.resolve(process.cwd(), "next.config.ts");

  it("ensures next.config.ts exists and defines enforced Content-Security-Policy", () => {
    expect(fs.existsSync(nextConfigPath)).toBe(true);
    const content = fs.readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain('"Content-Security-Policy"');
  });

  it("verifies removal of broken Content-Security-Policy-Report-Only header that was flooding DevTools", () => {
    const content = fs.readFileSync(nextConfigPath, "utf-8");
    expect(content).not.toContain('"Content-Security-Policy-Report-Only"');
  });

  it("asserts script-src contains unsafe-inline, conditional unsafe-eval, Clerk, Stripe, YouTube, and Google Analytics", () => {
    const content = fs.readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain("'unsafe-inline'");
    expect(content).toContain("!isProd && \"'unsafe-eval'\"");
    expect(content).toContain("https://*.clerk.accounts.dev");
    expect(content).toContain("https://clerk.salsaexplosion.co.uk");
    expect(content).toContain("https://js.stripe.com");
    expect(content).toContain("https://www.youtube.com");
    expect(content).toContain("https://www.googletagmanager.com");
    expect(content).toContain("https://www.google-analytics.com");
  });

  it("asserts style-src allows unsafe-inline and Google Fonts", () => {
    const content = fs.readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain("style-src 'self' 'unsafe-inline'");
    expect(content).toContain("https://fonts.googleapis.com");
  });

  it("asserts font-src allows data: and Google Fonts static", () => {
    const content = fs.readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain("font-src 'self' data:");
    expect(content).toContain("https://fonts.gstatic.com");
  });

  it("asserts connect-src includes Google Analytics, Clerk, Stripe, Supabase, YouTube, and Clerk Telemetry", () => {
    const content = fs.readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain("https://analytics.google.com");
    expect(content).toContain("https://www.google-analytics.com");
    expect(content).toContain("https://*.supabase.co");
    expect(content).toContain("https://api.stripe.com");
    expect(content).toContain("https://clerk-telemetry.com");
    expect(content).toContain("https://*.clerk-telemetry.com");
  });

  it("asserts img-src includes Unsplash, Clerk, YouTube, and Google Analytics", () => {
    const content = fs.readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain("https://images.unsplash.com");
    expect(content).toContain("https://img.clerk.com");
    expect(content).toContain("https://i.ytimg.com");
    expect(content).toContain("https://www.google-analytics.com");
  });

  it("L1: whitelists vercel.live and pusher in script-src, connect-src, frame-src, and styles", () => {
    const content = fs.readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain("https://vercel.live");
    expect(content).toContain("https://*.pusher.com");
    expect(content).toContain("wss://*.pusher.com");
  });
});
