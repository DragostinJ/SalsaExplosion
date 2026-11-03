import { describe, expect, it } from "vitest";
import { isSoloClassTitle } from "@/lib/constants/booking";
import { WEEKLY_SCHEDULE_LIST } from "@/lib/academy-data";

describe("isSoloClassTitle", () => {
  it("marks footwork classes as solo", () => {
    expect(isSoloClassTitle("Solo Salsa: Musicality, Pasitos & Rhythm")).toBe(true);
    expect(isSoloClassTitle("Timba Pasitos")).toBe(true);
    expect(isSoloClassTitle("Salsa suelta for everyone")).toBe(true);
  });

  it("keeps partner classes as partner classes, whatever their Lead/Follow caps", () => {
    expect(isSoloClassTitle("Cuban Salsa Improvers Partnerwork")).toBe(false);
    expect(isSoloClassTitle("Cuban Salsa Intermediates & Rueda de Casino")).toBe(false);
    expect(isSoloClassTitle("Consolidation")).toBe(false);
  });

  it("finds exactly one solo class in the weekly timetable", () => {
    const titles = WEEKLY_SCHEDULE_LIST.flatMap((day) => day.sessions.map((c) => c.title));
    expect(titles.filter(isSoloClassTitle)).toEqual(["Solo Salsa: Musicality, Pasitos & Rhythm"]);
  });
});
