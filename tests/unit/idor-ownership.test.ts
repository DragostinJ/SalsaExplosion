import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role, DanceLevel, DanceRole, SubmissionStatus, BookingStatus } from "@prisma/client";
import { cancelBookingAction } from "@/actions/booking.actions";
import { gradeSubmissionAction } from "@/actions/grading.actions";
import {
  updateStudentProgressionAction,
  adjustStudentCreditsAction,
  toggleBookingCheckInAction,
  createClassSessionAction,
  createGuestArtistEventAction,
} from "@/actions/management.actions";

// Mock auth-user module
vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
  requireRole: vi.fn(),
  canSwitchRoles: vi.fn(),
  STAFF_ROLES: [Role.INSTRUCTOR, Role.ADMIN],
  ADMIN_ONLY: [Role.ADMIN],
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    booking: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    videoSubmission: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    classSession: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    eventRegistration: {
      update: vi.fn(),
    },
  },
}));

import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

type MockUser = NonNullable<Awaited<ReturnType<typeof getOrProvisionCurrentUser>>>;

describe("A5: IDOR & Broken Access Control Security Audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Booking Modification IDOR Protection", () => {
    it("proves a STUDENT cannot cancel another student's booking", async () => {
      const studentA = {
        id: "student-a-id",
        role: Role.STUDENT,
        email: "studentA@salsaexplosion.local",
      } as unknown as MockUser;

      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(studentA);

      // Prisma transaction mock simulating database check
      vi.mocked(prisma.$transaction).mockImplementation((async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          user: {
            findUnique: vi.fn().mockResolvedValue(studentA),
          },
          booking: {
            findUnique: vi.fn().mockResolvedValue({
              id: "booking-of-student-b",
              userId: "student-b-id", // Belongs to Student B!
              status: BookingStatus.CONFIRMED,
              classSession: {
                startTime: new Date(Date.now() + 86400000), // In future
              },
            }),
            updateMany: vi.fn(),
          },
        };
        return cb(tx);
      }) as unknown as typeof prisma.$transaction);

      const res = await cancelBookingAction({ bookingId: "booking-of-student-b" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("BOOKING_NOT_FOUND");
        expect(res.error.message).toContain("permission");
      }
    });
  });

  describe("Staff & Admin Privilege Escalation IDOR Protection", () => {
    it("proves a STUDENT cannot grade or approve another student's video submission", async () => {
      const maliciousStudent = {
        id: "student-hacker",
        role: Role.STUDENT,
        email: "hacker@domain.com",
      } as unknown as MockUser;

      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(maliciousStudent);

      vi.mocked(prisma.$transaction).mockImplementation((async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          user: {
            findUnique: vi.fn().mockResolvedValue(maliciousStudent),
          },
        };
        return cb(tx);
      }) as unknown as typeof prisma.$transaction);

      const res = await gradeSubmissionAction({
        submissionId: "submission-123",
        decision: SubmissionStatus.APPROVED,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
      }
    });

    it("proves a STUDENT cannot alter any student's dance level progression", async () => {
      const student = {
        id: "student-1",
        role: Role.STUDENT,
        email: "student1@domain.com",
      } as unknown as MockUser;

      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(student);

      const res = await updateStudentProgressionAction({
        studentId: "target-student-2",
        newLevel: DanceLevel.ADVANCED,
        preferredRole: DanceRole.LEAD,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
        expect(res.error.message).toContain("Only Instructors and Studio Admins");
      }
    });

    it("proves a STUDENT cannot adjust class credits for themselves or others", async () => {
      const student = {
        id: "student-1",
        role: Role.STUDENT,
        email: "student1@domain.com",
      } as unknown as MockUser;

      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(student);

      const res = await adjustStudentCreditsAction({
        studentId: "student-1",
        delta: 50,
        reason: "Self-granting credits attempt",
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
      }
    });

    it("proves a STUDENT cannot mark bookings as attended via instructor check-in", async () => {
      const student = {
        id: "student-1",
        role: Role.STUDENT,
        email: "student1@domain.com",
      } as unknown as MockUser;

      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(student);

      const res = await toggleBookingCheckInAction({
        bookingId: "booking-999",
        markAttended: true,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
      }
    });

    it("proves a STUDENT cannot create studio class sessions", async () => {
      const student = {
        id: "student-1",
        role: Role.STUDENT,
        email: "student1@domain.com",
      } as unknown as MockUser;

      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(student);

      const res = await createClassSessionAction({
        title: "Malicious Class",
        minLevel: DanceLevel.BEGINNER,
        startTimeIso: new Date().toISOString(),
        durationMinutes: 60,
        room: "Main Hall",
        maxCapacity: 30,
        maxLeads: 15,
        maxFollows: 15,
        creditCost: 1,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
      }
    });

    it("proves an INSTRUCTOR cannot publish guest artist congress events (ADMIN only)", async () => {
      const instructor = {
        id: "instructor-1",
        role: Role.INSTRUCTOR,
        email: "instructor@salsaexplosion.co.uk",
      } as unknown as MockUser;

      vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(instructor);

      const res = await createGuestArtistEventAction({
        title: "Unauthorized Event",
        slug: "unauthorized-event",
        description: "Test",
        venueName: "Venue",
        venueAddress: "Address",
        startDateIso: new Date().toISOString(),
        endDateIso: new Date().toISOString(),
        guestArtistsCsv: "Artist 1",
        fullPassPricePounds: 100,
        fullPassCapacity: 50,
        partyPassPricePounds: 25,
        partyPassCapacity: 50,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("FORBIDDEN");
        expect(res.error.message).toContain("Only Studio Admins");
      }
    });
  });
});
