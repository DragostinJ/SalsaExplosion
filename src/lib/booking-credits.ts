import { TransactionType, type Prisma } from "@prisma/client";

/**
 * Credits a class booking really took (older credit-based bookings). Weekly classes are paid
 * at the door, so new reservations take none: refunds use this so they never mint credits.
 */
export async function creditsDeductedFor(
  tx: Prisma.TransactionClient,
  bookingId: string,
  userId: string
): Promise<number> {
  const deduction = await tx.creditLedger.findFirst({
    where: { bookingId, userId, type: TransactionType.CLASS_BOOKING_DEDUCTION },
    orderBy: { createdAt: "desc" },
  });
  return deduction ? Math.abs(deduction.amount) : 0;
}
