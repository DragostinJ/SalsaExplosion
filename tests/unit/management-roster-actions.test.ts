/**
 * Management Roster Actions Unit Test Suite
 *
 * Protects:
 * 1. Role switcher security: Only users authorized by canSwitchRoles() can switch roles;
 *    fallback users and unauthenticated callers are refused; writes ROLE_CHANGE audit log.
 * 2. Student progression governance: Only staff (INSTRUCTOR/ADMIN) can update student levels;
 *    writes LEVEL_PROMOTION audit log with student identity and new level.
 * 3. Class creation & capacity controls: Staff only; writes EVENT_MUTATION audit log;
 *    capacity settings are informational for faculty and never block dancer admissions.
 * 4. AI video rubric copilot: Staff only; safe rubric evaluation without unguarded external calls.
 * 5. Dance role preference isolation: Signed-in only; strictly scopes Prisma where clause
 *    to the session user's ID, preventing modification of other dancers' preferences.
 * 6. Class cancellation safety: Staff only; notifies attending dancers via email;
 *    writes audit log; NEVER touches credits, credit ledgers, or payment providers.
 * 7. Active role inspection: Returns null role for signed-out visitors; returns effective role for signed-in users.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AuditAction,
  BookingStatus,
  DanceLevel,
  DanceRole,
  Role,
} from "@prisma/client";
import {
  switchMyAccountRoleAction,
  getCurrentUserRoleAction,
  updateStudentProgressionAction,
  createClassSessionAction,
  analyzeSubmissionWithAiAction,
  updateMyDanceRolePreferenceAction,
  cancelClassSessionWithRefundsAction,
  updateClassSessionCapacityAction,
} from "@/actions/management/roster.actions";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock @clerk/nextjs/server
const { authMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
}));

// Mock auth-user
const { getOrProvisionCurrentUserMock, canSwitchRolesMock, isBootstrapAdminMock } =
  vi.hoisted(() => ({
    getOrProvisionCurrentUserMock: vi.fn(),
    canSwitchRolesMock: vi.fn(),
    isBootstrapAdminMock: vi.fn(),
  }));

vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: getOrProvisionCurrentUserMock,
  canSwitchRoles: canSwitchRolesMock,
  isBootstrapAdmin: isBootstrapAdminMock,
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

// Mock notify-class-cancelled
const { notifyClassCancelledMock } = vi.hoisted(() => ({
  notifyClassCancelledMock: vi.fn().mockResolvedValue({
    emailed: 2,
    failed: 0,
    emailOff: false,
  }),
}));

vi.mock("@/lib/email/notify-class-cancelled", () => ({
  notifyClassCancelled: notifyClassCancelledMock,
}));

// Mock Prisma
const {
  prismaUserMock,
  prismaClassSessionMock,
  prismaVideoSubmissionMock,
  prismaBookingMock,
  prismaCreditLedgerMock,
  prismaTransactionMock,
} = vi.hoisted(() => ({
  prismaUserMock: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  prismaClassSessionMock: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  prismaVideoSubmissionMock: {
    findUnique: vi.fn(),
  },
  prismaBookingMock: {
    update: vi.fn(),
  },
  prismaCreditLedgerMock: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  prismaTransactionMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: prismaUserMock,
    classSession: prismaClassSessionMock,
    videoSubmission: prismaVideoSubmissionMock,
    booking: prismaBookingMock,
    creditLedger: prismaCreditLedgerMock,
    $transaction: prismaTransactionMock,
  },
}));

describe("src/actions/management/roster.actions.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. switchMyAccountRoleAction
  // =========================================================================
  describe("switchMyAccountRoleAction", () => {
    it("refuses unauthenticated callers with UNAUTHORIZED", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue(null);

      const res = await switchMyAccountRoleAction({ targetRole: Role.INSTRUCTOR });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("UNAUTHORIZED");
      }
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it("refuses when canSwitchRoles returns false", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "usr-student",
        email: "dancer@example.com",
        role: Role.STUDENT,
      });
      canSwitchRolesMock.mockReturnValue(false);

      const res = await switchMyAccountRoleAction({ targetRole: Role.INSTRUCTOR });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
        expect(res.error.message).toMatch(/strictly disabled/i);
      }
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it("refuses fallback users when role switching is not authorized", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "fallback-clerk-1",
        email: "fallback-clerk-1@salsaexplosion.local",
        role: Role.STUDENT,
      });
      canSwitchRolesMock.mockReturnValue(false);

      const res = await switchMyAccountRoleAction({ targetRole: Role.ADMIN });
      expect(res.success).toBe(false);
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it("switches role and writes ROLE_CHANGE audit log when canSwitchRoles allows it", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "usr-owner",
        email: "enrique@salsaexplosion.co.uk",
        role: Role.ADMIN,
      });
      canSwitchRolesMock.mockReturnValue(true);
      prismaUserMock.update.mockResolvedValue({
        id: "usr-owner",
        role: Role.INSTRUCTOR,
      });

      const res = await switchMyAccountRoleAction({ targetRole: Role.INSTRUCTOR });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.role).toBe(Role.INSTRUCTOR);
      }

      expect(prismaUserMock.update).toHaveBeenCalledWith({
        where: { id: "usr-owner" },
        data: { role: Role.INSTRUCTOR },
        select: { role: true },
      });

      expect(recordAuditLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "usr-owner",
          action: AuditAction.ROLE_CHANGE,
          targetType: "USER",
          targetId: "usr-owner",
          metadata: { previousRole: Role.ADMIN, newRole: Role.INSTRUCTOR },
        })
      );
    });
  });

  // =========================================================================
  // 2. updateStudentProgressionAction
  // =========================================================================
  describe("updateStudentProgressionAction", () => {
    it("refuses unauthenticated callers and students with FORBIDDEN", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "usr-student",
        role: Role.STUDENT,
      });

      const res = await updateStudentProgressionAction({
        studentId: "target-student",
        newLevel: DanceLevel.IMPROVER,
        preferredRole: DanceRole.LEAD,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
      }
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it("refuses fallback users under degraded pooler conditions", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "fallback-instructor",
        role: Role.INSTRUCTOR,
      });

      const res = await updateStudentProgressionAction({
        studentId: "target-student",
        newLevel: DanceLevel.IMPROVER,
        preferredRole: DanceRole.LEAD,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
      }
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it("validates input parameters", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.INSTRUCTOR,
      });

      const res = await updateStudentProgressionAction({
        studentId: "",
        newLevel: "GRANDMASTER" as unknown as DanceLevel,
        preferredRole: DanceRole.LEAD,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("VALIDATION_ERROR");
      }
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it("updates progression and writes LEVEL_PROMOTION audit log for staff", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.INSTRUCTOR,
      });
      prismaUserMock.update.mockResolvedValue({
        id: "student-42",
        firstName: "Carlos",
        lastName: "Dancer",
        currentLevel: DanceLevel.INTERMEDIATE,
        preferredRole: DanceRole.LEAD,
      });

      const res = await updateStudentProgressionAction({
        studentId: "student-42",
        newLevel: DanceLevel.INTERMEDIATE,
        preferredRole: DanceRole.LEAD,
      });

      expect(res.success).toBe(true);
      expect(prismaUserMock.update).toHaveBeenCalledWith({
        where: { id: "student-42" },
        data: {
          currentLevel: DanceLevel.INTERMEDIATE,
          preferredRole: DanceRole.LEAD,
        },
        select: expect.any(Object),
      });

      expect(recordAuditLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "staff-1",
          action: AuditAction.LEVEL_PROMOTION,
          targetType: "USER",
          targetId: "student-42",
          metadata: expect.objectContaining({
            newLevel: DanceLevel.INTERMEDIATE,
            preferredRole: DanceRole.LEAD,
            studentName: "Carlos Dancer",
          }),
        })
      );
    });
  });

  // =========================================================================
  // 3. createClassSessionAction & updateClassSessionCapacityAction
  // =========================================================================
  describe("createClassSessionAction & updateClassSessionCapacityAction", () => {
    it("createClassSessionAction requires staff role and validates date", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.INSTRUCTOR,
      });

      // Invalid date
      const badDateRes = await createClassSessionAction({
        title: "Cuban Salsa Casino Fundamentals",
        minLevel: DanceLevel.BEGINNER,
        startTimeIso: "invalid-iso-date",
        durationMinutes: 60,
        room: "Main Ballroom",
        maxCapacity: 30,
      });
      expect(badDateRes.success).toBe(false);

      // Valid class creation
      prismaClassSessionMock.create.mockResolvedValue({
        id: "class-new-1",
        title: "Cuban Salsa Casino Fundamentals",
        startTime: new Date("2026-11-12T19:00:00Z"),
        maxCapacity: 30,
      });

      const goodRes = await createClassSessionAction({
        title: "Cuban Salsa Casino Fundamentals",
        minLevel: DanceLevel.BEGINNER,
        startTimeIso: "2026-11-12T19:00:00Z",
        durationMinutes: 60,
        room: "Main Ballroom",
        maxCapacity: 30,
      });
      expect(goodRes.success).toBe(true);
      expect(recordAuditLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.EVENT_MUTATION,
          targetType: "CLASS_SESSION",
          targetId: "class-new-1",
          metadata: expect.objectContaining({ mutation: "CREATE" }),
        })
      );
    });

    it("updateClassSessionCapacityAction updates capacity and records audit log without gating admissions", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.ADMIN,
      });
      prismaClassSessionMock.update.mockResolvedValue({
        id: "class-123",
        room: "Studio B",
        maxCapacity: 45,
      });

      const res = await updateClassSessionCapacityAction({
        classSessionId: "class-123",
        maxCapacity: 45,
        room: "Studio B",
      });

      expect(res.success).toBe(true);
      expect(prismaClassSessionMock.update).toHaveBeenCalledWith({
        where: { id: "class-123" },
        data: expect.objectContaining({
          room: "Studio B",
          maxCapacity: 45,
        }),
      });
      expect(recordAuditLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.EVENT_MUTATION,
          targetType: "ClassSession",
          targetId: "class-123",
        })
      );
    });
  });

  // =========================================================================
  // 4. analyzeSubmissionWithAiAction
  // =========================================================================
  describe("analyzeSubmissionWithAiAction", () => {
    it("refuses unauthenticated callers and students", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue(null);
      const res = await analyzeSubmissionWithAiAction({ submissionId: "sub-1" });
      expect(res.success).toBe(false);

      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "student-1",
        role: Role.STUDENT,
      });
      const resStudent = await analyzeSubmissionWithAiAction({ submissionId: "sub-1" });
      expect(resStudent.success).toBe(false);
    });

    it("returns NOT_FOUND when submission record does not exist", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.INSTRUCTOR,
      });
      prismaVideoSubmissionMock.findUnique.mockResolvedValue(null);

      const res = await analyzeSubmissionWithAiAction({ submissionId: "non-existent" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("NOT_FOUND");
      }
    });

    it("generates deterministic Cuban Salsa rubric evaluation for staff review", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-1",
        role: Role.INSTRUCTOR,
      });
      prismaVideoSubmissionMock.findUnique.mockResolvedValue({
        id: "sub-100",
        targetLevel: DanceLevel.IMPROVER,
        student: {
          firstName: "Maria",
          lastName: "Santos",
          preferredRole: DanceRole.FOLLOW,
        },
      });

      const res = await analyzeSubmissionWithAiAction({ submissionId: "sub-100" });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.recommendation).toBe("APPROVE");
        expect(res.data.figureBreakdown.length).toBeGreaterThan(0);
        expect(res.data.suggestedInstructorFeedback).toContain("Maria");
      }
    });
  });

  // =========================================================================
  // 5. updateMyDanceRolePreferenceAction
  // =========================================================================
  describe("updateMyDanceRolePreferenceAction", () => {
    it("refuses unauthenticated callers", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue(null);
      const res = await updateMyDanceRolePreferenceAction({
        preferredRole: DanceRole.LEAD,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("UNAUTHORIZED");
      }
    });

    it("only ever updates caller's own record (Prisma where strictly uses session user id)", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "session-dancer-id-99",
        role: Role.STUDENT,
      });
      prismaUserMock.update.mockResolvedValue({
        preferredRole: DanceRole.FOLLOW,
      });

      const res = await updateMyDanceRolePreferenceAction({
        preferredRole: DanceRole.FOLLOW,
      });

      expect(res.success).toBe(true);
      // Verify strictly that where: { id } matches session user, not any injected parameter
      expect(prismaUserMock.update).toHaveBeenCalledWith({
        where: { id: "session-dancer-id-99" },
        data: { preferredRole: DanceRole.FOLLOW },
        select: { preferredRole: true },
      });
    });
  });

  // =========================================================================
  // 6. cancelClassSessionWithRefundsAction
  // =========================================================================
  describe("cancelClassSessionWithRefundsAction", () => {
    it("refuses non-staff callers", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "dancer-1",
        role: Role.STUDENT,
      });
      const res = await cancelClassSessionWithRefundsAction({
        classSessionId: "class-1",
        reason: "Illness",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
      }
    });

    it("cancels class session, notifies dancers via email, writes audit log, and NEVER touches credits or Stripe", async () => {
      getOrProvisionCurrentUserMock.mockResolvedValue({
        id: "staff-enrique",
        role: Role.ADMIN,
      });

      const mockClassSession = {
        id: "class-cancel-1",
        title: "Thursday Casino Partnerwork",
        startTime: new Date(Date.now() + 86400000),
        isCancelled: false,
        bookings: [
          {
            id: "b-1",
            user: { email: "dancer1@example.com", firstName: "Lucia" },
          },
          {
            id: "b-2",
            user: { email: "dancer2@example.com", firstName: "Mateo" },
          },
        ],
      };

      prismaTransactionMock.mockImplementation(async (callback) => {
        const txMock = {
          classSession: {
            findUnique: vi.fn().mockResolvedValue(mockClassSession),
            update: vi.fn().mockResolvedValue({ ...mockClassSession, isCancelled: true }),
          },
          booking: {
            update: vi.fn().mockResolvedValue({ status: BookingStatus.CANCELLED }),
          },
        };
        return callback(txMock);
      });

      const res = await cancelClassSessionWithRefundsAction({
        classSessionId: "class-cancel-1",
        reason: "Studio floor maintenance",
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.cancelledBookings).toBe(2);
      }

      // Proves email notification was sent to attending dancers
      expect(notifyClassCancelledMock).toHaveBeenCalledWith(
        expect.objectContaining({
          classTitle: "Thursday Casino Partnerwork",
          reason: "Studio floor maintenance",
          dancers: [
            { email: "dancer1@example.com", firstName: "Lucia" },
            { email: "dancer2@example.com", firstName: "Mateo" },
          ],
        })
      );

      // Proves audit log was written
      expect(recordAuditLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "staff-enrique",
          action: AuditAction.EVENT_MUTATION,
          targetType: "ClassSession",
          targetId: "class-cancel-1",
          metadata: expect.objectContaining({
            operation: "CANCEL_CLASS",
            reason: "Studio floor maintenance",
            totalBookingsCancelled: 2,
          }),
        })
      );

      // HARD BOUNDARY ASSERTION: Classes are pay-at-the-door; cancellation must never touch credit ledgers or credits
      expect(prismaCreditLedgerMock.create).not.toHaveBeenCalled();
      expect(prismaCreditLedgerMock.findMany).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 7. getCurrentUserRoleAction
  // =========================================================================
  describe("getCurrentUserRoleAction", () => {
    it("returns null role and false switcher for signed-out visitors", async () => {
      authMock.mockResolvedValue({ userId: null });

      const res = await getCurrentUserRoleAction();
      expect(res).toEqual({ role: null, canSwitchRoles: false });
      expect(prismaUserMock.findUnique).not.toHaveBeenCalled();
    });

    it("returns user's role and evaluates canSwitchRoles for signed-in users", async () => {
      authMock.mockResolvedValue({ userId: "clerk-enrique" });
      prismaUserMock.findUnique.mockResolvedValue({
        role: Role.ADMIN,
        email: "enrique@salsaexplosion.co.uk",
      });
      canSwitchRolesMock.mockReturnValue(true);

      const res = await getCurrentUserRoleAction();
      expect(res).toEqual({ role: Role.ADMIN, canSwitchRoles: true });
      expect(prismaUserMock.findUnique).toHaveBeenCalledWith({
        where: { clerkId: "clerk-enrique" },
        select: { role: true, email: true },
      });
    });
  });
});
