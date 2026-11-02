import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingStatus, DanceLevel, DanceRole, Role } from "@prisma/client";
import { bookClassAction } from "@/actions/booking.actions";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
  SERVICE_UNAVAILABLE_MESSAGE: "We can't reach our booking system right now. Please try again in a minute.",
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/ratelimit", () => ({
  withRateLimit: vi.fn((_id: string, _action: string, fn: () => Promise<unknown>) => fn()),
  getRateLimitIdentifier: vi.fn().mockResolvedValue("test-user-id"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: vi.fn() },
}));

const tx = {
  user: { findUnique: vi.fn(), update: vi.fn() },
  classSession: { findUnique: vi.fn(), update: vi.fn() },
  booking: { findUnique: vi.fn(), count: vi.fn(), upsert: vi.fn() },
  creditLedger: { create: vi.fn() },
};

/** A class that is already over its room size and all leads: under the old rules it was "full". */
const crowdedUnevenClass = {
  id: "class_thu",
  isCancelled: false,
  startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  minLevel: DanceLevel.BEGINNER,
  maxCapacity: 4,
  maxLeads: 2,
  maxFollows: 2,
  bookedCount: 6,
  creditCost: 1,
};

describe("Enrique's rule: everyone dances, even when the class is busy or uneven", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "usr_dancer",
      role: Role.STUDENT,
    } as unknown as Awaited<ReturnType<typeof getOrProvisionCurrentUser>>);
    tx.user.findUnique.mockResolvedValue({
      id: "usr_dancer",
      currentLevel: DanceLevel.BEGINNER,
      classCredits: 0,
      subscription: null,
    });
    tx.classSession.findUnique.mockResolvedValue(crowdedUnevenClass);
    tx.booking.findUnique.mockResolvedValue(null);
    // Six leads already said they're coming, no follows.
    tx.booking.count.mockResolvedValue(6);
    tx.booking.upsert.mockResolvedValue({ id: "bk_1", status: BookingStatus.CONFIRMED });
    vi.mocked(prisma.$transaction).mockImplementation(
      (async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)) as unknown as typeof prisma.$transaction
    );
  });

  it("reserves a Lead spot in a class that is over its room size and already all leads", async () => {
    const res = await bookClassAction({ classSessionId: "class_thu", danceRole: DanceRole.LEAD });

    expect(res.success).toBe(true);
    expect(tx.booking.upsert).toHaveBeenCalledOnce();
    expect(tx.classSession.update).toHaveBeenCalledWith({
      where: { id: "class_thu" },
      data: { bookedCount: { increment: 1 } },
    });
  });

  it("takes no credits and no payment: a reservation only tells the teachers who is coming", async () => {
    const res = await bookClassAction({ classSessionId: "class_thu", danceRole: DanceRole.FOLLOW });

    expect(res.success).toBe(true);
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.creditLedger.create).not.toHaveBeenCalled();
    if (res.success) {
      expect(res.message).toMatch(/pay at the door/i);
    }
  });
});
