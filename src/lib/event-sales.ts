import { EventStatus } from "@prisma/client";

/** Customer-facing reasons a pass can't be booked right now (safe to show as-is). */
export const TICKET_SALES_MESSAGES = {
  notPublished: "This event isn't open for online booking.",
  finished: "This event has finished, so passes are no longer on sale.",
  notOpenYet: "Online sales for this pass haven't opened yet.",
  closed: "Online sales for this pass have closed.",
} as const;

/** True once an event's end time has passed. */
export function hasEventEnded(endDate: Date, now: Date = new Date()): boolean {
  return endDate.getTime() < now.getTime();
}

/**
 * Why a ticket tier can't be booked at `now`, or null when it can. Every booking
 * path (Stripe checkout and free RSVPs) checks this on the server, so a past or
 * unpublished event can't be sold even from a stale page.
 */
export function ticketSalesBlockReason(
  event: { status: EventStatus; endDate: Date },
  tier: { salesStartAt: Date; salesEndAt: Date },
  now: Date = new Date()
): string | null {
  if (event.status !== EventStatus.PUBLISHED) return TICKET_SALES_MESSAGES.notPublished;
  if (hasEventEnded(event.endDate, now)) return TICKET_SALES_MESSAGES.finished;
  if (tier.salesStartAt.getTime() > now.getTime()) return TICKET_SALES_MESSAGES.notOpenYet;
  if (tier.salesEndAt.getTime() < now.getTime()) return TICKET_SALES_MESSAGES.closed;
  return null;
}
