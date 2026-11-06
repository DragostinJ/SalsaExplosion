"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BookingStatus, DanceRole, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { ActionResponse, BookingDomainError } from "@/lib/constants/booking";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";

import { DOOR } from "@/lib/constants/door-prices";
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
): Promise<ActionResponse<{ bookingId: string }>> {
  // fallback-guard
  const provisionedUser = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(provisionedUser?.id);

  return withRateLimit(identifier, "BOOKING", async (): Promise<ActionResponse<{ bookingId: string }>> => {
    try {
      // 1. Authenticate & Ensure Provisioned User
      if (!provisionedUser) {
        throw new BookingDomainError("UNAUTHORIZED", "You must be signed in to book a class.");
      }
      if (isFallbackUser(provisionedUser)) {
        throw new BookingDomainError("SERVICE_UNAVAILABLE", SERVICE_UNAVAILABLE_MESSAGE);
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
        // 3a. Fetch the dancer
        const user = await tx.user.findUnique({
          where: { id: provisionedUser.id },
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

        // 3c. No level lock (Enrique, 2026-11-02): a dancer may say they're coming to a class above
        // their level; the schedule card shows a friendly warning instead.

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

        // 3e. Count the reservation so teachers see who is coming. Enrique's rule: everyone can
        // come in, even when the class is busy or uneven, so a reservation never blocks on capacity
        // or on the Lead/Follow mix; the dance role is information for the teachers only.
        await tx.classSession.update({
          where: { id: classSession.id },
          data: { bookedCount: { increment: 1 } },
        });

        // 3g. Weekly classes are paid at the door, never online, and there are no
        // class credits: a booking only tells the teachers who is coming.

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

        return { bookingId: booking.id };
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    // 4. Revalidate Cache Paths
    revalidatePath("/classes");
    revalidatePath("/instructor/roster");
    revalidatePath("/instructor/students");
    revalidatePath("/admin/classes");
    revalidatePath("/admin/analytics");
    revalidatePath(`/checkin/${classSessionId}`);

    return {
      success: true,
      data: result,
      message: `Spot reserved! Pay at the door when you arrive (${DOOR.one} for 1 class, ${DOOR.two} for 2).`,
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
  });
}

// ==========================================
// 2. CANCEL BOOKING SERVER ACTION
// ==========================================

export async function cancelBookingAction(
  rawInput: CancelBookingInput
): Promise<ActionResponse<{ cancelled: true }>> {
  // fallback-guard
  const provisionedUser = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(provisionedUser?.id);

  return withRateLimit(identifier, "BOOKING", async (): Promise<ActionResponse<{ cancelled: true }>> => {
    try {
      // 1. Authenticate & Ensure Provisioned User
      if (!provisionedUser) {
        throw new BookingDomainError("UNAUTHORIZED", "You must be signed in to cancel a booking.");
      }
      if (isFallbackUser(provisionedUser)) {
        throw new BookingDomainError("SERVICE_UNAVAILABLE", SERVICE_UNAVAILABLE_MESSAGE);
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

      // Nothing was paid online and no credits exist, so cancelling only frees the spot
      return { classSessionId: booking.classSessionId };
    });

    // 4. Revalidate Cache Paths
    revalidatePath("/classes");
    revalidatePath("/instructor/roster");
    revalidatePath("/instructor/students");
    revalidatePath("/admin/classes");
    revalidatePath("/admin/analytics");
    revalidatePath(`/checkin/${result.classSessionId}`);

    return {
      success: true,
      data: { cancelled: true },
      message: "Cancelled. The teachers won't expect you this time.",
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
  });
}
