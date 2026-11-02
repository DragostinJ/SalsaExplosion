"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AuditAction,
  Role,
  TransactionType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getOrProvisionCurrentUser,
  isFallbackUser,
  SERVICE_UNAVAILABLE_MESSAGE,
} from "@/lib/auth-user";
import { recordAuditLog } from "@/lib/audit-log";
import type { ManagementActionResponse } from "@/lib/constants/management";

const RedeemFreeClassSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking ID is required."),
});

export async function redeemFreeClassAction(rawInput: {
  bookingId: string;
}): Promise<ManagementActionResponse<{ bookingId: string; remainingCredits: number }>> {
  try {
    // fallback-guard
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Studio Admins can redeem free classes.",
        },
      };
    }
    if (isFallbackUser(actor)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const parsed = RedeemFreeClassSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid parameters.",
        },
      };
    }

    const { bookingId } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, classCredits: true },
          },
          classSession: {
            select: { id: true, title: true, isCancelled: true },
          },
        },
      });

      if (!booking) {
        throw new Error("Booking not found.");
      }

      if (booking.classSession.isCancelled) {
        throw new Error("Cannot redeem a free class for a cancelled session.");
      }

      if (booking.user.classCredits < 1) {
        throw new Error("Dancer has no free class credits available.");
      }

      const existingRedemption = await tx.creditLedger.findFirst({
        where: {
          bookingId: booking.id,
          description: {
            startsWith: "Free class used at the door",
          },
        },
      });

      if (existingRedemption) {
        throw new Error("This booking has already been redeemed with a free class.");
      }

      const updateCount = await tx.user.updateMany({
        where: { id: booking.userId, classCredits: { gte: 1 } },
        data: { classCredits: { decrement: 1 } },
      });

      if (updateCount.count === 0) {
        throw new Error("Dancer has no free class credits available.");
      }

      const updatedUser = await tx.user.findUniqueOrThrow({
        where: { id: booking.userId },
        select: { id: true, firstName: true, lastName: true, classCredits: true },
      });

      await tx.creditLedger.create({
        data: {
          userId: booking.userId,
          amount: -1,
          balanceAfter: updatedUser.classCredits,
          type: TransactionType.ADMIN_ADJUSTMENT,
          bookingId: booking.id,
          description: `Free class used at the door: ${booking.classSession.title}`,
        },
      });

      return {
        bookingId: booking.id,
        userId: booking.userId,
        studentName: `${booking.user.firstName} ${booking.user.lastName}`.trim(),
        classSessionId: booking.classSession.id,
        classTitle: booking.classSession.title,
        remainingCredits: updatedUser.classCredits,
      };
    });

    await recordAuditLog({
      actorId: actor.id,
      action: AuditAction.CREDIT_ADJUSTMENT,
      targetType: "USER",
      targetId: result.userId,
      metadata: {
        studentId: result.userId,
        studentName: result.studentName,
        classSessionId: result.classSessionId,
        classTitle: result.classTitle,
        bookingId: result.bookingId,
        balanceAfter: result.remainingCredits,
        reason: "Free class used at the door",
      },
    });

    revalidatePath("/instructor/roster");
    revalidatePath("/dashboard/carnet");
    revalidatePath("/dashboard/wallet");

    return {
      success: true,
      data: { bookingId: result.bookingId, remainingCredits: result.remainingCredits },
      message: `Free class redeemed for ${result.studentName}. Remaining credits: ${result.remainingCredits}.`,
    };
  } catch (error) {
    const knownErrors = [
      "Booking not found.",
      "Cannot redeem a free class for a cancelled session.",
      "Dancer has no free class credits available.",
      "This booking has already been redeemed with a free class.",
    ];
    const rawMessage = error instanceof Error ? error.message : "";
    const isKnown = knownErrors.includes(rawMessage);

    if (!isKnown) {
      console.error("[redeemFreeClassAction]", error);
    }

    return {
      success: false,
      error: {
        code: isKnown ? "REDEMPTION_REFUSED" : "INTERNAL_ERROR",
        message: isKnown ? rawMessage : "Failed to redeem free class.",
      },
    };
  }
}
