import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { DanceRole } from "@prisma/client";
import { EventPassSelector, SerializedEventTier } from "@/components/events/event-pass-selector";

const { mockUser } = vi.hoisted(() => ({
  mockUser: {
    id: "usr-active-123",
    clerkId: "clerk-active-123",
    email: "dancer@salsaexplosion.co.uk",
    firstName: "Elena",
    lastName: "Valdes",
    role: "STUDENT" as const,
    currentLevel: "BEGINNER" as const,
    preferredRole: "LEAD" as const,
    classCredits: 5,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn().mockResolvedValue(mockUser),
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
  SERVICE_UNAVAILABLE_MESSAGE: "We can't reach our booking system right now. Please try again in a minute.",
}));

vi.mock("@/lib/ratelimit", () => ({
  withRateLimit: vi.fn((_id: string, _action: string, fn: () => Promise<unknown>) => fn()),
  getRateLimitIdentifier: vi.fn().mockResolvedValue("test-user-id"),
}));

describe("M3: Event Fallback Purchase Disabling", () => {
  const dummyTier: SerializedEventTier = {
    id: "tier-0",
    eventId: "canonical-0-made-in-cuba",
    name: "General Admission",
    description: "Festival access",
    priceInCents: 9500,
    totalCapacity: 100,
    maxLeads: 50,
    maxFollows: 50,
    bookedLeads: 0,
    bookedFollows: 0,
    totalBooked: 0,
    userRegistration: null,
  };

  it("renders disabled buttons and unavailable banner when purchasesUnavailable is true", () => {
    const html = renderToString(
      <EventPassSelector
        tiers={[dummyTier]}
        defaultPreferredRole={DanceRole.LEAD}
        purchasesUnavailable={true}
      />
    );

    expect(html).toContain('data-testid="event-purchases-unavailable"');
    expect(html).toContain("Online booking is temporarily unavailable");
    expect(html).toContain("disabled");
    expect(html).toContain('aria-disabled="true"');
  });

  it("does not render unavailable banner when purchasesUnavailable is false", () => {
    const html = renderToString(
      <EventPassSelector
        tiers={[dummyTier]}
        defaultPreferredRole={DanceRole.LEAD}
        purchasesUnavailable={false}
      />
    );

    expect(html).not.toContain('data-testid="event-purchases-unavailable"');
  });

  describe("Server Action safety net for fallback tiers", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("rejects createEventCheckoutSessionAction for canonical/tier- ids without accessing DB", async () => {
      const { createEventCheckoutSessionAction } = await import("@/actions/checkout.actions");
      const res = await createEventCheckoutSessionAction({
        eventId: "canonical-0-fest",
        ticketTierId: "tier-0",
        role: DanceRole.LEAD,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("PLAN_UNAVAILABLE");
        expect(res.error.message).toContain("isn't open for online booking yet");
      }
    });

    it("rejects registerForEventTierAction for canonical/tier- ids without accessing DB", async () => {
      const { registerForEventTierAction } = await import("@/actions/management/events.actions");
      const res = await registerForEventTierAction({
        eventId: "canonical-0-fest",
        ticketTierId: "tier-0",
        role: DanceRole.LEAD,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("NOT_FOUND");
        expect(res.error.message).toContain("isn't open for online booking yet");
      }
    });
  });
});
