import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Role, DanceLevel, DanceRole } from "@prisma/client";
import {
  createCheckoutSessionAction,
  createEventCheckoutSessionAction,
} from "@/actions/checkout.actions";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/ratelimit", () => ({
  withRateLimit: vi.fn((_id: string, _action: string, fn: () => Promise<unknown>) => fn()),
  getRateLimitIdentifier: vi.fn().mockResolvedValue("test-user-id"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    eventTicketTier: {
      findUnique: vi.fn(),
    },
    eventRegistration: {
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

describe("H2: Checkout Demo-Payment Production Guards", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };

    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "usr_student_123",
      email: "dancer@bournemouth.co.uk",
      firstName: "Dancer",
      lastName: "Casinero",
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
      preferredRole: DanceRole.LEAD,
      classCredits: 2,
      stripeCustomerId: null,
      clerkId: "clerk_123",
      subscription: null,
      avatarUrl: null,
      bio: null,
      specialty: null,
      yearsDancing: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof getOrProvisionCurrentUser>>);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("blocks unconfigured package demo checkout in production when ALLOW_DEMO_PAYMENTS is not true", async () => {
    Object.assign(process.env, { NODE_ENV: "production", STRIPE_SECRET_KEY: "sk_test_placeholder_for_build" });
    delete process.env.ALLOW_DEMO_PAYMENTS;
    delete process.env.STRIPE_PRICE_5_PACK;
    delete process.env.STRIPE_PRICE_ID_PACK_5;

    const result = await createCheckoutSessionAction({
      packageId: "PACK_5",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("MISSING_STRIPE_CONFIG");
      expect(result.error.message).toMatch(/Live payment processing is not configured for this package/);
    }
  });

  it("blocks unconfigured festival event pass demo registration in production when ALLOW_DEMO_PAYMENTS is not true", async () => {
    Object.assign(process.env, { NODE_ENV: "production", STRIPE_SECRET_KEY: "sk_test_placeholder_for_build" });
    delete process.env.ALLOW_DEMO_PAYMENTS;
    delete process.env.STRIPE_PRICE_CONGRESS_PASS;

    vi.mocked(prisma.eventTicketTier.findUnique).mockResolvedValue({
      id: "tier_made_in_cuba_pass",
      name: "Full Congress Pass",
      priceInCents: 9500,
      totalCapacity: 100,
      maxLeads: null,
      maxFollows: null,
      eventId: "evt_123",
      createdAt: new Date(),
      updatedAt: new Date(),
      event: {
        id: "evt_123",
        title: "MADE IN CUBA 2026",
        slug: "made-in-cuba-dance-weekend-2026",
      },
      registrations: [],
    } as unknown as NonNullable<Awaited<ReturnType<typeof prisma.eventTicketTier.findUnique>>>);

    const result = await createEventCheckoutSessionAction({
      eventId: "evt_123",
      ticketTierId: "tier_made_in_cuba_pass",
      role: "LEAD",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("MISSING_STRIPE_CONFIG");
      expect(result.error.message).toMatch(/Live payment processing is not configured for this pass/);
    }
  });
});
