import { beforeEach, describe, expect, it, vi } from "vitest";

const { constructEvent, listSessions, updateMany, findProcessed, createProcessed } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  listSessions: vi.fn(),
  updateMany: vi.fn(),
  findProcessed: vi.fn(),
  createProcessed: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent },
    checkout: { sessions: { list: listSessions } },
  },
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    processedWebhookEvent: { findUnique: findProcessed, create: createProcessed },
    eventRegistration: { updateMany },
  },
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "stripe-signature": "sig" }),
}));

import { POST } from "@/app/api/webhooks/stripe/route";

function refundEvent(charge: Record<string, unknown>) {
  constructEvent.mockReturnValue({ id: "evt_1", type: "charge.refunded", data: { object: charge } });
}

const request = () => new Request("http://localhost/api/webhooks/stripe", { method: "POST", body: "{}", headers: { "stripe-signature": "sig" } });

describe("Stripe refund webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_realistic_value");
    findProcessed.mockResolvedValue(null);
    createProcessed.mockResolvedValue({});
    listSessions.mockResolvedValue({ data: [{ id: "cs_1" }] });
  });

  it("cancels the pass when the payment is fully refunded", async () => {
    refundEvent({ refunded: true, payment_intent: "pi_1" });
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(listSessions).toHaveBeenCalledWith({ payment_intent: "pi_1", limit: 1 });
    expect(updateMany).toHaveBeenCalledWith({ where: { stripeSessionId: "cs_1" }, data: { paymentStatus: "REFUNDED" } });
  });

  it("keeps the pass after a partial refund", async () => {
    refundEvent({ refunded: false, payment_intent: "pi_1" });
    await POST(request());
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("ignores a refund that isn't for a ticket", async () => {
    refundEvent({ refunded: true, payment_intent: "pi_2" });
    listSessions.mockResolvedValue({ data: [] });
    await POST(request());
    expect(updateMany).not.toHaveBeenCalled();
  });
});
