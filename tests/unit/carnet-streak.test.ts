import { describe, it, expect } from "vitest";
import { weeklyStreak } from "@/lib/carnet-streak";

const d = (iso: string) => new Date(iso);

describe("Mi carnet weekly streak", () => {
  // Thursday 5 Nov 2026, 22:00 London: after this week's Thursday class
  const now = d("2026-11-05T22:00:00Z");

  it("counts consecutive weeks with a class, this week included", () => {
    expect(weeklyStreak([d("2026-11-05T19:00:00Z"), d("2026-10-29T19:00:00Z"), d("2026-10-25T18:30:00Z")], now)).toBe(3);
  });

  it("doesn't break the streak before this week's class has happened", () => {
    const monday = d("2026-11-02T10:00:00Z");
    // Sunday 1 Nov and Thursday 22 Oct are in the two weeks before this one
    expect(weeklyStreak([d("2026-11-01T18:30:00Z"), d("2026-10-22T19:00:00Z")], monday)).toBe(2);
  });

  it("stops at the first week with no class", () => {
    expect(weeklyStreak([d("2026-11-05T19:00:00Z"), d("2026-10-22T19:00:00Z")], now)).toBe(1);
  });

  it("is 0 with no classes or none recently", () => {
    expect(weeklyStreak([], now)).toBe(0);
    expect(weeklyStreak([d("2026-09-03T19:00:00Z")], now)).toBe(0);
  });

  it("counts two classes in one week once", () => {
    expect(weeklyStreak([d("2026-11-05T19:00:00Z"), d("2026-11-01T18:30:00Z")], now)).toBe(2);
  });
});
