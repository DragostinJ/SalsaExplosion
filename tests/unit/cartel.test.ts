import { describe, it, expect } from "vitest";
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
