import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getMyPassContextAction,
  getMyPrivateLessonBookingsAction,
} from "@/actions/viewer.actions";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    privateLessonBooking: {
      findMany: vi.fn(),
    },
  },
}));

type MockAuthReturn = Awaited<ReturnType<typeof auth>>;

describe("M6: Viewer Actions for Static Marketing Shells", () => {
  const mockedAuth = vi.mocked(auth);
  const mockedPrismaUser = vi.mocked(prisma.user);
  const mockedPrismaBookings = vi.mocked(prisma.privateLessonBooking);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMyPassContextAction", () => {
    it("returns signedIn: false when no user is logged in", async () => {
      mockedAuth.mockResolvedValueOnce({ userId: null } as unknown as MockAuthReturn);
      const res = await getMyPassContextAction();
      expect(res).toEqual({
        signedIn: false,
        classCredits: 0,
        hasActiveSubscription: false,
      });
      expect(mockedPrismaUser.upsert).not.toHaveBeenCalled();
    });

    it("returns safe defaults when DB findUnique throws", async () => {
      mockedAuth.mockResolvedValueOnce({ userId: "clerk-1" } as unknown as MockAuthReturn);
      mockedPrismaUser.findUnique.mockRejectedValueOnce(new Error("DB timeout"));
      const res = await getMyPassContextAction();
      expect(res).toEqual({
        signedIn: false,
        classCredits: 0,
        hasActiveSubscription: false,
      });
      expect(mockedPrismaUser.upsert).not.toHaveBeenCalled();
    });

    it("returns credits and active subscription on happy path", async () => {
      mockedAuth.mockResolvedValueOnce({ userId: "clerk-2" } as unknown as MockAuthReturn);
      const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      mockedPrismaUser.findUnique.mockResolvedValueOnce({
        classCredits: 6,
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: future,
        },
      } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);

      const res = await getMyPassContextAction();
      expect(res).toEqual({
        signedIn: true,
        classCredits: 6,
        hasActiveSubscription: true,
      });
      expect(mockedPrismaUser.upsert).not.toHaveBeenCalled();
    });
  });

  describe("getMyPrivateLessonBookingsAction", () => {
    it("returns empty array when logged out", async () => {
      mockedAuth.mockResolvedValueOnce({ userId: null } as unknown as MockAuthReturn);
      const res = await getMyPrivateLessonBookingsAction();
      expect(res).toEqual([]);
      expect(mockedPrismaBookings.findMany).not.toHaveBeenCalled();
    });

    it("returns user's booked lessons when authenticated", async () => {
      mockedAuth.mockResolvedValueOnce({ userId: "clerk-3" } as unknown as MockAuthReturn);
      mockedPrismaUser.findUnique.mockResolvedValueOnce({ id: "usr-3" } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);
      mockedPrismaBookings.findMany.mockResolvedValueOnce([
        {
          id: "b-1",
          instructorName: "Enrique",
          focusTopic: "Cuban Body Movement",
          packageType: "SINGLE_1HR",
          preferredSlot: "Thursday 18:00",
          totalPricePounds: 60,
          status: "CONFIRMED",
          createdAt: new Date("2026-10-01T12:00:00Z"),
          studentId: "usr-3",
          dancerType: "SOLO",
          notes: null,
          updatedAt: new Date("2026-10-01T12:00:00Z"),
        },
      ] as unknown as Awaited<ReturnType<typeof prisma.privateLessonBooking.findMany>>);

      const res = await getMyPrivateLessonBookingsAction();
      expect(res.length).toBe(1);
      expect(res[0].id).toBe("b-1");
      expect(res[0].instructorName).toBe("Enrique");
      expect(mockedPrismaUser.upsert).not.toHaveBeenCalled();
    });
  });
});
