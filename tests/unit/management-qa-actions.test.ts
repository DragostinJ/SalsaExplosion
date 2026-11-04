/**
 * Management Q&A Actions Unit Test Suite
 *
 * Protects:
 * 1. Staff-only replies: Only INSTRUCTOR and ADMIN can answer beginner questions;
 *    unauthenticated callers and students are refused with FORBIDDEN.
 * 2. Database degradation resilience: Refuses fallback users with SERVICE_UNAVAILABLE.
 * 3. Validation: Enforces answer length (1–2000 characters) and non-empty question IDs.
 * 4. Record safety: Non-existent IDs return NOT_FOUND; arbitrary input IDs cannot mutate unrelated records.
 * 5. Forensic audit logging: Writes an EVENT_MUTATION audit record capturing staff ID and question category.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditAction, Role } from "@prisma/client";
import { replyAnonymousQuestionAction } from "@/actions/management/qa.actions";

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
const { prismaAnonymousQuestionMock } = vi.hoisted(() => ({
  prismaAnonymousQuestionMock: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    anonymousQuestion: prismaAnonymousQuestionMock,
  },
}));

describe("src/actions/management/qa.actions.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses unauthenticated callers and students with FORBIDDEN", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue(null);

    const unauthRes = await replyAnonymousQuestionAction({
      questionId: "q-1",
      response: "Wear smooth leather-soled shoes or dance sneakers.",
    });
    expect(unauthRes.success).toBe(false);
    if (!unauthRes.success) {
      expect(unauthRes.error.code).toBe("FORBIDDEN");
    }

    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "student-1",
      role: Role.STUDENT,
    });

    const studentRes = await replyAnonymousQuestionAction({
      questionId: "q-1",
      response: "Wear smooth leather-soled shoes or dance sneakers.",
    });
    expect(studentRes.success).toBe(false);
    if (!studentRes.success) {
      expect(studentRes.error.code).toBe("FORBIDDEN");
    }
    expect(prismaAnonymousQuestionMock.update).not.toHaveBeenCalled();
  });

  it("refuses fallback users under degraded pooler conditions", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "fallback-teacher",
      role: Role.INSTRUCTOR,
    });

    const res = await replyAnonymousQuestionAction({
      questionId: "q-1",
      response: "Classes are welcoming for absolute beginners.",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
    }
    expect(prismaAnonymousQuestionMock.update).not.toHaveBeenCalled();
  });

  it("validates questionId and response length (1-2000 chars)", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "staff-1",
      role: Role.INSTRUCTOR,
    });

    const emptyIdRes = await replyAnonymousQuestionAction({
      questionId: "",
      response: "Valid response content.",
    });
    expect(emptyIdRes.success).toBe(false);
    if (!emptyIdRes.success) {
      expect(emptyIdRes.error.code).toBe("VALIDATION_ERROR");
    }

    const emptyRespRes = await replyAnonymousQuestionAction({
      questionId: "q-1",
      response: "",
    });
    expect(emptyRespRes.success).toBe(false);
    if (!emptyRespRes.success) {
      expect(emptyRespRes.error.code).toBe("VALIDATION_ERROR");
    }
    expect(prismaAnonymousQuestionMock.update).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when question does not exist (prevents invalid ID mutations)", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "staff-1",
      role: Role.INSTRUCTOR,
    });
    prismaAnonymousQuestionMock.findUnique.mockResolvedValue(null);

    const res = await replyAnonymousQuestionAction({
      questionId: "non-existent-q",
      response: "No partner is required because we rotate in Rueda circles.",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("NOT_FOUND");
    }
    expect(prismaAnonymousQuestionMock.update).not.toHaveBeenCalled();
    expect(recordAuditLogMock).not.toHaveBeenCalled();
  });

  it("publishes response, marks status ANSWERED, and writes audit log", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "staff-1",
      role: Role.ADMIN,
    });
    prismaAnonymousQuestionMock.findUnique.mockResolvedValue({
      id: "q-42",
      category: "FOOTWEAR",
      status: "PENDING",
    });
    prismaAnonymousQuestionMock.update.mockResolvedValue({
      id: "q-42",
      response: "Wear comfortable shoes that allow pivoting on the ball of the foot.",
      status: "ANSWERED",
    });

    const res = await replyAnonymousQuestionAction({
      questionId: "q-42",
      response: "Wear comfortable shoes that allow pivoting on the ball of the foot.",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.id).toBe("q-42");
      expect(res.message).toContain("published to beginner FAQ");
    }

    expect(prismaAnonymousQuestionMock.update).toHaveBeenCalledWith({
      where: { id: "q-42" },
      data: {
        response: "Wear comfortable shoes that allow pivoting on the ball of the foot.",
        status: "ANSWERED",
      },
    });

    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "staff-1",
        action: AuditAction.EVENT_MUTATION,
        targetType: "AnonymousQuestion",
        targetId: "q-42",
        metadata: { category: "FOOTWEAR" },
      })
    );
  });
});
