import {
  MoveSchema,
  type Move,
} from "./move-schema";
import { SEEDED_MOVES } from "./move-library";
import { RUEDA_CALLS, normalizeRuedaCall, NO_RUEDA_CALL } from "@/lib/music/rueda-calls";

export interface MoveImportResult {
  moves: Move[];
  errors: string[];
  warnings: string[];
}

/**
 * Extracts JSON content from raw text, handling markdown code fences or wrapped objects.
 */
function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = (fenced ? fenced[1] : raw).trim();
  const parsed: unknown = JSON.parse(text);

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    if ("moves" in obj && Array.isArray(obj.moves)) {
      return obj.moves;
    }
    if ("move" in obj && typeof obj.move === "object") {
      return obj.move;
    }
  }

  return parsed;
}

/**
 * Checks if step counts align with the declared eightCounts value.
 * Returns a warning message if a mismatch is detected.
 */
export function checkEightCountAlignment(move: Move): string | null {
  const allCounts = [...move.leaderSteps, ...move.followerSteps].map((s) => s.counts);

  // Look for count numbers across all step labels
  let maxCountFound = 0;
  let mentionsSecondPhase = false;

  for (const countStr of allCounts) {
    const lower = countStr.toLowerCase();
    if (
      lower.includes("second") ||
      lower.includes("2nd") ||
      lower.includes("part 2") ||
      lower.includes("next 8")
    ) {
      mentionsSecondPhase = true;
    }

    const matches = countStr.match(/\d+/g);
    if (matches) {
      for (const numStr of matches) {
        const num = parseInt(numStr, 10);
        if (num > maxCountFound) {
          maxCountFound = num;
        }
      }
    }
  }

  // Warning case 1: declared as 1 eight-count, but steps describe 9-16 or second phrase
  if (move.eightCounts === 1) {
    if (maxCountFound > 8 || mentionsSecondPhase) {
      return `${move.id}: eightCounts is declared as 1, but step labels reference counts beyond 8 (e.g. "${maxCountFound}" or second 8-count). Consider setting eightCounts to 2.`;
    }
  }

  // Warning case 2: declared as 2+ eight-counts, but steps only describe counts 1-8 without multi-phase indication
  if (move.eightCounts >= 2) {
    if (
      maxCountFound <= 8 &&
      !mentionsSecondPhase &&
      move.leaderSteps.length <= 2 &&
      move.followerSteps.length <= 2
    ) {
      return `${move.id}: eightCounts is declared as ${move.eightCounts}, but step breakdown only appears to cover a single 8-count (counts 1-8).`;
    }
  }

  return null;
}

/**
 * Cleans and prepares raw move item before Zod validation.
 */
function normalizeMoveCandidate(candidate: Record<string, unknown>): {
  normalized: Record<string, unknown>;
  originalRuedaCall?: unknown;
} {
  const copy = { ...candidate };

  // Set default empty videos array if omitted (AI Studio output omits videos)
  if (!("videos" in copy) || !Array.isArray(copy.videos)) {
    copy.videos = [];
  }

  // Clean empty curriculumId to undefined
  if (typeof copy.curriculumId === "string" && copy.curriculumId.trim() === "") {
    delete copy.curriculumId;
  }

  // Save original ruedaCall for warning detection
  const originalRuedaCall = copy.ruedaCall;

  // Normalize ruedaCall
  if (typeof copy.ruedaCall === "string") {
    const trimmed = copy.ruedaCall.trim();
    if (trimmed === "" || trimmed.toLowerCase() === NO_RUEDA_CALL) {
      delete copy.ruedaCall;
    } else {
      const canonical = RUEDA_CALLS.find(
        (c) => c.toLowerCase() === trimmed.toLowerCase()
      );
      if (canonical) {
        copy.ruedaCall = canonical;
      } else {
        // Drop invalid ruedaCall so MoveSchema succeeds, allowing a warning to be emitted
        delete copy.ruedaCall;
      }
    }
  }

  return { normalized: copy, originalRuedaCall };
}

/**
 * Parses and validates raw JSON input (single object, array, or fenced) into canonical Move objects.
 */
export function parseMoveInput(raw: string): MoveImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw.trim()) {
    return { moves: [], errors: ["Please paste Move Maker JSON output first."], warnings };
  }

  let candidates: unknown;
  try {
    candidates = extractJson(raw);
  } catch (err) {
    return {
      moves: [],
      errors: [`Not valid JSON: ${err instanceof Error ? err.message : "parse error"}`],
      warnings,
    };
  }

  const items = Array.isArray(candidates) ? candidates : [candidates];
  if (items.length === 0) {
    return { moves: [], errors: ["The input array is empty."], warnings };
  }

  const validatedMoves: Move[] = [];
  const seenIdsInBatch = new Set<string>();

  // Known move IDs for prerequisite verification (seeded + batch)
  const knownMoveIds = new Set<string>();
  for (const move of SEEDED_MOVES) {
    knownMoveIds.add(move.id);
    if (move.curriculumId) knownMoveIds.add(move.curriculumId);
  }
  for (const item of items) {
    if (item && typeof item === "object" && "id" in item && typeof (item as { id: unknown }).id === "string") {
      knownMoveIds.add((item as { id: string }).id);
    }
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const prefix = items.length > 1 ? `Item ${i + 1}: ` : "";

    if (!item || typeof item !== "object") {
      errors.push(`${prefix}Expected an object but received ${typeof item}`);
      continue;
    }

    const { normalized, originalRuedaCall } = normalizeMoveCandidate(
      item as Record<string, unknown>
    );

    // Validate with MoveSchema
    const parseResult = MoveSchema.safeParse(normalized);
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        errors.push(`${prefix}${issue.path.join(".") || "(root)"}: ${issue.message}`);
      }
      continue;
    }

    const move = parseResult.data;

    // 1. Duplicate ID checks
    if (seenIdsInBatch.has(move.id)) {
      errors.push(`${prefix}Duplicate move id in import batch: "${move.id}"`);
    } else {
      seenIdsInBatch.add(move.id);
    }

    if (SEEDED_MOVES.some((m) => m.id === move.id)) {
      warnings.push(
        `${prefix}A move with id "${move.id}" already exists in the curriculum; importing this will update it.`
      );
    }

    // 2. Rueda call validity warning
    if (
      typeof originalRuedaCall === "string" &&
      originalRuedaCall.trim() !== "" &&
      originalRuedaCall.trim().toLowerCase() !== NO_RUEDA_CALL
    ) {
      const match = normalizeRuedaCall(originalRuedaCall);
      if (!match) {
        warnings.push(
          `${prefix}"${originalRuedaCall}" is not recognized in canonical RUEDA_CALLS.`
        );
      }
    }

    // 3. Unknown prerequisites warning
    for (const prereq of move.prerequisites) {
      if (!knownMoveIds.has(prereq)) {
        warnings.push(
          `${prefix}${move.id}: Unknown prerequisite "${prereq}". Ensure this move is registered.`
        );
      }
    }

    // 4. eightCounts vs step count alignment warning
    const countWarning = checkEightCountAlignment(move);
    if (countWarning) {
      warnings.push(`${prefix}${countWarning}`);
    }

    validatedMoves.push(move);
  }

  return {
    moves: validatedMoves,
    errors,
    warnings,
  };
}
