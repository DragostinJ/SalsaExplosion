import { describe, it, expect } from "vitest";
import {
  TIMBA_SONG_ANATOMY_DATA,
  SongAnatomySchema,
  getSongAnatomyById,
  getAllSongAnatomies,
  resolveCurriculumMove,
  scaleSongSegmentsToDuration,
  formatSecondsToTime,
} from "@/lib/constants/timba-song-anatomy";
import { CUBAN_CURRICULUM_DATA } from "@/lib/constants/cuban-curriculum-2027";
import { getClaveStrokeBeats, CubanRhythmSynth } from "@/lib/audio/cuban-rhythm-synth";

describe("T2, B1 & M1: Frame-Accurate Timba Song Anatomy Schema & Production Dataset", () => {
  it("validates every production song map against SongAnatomySchema and checks valid youtubeVideoId & youtubeUrl", () => {
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

  // Song maps are re-timed by the AI Studio song maker and ear-calibrated, so these
  // check invariants for every song rather than pinning one song's times or bpm.
  it("every song is a continuous, non-overlapping section map covering exactly its video length", () => {
    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      expect(song.segments.length, song.id).toBeGreaterThanOrEqual(3);
      expect(song.bpm, song.id).toBeGreaterThanOrEqual(60);
      expect(song.bpm, song.id).toBeLessThanOrEqual(140);

      let currentExpectedStart = 0;
      for (const segment of song.segments) {
        expect(segment.startTimeSeconds, segment.id).toBe(currentExpectedStart);
        expect(segment.endTimeSeconds, segment.id).toBeGreaterThan(segment.startTimeSeconds);
        expect(segment.formattedRange, segment.id).toBe(
          `${formatSecondsToTime(segment.startTimeSeconds)} - ${formatSecondsToTime(segment.endTimeSeconds)}`
        );
        // timingMode and instrumentMapping are optional; when present the 3 zones are filled
        if (segment.instrumentMapping) {
          expect(segment.instrumentMapping.feet, segment.id).toBeTruthy();
          expect(segment.instrumentMapping.hipsAndKnees, segment.id).toBeTruthy();
          expect(segment.instrumentMapping.chestAndShoulders, segment.id).toBeTruthy();
        }
        currentExpectedStart = segment.endTimeSeconds;
      }
      expect(currentExpectedStart, song.id).toBe(song.durationSeconds);
    }
  });

  it("keeps the anchor songs on their videos and lengths", () => {
    expect(getSongAnatomyById("me-dicen-cuba")).toMatchObject({ youtubeVideoId: "jBNgDYJjZP8", durationSeconds: 328 });
    expect(getSongAnatomyById("la-cosa-mala")).toMatchObject({ youtubeVideoId: "et8gHrBf_6s", durationSeconds: 347 });
    expect(getSongAnatomyById("agua-pa-yemaya")).toMatchObject({ youtubeVideoId: "ZuaNY9AKoLc", durationSeconds: 417 });
  });

  it("proves scaleSongSegmentsToDuration preserves all intermediate transition timestamps and extends final segment if longer", () => {
    const song = getSongAnatomyById("la-cosa-mala")!;
    // When duration matches, returns original segments
    expect(scaleSongSegmentsToDuration(song, song.durationSeconds)).toBe(song.segments);

    const longer = song.durationSeconds + 13;
    const scaled = scaleSongSegmentsToDuration(song, longer);
    const last = song.segments.length - 1;
    expect(scaled.length).toBe(song.segments.length);
    scaled.slice(0, last).forEach((segment, index) => {
      // Unchanged intermediates!
      expect(segment.startTimeSeconds).toBe(song.segments[index].startTimeSeconds);
      expect(segment.endTimeSeconds).toBe(song.segments[index].endTimeSeconds);
    });
    expect(scaled[last].startTimeSeconds).toBe(song.segments[last].startTimeSeconds);
    expect(scaled[last].endTimeSeconds).toBe(longer); // Only the final segment extends!
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
    expect(aguanile).toBe(TIMBA_SONG_ANATOMY_DATA.find((song) => song.id === "aguanile"));
    expect(aguanile?.youtubeVideoId).toBe("b4rd9VfMhWM");
    for (const seg of aguanile!.segments) {
      expect(seg.instrumentMapping).toBeDefined();
    }

    const nonExistent = getSongAnatomyById("non-existent-track");
    expect(nonExistent).toBeUndefined();
  });
});
