import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isBootstrapAdmin } from "@/lib/auth-user";

describe("Security Audit: Authorization & Role Privilege Escalation", () => {

  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isBootstrapAdmin (Fail-Closed Admin Gate)", () => {
    it("strictly returns false when ADMIN_EMAILS is empty string, even in development", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ADMIN_EMAILS", "");

      expect(isBootstrapAdmin("anyone@studio.com")).toBe(false);
      expect(isBootstrapAdmin("owner@salsaexplosion.co.uk")).toBe(false);
    });

    it("strictly returns false when ADMIN_EMAILS is undefined", () => {
      vi.stubEnv("ADMIN_EMAILS", "");
      vi.stubEnv("NODE_ENV", "development");

      expect(isBootstrapAdmin("dancer@bournemouth.co.uk")).toBe(false);
    });

    it("matches whitelisted admin emails case-insensitively and trims whitespace", () => {
      vi.stubEnv("ADMIN_EMAILS", "enrique@salsaexplosion.co.uk,  admin@bohstudios.co.uk ");

      expect(isBootstrapAdmin("enrique@salsaexplosion.co.uk")).toBe(true);
      expect(isBootstrapAdmin("Enrique@SalsaExplosion.co.uk")).toBe(true);
      expect(isBootstrapAdmin("admin@bohstudios.co.uk")).toBe(true);
      expect(isBootstrapAdmin("  ADMIN@BOHSTUDIOS.CO.UK  ")).toBe(true);
    });

    it("rejects non-whitelisted emails", () => {
      vi.stubEnv("ADMIN_EMAILS", "enrique@salsaexplosion.co.uk");

      expect(isBootstrapAdmin("student@salsaexplosion.co.uk")).toBe(false);
      expect(isBootstrapAdmin("hacker@malicious.com")).toBe(false);
    });

    it("prevents partial substring match spoofing", () => {
      vi.stubEnv("ADMIN_EMAILS", "enrique@salsaexplosion.co.uk");

      // Substring attack attempts:
      expect(isBootstrapAdmin("fake-enrique@salsaexplosion.co.uk")).toBe(false);
      expect(isBootstrapAdmin("enrique@salsaexplosion.co.uk.evil.com")).toBe(false);
    });

    it("returns false for null, undefined, or empty email input", () => {
      vi.stubEnv("ADMIN_EMAILS", "enrique@salsaexplosion.co.uk");

      expect(isBootstrapAdmin(null)).toBe(false);
      expect(isBootstrapAdmin(undefined)).toBe(false);
      expect(isBootstrapAdmin("")).toBe(false);
    });
  });
});
