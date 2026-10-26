"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role, AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { recordAuditLog } from "@/lib/audit-log";
import type { ManagementActionResponse } from "@/lib/constants/management";

const UpdatePrivateLessonStatusSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});

export async function updatePrivateLessonBookingStatusAction(
  rawInput: z.infer<typeof UpdatePrivateLessonStatusSchema>
): Promise<ManagementActionResponse<{ id: string; status: string }>> {
  try {
    // fallback-guard
    const user = await getOrProvisionCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.INSTRUCTOR)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Only studio staff can update private bookings." },
      };
    }
    if (isFallbackUser(user)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const parsed = UpdatePrivateLessonStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid booking status data." },
      };
    }

    const existing = await prisma.privateLessonBooking.findUnique({
      where: { id: parsed.data.bookingId },
    });
    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Booking record not found." },
      };
    }

    const updated = await prisma.privateLessonBooking.update({
      where: { id: parsed.data.bookingId },
      data: { status: parsed.data.status },
    });

    await recordAuditLog({
      actorId: user.id,
      action: AuditAction.EVENT_MUTATION,
      targetType: "PrivateLessonBooking",
      targetId: updated.id,
      metadata: { previousStatus: existing.status, newStatus: updated.status },
    });

    revalidatePath("/admin/operations");
    revalidatePath("/dashboard/wallet");
    revalidatePath("/private-lessons");

    return {
      success: true,
      data: { id: updated.id, status: updated.status },
      message: `Booking marked as ${updated.status}.`,
    };
  } catch (error) {
    console.error("[updatePrivateLessonBookingStatusAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not update booking status." },
    };
  }
}
