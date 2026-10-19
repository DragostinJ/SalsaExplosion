"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";

const ReserveMerchSchema = z.object({
  itemId: z.string().min(1).max(50),
  itemName: z.string().min(2).max(100),
  size: z.string().max(20).optional().nullable(),
  pricePounds: z.number().int().positive().max(500),
});

export type ReserveMerchInput = z.infer<typeof ReserveMerchSchema>;

export interface ShopActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  message?: string;
}

/**
 * Persist Click & Collect merchandise reservation to PostgreSQL
 */
export async function reserveMerchItemAction(
  rawInput: ReserveMerchInput
): Promise<ShopActionResponse<{ reservationId: string }>> {
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(identifier, "SHOP_RESERVATION", async (): Promise<ShopActionResponse<{ reservationId: string }>> => {
    try {
      if (!user) {
        return {
          success: false,
          error: "Please sign in to reserve items for studio desk pickup.",
        };
      }

    const parsed = ReserveMerchSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid reservation details.",
      };
    }

    const { itemId, itemName, size, pricePounds } = parsed.data;

    const reservation = await prisma.merchReservation.create({
      data: {
        userId: user.id,
        itemId,
        itemName,
        size: size ?? null,
        pricePounds,
        status: "RESERVED",
      },
    });

    revalidatePath("/shop");

    return {
      success: true,
      data: { reservationId: reservation.id },
      message: `${itemName} reserved! Pay and collect at the BOH Studios reception desk.`,
    };
    } catch (err: unknown) {
      console.error("[reserveMerchItemAction]", err);
      return { success: false, error: "Failed to reserve merchandise item." };
    }
  });
}
