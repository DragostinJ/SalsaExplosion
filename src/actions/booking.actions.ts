"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  BookingStatus,
  DanceRole,
  Prisma,
  SubscriptionStatus,
  TransactionType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import {
  ActionResponse,
  BookingDomainError,
  CANCELLATION_WINDOW_HOURS,
  LEVEL_WEIGHT,
} from "@/lib/constants/booking";

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

const BookClassSchema = z.object({
  classSessionId: z.string().min(1, { message: "Invalid class session ID." }),
  danceRole: z.enum([DanceRole.LEAD, DanceRole.FOLLOW, DanceRole.SOLO], {
    message: "Please select a valid dance role (LEAD, FOLLOW, or SOLO).",
  }),
});

const CancelBookingSchema = z.object({
  bookingId: z.string().min(1, { message: "Invalid booking ID." }),
});

export type BookClassInput = z.infer<typeof BookClassSchema>;
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;

// ==========================================
// 1. BOOK CLASS SERVER ACTION
// ==========================================

export async function bookClassAction(
  rawInput: BookClassInput
): Promise<ActionResponse<{ bookingId: string; usedSubscription: boolean; remainingCredits: number }>> {
  try {
    // 1. Authenticate & Ensure Provisioned User
    const provisionedUser = await getOrProvisionCurrentUser();
    if (!provisionedUser) {
      throw new BookingDomainError("UNAUTHORIZED", "You must be signed in to book a class.");
    }

    // 2. Validate Payload
    const parsed = BookClassSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new BookingDomainError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid booking parameters."
      );
    }
    const { classSessionId, danceRole } = parsed.data;

    // 3. Execute Atomic Transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // 3a. Fetch User with Subscription state
        const user = await tx.user.findUnique({
          where: { id: provisionedUser.id },
          include: { subscription: true },
        });

        if (!user) {
          throw new BookingDomainError("USER_NOT_FOUND", "Student profile not found.");
        }

        // 3b. Fetch Class Session metadata
        const classSession = await tx.classSession.findUnique({
          where: { id: classSessionId },
        });

        if (!classSession) {
          throw new BookingDomainError("CLASS_NOT_FOUND", "This class session no longer exists.");
        }

        if (classSession.isCancelled) {
          throw new BookingDomainError("CLASS_CANCELLED", "This class has been cancelled by the studio.");
        }

        const now = new Date();
        if (classSession.startTime <= now) {
          throw new BookingDomainError(
            "CLASS_ALREADY_STARTED",
            "Bookings are closed because this class has already started."
          );
        }

        // 3c. Enforce Dance Level Hierarchy
        const userWeight = LEVEL_WEIGHT[user.currentLevel];
        const requiredWeight = LEVEL_WEIGHT[classSession.minLevel];

        if (userWeight < requiredWeight) {
          throw new BookingDomainError(
            "INSUFFICIENT_LEVEL",
            `This class requires ${classSession.minLevel} level unlocked (your current level: ${user.currentLevel}). Upload a level-up video to advance!`
          );
        }

        // 3d. Check for existing booking (supports re-booking if previously CANCELLED)
        const existingBooking = await tx.booking.findUnique({
          where: {
            userId_classSessionId: {
              userId: user.id,
              classSessionId: classSession.id,
            },
          },
        });

        if (
          existingBooking &&
          (existingBooking.status === BookingStatus.CONFIRMED ||
            existingBooking.status === BookingStatus.ATTENDED)
        ) {
          throw new BookingDomainError(
            "ALREADY_BOOKED",
            "You already have a confirmed spot in this class."
          );
        }

        // 3e. Acquire Row-Level Lock on ClassSession & Enforce Total Capacity
        // In PostgreSQL, UPDATE acquires a row-level lock until the transaction commits,
        // preventing concurrent requests from bypassing either total or role-specific limits.
        const lockedClassUpdate = await tx.classSession.updateMany({
          where: {
            id: classSession.id,
            isCancelled: false,
            bookedCount: { lt: classSession.maxCapacity },
          },
          data: {
            bookedCount: { increment: 1 },
          },
        });

        if (lockedClassUpdate.count === 0) {
          throw new BookingDomainError(
            "CLASS_FULL",
            "This class just reached maximum capacity."
          );
        }

        // 3f. Enforce Partner Role Balance (Max Leads / Max Follows)
        // Because the ClassSession row is now locked by 3e, no parallel transaction
        // can insert a conflicting Lead/Follow booking before our count completes.
        if (danceRole === DanceRole.LEAD && classSession.maxLeads !== null) {
          const currentLeads = await tx.booking.count({
            where: {
              classSessionId: classSession.id,
              danceRole: DanceRole.LEAD,
              status: { in: [BookingStatus.CONFIRMED, BookingStatus.ATTENDED] },
            },
          });

          if (currentLeads >= classSession.maxLeads) {
            throw new BookingDomainError(
              "ROLE_CAPACITY_FULL",
              "All Lead spots for this class are full to maintain partner balance."
            );
          }
        }

        if (danceRole === DanceRole.FOLLOW && classSession.maxFollows !== null) {
          const currentFollows = await tx.booking.count({
            where: {
              classSessionId: classSession.id,
              danceRole: DanceRole.FOLLOW,
              status: { in: [BookingStatus.CONFIRMED, BookingStatus.ATTENDED] },
            },
          });

          if (currentFollows >= classSession.maxFollows) {
            throw new BookingDomainError(
              "ROLE_CAPACITY_FULL",
              "All Follow spots for this class are full to maintain partner balance."
            );
          }
        }

        // 3g. Determine Payment Method: Active Subscription vs. Class Credits
        const hasActiveSubscription =
          user.subscription !== null &&
          user.subscription.status === SubscriptionStatus.ACTIVE &&
          user.subscription.currentPeriodEnd > now;

        let updatedCredits = user.classCredits;

        if (!hasActiveSubscription) {
          // Atomic conditional deduction prevents negative balances under concurrent clicks
          const creditDeduction = await tx.user.updateMany({
            where: {
              id: user.id,
              classCredits: { gte: classSession.creditCost },
            },
            data: {
              classCredits: { decrement: classSession.creditCost },
            },
          });

          if (creditDeduction.count === 0) {
            throw new BookingDomainError(
              "INSUFFICIENT_CREDITS",
              `You need ${classSession.creditCost} credit(s) to book this class (current balance: ${user.classCredits}).`
            );
          }

          updatedCredits = user.classCredits - classSession.creditCost;
        }

        // 3h. Upsert Booking Record (handles both fresh bookings and re-activated cancellations)
        const booking = await tx.booking.upsert({
          where: {
            userId_classSessionId: {
              userId: user.id,
              classSessionId: classSession.id,
            },
          },
          update: {
            danceRole,
            status: BookingStatus.CONFIRMED,
            cancelledAt: null,
          },
          create: {
            userId: user.id,
            classSessionId: classSession.id,
            danceRole,
            status: BookingStatus.CONFIRMED,
          },
        });

        // 3i. Record Immutable Credit Ledger Entry (if credits were used)
        if (!hasActiveSubscription && classSession.creditCost > 0) {
          await tx.creditLedger.create({
            data: {
              userId: user.id,
              amount: -classSession.creditCost,
              balanceAfter: updatedCredits,
              type: TransactionType.CLASS_BOOKING_DEDUCTION,
              bookingId: booking.id,
              description: `Booked ${classSession.title} (${danceRole}) for ${classSession.startTime.toISOString()}`,
            },
          });
        }

        return {
          bookingId: booking.id,
          usedSubscription: hasActiveSubscription,
          remainingCredits: updatedCredits,
        };
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    // 4. Revalidate Cache Paths
    revalidatePath("/dashboard/schedule");
    revalidatePath("/instructor/roster");
    revalidatePath("/instructor/students");
    revalidatePath("/admin/classes");
    revalidatePath("/admin/analytics");
    revalidatePath(`/checkin/${classSessionId}`);

    return {
      success: true,
      data: result,
      message: result.usedSubscription
        ? "Spot confirmed using your active membership!"
        : "Spot confirmed! Credit deducted from your pass.",
    };
  } catch (error) {
    if (error instanceof BookingDomainError) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }

    console.error("[bookClassAction Error]:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while processing your booking. Please try again.",
      },
    };
  }
}

