import { describe, it, expect } from "vitest";
import {
  TIMBA_SONG_ANATOMY_DATA,
  type SongAnatomy,
  type SongSegment,
} from "@/lib/constants/timba-song-anatomy";
import {
  findSegmentIndexAt,
  formatSongTime,
  getDurationMismatchSeconds,
  nextSectionSeekTarget,
  previousSectionSeekTarget,
  secondsUntilNextSection,
  validateSongTimeline,
} from "@/lib/music/song-timing";
import { DANCE_GEAR_LEGEND } from "@/lib/music/dance-gear-legend";
import { isImmersiveRoute } from "@/components/navigation/immersive-route-gate";

const meDicenCuba = TIMBA_SONG_ANATOMY_DATA.find((song) => song.id === "me-dicen-cuba")!;
const segments = meDicenCuba.segments;

describe("song timing: section lookup", () => {
  it("assigns a boundary second to the NEW section (half-open intervals)", () => {
    // Me Dicen Cuba: intro 0-18, rumba 18-40
    expect(findSegmentIndexAt(segments, 17.99)).toBe(0);
    expect(findSegmentIndexAt(segments, 18)).toBe(1);
    expect(findSegmentIndexAt(segments, 18.01)).toBe(1);
  });

  it("matches a linear scan at every tenth of a second for every song", () => {
    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      for (let t = 0; t < song.durationSeconds; t += 0.1) {
        const time = Math.round(t * 10) / 10;
        const expected = song.segments.findIndex(
          (s) => time >= s.startTimeSeconds && time < s.endTimeSeconds
        );
        expect(findSegmentIndexAt(song.segments, time), `${song.id} @ ${time}s`).toBe(expected);
      }
    }
  });

  it("clamps before the start and after the end", () => {
    expect(findSegmentIndexAt(segments, -5)).toBe(0);
    expect(findSegmentIndexAt(segments, Number.NaN)).toBe(0);
    expect(findSegmentIndexAt(segments, meDicenCuba.durationSeconds + 30)).toBe(segments.length - 1);
    expect(findSegmentIndexAt([], 10)).toBe(-1);
  });

  it("counts down to the next section and returns null in the last one", () => {
    expect(secondsUntilNextSection(segments, 10)).toBe(8);
    expect(secondsUntilNextSection(segments, 18)).toBe(22);
    expect(secondsUntilNextSection(segments, meDicenCuba.durationSeconds - 1)).toBeNull();
  });
});

describe("song timing: section navigation", () => {
  it("previous restarts the current section unless within the first 3 seconds", () => {
    // 50s is 10s into section 3 (40-60) -> restart at 40
    expect(previousSectionSeekTarget(segments, 50)).toBe(40);
    // 41.5s is 1.5s into section 3 -> go back to section 2 start (18)
    expect(previousSectionSeekTarget(segments, 41.5)).toBe(18);
    // In the first section it always restarts at 0
    expect(previousSectionSeekTarget(segments, 1)).toBe(0);
  });

  it("next jumps to the exact authored start, and stops at the last section", () => {
    expect(nextSectionSeekTarget(segments, 0)).toBe(18);
    expect(nextSectionSeekTarget(segments, 18)).toBe(40);
    expect(nextSectionSeekTarget(segments, meDicenCuba.durationSeconds - 1)).toBeNull();
  });
});

describe("song timing: data integrity guards", () => {
  it("every song timeline starts at 0, has no gaps/overlaps and ends at its duration", () => {
    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      expect(validateSongTimeline(song), song.id).toEqual([]);
    }
  });

  it("detects gaps, overlaps and a wrong final end", () => {
    const broken: SongAnatomy = {
      ...meDicenCuba,
      durationSeconds: 100,
      segments: [
        { ...segments[0], id: "a", startTimeSeconds: 2, endTimeSeconds: 10 },
        { ...segments[1], id: "b", startTimeSeconds: 12, endTimeSeconds: 30 },
        { ...segments[2], id: "c", startTimeSeconds: 28, endTimeSeconds: 90 },
      ] as SongSegment[],
    };
    const problems = validateSongTimeline(broken).join("\n");
    expect(problems).toContain("first section starts at 2s");
    expect(problems).toContain("gap between a");
    expect(problems).toContain("overlap between b");
    expect(problems).toContain("last section ends at 90s but song lasts 100s");
  });

  it("every dance gear used in the data has a legend entry", () => {
    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      for (const segment of song.segments) {
        expect(DANCE_GEAR_LEGEND[segment.danceGear], `${song.id}/${segment.id}`).toBeDefined();
      }
    }
  });

  it("flags a video whose real length differs by 2s or more", () => {
    expect(getDurationMismatchSeconds(meDicenCuba, null)).toBeNull();
    expect(getDurationMismatchSeconds(meDicenCuba, meDicenCuba.durationSeconds + 1.5)).toBeNull();
    expect(getDurationMismatchSeconds(meDicenCuba, meDicenCuba.durationSeconds + 43)).toBe(43);
    expect(getDurationMismatchSeconds(meDicenCuba, meDicenCuba.durationSeconds - 3)).toBe(-3);
  });
});

describe("song player helpers", () => {
  it("formats times with optional tenths", () => {
    expect(formatSongTime(0)).toBe("0:00");
    expect(formatSongTime(328)).toBe("5:28");
    expect(formatSongTime(65.47, true)).toBe("1:05.4");
  });

  it("hides site chrome only on single-song player routes", () => {
    expect(isImmersiveRoute("/music/me-dicen-cuba")).toBe(true);
    expect(isImmersiveRoute("/music")).toBe(false);
    expect(isImmersiveRoute("/music/a/b")).toBe(false);
    expect(isImmersiveRoute("/events/x")).toBe(false);
  });
});
