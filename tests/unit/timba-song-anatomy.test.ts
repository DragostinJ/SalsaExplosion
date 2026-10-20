import { describe, it, expect } from "vitest";
import {
  TIMBA_SONG_ANATOMY_DATA,
  SongAnatomySchema,
  getSongAnatomyById,
  getAllSongAnatomies,
  resolveCurriculumMove,
} from "@/lib/constants/timba-song-anatomy";
import { CUBAN_CURRICULUM_DATA } from "@/lib/constants/cuban-curriculum-2027";

describe("T2: Timba Song Anatomy Schema & Production Dataset", () => {
  it("validates all production song maps against SongAnatomySchema", () => {
    expect(TIMBA_SONG_ANATOMY_DATA.length).toBeGreaterThanOrEqual(2);

    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      const parsed = SongAnatomySchema.safeParse(song);
      expect(parsed.success).toBe(true);
    }
  });

  it("verifies 'Me Dicen Cuba' has 5 continuous, non-overlapping segments covering the entire song", () => {
    const song = getSongAnatomyById("me-dicen-cuba");
    expect(song).toBeDefined();
    expect(song?.segments.length).toBe(5);

    let currentExpectedStart = 0;
    for (const segment of song!.segments) {
      expect(segment.startTimeSeconds).toBe(currentExpectedStart);
      expect(segment.endTimeSeconds).toBeGreaterThan(segment.startTimeSeconds);
      currentExpectedStart = segment.endTimeSeconds;
    }
    expect(currentExpectedStart).toBe(song!.durationSeconds);
  });

  it("verifies 'La Cosa Mala' has 8 continuous, non-overlapping segments covering the entire song", () => {
    const song = getSongAnatomyById("la-cosa-mala");
    expect(song).toBeDefined();
    expect(song?.segments.length).toBe(8);

    let currentExpectedStart = 0;
    for (const segment of song!.segments) {
      expect(segment.startTimeSeconds).toBe(currentExpectedStart);
      expect(segment.endTimeSeconds).toBeGreaterThan(segment.startTimeSeconds);
      currentExpectedStart = segment.endTimeSeconds;
    }
    expect(currentExpectedStart).toBe(song!.durationSeconds);
  });

  it("ensures every recommendedMoveSlug in every segment resolves to a valid curriculum move", () => {
    const validSkillIds = new Set(CUBAN_CURRICULUM_DATA.map((s) => s.id));

    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      for (const segment of song.segments) {
        expect(segment.recommendedMoveSlugs.length).toBeGreaterThan(0);
        for (const slug of segment.recommendedMoveSlugs) {
          const resolved = resolveCurriculumMove(slug);
          expect(resolved).toBeDefined();
          expect(validSkillIds.has(slug)).toBe(true);
        }
      }
    }
  });

  it("checks helper functions getSongAnatomyById and getAllSongAnatomies", () => {
    const all = getAllSongAnatomies();
    expect(all.length).toBe(2);

    const nonExistent = getSongAnatomyById("non-existent-track");
    expect(nonExistent).toBeUndefined();
  });
});
