"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role, DanceRole, AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { recordAuditLog } from "@/lib/audit-log";
import type { ManagementActionResponse } from "@/lib/constants/management";

const UpdatePartnerWaitlistStatusSchema = z.object({
  waitlistId: z.string().min(1),
  status: z.enum(["WAITING", "PAIRED", "NOTIFIED", "CANCELLED"]),
});

export async function updatePartnerWaitlistStatusAction(
  rawInput: z.infer<typeof UpdatePartnerWaitlistStatusSchema>
): Promise<ManagementActionResponse<{ id: string; status: string }>> {
  try {
    const user = await getOrProvisionCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.INSTRUCTOR)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Only studio staff can update partner waitlist." },
      };
    }

    const parsed = UpdatePartnerWaitlistStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid waitlist status data." },
      };
    }

    const existing = await prisma.partnerWaitlistEntry.findUnique({
      where: { id: parsed.data.waitlistId },
    });
    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Waitlist record not found." },
      };
    }

    const updated = await prisma.partnerWaitlistEntry.update({
      where: { id: parsed.data.waitlistId },
      data: { status: parsed.data.status },
    });

    await recordAuditLog({
      actorId: user.id,
      action: AuditAction.EVENT_MUTATION,
      targetType: "PartnerWaitlistEntry",
      targetId: updated.id,
      metadata: { previousStatus: existing.status, newStatus: updated.status },
    });

    revalidatePath("/admin/operations");

    return {
      success: true,
      data: { id: updated.id, status: updated.status },
      message: `Waitlist entry updated to ${updated.status}.`,
    };
  } catch (error) {
    console.error("[updatePartnerWaitlistStatusAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not update waitlist status." },
    };
  }
}

export async function autoPairWaitlistDancersAction(): Promise<
  ManagementActionResponse<{
    leadEntryId: string;
    followEntryId: string;
    leadName: string;
    followName: string;
  }>
> {
  try {
    const user = await getOrProvisionCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.INSTRUCTOR)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Only studio staff can auto-pair waitlist dancers." },
      };
    }

    // Find the oldest WAITING Lead and oldest WAITING Follow
    const [oldestLead, oldestFollow] = await Promise.all([
      prisma.partnerWaitlistEntry.findFirst({
        where: { role: DanceRole.LEAD, status: "WAITING" },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      prisma.partnerWaitlistEntry.findFirst({
        where: { role: DanceRole.FOLLOW, status: "WAITING" },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    if (!oldestLead || !oldestFollow) {
      return {
        success: false,
        error: {
          code: "CANNOT_PAIR",
          message: !oldestLead
            ? "No waiting leads in the waitlist queue to pair."
            : "No waiting follows in the waitlist queue to pair.",
        },
      };
    }

    // Atomically mark both as NOTIFIED
    await prisma.$transaction([
      prisma.partnerWaitlistEntry.update({
        where: { id: oldestLead.id },
        data: { status: "NOTIFIED" },
      }),
      prisma.partnerWaitlistEntry.update({
        where: { id: oldestFollow.id },
        data: { status: "NOTIFIED" },
      }),
    ]);

    await Promise.all([
      recordAuditLog({
        actorId: user.id,
        action: AuditAction.EVENT_MUTATION,
        targetType: "PartnerWaitlistEntry",
        targetId: oldestLead.id,
        metadata: {
          action: "AUTO_PAIRED_NOTIFIED",
          pairedWithId: oldestFollow.id,
          role: DanceRole.LEAD,
        },
      }),
      recordAuditLog({
        actorId: user.id,
        action: AuditAction.EVENT_MUTATION,
        targetType: "PartnerWaitlistEntry",
        targetId: oldestFollow.id,
        metadata: {
          action: "AUTO_PAIRED_NOTIFIED",
          pairedWithId: oldestLead.id,
          role: DanceRole.FOLLOW,
        },
      }),
    ]);

    revalidatePath("/admin/operations");

    const leadName = `${oldestLead.user.firstName} ${oldestLead.user.lastName}`.trim();
    const followName = `${oldestFollow.user.firstName} ${oldestFollow.user.lastName}`.trim();

    return {
      success: true,
      data: {
        leadEntryId: oldestLead.id,
        followEntryId: oldestFollow.id,
        leadName,
        followName,
      },
      message: `Successfully paired & notified Lead ${leadName} with Follow ${followName}!`,
    };
  } catch (error) {
    console.error("[autoPairWaitlistDancersAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to auto-pair waitlist dancers." },
    };
  }
}
