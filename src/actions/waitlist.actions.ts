"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { DanceRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";

const JoinWaitlistSchema = z.object({
  role: z.nativeEnum(DanceRole),
});

const InviteBypassSchema = z.object({
  partnerEmail: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  role: z.nativeEnum(DanceRole),
});

export interface WaitlistActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  message?: string;
}

/**
 * 1. Join Solo Priority Partner-Match Queue
 */
export async function joinPartnerWaitlistAction(rawInput: {
  role: DanceRole;
}): Promise<WaitlistActionResponse<{ entryId: string; role: DanceRole }>> {
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(identifier, "BOOKING", async (): Promise<WaitlistActionResponse<{ entryId: string; role: DanceRole }>> => {
    try {
      if (!user) {
        return { success: false, error: "Please sign in to join the priority waitlist." };
      }

      const parsed = JoinWaitlistSchema.safeParse(rawInput);
      if (!parsed.success) {
        return { success: false, error: "Invalid dance role selection." };
      }

      // Check if already on active waitlist
      const existing = await prisma.partnerWaitlistEntry.findFirst({
        where: {
          userId: user.id,
          role: parsed.data.role,
          status: "WAITING",
        },
      });

      if (existing) {
        return {
          success: true,
          data: { entryId: existing.id, role: existing.role },
          message: "You are already active in the Priority Partner-Match Queue.",
        };
      }

      const entry = await prisma.partnerWaitlistEntry.create({
        data: {
          userId: user.id,
          role: parsed.data.role,
          status: "WAITING",
        },
      });

      revalidatePath("/dashboard/schedule");

      return {
        success: true,
        data: { entryId: entry.id, role: entry.role },
        message: `Successfully joined Priority Waitlist as ${entry.role}!`,
      };
    } catch (err: unknown) {
      console.error("[joinPartnerWaitlistAction]", err);
      return { success: false, error: "Failed to join priority waitlist." };
    }
  });
}

/**
 * 2. Send Partner Bypass Invitation & Record Paired Entry
 */
export async function invitePartnerBypassAction(rawInput: {
  partnerEmail: string;
  role: DanceRole;
}): Promise<WaitlistActionResponse<{ entryId: string; partnerEmail: string }>> {
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(identifier, "BOOKING", async (): Promise<WaitlistActionResponse<{ entryId: string; partnerEmail: string }>> => {
    try {
      if (!user) {
        return { success: false, error: "Please sign in to invite a dance partner." };
      }

      const parsed = InviteBypassSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid invitation details.",
        };
      }

      const { partnerEmail, role } = parsed.data;
      const normalizedPartnerEmail = partnerEmail.trim().toLowerCase();

      // Guard: prevent self-invitation bypass
      if (user.email && user.email.trim().toLowerCase() === normalizedPartnerEmail) {
        return {
          success: false,
          error: "You cannot invite your own email address as a dance partner.",
        };
      }

      // Guard: prevent duplicate paired entries / race conditions
      const existingPaired = await prisma.partnerWaitlistEntry.findFirst({
        where: {
          userId: user.id,
          partnerEmail: normalizedPartnerEmail,
          status: "PAIRED",
        },
      });

      if (existingPaired) {
        return {
          success: true,
          data: { entryId: existingPaired.id, partnerEmail: normalizedPartnerEmail },
          message: `You already have an active paired reservation with ${partnerEmail}.`,
        };
      }

      const entry = await prisma.partnerWaitlistEntry.create({
        data: {
          userId: user.id,
          role,
          partnerEmail: normalizedPartnerEmail,
          status: "PAIRED",
        },
      });

      revalidatePath("/dashboard/schedule");

      return {
        success: true,
        data: { entryId: entry.id, partnerEmail },
        message: `Partner bypass invitation dispatched to ${partnerEmail}!`,
      };
    } catch (err: unknown) {
      console.error("[invitePartnerBypassAction]", err);
      return { success: false, error: "Failed to dispatch partner bypass invitation." };
    }
  });
}
