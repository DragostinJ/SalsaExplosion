/**
 * The move families, and the teachers' "Gemini was unsure" check, without zod: browser code
 * (the /moves filters) imports these, and move-schema.ts would bring the whole zod library along.
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

export type MoveCategory = (typeof MOVE_CATEGORIES)[number];

/** True when the draft's note says Gemini wasn't sure (a teacher should check it first). */
export function hasUnsureNote(move: { notes?: string }): boolean {
  return /\bUNSURE\b/i.test(move.notes ?? "");
}
