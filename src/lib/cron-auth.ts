import { timingSafeEqual } from "node:crypto";

/**
 * Vercel Cron calls our routes with `Authorization: Bearer <CRON_SECRET>`.
 * Fails closed: without CRON_SECRET no request is authorised.
 */
export function isAuthorizedCronRequest(authorizationHeader: string | null, cronSecret = process.env.CRON_SECRET): boolean {
  const key = cronSecret?.trim();
  if (!key || key.length < 16 || !authorizationHeader) return false;
  const expected = Buffer.from(`Bearer ${key}`);
  const received = Buffer.from(authorizationHeader);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
