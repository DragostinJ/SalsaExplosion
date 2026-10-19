"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DanceLevel, Role, SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { LEVEL_WEIGHT } from "@/lib/constants/booking";

import {
  GradingDomainError,
  type GradingActionResponse,
} from "@/lib/constants/grading";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";

// ==========================================
// ZOD VALIDATION SCHEMA
// ==========================================

const GradeSubmissionSchema = z
  .object({
    submissionId: z.string().min(1, { message: "Invalid submission ID." }),
    decision: z.enum([SubmissionStatus.APPROVED, SubmissionStatus.REJECTED] as const, {
      message: "Decision must be APPROVED or REJECTED.",
    }),
    feedback: z
      .string()
      .trim()
      .max(2000, { message: "Feedback cannot exceed 2000 characters." })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Rejecting a student's video requires constructive feedback
    if (
      data.decision === SubmissionStatus.REJECTED &&
      (!data.feedback || data.feedback.length < 15)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["feedback"],
        message:
          "Constructive feedback (at least 15 characters) is required when rejecting a level-up submission.",
      });
    }
  });

export type GradeSubmissionInput = z.infer<typeof GradeSubmissionSchema>;

// ==========================================
// GRADE SUBMISSION SERVER ACTION
// ==========================================

export async function gradeSubmissionAction(
  rawInput: GradeSubmissionInput
): Promise<
  GradingActionResponse<{
    submissionId: string;
    newStatus: SubmissionStatus;
    studentNewLevel: DanceLevel;
    wasPromoted: boolean;
  }>
> {
  const provisionedReviewer = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(provisionedReviewer?.id);

  return withRateLimit(identifier, "AI_GRADING", async (): Promise<
    GradingActionResponse<{
      submissionId: string;
      newStatus: SubmissionStatus;
      studentNewLevel: DanceLevel;
      wasPromoted: boolean;
    }>
  > => {
    try {
      // 1. Authenticate & Ensure Provisioned Reviewer
      if (!provisionedReviewer) {
        throw new GradingDomainError(
          "UNAUTHORIZED",
          "You must be signed in to review submissions."
        );
      }

    // 2. Validate Payload
    const parsed = GradeSubmissionSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new GradingDomainError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid grading input."
      );
    }

    const { submissionId, decision, feedback } = parsed.data;

    // 3. Execute Atomic Grading & Level Promotion Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 3a. Verify Reviewer Role in Database (Zero-Trust Check)
      const reviewer = await tx.user.findUnique({
        where: { id: provisionedReviewer.id },
        select: { id: true, role: true },
      });

      if (
        !reviewer ||
        (reviewer.role !== Role.INSTRUCTOR && reviewer.role !== Role.ADMIN)
      ) {
        throw new GradingDomainError(
          "FORBIDDEN",
          "Only studio instructors and administrators can grade level-up videos."
        );
      }

      // 3b. Fetch Submission & Student State
      const submission = await tx.videoSubmission.findUnique({
        where: { id: submissionId },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              currentLevel: true,
            },
          },
        },
      });

      if (!submission) {
        throw new GradingDomainError(
          "SUBMISSION_NOT_FOUND",
          "Video submission not found."
        );
      }

      if (submission.status !== SubmissionStatus.PENDING) {
        throw new GradingDomainError(
          "ALREADY_GRADED",
          `This submission has already been marked as ${submission.status}.`
        );
      }

      const now = new Date();
      const normalizedFeedback =
        feedback && feedback.length > 0
          ? feedback
          : "Great technique and musicality! Welcome to the next level.";

      // 3c. Atomic Conditional Lock: Transition PENDING -> APPROVED | REJECTED
      const updatedSubmission = await tx.videoSubmission.updateMany({
        where: {
          id: submission.id,
          status: SubmissionStatus.PENDING,
        },
        data: {
          status: decision,
          instructorId: reviewer.id,
          feedback: normalizedFeedback,
          reviewedAt: now,
        },
      });

      if (updatedSubmission.count === 0) {
        throw new GradingDomainError(
          "ALREADY_GRADED",
          "Another instructor just finished grading this submission."
        );
      }

      // 3d. Monotonic Level Promotion (if APPROVED)
      let studentNewLevel = submission.student.currentLevel;
      let wasPromoted = false;

      if (decision === SubmissionStatus.APPROVED) {
        const currentWeight = LEVEL_WEIGHT[submission.student.currentLevel];
        const targetWeight = LEVEL_WEIGHT[submission.targetLevel];

        // Only promote if targetLevel is strictly higher than the student's current level
        if (targetWeight > currentWeight) {
          const updatedStudent = await tx.user.update({
            where: { id: submission.student.id },
            data: { currentLevel: submission.targetLevel },
            select: { currentLevel: true },
          });

          studentNewLevel = updatedStudent.currentLevel;
          wasPromoted = true;
        }
      }

      return {
        submissionId: submission.id,
        studentName: `${submission.student.firstName} ${submission.student.lastName}`,
        newStatus: decision,
        studentNewLevel,
        wasPromoted,
      };
    });

    // 4. Revalidate Relevant Cache Routes
    revalidatePath("/instructor/submissions");
    revalidatePath("/instructor/students");
    revalidatePath("/admin/analytics");
    revalidatePath("/dashboard/progression");
    revalidatePath("/dashboard/schedule");

    const message =
      result.newStatus === SubmissionStatus.APPROVED
        ? `Approved! ${result.studentName} has been promoted to ${result.studentNewLevel}.`
        : `Submission rejected. Your feedback has been sent to ${result.studentName}.`;

    return {
      success: true,
      data: {
        submissionId: result.submissionId,
        newStatus: result.newStatus,
        studentNewLevel: result.studentNewLevel,
        wasPromoted: result.wasPromoted,
      },
      message,
    };
  } catch (error) {
    if (error instanceof GradingDomainError) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }

    console.error("[gradeSubmissionAction Error]:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while saving the review.",
      },
    };
  }
  });
}
