"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BookingStatus, DanceLevel, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getOrProvisionCurrentUser,
  requireRole,
  STAFF_ROLES,
} from "@/lib/auth-user";

// ==========================================
// SCHEMAS
// ==========================================

const AttachRecapSchema = z.object({
  classSessionId: z.string().min(1, "Class Session ID is required"),
  recapVideoUrl: z
    .string()
    .url("Please provide a valid video URL (e.g. YouTube, Vimeo, Supabase MP4)")
    .refine(
      (val) => {
        try {
          const u = new URL(val);
          return u.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Video URL must use secure https protocol." }
    ),
  recapNotes: z.string().max(2000, "Notes cannot exceed 2000 characters"),
  recapFigures: z
    .array(z.string().min(1).max(100))
    .min(1, "Please list at least one Cuban figure practiced in class"),
  recapPublished: z.boolean().default(true),
});

export type AttachRecapInput = z.infer<typeof AttachRecapSchema>;

export interface AttendedRecapItem {
  id: string;
  classSessionId: string;
  title: string;
  minLevel: DanceLevel;
  startTime: string;
  room: string;
  danceRole?: string;
  instructorName: string;
  instructorAvatarUrl: string | null;
  instructorSpecialty: string | null;
  recapVideoUrl: string;
  recapNotes: string;
  recapFigures: string[];
  recapRecordedAt: string | null;
}

// ==========================================
// SERVER ACTIONS
// ==========================================

/**
 * Attach or update an end-of-class recap video and Cuban figures practiced.
 * Accessible to Instructors and Admins.
 */
export async function attachClassRecapAction(rawInput: AttachRecapInput) {
  try {
    const user = await requireRole(STAFF_ROLES);
    const parsed = AttachRecapSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false as const,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid recap data",
        },
      };
    }

    const { classSessionId, recapVideoUrl, recapNotes, recapFigures, recapPublished } =
      parsed.data;

    // Verify class session exists
    const session = await prisma.classSession.findUnique({
      where: { id: classSessionId },
      select: { id: true, instructorId: true, title: true },
    });

    if (!session) {
      return {
        success: false as const,
        error: {
          code: "NOT_FOUND",
          message: "Class session not found.",
        },
      };
    }

    // Instructors can only edit their own classes unless they are ADMIN
    if (user.role === Role.INSTRUCTOR && session.instructorId !== user.id) {
      return {
        success: false as const,
        error: {
          code: "FORBIDDEN",
          message: "You can only attach recap videos to classes you instructed.",
        },
      };
    }

    const updated = await prisma.classSession.update({
      where: { id: classSessionId },
      data: {
        recapVideoUrl,
        recapNotes,
        recapFigures,
        recapRecordedAt: new Date(),
        recapPublished,
      },
    });

    revalidatePath("/dashboard/recaps");
    revalidatePath("/instructor/roster");
    revalidatePath("/admin/classes");
    revalidatePath("/dashboard/schedule");

    return {
      success: true as const,
      data: {
        id: updated.id,
        recapVideoUrl: updated.recapVideoUrl,
        recapFigures: updated.recapFigures,
        recapPublished: updated.recapPublished,
      },
      message: recapPublished
        ? `Recap video for "${session.title}" published! Attended students can now review the figures in their Recaps library.`
        : `Recap draft saved for "${session.title}".`,
    };
  } catch (error) {
    console.error("[attachClassRecapAction]", error);
    return {
      success: false as const,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to publish class recap video. Please try again.",
      },
    };
  }
}

/**
 * Get all attended class sessions with published recap videos for current student.
 */
export async function getMyAttendedClassRecapsAction() {
  try {
    const user = await getOrProvisionCurrentUser();
    if (!user) {
      return {
        success: false as const,
        error: { code: "UNAUTHORIZED", message: "Please sign in to view recaps." },
      };
    }

    const now = new Date();

    // Query bookings where student attended or confirmed for finished classes
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        status: { in: [BookingStatus.ATTENDED, BookingStatus.CONFIRMED] },
        classSession: {
          endTime: { lt: now },
          recapPublished: true,
          recapVideoUrl: { not: null },
        },
      },
      orderBy: { classSession: { startTime: "desc" } },
      include: {
        classSession: {
          include: {
            instructor: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                specialty: true,
              },
            },
          },
        },
      },
    });

    const items: AttendedRecapItem[] = bookings.map((b) => ({
      id: b.id,
      classSessionId: b.classSession.id,
      title: b.classSession.title,
      minLevel: b.classSession.minLevel,
      startTime: b.classSession.startTime.toISOString(),
      room: b.classSession.room,
      danceRole: b.danceRole,
      instructorName: `${b.classSession.instructor.firstName} ${b.classSession.instructor.lastName}`,
      instructorAvatarUrl: b.classSession.instructor.avatarUrl,
      instructorSpecialty: b.classSession.instructor.specialty,
      recapVideoUrl: b.classSession.recapVideoUrl!,
      recapNotes: b.classSession.recapNotes ?? "",
      recapFigures: b.classSession.recapFigures,
      recapRecordedAt: b.classSession.recapRecordedAt
        ? b.classSession.recapRecordedAt.toISOString()
        : null,
    }));

    return {
      success: true as const,
      data: items,
      message: `Retrieved ${items.length} class recaps.`,
    };
  } catch (error) {
    console.error("[getMyAttendedClassRecapsAction]", error);
    return {
      success: false as const,
      error: { code: "INTERNAL_ERROR", message: "Failed to load class recaps." },
    };
  }
}

/**
 * Get all studio recaps published across the curriculum (for exploration / preview).
 */
export async function getAllPublishedClassRecapsAction() {
  try {
    const classes = await prisma.classSession.findMany({
      where: {
        recapPublished: true,
        recapVideoUrl: { not: null },
      },
      orderBy: { startTime: "desc" },
      take: 20,
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            specialty: true,
          },
        },
      },
    });

    const items = classes.map((c) => ({
      id: c.id,
      classSessionId: c.id,
      title: c.title,
      minLevel: c.minLevel,
      startTime: c.startTime.toISOString(),
      room: c.room,
      instructorName: `${c.instructor.firstName} ${c.instructor.lastName}`,
      instructorAvatarUrl: c.instructor.avatarUrl,
      instructorSpecialty: c.instructor.specialty,
      recapVideoUrl: c.recapVideoUrl!,
      recapNotes: c.recapNotes ?? "",
      recapFigures: c.recapFigures,
      recapRecordedAt: c.recapRecordedAt ? c.recapRecordedAt.toISOString() : null,
    }));

    return {
      success: true as const,
      data: items,
    };
  } catch (error) {
    console.error("[getAllPublishedClassRecapsAction]", error);
    return {
      success: false as const,
      error: { code: "INTERNAL_ERROR", message: "Failed to load studio recaps." },
    };
  }
}
