import { describe, it, expect } from "vitest";
import { checkRateLimit, withRateLimit } from "@/lib/ratelimit";

describe("Rate Limiting Layer", () => {
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

  it("withRateLimit wrapper returns domain error when limit is exceeded", async () => {
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
      error: { code: "RATE_LIMIT_EXCEEDED" },
    });
  });
});
