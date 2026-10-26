"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role, AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { recordAuditLog } from "@/lib/audit-log";
import type { ManagementActionResponse } from "@/lib/constants/management";

const ReplyAnonymousQuestionSchema = z.object({
  questionId: z.string().min(1),
  response: z.string().min(1).max(2000),
});

export async function replyAnonymousQuestionAction(
  rawInput: z.infer<typeof ReplyAnonymousQuestionSchema>
): Promise<ManagementActionResponse<{ id: string }>> {
  try {
    const user = await getOrProvisionCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.INSTRUCTOR)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Only studio staff can answer beginner questions." },
      };
    }

    const parsed = ReplyAnonymousQuestionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Answer must be between 1 and 2000 characters." },
      };
    }

    const existing = await prisma.anonymousQuestion.findUnique({
      where: { id: parsed.data.questionId },
    });
    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Question not found." },
      };
    }

    const updated = await prisma.anonymousQuestion.update({
      where: { id: parsed.data.questionId },
      data: {
        response: parsed.data.response,
        status: "ANSWERED",
      },
    });

    await recordAuditLog({
      actorId: user.id,
      action: AuditAction.EVENT_MUTATION,
      targetType: "AnonymousQuestion",
      targetId: updated.id,
      metadata: { category: existing.category },
    });

    revalidatePath("/admin/operations");
    revalidatePath("/how-it-works");

    return {
      success: true,
      data: { id: updated.id },
      message: "Answer published to beginner FAQ.",
    };
  } catch (error) {
    console.error("[replyAnonymousQuestionAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not save question response." },
    };
  }
}
