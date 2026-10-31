import type { SongSegment } from "@/lib/constants/timba-song-anatomy";

/**
 * Shareable links to one section: /music/<song>?section=<section id>.
 * The player opens previewing that section and the video starts a couple of
 * seconds before it, so the dancer hears the change coming.
 */

export const SECTION_LINK_PARAM = "section";
/** Lead-in for linked starts (YouTube's start parameter is whole seconds). */
export const SECTION_LINK_LEAD_IN_SECONDS = 2;

export function readLinkedSectionId(): string | null {
  return new URLSearchParams(window.location.search).get(SECTION_LINK_PARAM);
}

export function linkedSectionIndex(segments: readonly SongSegment[], sectionId: string | null): number | null {
  if (!sectionId) return null;
  const index = segments.findIndex((segment) => segment.id === sectionId);
  return index > 0 ? index : null;
}

/** Whole second to start the video at (YouTube's `start` player parameter). */
export function linkedStartSeconds(segments: readonly SongSegment[], index: number | null): number {
  if (index === null) return 0;
  return Math.max(0, Math.floor(segments[index].startTimeSeconds - SECTION_LINK_LEAD_IN_SECONDS));
}

export function buildSectionLink(origin: string, songId: string, sectionId: string): string {
  return `${origin}/music/${songId}?${SECTION_LINK_PARAM}=${encodeURIComponent(sectionId)}`;
}
