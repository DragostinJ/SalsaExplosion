import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role, TransactionType, AuditAction } from "@prisma/client";
import { redeemFreeClassAction } from "@/actions/management/redemption.actions";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit-log";

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

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    booking: {
      findUnique: vi.fn(),
    },
    user: {
      updateMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    creditLedger: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("redeemFreeClassAction: Door Free Class Redemption", () => {
  const mockInstructor = {
    id: "inst_123",
    clerkId: "clerk_inst_123",
    email: "enrique@salsaexplosion.co.uk",
    firstName: "Enrique",
    lastName: "Perez",
    role: Role.INSTRUCTOR,
  };

  const mockStudent = {
    id: "usr_student_1",
    clerkId: "clerk_student_1",
    email: "dancer@example.com",
    firstName: "Maria",
    lastName: "Santos",
    role: Role.STUDENT,
  };

  const mockBooking = {
    id: "booking_123",
    userId: "usr_student_1",
    classSessionId: "session_456",
    user: {
      id: "usr_student_1",
      firstName: "Maria",
      lastName: "Santos",
      classCredits: 2,
    },
    classSession: {
      id: "session_456",
      title: "Cuban Salsa Casino & Rueda",
      isCancelled: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses when caller is a STUDENT", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockStudent as never);

    const res = await redeemFreeClassAction({ bookingId: "booking_123" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("FORBIDDEN");
      expect(res.error.message).toContain("Only Instructors and Studio Admins");
    }
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("refuses when caller is a fallback user", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      ...mockInstructor,
      id: "fallback-inst_123",
    } as never);

    const res = await redeemFreeClassAction({ bookingId: "booking_123" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
    }
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("refuses if the dancer has no credit (0 credits), writing nothing", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockInstructor as never);

    const zeroCreditBooking = {
      ...mockBooking,
      user: { ...mockBooking.user, classCredits: 0 },
    };

    const mockTx = {
      booking: { findUnique: vi.fn().mockResolvedValue(zeroCreditBooking) },
      creditLedger: { findFirst: vi.fn(), create: vi.fn() },
      user: { updateMany: vi.fn(), findUniqueOrThrow: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const cb = callback as unknown as (tx: unknown) => Promise<unknown>;
      return cb(mockTx) as never;
    });

    const res = await redeemFreeClassAction({ bookingId: "booking_123" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("REDEMPTION_REFUSED");
      expect(res.error.message).toBe("Dancer has no free class credits available.");
    }
    expect(mockTx.user.updateMany).not.toHaveBeenCalled();
    expect(mockTx.creditLedger.create).not.toHaveBeenCalled();
    expect(recordAuditLog).not.toHaveBeenCalled();
  });

  it("refuses if a booking was already redeemed with a free class (idempotency key), writing nothing", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockInstructor as never);

    const mockTx = {
      booking: { findUnique: vi.fn().mockResolvedValue(mockBooking) },
      creditLedger: {
        findFirst: vi.fn().mockResolvedValue({
          id: "ledger_existing",
          bookingId: "booking_123",
          description: "Free class used at the door: Cuban Salsa Casino & Rueda",
        }),
        create: vi.fn(),
      },
      user: { updateMany: vi.fn(), findUniqueOrThrow: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const cb = callback as unknown as (tx: unknown) => Promise<unknown>;
      return cb(mockTx) as never;
    });

    const res = await redeemFreeClassAction({ bookingId: "booking_123" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("REDEMPTION_REFUSED");
      expect(res.error.message).toBe("This booking has already been redeemed with a free class.");
    }
    expect(mockTx.user.updateMany).not.toHaveBeenCalled();
    expect(mockTx.creditLedger.create).not.toHaveBeenCalled();
    expect(recordAuditLog).not.toHaveBeenCalled();
  });

  it("refuses if the class session is cancelled", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockInstructor as never);

    const cancelledClassBooking = {
      ...mockBooking,
      classSession: { ...mockBooking.classSession, isCancelled: true },
    };

    const mockTx = {
      booking: { findUnique: vi.fn().mockResolvedValue(cancelledClassBooking) },
      creditLedger: { findFirst: vi.fn(), create: vi.fn() },
      user: { updateMany: vi.fn(), findUniqueOrThrow: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const cb = callback as unknown as (tx: unknown) => Promise<unknown>;
      return cb(mockTx) as never;
    });

    const res = await redeemFreeClassAction({ bookingId: "booking_123" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("REDEMPTION_REFUSED");
      expect(res.error.message).toBe("Cannot redeem a free class for a cancelled session.");
    }
    expect(mockTx.user.updateMany).not.toHaveBeenCalled();
    expect(mockTx.creditLedger.create).not.toHaveBeenCalled();
    expect(recordAuditLog).not.toHaveBeenCalled();
  });

  it("successfully redeems: decrements credit by 1, creates ledger row with bookingId and audit log", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockInstructor as never);

    const mockTx = {
      booking: { findUnique: vi.fn().mockResolvedValue(mockBooking) },
      creditLedger: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "ledger_new" }),
      },
      user: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          id: "usr_student_1",
          firstName: "Maria",
          lastName: "Santos",
          classCredits: 1,
        }),
      },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const cb = callback as unknown as (tx: unknown) => Promise<unknown>;
      return cb(mockTx) as never;
    });

    const res = await redeemFreeClassAction({ bookingId: "booking_123" });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.bookingId).toBe("booking_123");
      expect(res.data.remainingCredits).toBe(1);
      expect(res.message).toContain("Free class redeemed for Maria Santos");
    }

    // Verify conditional update
    expect(mockTx.user.updateMany).toHaveBeenCalledWith({
      where: { id: "usr_student_1", classCredits: { gte: 1 } },
      data: { classCredits: { decrement: 1 } },
    });

    // Verify CreditLedger creation
    expect(mockTx.creditLedger.create).toHaveBeenCalledWith({
      data: {
        userId: "usr_student_1",
        amount: -1,
        balanceAfter: 1,
        type: TransactionType.ADMIN_ADJUSTMENT,
        bookingId: "booking_123",
        description: "Free class used at the door: Cuban Salsa Casino & Rueda",
      },
    });

    // Verify AuditLog creation
    expect(recordAuditLog).toHaveBeenCalledWith({
      actorId: "inst_123",
      action: AuditAction.CREDIT_ADJUSTMENT,
      targetType: "USER",
      targetId: "usr_student_1",
      metadata: expect.objectContaining({
        studentId: "usr_student_1",
        studentName: "Maria Santos",
        classSessionId: "session_456",
        classTitle: "Cuban Salsa Casino & Rueda",
        bookingId: "booking_123",
        balanceAfter: 1,
        reason: "Free class used at the door",
      }),
    });
  });
});
