/**
 * Defense-in-Depth Security & Sanitization Layer for Uploads & AI Multimodal Vision
 * - Binary Magic-Byte Inspection (JPEG, PNG, WebP)
 * - XSS & Prompt-Injection Output Sanitization
 * - Strict URL allowlist for event CTAs
 * - Sliding-Window Rate Limiter
 */

export interface MagicByteValidationResult {
  valid: boolean;
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
  error?: string;
}

/**
 * Inspects the first 12 bytes of a raw Uint8Array / Buffer to guarantee authentic image binary signatures.
 * Explicitly rejects spoofed extensions (e.g. .svg, .html, .exe disguised as .jpg).
 */
export function verifyImageMagicBytes(buffer: Uint8Array): MagicByteValidationResult {
  if (!buffer || buffer.length < 12) {
    return {
      valid: false,
      error: "Payload too small to contain valid image binary headers (min 12 bytes required).",
    };
  }

  // 1. JPEG: 0xFF, 0xD8, 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: "image/jpeg" };
  }

  // 2. PNG: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: "image/png" };
  }

  // 3. WebP: RIFF (0x52, 0x49, 0x46, 0x46) at bytes 0-3, and WEBP (0x57, 0x45, 0x42, 0x50) at bytes 8-11
  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46;

  const isWebp =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  if (isRiff && isWebp) {
    return { valid: true, mimeType: "image/webp" };
  }

  return {
    valid: false,
    error:
      "Security violation: Unsupported or spoofed binary image format. Only authentic JPEG, PNG, and WebP are allowed.",
  };
}

/**
 * Strips HTML tags, null bytes, and malicious control characters from AI-extracted strings.
 */
export function sanitizeExtractedString(input: string): string {
  if (!input) return "";

  return input
    // Strip null bytes and control chars
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Strip HTML tags completely (<script>, <iframe>, <svg>, <style>, etc.)
    .replace(/<[^>]*>?/gm, "")
    // Trim excess whitespace
    .trim();
}

/**
 * Safe URL Sanitizer for event CTA links.
 * Strictly blocks javascript:, data:, vbscript:, file:, and unknown external domains.
 */
export const ALLOWED_CTA_DOMAINS = [
  "salsaexplosion.co.uk",
  "www.salsaexplosion.co.uk",
  "salsa-explosion-bkgf.vercel.app",
  "www.fatsoma.com",
  "fatsoma.com",
  "www.eventbrite.co.uk",
  "eventbrite.co.uk",
] as const;

export function sanitizeSafeEventUrl(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return "/events";
  }

  const clean = url.trim();

  // Allow safe relative paths
  if (clean.startsWith("/") && !clean.startsWith("//")) {
    return clean;
  }

  try {
    const parsed = new URL(clean);

    // Strictly enforce https or http (no javascript:, data:, file:)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "/events";
    }

    const host = parsed.hostname.toLowerCase();
    const isAllowed = ALLOWED_CTA_DOMAINS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`)
    );

    if (isAllowed) {
      return parsed.toString();
    }

    // Default to /events if unrecognized external domain
    return "/events";
  } catch {
    return "/events";
  }
}

/**
 * In-Memory Sliding-Window Rate Limiter for AI Extraction calls
 * Limit: 10 calls per 60 seconds per identifier (userId or IP).
 */
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkAiRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const record = rateLimitStore.get(identifier) || { timestamps: [] };

  // Remove timestamps older than the window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.timestamps.push(now);
  rateLimitStore.set(identifier, record);

  return { allowed: true, remaining: limit - record.timestamps.length };
}

/**
 * Helper to clear rate limit store (useful in tests)
 */
export function resetAiRateLimitStore(): void {
  rateLimitStore.clear();
}
