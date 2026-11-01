import {
  CUBAN_CURRICULUM_DATA,
  type CurriculumSkillItem,
} from "@/lib/constants/cuban-curriculum-2027";
import {
  TIMBA_SONG_ANATOMY_DATA,
  type SongAnatomy,
  type SongSegment,
} from "@/lib/constants/timba-song-anatomy";
import { RUEDA_CALLS, normalizeRuedaCall } from "@/lib/music/rueda-calls";
import {
  MoveSchema,
  isMoveDraft,
  type Move,
  type MoveCategory,
  type MoveStep,
  type Combo,
} from "./move-schema";
import {
  STORED_REVIEWS,
  STORED_DRAFTS,
  applyReviewToMove,
  moveFingerprint,
  type MoveReview,
  type MoveReviewDecision,
} from "./move-review";

/**
 * Maps a curriculum item's pillar and name to one of the canonical MoveCategory enum values:
 * "Casino figure" | "Rueda call" | "Shine / suelta" | "Body movement" | "Rumba" | "Son" | "Reparto" | "Afro-Cuban Orishas"
 */
function deriveCategory(item: CurriculumSkillItem): MoveCategory {
  const nameLower = item.name.toLowerCase();
  const summaryLower = item.summary.toLowerCase();

  if (item.pillar === "partnerwork_casino") {
    return "Casino figure";
  }

  if (item.pillar === "solo_suelta") {
    if (nameLower.includes("rumba")) return "Rumba";
    if (
      nameLower.includes("ribcage") ||
      nameLower.includes("despelote") ||
      nameLower.includes("tembleque") ||
      nameLower.includes("body")
    ) {
      return "Body movement";
    }
    return "Shine / suelta";
  }

  if (item.pillar === "sub_styles_gears") {
    if (nameLower.includes("rueda")) return "Rueda call";
    if (nameLower.includes("son cubano") || nameLower.includes("son")) return "Son";
    if (nameLower.includes("orisha") || nameLower.includes("afro")) return "Afro-Cuban Orishas";
    if (nameLower.includes("rumba")) return "Rumba";
    return "Casino figure";
  }

  if (item.pillar === "musicality") {
    if (nameLower.includes("rumba") || summaryLower.includes("rumba")) return "Rumba";
    if (nameLower.includes("son") || summaryLower.includes("son")) return "Son";
    if (nameLower.includes("bomba") || nameLower.includes("timba")) return "Reparto";
    return "Son";
  }

  return "Casino figure";
}

/**
 * Matches a curriculum item to a canonical Rueda call if applicable.
 */
function deriveRuedaCall(item: CurriculumSkillItem): (typeof RUEDA_CALLS)[number] | undefined {
  const normalized = normalizeRuedaCall(item.name);
  if (normalized) {
    // Check if directly in RUEDA_CALLS
    const found = RUEDA_CALLS.find(
      (call) => call.toLowerCase() === normalized.toLowerCase()
    );
    if (found) return found;
  }

  // Check aliases
  if (item.aliases) {
    for (const alias of item.aliases) {
      const aliasNorm = normalizeRuedaCall(alias);
      if (aliasNorm) {
        const found = RUEDA_CALLS.find(
          (call) => call.toLowerCase() === aliasNorm.toLowerCase()
        );
        if (found) return found;
      }
    }
  }

  // Name keyword heuristics for multi-move names
  if (item.id === "beg-pw-1") return "Guapea";
  if (item.id === "beg-pw-2") return "Dile Que No";
  if (item.id === "beg-pw-3") return "Enchufla";
  if (item.id === "beg-pw-4") return "Prima";
  if (item.id === "beg-pw-5") return "Exhíbela";
  if (item.id === "imp-pw-1") return "Setenta";
  if (item.id === "imp-pw-2") return "Setenta Complicado";
  if (item.id === "imp-pw-3") return "Vacílala";
  if (item.id === "imp-pw-4") return "Sombrero";
  if (item.id === "imp-pw-5") return "Kentucky";
  if (item.id === "imp-pw-6") return "Paséala";
  if (item.id === "int-pw-1") return "Montana";
  if (item.id === "int-pw-2") return "Dedo";
  if (item.id === "int-pw-3") return "Siete";
  if (item.id === "int-pw-4") return "Coca-Cola";
  if (item.id === "adv-sub-2") return "Pa'Fuera";

  return undefined;
}

