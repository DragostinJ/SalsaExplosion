import { describe, it, expect } from "vitest";
import {
  TIMBA_SONG_ANATOMY_DATA,
  SongAnatomySchema,
  getSongAnatomyById,
  getAllSongAnatomies,
  resolveCurriculumMove,
  scaleSongSegmentsToDuration,
} from "@/lib/constants/timba-song-anatomy";
import { CUBAN_CURRICULUM_DATA } from "@/lib/constants/cuban-curriculum-2027";
import { getClaveStrokeBeats, CubanRhythmSynth } from "@/lib/audio/cuban-rhythm-synth";

describe("T2 & B1: Timba Song Anatomy Schema & Production Dataset", () => {
  it("validates all 3 production song maps against SongAnatomySchema and checks valid youtubeVideoId", () => {
    expect(TIMBA_SONG_ANATOMY_DATA.length).toBe(3);

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

  it("verifies 'Me Dicen Cuba' has 5 continuous, non-overlapping segments covering the calibrated 275s (4:35) duration", () => {
    const song = getSongAnatomyById("me-dicen-cuba");
    expect(song).toBeDefined();
    expect(song?.durationSeconds).toBe(275);
    expect(song?.segments.length).toBe(5);

    let currentExpectedStart = 0;
    for (const segment of song!.segments) {
      expect(segment.startTimeSeconds).toBe(currentExpectedStart);
      expect(segment.endTimeSeconds).toBeGreaterThan(segment.startTimeSeconds);
      currentExpectedStart = segment.endTimeSeconds;
    }
    expect(currentExpectedStart).toBe(275);
    expect(song!.segments[0].formattedRange).toBe("0:00 - 0:46");
    expect(song!.segments[4].formattedRange).toBe("3:15 - 4:35");
  });

  it("verifies 'La Cosa Mala' has 8 continuous, non-overlapping segments covering the exact 292s (4:52) spreadsheet duration", () => {
    const song = getSongAnatomyById("la-cosa-mala");
    expect(song).toBeDefined();
    expect(song?.durationSeconds).toBe(292);
    expect(song?.segments.length).toBe(8);

    let currentExpectedStart = 0;
    for (const segment of song!.segments) {
      expect(segment.startTimeSeconds).toBe(currentExpectedStart);
      expect(segment.endTimeSeconds).toBeGreaterThan(segment.startTimeSeconds);
      currentExpectedStart = segment.endTimeSeconds;
    }
    expect(currentExpectedStart).toBe(292);
    expect(song!.segments[0].formattedRange).toBe("0:00 - 0:23");
    expect(song!.segments[1].formattedRange).toBe("0:23 - 1:12");
    expect(song!.segments[6].formattedRange).toBe("3:38 - 4:18");
    expect(song!.segments[7].formattedRange).toBe("4:18 - 4:52");
  });

  it("verifies 'Agua Pa' Yemayá' has 7 continuous segments with timingMode and 3-zone instrumentMapping", () => {
    const song = getSongAnatomyById("agua-pa-yemaya");
    expect(song).toBeDefined();
    expect(song?.bpm).toBe(108);
    expect(song?.difficultyLevel).toBe("Advanced");
    expect(song?.durationSeconds).toBe(342);
    expect(song?.segments.length).toBe(7);

    let currentExpectedStart = 0;
    for (const segment of song!.segments) {
      expect(segment.startTimeSeconds).toBe(currentExpectedStart);
      expect(segment.endTimeSeconds).toBeGreaterThan(segment.startTimeSeconds);
      expect(segment.timingMode).toBeDefined();
      expect(segment.instrumentMapping).toBeDefined();
      expect(segment.instrumentMapping?.feet).toBeDefined();
      expect(segment.instrumentMapping?.hipsAndKnees).toBeDefined();
      expect(segment.instrumentMapping?.chestAndShoulders).toBeDefined();
      currentExpectedStart = segment.endTimeSeconds;
    }
    expect(currentExpectedStart).toBe(342);
    expect(song!.segments[0].formattedRange).toBe("0:00 - 0:42");
    expect(song!.segments[6].formattedRange).toBe("4:48 - 5:42");
  });

  it("proves scaleSongSegmentsToDuration preserves all intermediate transition timestamps and extends final segment if longer", () => {
    const song = getSongAnatomyById("la-cosa-mala")!;
    // When duration matches, returns original segments
    const unchanged = scaleSongSegmentsToDuration(song, 292);
    expect(unchanged).toBe(song.segments);

    // When duration is 346s
    const scaled = scaleSongSegmentsToDuration(song, 346);
    expect(scaled.length).toBe(8);
    expect(scaled[0].startTimeSeconds).toBe(0);
    expect(scaled[0].endTimeSeconds).toBe(23); // Unchanged intermediate!
    expect(scaled[1].startTimeSeconds).toBe(23);
    expect(scaled[1].endTimeSeconds).toBe(72); // Unchanged intermediate!
    expect(scaled[7].startTimeSeconds).toBe(258);
    expect(scaled[7].endTimeSeconds).toBe(346); // Only the final segment extends!
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
    expect(all.length).toBe(3);

    const nonExistent = getSongAnatomyById("non-existent-track");
    expect(nonExistent).toBeUndefined();
  });
});
