import { describe, it, expect } from "vitest";
import { getSafeAppUrl, isNextControlFlowError } from "@/lib/safe-url";
import { getValidatedEnv } from "@/lib/env";

describe("I2: Safe URL Resolution & Fail-Soft Resilience Guard", () => {
  describe("getSafeAppUrl", () => {
    it("falls back to default https://salsaexplosion.co.uk when input is undefined or empty", () => {
      expect(getSafeAppUrl(undefined).href).toBe("https://salsaexplosion.co.uk/");
      expect(getSafeAppUrl(null).href).toBe("https://salsaexplosion.co.uk/");
      expect(getSafeAppUrl("").href).toBe("https://salsaexplosion.co.uk/");
      expect(getSafeAppUrl("   ").href).toBe("https://salsaexplosion.co.uk/");
    });

    it("normalizes URLs lacking a protocol by prepending https://", () => {
      const url = getSafeAppUrl("salsaexplosion.co.uk");
      expect(url.href).toBe("https://salsaexplosion.co.uk/");
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toBe("salsaexplosion.co.uk");
    });

    it("strips wrapping quotes from environment variable values without throwing", () => {
      const url = getSafeAppUrl('"http://localhost:3000"');
      expect(url.href).toBe("http://localhost:3000/");
      expect(url.hostname).toBe("localhost");
    });

    it("gracefully catches malformed URLs and returns fallback without throwing uncaught TypeError", () => {
      const url = getSafeAppUrl(":::not a valid url:::");
      expect(url.href).toBe("https://salsaexplosion.co.uk/");
    });
  });

  describe("isNextControlFlowError", () => {
    it("identifies Next.js internal dynamic usage bail-out signals", () => {
      const dynamicError = { digest: "DYNAMIC_SERVER_USAGE" };
      expect(isNextControlFlowError(dynamicError)).toBe(true);
    });

    it("identifies Next.js bailout to client-side rendering signals", () => {
      expect(isNextControlFlowError({ digest: "BAILOUT_TO_CLIENT_SIDE_RENDERING" })).toBe(true);
    });

    it("identifies Next.js redirect control signals", () => {
      const redirectError = { digest: "NEXT_REDIRECT;replace;/login;307" };
      expect(isNextControlFlowError(redirectError)).toBe(true);
    });

    it("identifies Next.js not-found control signals", () => {
      const notFoundError = { digest: "NEXT_NOT_FOUND" };
      expect(isNextControlFlowError(notFoundError)).toBe(true);
    });

    it("identifies Next.js HTTP error fallback signals", () => {
      expect(isNextControlFlowError({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" })).toBe(true);
    });

    it("identifies Next.js hanging promise rejection signals", () => {
      expect(isNextControlFlowError({ digest: "HANGING_PROMISE_REJECTION" })).toBe(true);
    });

    it("returns false for regular application exceptions, Prisma errors, and auth rejections", () => {
      expect(isNextControlFlowError(new Error("Database connection timed out"))).toBe(false);
      expect(isNextControlFlowError({ message: "P1001" })).toBe(false);
      expect(isNextControlFlowError({ digest: "SOME_OTHER_DIGEST" })).toBe(false);
      expect(isNextControlFlowError(null)).toBe(false);
      expect(isNextControlFlowError(undefined)).toBe(false);
      expect(isNextControlFlowError("string error")).toBe(false);
      expect(isNextControlFlowError(12345)).toBe(false);
    });
  });

  describe("Lazy Environment Validation", () => {
    it("throws named validation message when production environment lacks live secrets", () => {
      expect(() =>
        getValidatedEnv({
          NODE_ENV: "production",
          STRIPE_SECRET_KEY: "sk_test_placeholder",
          CLERK_SECRET_KEY: "",
        })
      ).toThrow(/ENVIRONMENT_CONFIGURATION_ERROR/);
    });
  });
});
