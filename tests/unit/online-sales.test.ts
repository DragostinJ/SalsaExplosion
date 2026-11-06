import { describe, expect, it } from "vitest";
import { onlineTicketSalesOpen } from "@/lib/payments/online-sales";

describe("onlineTicketSalesOpen", () => {
  it("stays shut on the live site with a test key, because no real card would work", () => {
    expect(onlineTicketSalesOpen({ VERCEL_ENV: "production", STRIPE_SECRET_KEY: "sk_test_abc" })).toBe(false);
  });

  it("opens on the live site with a live key", () => {
    expect(onlineTicketSalesOpen({ VERCEL_ENV: "production", STRIPE_SECRET_KEY: "sk_live_abc" })).toBe(true);
    expect(onlineTicketSalesOpen({ VERCEL_ENV: "production", STRIPE_SECRET_KEY: "rk_live_abc" })).toBe(true);
  });

  it("allows a test key on previews and locally, so checkout can be tested", () => {
    expect(onlineTicketSalesOpen({ VERCEL_ENV: "preview", STRIPE_SECRET_KEY: "sk_test_abc" })).toBe(true);
    expect(onlineTicketSalesOpen({ STRIPE_SECRET_KEY: "sk_test_abc" })).toBe(true);
  });

  it("stays shut with no key or a placeholder", () => {
    expect(onlineTicketSalesOpen({})).toBe(false);
    expect(onlineTicketSalesOpen({ STRIPE_SECRET_KEY: "sk_test_placeholder" })).toBe(false);
    expect(onlineTicketSalesOpen({ STRIPE_SECRET_KEY: "sk_..." })).toBe(false);
  });
});
