"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { TransactionType, AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";
import { recordAuditLog } from "@/lib/audit-log";

const ReferralCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^SALSA-[A-Z]{1,4}-[A-Z0-9]{4}$/i, "Invalid referral code format."),
});

export interface ReferralActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  message?: string;
}

/**
 * Redeem a friend's referral code to claim +1 free class credit (and award +1 to referrer)
 */
export async function redeemReferralCodeAction(rawInput: {
  code: string;
}): Promise<ReferralActionResponse<{ creditsAwarded: number }>> {
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(
    identifier,
    "BOOKING",
    async (): Promise<ReferralActionResponse<{ creditsAwarded: number }>> => {
      try {
        if (!user) {
          return {
            success: false,
            error: "Please sign in to redeem a referral code.",
          };
        }

        const parsed = ReferralCodeSchema.safeParse(rawInput);
        if (!parsed.success) {
          return {
            success: false,
            error: "Please enter a valid Salsa Explosion referral code (e.g. SALSA-DANC-1234).",
          };
        }

        const normalizedCode = parsed.data.code.toUpperCase();

        // 1. Check if student already redeemed ANY referral code
        const alreadyRedeemed = await prisma.creditLedger.findFirst({
          where: {
            userId: user.id,
            description: { startsWith: "REFERRAL_BONUS_REDEEMED:" },
          },
        });

        if (alreadyRedeemed) {
          return {
            success: false,
            error: "You have already redeemed a welcome referral bonus on your account.",
          };
        }

        // 2. Identify referrer by suffix match against existing user IDs
        const parts = normalizedCode.split("-");
        const suffix = parts[2]; // 4-char suffix
        const referrerCandidates = await prisma.user.findMany({
          where: {
            id: { endsWith: suffix },
          },
          select: { id: true, firstName: true, classCredits: true },
        });

        // Exclude self-referral
        const validReferrer = referrerCandidates.find((c) => c.id !== user.id);

        if (referrerCandidates.some((c) => c.id === user.id)) {
          return {
            success: false,
            error: "You cannot redeem your own personal referral code.",
          };
        }

        // 3. Atomically grant 1 bonus credit to student (and 1 to referrer if found)
        await prisma.$transaction(async (tx) => {
          // Grant to current user
          const updatedUser = await tx.user.update({
            where: { id: user.id },
            data: { classCredits: { increment: 1 } },
          });

          await tx.creditLedger.create({
            data: {
              userId: user.id,
              amount: 1,
              balanceAfter: updatedUser.classCredits,
              type: TransactionType.ADMIN_ADJUSTMENT,
              description: `REFERRAL_BONUS_REDEEMED:${normalizedCode}`,
            },
          });

          // If valid referrer found, award them +1 credit
          if (validReferrer) {
            const updatedReferrer = await tx.user.update({
              where: { id: validReferrer.id },
              data: { classCredits: { increment: 1 } },
            });

            await tx.creditLedger.create({
              data: {
                userId: validReferrer.id,
                amount: 1,
                balanceAfter: updatedReferrer.classCredits,
                type: TransactionType.ADMIN_ADJUSTMENT,
                description: `REFERRAL_REWARD_EARNED_FROM:${user.id}:${normalizedCode}`,
              },
            });

            await recordAuditLog({
              actorId: user.id,
              action: AuditAction.CREDIT_ADJUSTMENT,
              targetType: "User",
              targetId: validReferrer.id,
              metadata: {
                reason: "REFERRAL_BONUS_AWARDED",
                referralCode: normalizedCode,
                creditsGranted: 1,
              },
            });
          }
        });

        await recordAuditLog({
          actorId: user.id,
          action: AuditAction.CREDIT_ADJUSTMENT,
          targetType: "User",
          targetId: user.id,
          metadata: {
            reason: "REFERRAL_CODE_REDEEMED",
            referralCode: normalizedCode,
            creditsGranted: 1,
          },
        });

        revalidatePath("/dashboard/referrals");
        revalidatePath("/dashboard/schedule");
        revalidatePath("/dashboard/wallet");

        return {
          success: true,
          data: { creditsAwarded: 1 },
          message: "🎉 Success! 1 Complimentary Class Credit has been added to your studio wallet!",
        };
      } catch (err: unknown) {
        console.error("[redeemReferralCodeAction]", err);
        return {
          success: false,
          error: "Unable to process referral code redemption. Please try again.",
        };
      }
    }
  );
}
