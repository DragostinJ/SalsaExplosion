import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST as clerkPostHandler } from "@/app/api/webhooks/clerk/route";
import { POST as stripePostHandler } from "@/app/api/webhooks/stripe/route";

describe("A7: Secret Hygiene & Production Webhook Safeguards", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("proves Clerk webhook returns 500 when CLERK_WEBHOOK_SECRET is placeholder in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CLERK_WEBHOOK_SECRET", "whsec_placeholder");

    const dummyReq = new Request("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify({ type: "user.created" }),
    });

    const response = await clerkPostHandler(dummyReq);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toContain("Invalid webhook secret configuration in production");
  });

  it("proves Stripe webhook returns 500 when STRIPE_WEBHOOK_SECRET is placeholder in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_placeholder");

    const dummyReq = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({ type: "payment_intent.succeeded" }),
    });

    const response = await stripePostHandler(dummyReq);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toContain("Invalid webhook secret configuration in production");
  });

  it("proves Clerk webhook returns 500 when CLERK_WEBHOOK_SECRET is missing entirely", async () => {
    vi.stubEnv("CLERK_WEBHOOK_SECRET", "");

    const dummyReq = new Request("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify({ type: "user.created" }),
    });

    const response = await clerkPostHandler(dummyReq);
    expect(response.status).toBe(500);
  });

  it("proves Stripe webhook returns 500 when STRIPE_WEBHOOK_SECRET is missing entirely", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");

    const dummyReq = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({ type: "payment_intent.succeeded" }),
    });

    const response = await stripePostHandler(dummyReq);
    expect(response.status).toBe(500);
  });
});
