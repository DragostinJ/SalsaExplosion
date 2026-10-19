import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  withRateLimit,
  getRateLimitIdentifier,
  getClientIp,
  clearRateLimitCache,
  RATE_LIMIT_RULES,
} from "@/lib/ratelimit";

describe("Rate Limiting Layer", () => {
  beforeEach(() => {
    clearRateLimitCache();
  });

  it("exports valid configured rules for system actions", () => {
    expect(RATE_LIMIT_RULES.CHECKOUT.maxRequests).toBe(5);
    expect(RATE_LIMIT_RULES.BOOKING.maxRequests).toBe(20);
    expect(RATE_LIMIT_RULES.CHECKIN.maxRequests).toBe(10);
    expect(RATE_LIMIT_RULES.ANONYMOUS_QUESTION.maxRequests).toBe(3);
  });

  it("allows requests within configured threshold", async () => {
    const userId = "test-user-within-limit";
    const res1 = await checkRateLimit(userId, "TEST_ACTION", {
      maxRequests: 3,
      windowSeconds: 60,
    });

    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = await checkRateLimit(userId, "TEST_ACTION", {
      maxRequests: 3,
      windowSeconds: 60,
    });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);
  });

  it("blocks requests once maximum limit is reached", async () => {
    const userId = "test-user-exceeded";
    const config = { maxRequests: 2, windowSeconds: 60 };

    await checkRateLimit(userId, "TEST_LIMIT", config);
    await checkRateLimit(userId, "TEST_LIMIT", config);

    const blocked = await checkRateLimit(userId, "TEST_LIMIT", config);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetSeconds).toBeGreaterThan(0);
  });

  it("isolates rate limits between different users", async () => {
    const config = { maxRequests: 1, windowSeconds: 60 };
    const userA = "dancer-lead-01";
    const userB = "dancer-follow-02";

    const resA = await checkRateLimit(userA, "TEST_ISOLATION", config);
    expect(resA.success).toBe(true);

    const blockedA = await checkRateLimit(userA, "TEST_ISOLATION", config);
    expect(blockedA.success).toBe(false);

    // User B should still succeed
    const resB = await checkRateLimit(userB, "TEST_ISOLATION", config);
    expect(resB.success).toBe(true);
  });

  it("withRateLimit wrapper returns typed RATE_LIMITED domain error when limit is exceeded", async () => {
    const userId = "user-wrapper-test";
    const config = { maxRequests: 1, windowSeconds: 60 };

    const firstCall = await withRateLimit(
      userId,
      "WRAPPER_ACTION",
      async () => ({ success: true, data: "ok" }),
      config
    );
    expect(firstCall).toEqual({ success: true, data: "ok" });

    const secondCall = await withRateLimit(
      userId,
      "WRAPPER_ACTION",
      async () => ({ success: true, data: "ok" }),
      config
    );
    expect(secondCall).toMatchObject({
      success: false,
      error: { code: "RATE_LIMITED" },
    });
  });

  describe("Server Action Specific Limit Enforcement", () => {
    it("CHECKOUT: rejects the 6th call in the window (limit 5/min)", async () => {
      const id = "checkout-user-1";
      for (let i = 0; i < 5; i++) {
        const res = await withRateLimit(id, "CHECKOUT", async () => ({ success: true }));
        expect(res).toEqual({ success: true });
      }

      // 6th call must be blocked
      const sixthCall = await withRateLimit(id, "CHECKOUT", async () => ({ success: true }));
      expect(sixthCall).toMatchObject({
        success: false,
        error: { code: "RATE_LIMITED" },
      });
    });

    it("SHOP_RESERVATION: rejects the 6th call in the window (limit 5/10min)", async () => {
      const id = "shop-user-1";
      for (let i = 0; i < 5; i++) {
        const res = await withRateLimit(id, "SHOP_RESERVATION", async () => ({ success: true }));
        expect(res).toEqual({ success: true });
      }

      const sixthCall = await withRateLimit(id, "SHOP_RESERVATION", async () => ({ success: true }));
      expect(sixthCall).toMatchObject({
        success: false,
        error: { code: "RATE_LIMITED" },
      });
    });

    it("LESSON_RESERVATION: rejects the 6th call in the window (limit 5/10min)", async () => {
      const id = "lesson-user-1";
      for (let i = 0; i < 5; i++) {
        const res = await withRateLimit(id, "LESSON_RESERVATION", async () => ({ success: true }));
        expect(res).toEqual({ success: true });
      }

      const sixthCall = await withRateLimit(id, "LESSON_RESERVATION", async () => ({ success: true }));
      expect(sixthCall).toMatchObject({
        success: false,
        error: { code: "RATE_LIMITED" },
      });
    });

    it("ANONYMOUS_QUESTION: rejects the 4th call from the same IP (limit 3/10min)", async () => {
      const ipId = "ip:192.168.1.100";
      for (let i = 0; i < 3; i++) {
        const res = await withRateLimit(ipId, "ANONYMOUS_QUESTION", async () => ({ success: true }));
        expect(res).toEqual({ success: true });
      }

      const fourthCall = await withRateLimit(ipId, "ANONYMOUS_QUESTION", async () => ({ success: true }));
      expect(fourthCall).toMatchObject({
        success: false,
        error: { code: "RATE_LIMITED" },
      });
    });

    it("CHECKIN (QR scan): rejects the 11th call in the window (limit 10/min)", async () => {
      const id = "checkin-dancer-1";
      for (let i = 0; i < 10; i++) {
        const res = await withRateLimit(id, "CHECKIN", async () => ({ success: true }));
        expect(res).toEqual({ success: true });
      }

      const eleventhCall = await withRateLimit(id, "CHECKIN", async () => ({ success: true }));
      expect(eleventhCall).toMatchObject({
        success: false,
        error: { code: "RATE_LIMITED" },
      });
    });

    it("BOOKING: rejects the 21st call in the window (limit 20/min)", async () => {
      const id = "booking-dancer-1";
      for (let i = 0; i < 20; i++) {
        const res = await withRateLimit(id, "BOOKING", async () => ({ success: true }));
        expect(res).toEqual({ success: true });
      }

      const twentyFirstCall = await withRateLimit(id, "BOOKING", async () => ({ success: true }));
      expect(twentyFirstCall).toMatchObject({
        success: false,
        error: { code: "RATE_LIMITED" },
      });
    });

    it("EXPORT: rejects the 11th call per hour for an admin (limit 10/hr)", async () => {
      const adminId = "admin-export-1";
      for (let i = 0; i < 10; i++) {
        const res = await withRateLimit(adminId, "EXPORT", async () => ({ success: true }));
        expect(res).toEqual({ success: true });
      }

      const eleventhCall = await withRateLimit(adminId, "EXPORT", async () => ({ success: true }));
      expect(eleventhCall).toMatchObject({
        success: false,
        error: { code: "RATE_LIMITED" },
      });
    });
  });

  describe("Identifier Resolution", () => {
    it("returns default fallback IP when run outside request context", async () => {
      const ip = await getClientIp();
      expect(ip).toBe("127.0.0.1");
    });

    it("prioritizes userId over IP when available", async () => {
      const identifier = await getRateLimitIdentifier("user_12345");
      expect(identifier).toBe("user:user_12345");
    });

    it("falls back to IP identifier when userId is null or empty", async () => {
      const identifier = await getRateLimitIdentifier(null);
      expect(identifier.startsWith("ip:")).toBe(true);
    });
  });
});