/**
 * Determines eightCounts from the curriculum text when explicitly stated.
 * When not stated, returns { counts: 1, unverified: true }.
 */
function deriveEightCounts(item: CurriculumSkillItem): { counts: number; unverified: boolean } {
  // Setenta explicitly notes "unwind on second 1-2-3" in claveSync
  if (item.id === "imp-pw-1") {
    return { counts: 2, unverified: false };
  }

  // Core basic 1-bar / 1 eight-count partnerwork & solo fundamentals explicitly detailing 1-3 & 5-7
  const explicitSingleEightCountIds = new Set([
    "beg-pw-1", // Guapea: "1-2-3 and push gently forward on 5-6-7"
    "beg-pw-2", // Dile Que No: "Prep on 1, step across on 3, open into Guapea on 5-6-7"
    "beg-pw-3", // Enchufla: "Lead steps back on 1, Follow inside turn on 2-3, trade places on 5-6-7"
    "beg-pw-4", // Prima: "Turn on 1-2-3, walk behind on 5-6-7"
    "beg-pw-5", // Exhíbela: "Prep on 1, turn on 2-3, catch frame on 5-6-7"
    "beg-solo-1", // Paso Básico: "Steps land on 1-2-3 (pause 4), 5-6-7 (pause 8)"
    "adv-mus-1", // Rumba syncopation: "Pick one instrument for 8 counts"
  ]);

  if (explicitSingleEightCountIds.has(item.id)) {
    return { counts: 1, unverified: false };
  }

  return { counts: 1, unverified: true };
}

/**
 * Maps a curriculum item to structured leader and follower steps.
 */
function deriveSteps(item: CurriculumSkillItem): {
  leaderSteps: MoveStep[];
  followerSteps: MoveStep[];
} {
  if (item.claveSync) {
    return {
      leaderSteps: [
        { counts: "1-3", text: `Leader action: ${item.claveSync}` },
        { counts: "5-7", text: `Resolution: ${item.entryExitGeometry || "Maintain circular flow"}` },
      ],
      followerSteps: [
        { counts: "1-3", text: `Follower response: ${item.claveSync}` },
        { counts: "5-7", text: `Follower finish: ${item.unConfuserTip}` },
      ],
    };
  }

  return {
    leaderSteps: [
      { counts: "1-8", text: item.summary },
    ],
    followerSteps: [
      { counts: "1-8", text: item.unConfuserTip || item.summary },
    ],
  };
}

/**
 * Generates a clean kebab-case ID from the item.
 */
