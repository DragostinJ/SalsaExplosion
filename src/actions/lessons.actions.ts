"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";

const BookPrivateLessonSchema = z.object({
  instructorName: z.string().min(2).max(100),
  focusTopic: z.string().min(2).max(100),
  packageType: z.enum(["SINGLE_1HR", "BLOCK_5HR"]),
  preferredSlot: z.string().min(2).max(100),
  totalPricePounds: z.number().int().positive().max(2000),
});

export type BookPrivateLessonInput = z.infer<typeof BookPrivateLessonSchema>;

export interface LessonActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Persist 1-on-1 Private Lesson & Coaching booking request to PostgreSQL
 */
export async function bookPrivateLessonAction(
  rawInput: BookPrivateLessonInput
): Promise<LessonActionResponse<{ bookingId: string }>> {
  try {
    const user = await getOrProvisionCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Please sign in to book your private coaching session.",
      };
    }

    const parsed = BookPrivateLessonSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid coaching booking details.",
      };
    }

    const { instructorName, focusTopic, packageType, preferredSlot, totalPricePounds } = parsed.data;

    const booking = await prisma.privateLessonBooking.create({
      data: {
        studentId: user.id,
        instructorName,
        focusTopic,
        packageType,
        preferredSlot,
        totalPricePounds,
        status: "PENDING",
      },
    });

    revalidatePath("/private-lessons");

    return {
      success: true,
      data: { bookingId: booking.id },
      message: `Coaching request with ${instructorName} registered! Our studio desk will confirm your slot.`,
    };
  } catch (err: unknown) {
    console.error("[bookPrivateLessonAction]", err);
    return { success: false, error: "Failed to book private coaching session." };
  }
}
