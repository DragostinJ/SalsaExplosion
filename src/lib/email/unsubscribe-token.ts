import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed unsubscribe links: /api/email/unsubscribe?u=<userId>&t=<token>.
 * The token is an HMAC of the user id, so a link can't be forged for someone
 * else. Without EMAIL_LINK_SECRET no links can be made, and reminders aren't sent.
 */

function secret(): string | null {
  const value = process.env.EMAIL_LINK_SECRET?.trim();
  return value && value.length >= 16 ? value : null;
}

export function signUnsubscribeToken(userId: string, key = secret()): string | null {
  if (!key) return null;
  return createHmac("sha256", key).update(`unsubscribe:class-reminders:${userId}`).digest("base64url");
}

export function verifyUnsubscribeToken(userId: string, token: string, key = secret()): boolean {
  const expected = signUnsubscribeToken(userId, key);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function buildUnsubscribeUrl(appUrl: string, userId: string, key = secret()): string | null {
  const token = signUnsubscribeToken(userId, key);
  if (!token) return null;
  return `${appUrl.replace(/\/$/, "")}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${token}`;
}
