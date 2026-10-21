import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role, DanceLevel, DanceRole } from "@prisma/client";
import { redeemReferralCodeAction } from "@/actions/referral.actions";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth-user module
vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
}));

// Mock audit-log
vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(true),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    creditLedger: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

type MockUser = NonNullable<Awaited<ReturnType<typeof getOrProvisionCurrentUser>>>;
type UserCandidate = { id: string; firstName: string; classCredits: number };

describe("B3: Referral Anti-Exploit Security & Concurrency Hardening", () => {
  const mockStudent: MockUser = {
    id: "usr_student_1234",
    clerkId: "clerk_student_1234",
    email: "student@example.com",
    firstName: "Elena",
    lastName: "Valdes",
    avatarUrl: null,
    bio: null,
    specialty: null,
    yearsDancing: 1,
    role: Role.STUDENT,
    currentLevel: DanceLevel.BEGINNER,
    preferredRole: DanceRole.FOLLOW,
    classCredits: 2,
    stripeCustomerId: null,
    subscription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFriend: MockUser = {
    id: "usr_friend_5678",
    clerkId: "clerk_friend_5678",
    email: "friend@example.com",
    firstName: "Carlos",
    lastName: "Gomez",
    avatarUrl: null,
    bio: null,
    specialty: null,
    yearsDancing: 3,
    role: Role.STUDENT,
    currentLevel: DanceLevel.IMPROVER,
    preferredRole: DanceRole.LEAD,
    classCredits: 3,
    stripeCustomerId: null,
    subscription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockStudent);
  });

  it("blocks fabricated/unknown referral codes when no matching user exists in the database", async () => {
    // Preliminary ledger check: student has not redeemed anything yet
    vi.mocked(prisma.creditLedger.findFirst).mockResolvedValue(null);

    // No user exists with suffix '9999'
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const result = await redeemReferralCodeAction({ code: "SALSA-TEST-9999" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("This referral code was not found or is invalid.");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("permits official studio promo code SALSA-BOH1-2026 even without a matching user", async () => {
    vi.mocked(prisma.creditLedger.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const cb = callback as unknown as (tx: unknown) => Promise<unknown>;
      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([]),
        creditLedger: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: "ledger_1" }),
        },
        user: {
          update: vi.fn().mockResolvedValue({ ...mockStudent, classCredits: 3 }),
        },
      };
      return cb(mockTx) as never;
    });

    const result = await redeemReferralCodeAction({ code: "SALSA-BOH1-2026" });

    expect(result.success).toBe(true);
    expect(result.data?.creditsAwarded).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("awards credit to both student and referrer when a valid friend referral code is provided", async () => {
    vi.mocked(prisma.creditLedger.findFirst).mockResolvedValue(null);
    const candidate: UserCandidate = {
      id: mockFriend.id,
      firstName: mockFriend.firstName,
      classCredits: mockFriend.classCredits,
    };
    vi.mocked(prisma.user.findMany).mockResolvedValue([candidate as never]);

    let studentCreditsUpdated = false;
    let friendCreditsUpdated = false;

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const cb = callback as unknown as (tx: unknown) => Promise<unknown>;
      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([]),
        creditLedger: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: "ledger_1" }),
        },
        user: {
          update: vi.fn().mockImplementation((args: { where: { id: string } }) => {
            if (args.where.id === mockStudent.id) {
              studentCreditsUpdated = true;
              return { ...mockStudent, classCredits: 3 };
            }
            if (args.where.id === mockFriend.id) {
              friendCreditsUpdated = true;
              return { ...mockFriend, classCredits: 4 };
            }
            return mockStudent;
          }),
        },
      };
      return cb(mockTx) as never;
    });

    const result = await redeemReferralCodeAction({ code: "SALSA-CARL-5678" });

    expect(result.success).toBe(true);
    expect(studentCreditsUpdated).toBe(true);
    expect(friendCreditsUpdated).toBe(true);
  });

  it("blocks self-referral attempts when the code suffix matches the caller's own ID", async () => {
    vi.mocked(prisma.creditLedger.findFirst).mockResolvedValue(null);
    const selfCandidate: UserCandidate = {
      id: mockStudent.id,
      firstName: mockStudent.firstName,
      classCredits: mockStudent.classCredits,
    };
    vi.mocked(prisma.user.findMany).mockResolvedValue([selfCandidate as never]);

    const result = await redeemReferralCodeAction({ code: "SALSA-ELEN-1234" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("You cannot redeem your own personal referral code.");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("blocks duplicate redemption when the user already redeemed a referral bonus", async () => {
    // User already has a redemption entry
    vi.mocked(prisma.creditLedger.findFirst).mockResolvedValue({
      id: "ledger_existing",
      userId: mockStudent.id,
      amount: 1,
      balanceAfter: 2,
      type: "ADMIN_ADJUSTMENT",
      description: "REFERRAL_BONUS_REDEEMED:SALSA-BOH1-2026",
      createdAt: new Date(),
    } as never);

    const result = await redeemReferralCodeAction({ code: "SALSA-BOH1-2026" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already redeemed a welcome referral bonus");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("handles race condition where concurrent request already claimed bonus inside transaction", async () => {
    // Passes preliminary check
    vi.mocked(prisma.creditLedger.findFirst).mockResolvedValueOnce(null);
    const candidate: UserCandidate = {
      id: mockFriend.id,
      firstName: mockFriend.firstName,
      classCredits: mockFriend.classCredits,
    };
    vi.mocked(prisma.user.findMany).mockResolvedValue([candidate as never]);

    // But inside transaction row lock, already claimed!
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const cb = callback as unknown as (tx: unknown) => Promise<unknown>;
      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([]),
        creditLedger: {
          findFirst: vi.fn().mockResolvedValue({
            id: "ledger_concurrent",
            userId: mockStudent.id,
            description: "REFERRAL_BONUS_REDEEMED:SALSA-OTHER-9999",
          }),
        },
      };
      return cb(mockTx) as never;
    });

    const result = await redeemReferralCodeAction({ code: "SALSA-CARL-5678" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already redeemed a welcome referral bonus");
  });
});
