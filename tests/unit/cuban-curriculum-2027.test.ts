import { describe, it, expect } from "vitest";
import {
  CUBAN_CURRICULUM_DATA,
  CUBAN_DANCE_GEARS,
  TIMBA_SONG_PHASES,
  CURRICULUM_REFERENCE_SONGS,
  CurriculumSkillItemSchema,
  DanceGearShiftSchema,
  TimbaSongPhaseSchema,
  CurriculumReferenceSongSchema,
  CurriculumLevel,
  CurriculumPillar,
} from "@/lib/constants/cuban-curriculum-2027";

const ALL_LEVELS: CurriculumLevel[] = [
  "Beginner",
  "Improver",
  "Intermediate",
  "Advanced",
];

const ALL_PILLARS: CurriculumPillar[] = [
  "partnerwork_casino",
  "solo_suelta",
  "sub_styles_gears",
  "musicality",
  "reference_songs",
];

describe("2027 Modern Cuban Salsa Curriculum Taxonomy & Schemas", () => {
  it("contains skills for all 4 progressive levels", () => {
    const presentLevels = new Set(CUBAN_CURRICULUM_DATA.map((s) => s.level));
    for (const lvl of ALL_LEVELS) {
      expect(presentLevels.has(lvl)).toBe(true);
    }
  });

  it("covers core instructional pillars across the curriculum", () => {
    const presentPillars = new Set(CUBAN_CURRICULUM_DATA.map((s) => s.pillar));
    for (const pillar of ALL_PILLARS) {
      if (pillar !== "reference_songs") {
        expect(presentPillars.has(pillar)).toBe(true);
      }
    }
  });

  it("strictly validates every curriculum skill item with CurriculumSkillItemSchema", () => {
    expect(CUBAN_CURRICULUM_DATA.length).toBeGreaterThan(20);
    for (const skill of CUBAN_CURRICULUM_DATA) {
      const parsed = CurriculumSkillItemSchema.safeParse(skill);
      expect(parsed.success).toBe(true);
    }
  });

  it("ensures every skill has a robust, non-empty unConfuserTip for student clarity", () => {
    for (const skill of CUBAN_CURRICULUM_DATA) {
      expect(skill.unConfuserTip).toBeDefined();
      expect(typeof skill.unConfuserTip).toBe("string");
      expect(skill.unConfuserTip.trim().length).toBeGreaterThan(15);
    }
  });

  it("has completely unique skill IDs across the curriculum", () => {
    const ids = CUBAN_CURRICULUM_DATA.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("strictly validates the 5 Cuban Dance Gears with DanceGearShiftSchema", () => {
    expect(CUBAN_DANCE_GEARS.length).toBe(5);
    const gearNumbers = CUBAN_DANCE_GEARS.map((g) => g.gearNumber);
    expect(gearNumbers).toEqual([1, 2, 3, 4, 5]);

    for (const gear of CUBAN_DANCE_GEARS) {
      const parsed = DanceGearShiftSchema.safeParse(gear);
      expect(parsed.success).toBe(true);
      expect(gear.unConfuserTip.trim().length).toBeGreaterThan(15);
    }
  });

  it("strictly validates the Timba 4-phase song anatomy with TimbaSongPhaseSchema", () => {
    expect(TIMBA_SONG_PHASES.length).toBe(4);
    const phaseNames = TIMBA_SONG_PHASES.map((p) => p.phase);
    expect(phaseNames).toEqual(["Tema", "Montuno", "Mambo", "Bomba/Presión"]);

    for (const phase of TIMBA_SONG_PHASES) {
      const parsed = TimbaSongPhaseSchema.safeParse(phase);
      expect(parsed.success).toBe(true);
      expect(phase.musicalEnergy.length).toBeGreaterThan(5);
      expect(phase.dancerFocus.length).toBeGreaterThan(10);
    }
  });

  it("strictly validates all 14 curriculum reference songs with CurriculumReferenceSongSchema and reasonable BPMs", () => {
    expect(CURRICULUM_REFERENCE_SONGS.length).toBe(14);

    const songIds = CURRICULUM_REFERENCE_SONGS.map((s) => s.id);
    const uniqueSongIds = new Set(songIds);
    expect(uniqueSongIds.size).toBe(songIds.length);

    for (const song of CURRICULUM_REFERENCE_SONGS) {
      const parsed = CurriculumReferenceSongSchema.safeParse(song);
      expect(parsed.success).toBe(true);
      expect(song.bpm).toBeGreaterThan(70);
      expect(song.bpm).toBeLessThan(130);
      expect(song.whyThisSong.trim().length).toBeGreaterThan(15);
      expect(song.gearShiftsObserved.length).toBeGreaterThan(0);
      expect(song.instrumentsToListenFor.length).toBeGreaterThan(0);
      expect(song.spotifySearchUrl.startsWith("https://open.spotify.com/search/")).toBe(true);
    }

    // Ensure every level has reference songs
    for (const lvl of ALL_LEVELS) {
      const count = CURRICULUM_REFERENCE_SONGS.filter((s) => s.level === lvl).length;
      expect(count).toBeGreaterThan(0);
    }
  });
});
