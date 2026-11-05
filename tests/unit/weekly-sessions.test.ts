import { beforeEach, describe, expect, it, vi } from "vitest";
import { DanceLevel, Role } from "@prisma/client";
import {
  minLevelFor,
  missingSessions,
  pickInstructorId,
  planWeeklySessions,
  studioDayBounds,
  studioTimeToUtc,
} from "@/lib/schedule/weekly-sessions";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: vi.fn() },
    event: { findMany: vi.fn() },
    classSession: { findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { ensureWeeklySessions } from "@/lib/schedule/ensure-weekly-sessions";

const STAFF = [
  { id: "enrique", firstName: "Enrique", role: Role.ADMIN },
  { id: "arturas", firstName: "Arturas", role: Role.INSTRUCTOR },
  { id: "jim", firstName: "Jim", role: Role.INSTRUCTOR },
  { id: "justyna", firstName: "Justyna", role: Role.INSTRUCTOR },
  { id: "moe", firstName: "Moe", role: Role.INSTRUCTOR },
];

describe("studioTimeToUtc", () => {
  it("is UTC in winter and one hour behind in British Summer Time", () => {
    expect(studioTimeToUtc(2026, 11, 5, "19:00").toISOString()).toBe("2026-11-05T19:00:00.000Z");
    expect(studioTimeToUtc(2027, 7, 1, "19:00").toISOString()).toBe("2027-07-01T18:00:00.000Z");
  });

  it("gets the evening right on the day the clocks change", () => {
    // Clocks go forward at 01:00 UTC on Sunday 28 March 2027 and back on Sunday 31 October 2027.
    expect(studioTimeToUtc(2027, 3, 28, "18:30").toISOString()).toBe("2027-03-28T17:30:00.000Z");
    expect(studioTimeToUtc(2027, 10, 31, "18:30").toISOString()).toBe("2027-10-31T18:30:00.000Z");
  });

  it("verifies Sunday 28 March 2027 clock change sessions and BST summer events display at correct UK times across timezones", () => {
    // 1. Clock change Sunday: 28 March 2027 (clocks go forward at 01:00 UTC to BST)
    const sundaySessionUtc = studioTimeToUtc(2027, 3, 28, "18:30");
    expect(sundaySessionUtc.toISOString()).toBe("2027-03-28T17:30:00.000Z");

    const formatInUkTime = (date: Date) =>
      date.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });

    expect(formatInUkTime(sundaySessionUtc)).toBe("18:30");

    // 2. BST event: Saturday 3 April 2027 (starts at 19:30 BST / 18:30 UTC)
    const aprilEventUtc = studioTimeToUtc(2027, 4, 3, "19:30");
    expect(aprilEventUtc.toISOString()).toBe("2027-04-03T18:30:00.000Z");
    expect(formatInUkTime(aprilEventUtc)).toBe("19:30");

    // 3. BST event: Saturday 1 May 2027 (starts at 19:30 BST / 18:30 UTC)
    const mayEventUtc = studioTimeToUtc(2027, 5, 1, "19:30");
    expect(mayEventUtc.toISOString()).toBe("2027-05-01T18:30:00.000Z");
    expect(formatInUkTime(mayEventUtc)).toBe("19:30");
  });
});

