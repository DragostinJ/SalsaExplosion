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

describe("T2, B1 & M1: Frame-Accurate Timba Song Anatomy Schema & Production Dataset", () => {
  it("validates all 13 production song maps against SongAnatomySchema and checks valid youtubeVideoId & youtubeUrl", () => {
    expect(TIMBA_SONG_ANATOMY_DATA.length).toBe(14);

    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      const parsed = SongAnatomySchema.safeParse(song);
      expect(parsed.success).toBe(true);
      expect(song.youtubeVideoId).toBeDefined();
      expect(song.youtubeVideoId.length).toBeGreaterThanOrEqual(5);
      expect(song.youtubeUrl).toBeDefined();
    }
  });

  it("proves getClaveStrokeBeats accurately maps authentic 2-3 and 3-2 Son and Rumba Claves and hybrids", () => {
    expect(getClaveStrokeBeats("2-3 Son")).toEqual([2, 3, 5, 6.5, 8]);
    expect(getClaveStrokeBeats("2-3 Son Clave")).toEqual([2, 3, 5, 6.5, 8]);
    expect(getClaveStrokeBeats("3-2 Son")).toEqual([1, 2.5, 4, 6, 7]);
    expect(getClaveStrokeBeats("2-3 Rumba")).toEqual([2, 3, 5, 6.5, 8.5]);
    expect(getClaveStrokeBeats("2-3 Rumba Clave")).toEqual([2, 3, 5, 6.5, 8.5]);
    expect(getClaveStrokeBeats("3-2 Rumba")).toEqual([1, 2.5, 4.5, 6, 7]);
    expect(getClaveStrokeBeats("2-3 Son / 6/8 Afro-Bembé Hybrid")).toEqual([2, 3, 5, 6.5, 8]);
  });

  it("proves CubanRhythmSynth can instantiate, set BPM and mute safely in node environments", () => {
    const synth = new CubanRhythmSynth({ bpm: 91, claveType: "2-3 Son Clave" });
    expect(synth.getIsRunning()).toBe(false);
    expect(synth.getIsMuted()).toBe(false);

    synth.setMuted(true);
    expect(synth.getIsMuted()).toBe(true);

    synth.setBpm(105);
    synth.start();
    synth.stop();
  });

  it("verifies 'Me Dicen Cuba' has 9 continuous, non-overlapping segments covering the calibrated 328s (5:28) duration", () => {
    const song = getSongAnatomyById("me-dicen-cuba");
    expect(song).toBeDefined();
    expect(song?.bpm).toBe(91);
    expect(song?.claveType).toBe("2-3 Son Clave");
    expect(song?.difficultyLevel).toBe("Beginner");
    expect(song?.durationSeconds).toBe(328);
    expect(song?.segments.length).toBe(9);

    let currentExpectedStart = 0;
    for (const segment of song!.segments) {
      expect(segment.startTimeSeconds).toBe(currentExpectedStart);
      expect(segment.endTimeSeconds).toBeGreaterThan(segment.startTimeSeconds);
      expect(segment.timingMode).toBeDefined();
      expect(segment.instrumentMapping).toBeDefined();
      currentExpectedStart = segment.endTimeSeconds;
    }
    expect(currentExpectedStart).toBe(328);
    expect(song!.segments[0].formattedRange).toBe("0:00 - 0:18");
    expect(song!.segments[0].danceGear).toBe("Wait / Breathe");
    expect(song!.segments[0].colorTheme).toBe("slate");
    expect(song!.segments[8].formattedRange).toBe("4:16 - 5:28");
  });

  it("verifies 'La Cosa Mala' has 8 continuous, non-overlapping segments covering the exact 347s (5:47) duration", () => {
    const song = getSongAnatomyById("la-cosa-mala");
    expect(song).toBeDefined();
    expect(song?.bpm).toBe(95);
    expect(song?.claveType).toBe("2-3 Son Clave");
    expect(song?.difficultyLevel).toBe("Intermediate");
    expect(song?.durationSeconds).toBe(347);
    expect(song?.segments.length).toBe(8);

    let currentExpectedStart = 0;
    for (const segment of song!.segments) {
      expect(segment.startTimeSeconds).toBe(currentExpectedStart);
      expect(segment.endTimeSeconds).toBeGreaterThan(segment.startTimeSeconds);
      expect(segment.timingMode).toBeDefined();
      expect(segment.instrumentMapping).toBeDefined();
      currentExpectedStart = segment.endTimeSeconds;
    }
    expect(currentExpectedStart).toBe(347);
    expect(song!.segments[0].formattedRange).toBe("0:00 - 0:15");
    expect(song!.segments[5].sectionName).toBe("El Conteo Regresivo ('4, 3, 2, 1... ¡Se le quitó!')");
    expect(song!.segments[5].formattedRange).toBe("3:52 - 4:12");
    expect(song!.segments[7].formattedRange).toBe("5:10 - 5:47");
  });

  it("verifies 'Agua Pa' Yemayá' has 10 continuous segments covering 417s (6:57) with timingMode and 3-zone instrumentMapping", () => {
    const song = getSongAnatomyById("agua-pa-yemaya");
    expect(song).toBeDefined();
    expect(song?.bpm).toBe(99);
    expect(song?.claveType).toBe("2-3 Son / 6/8 Afro-Bembé Hybrid");
    expect(song?.difficultyLevel).toBe("Advanced");
    expect(song?.durationSeconds).toBe(417);
    expect(song?.segments.length).toBe(10);

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
    expect(currentExpectedStart).toBe(417);
    expect(song!.segments[0].formattedRange).toBe("0:00 - 0:29");
    expect(song!.segments[9].formattedRange).toBe("6:36 - 6:57");
  });

  it("proves scaleSongSegmentsToDuration preserves all intermediate transition timestamps and extends final segment if longer", () => {
    const song = getSongAnatomyById("la-cosa-mala")!;
    // When duration matches, returns original segments
    const unchanged = scaleSongSegmentsToDuration(song, 347);
    expect(unchanged).toBe(song.segments);

    // When duration is 360s
    const scaled = scaleSongSegmentsToDuration(song, 360);
    expect(scaled.length).toBe(8);
    expect(scaled[0].startTimeSeconds).toBe(0);
    expect(scaled[0].endTimeSeconds).toBe(15); // Unchanged intermediate!
    expect(scaled[1].startTimeSeconds).toBe(15);
    expect(scaled[1].endTimeSeconds).toBe(102); // Unchanged intermediate!
    expect(scaled[7].startTimeSeconds).toBe(310);
    expect(scaled[7].endTimeSeconds).toBe(360); // Only the final segment extends!
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
    expect(all.length).toBe(14);

    const aguanile = getSongAnatomyById("aguanile");
    expect(aguanile).toBeDefined();
    expect(aguanile?.youtubeVideoId).toBe("b4rd9VfMhWM");
    expect(aguanile?.bpm).toBe(105);
    expect(aguanile?.segments.length).toBe(8);
    for (const seg of aguanile!.segments) {
      expect(seg.handGesture).toBeDefined();
      expect(seg.instrumentMapping).toBeDefined();
    }

    const nonExistent = getSongAnatomyById("non-existent-track");
    expect(nonExistent).toBeUndefined();
  });
});
