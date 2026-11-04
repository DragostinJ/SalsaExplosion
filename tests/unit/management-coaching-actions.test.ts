/**
 * Management Coaching Actions Unit Test Suite
 *
 * Protects:
 * 1. Staff-only status management: Only INSTRUCTOR and ADMIN can update private lesson booking status;
 *    unauthenticated callers and students are refused with FORBIDDEN.
 * 2. Database degradation resilience: Refuses fallback users with SERVICE_UNAVAILABLE.
 * 3. Validation: Enforces valid private lesson status transitions (PENDING, CONFIRMED, COMPLETED, CANCELLED) and non-empty ID.
 * 4. Record isolation: Non-existent or arbitrary IDs return NOT_FOUND and cannot mutate unintended booking records.
 * 5. Forensic audit logging: Writes an EVENT_MUTATION audit record capturing staff ID, target ID, and status transition.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditAction, Role } from "@prisma/client";
import { updatePrivateLessonBookingStatusAction } from "@/actions/management/coaching.actions";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth-user
const { getOrProvisionCurrentUserMock } = vi.hoisted(() => ({
  getOrProvisionCurrentUserMock: vi.fn(),
}));

vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: getOrProvisionCurrentUserMock,
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
  SERVICE_UNAVAILABLE_MESSAGE:
    "We can't reach our booking system right now. Please try again in a minute.",
}));

// Mock audit-log
const { recordAuditLogMock } = vi.hoisted(() => ({
  recordAuditLogMock: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: recordAuditLogMock,
}));

// Mock Prisma
const { prismaPrivateLessonBookingMock } = vi.hoisted(() => ({
  prismaPrivateLessonBookingMock: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    privateLessonBooking: prismaPrivateLessonBookingMock,
  },
}));

describe("src/actions/management/coaching.actions.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses unauthenticated callers and students with FORBIDDEN", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue(null);

    const unauthRes = await updatePrivateLessonBookingStatusAction({
      bookingId: "book-1",
      status: "CONFIRMED",
    });
    expect(unauthRes.success).toBe(false);
    if (!unauthRes.success) {
      expect(unauthRes.error.code).toBe("FORBIDDEN");
    }

    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "student-1",
      role: Role.STUDENT,
    });

    const studentRes = await updatePrivateLessonBookingStatusAction({
      bookingId: "book-1",
      status: "CONFIRMED",
    });
    expect(studentRes.success).toBe(false);
    if (!studentRes.success) {
      expect(studentRes.error.code).toBe("FORBIDDEN");
    }
    expect(prismaPrivateLessonBookingMock.update).not.toHaveBeenCalled();
  });

  it("refuses fallback users under degraded pooler conditions", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "fallback-instructor",
      role: Role.INSTRUCTOR,
    });

    const res = await updatePrivateLessonBookingStatusAction({
      bookingId: "book-1",
      status: "CONFIRMED",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
    }
    expect(prismaPrivateLessonBookingMock.update).not.toHaveBeenCalled();
  });

  it("validates bookingId and status enum", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "staff-1",
      role: Role.INSTRUCTOR,
    });

    const emptyIdRes = await updatePrivateLessonBookingStatusAction({
      bookingId: "",
      status: "CONFIRMED",
    });
    expect(emptyIdRes.success).toBe(false);
    if (!emptyIdRes.success) {
      expect(emptyIdRes.error.code).toBe("VALIDATION_ERROR");
    }

    const badStatusRes = await updatePrivateLessonBookingStatusAction({
      bookingId: "book-1",
      status: "TENTATIVE" as unknown as "CONFIRMED",
    });
    expect(badStatusRes.success).toBe(false);
    if (!badStatusRes.success) {
      expect(badStatusRes.error.code).toBe("VALIDATION_ERROR");
    }
    expect(prismaPrivateLessonBookingMock.update).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when private lesson record does not exist", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "staff-1",
      role: Role.ADMIN,
    });
    prismaPrivateLessonBookingMock.findUnique.mockResolvedValue(null);

    const res = await updatePrivateLessonBookingStatusAction({
      bookingId: "non-existent-booking",
      status: "CONFIRMED",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("NOT_FOUND");
    }
    expect(prismaPrivateLessonBookingMock.update).not.toHaveBeenCalled();
    expect(recordAuditLogMock).not.toHaveBeenCalled();
  });

  it("updates private lesson status and writes EVENT_MUTATION audit log", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "staff-1",
      role: Role.ADMIN,
    });
    prismaPrivateLessonBookingMock.findUnique.mockResolvedValue({
      id: "book-202",
      status: "PENDING",
    });
    prismaPrivateLessonBookingMock.update.mockResolvedValue({
      id: "book-202",
      status: "CONFIRMED",
    });

    const res = await updatePrivateLessonBookingStatusAction({
      bookingId: "book-202",
      status: "CONFIRMED",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe("CONFIRMED");
    }

    expect(prismaPrivateLessonBookingMock.update).toHaveBeenCalledWith({
      where: { id: "book-202" },
      data: { status: "CONFIRMED" },
    });

    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "staff-1",
        action: AuditAction.EVENT_MUTATION,
        targetType: "PrivateLessonBooking",
        targetId: "book-202",
        metadata: { previousStatus: "PENDING", newStatus: "CONFIRMED" },
      })
    );
  });
});
