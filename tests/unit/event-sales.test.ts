import { describe, it, expect } from "vitest";
import { EventStatus } from "@prisma/client";
import { TICKET_SALES_MESSAGES, hasEventEnded, ticketSalesBlockReason } from "@/lib/event-sales";
import { UPCOMING_EVENTS, canonicalEventEnd, upcomingCanonicalEvents } from "@/lib/academy-data";

const at = (iso: string) => new Date(iso);
const event = { status: EventStatus.PUBLISHED, endDate: at("2026-11-14T23:59:00Z") };
const tier = { salesStartAt: at("2026-09-01T00:00:00Z"), salesEndAt: at("2026-11-14T19:30:00Z") };

describe("ticket sales window (server-side booking guard)", () => {
  it("allows booking while the event is published and the tier is on sale", () => {
    expect(ticketSalesBlockReason(event, tier, at("2026-11-01T18:00:00Z"))).toBeNull();
  });

  it("refuses finished events, even from a stale page", () => {
    expect(ticketSalesBlockReason(event, tier, at("2026-11-15T00:00:00Z"))).toBe(TICKET_SALES_MESSAGES.finished);
    expect(hasEventEnded(event.endDate, at("2026-11-15T00:00:00Z"))).toBe(true);
    expect(hasEventEnded(event.endDate, at("2026-11-14T20:00:00Z"))).toBe(false);
  });

  it("refuses unpublished events and tiers outside their sales window", () => {
    const now = at("2026-11-01T18:00:00Z");
    expect(ticketSalesBlockReason({ ...event, status: EventStatus.DRAFT }, tier, now)).toBe(TICKET_SALES_MESSAGES.notPublished);
    expect(ticketSalesBlockReason({ ...event, status: EventStatus.CANCELLED }, tier, now)).toBe(TICKET_SALES_MESSAGES.notPublished);
    expect(ticketSalesBlockReason(event, { ...tier, salesStartAt: at("2026-11-05T00:00:00Z") }, now)).toBe(
      TICKET_SALES_MESSAGES.notOpenYet
    );
    expect(ticketSalesBlockReason(event, tier, at("2026-11-14T21:00:00Z"))).toBe(TICKET_SALES_MESSAGES.closed);
  });
});

describe("upcoming canonical events (home page posters, /events fallback)", () => {
  it("keeps every event until it ends, then drops it", () => {
    for (const canonical of UPCOMING_EVENTS) {
      const end = canonicalEventEnd(canonical);
      expect(upcomingCanonicalEvents(at(canonical.startDateIso)).map((e) => e.slug)).toContain(canonical.slug);
      expect(upcomingCanonicalEvents(new Date(end.getTime() + 1)).map((e) => e.slug)).not.toContain(canonical.slug);
    }
  });

  it("an evening party without an end date ends 6 hours after it starts", () => {
    const party = { ...UPCOMING_EVENTS[0], startDateIso: "2026-10-31T19:30:00Z", endDateIso: undefined };
    expect(canonicalEventEnd(party).toISOString()).toBe("2026-11-01T01:30:00.000Z");
  });

  it("the day after Halloween, the Halloween party is no longer listed, and the rest are soonest first", () => {
    const upcoming = upcomingCanonicalEvents(at("2026-11-01T12:00:00Z"));
    expect(upcoming.some((e) => e.slug.includes("halloween"))).toBe(false);
    const starts = upcoming.map((e) => Date.parse(e.startDateIso));
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });
});
