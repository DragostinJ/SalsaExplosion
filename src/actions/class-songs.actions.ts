"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { reportError } from "@/lib/monitoring";
import { isKnownSongId, MAX_CLASS_PRACTICE_SONGS } from "@/lib/music/class-songs";

/**
 * "Tonight's songs": a teacher links up to 3 practice-player songs to a class.
 * Students see them on the door check-in page and with the class recap.
 */

const SetClassSongsSchema = z.object({
  classSessionId: z.string().trim().min(1).max(100),
  songIds: z
    .array(z.string().trim().min(1).max(100))
    .max(MAX_CLASS_PRACTICE_SONGS, `Pick up to ${MAX_CLASS_PRACTICE_SONGS} songs`)
    .refine((ids) => new Set(ids).size === ids.length, "Each song can only be picked once")
    .refine((ids) => ids.every(isKnownSongId), "Unknown song"),
});

export type SetClassSongsInput = z.infer<typeof SetClassSongsSchema>;

export type SetClassSongsResponse =
  | { success: true; data: { classSessionId: string; songIds: string[] } }
  | {
      success: false;
      error: { code: "VALIDATION_ERROR" | "NOT_FOUND" | "FORBIDDEN" | "INTERNAL_ERROR"; message: string };
    };

export async function setClassPracticeSongsAction(rawInput: SetClassSongsInput): Promise<SetClassSongsResponse> {
  const user = await requireRole(STAFF_ROLES);

  const parsed = SetClassSongsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid songs" },
    };
  }
  const { classSessionId, songIds } = parsed.data;

  try {
    const session = await prisma.classSession.findUnique({
      where: { id: classSessionId },
      select: { id: true, instructorId: true },
    });
    if (!session) {
      return { success: false, error: { code: "NOT_FOUND", message: "Class session not found." } };
    }
    // Same rule as recaps: instructors edit their own classes, admins any
    if (user.role === Role.INSTRUCTOR && session.instructorId !== user.id) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "You can only pick songs for classes you teach." },
      };
    }

    await prisma.classSession.update({ where: { id: classSessionId }, data: { practiceSongIds: songIds } });

    revalidatePath("/instructor/roster");
    revalidatePath(`/checkin/${classSessionId}`);
    revalidatePath("/dashboard/recaps");
    return { success: true, data: { classSessionId, songIds } };
  } catch (error) {
    reportError("setClassPracticeSongsAction", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Couldn't save the songs. Try again." } };
  }
}
