import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { WEEKLY_SCHEDULE, type CanonicalDaySchedule } from "@/lib/academy-data";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { displaySongTitle } from "@/lib/music/song-style";
import { prisma } from "@/lib/prisma";

/**
 * "Cartel de la noche": the poster for a class night, made from the canonical timetable.
 * The image route (/cartel/[dia]) draws it for Instagram; the /cartel page shows and links it.
 */

export const CartelDaySchema = z.enum(["jueves", "domingo"]);
export type CartelDay = z.infer<typeof CartelDaySchema>;

export const CartelFormatSchema = z.enum(["story", "post"]).catch("story");
export type CartelFormat = z.infer<typeof CartelFormatSchema>;

export const CARTEL_SIZES: Record<CartelFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1350 },
};

const DAY_OF: Record<CartelDay, keyof typeof WEEKLY_SCHEDULE> = { jueves: "thursday", domingo: "sunday" };

export function cartelSchedule(day: CartelDay): CanonicalDaySchedule {
  return WEEKLY_SCHEDULE[DAY_OF[day]];
}

const LONDON = "Europe/London";
const weekdayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** The next date (today included) that falls on this weekday in Bournemouth. */
export function nextClassNight(dayOfWeekNumber: number, now: Date = new Date()): Date {
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: LONDON }).format(now);
  const ahead = (dayOfWeekNumber - weekdayIndex[today] + 7) % 7;
  return new Date(now.getTime() + ahead * 24 * 60 * 60 * 1000);
}

/** "jueves 5 de noviembre" */
export function spanishDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: LONDON }).format(date);
}

/** The next class night, Thursday or Sunday, today included (Bournemouth time). */
export function nextClassNightAny(now: Date = new Date()): Date {
  const thursday = nextClassNight(4, now);
  const sunday = nextClassNight(0, now);
  return thursday.getTime() <= sunday.getTime() ? thursday : sunday;
}

/**
 * Practice-player songs the teachers attached to that night's classes, in the order they were
 * picked (at most `limit`), as ids and display titles. Empty if the database is down.
 */
export async function classNightSongList(night: Date, limit = 3): Promise<{ id: string; title: string }[]> {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: LONDON }).format(night); // YYYY-MM-DD
  try {
    // Classes run in the evening, so 12:00-23:59 UTC covers the London night in GMT and BST
    const sessions = await prisma.classSession.findMany({
      where: { isCancelled: false, startTime: { gte: new Date(`${day}T12:00:00Z`), lte: new Date(`${day}T23:59:59Z`) } },
      select: { practiceSongIds: true },
      orderBy: { startTime: "asc" },
    });
    const ids = [...new Set(sessions.flatMap((session) => session.practiceSongIds))];
    return ids
      .map((id) => TIMBA_SONG_ANATOMY_DATA.find((song) => song.id === id))
      .filter((song): song is (typeof TIMBA_SONG_ANATOMY_DATA)[number] => Boolean(song))
      .slice(0, limit)
      .map((song) => ({ id: song.id, title: displaySongTitle(song.title) }));
  } catch {
    return [];
  }
}

/** The same songs as titles only, for the posters. The poster still renders without them. */
export async function classNightSongs(night: Date, limit = 3): Promise<string[]> {
  return (await classNightSongList(night, limit)).map((song) => song.title);
}

/** Fonts and art for ImageResponse, read once per server instance (bundled via outputFileTracingIncludes). */
let assets: Promise<{ anton: Buffer; archivoBlack: Buffer; couple: string; rueda: string }> | null = null;

export function cartelAssets() {
  assets ??= (async () => {
    const root = process.cwd();
    const [anton, archivoBlack, couple, rueda] = await Promise.all([
      readFile(join(root, "assets/fonts/Anton-Regular.ttf")),
      readFile(join(root, "assets/fonts/ArchivoBlack-Regular.ttf")),
      readFile(join(root, "public/images/editorial/icaic-couple.png")),
      readFile(join(root, "public/images/editorial/icaic-rueda.png")),
    ]);
    const png = (data: Buffer) => `data:image/png;base64,${data.toString("base64")}`;
    return { anton, archivoBlack, couple: png(couple), rueda: png(rueda) };
  })();
  return assets;
}
