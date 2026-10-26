"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role, AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { recordAuditLog } from "@/lib/audit-log";
import type { ManagementActionResponse } from "@/lib/constants/management";

const UpdateMerchReservationStatusSchema = z.object({
  reservationId: z.string().min(1),
  status: z.enum(["RESERVED", "COLLECTED", "CANCELLED"]),
});

export async function updateMerchReservationStatusAction(
  rawInput: z.infer<typeof UpdateMerchReservationStatusSchema>
): Promise<ManagementActionResponse<{ id: string; status: string }>> {
  try {
    // fallback-guard
    const user = await getOrProvisionCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.INSTRUCTOR)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Only studio staff can update merch reservations." },
      };
    }
    if (isFallbackUser(user)) {
      return {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
      };
    }

    const parsed = UpdateMerchReservationStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid merch reservation data." },
      };
    }

    const existing = await prisma.merchReservation.findUnique({
      where: { id: parsed.data.reservationId },
    });
    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Reservation record not found." },
      };
    }

    const updated = await prisma.merchReservation.update({
      where: { id: parsed.data.reservationId },
      data: { status: parsed.data.status },
    });

    await recordAuditLog({
      actorId: user.id,
      action: AuditAction.EVENT_MUTATION,
      targetType: "MerchReservation",
      targetId: updated.id,
      metadata: { previousStatus: existing.status, newStatus: updated.status },
    });

    revalidatePath("/admin/operations");
    revalidatePath("/dashboard/wallet");
    revalidatePath("/shop");

    return {
      success: true,
      data: { id: updated.id, status: updated.status },
      message: `Merch reservation marked as ${updated.status}.`,
    };
  } catch (error) {
    console.error("[updateMerchReservationStatusAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not update reservation status." },
    };
  }
}