function deriveMoveId(item: CurriculumSkillItem): string {
  // Use recognizable slugs for key curriculum figures
  const ID_MAP: Record<string, string> = {
    "beg-pw-1": "guapea",
    "beg-pw-2": "dile-que-no",
    "beg-pw-3": "enchufla",
    "beg-pw-4": "prima",
    "beg-pw-5": "exhibela",
    "beg-solo-1": "paso-basico",
    "beg-sub-1": "rueda-level-1-essentials",
    "beg-mus-1": "finding-beat-1-conga-tumbao",
    "imp-pw-1": "setenta",
    "imp-pw-2": "setenta-complicado",
    "imp-pw-3": "vacilala",
    "imp-pw-4": "sombrero",
    "imp-pw-5": "kentucky",
    "imp-pw-6": "paseala",
    "imp-solo-1": "rumba-guaguanco-basics",
    "imp-sub-1": "son-cubano-contratiempo",
    "imp-mus-1": "son-clave-direction",
    "int-pw-1": "montana",
    "int-pw-2": "dedo-el-uno-el-dos",
    "int-pw-3": "siete-y-siete-loco",
    "int-pw-4": "coca-cola-y-bayamo",
    "int-solo-1": "thoracic-isolation-despelote",
    "int-sub-1": "afro-cuban-orishas-intro",
    "int-mus-1": "timba-4-phase-anatomy",
    "adv-pw-1": "micro-leading-frame-modulation",
    "adv-pw-2": "mid-figure-rhythm-reversals",
    "adv-solo-1": "tembleque",
    "adv-sub-1": "rumba-columbia-orishas",
    "adv-sub-2": "rueda-cruzada-pa-fuera",
    "adv-mus-1": "rumba-clave-syncopation",
  };

  if (ID_MAP[item.id]) return ID_MAP[item.id];

  // Fallback slugify
  return item.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Seeds canonical Move objects from CUBAN_CURRICULUM_DATA.
 * Every seeded move is marked as a draft (reviewedBy undefined) until verified by an instructor.
 */
function seedMoves(): Move[] {
  return CUBAN_CURRICULUM_DATA.map((item) => {
    const { counts, unverified } = deriveEightCounts(item);
    const tags = ["curriculum", item.pillar, item.level.toLowerCase()];
    if (unverified) {
      tags.push("counts-unverified");
    }

    const { leaderSteps, followerSteps } = deriveSteps(item);
    const ruedaCall = deriveRuedaCall(item);
    const commonMistakes = item.unConfuserTip ? [item.unConfuserTip] : [];

    const rawMove = {
      id: deriveMoveId(item),
      name: item.name,
      spanishName: item.phonetic ? item.name : undefined,
      category: deriveCategory(item),
      level: item.level,
      eightCounts: counts,
      summary: item.summary,
      leaderSteps,
      followerSteps,
      commonMistakes,
      prerequisites: [],
      variations: item.aliases ?? [],
      ruedaCall,
      curriculumId: item.id,
      tags,
      videos: [],
      reviewedBy: undefined, // Draft by default per anti-tutorial protocol
    };

    return MoveSchema.parse(rawMove);
  });
}

/**
 * Canonical seeded moves library.
 */
export const SEEDED_MOVES: readonly Move[] = Object.freeze(seedMoves());

/**
 * Merges seeds, stored drafts, and stored reviews.
 * Latest review per move wins.
 */
function computeAllMoves(): Move[] {
  const baseMoves: Move[] = [...SEEDED_MOVES, ...STORED_DRAFTS];

  // Map reviews by moveId (latest review wins)
  const reviewsByMove = new Map<string, MoveReview>();
  for (const review of STORED_REVIEWS) {
    const existing = reviewsByMove.get(review.moveId);
    if (!existing || new Date(review.reviewedAt) >= new Date(existing.reviewedAt)) {
      reviewsByMove.set(review.moveId, review);
    }
  }

  return baseMoves.map((baseMove) => {
    const review = reviewsByMove.get(baseMove.id);
    if (!review) return baseMove;
    return applyReviewToMove(baseMove, review);
  });
}

const ALL_MERGED_MOVES: readonly Move[] = Object.freeze(computeAllMoves());

/**
 * Lookup a move by either its kebab-case Move ID or its curriculum ID (e.g. 'beg-pw-1').
 */
export function findMove(idOrCurriculumId: string): Move | undefined {
  return getAllMoves().find(
    (m) => m.id === idOrCurriculumId || m.curriculumId === idOrCurriculumId
  );
}

/**
 * Returns all moves: seeds + drafts, with reviews applied.
 */
export function getAllMoves(): readonly Move[] {
  return ALL_MERGED_MOVES;
}

/**
 * Returns published (approved) moves only, for dancer-facing pages.
 * Never includes drafts, needs-work, or rejected moves.
 */
export function getPublishedMoves(): readonly Move[] {
  return getAllMoves().filter((m) => !isMoveDraft(m));
}

export interface MoveReviewState {
  status: "draft" | MoveReviewDecision;
  review?: MoveReview;
  fingerprint: string;
}

/**
 * Returns the review state and base draft fingerprint for a given move.
 */
export function getMoveReviewState(moveId: string): MoveReviewState | undefined {
  const baseMoves = [...SEEDED_MOVES, ...STORED_DRAFTS];
  const baseMove = baseMoves.find((m) => m.id === moveId || m.curriculumId === moveId);
  if (!baseMove) return undefined;

  const fingerprint = moveFingerprint(baseMove);

  // Find latest review
  const reviews = STORED_REVIEWS.filter((r) => r.moveId === baseMove.id);
  if (reviews.length === 0) {
    return { status: "draft", fingerprint };
  }

  const latestReview = reviews.reduce((latest, current) =>
    new Date(current.reviewedAt) >= new Date(latest.reviewedAt) ? current : latest
  );

  return {
    status: latestReview.decision,
    review: latestReview,
    fingerprint,
  };
}

export interface MoveSongSectionLink {
  songId: string;
  sectionId: string;
  sectionName: string;
  startTimeSeconds: number;
}

/**
 * Finds all song sections that recommend this move or feature its Rueda call.
 * Matches via:
 * 1. section.recommendedMoveSlugs containing move.curriculumId or move.id
 * 2. section.handGesture matching move.ruedaCall
 */
export function songSectionsForMove(
  moveId: string,
  songs: readonly SongAnatomy[] = TIMBA_SONG_ANATOMY_DATA
): MoveSongSectionLink[] {
  const move = findMove(moveId);
  const targetIds = new Set<string>();
  targetIds.add(moveId);
  if (move) {
    targetIds.add(move.id);
    if (move.curriculumId) targetIds.add(move.curriculumId);
  }

  const normalizedRuedaCall = move?.ruedaCall ? normalizeRuedaCall(move.ruedaCall) : undefined;
  const results: MoveSongSectionLink[] = [];

  for (const song of songs) {
    for (const section of song.segments) {
      let matched = false;

      // 1. Recommended move slug match
      if (section.recommendedMoveSlugs) {
        for (const slug of section.recommendedMoveSlugs) {
          if (targetIds.has(slug)) {
            matched = true;
            break;
          }
        }
      }

      // 2. Rueda call / handGesture match
      if (!matched && normalizedRuedaCall && section.handGesture) {
        const normalizedSectionGesture = normalizeRuedaCall(section.handGesture);
        if (
          normalizedSectionGesture &&
          normalizedRuedaCall.toLowerCase() === normalizedSectionGesture.toLowerCase()
        ) {
          matched = true;
        }
      }

      if (matched) {
        results.push({
          songId: song.id,
          sectionId: section.id,
          sectionName: section.sectionName,
          startTimeSeconds: section.startTimeSeconds,
        });
      }
    }
  }

  return results;
}

/**
 * Returns all moves linked to a specific song section.
 */
export function movesForSection(
  song: SongAnatomy,
  sectionId: string,
  moveLibrary: readonly Move[] = getAllMoves()
): Move[] {
  const section = song.segments.find((seg) => seg.id === sectionId);
  if (!section) return [];

  const matchedMoves: Move[] = [];
  const addedIds = new Set<string>();

  const normalizedGesture = section.handGesture
    ? normalizeRuedaCall(section.handGesture)
    : undefined;

  for (const move of moveLibrary) {
    let matched = false;

    if (section.recommendedMoveSlugs) {
      if (
        section.recommendedMoveSlugs.includes(move.id) ||
        (move.curriculumId && section.recommendedMoveSlugs.includes(move.curriculumId))
      ) {
        matched = true;
      }
    }

    if (!matched && normalizedGesture && move.ruedaCall) {
      const normalizedMoveCall = normalizeRuedaCall(move.ruedaCall);
      if (
        normalizedMoveCall &&
        normalizedGesture.toLowerCase() === normalizedMoveCall.toLowerCase()
      ) {
        matched = true;
      }
    }

    if (matched && !addedIds.has(move.id)) {
      matchedMoves.push(move);
      addedIds.add(move.id);
    }
  }

  return matchedMoves;
}

/**
 * Returns the number of 4/4 bars in a song section:
 * Uses explicit `bars` if present and > 0, otherwise estimates:
 * Math.round(((endTimeSeconds - startTimeSeconds) * song.bpm) / 240)
 */
export function sectionBars(song: SongAnatomy, section: SongSegment): number {
  if (section.bars !== undefined && section.bars > 0) {
    return section.bars;
  }
  const durationSeconds = Math.max(0, section.endTimeSeconds - section.startTimeSeconds);
  if (song.bpm <= 0 || durationSeconds <= 0) return 0;
  return Math.round((durationSeconds * song.bpm) / 240);
}

/**
 * Checks if a combo fits a song section musically:
 * One 8-count = 2 bars of 4/4.
 * Returns true when combo.eightCounts * 2 equals the section's bars or divides it evenly
 * (e.g. combo repeats cleanly across the section).
 */
export function comboFitsSection(
  combo: Combo,
  song: SongAnatomy,
  section: SongSegment
): boolean {
  const comboBars = combo.eightCounts * 2;
  const bars = sectionBars(song, section);

  if (bars <= 0 || comboBars <= 0) return false;
  return bars % comboBars === 0;
}
