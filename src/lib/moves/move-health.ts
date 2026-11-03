import type { Move } from "@/lib/moves/move-schema";

/**
 * Mechanical checks over the whole move library: things a script can find without knowing how to
 * dance. "error" means the data contradicts itself; "warn" means a teacher should look.
 */

export type HealthLevel = "error" | "warn";
export interface HealthIssue {
  id: string;
  level: HealthLevel;
  rule: string;
  detail: string;
}

/** The numbers in a step label: "1-3" -> [1, 3], "9-16" -> [9, 16], "5&6" -> [5, 6]. */
function labelNumbers(counts: string): number[] {
  return (counts.match(/\d+/g) ?? []).map(Number);
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function checkMoveLibrary(moves: readonly Move[]): HealthIssue[] {
  const issues: HealthIssue[] = [];
  const add = (id: string, level: HealthLevel, rule: string, detail: string) => issues.push({ id, level, rule, detail });
  const ids = new Set(moves.map((m) => m.id));

  for (const m of moves) {
    const maxCount = m.eightCounts * 8;
    for (const side of ["leaderSteps", "followerSteps"] as const) {
      const labels = m[side].map((s) => s.counts);
      for (const label of labels) {
        const over = labelNumbers(label).find((n) => n > maxCount);
        if (over) add(m.id, "error", "count-beyond-length", `${side} "${label}" goes past count ${maxCount} (${m.eightCounts} eight-counts)`);
      }
      const dupes = labels.filter((l, i) => labels.indexOf(l) !== i);
      if (dupes.length) add(m.id, "error", "repeated-label", `${side} repeats ${[...new Set(dupes)].join(", ")}`);
      if (m[side].length === 0) add(m.id, "error", "no-steps", `${side} is empty`);
    }
    if (m.leaderSteps.length && m.followerSteps.length && m.leaderSteps.length !== m.followerSteps.length) {
      add(m.id, "warn", "uneven-steps", `${m.leaderSteps.length} leader steps but ${m.followerSteps.length} follower steps`);
    }
    for (const p of m.prerequisites) {
      if (p === m.id) add(m.id, "error", "self-prerequisite", "lists itself as a prerequisite");
      else if (!ids.has(p)) add(m.id, "warn", "unknown-prerequisite", `"${p}" isn't in the library`);
    }
    for (const t of m.tags) {
      if (t !== t.toLowerCase() || /\s/.test(t)) add(m.id, "warn", "tag-format", `tag "${t}" should be lowercase-kebab`);
    }
    if (m.summary.length < 40) add(m.id, "warn", "short-summary", `summary is only ${m.summary.length} characters`);
  }

  // Prerequisite loops (A needs B, B needs A) make "learn this first" go round in circles.
  const byId = new Map(moves.map((m) => [m.id, m]));
  const reported = new Set<string>();
  for (const start of moves) {
    const stack: string[] = [];
    const visit = (id: string): boolean => {
      if (stack.includes(id)) {
        const loop = [...stack.slice(stack.indexOf(id)), id];
        const key = [...loop].sort().join(">");
        if (!reported.has(key)) {
          reported.add(key);
          add(loop[0], "error", "prerequisite-loop", loop.join(" -> "));
        }
        return true;
      }
      if (stack.length > 30) return false;
      stack.push(id);
      for (const p of byId.get(id)?.prerequisites ?? []) if (byId.has(p) && visit(p)) break;
      stack.pop();
      return false;
    };
    visit(start.id);
  }

  // Two entries whose names fold to the same words are probably the same move.
  const names = new Map<string, string>();
  for (const m of moves) {
    for (const n of new Set([m.name, m.spanishName ?? m.name].map(fold))) {
      const other = names.get(n);
      if (other && other !== m.id) add(m.id, "warn", "same-name", `same name as ${other}`);
      else names.set(n, m.id);
    }
  }

  return issues;
}
