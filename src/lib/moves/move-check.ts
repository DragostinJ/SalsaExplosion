import { z } from "zod";
import { MoveSchema, type Move } from "@/lib/moves/move-schema";

/**
 * Applies the answers of the Gemini "move check" (docs/move-library/gemini-move-check.md) to the
 * drafts: exact text replacements, each one checked before it's used, and flags turned into
 * "UNSURE:" notes for the teachers. Pure, so the script and the tests share it.
 */

export const CHECK_FIELDS = ["summary", "leaderSteps", "followerSteps", "commonMistakes", "variations", "notes"] as const;
export const CHECK_KINDS = ["hold", "counts", "contradiction", "direction", "safety", "wording"] as const;

const FixSchema = z.object({
  id: z.string().min(1),
  field: z.enum(CHECK_FIELDS),
  from: z.string().min(1),
  to: z.string(),
  kind: z.enum(CHECK_KINDS),
  why: z.string().default(""),
});
const FlagSchema = z.object({ id: z.string().min(1), issue: z.string().min(1) });
export const MoveCheckAnswerSchema = z.object({
  batch: z.string().min(1),
  fixes: z.array(FixSchema).default([]),
  flags: z.array(FlagSchema).default([]),
});

export type MoveCheckFix = z.infer<typeof FixSchema>;
export type MoveCheckAnswer = z.infer<typeof MoveCheckAnswerSchema>;

export type FixOutcome = "applied" | "skipped" | "no-match" | "ambiguous" | "unknown-move" | "reviewed-move" | "invalid-result";

export interface FixReport {
  key: string;
  batch: string;
  fix: MoveCheckFix;
  outcome: FixOutcome;
  detail?: string;
}

export interface MoveCheckResult {
  drafts: Move[];
  fixes: FixReport[];
  flagsAdded: { id: string; issue: string }[];
  changedIds: string[];
}

/** A stable name for a fix, used in skip lists: "check-03#7" is the 8th fix of batch check-03. */
export const fixKey = (batch: string, index: number) => `${batch}#${index}`;

/** The Gemini app wraps JSON in a code block, sometimes with text around it. */
export function parseMoveCheckAnswer(raw: string): MoveCheckAnswer {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : raw).trim();
  return MoveCheckAnswerSchema.parse(JSON.parse(body));
}

const count = (text: string, part: string) => text.split(part).length - 1;

function replaceIn(move: Move, fix: MoveCheckFix): { move: Move } | { outcome: "no-match" | "ambiguous"; detail: string } {
  const value = move[fix.field];
  if (typeof value === "string" || value === undefined) {
    const text = value ?? "";
    const n = count(text, fix.from);
    if (n === 0) return { outcome: "no-match", detail: `"${fix.from}" isn't in ${fix.field}` };
    if (n > 1) return { outcome: "ambiguous", detail: `"${fix.from}" is in ${fix.field} ${n} times` };
    return { move: { ...move, [fix.field]: text.replace(fix.from, () => fix.to) } };
  }

  if (fix.field === "leaderSteps" || fix.field === "followerSteps") {
    const steps = move[fix.field];
    const hits = steps.map((s, i) => [i, count(s.text, fix.from)] as const).filter(([, n]) => n > 0);
    if (hits.length === 0) return { outcome: "no-match", detail: `"${fix.from}" isn't in ${fix.field}` };
    if (hits.length > 1 || hits[0][1] > 1) return { outcome: "ambiguous", detail: `"${fix.from}" is in ${fix.field} more than once` };
    const at = hits[0][0];
    return {
      move: { ...move, [fix.field]: steps.map((s, i) => (i === at ? { ...s, text: s.text.replace(fix.from, () => fix.to) } : s)) },
    };
  }

  const items = move[fix.field as "commonMistakes" | "variations"];
  const hits = items.map((s, i) => [i, count(s, fix.from)] as const).filter(([, n]) => n > 0);
  if (hits.length === 0) return { outcome: "no-match", detail: `"${fix.from}" isn't in ${fix.field}` };
  if (hits.length > 1 || hits[0][1] > 1) return { outcome: "ambiguous", detail: `"${fix.from}" is in ${fix.field} more than once` };
  const at = hits[0][0];
  return { move: { ...move, [fix.field]: items.map((s, i) => (i === at ? s.replace(fix.from, () => fix.to) : s)) } };
}

/** Adds an "UNSURE (check):" sentence to the notes, once. */
export function addUnsureNote(notes: string | undefined, issue: string): string {
  const sentence = `UNSURE (check): ${issue.trim().replace(/\s+/g, " ").replace(/([^.!?])$/, "$1.")}`;
  const current = (notes ?? "").trim();
  if (current.includes(sentence)) return current;
  return current ? `${current} ${sentence}` : sentence;
}

/**
 * Applies every fix whose "from" text is found exactly once, except the ones in `skip` (keys from
 * fixKey) and any move a teacher already reviewed (its approval is tied to the old text). Skipped
 * fixes and all flags become UNSURE notes, so nothing Gemini raised is lost.
 */
export function applyMoveCheck({
  drafts,
  answers,
  skip = new Set<string>(),
  reviewedIds = new Set<string>(),
}: {
  drafts: readonly Move[];
  answers: readonly MoveCheckAnswer[];
  skip?: ReadonlySet<string>;
  reviewedIds?: ReadonlySet<string>;
}): MoveCheckResult {
  const byId = new Map(drafts.map((m) => [m.id, m]));
  const changed = new Set<string>();
  const fixes: FixReport[] = [];
  const flagsAdded: { id: string; issue: string }[] = [];

  const note = (id: string, issue: string) => {
    const move = byId.get(id);
    if (!move || reviewedIds.has(id)) return;
    const notes = addUnsureNote(move.notes, issue);
    if (notes !== (move.notes ?? "").trim()) {
      byId.set(id, { ...move, notes });
      changed.add(id);
      flagsAdded.push({ id, issue });
    }
  };

  for (const answer of answers) {
    answer.fixes.forEach((fix, index) => {
      const key = fixKey(answer.batch, index);
      const report = (outcome: FixOutcome, detail?: string) => fixes.push({ key, batch: answer.batch, fix, outcome, detail });
      const move = byId.get(fix.id);
      if (!move) return report("unknown-move", `no draft with id ${fix.id}`);
      if (reviewedIds.has(fix.id)) return report("reviewed-move", "a teacher already reviewed this move");
      if (skip.has(key)) {
        note(fix.id, `${fix.why || "Gemini suggested a change"} (it suggested "${fix.to}" for "${fix.from}")`);
        return report("skipped");
      }
      const result = replaceIn(move, fix);
      if (!("move" in result)) return report(result.outcome, result.detail);
      const valid = MoveSchema.safeParse(result.move);
      if (!valid.success) return report("invalid-result", valid.error.issues[0]?.message);
      byId.set(fix.id, result.move);
      changed.add(fix.id);
      report("applied");
    });
    for (const flag of answer.flags) note(flag.id, flag.issue);
  }

  return {
    drafts: drafts.map((m) => byId.get(m.id) ?? m),
    fixes,
    flagsAdded,
    changedIds: [...changed],
  };
}
