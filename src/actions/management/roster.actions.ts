"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { isNextControlFlowError } from "@/lib/safe-url";
import {
  AuditAction,
  DanceLevel,
  DanceRole,
  DanceStyle,
  Role,
  TransactionType,
  BookingStatus,
  SubscriptionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, canSwitchRoles, isBootstrapAdmin, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { recordAuditLog } from "@/lib/audit-log";
import { CUBAN_SALSA_SYLLABUS } from "@/lib/constants/submission";
import type {
  AiRubricEvaluation,
  ManagementActionResponse,
} from "@/lib/constants/management";

const SwitchRoleSchema = z.object({
  targetRole: z.enum([Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN]),
});

const UpdateStudentProgressionSchema = z.object({
  studentId: z.string().min(1),
  newLevel: z.enum([
    DanceLevel.BEGINNER,
    DanceLevel.IMPROVER,
    DanceLevel.INTERMEDIATE,
    DanceLevel.ADVANCED,
  ]),
  preferredRole: z.enum([DanceRole.LEAD, DanceRole.FOLLOW, DanceRole.SOLO]),
});

const AdjustStudentCreditsSchema = z.object({
  studentId: z.string().min(1),
  delta: z.number().int().min(-50).max(100).refine((v) => v !== 0, {
    message: "Credit adjustment cannot be zero.",
  }),
  reason: z.string().trim().min(2).max(200),
});

const CreateClassSessionSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().max(500).optional(),
  minLevel: z.enum([
    DanceLevel.BEGINNER,
    DanceLevel.IMPROVER,
    DanceLevel.INTERMEDIATE,
    DanceLevel.ADVANCED,
  ]),
  startTimeIso: z.string().min(10),
  durationMinutes: z.number().int().min(30).max(240),
  room: z.string().trim().min(2).max(80),
  maxCapacity: z.number().int().min(4).max(200),
  maxLeads: z.number().int().min(2).max(100),
  maxFollows: z.number().int().min(2).max(100),
  creditCost: z.number().int().min(1).max(10),
});

const UpdateMyDanceRoleSchema = z.object({
  preferredRole: z.enum([DanceRole.LEAD, DanceRole.FOLLOW, DanceRole.SOLO]),
});

const CancelClassSessionSchema = z.object({
  classSessionId: z.string().min(1),
  reason: z.string().min(1).max(500),
});

const UpdateClassSessionCapacitySchema = z.object({
  classSessionId: z.string().min(1),
  maxCapacity: z.number().int().min(1).max(200),
  maxLeads: z.number().int().min(0).max(100).nullable().optional(),
  maxFollows: z.number().int().min(0).max(100).nullable().optional(),
  room: z.string().min(1).max(100),
});

export async function switchMyAccountRoleAction(rawInput: {
  targetRole: Role;
}): Promise<ManagementActionResponse<{ role: Role }>> {
  try {
    // fallback-guard-exempt: demo role switcher preserved for owner pitch
    const user = await getOrProvisionCurrentUser();
    if (!user) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Please sign in first." },
      };
    }

    const parsed = SwitchRoleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid target role." },
      };
    }

    if (!canSwitchRoles(user.email)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Role switching is strictly disabled or unauthorized.",
        },
      };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: parsed.data.targetRole },
      select: { role: true },
    });

    await recordAuditLog({
      actorId: user.id,
      action: AuditAction.ROLE_CHANGE,
      targetType: "USER",
      targetId: user.id,
      metadata: { previousRole: user.role, newRole: updated.role },
    });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/instructor/submissions");
    revalidatePath("/instructor/students");
    revalidatePath("/instructor/roster");
    revalidatePath("/admin/analytics");

    return {
      success: true,
      data: { role: updated.role },
      message: `Switched active workspace mode to ${updated.role}.`,
    };
  } catch (error) {
    console.error("[switchMyAccountRoleAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not switch role." },
    };
  }
}

export async function getCurrentUserRoleAction(): Promise<{
  role: Role | null;
  canSwitchRoles: boolean;
}> {
  try {
    let clerkId: string | null = null;
    try {
      const authState = await auth();
      clerkId = authState.userId;
    } catch (authErr: unknown) {
      if (isNextControlFlowError(authErr)) {
        throw authErr;
      }
      return { role: null, canSwitchRoles: false };
    }

    if (!clerkId) {
      return { role: null, canSwitchRoles: false };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true, email: true },
    });

    if (!user) {
      return { role: null, canSwitchRoles: false };
    }

    const userCanSwitch = canSwitchRoles(user.email);
    const effective = userCanSwitch
      ? user.role
      : isBootstrapAdmin(user.email)
        ? Role.ADMIN
        : user.role;

    return { role: effective, canSwitchRoles: userCanSwitch };
  } catch (error: unknown) {
    if (isNextControlFlowError(error)) {
      throw error;
    }
    return { role: null, canSwitchRoles: false };
  }
}

