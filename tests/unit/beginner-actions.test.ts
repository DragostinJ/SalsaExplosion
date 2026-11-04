/**
 * Beginner Actions & Psychological Safety Unit Suite
 *
 * Protects:
 * 1. Anonymous question handling: Rate-limited, validated schemas, safe email handling, and category-specific reassurances.
 * 2. Post-class check-in: Authentication required, fallback-user resilient, strictly scoped to the signed-in dancer (preventing IDOR).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role } from "@prisma/client";
import {
  submitAnonymousQuestionAction,
  submitPostClassFeedbackAction,
} from "@/actions/beginner.actions";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth-user module
vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
  SERVICE_UNAVAILABLE_MESSAGE: "We can't reach our booking system right now. Please try again in a minute.",
}));

// Mock ratelimit
const { withRateLimitMock, getRateLimitIdentifierMock } = vi.hoisted(() => ({
  withRateLimitMock: vi.fn((_id: string, _action: string, fn: () => Promise<unknown>) => fn()),
  getRateLimitIdentifierMock: vi.fn().mockResolvedValue("test-rate-identifier"),
}));

vi.mock("@/lib/ratelimit", () => ({
  withRateLimit: withRateLimitMock,
  getRateLimitIdentifier: getRateLimitIdentifierMock,
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    anonymousQuestion: {
      create: vi.fn(),
    },
    classSession: {
      findUnique: vi.fn(),
    },
    postClassFeedback: {
      upsert: vi.fn(),
    },
  },
}));

import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

describe("beginner.actions: Anonymous Question Guard (Rate-Limiting & Validation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls rate limiter with identifier and ANONYMOUS_QUESTION action token", async () => {
    vi.mocked(prisma.anonymousQuestion.create).mockResolvedValue({
      id: "q-123",
      category: "FOOTWEAR",
      question: "Do I need special dance shoes for my first class?",
      email: null,
      status: "ANSWERED",
      response: "Clean smooth-soled shoes are perfect!",
      createdAt: new Date(),
    } as never);

    await submitAnonymousQuestionAction({
      category: "FOOTWEAR",
      question: "Do I need special dance shoes for my first class?",
    });

    expect(getRateLimitIdentifierMock).toHaveBeenCalledWith(null);
    expect(withRateLimitMock).toHaveBeenCalledWith(
      "test-rate-identifier",
      "ANONYMOUS_QUESTION",
      expect.any(Function)
    );
  });

  it("validates question length (rejects fewer than 5 characters)", async () => {
    const res = await submitAnonymousQuestionAction({
      category: "GENERAL",
      question: "Hi?",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/at least 5 characters/i);
    expect(prisma.anonymousQuestion.create).not.toHaveBeenCalled();
  });

  it("validates category (rejects unknown category)", async () => {
    const res = await submitAnonymousQuestionAction({
      category: "INVALID_CAT" as never,
      question: "What time does class start?",
    });

    expect(res.success).toBe(false);
    expect(prisma.anonymousQuestion.create).not.toHaveBeenCalled();
  });

  it("validates email formatting when email is provided", async () => {
    const res = await submitAnonymousQuestionAction({
      category: "VENUE_ARRIVING",
      question: "Where should I park near 104 Commercial Rd?",
      email: "not-an-email",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/valid email/i);
    expect(prisma.anonymousQuestion.create).not.toHaveBeenCalled();
  });

  it("persists valid anonymous question and returns specific reassurance text", async () => {
    vi.mocked(prisma.anonymousQuestion.create).mockResolvedValue({
      id: "q-456",
      category: "PARTNER_ANXIETY",
      question: "I am coming alone. Do I need to bring a dance partner?",
      email: null,
      status: "ANSWERED",
      response: "In Cuban Salsa and Rueda de Casino, we rotate in a circle every 60 seconds.",
      createdAt: new Date(),
    } as never);

    const res = await submitAnonymousQuestionAction({
      category: "PARTNER_ANXIETY",
      question: "I am coming alone. Do I need to bring a dance partner?",
    });

    expect(res.success).toBe(true);
    expect(prisma.anonymousQuestion.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        category: "PARTNER_ANXIETY",
        question: "I am coming alone. Do I need to bring a dance partner?",
        email: null,
        status: "ANSWERED",
      }),
    });
    if (res.success && res.data) {
      expect(res.data.reassurance).toMatch(/rotate in a circle every 60 seconds/i);
    }
  });
});

describe("beginner.actions: Post-Class Feedback Scoping & Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses unauthenticated users from submitting post-class feedback", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(null);

    const res = await submitPostClassFeedbackAction({
      classSessionId: "session-1",
      sentiment: "LOVED_IT",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Please sign in/i);
    expect(prisma.postClassFeedback.upsert).not.toHaveBeenCalled();
  });

  it("refuses fallback users when degraded DB prevents safe write", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "fallback-dancer-99",
      role: Role.STUDENT,
    } as never);

    const res = await submitPostClassFeedbackAction({
      classSessionId: "session-1",
      sentiment: "CHALLENGING_FUN",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/We can't reach our booking system/i);
    expect(prisma.postClassFeedback.upsert).not.toHaveBeenCalled();
  });

  it("refuses feedback when the class session does not exist", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "dancer-real-1",
      role: Role.STUDENT,
    } as never);

    vi.mocked(prisma.classSession.findUnique).mockResolvedValue(null);

    const res = await submitPostClassFeedbackAction({
      classSessionId: "nonexistent-session",
      sentiment: "LOVED_IT",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Class session not found/i);
    expect(prisma.postClassFeedback.upsert).not.toHaveBeenCalled();
  });

  it("strictly scopes upsert to the authenticated dancer's ID (preventing IDOR)", async () => {
    const authenticatedDancerId = "dancer-real-555";
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: authenticatedDancerId,
      role: Role.STUDENT,
    } as never);

    vi.mocked(prisma.classSession.findUnique).mockResolvedValue({
      id: "session-real-1",
    } as never);

    vi.mocked(prisma.postClassFeedback.upsert).mockResolvedValue({
      id: "feedback-1",
      userId: authenticatedDancerId,
      classSessionId: "session-real-1",
      sentiment: "A_BIT_OVERWHELMED",
      notes: "First time in Rueda, loved the music!",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const res = await submitPostClassFeedbackAction({
      classSessionId: "session-real-1",
      sentiment: "A_BIT_OVERWHELMED",
      notes: "First time in Rueda, loved the music!",
    });

    expect(res.success).toBe(true);
    // Multi-tenant check: where and create MUST be bound to authenticatedDancerId
    expect(prisma.postClassFeedback.upsert).toHaveBeenCalledWith({
      where: {
        userId_classSessionId: {
          userId: authenticatedDancerId,
          classSessionId: "session-real-1",
        },
      },
      update: {
        sentiment: "A_BIT_OVERWHELMED",
        notes: "First time in Rueda, loved the music!",
      },
      create: {
        userId: authenticatedDancerId,
        classSessionId: "session-real-1",
        sentiment: "A_BIT_OVERWHELMED",
        notes: "First time in Rueda, loved the music!",
      },
    });

    if (res.success && res.data) {
      expect(res.data.encouragement).toMatch(/Maestro Enrique promises your muscle memory begins taking over/i);
    }
  });
});
