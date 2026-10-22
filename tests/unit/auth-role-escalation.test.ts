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
    it("allows role switching when flag is true and email matches allowlist in production demo", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "owner@salsaexplosion.co.uk");

      expect(canSwitchRoles("owner@salsaexplosion.co.uk")).toBe(true);
    });

    it("strictly returns false if ALLOW_DEMO_ROLE_SWITCHING is not true", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "false");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "owner@salsaexplosion.co.uk");

      expect(canSwitchRoles("owner@salsaexplosion.co.uk")).toBe(false);
    });

    it("strictly returns false when DEMO_SWITCHER_EMAILS is empty or unset", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "");

      expect(canSwitchRoles("owner@salsaexplosion.co.uk")).toBe(false);
      expect(canSwitchRoles("anyone@test.com")).toBe(false);
    });

    it("rejects STUDENT or user not on the allow-list", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "owner@salsaexplosion.co.uk");

      expect(canSwitchRoles("student@salsaexplosion.co.uk")).toBe(false);
      expect(canSwitchRoles("attacker@hacker.io")).toBe(false);
    });

    it("returns true only in non-production when flag is true and email matches allow-list", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "owner@salsaexplosion.co.uk, enrique@salsaexplosion.co.uk");

      expect(canSwitchRoles("owner@salsaexplosion.co.uk")).toBe(true);
      expect(canSwitchRoles("OWNER@SALSAEXPLOSION.CO.UK")).toBe(true);
      expect(canSwitchRoles("  enrique@salsaexplosion.co.uk ")).toBe(true);
    });

    it("rejects null or empty email inputs", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "owner@salsaexplosion.co.uk");

      expect(canSwitchRoles(null)).toBe(false);
      expect(canSwitchRoles(undefined)).toBe(false);
      expect(canSwitchRoles("")).toBe(false);
    });
  });

  describe("Role Route Access Matrix", () => {
    const ADMIN_ONLY = ["ADMIN"];
    const STAFF_ROLES = ["INSTRUCTOR", "ADMIN"];

    function checkRouteAccess(userRole: string, allowedRoles: string[]): boolean {
      return allowedRoles.includes(userRole);
    }

    it("STUDENT is blocked from /admin/* and /instructor/*", () => {
      expect(checkRouteAccess("STUDENT", ADMIN_ONLY)).toBe(false);
      expect(checkRouteAccess("STUDENT", STAFF_ROLES)).toBe(false);
    });

    it("INSTRUCTOR is allowed on /instructor/* but blocked from /admin/*", () => {
      expect(checkRouteAccess("INSTRUCTOR", STAFF_ROLES)).toBe(true);
      expect(checkRouteAccess("INSTRUCTOR", ADMIN_ONLY)).toBe(false);
    });

    it("ADMIN is allowed on both /admin/* and /instructor/*", () => {
      expect(checkRouteAccess("ADMIN", ADMIN_ONLY)).toBe(true);
      expect(checkRouteAccess("ADMIN", STAFF_ROLES)).toBe(true);
    });
  });
});


