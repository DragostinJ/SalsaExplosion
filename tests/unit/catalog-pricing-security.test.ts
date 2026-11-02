import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role, DanceLevel, DanceRole, SubscriptionStatus } from "@prisma/client";
import { COACHING_INSTRUCTORS_CATALOG } from "@/lib/constants/coaching";
import { SHOP_CATALOG } from "@/lib/constants/shop";
import { bookPrivateLessonAction } from "@/actions/lessons.actions";
import { reserveMerchItemAction } from "@/actions/shop.actions";
import { cancelClassSessionWithRefundsAction } from "@/actions/management.actions";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth-user module
vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
  requireRole: vi.fn(),
  canSwitchRoles: vi.fn(),
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
  SERVICE_UNAVAILABLE_MESSAGE: "We can't reach our booking system right now. Please try again in a minute.",
  STAFF_ROLES: [Role.INSTRUCTOR, Role.ADMIN],
  ADMIN_ONLY: [Role.ADMIN],
}));

// Mock audit-log
vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(true),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    privateLessonBooking: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    merchReservation: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    creditLedger: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    classSession: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    booking: {
      update: vi.fn(),
    },
  },
}));

import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

type MockUser = NonNullable<Awaited<ReturnType<typeof getOrProvisionCurrentUser>>>;

function createMockStudent(overrides?: Partial<MockUser>): MockUser {
  return {
    id: "usr_student_1234",
    clerkId: "clerk_student_1234",
    email: "student@bournemouth.co.uk",
    firstName: "Sofia",
    lastName: "Martinez",
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
    classRemindersOptOut: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as MockUser;
}

function createMockAdmin(overrides?: Partial<MockUser>): MockUser {
  return {
    id: "usr_admin_999",
    clerkId: "clerk_admin_999",
    email: "admin@salsaexplosion.co.uk",
    firstName: "Enrique",
    lastName: "Perez",
    avatarUrl: null,
    bio: null,
    specialty: "Director",
    yearsDancing: 25,
    role: Role.ADMIN,
    currentLevel: DanceLevel.ADVANCED,
    preferredRole: DanceRole.LEAD,
    classCredits: 99,
    stripeCustomerId: null,
    subscription: null,
    classRemindersOptOut: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as MockUser;
}

describe("F12: Catalog Pricing Security & Transaction Integrity Unit Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Private Coaching Server Catalog Price Enforcement", () => {
    it("strictly charges catalog rate for single hour and block packages", async () => {
      const student = createMockStudent();
      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(student);

      vi.mocked(prisma.privateLessonBooking.create).mockResolvedValue({
        id: "booking_123",
        studentId: student.id,
        instructorName: COACHING_INSTRUCTORS_CATALOG.enrique.name,
        focusTopic: "Cuban Motion & Body Isolation",
        packageType: "SINGLE_1HR",
        preferredSlot: "Friday 18:00",
        totalPricePounds: 65,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await bookPrivateLessonAction({
        instructorId: "enrique",
        focusTopic: "Cuban Motion & Body Isolation",
        packageType: "SINGLE_1HR",
        preferredSlot: "Friday 18:00",
        dancerType: "SOLO",
      });

      expect(res.success).toBe(true);
      expect(prisma.privateLessonBooking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          studentId: student.id,
          totalPricePounds: 65, // Server catalog price for Enrique 1hr
        }),
      });
    });

    it("rejects unknown instructors or invalid focus topics", async () => {
      const student = createMockStudent();
      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(student);

      const res = await bookPrivateLessonAction({
        instructorId: "unknown-hacker" as unknown as "enrique",
        focusTopic: "Invalid Topic",
        packageType: "SINGLE_1HR",
        preferredSlot: "Friday 18:00",
        dancerType: "SOLO",
      });

      expect(res.success).toBe(false);
      const errText = typeof res.error === "string" ? res.error : res.error?.message;
      expect(errText).toBeDefined();
      expect(prisma.privateLessonBooking.create).not.toHaveBeenCalled();
    });
  });

  describe("2. Merch Catalog Server Price & Sizing Enforcement", () => {
    it("enforces server pricing and mandates size for wearable merchandise", async () => {
      const student = createMockStudent();
      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(student);

      // Attempt reserving a hoodie without specifying a size
      const failRes = await reserveMerchItemAction({
        itemId: "hoodie",
        size: undefined,
      });

      expect(failRes.success).toBe(false);
      const failText = typeof failRes.error === "string" ? failRes.error : failRes.error?.message;
      expect(failText).toMatch(/valid size/i);

      // Now reserve with size
      vi.mocked(prisma.merchReservation.create).mockResolvedValue({
        id: "merch_123",
        userId: student.id,
        itemId: "hoodie",
        itemName: SHOP_CATALOG.hoodie.name,
        size: "L",
        pricePounds: SHOP_CATALOG.hoodie.pricePounds,
        status: "RESERVED",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const successRes = await reserveMerchItemAction({
        itemId: "hoodie",
        size: "L",
      });

      expect(successRes.success).toBe(true);
      expect(prisma.merchReservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: student.id,
          pricePounds: 40, // Server catalog rate £40 for hoodie
          size: "L",
        }),
      });
    });
  });

  describe("4. Class Session Cancellation (no credits: classes are paid at the door)", () => {
    it("releases everyone who said they were coming and never touches credits", async () => {
      const admin = createMockAdmin();
      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(admin);

      const mockSession = {
        id: "class_session_789",
        title: "Thursday Rueda de Casino",
        isCancelled: false,
        bookings: [
          { id: "book_1", userId: "student_a" },
          { id: "book_2", userId: "student_b" },
          { id: "book_3", userId: "student_c" },
        ],
      };
      const tx = {
        classSession: {
          findUnique: vi.fn().mockResolvedValue(mockSession),
          update: vi.fn().mockResolvedValue({ ...mockSession, isCancelled: true }),
        },
        booking: { update: vi.fn().mockResolvedValue({}) },
        user: { update: vi.fn() },
        creditLedger: { findFirst: vi.fn(), create: vi.fn() },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const fn = callback as (client: unknown) => Promise<unknown>;
        return fn(tx);
      });

      const res = await cancelClassSessionWithRefundsAction({
        classSessionId: "class_session_789",
        reason: "Maestro Enrique emergency callout",
      });

      expect(res.success).toBe(true);
      if (!res.success) {
        throw new Error("Expected res.success to be true");
      }
      expect(res.data.cancelledBookings).toBe(3);
      expect(tx.booking.update).toHaveBeenCalledTimes(3);
      expect(tx.user.update).not.toHaveBeenCalled();
      expect(tx.creditLedger.findFirst).not.toHaveBeenCalled();
      expect(tx.creditLedger.create).not.toHaveBeenCalled();
      expect(res.message).not.toMatch(/credit|refund/i);
    });
  });
});
