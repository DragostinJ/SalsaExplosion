/**
 * Management Check-In Actions Unit Test Suite
 *
 * Protects:
 * 1. Attendance override authorization: toggleBookingCheckInAction and toggleEventRegistrationCheckInAction
 *    refuse students and unauthenticated callers with FORBIDDEN; fallback users are refused with SERVICE_UNAVAILABLE.
 * 2. Input validation: Invalid booking IDs, pass IDs, and malformed QR session parameters are rejected.
 * 3. Self-check-in isolation: selfCheckInClassQrAction strictly scopes queries to the session user's ID
 *    (the booking lookup composite key userId_classSessionId uses user.id from auth, never from client input).
 * 4. Temporal window enforcement: Self-check-in rejects attempts before the 90-minute pre-class window (CHECK_IN_NOT_OPEN)
 *    and attempts after the class conclusion window (CLASS_ENDED).
 * 5. Lifecycle integrity: Cancelled classes reject check-ins (CLASS_CANCELLED); unbooked dancers are refused (NO_ACTIVE_BOOKING).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditAction, BookingStatus, Role } from "@prisma/client";
import {
  toggleBookingCheckInAction,
  selfCheckInClassQrAction,
  toggleEventRegistrationCheckInAction,
} from "@/actions/management/checkin.actions";

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

// Mock ratelimit
vi.mock("@/lib/ratelimit", () => ({
  withRateLimit: vi.fn((_id: string, _type: string, fn: () => Promise<unknown>) => fn()),
  getRateLimitIdentifier: vi.fn().mockResolvedValue("test-identifier"),
}));

// Mock Prisma
const { prismaBookingMock, prismaEventRegistrationMock } = vi.hoisted(() => ({
  prismaBookingMock: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  prismaEventRegistrationMock: {
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    booking: prismaBookingMock,
    eventRegistration: prismaEventRegistrationMock,
  },
}));

describe("src/actions/management/checkin.actions.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. toggleBookingCheckInAction
  // =========================================================================
  describe("toggleBookingCheckInAction", () => {
    it("refuses unauthenticated callers and students with FORBIDDEN", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue(null);

      const unauthRes = await toggleBookingCheckInAction({
        bookingId: "b-1",
        markAttended: true,
      });
      expect(unauthRes.success).toBe(false);
      if (!unauthRes.success) {
        expect(unauthRes.error.code).toBe("FORBIDDEN");
      }

      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "student-1",
        role: Role.STUDENT,
      });

      const studentRes = await toggleBookingCheckInAction({
        bookingId: "b-1",
        markAttended: true,
      });
      expect(studentRes.success).toBe(false);
      if (!studentRes.success) {
        expect(studentRes.error.code).toBe("FORBIDDEN");
      }
      expect(prismaBookingMock.update).not.toHaveBeenCalled();
    });

    it("refuses fallback users under degraded database conditions", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "fallback-instructor",
        role: Role.INSTRUCTOR,
      });

      const res = await toggleBookingCheckInAction({
        bookingId: "b-1",
        markAttended: true,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
      }
      expect(prismaBookingMock.update).not.toHaveBeenCalled();
    });

    it("validates input payload", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.INSTRUCTOR,
      });

      const res = await toggleBookingCheckInAction({
        bookingId: "",
        markAttended: true,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("VALIDATION_ERROR");
      }
      expect(prismaBookingMock.update).not.toHaveBeenCalled();
    });

    it("updates booking attendance status for authorized instructors", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.INSTRUCTOR,
      });
      prismaBookingMock.update.mockResolvedValue({
        id: "b-1",
        status: BookingStatus.ATTENDED,
        user: { firstName: "Sofia", lastName: "Reyes" },
      });

      const res = await toggleBookingCheckInAction({
        bookingId: "b-1",
        markAttended: true,
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.status).toBe(BookingStatus.ATTENDED);
        expect(res.message).toContain("Checked in Sofia Reyes");
      }
      expect(prismaBookingMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "b-1" },
          data: expect.objectContaining({
            status: BookingStatus.ATTENDED,
            checkedInAt: expect.any(Date),
          }),
        })
      );
    });

    it("writes an EVENT_MUTATION audit log record when toggling booking attendance", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.INSTRUCTOR,
      });
      prismaBookingMock.findUnique.mockResolvedValue({
        id: "b-1",
        status: BookingStatus.CONFIRMED,
      });
      prismaBookingMock.update.mockResolvedValue({
        id: "b-1",
        status: BookingStatus.ATTENDED,
        user: { firstName: "Sofia", lastName: "Reyes" },
      });

      await toggleBookingCheckInAction({
        bookingId: "b-1",
        markAttended: true,
      });

      expect(recordAuditLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "staff-1",
          action: AuditAction.EVENT_MUTATION,
          targetType: "Booking",
          targetId: "b-1",
          metadata: {
            kind: "ATTENDANCE_CHECK_IN",
            from: BookingStatus.CONFIRMED,
            to: BookingStatus.ATTENDED,
          },
        })
      );
    });
  });

  // =========================================================================
  // 2. toggleEventRegistrationCheckInAction
  // =========================================================================
  describe("toggleEventRegistrationCheckInAction", () => {
    it("refuses unauthorized dancers with FORBIDDEN", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "dancer-1",
        role: Role.STUDENT,
      });

      const res = await toggleEventRegistrationCheckInAction({
        registrationId: "reg-1",
        checkedIn: true,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
      }
      expect(prismaEventRegistrationMock.update).not.toHaveBeenCalled();
    });

    it("refuses fallback users", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "fallback-admin",
        role: Role.ADMIN,
      });

      const res = await toggleEventRegistrationCheckInAction({
        registrationId: "reg-1",
        checkedIn: true,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
      }
      expect(prismaEventRegistrationMock.update).not.toHaveBeenCalled();
    });

    it("validates registrationId input", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.ADMIN,
      });

      const res = await toggleEventRegistrationCheckInAction({
        registrationId: "",
        checkedIn: true,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("VALIDATION_ERROR");
      }
      expect(prismaEventRegistrationMock.update).not.toHaveBeenCalled();
    });

    it("toggles event ticket holder door check-in status", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.ADMIN,
      });
      prismaEventRegistrationMock.update.mockResolvedValue({
        id: "reg-1",
        checkedIn: true,
        user: { firstName: "David", lastName: "Silva" },
      });

      const res = await toggleEventRegistrationCheckInAction({
        registrationId: "reg-1",
        checkedIn: true,
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.checkedIn).toBe(true);
      }
      expect(prismaEventRegistrationMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "reg-1" },
          data: expect.objectContaining({
            checkedIn: true,
            checkedInAt: expect.any(Date),
          }),
        })
      );
    });

    it("writes an EVENT_MUTATION audit log record when toggling event registration check-in", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.ADMIN,
      });
      prismaEventRegistrationMock.update.mockResolvedValue({
        id: "reg-1",
        checkedIn: true,
        user: { firstName: "David", lastName: "Silva" },
      });

      await toggleEventRegistrationCheckInAction({
        registrationId: "reg-1",
        checkedIn: true,
      });

      expect(recordAuditLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "staff-1",
          action: AuditAction.EVENT_MUTATION,
          targetType: "EventRegistration",
          targetId: "reg-1",
          metadata: {
            kind: "ATTENDANCE_CHECK_IN",
            checkedIn: true,
          },
        })
      );
    });
  });

  // =========================================================================
  // 3. selfCheckInClassQrAction
  // =========================================================================
  describe("selfCheckInClassQrAction", () => {
    it("refuses unauthenticated callers with UNAUTHORIZED", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue(null);

      const res = await selfCheckInClassQrAction({ classSessionId: "class-1" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("UNAUTHORIZED");
      }
    });

    it("refuses fallback users with SERVICE_UNAVAILABLE", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "fallback-student",
        role: Role.STUDENT,
      });

      const res = await selfCheckInClassQrAction({ classSessionId: "class-1" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
      }
    });

    it("validates classSessionId format", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "usr-student-9",
        role: Role.STUDENT,
      });

      const res = await selfCheckInClassQrAction({ classSessionId: "" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("strictly scopes booking query to session user ID (never uses an input dancer ID)", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "session-dancer-id-77",
        role: Role.STUDENT,
      });
      prismaBookingMock.findUnique.mockResolvedValue(null);

      const res = await selfCheckInClassQrAction({ classSessionId: "session-class-9" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("NO_ACTIVE_BOOKING");
      }

      // Assert lookup composite key uses session user id
      expect(prismaBookingMock.findUnique).toHaveBeenCalledWith({
        where: {
          userId_classSessionId: {
            userId: "session-dancer-id-77",
            classSessionId: "session-class-9",
          },
        },
        include: expect.any(Object),
      });
    });

    it("refuses check-in if class was cancelled by studio", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "usr-1",
        role: Role.STUDENT,
      });
      prismaBookingMock.findUnique.mockResolvedValue({
        id: "b-1",
        status: BookingStatus.CONFIRMED,
        classSession: {
          title: "Sunday Rueda Workshop",
          isCancelled: true,
          startTime: new Date(),
          endTime: new Date(),
        },
      });

      const res = await selfCheckInClassQrAction({ classSessionId: "class-cancelled" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("CLASS_CANCELLED");
      }
      expect(prismaBookingMock.update).not.toHaveBeenCalled();
    });

    it("refuses check-in when scanned more than 90 minutes before class start (CHECK_IN_NOT_OPEN)", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "usr-1",
        role: Role.STUDENT,
      });
      // Class starts in 4 hours
      const futureStart = new Date(Date.now() + 4 * 60 * 60 * 1000);
      const futureEnd = new Date(Date.now() + 5 * 60 * 60 * 1000);

      prismaBookingMock.findUnique.mockResolvedValue({
        id: "b-1",
        status: BookingStatus.CONFIRMED,
        classSession: {
          title: "Thursday Casino Level 2",
          isCancelled: false,
          startTime: futureStart,
          endTime: futureEnd,
        },
      });

      const res = await selfCheckInClassQrAction({ classSessionId: "class-future" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("CHECK_IN_NOT_OPEN");
        expect(res.error.message).toMatch(/90 minutes before/i);
      }
      expect(prismaBookingMock.update).not.toHaveBeenCalled();
    });

    it("refuses check-in when scanned more than 60 minutes after class conclusion (CLASS_ENDED)", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "usr-1",
        role: Role.STUDENT,
      });
      // Class ended 3 hours ago
      const pastStart = new Date(Date.now() - 4 * 60 * 60 * 1000);
      const pastEnd = new Date(Date.now() - 3 * 60 * 60 * 1000);

      prismaBookingMock.findUnique.mockResolvedValue({
        id: "b-1",
        status: BookingStatus.CONFIRMED,
        classSession: {
          title: "Thursday Casino Level 2",
          isCancelled: false,
          startTime: pastStart,
          endTime: pastEnd,
        },
      });

      const res = await selfCheckInClassQrAction({ classSessionId: "class-past" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("CLASS_ENDED");
      }
      expect(prismaBookingMock.update).not.toHaveBeenCalled();
    });

    it("marks booking ATTENDED when dancer scans valid QR code inside window", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "usr-1",
        firstName: "Elena",
        role: Role.STUDENT,
      });
      // Class starts in 30 minutes (well inside 90 min window)
      const validStart = new Date(Date.now() + 30 * 60 * 1000);
      const validEnd = new Date(Date.now() + 90 * 60 * 1000);

      prismaBookingMock.findUnique.mockResolvedValue({
        id: "b-valid-99",
        status: BookingStatus.CONFIRMED,
        classSession: {
          title: "Thursday Casino Partnerwork",
          isCancelled: false,
          startTime: validStart,
          endTime: validEnd,
        },
      });
      prismaBookingMock.update.mockResolvedValue({
        id: "b-valid-99",
        status: BookingStatus.ATTENDED,
      });

      const res = await selfCheckInClassQrAction({ classSessionId: "class-active" });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.bookingId).toBe("b-valid-99");
        expect(res.message).toContain("Welcome to class, Elena!");
      }
      expect(prismaBookingMock.update).toHaveBeenCalledWith({
        where: { id: "b-valid-99" },
        data: expect.objectContaining({
          status: BookingStatus.ATTENDED,
          checkedInAt: expect.any(Date),
        }),
      });
    });

    it("never writes an audit log record on dancer self-check-in (self-check-in is not an override)", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "usr-1",
        firstName: "Elena",
        role: Role.STUDENT,
      });
      const validStart = new Date(Date.now() + 30 * 60 * 1000);
      const validEnd = new Date(Date.now() + 90 * 60 * 1000);

      prismaBookingMock.findUnique.mockResolvedValue({
        id: "b-valid-99",
        status: BookingStatus.CONFIRMED,
        classSession: {
          title: "Thursday Casino Partnerwork",
          isCancelled: false,
          startTime: validStart,
          endTime: validEnd,
        },
      });
      prismaBookingMock.update.mockResolvedValue({
        id: "b-valid-99",
        status: BookingStatus.ATTENDED,
      });

      await selfCheckInClassQrAction({ classSessionId: "class-active" });

      expect(recordAuditLogMock).not.toHaveBeenCalled();
    });
  });
});