describe("planWeeklySessions", () => {
  const tuesdayNoon = new Date("2026-11-03T12:00:00Z");

  it("plans every Thursday and Sunday class for 4 weeks, without the socials", () => {
    const { planned, skipped } = planWeeklySessions({ now: tuesdayNoon });
    // 4 Thursdays x 4 classes + 4 Sundays x 1 masterclass
    expect(planned).toHaveLength(20);
    expect(skipped).toHaveLength(0);
    expect(planned.some((p) => /Social/.test(p.title))).toBe(false);
    expect(planned[0].startTime.toISOString()).toBe("2026-11-05T19:00:00.000Z");
    expect(planned.at(-1)?.startTime.toISOString()).toBe("2026-11-29T18:30:00.000Z");
  });

  it("ends each class when the next thing that evening starts", () => {
    const { planned } = planWeeklySessions({ now: tuesdayNoon, weeks: 1 });
    const minutes = (p: (typeof planned)[number]) => (p.endTime.getTime() - p.startTime.getTime()) / 60000;
    const byTitle = Object.fromEntries(planned.map((p) => [p.title, minutes(p)]));
    expect(byTitle["Cuban Salsa Beginners Foundation"]).toBe(75); // 19:00 until 20:15
    expect(byTitle["Cuban Salsa Improvers Partnerwork"]).toBe(75); // 20:15 until the 21:30 social
    expect(byTitle["Sunday Cuban Salsa & Rueda Masterclass"]).toBe(60); // 18:30 until the 19:30 social
  });

  it("leaves out tonight's classes once they've started", () => {
    const thursdayHalfSeven = new Date("2026-11-05T19:30:00Z");
    const { planned } = planWeeklySessions({ now: thursdayHalfSeven, weeks: 1 });
    const tonight = planned.filter((p) => p.startTime.toISOString().startsWith("2026-11-05"));
    expect(tonight.map((p) => p.title).sort()).toEqual([
      "Cuban Salsa Improvers Partnerwork",
      "Cuban Salsa Intermediates & Rueda de Casino",
    ]);
  });

  it("skips a class when a festival at the studio overlaps it", () => {
    const { planned, skipped } = planWeeklySessions({
      now: new Date("2026-11-20T12:00:00Z"),
      blockers: [
        {
          title: "MADE IN CUBA — Dance Weekend 2026",
          start: new Date("2026-12-04T18:00:00Z"),
          end: new Date("2026-12-06T23:00:00Z"),
        },
      ],
    });
    expect(planned.some((p) => p.startTime.toISOString() === "2026-12-06T18:30:00.000Z")).toBe(false);
    expect(planned.some((p) => p.startTime.toISOString() === "2026-12-03T19:00:00.000Z")).toBe(true);
    expect(skipped).toEqual([
      expect.objectContaining({ title: "Sunday Cuban Salsa & Rueda Masterclass", reason: "overlaps MADE IN CUBA — Dance Weekend 2026" }),
    ]);
  });
});

describe("timetable details", () => {
  it("reads the lowest level each class suits", () => {
    expect(minLevelFor("ALL LEVELS")).toBe(DanceLevel.BEGINNER);
    expect(minLevelFor("ALL LEVELS & IMPROVERS")).toBe(DanceLevel.BEGINNER);
    expect(minLevelFor("IMPROVERS")).toBe(DanceLevel.IMPROVER);
    expect(minLevelFor("INTERMEDIATE")).toBe(DanceLevel.INTERMEDIATE);
  });

  it("gives each class the teacher named first in the timetable, else the owner", () => {
    expect(pickInstructorId("Arturas, Moe Flex & Jim", STAFF)).toBe("arturas");
    expect(pickInstructorId("Maestro Enrique Perez Valdes & Team", STAFF)).toBe("enrique");
    expect(pickInstructorId("Moe Flex", STAFF)).toBe("moe");
    expect(pickInstructorId("Guest teacher from Havana", STAFF)).toBe("enrique");
    expect(pickInstructorId("Anyone", [])).toBeNull();
  });

  it("treats a class already in the database, even a cancelled one, as there", () => {
    const { planned } = planWeeklySessions({ now: new Date("2026-11-03T12:00:00Z"), weeks: 1 });
    const missing = missingSessions(planned, [{ startTime: planned[0].startTime, title: planned[0].title }]);
    expect(missing).toHaveLength(planned.length - 1);
  });
});

