"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BookingStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";
import type { ManagementActionResponse } from "@/lib/constants/management";

const ToggleBookingCheckInSchema = z.object({
  bookingId: z.string().min(1),
  markAttended: z.boolean(),
});

const SelfCheckInClassQrSchema = z.object({
  classSessionId: z.string().min(1),
});

const ToggleEventCheckInSchema = z.object({
  registrationId: z.string().min(1),
  checkedIn: z.boolean(),
});

export async function toggleBookingCheckInAction(rawInput: {
  bookingId: string;
  markAttended: boolean;
}): Promise<ManagementActionResponse<{ bookingId: string; status: BookingStatus }>> {
  try {
    // fallback-guard
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Admins can check in students.",
        },
      };
    }
    if (isFallbackUser(actor)) {
      return {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: SERVICE_UNAVAILABLE_MESSAGE,
        },
      };
    }

    const parsed = ToggleBookingCheckInSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid check-in request." },
      };
    }

    const newStatus = parsed.data.markAttended
      ? BookingStatus.ATTENDED
      : BookingStatus.CONFIRMED;

    const updated = await prisma.booking.update({
      where: { id: parsed.data.bookingId },
      data: {
        status: newStatus,
        checkedInAt: parsed.data.markAttended ? new Date() : null,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    revalidatePath("/instructor/roster");
    revalidatePath("/instructor/students");
    revalidatePath("/admin/analytics");

    return {
      success: true,
      data: { bookingId: updated.id, status: updated.status },
      message: parsed.data.markAttended
        ? `Checked in ${updated.user.firstName} ${updated.user.lastName}!`
        : `Reverted check-in for ${updated.user.firstName} ${updated.user.lastName}.`,
    };
  } catch (error) {
    console.error("[toggleBookingCheckInAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not update check-in status." },
    };
  }
}

export async function selfCheckInClassQrAction(rawInput: {
  classSessionId: string;
}): Promise<ManagementActionResponse<{ bookingId: string; classTitle: string }>> {
  // fallback-guard
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(identifier, "CHECKIN", async (): Promise<ManagementActionResponse<{ bookingId: string; classTitle: string }>> => {
    try {
      if (!user) {
        return {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Please sign in to check in." },
        };
      }
      if (isFallbackUser(user)) {
        return {
          success: false,
          error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
        };
      }

      const parsed = SelfCheckInClassQrSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid class QR code." },
        };
      }

      const booking = await prisma.booking.findUnique({
        where: {
          userId_classSessionId: {
            userId: user.id,
            classSessionId: parsed.data.classSessionId,
          },
        },
        include: {
          classSession: {
            select: {
              title: true,
              startTime: true,
              endTime: true,
              isCancelled: true,
            },
          },
        },
      });

      if (
        !booking ||
        (booking.status !== BookingStatus.CONFIRMED &&
          booking.status !== BookingStatus.ATTENDED)
      ) {
        return {
          success: false,
          error: {
            code: "NO_ACTIVE_BOOKING",
            message:
              "You do not have a confirmed booking for this class yet. Book your spot on the schedule first!",
          },
        };
      }

      if (booking.classSession.isCancelled) {
        return {
          success: false,
          error: {
            code: "CLASS_CANCELLED",
            message: "This class has been cancelled by the studio.",
          },
        };
      }

      // Security: Check-in window validation (opens 90 minutes before, closes 60 minutes after class end)
      const now = new Date();
      const startTimeMs = booking.classSession.startTime.getTime();
      const endTimeMs = booking.classSession.endTime.getTime();
      const earliestCheckIn = startTimeMs - 90 * 60 * 1000;
      const latestCheckIn = endTimeMs + 60 * 60 * 1000;

      if (now.getTime() < earliestCheckIn) {
        return {
          success: false,
          error: {
            code: "CHECK_IN_NOT_OPEN",
            message: "Check-in for this class opens 90 minutes before class start time.",
          },
        };
      }

      if (now.getTime() > latestCheckIn) {
        return {
          success: false,
          error: {
            code: "CLASS_ENDED",
            message: "This class has already concluded and self check-in is closed.",
          },
        };
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.ATTENDED,
          checkedInAt: new Date(),
        },
      });

      revalidatePath(`/checkin/${parsed.data.classSessionId}`);
      revalidatePath("/instructor/roster");
      revalidatePath("/dashboard/schedule");

      return {
        success: true,
        data: { bookingId: booking.id, classTitle: booking.classSession.title },
        message: `Welcome to class, ${user.firstName}! You are checked in for ${booking.classSession.title}.`,
      };
    } catch (error) {
      console.error("[selfCheckInClassQrAction]", error);
      return {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to complete QR check-in." },
      };
    }
  });
}

export async function toggleEventRegistrationCheckInAction(rawInput: {
  registrationId: string;
  checkedIn: boolean;
}): Promise<ManagementActionResponse<{ registrationId: string; checkedIn: boolean }>> {
  try {
    // fallback-guard
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Unauthorized door scanner access." },
      };
    }
    if (isFallbackUser(actor)) {
      return {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: SERVICE_UNAVAILABLE_MESSAGE,
        },
      };
    }

    const parsed = ToggleEventCheckInSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid pass ID." },
      };
    }

    const updated = await prisma.eventRegistration.update({
      where: { id: parsed.data.registrationId },
      data: {
        checkedIn: parsed.data.checkedIn,
        checkedInAt: parsed.data.checkedIn ? new Date() : null,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    revalidatePath("/admin/events");

    return {
      success: true,
      data: { registrationId: updated.id, checkedIn: updated.checkedIn },
      message: updated.checkedIn
        ? `Door pass verified for ${updated.user.firstName} ${updated.user.lastName}!`
        : `Reverted door check-in for ${updated.user.firstName} ${updated.user.lastName}.`,
    };
  } catch (error) {
    console.error("[toggleEventRegistrationCheckInAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update pass check-in." },
    };
  }
}
