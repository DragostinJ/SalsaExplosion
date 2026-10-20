import { describe, it, expect } from "vitest";
import {
  TIMBA_SONG_ANATOMY_DATA,
  SongAnatomySchema,
  getSongAnatomyById,
  getAllSongAnatomies,
  resolveCurriculumMove,
} from "@/lib/constants/timba-song-anatomy";
import { CUBAN_CURRICULUM_DATA } from "@/lib/constants/cuban-curriculum-2027";
import { getClaveStrokeBeats, CubanRhythmSynth } from "@/lib/audio/cuban-rhythm-synth";

describe("T2: Timba Song Anatomy Schema & Production Dataset", () => {
  it("validates all production song maps against SongAnatomySchema and checks valid youtubeVideoId", () => {
    expect(TIMBA_SONG_ANATOMY_DATA.length).toBeGreaterThanOrEqual(2);

    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      const parsed = SongAnatomySchema.safeParse(song);
      expect(parsed.success).toBe(true);
      expect(song.youtubeVideoId).toBeDefined();
      expect(song.youtubeVideoId.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("proves getClaveStrokeBeats accurately maps authentic 2-3 and 3-2 Son and Rumba Claves", () => {
    expect(getClaveStrokeBeats("2-3 Son")).toEqual([2, 3, 5, 6.5, 8]);
    expect(getClaveStrokeBeats("3-2 Son")).toEqual([1, 2.5, 4, 6, 7]);
    expect(getClaveStrokeBeats("2-3 Rumba")).toEqual([2, 3, 5, 6.5, 8.5]);
    expect(getClaveStrokeBeats("3-2 Rumba")).toEqual([1, 2.5, 4.5, 6, 7]);
  });

  it("proves CubanRhythmSynth can instantiate, set BPM and mute safely in node environments", () => {
    const synth = new CubanRhythmSynth({ bpm: 96, claveType: "2-3 Son" });
    expect(synth.getIsRunning()).toBe(false);
    expect(synth.getIsMuted()).toBe(false);

    synth.setMuted(true);
    expect(synth.getIsMuted()).toBe(true);

    synth.setBpm(105);
    synth.start();
    synth.stop();
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
