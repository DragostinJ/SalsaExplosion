"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { AuditAction, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";
import { recordAuditLog } from "@/lib/audit-log";
import { SHOP_CATALOG } from "@/lib/constants/shop";

const ReserveMerchSchema = z.object({
  itemId: z.string().min(1).max(50),
  size: z.string().max(20).optional().nullable(),
});

export type ReserveMerchInput = z.infer<typeof ReserveMerchSchema>;

export interface ShopActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  message?: string;
}

/**
 * Persist Click & Collect merchandise reservation to PostgreSQL with server-enforced pricing & catalog validation
 */
export async function reserveMerchItemAction(
  rawInput: ReserveMerchInput
): Promise<ShopActionResponse<{ reservationId: string; pricePounds: number }>> {
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(
    identifier,
    "SHOP_RESERVATION",
    async (): Promise<ShopActionResponse<{ reservationId: string; pricePounds: number }>> => {
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

        const { itemId, size } = parsed.data;

        // Lookup item strictly in server catalog (never trust client name or price)
        const catalogItem = SHOP_CATALOG[itemId];
        if (!catalogItem) {
          return {
            success: false,
            error: "Selected merchandise item is not in the active academy catalog.",
          };
        }

        // Validate size if required
        if (catalogItem.sizes && catalogItem.sizes.length > 0) {
          if (!size || !catalogItem.sizes.includes(size)) {
            return {
              success: false,
              error: `Please select a valid size for ${catalogItem.name} (${catalogItem.sizes.join(", ")}).`,
            };
          }
        }

        const reservation = await prisma.merchReservation.create({
          data: {
            userId: user.id,
            itemId: catalogItem.id,
            itemName: catalogItem.name,
            size: size ?? null,
            pricePounds: catalogItem.pricePounds,
            status: "RESERVED",
          },
        });

        // Record forensic audit log
        await recordAuditLog({
          actorId: user.id,
          action: AuditAction.EVENT_MUTATION,
          targetType: "MerchReservation",
          targetId: reservation.id,
          metadata: {
            itemId: catalogItem.id,
            itemName: catalogItem.name,
            size: size ?? null,
            pricePounds: catalogItem.pricePounds,
          },
        });

        revalidatePath("/shop");
        revalidatePath("/dashboard/wallet");
        revalidatePath("/admin/operations");

        return {
          success: true,
          data: {
            reservationId: reservation.id,
            pricePounds: catalogItem.pricePounds,
          },
          message: `${catalogItem.name} reserved! Pay and collect at the BOH Studios reception desk.`,
        };
      } catch (err: unknown) {
        console.error("[reserveMerchItemAction]", err);
        return { success: false, error: "Failed to reserve merchandise item." };
      }
    }
  );
}

/**
 * Cancel a reserved Click & Collect merchandise reservation
 */
export async function cancelMerchReservationAction(rawInput: {
  reservationId: string;
}): Promise<ShopActionResponse<{ reservationId: string }>> {
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(
    identifier,
    "SHOP_RESERVATION",
    async (): Promise<ShopActionResponse<{ reservationId: string }>> => {
      try {
        if (!user) {
          return { success: false, error: "Please sign in to cancel your reservation." };
        }

        const reservation = await prisma.merchReservation.findUnique({
          where: { id: rawInput.reservationId },
        });

        if (!reservation) {
          return { success: false, error: "Merchandise reservation not found." };
        }

        const isOwner = reservation.userId === user.id;
        const isStaff = user.role === Role.ADMIN || user.role === Role.INSTRUCTOR;

        if (!isOwner && !isStaff) {
          return { success: false, error: "Unauthorized to cancel this reservation." };
        }

        const updated = await prisma.merchReservation.update({
          where: { id: rawInput.reservationId },
          data: { status: "CANCELLED" },
        });

        await recordAuditLog({
          actorId: user.id,
          action: AuditAction.EVENT_MUTATION,
          targetType: "MerchReservation",
          targetId: updated.id,
          metadata: {
            action: "CANCEL_RESERVATION",
            previousStatus: reservation.status,
            itemName: reservation.itemName,
          },
        });

        revalidatePath("/shop");
        revalidatePath("/dashboard/wallet");
        revalidatePath("/admin/operations");

        return {
          success: true,
          data: { reservationId: updated.id },
          message: `${reservation.itemName} reservation cancelled.`,
        };
      } catch (err: unknown) {
        console.error("[cancelMerchReservationAction]", err);
        return { success: false, error: "Failed to cancel merchandise reservation." };
      }
    }
  );
}
