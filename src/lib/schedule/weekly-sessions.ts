import { DanceLevel, Role } from "@prisma/client";
import { WEEKLY_SCHEDULE_LIST, type CanonicalDaySchedule } from "@/lib/academy-data";

/**
 * Turns the weekly timetable (WEEKLY_SCHEDULE in academy-data.ts) into dated class sessions,
 * so Thursday and Sunday classes exist in the database without anyone creating them by hand.
 * Everything here is pure; ensure-weekly-sessions.ts does the database work.
 */

export const STUDIO_TIME_ZONE = "Europe/London";
/** How far ahead classes are created, so dancers can say they're coming weeks before. */
export const WEEKS_AHEAD = 4;
/** Planning figure only: nobody is turned away (AGENTS.md section 2). */
export const WEEKLY_CLASS_CAPACITY = 24;
/** Used when a class is the last thing in the evening and nothing follows it. */
const FALLBACK_DURATION_MINUTES = 60;

export interface PlannedSession {
  /** Same class on the same night: the start time plus the title. */
  key: string;
  timetableId: string;
  title: string;
  description: string;
  minLevel: DanceLevel;
  startTime: Date;
  endTime: Date;
  room: string;
  maxCapacity: number;
  instructorText: string;
}

export interface SessionBlocker {
  title: string;
  start: Date;
  end: Date;
}

export interface SkippedSession {
  title: string;
  startTime: Date;
  reason: string;
}

export function sessionKey(startTime: Date, title: string): string {
  return `${startTime.toISOString()}|${title}`;
}

/** Minutes the time zone is ahead of UTC at that instant (0 in winter, 60 in British Summer Time). */
function zoneOffsetMinutes(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** A wall-clock time at the studio (e.g. 19:00 on 5 Nov) as a UTC instant, right on both sides of a clock change. */
export function studioTimeToUtc(year: number, month: number, day: number, hhmm: string): Date {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const guess = Date.UTC(year, month - 1, day, hours, minutes);
  const first = zoneOffsetMinutes(new Date(guess), STUDIO_TIME_ZONE);
  let instant = guess - first * 60000;
  const second = zoneOffsetMinutes(new Date(instant), STUDIO_TIME_ZONE);
  if (second !== first) instant = guess - second * 60000;
  return new Date(instant);
}

/** The studio's calendar date at that instant. */
function studioDate(at: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: STUDIO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Midnight to midnight of the studio's calendar day containing `at`, as UTC instants (end exclusive). */
export function studioDayBounds(at: Date): { start: Date; end: Date } {
  const { year, month, day } = studioDate(at);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return {
    start: studioTimeToUtc(year, month, day, "00:00"),
    end: studioTimeToUtc(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), "00:00"),
  };
}

/** "19:00" or "21:30 – Late" -> "19:00" */
function startOf(time: string): string {
  return time.trim().slice(0, 5);
}

/** The timetable's level labels ("ALL LEVELS & IMPROVERS", "BEGINNERS" …) as the lowest level the class suits. */
export function minLevelFor(level: string): DanceLevel {
  const l = level.toUpperCase();
  if (l.includes("ALL") || l.includes("BEGINNER")) return DanceLevel.BEGINNER;
  if (l.includes("IMPROVER")) return DanceLevel.IMPROVER;
  if (l.includes("INTERMEDIATE")) return DanceLevel.INTERMEDIATE;
  if (l.includes("ADVANCED")) return DanceLevel.ADVANCED;
  return DanceLevel.BEGINNER;
}

/**
 * The teacher account for a timetable line such as "Arturas, Moe Flex & Jim": the staff member
 * whose first name comes first in the text, else the owner. Null when there is no staff at all.
 */
export function pickInstructorId(
  instructorText: string,
  staff: { id: string; firstName: string; role: Role }[]
): string | null {
  const text = instructorText.toLowerCase();
  let best: { id: string; at: number } | null = null;
  for (const person of staff) {
    const name = person.firstName.trim().toLowerCase();
    if (!name) continue;
    const match = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).exec(text);
    if (match && (!best || match.index < best.at)) best = { id: person.id, at: match.index };
  }
  if (best) return best.id;
  return staff.find((p) => p.role === Role.ADMIN)?.id ?? staff[0]?.id ?? null;
}

/**
 * Every class (not the socials) in the timetable from `now` until `weeks` weeks ahead,
 * except classes that already started and classes that overlap a blocker (a festival or
 * party at the studio). A class ends when the next thing that evening starts.
 */
export function planWeeklySessions({
  now,
  weeks = WEEKS_AHEAD,
  schedule = WEEKLY_SCHEDULE_LIST,
  blockers = [],
}: {
  now: Date;
  weeks?: number;
  schedule?: CanonicalDaySchedule[];
  blockers?: SessionBlocker[];
}): { planned: PlannedSession[]; skipped: SkippedSession[] } {
  const planned: PlannedSession[] = [];
  const skipped: SkippedSession[] = [];
  const today = studioDate(now);

  for (let offset = 0; offset < weeks * 7; offset++) {
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
    const weekday = date.getUTCDay();
    const ymd = { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };

    for (const day of schedule.filter((d) => d.dayOfWeekNumber === weekday)) {
      const starts = day.sessions.map((s) => startOf(s.time)).sort();
      for (const session of day.sessions) {
        if (session.isSocial) continue;
        const start = startOf(session.time);
        const startTime = studioTimeToUtc(ymd.year, ymd.month, ymd.day, start);
        const next = starts.find((t) => t > start);
        const endTime = next
          ? studioTimeToUtc(ymd.year, ymd.month, ymd.day, next)
          : new Date(startTime.getTime() + FALLBACK_DURATION_MINUTES * 60000);

        if (startTime.getTime() <= now.getTime()) continue;
        const clash = blockers.find((b) => b.start < endTime && b.end > startTime);
        if (clash) {
          skipped.push({ title: session.title, startTime, reason: `overlaps ${clash.title}` });
          continue;
        }

        planned.push({
          key: sessionKey(startTime, session.title),
          timetableId: session.id,
          title: session.title,
          description: `Every ${day.dayName} with ${session.instructor}. ${session.level.charAt(0)}${session.level.slice(1).toLowerCase()}. Pay at the door.`,
          minLevel: minLevelFor(session.level),
          startTime,
          endTime,
          room: session.room,
          maxCapacity: WEEKLY_CLASS_CAPACITY,
          instructorText: session.instructor,
        });
      }
    }
  }

  planned.sort((a, b) => a.startTime.getTime() - b.startTime.getTime() || a.title.localeCompare(b.title));
  return { planned, skipped };
}

/** The planned classes that aren't in the database yet (cancelled ones count as there, so they stay cancelled). */
export function missingSessions(
  planned: PlannedSession[],
  existing: { startTime: Date; title: string }[]
): PlannedSession[] {
  const have = new Set(existing.map((s) => sessionKey(s.startTime, s.title)));
  return planned.filter((p) => !have.has(p.key));
}