// ==========================================
// 2. CANCEL BOOKING SERVER ACTION
// ==========================================

export async function cancelBookingAction(
  rawInput: CancelBookingInput
): Promise<ActionResponse<{ refundedCredits: number; remainingCredits: number; isLateCancellation: boolean }>> {
  try {
    // 1. Authenticate & Ensure Provisioned User
    const provisionedUser = await getOrProvisionCurrentUser();
    if (!provisionedUser) {
      throw new BookingDomainError("UNAUTHORIZED", "You must be signed in to cancel a booking.");
    }

    // 2. Validate Payload
    const parsed = CancelBookingSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new BookingDomainError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid booking ID."
      );
    }
    const { bookingId } = parsed.data;

    // 3. Execute Atomic Cancellation Transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: provisionedUser.id },
      });

      if (!user) {
        throw new BookingDomainError("USER_NOT_FOUND", "Student profile not found.");
      }

      // Fetch Booking along with ClassSession details
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { classSession: true },
      });

      if (!booking || booking.userId !== user.id) {
        throw new BookingDomainError(
          "BOOKING_NOT_FOUND",
          "Booking not found or you do not have permission to modify it."
        );
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new BookingDomainError(
          "ALREADY_CANCELLED",
          `This booking cannot be cancelled (current status: ${booking.status}).`
        );
      }

      const now = new Date();
      if (booking.classSession.startTime <= now) {
        throw new BookingDomainError(
          "CLASS_ALREADY_STARTED",
          "Cannot cancel a class that has already started or finished."
        );
      }

      // 3a. Atomic Status Transition Guard (prevents double-refunds on rapid double-clicks)
      const statusUpdate = await tx.booking.updateMany({
        where: {
          id: booking.id,
          status: BookingStatus.CONFIRMED,
        },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: now,
        },
      });

      if (statusUpdate.count === 0) {
        throw new BookingDomainError(
          "ALREADY_CANCELLED",
          "This booking was already cancelled."
        );
      }

      // 3b. Release Class Spot (guard against negative bookedCount)
      await tx.classSession.updateMany({
        where: {
          id: booking.classSessionId,
          bookedCount: { gt: 0 },
        },
        data: {
          bookedCount: { decrement: 1 },
        },
      });

      // 3c. Check if the specific booking originally consumed credits
      const latestDeduction = await tx.creditLedger.findFirst({
        where: {
          bookingId: booking.id,
          userId: user.id,
          type: TransactionType.CLASS_BOOKING_DEDUCTION,
        },
        orderBy: { createdAt: "desc" },
      });

      const hoursUntilClass =
        (booking.classSession.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isEligibleForRefund = hoursUntilClass >= CANCELLATION_WINDOW_HOURS;

      let refundedCredits = 0;
      let remainingCredits = user.classCredits;

      if (latestDeduction && isEligibleForRefund) {
        refundedCredits = Math.abs(latestDeduction.amount);

        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            classCredits: { increment: refundedCredits },
          },
          select: { classCredits: true },
        });

        remainingCredits = updatedUser.classCredits;

        await tx.creditLedger.create({
          data: {
            userId: user.id,
            amount: refundedCredits,
            balanceAfter: remainingCredits,
            type: TransactionType.CLASS_CANCELLATION_REFUND,
            bookingId: booking.id,
            description: `Refund for cancelling ${booking.classSession.title} (${hoursUntilClass.toFixed(1)}h notice)`,
          },
        });
      }

      return {
        classSessionId: booking.classSessionId,
        refundedCredits,
        remainingCredits,
        isLateCancellation: Boolean(latestDeduction && !isEligibleForRefund),
      };
    });

    // 4. Revalidate Cache Paths
    revalidatePath("/dashboard/schedule");
    revalidatePath("/instructor/roster");
    revalidatePath("/instructor/students");
    revalidatePath("/admin/classes");
    revalidatePath("/admin/analytics");
    revalidatePath(`/checkin/${result.classSessionId}`);

    return {
      success: true,
      data: {
        refundedCredits: result.refundedCredits,
        remainingCredits: result.remainingCredits,
        isLateCancellation: result.isLateCancellation,
      },
      message: result.isLateCancellation
        ? `Booking cancelled. Because the class starts in less than ${CANCELLATION_WINDOW_HOURS} hours, your class credit was not refunded.`
        : result.refundedCredits > 0
          ? `Booking cancelled and ${result.refundedCredits} credit(s) refunded to your account.`
          : "Booking cancelled and your spot has been released.",
    };
  } catch (error) {
    if (error instanceof BookingDomainError) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }

    console.error("[cancelBookingAction Error]:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while cancelling your booking.",
      },
    };
  }
}
