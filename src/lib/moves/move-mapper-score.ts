import { z } from "zod";
import { MOVE_MAPPER_GOLD_SET, type GoldClip } from "./move-mapper-gold-set";

/**
 * Scores Move Mapper answers against the gold set (clips whose figure we know).
 * It only reads the fields it needs, so a breakdown the strict importer would refuse can still
 * be scored (that is the point while the prompt is being tuned).
 */
const ScoredRowSchema = z.object({
  moveIds: z.array(z.string()).default([]),
  match: z.string().default(""),
  confidence: z.string().default("low"),
  mechanics: z.string().default(""),
  type: z.string().default(""),
  newMove: z.object({ name: z.string().optional() }).optional(),
});

const ScoredBreakdownSchema = z.object({
  youtubeVideoId: z.string(),
  rows: z.array(ScoredRowSchema),
});
export type ScoredBreakdown = z.infer<typeof ScoredBreakdownSchema>;

export type GoldVerdict =
  /** a high/medium row named an expected move and did not just repeat a heard name */
  | "seen"
  /** the hit row says "Name heard:": right, but maybe by ear */
  | "heard"
  /** only a low-confidence row named it */
  | "low-only"
  | "miss"
  /** not-in-library clip: some figure row said "not-in-library" */
  | "honest"
  /** not-in-library clip: every figure row was forced onto catalogue names */
  | "forced";

export interface GoldScore {
  clip: GoldClip;
  verdict: GoldVerdict;
  /** Confident names outside the expected set (often a fair entry or exit, so information only). */
  otherConfidentIds: string[];
}

const CONFIDENT = new Set(["high", "medium"]);

/** Accepts the JSON as AI Studio copies it, with or without a ```json fence. */
export function parseScoredBreakdown(raw: string): ScoredBreakdown | null {
  const unfenced = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const parsed = ScoredBreakdownSchema.safeParse(JSON.parse(unfenced));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function scoreAgainstGold(breakdown: ScoredBreakdown, clip: GoldClip): GoldScore {
  const confident = breakdown.rows.filter((r) => CONFIDENT.has(r.confidence));
  const otherConfidentIds = [
    ...new Set(confident.flatMap((r) => r.moveIds).filter((id) => !clip.expected.includes(id))),
  ];

  if (clip.expected.length === 0) {
    const honest = breakdown.rows.some(
      (r) => r.match === "not-in-library" && r.type !== "show-trick" && r.type !== "other"
    );
    return { clip, verdict: honest ? "honest" : "forced", otherConfidentIds };
  }

  const names = (r: z.infer<typeof ScoredRowSchema>) => r.moveIds.some((id) => clip.expected.includes(id));
  const hits = confident.filter(names);
  let verdict: GoldVerdict;
  if (hits.some((r) => !/^\s*name heard:/i.test(r.mechanics))) verdict = "seen";
  else if (hits.length > 0) verdict = "heard";
  else if (breakdown.rows.some(names)) verdict = "low-only";
  else verdict = "miss";
  return { clip, verdict, otherConfidentIds };
}

export interface GoldReport {
  scores: GoldScore[];
  /** Breakdowns whose video is not in the gold set. */
  ignored: string[];
  /** Gold clips with no breakdown yet. */
  missing: GoldClip[];
}

export function scoreGoldSet(breakdowns: readonly ScoredBreakdown[]): GoldReport {
  const scores: GoldScore[] = [];
  const ignored: string[] = [];
  const answered = new Set<string>();
  for (const b of breakdowns) {
    const clip = MOVE_MAPPER_GOLD_SET.find((c) => c.youtubeVideoId === b.youtubeVideoId);
    if (!clip) {
      ignored.push(b.youtubeVideoId);
      continue;
    }
    answered.add(clip.youtubeVideoId);
    scores.push(scoreAgainstGold(b, clip));
  }
  const missing = MOVE_MAPPER_GOLD_SET.filter((c) => !answered.has(c.youtubeVideoId));
  return { scores, ignored, missing };
}
