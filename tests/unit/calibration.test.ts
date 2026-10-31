import { describe, it, expect } from "vitest";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import {
  applyBoundaryOverrides,
  clampBoundary,
  describeBoundaryChanges,
  MIN_SECTION_SECONDS,
  nearestBoundaryIndex,
} from "@/lib/music/calibration";
import { validateSongTimeline } from "@/lib/music/song-timing";

const song = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "me-dicen-cuba")!;
const segments = song.segments; // intro 0-18, rumba 18-40, 40-60 ...

describe("calibration: boundary nudges", () => {
  it("moving a section start also moves the previous section's end", () => {
    const adjusted = applyBoundaryOverrides(segments, { [segments[1].id]: 20.5 }, song.durationSeconds);
    expect(adjusted[0].endTimeSeconds).toBe(20.5);
    expect(adjusted[1].startTimeSeconds).toBe(20.5);
    expect(adjusted[1].formattedRange).toBe("0:20 - 0:40");
    expect(validateSongTimeline({ ...song, segments: adjusted })).toEqual([]);
  });

  it("leaves untouched sections as the same objects and ignores overrides on the first section", () => {
    const adjusted = applyBoundaryOverrides(segments, { [segments[0].id]: 5 }, song.durationSeconds);
    expect(adjusted[0].startTimeSeconds).toBe(0);
    adjusted.forEach((segment, index) => expect(segment).toBe(segments[index]));
  });

  it("keeps a boundary between its neighbours and rounds to tenths", () => {
    expect(clampBoundary(segments, 1, 18.04)).toBe(18);
    expect(clampBoundary(segments, 1, -10)).toBe(MIN_SECTION_SECONDS);
    expect(clampBoundary(segments, 1, 999)).toBe(segments[1].endTimeSeconds - MIN_SECTION_SECONDS);
    expect(clampBoundary(segments, 0, 7)).toBe(0);
  });

  it("reports only the boundaries that moved, with their shift", () => {
    const adjusted = applyBoundaryOverrides(
      segments,
      { [segments[2].id]: 42.3, [segments[3].id]: segments[3].startTimeSeconds },
      song.durationSeconds
    );
    expect(describeBoundaryChanges(segments, adjusted)).toEqual([
      { section: segments[2].id, sectionName: segments[2].sectionName, from: 40, to: 42.3, shift: 2.3 },
    ]);
  });

  it("finds the section start nearest to a heard change", () => {
    expect(nearestBoundaryIndex(segments, 17.2)).toBe(1);
    expect(nearestBoundaryIndex(segments, 39)).toBe(2);
    expect(nearestBoundaryIndex(segments, 0)).toBe(1);
  });
});
