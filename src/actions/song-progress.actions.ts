"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { reportError } from "@/lib/monitoring";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";

/**
 * "Got it" progress for practice-player sections. Every query is scoped to the
 * signed-in user's id (no client-supplied user ids), and song/section ids must
 * exist in the curated song data, so the table can't fill with junk.
 */

const SongIdSchema = z.string().trim().min(1).max(100);

const SetMasteredSchema = z.object({
  songId: SongIdSchema,
  sectionId: z.string().trim().min(1).max(100),
  mastered: z.boolean(),
});

export interface SongProgressSnapshot {
  signedIn: boolean;
  masteredSectionIds: string[];
}

export type SongProgressActionResponse =
  | { success: true; data: SongProgressSnapshot }
  | {
      success: false;
      error: {
        code: "VALIDATION_ERROR" | "UNAUTHORIZED" | "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR";
        message: string;
      };
    };

function isKnownSection(songId: string, sectionId: string): boolean {
  return TIMBA_SONG_ANATOMY_DATA.some(
    (song) => song.id === songId && song.segments.some((segment) => segment.id === sectionId)
  );
}

async function readMastered(userId: string, songId: string): Promise<string[]> {
  const rows = await prisma.songSectionProgress.findMany({
    where: { userId, songId },
    select: { sectionId: true },
  });
  return rows.map((row) => row.sectionId);
}

/** Read-only: signed-out (or degraded) visitors simply get no saved progress. */
export async function getMySongProgressAction(rawSongId: unknown): Promise<SongProgressSnapshot> {
  const parsed = SongIdSchema.safeParse(rawSongId);
  if (!parsed.success) return { signedIn: false, masteredSectionIds: [] };

  // fallback-guard-exempt: read-only; fallback users get an empty snapshot below
  const user = await getOrProvisionCurrentUser();
  if (!user) return { signedIn: false, masteredSectionIds: [] };
  if (isFallbackUser(user)) return { signedIn: true, masteredSectionIds: [] };

  try {
    return { signedIn: true, masteredSectionIds: await readMastered(user.id, parsed.data) };
  } catch (err) {
    reportError("getMySongProgressAction", err);
    return { signedIn: true, masteredSectionIds: [] };
  }
}

export async function setSongSectionMasteredAction(rawInput: unknown): Promise<SongProgressActionResponse> {
  const parsed = SetMasteredSchema.safeParse(rawInput);
  if (!parsed.success || !isKnownSection(parsed.data.songId, parsed.data.sectionId)) {
    return { success: false, error: { code: "VALIDATION_ERROR", message: "Unknown song section." } };
  }

  // fallback-guard
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Sign in to save your progress." } };
  }
  if (isFallbackUser(user)) {
    return { success: false, error: { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE } };
  }

  const { songId, sectionId, mastered } = parsed.data;
  try {
    if (mastered) {
      await prisma.songSectionProgress.upsert({
        where: { userId_songId_sectionId: { userId: user.id, songId, sectionId } },
        create: { userId: user.id, songId, sectionId },
        update: {},
      });
    } else {
      await prisma.songSectionProgress.deleteMany({ where: { userId: user.id, songId, sectionId } });
    }
    return { success: true, data: { signedIn: true, masteredSectionIds: await readMastered(user.id, songId) } };
  } catch (err) {
    reportError("setSongSectionMasteredAction", err);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Could not save your progress." } };
  }
}
