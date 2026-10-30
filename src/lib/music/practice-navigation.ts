import type { SongSegment } from "@/lib/constants/timba-song-anatomy";

/**
 * Practice helpers layered on top of exact section timing:
 * - lead-in: jumps land a few seconds BEFORE a section so you hear the change coming
 * - loop: repeat one section (with the same lead-in) until switched off
 * - speed: YouTube / audio playback rates the player offers
 *
 * Section boundaries themselves are never shifted; only where a jump lands is.
 */

export const LEAD_IN_CHOICES = [0, 2, 4] as const;
export type LeadInSeconds = (typeof LEAD_IN_CHOICES)[number];
export const DEFAULT_LEAD_IN_SECONDS: LeadInSeconds = 2;

export const PLAYBACK_RATE_CHOICES = [1, 0.75, 0.5] as const;
export type PlaybackRate = (typeof PLAYBACK_RATE_CHOICES)[number];

/** The last section loops slightly before the media end so the player never hits ENDED. */
export const LAST_SECTION_LOOP_GUARD_SECONDS = 0.3;

export function parseLeadIn(raw: string | null): LeadInSeconds {
  if (raw === null) return DEFAULT_LEAD_IN_SECONDS;
  const value = Number(raw);
  return (LEAD_IN_CHOICES as readonly number[]).includes(value)
    ? (value as LeadInSeconds)
    : DEFAULT_LEAD_IN_SECONDS;
}

/** The rate after `current` in the 1 → 0.75 → 0.5 → 1 cycle. */
export function nextPlaybackRate(current: number): PlaybackRate {
  const index = PLAYBACK_RATE_CHOICES.findIndex((rate) => rate === current);
  return PLAYBACK_RATE_CHOICES[(index + 1) % PLAYBACK_RATE_CHOICES.length];
}

export function formatPlaybackRate(rate: number): string {
  if (rate === 0.75) return "¾×";
  if (rate === 0.5) return "½×";
  return `${rate}×`;
}

/** Where to actually seek so the dancer hears `leadIn` seconds of music before `sectionStart`. */
export function withLeadIn(sectionStart: number, leadIn: number): number {
  return Math.max(0, sectionStart - leadIn);
}

/**
 * Time to use for prev/next decisions. While we are inside a lead-in we created
 * (just before `pendingSectionStart`), act as if we were already at that section;
 * otherwise "next" pressed during a lead-in would skip a whole section.
 * A seek far away from the pending target (e.g. scrubbing) ignores it.
 */
export function navigationTime(
  time: number,
  pendingSectionStart: number | null,
  leadIn: number
): number {
  if (pendingSectionStart === null) return time;
  const windowStart = pendingSectionStart - leadIn - 1;
  return time >= windowStart && time < pendingSectionStart ? pendingSectionStart : time;
}

export interface LoopWindow {
  sectionIndex: number;
  /** Where each repeat starts (section start minus lead-in) */
  restartAt: number;
  /** Cue time that triggers the repeat */
  endAt: number;
}

export function loopWindowFor(
  segments: readonly SongSegment[],
  sectionIndex: number,
  leadIn: number
): LoopWindow | null {
  const segment = segments[sectionIndex];
  if (!segment) return null;
  const isLast = sectionIndex === segments.length - 1;
  return {
    sectionIndex,
    restartAt: withLeadIn(segment.startTimeSeconds, leadIn),
    endAt: isLast ? segment.endTimeSeconds - LAST_SECTION_LOOP_GUARD_SECONDS : segment.endTimeSeconds,
  };
}
