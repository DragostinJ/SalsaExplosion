import { describe, it, expect, vi } from "vitest";
import { CartelDaySchema, CartelFormatSchema, cartelSchedule, nextClassNight, spanishDate } from "@/lib/cartel";

describe("class-night posters (cartel)", () => {
  it("finds the next class night in Bournemouth time, today included", () => {
    // Sunday 1 Nov 2026, 10:00 UTC (10:00 in London, GMT)
    const sunday = new Date("2026-11-01T10:00:00Z");
    expect(spanishDate(nextClassNight(0, sunday))).toBe("domingo, 1 de noviembre");
    expect(spanishDate(nextClassNight(4, sunday))).toBe("jueves, 5 de noviembre");
    // Late on Wednesday 4 Nov in London is still Wednesday: Thursday is tomorrow
    expect(spanishDate(nextClassNight(4, new Date("2026-11-04T23:30:00Z")))).toBe("jueves, 5 de noviembre");
  });

  it("only knows the two class nights, and story is the default format", () => {
    expect(CartelDaySchema.safeParse("jueves").success).toBe(true);
    expect(CartelDaySchema.safeParse("martes").success).toBe(false);
    expect(CartelFormatSchema.parse(undefined)).toBe("story");
    expect(CartelFormatSchema.parse("post")).toBe("post");
    expect(CartelFormatSchema.parse("banner")).toBe("story");
  });

  it("draws each night from the canonical timetable", () => {
    expect(cartelSchedule("jueves").dayName).toBe("Thursday");
    expect(cartelSchedule("domingo").dayName).toBe("Sunday");
  });
});

describe("class-night poster songs", () => {
  it("lists the teachers' practice songs for that night: deduped, known songs only, at most three", async () => {
    vi.resetModules();
    const findMany = vi.fn().mockResolvedValue([
      { practiceSongIds: ["temba-tumba-timba", "not-a-song"] },
      { practiceSongIds: ["temba-tumba-timba", "me-dicen-cuba", "esto-esta", "pasaporte"] },
    ]);
    vi.doMock("@/lib/prisma", () => ({ prisma: { classSession: { findMany } } }));
    const { classNightSongs } = await import("@/lib/cartel");

    const songs = await classNightSongs(new Date("2026-11-05T10:00:00Z"));
    expect(songs).toEqual(["Temba, Tumba, Timba", "Me Dicen Cuba", "Esto Está (Live at Le New Morning, Paris)"]);
    // Thursday 5 Nov in London, evening window in UTC
    const where = findMany.mock.calls[0][0].where;
    expect(where.startTime.gte.toISOString()).toBe("2026-11-05T12:00:00.000Z");
    expect(where.isCancelled).toBe(false);
  });

  it("renders without songs when the database is unreachable", async () => {
    vi.resetModules();
    vi.doMock("@/lib/prisma", () => ({ prisma: { classSession: { findMany: vi.fn().mockRejectedValue(new Error("down")) } } }));
    const { classNightSongs } = await import("@/lib/cartel");
    await expect(classNightSongs(new Date("2026-11-05T10:00:00Z"))).resolves.toEqual([]);
  });
});

describe("the next class night for the home page", () => {
  it("is today on a Thursday or Sunday, otherwise the nearest of the two", async () => {
    const { nextClassNightAny } = await import("@/lib/cartel");
    const day = (d: Date) => new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Europe/London" }).format(d);
    expect(day(nextClassNightAny(new Date("2026-11-05T09:00:00Z")))).toBe("Thu"); // Thursday itself
    expect(day(nextClassNightAny(new Date("2026-11-06T09:00:00Z")))).toBe("Sun"); // Friday → Sunday
    expect(day(nextClassNightAny(new Date("2026-11-09T09:00:00Z")))).toBe("Thu"); // Monday → Thursday
  });

  it("links the songs by id as well as title", async () => {
    vi.resetModules();
    const findMany = vi.fn().mockResolvedValue([{ practiceSongIds: ["me-dicen-cuba"] }]);
    vi.doMock("@/lib/prisma", () => ({ prisma: { classSession: { findMany } } }));
    const { classNightSongList } = await import("@/lib/cartel");
    await expect(classNightSongList(new Date("2026-11-05T10:00:00Z"))).resolves.toEqual([
      { id: "me-dicen-cuba", title: "Me Dicen Cuba" },
    ]);
  });
});
