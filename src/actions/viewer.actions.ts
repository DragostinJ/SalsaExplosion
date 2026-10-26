"use server";

import { auth } from "@clerk/nextjs/server";
import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isNextControlFlowError } from "@/lib/safe-url";

export async function getMyPassContextAction(): Promise<{
  signedIn: boolean;
  classCredits: number;
  hasActiveSubscription: boolean;
}> {
  try {
    let clerkId: string | null = null;
    try {
      const authState = await auth();
      clerkId = authState.userId;
    } catch (authErr: unknown) {
      if (isNextControlFlowError(authErr)) {
        throw authErr;
      }
      return { signedIn: false, classCredits: 0, hasActiveSubscription: false };
    }

    if (!clerkId) {
      return { signedIn: false, classCredits: 0, hasActiveSubscription: false };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        classCredits: true,
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      return { signedIn: true, classCredits: 0, hasActiveSubscription: false };
    }

    const now = new Date();
    const hasActiveSub =
      user.subscription !== null &&
      user.subscription.status === SubscriptionStatus.ACTIVE &&
      user.subscription.currentPeriodEnd > now;

    return {
      signedIn: true,
      classCredits: user.classCredits,
      hasActiveSubscription: hasActiveSub,
    };
  } catch (error: unknown) {
    if (isNextControlFlowError(error)) {
      throw error;
    }
    return { signedIn: false, classCredits: 0, hasActiveSubscription: false };
  }
}

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
