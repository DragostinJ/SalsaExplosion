import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCheckoutBaseUrl, getSiteOrigin, siteUrl } from "@/lib/safe-url";

/** The value that was live on 2026-11-05: a mistyped project name, which Vercel answers with a 404. */
const STALE_APP_URL = "https://SalsaExplosion.vercel.app";

beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "");
  vi.stubEnv("VERCEL_URL", "");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL", "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
});

afterEach(() => vi.unstubAllEnvs());

describe("getSiteOrigin", () => {

  it("uses NEXT_PUBLIC_APP_URL, normalised to a lowercase origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", " https://Salsa-Explosion.vercel.app/ ");
    expect(getSiteOrigin()).toBe("https://salsa-explosion.vercel.app");
    expect(siteUrl("/checkin/abc")).toBe("https://salsa-explosion.vercel.app/checkin/abc");
    expect(siteUrl("review")).toBe("https://salsa-explosion.vercel.app/review");
  });

  it("falls back to Vercel's production domain, then the school's domain", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "salsa-explosion.vercel.app");
    expect(getSiteOrigin()).toBe("https://salsa-explosion.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(getSiteOrigin()).toBe("https://salsaexplosion.co.uk");
  });

  it("on the live Vercel deployment, trusts Vercel's domain over a stale NEXT_PUBLIC_APP_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", STALE_APP_URL);
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "salsa-explosion.vercel.app");
    expect(getSiteOrigin()).toBe("https://salsa-explosion.vercel.app");
    expect(siteUrl("/checkin/abc")).toBe("https://salsa-explosion.vercel.app/checkin/abc");
  });

  it("gives browser code the same answer, from the variables Next.js exposes to it", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", STALE_APP_URL);
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL", "salsa-explosion.vercel.app");
    expect(getSiteOrigin()).toBe("https://salsa-explosion.vercel.app");
  });

  it("keeps NEXT_PUBLIC_APP_URL when Vercel doesn't report its domain, and on previews", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://salsaexplosion.co.uk");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(getSiteOrigin()).toBe("https://salsaexplosion.co.uk");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "salsa-explosion.vercel.app");
    expect(getSiteOrigin()).toBe("https://salsaexplosion.co.uk");
  });
});

describe("getCheckoutBaseUrl", () => {
  it("returns a live buyer to the real site, whatever NEXT_PUBLIC_APP_URL says", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", STALE_APP_URL);
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "salsa-explosion.vercel.app");
    expect(getCheckoutBaseUrl()).toBe("https://salsa-explosion.vercel.app");
  });

  it("returns a preview buyer to the preview, and local checkout to localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "salsa-explosion-abc123.vercel.app");
    expect(getCheckoutBaseUrl()).toBe("https://salsa-explosion-abc123.vercel.app");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_URL", "");
    expect(getCheckoutBaseUrl()).toBe("http://localhost:3000");
  });
});
