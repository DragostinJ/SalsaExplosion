import { z } from "zod";

/**
 * The curriculum's zod schemas and types. Kept apart from the data in cuban-curriculum-2027.ts so
 * browser components that only read the data don't bundle zod.
 */

export const CurriculumLevelSchema = z.enum([
  "Beginner",
  "Improver",
  "Intermediate",
  "Advanced",
]);
export type CurriculumLevel = z.infer<typeof CurriculumLevelSchema>;

export const CurriculumPillarSchema = z.enum([
  "partnerwork_casino",
  "solo_suelta",
  "sub_styles_gears",
  "musicality",
  "reference_songs",
]);
export type CurriculumPillar = z.infer<typeof CurriculumPillarSchema>;

export const CurriculumSkillItemSchema = z.object({
  id: z.string(),
  level: CurriculumLevelSchema,
  pillar: CurriculumPillarSchema,
  name: z.string(),
  aliases: z.array(z.string()).optional(),
  phonetic: z.string().optional(),
  summary: z.string(),
  entryExitGeometry: z.string().optional(),
  handholdType: z.string().optional(),
  unConfuserTip: z.string(),
  claveSync: z.string().optional(),
});
export type CurriculumSkillItem = z.infer<typeof CurriculumSkillItemSchema>;

export const DanceGearShiftSchema = z.object({
  gearNumber: z.number(),
  gearName: z.string(),
  rhythmStyle: z.string(),
  musicalTiming: z.string(),
  whenToShift: z.string(),
  bodyBiomechanics: z.string(),
  unConfuserTip: z.string(),
});
export type DanceGearShift = z.infer<typeof DanceGearShiftSchema>;

export const TimbaSongPhaseSchema = z.object({
  phase: z.enum(["Tema", "Montuno", "Mambo", "Bomba/Presión"]),
  title: z.string(),
  musicalEnergy: z.string(),
  instrumentsActive: z.string(),
  dancerFocus: z.string(),
  recommendedGear: z.string(),
});
export type TimbaSongPhase = z.infer<typeof TimbaSongPhaseSchema>;

export const CurriculumReferenceSongSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  bpm: z.number(),
  level: CurriculumLevelSchema,
  subGenre: z.string(),
  whyThisSong: z.string(),
  gearShiftsObserved: z.array(z.string()),
  instrumentsToListenFor: z.array(z.string()),
  spotifySearchUrl: z.string(),
});
export type CurriculumReferenceSong = z.infer<typeof CurriculumReferenceSongSchema>;