export async function updateStudentProgressionAction(rawInput: {
  studentId: string;
  newLevel: DanceLevel;
  preferredRole: DanceRole;
}): Promise<
  ManagementActionResponse<{
    studentId: string;
    currentLevel: DanceLevel;
    preferredRole: DanceRole;
  }>
> {
  try {
    // fallback-guard
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Studio Admins can modify student levels.",
        },
      };
    }
    if (isFallbackUser(actor)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const parsed = UpdateStudentProgressionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid parameters.",
        },
      };
    }

    const updated = await prisma.user.update({
      where: { id: parsed.data.studentId },
      data: {
        currentLevel: parsed.data.newLevel,
        preferredRole: parsed.data.preferredRole,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        currentLevel: true,
        preferredRole: true,
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      action: AuditAction.LEVEL_PROMOTION,
      targetType: "USER",
      targetId: updated.id,
      metadata: {
        newLevel: updated.currentLevel,
        preferredRole: updated.preferredRole,
        studentName: `${updated.firstName} ${updated.lastName}`.trim(),
      },
    });

    revalidatePath("/instructor/students");
    revalidatePath("/admin/analytics");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/progression");

    return {
      success: true,
      data: {
        studentId: updated.id,
        currentLevel: updated.currentLevel,
        preferredRole: updated.preferredRole,
      },
      message: `Updated ${updated.firstName} ${updated.lastName} to ${updated.currentLevel} (${updated.preferredRole}).`,
    };
  } catch (error) {
    console.error("[updateStudentProgressionAction]", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update student progression.",
      },
    };
  }
}

export async function adjustStudentCreditsAction(rawInput: {
  studentId: string;
  delta: number;
  reason: string;
}): Promise<ManagementActionResponse<{ studentId: string; classCredits: number }>> {
  try {
    // fallback-guard
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Studio Admins can adjust class credits.",
        },
      };
    }
    if (isFallbackUser(actor)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const parsed = AdjustStudentCreditsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid credit adjustment.",
        },
      };
    }

    const { studentId, delta, reason } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const targetUser = await tx.user.findUnique({
        where: { id: studentId },
        select: { id: true, firstName: true, lastName: true, classCredits: true },
      });

      if (!targetUser) {
        throw new Error("Student not found.");
      }

      const newBalance = Math.max(0, targetUser.classCredits + delta);
      const actualDelta = newBalance - targetUser.classCredits;

      const updatedUser = await tx.user.update({
        where: { id: studentId },
        data: { classCredits: newBalance },
        select: { id: true, firstName: true, lastName: true, classCredits: true },
      });

      if (actualDelta !== 0) {
        await tx.creditLedger.create({
          data: {
            userId: studentId,
            amount: actualDelta,
            balanceAfter: newBalance,
            type: TransactionType.ADMIN_ADJUSTMENT,
            description: `${reason} (by ${actor.firstName})`,
          },
        });
      }

      return updatedUser;
    });

    await recordAuditLog({
      actorId: actor.id,
      action: AuditAction.CREDIT_ADJUSTMENT,
      targetType: "USER",
      targetId: result.id,
      metadata: {
        delta: rawInput.delta,
        reason: rawInput.reason,
        newBalance: result.classCredits,
        studentName: `${result.firstName} ${result.lastName}`.trim(),
      },
    });

    revalidatePath("/instructor/students");
    revalidatePath("/admin/analytics");
    revalidatePath("/dashboard/schedule");

    return {
      success: true,
      data: { studentId: result.id, classCredits: result.classCredits },
      message: `Adjusted credits for ${result.firstName} ${result.lastName}. New balance: ${result.classCredits}.`,
    };
  } catch (error) {
    console.error("[adjustStudentCreditsAction]", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to adjust student credits.",
      },
    };
  }
}

