import { describe, it, expect } from "vitest";
import {
  SongAnatomySchema,
  TIMBA_SONG_ANATOMY_DATA,
  type SongDanceGear,
} from "@/lib/constants/timba-song-anatomy";
import {
  LAST_SECTION_LOOP_GUARD_SECONDS,
  formatPlaybackRate,
  loopWindowFor,
  navigationTime,
  nextPlaybackRate,
  parseLeadIn,
  withLeadIn,
} from "@/lib/music/practice-navigation";
import { buildGearQuizOptions, QUIZ_PAUSE_BEFORE_SECONDS, shouldAskQuiz } from "@/lib/music/gear-quiz";
import { nextSectionSeekTarget, previousSectionSeekTarget } from "@/lib/music/song-timing";
import { DANCE_GEAR_LEGEND } from "@/lib/music/dance-gear-legend";

const song = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "me-dicen-cuba")!;
const segments = song.segments; // 0-18, 18-40, 40-60, 60-105, ...

describe("lead-in", () => {
  it("lands the configured seconds before a section, never before 0", () => {
    expect(withLeadIn(40, 2)).toBe(38);
    expect(withLeadIn(1, 4)).toBe(0);
    expect(withLeadIn(40, 0)).toBe(40);
  });

  it("parses stored values and falls back to 2s", () => {
    expect(parseLeadIn(null)).toBe(2);
    expect(parseLeadIn("0")).toBe(0);
    expect(parseLeadIn("4")).toBe(4);
    expect(parseLeadIn("3")).toBe(2);
    expect(parseLeadIn("junk")).toBe(2);
  });

  it("next pressed during our own lead-in goes to the following section, not two ahead", () => {
    // Jumped to section 3 (starts 40) with a 2s lead-in → playing at 38.5
    const navTime = navigationTime(38.5, 40, 2);
    expect(navTime).toBe(40);
    expect(nextSectionSeekTarget(segments, navTime)).toBe(60);
  });

  it("previous pressed during our lead-in goes one section back from the target", () => {
    const navTime = navigationTime(38.5, 40, 2);
    expect(previousSectionSeekTarget(segments, navTime)).toBe(18);
  });

  it("ignores the pending target after it is reached or after a far-away seek", () => {
    expect(navigationTime(41, 40, 2)).toBe(41);
    expect(navigationTime(5, 40, 2)).toBe(5);
    expect(navigationTime(38.5, null, 2)).toBe(38.5);
  });
});

describe("loop", () => {
  it("repeats a section from its start minus the lead-in", () => {
    expect(loopWindowFor(segments, 2, 2)).toEqual({ sectionIndex: 2, restartAt: 38, endAt: 60 });
  });

  it("loops the last section just before the media end so the player never stops", () => {
    const last = segments.length - 1;
    expect(loopWindowFor(segments, last, 0)?.endAt).toBe(
      segments[last].endTimeSeconds - LAST_SECTION_LOOP_GUARD_SECONDS
    );
  });

  it("returns null for an index outside the song", () => {
    expect(loopWindowFor(segments, 99, 2)).toBeNull();
  });
});

describe("playback speed", () => {
  it("cycles 1 → 0.75 → 0.5 → 1 and recovers from unknown rates", () => {
    expect(nextPlaybackRate(1)).toBe(0.75);
    expect(nextPlaybackRate(0.75)).toBe(0.5);
    expect(nextPlaybackRate(0.5)).toBe(1);
    expect(nextPlaybackRate(1.25)).toBe(1);
  });

  it("labels rates compactly", () => {
    expect(formatPlaybackRate(1)).toBe("1×");
    expect(formatPlaybackRate(0.75)).toBe("¾×");
    expect(formatPlaybackRate(0.5)).toBe("½×");
  });
});

describe("ear-training quiz", () => {
  const allGears = Object.keys(DANCE_GEAR_LEGEND) as SongDanceGear[];
  const songGears = segments.map((s) => s.danceGear);

  it("always includes the correct gear exactly once, with distinct options", () => {
    for (let seed = 0; seed < 50; seed++) {
      const options = buildGearQuizOptions("Casino (Flow)", songGears, allGears, seed);
      expect(options).toHaveLength(3);
      expect(options.filter((o) => o === "Casino (Flow)")).toHaveLength(1);
      expect(new Set(options).size).toBe(3);
    }
  });

  it("prefers distractors from the same song (the realistic confusions)", () => {
    const options = buildGearQuizOptions("Casino (Flow)", songGears, allGears, 7);
    for (const option of options) {
      expect(songGears).toContain(option);
    }
  });

  it("is deterministic per seed", () => {
    expect(buildGearQuizOptions("Son Cubano", songGears, allGears, 3)).toEqual(
      buildGearQuizOptions("Son Cubano", songGears, allGears, 3)
    );
  });

  it("asks once per upcoming section, only while playing, only near the change", () => {
    const next = segments[1];
    const base = { isPlaying: true, nextSection: next, alreadyAsked: new Set<string>() };
    expect(shouldAskQuiz({ ...base, realSecondsUntilNext: QUIZ_PAUSE_BEFORE_SECONDS })).toBe(true);
    expect(shouldAskQuiz({ ...base, realSecondsUntilNext: 5 })).toBe(false);
    expect(shouldAskQuiz({ ...base, isPlaying: false, realSecondsUntilNext: 0.5 })).toBe(false);
    expect(
      shouldAskQuiz({ ...base, alreadyAsked: new Set([next.id]), realSecondsUntilNext: 0.5 })
    ).toBe(false);
    expect(shouldAskQuiz({ ...base, nextSection: undefined, realSecondsUntilNext: null })).toBe(false);
  });
});

describe("licensed audio field", () => {
  it("accepts site paths and https URLs with a licence note", () => {
    expect(
      SongAnatomySchema.safeParse({ ...song, licensedAudio: { url: "/audio/song.mp3", license: "Studio recording" } })
        .success
    ).toBe(true);
    expect(
      SongAnatomySchema.safeParse({
        ...song,
        licensedAudio: { url: "https://cdn.example.com/a.mp3", license: "Owner permission" },
      }).success
    ).toBe(true);
  });

  it("rejects javascript/http URLs and missing licence notes", () => {
    expect(
      SongAnatomySchema.safeParse({ ...song, licensedAudio: { url: "javascript:alert(1)", license: "x x x" } }).success
    ).toBe(false);
    expect(
      SongAnatomySchema.safeParse({ ...song, licensedAudio: { url: "http://insecure.example/a.mp3", license: "ok ok" } })
        .success
    ).toBe(false);
    expect(SongAnatomySchema.safeParse({ ...song, licensedAudio: { url: "/a.mp3", license: "" } }).success).toBe(false);
  });

  it("no published song ships licensed audio yet (rights must be confirmed first)", () => {
    expect(TIMBA_SONG_ANATOMY_DATA.filter((s) => s.licensedAudio)).toEqual([]);
  });
});
