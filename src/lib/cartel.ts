import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { WEEKLY_SCHEDULE, type CanonicalDaySchedule } from "@/lib/academy-data";

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
