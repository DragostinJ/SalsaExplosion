"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { getRateLimitIdentifier, withRateLimit } from "@/lib/ratelimit";
import { reportError } from "@/lib/monitoring";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { rankPracticeHotspots, type PracticeHotspot } from "@/lib/music/practice-hotspots";

/**
 * Anonymous practice hotspots: the player reports when someone loops a section
 * or goes back to replay it. Only per-day counts per section are stored (no
 * user ids, no IPs), so teachers see where students struggle without tracking
 * anyone.
 */

const PracticeEventSchema = z.object({
  songId: z.string().trim().min(1).max(100),
  sectionId: z.string().trim().min(1).max(100),
  kind: z.enum(["loop", "replay"]),
});

export type PracticeEventInput = z.infer<typeof PracticeEventSchema>;

function isKnownSection(songId: string, sectionId: string): boolean {
  return TIMBA_SONG_ANATOMY_DATA.some(
    (song) => song.id === songId && song.segments.some((segment) => segment.id === sectionId)
  );
}

/** UTC midnight of today, matching the @db.Date column. */
function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Fire-and-forget from the player: never throws, never blocks playback. */
export async function recordPracticeEventAction(rawInput: PracticeEventInput): Promise<{ recorded: boolean }> {
  const parsed = PracticeEventSchema.safeParse(rawInput);
  if (!parsed.success || !isKnownSection(parsed.data.songId, parsed.data.sectionId)) return { recorded: false };
  const { songId, sectionId, kind } = parsed.data;

  try {
    const identifier = await getRateLimitIdentifier(null);
    const result = await withRateLimit(identifier, "PRACTICE_EVENT", async () => {
      await prisma.practiceSectionStat.upsert({
        where: { songId_sectionId_day: { songId, sectionId, day: today() } },
        create: { songId, sectionId, day: today(), loops: kind === "loop" ? 1 : 0, replays: kind === "replay" ? 1 : 0 },
        update: kind === "loop" ? { loops: { increment: 1 } } : { replays: { increment: 1 } },
      });
      return { recorded: true };
    });
    return "recorded" in result ? result : { recorded: false };
  } catch (error) {
    reportError("recordPracticeEventAction", error);
    return { recorded: false };
  }
}

/** Staff only: sections looped or replayed most in the last `days` days. */
export async function getPracticeHotspotsAction(days = 30, limit = 15): Promise<PracticeHotspot[]> {
  await requireRole(STAFF_ROLES);
  const since = new Date(today().getTime() - Math.max(1, Math.min(days, 365)) * 86_400_000);

  try {
    const rows = await prisma.practiceSectionStat.groupBy({
      by: ["songId", "sectionId"],
      where: { day: { gte: since } },
      _sum: { loops: true, replays: true },
    });

    return rankPracticeHotspots(
      rows.map((row) => ({
        songId: row.songId,
        sectionId: row.sectionId,
        loops: row._sum.loops ?? 0,
        replays: row._sum.replays ?? 0,
      })),
      limit
    );
  } catch (error) {
    reportError("getPracticeHotspotsAction", error);
    return [];
  }
}