describe("ensureWeeklySessions", () => {
  const tx = {
    $executeRaw: vi.fn(),
    classSession: { findMany: vi.fn(), createMany: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findMany).mockResolvedValue(STAFF as never);
    vi.mocked(prisma.event.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.$transaction).mockImplementation(((fn: (t: typeof tx) => unknown) => fn(tx)) as never);
  });

  it("creates the missing classes with the right teachers, inside a locked transaction", async () => {
    tx.classSession.findMany.mockResolvedValue([]);
    const result = await ensureWeeklySessions({ now: new Date("2026-11-03T12:00:00Z") });

    expect(result).toMatchObject({ created: 20, alreadyThere: 0, planned: 20 });
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    const data = tx.classSession.createMany.mock.calls[0][0].data as { title: string; instructorId: string }[];
    expect(data).toHaveLength(20);
    const teacherOf = (title: string) => data.find((d) => d.title === title)?.instructorId;
    expect(teacherOf("Solo Salsa: Musicality, Pasitos & Rhythm")).toBe("moe");
    expect(teacherOf("Cuban Salsa Improvers Partnerwork")).toBe("justyna");
    expect(teacherOf("Cuban Salsa Intermediates & Rueda de Casino")).toBe("arturas");
    expect(teacherOf("Sunday Cuban Salsa & Rueda Masterclass")).toBe("enrique");
  });

  it("creates nothing the second time", async () => {
    tx.classSession.findMany.mockImplementation(async () => {
      const { planned } = planWeeklySessions({ now: new Date("2026-11-03T12:00:00Z") });
      return planned.map((p) => ({ startTime: p.startTime, title: p.title }));
    });
    const result = await ensureWeeklySessions({ now: new Date("2026-11-03T12:00:00Z") });
    expect(result).toMatchObject({ created: 0, alreadyThere: 20 });
    expect(tx.classSession.createMany).not.toHaveBeenCalled();
  });

  it("skips nights when a published festival at the studio uses the hall", async () => {
    vi.mocked(prisma.event.findMany).mockResolvedValue([
      {
        title: "Studio party",
        startDate: new Date("2026-11-08T18:00:00Z"),
        endDate: new Date("2026-11-08T23:00:00Z"),
        venueName: "BOH Studios Bournemouth",
      },
    ] as never);
    tx.classSession.findMany.mockResolvedValue([]);
    const result = await ensureWeeklySessions({ now: new Date("2026-11-03T12:00:00Z") });
    expect(result.created).toBe(19);
    expect(result.skipped).toEqual([expect.objectContaining({ startTime: "2026-11-08T18:30:00.000Z" })]);
  });

  it("only reports in a dry run", async () => {
    vi.mocked(prisma.classSession.findMany).mockResolvedValue([] as never);
    const result = await ensureWeeklySessions({ now: new Date("2026-11-03T12:00:00Z"), dryRun: true });
    expect(result).toMatchObject({ dryRun: true, created: 0, alreadyThere: 0 });
    expect(result.createdTitles).toHaveLength(20);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("refuses without any teacher or owner account", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as never);
    const result = await ensureWeeklySessions({ now: new Date("2026-11-03T12:00:00Z") });
    expect(result.error).toMatch(/No teacher/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("studioDayBounds", () => {
  it("runs midnight to midnight London time, including the clock-change days", () => {
    const winter = studioDayBounds(new Date("2026-11-05T21:00:00Z"));
    expect(winter.start.toISOString()).toBe("2026-11-05T00:00:00.000Z");
    expect(winter.end.toISOString()).toBe("2026-11-06T00:00:00.000Z");
    // Clocks go forward at 01:00 UTC on 28 March 2027: that day is 23 hours long
    const spring = studioDayBounds(new Date("2027-03-28T12:00:00Z"));
    expect(spring.start.toISOString()).toBe("2027-03-28T00:00:00.000Z");
    expect(spring.end.toISOString()).toBe("2027-03-28T23:00:00.000Z");
    // 23:30 London in summer is still the same London day, though it's the next UTC hour
    const lateSummer = studioDayBounds(new Date("2027-07-01T22:30:00Z"));
    expect(lateSummer.start.toISOString()).toBe("2027-06-30T23:00:00.000Z");
  });
});
