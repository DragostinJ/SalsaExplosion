"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isNextControlFlowError } from "@/lib/safe-url";

export async function getMyPrivateLessonBookingsAction(): Promise<{
  id: string;
  instructorName: string;
  focusTopic: string;
  packageType: string;
  preferredSlot: string;
  totalPricePounds: number;
  status: string;
  createdAtIso: string;
}[]> {
  try {
    let clerkId: string | null = null;
    try {
      const authState = await auth();
      clerkId = authState.userId;
    } catch (authErr: unknown) {
      if (isNextControlFlowError(authErr)) {
        throw authErr;
      }
      return [];
    }

    if (!clerkId) {
      return [];
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    const rawBookings = await prisma.privateLessonBooking.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return rawBookings.map((b) => ({
      id: b.id,
      instructorName: b.instructorName,
      focusTopic: b.focusTopic,
      packageType: b.packageType,
      preferredSlot: b.preferredSlot,
      totalPricePounds: b.totalPricePounds,
      status: b.status,
      createdAtIso: b.createdAt.toISOString(),
    }));
  } catch (error: unknown) {
    if (isNextControlFlowError(error)) {
      throw error;
    }
    return [];
  }
}
