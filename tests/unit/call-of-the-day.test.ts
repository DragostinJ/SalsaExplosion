import { describe, it, expect } from "vitest";
import { callOfTheDay } from "@/lib/rueda/call-of-the-day";
import { RUEDA_CALLS } from "@/lib/rueda/rueda-calls-dictionary";

describe("la llamada del día", () => {
  it("is the same call all day in Bournemouth and changes the next day", () => {
    const morning = callOfTheDay(new Date("2026-11-05T07:00:00Z"));
    const night = callOfTheDay(new Date("2026-11-05T23:30:00Z")); // still 5 Nov in London (GMT)
    const tomorrow = callOfTheDay(new Date("2026-11-06T09:00:00Z"));
    expect(night).toBe(morning);
    expect(tomorrow).not.toBe(morning);
  });

  it("goes through every call before repeating one", () => {
    const start = new Date("2026-01-01T12:00:00Z").getTime();
    const seen = new Set(
      Array.from({ length: RUEDA_CALLS.length }, (_, i) => callOfTheDay(new Date(start + i * 86_400_000)).name)
    );
    expect(seen.size).toBe(RUEDA_CALLS.length);
  });
});
