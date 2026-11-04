/**
 * Recap Actions Security & Business Invariants Unit Suite
 *
 * Protects:
 * 1. Role enforcement: Only INSTRUCTOR or ADMIN can attach class recaps; dancers and fallback users are refused.
 * 2. Input validation: Class session ID, valid video URLs, note lengths, and practiced figures.
 * 3. Dancer privacy & data scoping: Dancers only receive published recaps for classes they attended; no cross-dancer leakage.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingStatus, DanceLevel, Role } from "@prisma/client";
import {
  attachClassRecapAction,
  generateRecapUploadUrlAction,
  getMyAttendedClassRecapsAction,
  getAllPublishedClassRecapsAction,
} from "@/actions/recap.actions";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

// Mock auth-user module
vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
  requireRole: vi.fn(),
  STAFF_ROLES: [Role.INSTRUCTOR, Role.ADMIN],
  ADMIN_ONLY: [Role.ADMIN],
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
  SERVICE_UNAVAILABLE_MESSAGE: "We can't reach our booking system right now. Please try again in a minute.",
}));

// Mock ratelimit
vi.mock("@/lib/ratelimit", () => ({
  withRateLimit: vi.fn((_id: string, _action: string, fn: () => Promise<unknown>) => fn()),
  getRateLimitIdentifier: vi.fn().mockResolvedValue("test-rate-id"),
}));

// Mock storage
vi.mock("@/lib/storage", () => ({
  createSignedUploadUrlHelper: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    classSession: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    booking: {
      findMany: vi.fn(),
    },
  },
}));

import { getOrProvisionCurrentUser, requireRole } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

describe("recap.actions: Authorization & Role Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses unauthenticated users when attaching a recap", async () => {
    vi.mocked(requireRole).mockImplementation(async () => {
      throw new Error("NEXT_REDIRECT:/sign-in");
    });

    await expect(
      attachClassRecapAction({
        classSessionId: "session-1",
        recapVideoUrl: "https://example.com/video.mp4",
        recapNotes: "Great class",
        recapFigures: ["Enchufla", "Dile Que No"],
        recapPublished: true,
      })
    ).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });

  it("refuses dancers (STUDENT role) when attaching a recap", async () => {
    vi.mocked(requireRole).mockImplementation(async () => {
      throw new Error("NEXT_REDIRECT:/classes");
    });

    await expect(
      attachClassRecapAction({
        classSessionId: "session-1",
        recapVideoUrl: "https://example.com/video.mp4",
        recapNotes: "Student attempting recap",
        recapFigures: ["Enchufla"],
        recapPublished: true,
      })
    ).rejects.toThrow("NEXT_REDIRECT:/classes");
  });

  it("refuses fallback users when attaching a recap", async () => {
    vi.mocked(requireRole).mockImplementation(async () => {
      // In auth-user.ts, requireRole rejects fallback users since their role is STUDENT
      throw new Error("NEXT_REDIRECT:/classes");
    });

    await expect(
      attachClassRecapAction({
        classSessionId: "session-1",
        recapVideoUrl: "https://example.com/video.mp4",
        recapNotes: "Fallback user attempt",
        recapFigures: ["Vacilala"],
        recapPublished: true,
      })
    ).rejects.toThrow("NEXT_REDIRECT:/classes");
  });

  it("forbids an instructor from attaching a recap to another instructor's class", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "instructor-1",
      role: Role.INSTRUCTOR,
    } as never);

    vi.mocked(prisma.classSession.findUnique).mockResolvedValue({
      id: "session-other",
      instructorId: "instructor-2",
      title: "Cuban Salsa Improvers",
    } as never);

    const res = await attachClassRecapAction({
      classSessionId: "session-other",
      recapVideoUrl: "https://example.com/video.mp4",
      recapNotes: "Tried to edit another teacher's class",
      recapFigures: ["Sombrero"],
      recapPublished: true,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("FORBIDDEN");
      expect(res.error.message).toMatch(/only attach recap videos to classes you instructed/i);
    }
    expect(prisma.classSession.update).not.toHaveBeenCalled();
  });

  it("allows an ADMIN to attach a recap to any instructor's class", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "admin-enrique",
      role: Role.ADMIN,
    } as never);

    vi.mocked(prisma.classSession.findUnique).mockResolvedValue({
      id: "session-other",
      instructorId: "instructor-2",
      title: "Cuban Salsa Masterclass",
    } as never);

    vi.mocked(prisma.classSession.update).mockResolvedValue({
      id: "session-other",
      recapVideoUrl: "https://example.com/recap.mp4",
      recapFigures: ["Setenta Complicada"],
      recapPublished: true,
    } as never);

    const res = await attachClassRecapAction({
      classSessionId: "session-other",
      recapVideoUrl: "https://example.com/recap.mp4",
      recapNotes: "Recap reviewed and published by owner",
      recapFigures: ["Setenta Complicada"],
      recapPublished: true,
    });

    expect(res.success).toBe(true);
    expect(prisma.classSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "session-other" },
        data: expect.objectContaining({
          recapVideoUrl: "https://example.com/recap.mp4",
          recapFigures: ["Setenta Complicada"],
          recapPublished: true,
        }),
      })
    );
  });

  it("handles generateRecapUploadUrlAction validation and storage URL generation", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "instructor-1",
      role: Role.INSTRUCTOR,
    } as never);

    vi.mocked(prisma.classSession.findUnique).mockResolvedValue({
      id: "session-1",
      instructorId: "instructor-1",
      title: "Cuban Salsa Beginners",
    } as never);

    const res = await generateRecapUploadUrlAction({
      classSessionId: "session-1",
      contentType: "video/mp4",
      fileSizeBytes: 25 * 1024 * 1024,
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.storagePath).toMatch(/^recaps\/session-1\/\d+-[a-f0-9-]+\.mp4$/);
    }
  });
});

describe("recap.actions: Input Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRole).mockResolvedValue({
      id: "instructor-1",
      role: Role.INSTRUCTOR,
    } as never);
  });

  it("fails validation when classSessionId is empty", async () => {
    const res = await attachClassRecapAction({
      classSessionId: "",
      recapVideoUrl: "https://example.com/video.mp4",
      recapNotes: "Notes",
      recapFigures: ["Enchufla"],
      recapPublished: true,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("VALIDATION_ERROR");
      expect(res.error.message).toMatch(/Class Session ID is required/i);
    }
  });

  it("fails validation when recapVideoUrl is not HTTPS or allowed format", async () => {
    const res = await attachClassRecapAction({
      classSessionId: "session-1",
      recapVideoUrl: "javascript:alert('xss')",
      recapNotes: "Dangerous URL",
      recapFigures: ["Enchufla"],
      recapPublished: true,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("VALIDATION_ERROR");
      expect(res.error.message).toMatch(/Video must be an HTTPS URL/i);
    }
  });

  it("fails validation when recapFigures is an empty array", async () => {
    const res = await attachClassRecapAction({
      classSessionId: "session-1",
      recapVideoUrl: "https://example.com/video.mp4",
      recapNotes: "Valid notes",
      recapFigures: [],
      recapPublished: true,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("VALIDATION_ERROR");
      expect(res.error.message).toMatch(/at least one Cuban figure/i);
    }
  });

  it("returns NOT_FOUND when the class session does not exist in the database", async () => {
    vi.mocked(prisma.classSession.findUnique).mockResolvedValue(null);

    const res = await attachClassRecapAction({
      classSessionId: "nonexistent-id",
      recapVideoUrl: "https://example.com/video.mp4",
      recapNotes: "Notes",
      recapFigures: ["Enchufla"],
      recapPublished: true,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("NOT_FOUND");
    }
  });
});

describe("recap.actions: Dancer Privacy & Data Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires signed-in user for getMyAttendedClassRecapsAction", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(null);

    const res = await getMyAttendedClassRecapsAction();
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("UNAUTHORIZED");
    }
  });

  it("queries strictly for the signed-in dancer's attended bookings and only published recaps", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "dancer-elena",
      role: Role.STUDENT,
    } as never);

    vi.mocked(prisma.booking.findMany).mockResolvedValue([
      {
        id: "booking-1",
        danceRole: "FOLLOW",
        classSession: {
          id: "session-101",
          title: "Cuban Salsa Beginners Foundation",
          minLevel: DanceLevel.BEGINNER,
          startTime: new Date("2026-11-05T19:00:00Z"),
          room: "BOH Canadian Maple Ballroom",
          recapVideoUrl: "https://example.com/recaps/101.mp4",
          recapNotes: "Worked on Guapea and Enchufla Doble",
          recapFigures: ["Guapea", "Enchufla Doble"],
          recapRecordedAt: new Date("2026-11-05T20:15:00Z"),
          practiceSongIds: [],
          instructor: {
            firstName: "Enrique",
            lastName: "Perez",
            avatarUrl: null,
            specialty: "Founder",
          },
        },
      },
    ] as never);

    const res = await getMyAttendedClassRecapsAction();

    expect(res.success).toBe(true);
    // Multi-tenant check: query MUST be scoped to dancer-elena
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "dancer-elena",
          status: { in: [BookingStatus.ATTENDED, BookingStatus.CONFIRMED] },
          classSession: expect.objectContaining({
            recapPublished: true,
            recapVideoUrl: { not: null },
          }),
        }),
      })
    );

    if (res.success) {
      expect(res.data).toHaveLength(1);
      expect(res.data[0].classSessionId).toBe("session-101");
      expect(res.data[0].recapFigures).toEqual(["Guapea", "Enchufla Doble"]);
    }
  });

  it("dancers only ever get published recaps with non-null video URLs in studio recaps list", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "dancer-elena",
      role: Role.STUDENT,
    } as never);

    vi.mocked(prisma.classSession.findMany).mockResolvedValue([
      {
        id: "session-202",
        title: "Cuban Salsa Improvers",
        minLevel: DanceLevel.IMPROVER,
        startTime: new Date("2026-11-05T20:15:00Z"),
        room: "Main Ballroom",
        recapVideoUrl: "https://example.com/recaps/202.mp4",
        recapNotes: "Dile Que Si & Vacilala",
        recapFigures: ["Dile Que Si", "Vacilala"],
        recapRecordedAt: new Date("2026-11-05T21:30:00Z"),
        practiceSongIds: [],
        instructor: {
          firstName: "Justyna",
          lastName: "Zubko",
          avatarUrl: null,
          specialty: "Casino Specialist",
        },
      },
    ] as never);

    const res = await getAllPublishedClassRecapsAction();

    expect(res.success).toBe(true);
    expect(prisma.classSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          recapPublished: true,
          recapVideoUrl: { not: null },
        },
      })
    );

    if (res.success) {
      expect(res.data).toHaveLength(1);
      expect(res.data[0].recapVideoUrl).toBe("https://example.com/recaps/202.mp4");
    }
  });
});
