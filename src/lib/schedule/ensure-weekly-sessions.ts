import { DanceStyle, EventStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canonicalEventEnd, upcomingCanonicalEvents, VENUE_INFO } from "@/lib/academy-data";
import {
  missingSessions,
  pickInstructorId,
  planWeeklySessions,
  WEEKS_AHEAD,
  type SessionBlocker,
} from "@/lib/schedule/weekly-sessions";

export interface EnsureWeeklySessionsResult {
  dryRun: boolean;
  until: string | null;
  planned: number;
  created: number;
  alreadyThere: number;
  createdTitles: string[];
  skipped: { title: string; startTime: string; reason: string }[];
  error?: string;
}

/** Any fixed number: pg_advisory_xact_lock makes two runs at once take turns, so neither creates a class twice. */
const WEEKLY_SESSIONS_LOCK_ID = 482017;

const atStudio = (venueName: string) => venueName.toLowerCase().includes(VENUE_INFO.shortName.toLowerCase());

/**
 * Makes sure every Thursday and Sunday class from the timetable exists for the next few weeks.
 * Safe to run any number of times: it only adds classes that are missing, and a class the owner
 * cancelled stays cancelled. Runs every morning from the daily cron and from the owner's button.
 */
export async function ensureWeeklySessions({
  now = new Date(),
  weeks = WEEKS_AHEAD,
  dryRun = false,
}: { now?: Date; weeks?: number; dryRun?: boolean } = {}): Promise<EnsureWeeklySessionsResult> {
  const horizon = new Date(now.getTime() + (weeks * 7 + 1) * 24 * 60 * 60 * 1000);

  const [staff, events] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: [Role.INSTRUCTOR, Role.ADMIN] } },
      select: { id: true, firstName: true, role: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED, startDate: { lt: horizon }, endDate: { gt: now } },
      select: { title: true, startDate: true, endDate: true, venueName: true },
    }),
  ]);

  // Festivals and parties at the studio take the hall, so the weekly class doesn't run that night.
  const blockers: SessionBlocker[] = [
    ...events.filter((e) => atStudio(e.venueName)).map((e) => ({ title: e.title, start: e.startDate, end: e.endDate })),
    ...upcomingCanonicalEvents(now)
      .filter((e) => atStudio(e.venueName))
      .map((e) => ({ title: e.title, start: new Date(e.startDateIso), end: canonicalEventEnd(e) })),
  ];

  const { planned, skipped } = planWeeklySessions({ now, weeks, blockers });
  const result: EnsureWeeklySessionsResult = {
    dryRun,
    until: planned.at(-1)?.startTime.toISOString() ?? null,
    planned: planned.length,
    created: 0,
    alreadyThere: 0,
    createdTitles: [],
    skipped: skipped.map((s) => ({ title: s.title, startTime: s.startTime.toISOString(), reason: s.reason })),
  };
  if (planned.length === 0) return result;
  if (staff.length === 0) return { ...result, error: "No teacher or owner accounts to run the classes." };

  const window = { gte: planned[0].startTime, lte: planned[planned.length - 1].startTime };

  if (dryRun) {
    const existing = await prisma.classSession.findMany({ where: { startTime: window }, select: { startTime: true, title: true } });
    const missing = missingSessions(planned, existing);
    return {
      ...result,
      alreadyThere: planned.length - missing.length,
      createdTitles: missing.map((m) => `${m.startTime.toISOString()} ${m.title}`),
    };
  }

  const created = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${WEEKLY_SESSIONS_LOCK_ID}::bigint)`;
    const existing = await tx.classSession.findMany({ where: { startTime: window }, select: { startTime: true, title: true } });
    const missing = missingSessions(planned, existing);
    if (missing.length === 0) return [];
    await tx.classSession.createMany({
      data: missing.map((m) => ({
        title: m.title,
        description: m.description,
        style: DanceStyle.CUBAN_SALSA,
        minLevel: m.minLevel,
        startTime: m.startTime,
        endTime: m.endTime,
        room: m.room,
        maxCapacity: m.maxCapacity,
        // staff isn't empty here, so there is always someone
        instructorId: pickInstructorId(m.instructorText, staff) ?? staff[0].id,
      })),
    });
    return missing;
  });

  return {
    ...result,
    created: created.length,
    alreadyThere: planned.length - created.length,
    createdTitles: created.map((m) => `${m.startTime.toISOString()} ${m.title}`),
  };
}

