// src/lib/ratelimit.ts

/**
 * Enterprise Rate Limiting Layer
 * Supports Upstash Redis REST API when configured, with seamless in-memory
 * sliding-window fallback for local development, CI, and test execution.
 */

import { headers } from "next/headers";

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_RULES: Record<string, RateLimitConfig> = {
  CHECKOUT: { maxRequests: 5, windowSeconds: 60 },
  BOOKING: { maxRequests: 20, windowSeconds: 60 },
  CHECKIN: { maxRequests: 10, windowSeconds: 60 },
  ANONYMOUS_QUESTION: { maxRequests: 3, windowSeconds: 600 },
  SHOP_RESERVATION: { maxRequests: 5, windowSeconds: 600 },
  LESSON_RESERVATION: { maxRequests: 5, windowSeconds: 600 },
  EXPORT: { maxRequests: 10, windowSeconds: 3600 },
  ROLE_SWITCH: { maxRequests: 3, windowSeconds: 60 },
  AI_GRADING: { maxRequests: 10, windowSeconds: 60 },
  SUBMISSION: { maxRequests: 10, windowSeconds: 60 },
  RECAP: { maxRequests: 20, windowSeconds: 60 },
  MANAGEMENT: { maxRequests: 30, windowSeconds: 60 },
  // Practice-player loop/replay counters (anonymous, fire-and-forget)
  PRACTICE_EVENT: { maxRequests: 30, windowSeconds: 600 },
} as const;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

// In-memory fallback sliding window cache
const inMemoryCache = new Map<string, number[]>();

// Periodically clean up stale entries (every 5 minutes)
if (typeof setInterval !== "undefined") {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of inMemoryCache.entries()) {
      const active = timestamps.filter((t) => now - t < 120_000);
      if (active.length === 0) {
        inMemoryCache.delete(key);
      } else {
        inMemoryCache.set(key, active);
      }
    }
  }, 300_000);

  if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }
}

/**
 * Checks rate limit for a specific identifier (userId or IP) and action.
 */
export async function checkRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMIT_RULES | string,
  customConfig?: RateLimitConfig
): Promise<RateLimitResult> {
  const config =
    customConfig ??
    (RATE_LIMIT_RULES[action] || { maxRequests: 20, windowSeconds: 60 });

  const { maxRequests, windowSeconds } = config;
  const key = `ratelimit:${action}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Try Upstash Redis if configured
  if (upstashUrl && upstashToken && !upstashUrl.includes("[YOUR-ID]")) {
    try {
      const windowStart = now - windowMs;
      const res = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["ZREMRANGEBYSCORE", key, "0", windowStart.toString()],
          ["ZCARD", key],
          ["ZADD", key, now.toString(), `${now}-${Math.random()}`],
          ["EXPIRE", key, windowSeconds.toString()],
        ]),
        cache: "no-store",
      });

      if (res.ok) {
        const results = await res.json();
        const currentCount = Number(results[1]?.result ?? 0);
        const success = currentCount < maxRequests;

        return {
          success,
          limit: maxRequests,
          remaining: Math.max(0, maxRequests - currentCount - 1),
          resetSeconds: windowSeconds,
        };
      }
    } catch (err) {
      console.warn("[RateLimit]: Upstash call failed, falling back to in-memory:", err);
    }
  }

  // 2. In-Memory Sliding Window Fallback
  const timestamps = inMemoryCache.get(key) ?? [];
  const windowStart = now - windowMs;
  const activeTimestamps = timestamps.filter((t) => t > windowStart);

  if (activeTimestamps.length >= maxRequests) {
    const oldest = activeTimestamps[0] ?? now;
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds,
    };
  }

  activeTimestamps.push(now);
  inMemoryCache.set(key, activeTimestamps);

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - activeTimestamps.length,
    resetSeconds: windowSeconds,
  };
}

/**
 * Resolves client IP address from request headers with graceful fallback.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) return realIp.trim();
  } catch {
    // Graceful fallback outside Next.js request context (e.g. tests)
  }
  return "127.0.0.1";
}

/**
 * Returns a rate limit identifier key, prioritizing authenticated userId
 * and falling back to client IP address.
 */
export async function getRateLimitIdentifier(userId?: string | null): Promise<string> {
  if (userId && userId.trim().length > 0) {
    return `user:${userId.trim()}`;
  }
  const ip = await getClientIp();
  return `ip:${ip}`;
}

/**
 * Clears in-memory sliding window cache (useful for test isolation).
 */
export function clearRateLimitCache(): void {
  inMemoryCache.clear();
}

export interface RateLimitErrorPayload {
  code: "RATE_LIMITED";
  message: string;
}

/**
 * Wrapper for Server Actions with rate limiting.
 */
export async function withRateLimit<T>(
  identifier: string,
  action: keyof typeof RATE_LIMIT_RULES | string,
  fn: () => Promise<T>,
  customConfig?: RateLimitConfig
): Promise<T | { success: false; error: RateLimitErrorPayload }> {
  const result = await checkRateLimit(identifier, action, customConfig);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: `Too many requests. Please wait ${result.resetSeconds}s before trying again.`,
      },
    };
  }

  return fn();
}
