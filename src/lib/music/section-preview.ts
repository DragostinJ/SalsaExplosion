/**
 * Swipe-to-preview for the NOW card: dancers can look at other sections
 * without seeking the video. Pure helpers so the gesture rules are testable.
 */

/** Minimum horizontal travel (px) before a touch counts as a swipe. */
export const SWIPE_MIN_DISTANCE_PX = 50;
/** Horizontal travel must beat vertical travel by this factor (so scrolling the card isn't a swipe). */
export const SWIPE_DIRECTION_RATIO = 1.5;
/** A preview with no interaction returns to the live section after this long. */
export const PREVIEW_IDLE_RETURN_MS = 12_000;

/** -1 = swiped right (previous section), 1 = swiped left (next section), 0 = not a swipe. */
export function resolveSwipeDirection(deltaX: number, deltaY: number): -1 | 0 | 1 {
  if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE_PX) return 0;
  if (Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_DIRECTION_RATIO) return 0;
  return deltaX < 0 ? 1 : -1;
}

/**
 * Next preview index after a step, clamped to the song. Returns null when the
 * step lands back on the live section (preview ends).
 */
export function stepPreviewIndex(
  previewIndex: number | null,
  liveIndex: number,
  direction: -1 | 1,
  sectionCount: number
): number | null {
  const from = previewIndex ?? liveIndex;
  const target = Math.max(0, Math.min(sectionCount - 1, from + direction));
  return target === liveIndex ? null : target;
}
