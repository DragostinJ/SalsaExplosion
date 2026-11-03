"use server";

import { revalidatePath } from "next/cache";
import { AuditAction, Role } from "@prisma/client";
import { getOrProvisionCurrentUser, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { recordAuditLog } from "@/lib/audit-log";
import { reportError } from "@/lib/monitoring";
import { isNextControlFlowError } from "@/lib/safe-url";
import { ensureWeeklySessions } from "@/lib/schedule/ensure-weekly-sessions";
import type { ManagementActionResponse } from "@/lib/constants/management";

/**
 * The owner's "create them now" button on /admin/classes. The daily cron does the same thing
 * every morning; this is for right after a deploy, or to check it's working.
 */
export async function createUpcomingWeeklyClassesAction(): Promise<
  ManagementActionResponse<{ created: number; alreadyThere: number; skipped: number }>
> {
  try {
    // fallback-guard
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Only teachers and the owner can create classes." } };
    }
    if (isFallbackUser(actor)) {
      return { success: false, error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE } };
    }

    const result = await ensureWeeklySessions();
    if (result.error) {
      return { success: false, error: { code: "NO_STAFF", message: result.error } };
    }

    if (result.created > 0) {
      await recordAuditLog({
        actorId: actor.id,
        action: AuditAction.EVENT_MUTATION,
        targetType: "CLASS_SESSION",
        metadata: { mutation: "CREATE_WEEKLY_FROM_TIMETABLE", created: result.created, until: result.until },
      });
      revalidatePath("/classes");
      revalidatePath("/instructor/roster");
      revalidatePath("/admin/classes");
    }

    const skippedNote = result.skipped.length
      ? ` ${result.skipped.length} skipped because a festival or party uses the hall that night.`
      : "";
    return {
      success: true,
      data: { created: result.created, alreadyThere: result.alreadyThere, skipped: result.skipped.length },
      message:
        result.created > 0
          ? `Added ${result.created} classes from the timetable.${skippedNote}`
          : `All ${result.alreadyThere} classes for the next 4 weeks are already there.${skippedNote}`,
    };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    reportError("action:createUpcomingWeeklyClasses", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Couldn't create the classes. Try again in a minute." } };
  }
}