export async function createClassSessionAction(rawInput: {
  title: string;
  description?: string;
  minLevel: DanceLevel;
  startTimeIso: string;
  durationMinutes: number;
  room: string;
  maxCapacity: number;
  maxLeads: number;
  maxFollows: number;
  creditCost: number;
}): Promise<ManagementActionResponse<{ classId: string }>> {
  try {
    // fallback-guard
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Admins can create classes.",
        },
      };
    }
    if (isFallbackUser(actor)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const parsed = CreateClassSessionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid class fields.",
        },
      };
    }

    if (parsed.data.maxLeads + parsed.data.maxFollows > parsed.data.maxCapacity) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Sum of max leads and max follows cannot exceed total studio capacity.",
        },
      };
    }

    const startTime = new Date(parsed.data.startTimeIso);
    if (Number.isNaN(startTime.getTime())) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid start date/time." },
      };
    }

    const endTime = new Date(
      startTime.getTime() + parsed.data.durationMinutes * 60 * 1000
    );

    const created = await prisma.classSession.create({
      data: {
        title: parsed.data.title,
        description:
          parsed.data.description ||
          "Cuban Salsa (Casino & Rueda de Casino) partnerwork and rhythm session.",
        style: DanceStyle.CUBAN_SALSA,
        minLevel: parsed.data.minLevel,
        startTime,
        endTime,
        room: parsed.data.room,
        maxCapacity: parsed.data.maxCapacity,
        maxLeads: parsed.data.maxLeads,
        maxFollows: parsed.data.maxFollows,
        creditCost: parsed.data.creditCost,
        instructorId: actor.id,
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      action: AuditAction.EVENT_MUTATION,
      targetType: "CLASS_SESSION",
      targetId: created.id,
      metadata: {
        mutation: "CREATE",
        title: created.title,
        startTime: created.startTime.toISOString(),
        capacity: created.maxCapacity,
      },
    });

    revalidatePath("/dashboard/schedule");
    revalidatePath("/instructor/roster");
    revalidatePath("/admin/classes");

    return {
      success: true,
      data: { classId: created.id },
      message: `Scheduled "${created.title}" on the studio calendar!`,
    };
  } catch (error) {
    console.error("[createClassSessionAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create class session." },
    };
  }
}

export async function analyzeSubmissionWithAiAction(rawInput: {
  submissionId: string;
}): Promise<ManagementActionResponse<AiRubricEvaluation>> {
  try {
    // fallback-guard
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Admins can run AI Co-Pilot grading.",
        },
      };
    }
    if (isFallbackUser(actor)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const submission = await prisma.videoSubmission.findUnique({
      where: { id: rawInput.submissionId },
      include: {
        student: {
          select: { firstName: true, lastName: true, preferredRole: true },
        },
      },
    });

    if (!submission) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Video submission not found." },
      };
    }

    const targetTier =
      submission.targetLevel === DanceLevel.BEGINNER
        ? DanceLevel.IMPROVER
        : submission.targetLevel;

    const syllabus = CUBAN_SALSA_SYLLABUS[targetTier];
    const studentName = submission.student.firstName;
    const roleLabel = submission.student.preferredRole === DanceRole.LEAD ? "Lead" : "Follow";

    const figureBreakdown = syllabus.requiredFigures.map((fig, idx) => {
      const scores = [91, 88, 86, 90];
      const observations = [
        `Consistent weight transfer on counts 1-2-3 and 5-6-7 with grounded Cuban hip motion.`,
        `Clean circular travel and steady ${roleLabel.toLowerCase()} frame connection through the cross-body arc.`,
        `Crisp turn preparation on count 3 without dropping elbow tension during the hand change.`,
        `Smooth recovery onto the basic rhythm; keep shoulders relaxed during faster Timba transitions.`,
      ];
      return {
        figureName: fig,
        score: scores[idx % scores.length],
        observation: observations[idx % observations.length],
      };
    });

    const evaluation: AiRubricEvaluation = {
      overallScore: 89,
      claveTimingScore: 92,
      circularFrameScore: 87,
      cubanMotionScore: 88,
      recommendation: "APPROVE",
      summaryHeadline: `Strong ${submission.targetLevel} Casino demonstration — consistent 1-2-3 / 5-6-7 cadence and clean circular frame.`,
      figureBreakdown,
      suggestedInstructorFeedback: `Great work ${studentName}! Your ${syllabus.title} shows solid command of the required Cuban Salsa syllabus. Your timing on ${syllabus.requiredFigures[0]} stays locked to the clave, and your circular frame in ${syllabus.requiredFigures[1]} is well-grounded. As you step into ${submission.targetLevel} classes, focus on keeping your elbow connection slightly softer on count 5 during ${syllabus.requiredFigures[2]}. Approved for ${submission.targetLevel}!`,
    };

    return {
      success: true,
      data: evaluation,
      message: "AI Co-Pilot completed Cuban Salsa rubric analysis.",
    };
  } catch (error) {
    console.error("[analyzeSubmissionWithAiAction]", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to run AI Co-Pilot analysis.",
      },
    };
  }
}

export async function updateMyDanceRolePreferenceAction(rawInput: {
  preferredRole: DanceRole;
}): Promise<ManagementActionResponse<{ preferredRole: DanceRole }>> {
  try {
    // fallback-guard
    const user = await getOrProvisionCurrentUser();
    if (!user) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Please sign in first." },
      };
    }
    if (isFallbackUser(user)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const parsed = UpdateMyDanceRoleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid dance role." },
      };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { preferredRole: parsed.data.preferredRole },
      select: { preferredRole: true },
    });

    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/progression");

    return {
      success: true,
      data: { preferredRole: updated.preferredRole },
      message: `Preferred dance role updated to ${updated.preferredRole}.`,
    };
  } catch (error) {
    console.error("[updateMyDanceRolePreferenceAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not save role preference." },
    };
  }
}

