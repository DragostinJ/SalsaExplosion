/**
 * Submission Actions & Progression Rules Unit Suite
 *
 * Protects:
 * 1. Dancer ownership & scoping: A dancer can only generate upload URLs and submit assessment videos for themselves.
 * 2. Monotonic level rule: Dancers can only apply for the immediate next level up (no skipping levels).
 * 3. Pending concurrency: Only one active pending assessment at a time per dancer.
 * 4. Staff-only grading: Evaluating and grading submissions requires INSTRUCTOR or ADMIN privileges.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DanceLevel, DanceStyle, Role, SubmissionStatus } from "@prisma/client";
import {
  generateSignedUploadUrlAction,
  createVideoSubmissionAction,
} from "@/actions/submission.actions";
import { gradeSubmissionAction } from "@/actions/grading.actions";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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

// Mock audit-log
vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(true),
}));

// Mock storage
vi.mock("@/lib/storage", () => ({
  isSupabaseStorageConfigured: vi.fn().mockReturnValue(false),
  getSupabaseAdmin: vi.fn(),
}));

// Mock Prisma
const txMock = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  videoSubmission: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    videoSubmission: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock)),
  },
}));

import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

describe("submission.actions: Level Progression Rule (Strict Next-Level-Up)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses unauthenticated users from generating upload URLs", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(null);

    const res = await generateSignedUploadUrlAction({
      targetLevel: DanceLevel.IMPROVER,
      contentType: "video/mp4",
      fileSizeBytes: 10 * 1024 * 1024,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("UNAUTHORIZED");
    }
  });

  it("refuses fallback users with SERVICE_UNAVAILABLE", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "fallback-dancer-1",
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
    } as never);

    const res = await generateSignedUploadUrlAction({
      targetLevel: DanceLevel.IMPROVER,
      contentType: "video/mp4",
      fileSizeBytes: 10 * 1024 * 1024,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
    }
  });

  it("refuses an ADVANCED dancer from submitting for a higher tier", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "dancer-adv",
      role: Role.STUDENT,
      currentLevel: DanceLevel.ADVANCED,
    } as never);

    const res = await generateSignedUploadUrlAction({
      targetLevel: DanceLevel.ADVANCED,
      contentType: "video/mp4",
      fileSizeBytes: 10 * 1024 * 1024,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("MAX_LEVEL_REACHED");
    }
  });

  it("enforces monotonic step: BEGINNER cannot jump straight to INTERMEDIATE or ADVANCED", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "dancer-beg",
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
    } as never);

    // Try skipping IMPROVER straight to INTERMEDIATE
    const resIntermediate = await generateSignedUploadUrlAction({
      targetLevel: DanceLevel.INTERMEDIATE,
      contentType: "video/mp4",
      fileSizeBytes: 15 * 1024 * 1024,
    });

    expect(resIntermediate.success).toBe(false);
    if (!resIntermediate.success) {
      expect(resIntermediate.error.code).toBe("INVALID_TARGET_LEVEL");
      expect(resIntermediate.error.message).toMatch(/Level skipping is not permitted/i);
    }

    // Try skipping to ADVANCED
    const resAdvanced = await generateSignedUploadUrlAction({
      targetLevel: DanceLevel.ADVANCED,
      contentType: "video/mp4",
      fileSizeBytes: 15 * 1024 * 1024,
    });

    expect(resAdvanced.success).toBe(false);
    if (!resAdvanced.success) {
      expect(resAdvanced.error.code).toBe("INVALID_TARGET_LEVEL");
    }
  });

  it("permits BEGINNER to apply strictly for IMPROVER (immediate next tier)", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "dancer-beg",
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
    } as never);

    vi.mocked(prisma.videoSubmission.findFirst).mockResolvedValue(null);

    const res = await generateSignedUploadUrlAction({
      targetLevel: DanceLevel.IMPROVER,
      contentType: "video/mp4",
      fileSizeBytes: 20 * 1024 * 1024,
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.targetLevel).toBe(DanceLevel.IMPROVER);
      expect(res.data.videoPath).toMatch(/^dancer-beg\/\d+-[a-f0-9-]+\.mp4$/);
    }
  });

  it("refuses duplicate submission if the dancer already has a PENDING video", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "dancer-beg",
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
    } as never);

    vi.mocked(prisma.videoSubmission.findFirst).mockResolvedValue({
      id: "existing-sub-1",
    } as never);

    const res = await generateSignedUploadUrlAction({
      targetLevel: DanceLevel.IMPROVER,
      contentType: "video/mp4",
      fileSizeBytes: 10 * 1024 * 1024,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("PENDING_SUBMISSION_EXISTS");
    }
  });
});

describe("submission.actions: Ownership and Self-Submission Boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails submission when videoPath belongs to another dancer's directory", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "dancer-legit",
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
    } as never);

    txMock.user.findUnique.mockResolvedValue({
      id: "dancer-legit",
      currentLevel: DanceLevel.BEGINNER,
    });

    // Attacker dancer-legit tries to reference victim's uploaded file
    const res = await createVideoSubmissionAction({
      targetLevel: DanceLevel.IMPROVER,
      videoPath: "victim-dancer/123456789-abcd-1234.mp4",
      studentNotes: "Stolen video attempt",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("VALIDATION_ERROR");
      expect(res.error.message).toMatch(/Unauthorized video storage path ownership/i);
    }
    expect(txMock.videoSubmission.create).not.toHaveBeenCalled();
  });

  it("creates a submission scoped strictly to the authenticated dancer", async () => {
    const dancerId = "dancer-legit-456";
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: dancerId,
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
    } as never);

    txMock.user.findUnique.mockResolvedValue({
      id: dancerId,
      currentLevel: DanceLevel.BEGINNER,
    });
    txMock.videoSubmission.findFirst.mockResolvedValue(null);
    txMock.videoSubmission.create.mockResolvedValue({ id: "sub-created-999" });

    const validVideoPath = `${dancerId}/1700000000000-11111111-2222-3333-4444-555555555555.mp4`;

    const res = await createVideoSubmissionAction({
      targetLevel: DanceLevel.IMPROVER,
      videoPath: validVideoPath,
      studentNotes: "Practiced Dile Que No and Enchufla Doble daily",
    });

    expect(res.success).toBe(true);
    expect(txMock.videoSubmission.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        studentId: dancerId,
        style: DanceStyle.CUBAN_SALSA,
        currentLevel: DanceLevel.BEGINNER,
        targetLevel: DanceLevel.IMPROVER,
        videoUrl: validVideoPath,
        status: SubmissionStatus.PENDING,
      }),
      select: { id: true },
    });
  });
});

describe("grading.actions: Staff-Only Authorization Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses a dancer (STUDENT role) from grading any submission", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "dancer-student-1",
      role: Role.STUDENT,
    } as never);

    const res = await gradeSubmissionAction({
      submissionId: "sub-100",
      decision: SubmissionStatus.APPROVED,
      feedback: "Looks good to me!",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("FORBIDDEN");
      expect(res.error.message).toMatch(/Only studio instructors and administrators/i);
    }
  });

  it("allows INSTRUCTOR to grade a pending submission and promote student level on approval", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "instructor-arturas",
      role: Role.INSTRUCTOR,
      firstName: "Arturas",
      lastName: "Paulauskas",
    } as never);

    txMock.user.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) => {
      if (where.id === "instructor-arturas") {
        return { id: "instructor-arturas", role: Role.INSTRUCTOR };
      }
      return { id: "student-1", currentLevel: DanceLevel.BEGINNER };
    });

    txMock.videoSubmission.findUnique.mockResolvedValue({
      id: "sub-100",
      studentId: "student-1",
      targetLevel: DanceLevel.IMPROVER,
      currentLevel: DanceLevel.BEGINNER,
      status: SubmissionStatus.PENDING,
      student: { id: "student-1", currentLevel: DanceLevel.BEGINNER },
    });

    txMock.videoSubmission.updateMany.mockResolvedValue({ count: 1 });
    txMock.user.update.mockResolvedValue({ id: "student-1", currentLevel: DanceLevel.IMPROVER });

    const res = await gradeSubmissionAction({
      submissionId: "sub-100",
      decision: SubmissionStatus.APPROVED,
      feedback: "Superb clave connection, clean Dile Que No posture. Welcome to Improvers!",
    });

    expect(res.success).toBe(true);
    expect(txMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "student-1" },
        data: { currentLevel: DanceLevel.IMPROVER },
      })
    );
  });
});
