import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isBootstrapAdmin, canSwitchRoles } from "@/lib/auth-user";

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

  describe("canSwitchRoles (Fail-Closed Demo Role Switcher Guard)", () => {
    it("strictly returns false in production, even if email is allowlisted and flag is true", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "dragostinj@gmail.com");

      expect(canSwitchRoles("dragostinj@gmail.com")).toBe(false);
    });

    it("strictly returns false if ALLOW_DEMO_ROLE_SWITCHING is not true", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "false");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "dragostinj@gmail.com");

      expect(canSwitchRoles("dragostinj@gmail.com")).toBe(false);
    });

    it("strictly returns false when DEMO_SWITCHER_EMAILS is empty or unset", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "");

      expect(canSwitchRoles("dragostinj@gmail.com")).toBe(false);
      expect(canSwitchRoles("anyone@test.com")).toBe(false);
    });

    it("rejects STUDENT or user not on the allow-list", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "dragostinj@gmail.com");

      expect(canSwitchRoles("student@salsaexplosion.co.uk")).toBe(false);
      expect(canSwitchRoles("attacker@hacker.io")).toBe(false);
    });

    it("returns true only in non-production when flag is true and email matches allow-list", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "dragostinj@gmail.com, enrique@salsaexplosion.co.uk");

      expect(canSwitchRoles("dragostinj@gmail.com")).toBe(true);
      expect(canSwitchRoles("DRAGOSTINJ@GMAIL.COM")).toBe(true);
      expect(canSwitchRoles("  enrique@salsaexplosion.co.uk ")).toBe(true);
    });

    it("rejects null or empty email inputs", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "dragostinj@gmail.com");

      expect(canSwitchRoles(null)).toBe(false);
      expect(canSwitchRoles(undefined)).toBe(false);
      expect(canSwitchRoles("")).toBe(false);
    });
  });
});