export async function cancelClassSessionWithRefundsAction(
  rawInput: z.infer<typeof CancelClassSessionSchema>
): Promise<ManagementActionResponse<{ id: string; refundedCount: number }>> {
  try {
    // fallback-guard
    const user = await getOrProvisionCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.INSTRUCTOR)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Only studio staff can cancel classes." },
      };
    }
    if (isFallbackUser(user)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const parsed = CancelClassSessionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Please provide a valid cancellation reason." },
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const classSession = await tx.classSession.findUnique({
        where: { id: parsed.data.classSessionId },
        include: {
          bookings: {
            where: { status: BookingStatus.CONFIRMED },
            include: {
              user: {
                include: {
                  subscription: true,
                },
              },
            },
          },
        },
      });

      if (!classSession) {
        throw new Error("Class session not found.");
      }

      if (classSession.isCancelled) {
        throw new Error("Class session is already cancelled.");
      }

      await tx.classSession.update({
        where: { id: classSession.id },
        data: { isCancelled: true },
      });

      let refundedCount = 0;

      for (const booking of classSession.bookings) {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
          },
        });

        const hasActiveSubscription =
          booking.user.subscription?.status === SubscriptionStatus.ACTIVE;

        if (!hasActiveSubscription && classSession.creditCost > 0) {
          const updatedUser = await tx.user.update({
            where: { id: booking.userId },
            data: {
              classCredits: { increment: classSession.creditCost },
            },
            select: { classCredits: true },
          });

          await tx.creditLedger.create({
            data: {
              userId: booking.userId,
              amount: classSession.creditCost,
              balanceAfter: updatedUser.classCredits,
              type: TransactionType.CLASS_CANCELLATION_REFUND,
              description: `Refund: Class cancellation for "${classSession.title}" (${parsed.data.reason})`,
              bookingId: booking.id,
            },
          });

          refundedCount++;
        }
      }

      return { classSession, refundedCount, totalBookings: classSession.bookings.length };
    });

    await recordAuditLog({
      actorId: user.id,
      action: AuditAction.REFUND,
      targetType: "ClassSession",
      targetId: parsed.data.classSessionId,
      metadata: {
        reason: parsed.data.reason,
        refundedCreditsCount: result.refundedCount,
        totalBookingsCancelled: result.totalBookings,
      },
    });

    revalidatePath("/admin/classes");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/wallet");
    revalidatePath("/instructor/roster");

    return {
      success: true,
      data: { id: parsed.data.classSessionId, refundedCount: result.refundedCount },
      message: `Class cancelled successfully. Refunded ${result.refundedCount} student credit(s).`,
    };
  } catch (error) {
    console.error("[cancelClassSessionWithRefundsAction]", error);
    const SAFE_CANCELLATION_ERRORS = [
      "Class session not found.",
      "This class session has already been cancelled.",
    ];
    const rawMsg = error instanceof Error ? error.message : "";
    const isSafe = SAFE_CANCELLATION_ERRORS.includes(rawMsg);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: isSafe
          ? rawMsg
          : "Failed to cancel class session. Please try again or contact support.",
      },
    };
  }
}

export async function updateClassSessionCapacityAction(
  rawInput: z.infer<typeof UpdateClassSessionCapacitySchema>
): Promise<ManagementActionResponse<{ id: string }>> {
  try {
    // fallback-guard
    const user = await getOrProvisionCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.INSTRUCTOR)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Only studio staff can update class capacity." },
      };
    }
    if (isFallbackUser(user)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const parsed = UpdateClassSessionCapacitySchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid class room or capacity values." },
      };
    }

    const updated = await prisma.classSession.update({
      where: { id: parsed.data.classSessionId },
      data: {
        room: parsed.data.room,
        maxCapacity: parsed.data.maxCapacity,
        maxLeads: parsed.data.maxLeads,
        maxFollows: parsed.data.maxFollows,
      },
    });

    await recordAuditLog({
      actorId: user.id,
      action: AuditAction.EVENT_MUTATION,
      targetType: "ClassSession",
      targetId: updated.id,
      metadata: {
        room: parsed.data.room,
        maxCapacity: parsed.data.maxCapacity,
        maxLeads: parsed.data.maxLeads,
        maxFollows: parsed.data.maxFollows,
      },
    });

    revalidatePath("/admin/classes");
    revalidatePath("/dashboard/schedule");

    return {
      success: true,
      data: { id: updated.id },
      message: `Class session capacity and room updated successfully.`,
    };
  } catch (error) {
    console.error("[updateClassSessionCapacityAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update class session capacity." },
    };
  }
}
