import type { SongDanceGear, SongSegment } from "@/lib/constants/timba-song-anatomy";

/**
 * Ear-training quiz: the player pauses just before a section change and asks
 * which dance gear comes next. Pure helpers so the question rules are testable.
 */

/** Pause this many real-time seconds before the change to ask the question. */
export const QUIZ_PAUSE_BEFORE_SECONDS = 1.2;
/** How long the right answer is shown before playback resumes. */
export const QUIZ_REVEAL_MS = 1400;

/** Small deterministic PRNG so the same section always shows the same option order. */
function seededRandom(seed: number): () => number {
  let state = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/**
 * The correct gear plus distractors: first other gears from this song (the
 * realistic confusions), then gears from the full legend. Order is shuffled
 * deterministically by `seed`.
 */
export function buildGearQuizOptions(
  correct: SongDanceGear,
  songGears: readonly SongDanceGear[],
  allGears: readonly SongDanceGear[],
  seed: number,
  optionCount = 3
): SongDanceGear[] {
  const distractors: SongDanceGear[] = [];
  for (const gear of [...songGears, ...allGears]) {
    if (gear !== correct && !distractors.includes(gear)) distractors.push(gear);
    if (distractors.length >= optionCount - 1) break;
  }

  const options = [correct, ...distractors];
  const random = seededRandom(seed);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

/** Should the quiz pause now? Only once per upcoming section, only while playing. */
export function shouldAskQuiz(params: {
  isPlaying: boolean;
  nextSection: SongSegment | undefined;
  realSecondsUntilNext: number | null;
  alreadyAsked: ReadonlySet<string>;
}): boolean {
  const { isPlaying, nextSection, realSecondsUntilNext, alreadyAsked } = params;
  if (!isPlaying || !nextSection || realSecondsUntilNext === null) return false;
  if (alreadyAsked.has(nextSection.id)) return false;
  return realSecondsUntilNext <= QUIZ_PAUSE_BEFORE_SECONDS;
}
