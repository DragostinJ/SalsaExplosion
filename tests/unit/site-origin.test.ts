import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteOrigin, siteUrl } from "@/lib/safe-url";

describe("getSiteOrigin", () => {
  afterEach(() => vi.unstubAllEnvs());

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
});
