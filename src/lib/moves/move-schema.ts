import { z } from "zod";
import {
  CurriculumLevelSchema,
  type CurriculumLevel,
} from "@/lib/constants/cuban-curriculum-2027";
import {
  SongDanceGearSchema,
  type SongDanceGear,
} from "@/lib/constants/timba-song-anatomy";
import { RUEDA_CALLS } from "@/lib/music/rueda-calls";

/**
 * Valid kebab-case identifier (e.g. 'dile-que-no', 'setenta-complicado').
 */
export const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Canonical move categories representing the breadth of Cuban dance.
 */
export const MOVE_CATEGORIES = [
  "Casino figure",
  "Rueda call",
  "Shine / suelta",
  "Body movement",
  "Rumba",
  "Son",
  "Reparto",
  "Afro-Cuban Orishas",
] as const;

export const MoveCategorySchema = z.enum(MOVE_CATEGORIES);
export type MoveCategory = z.infer<typeof MoveCategorySchema>;

/**
 * Step-by-step breakdown counts and description.
 * Counts typically use dance counts like "1-3", "5-7", "1-4", "5-8", or "1-8".
 */
export const MoveStepSchema = z.object({
  counts: z.string().min(1, "Counts string cannot be empty"),
  text: z.string().min(1, "Step description cannot be empty"),
});
export type MoveStep = z.infer<typeof MoveStepSchema>;

/**
 * Curated YouTube video candidate showing the move or a breakdown.
 * Invariant: YouTube terms require official embedded player only; embeddable must be true.
 */
export const MoveVideoSchema = z
  .object({
    youtubeVideoId: z
      .string()
      .regex(/^[A-Za-z0-9_-]{11}$/, "Must be an 11-character YouTube video ID"),
    startSeconds: z.number().nonnegative().optional(),
    endSeconds: z.number().nonnegative().optional(),
    channelTitle: z.string().min(1, "Channel title cannot be empty"),
    title: z.string().min(1, "Video title cannot be empty"),
    embeddable: z.literal(true),
    checkedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "checkedAt must be a valid ISO date string",
    }),
  })
  .refine(
    (video) => {
      if (
        video.startSeconds !== undefined &&
        video.endSeconds !== undefined
      ) {
        return video.endSeconds > video.startSeconds;
      }
      return true;
    },
    {
      message: "endSeconds must be greater than startSeconds when both are specified",
      path: ["endSeconds"],
    }
  );
export type MoveVideo = z.infer<typeof MoveVideoSchema>;

/**
 * Canonical Move schema.
 * All moves seeded or AI-drafted start with reviewedBy undefined (draft).
 * Once a teacher checks it, reviewedBy is populated with the teacher's name.
 */
export const MoveSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(KEBAB_CASE_REGEX, "id must be in kebab-case (e.g. 'dile-que-no')"),
  name: z.string().min(1, "Move name is required"),
  spanishName: z.string().min(1).optional(),
  category: MoveCategorySchema,
  level: CurriculumLevelSchema,
  eightCounts: z
    .number()
    .int("eightCounts must be an integer")
    .min(1, "eightCounts must be at least 1"),
  summary: z.string().min(1, "Summary is required"),
  leaderSteps: z.array(MoveStepSchema),
  followerSteps: z.array(MoveStepSchema),
  commonMistakes: z.array(z.string()),
  prerequisites: z.array(z.string()),
  variations: z.array(z.string()),
  ruedaCall: z.enum(RUEDA_CALLS).optional(),
  curriculumId: z.string().optional(),
  tags: z.array(z.string()),
  videos: z.array(MoveVideoSchema),
  reviewedBy: z.string().optional(),
});
export type Move = z.infer<typeof MoveSchema>;

/**
 * Ordered sequence of moves forming a musical combination.
 * The eightCounts value must equal the sum of the constituent moves' eightCounts.
 */
export const ComboSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(KEBAB_CASE_REGEX, "Combo id must be in kebab-case"),
  name: z.string().min(1, "Combo name is required"),
  moveIds: z.array(z.string()).min(1, "Combo must contain at least one move"),
  eightCounts: z
    .number()
    .int("eightCounts must be an integer")
    .min(1, "eightCounts must be at least 1"),
  level: CurriculumLevelSchema,
  gears: z
    .array(SongDanceGearSchema)
    .min(1, "Combo must specify at least one suited dance gear"),
});
export type Combo = z.infer<typeof ComboSchema>;

/**
 * Returns true if the move is unverified / draft (reviewedBy is undefined or empty).
 */
export function isMoveDraft(move: Move): boolean {
  return !move.reviewedBy || move.reviewedBy.trim() === "";
}

/**
 * Derives the total eightCounts for a sequence of move IDs given a lookup function.
 * Throws an Error if any moveId is not found in the lookup.
 */
export function deriveComboEightCounts(
  moveIds: readonly string[],
  lookupMove: (id: string) => Move | undefined
): number {
  return moveIds.reduce((sum, moveId) => {
    const move = lookupMove(moveId);
    if (!move) {
      throw new Error(`Unknown move in combo: "${moveId}"`);
    }
    return sum + move.eightCounts;
  }, 0);
}

/**
 * Validates that a combo's eightCounts matches the sum of its moves' eightCounts.
 */
export function validateCombo(
  combo: Combo,
  lookupMove: (id: string) => Move | undefined
): { valid: boolean; expected: number; actual: number; missingMoveIds: string[] } {
  const missingMoveIds: string[] = [];
  let expected = 0;

  for (const moveId of combo.moveIds) {
    const move = lookupMove(moveId);
    if (!move) {
      missingMoveIds.push(moveId);
    } else {
      expected += move.eightCounts;
    }
  }

  const valid = missingMoveIds.length === 0 && combo.eightCounts === expected;
  return {
    valid,
    expected,
    actual: combo.eightCounts,
    missingMoveIds,
  };
}

export { CurriculumLevelSchema, SongDanceGearSchema };
export type { CurriculumLevel, SongDanceGear };
