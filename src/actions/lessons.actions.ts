"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { AuditAction, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";
import { recordAuditLog } from "@/lib/audit-log";
import { COACHING_INSTRUCTORS_CATALOG } from "@/lib/constants/coaching";

const BookPrivateLessonSchema = z.object({
  instructorId: z.enum(["enrique", "moe", "justyna", "arturas", "jim"]),
  focusTopic: z.string().min(2).max(100),
  packageType: z.enum(["SINGLE_1HR", "BLOCK_5HR"]),
  preferredSlot: z.string().min(2).max(100),
  dancerType: z.enum(["SOLO", "COUPLE"]).default("SOLO"),
  notes: z.string().max(1000).optional(),
});

export type BookPrivateLessonInput = z.infer<typeof BookPrivateLessonSchema>;

export interface LessonActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  message?: string;
}

/**
 * Persist 1-on-1 Private Lesson & Coaching booking request to PostgreSQL with server-enforced pricing & audit log
 */
export async function bookPrivateLessonAction(
  rawInput: BookPrivateLessonInput
): Promise<LessonActionResponse<{ bookingId: string; totalPricePounds: number }>> {
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(
    identifier,
    "LESSON_RESERVATION",
    async (): Promise<LessonActionResponse<{ bookingId: string; totalPricePounds: number }>> => {
      try {
        if (!user) {
          return {
            success: false,
            error: "Please sign in to book your private coaching session.",
          };
        }

        const parsed = BookPrivateLessonSchema.safeParse(rawInput);
        if (!parsed.success) {
          return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid coaching booking details.",
          };
        }

        const { instructorId, focusTopic, packageType, preferredSlot, dancerType, notes } =
          parsed.data;

        const instructor = COACHING_INSTRUCTORS_CATALOG[instructorId];
        if (!instructor) {
          return {
            success: false,
            error: "Selected coach is not available.",
          };
        }

        // Server-enforced pricing: never trust client price
        const serverPricePounds =
          packageType === "SINGLE_1HR"
            ? instructor.hourlyRatePounds
            : instructor.blockRatePounds;

        const booking = await prisma.privateLessonBooking.create({
          data: {
            studentId: user.id,
            instructorName: instructor.name,
            focusTopic,
            packageType,
            preferredSlot: `${preferredSlot} (${dancerType === "COUPLE" ? "Couple" : "Solo"})`,
            totalPricePounds: serverPricePounds,
            status: "PENDING",
          },
        });

        // Record forensic audit log
        await recordAuditLog({
          actorId: user.id,
          action: AuditAction.EVENT_MUTATION,
          targetType: "PrivateLessonBooking",
          targetId: booking.id,
          metadata: {
            instructorId,
            instructorName: instructor.name,
            packageType,
            totalPricePounds: serverPricePounds,
            preferredSlot,
            notes: notes ?? null,
          },
        });

        revalidatePath("/private-lessons");
        revalidatePath("/dashboard/wallet");
        revalidatePath("/admin/operations");

        return {
          success: true,
          data: {
            bookingId: booking.id,
            totalPricePounds: serverPricePounds,
          },
          message: `Coaching request with ${instructor.name} registered! Our studio desk will confirm your slot.`,
        };
      } catch (err: unknown) {
        console.error("[bookPrivateLessonAction]", err);
        return { success: false, error: "Failed to book private coaching session." };
      }
    }
  );
}

/**
 * Cancel a pending private coaching booking request
 */
export async function cancelPrivateLessonBookingAction(rawInput: {
  bookingId: string;
}): Promise<LessonActionResponse<{ bookingId: string }>> {
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(
    identifier,
    "LESSON_RESERVATION",
    async (): Promise<LessonActionResponse<{ bookingId: string }>> => {
      try {
        if (!user) {
          return { success: false, error: "Please sign in to cancel your booking." };
        }

        const booking = await prisma.privateLessonBooking.findUnique({
          where: { id: rawInput.bookingId },
        });

        if (!booking) {
          return { success: false, error: "Booking request not found." };
        }

        const isOwner = booking.studentId === user.id;
        const isStaff = user.role === Role.ADMIN || user.role === Role.INSTRUCTOR;

        if (!isOwner && !isStaff) {
          return { success: false, error: "Unauthorized to cancel this booking." };
        }

        const updated = await prisma.privateLessonBooking.update({
          where: { id: rawInput.bookingId },
          data: { status: "CANCELLED" },
        });

        await recordAuditLog({
          actorId: user.id,
          action: AuditAction.EVENT_MUTATION,
          targetType: "PrivateLessonBooking",
          targetId: updated.id,
          metadata: {
            action: "CANCEL_BOOKING",
            previousStatus: booking.status,
          },
        });

        revalidatePath("/private-lessons");
        revalidatePath("/dashboard/wallet");
        revalidatePath("/admin/operations");

        return {
          success: true,
          data: { bookingId: updated.id },
          message: "Private coaching request cancelled.",
        };
      } catch (err: unknown) {
        console.error("[cancelPrivateLessonBookingAction]", err);
        return { success: false, error: "Failed to cancel coaching request." };
      }
    }
  );
}
