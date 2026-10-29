import { ParsedEventCard } from "@/lib/validations/ai-studio.schema";

/**
 * Server-side published events store for AI-extracted & approved events.
 * Provides in-memory storage with fallbacks, ensuring instant publication to /events.
 */

declare global {
  // eslint-disable-next-line no-var
  var __SALSA_PUBLISHED_EVENTS: ParsedEventCard[] | undefined;
}

if (!globalThis.__SALSA_PUBLISHED_EVENTS) {
  globalThis.__SALSA_PUBLISHED_EVENTS = [];
}

export function getPublishedEvents(): ParsedEventCard[] {
  return globalThis.__SALSA_PUBLISHED_EVENTS || [];
}

export function addPublishedEvent(event: ParsedEventCard): ParsedEventCard[] {
  const existing = getPublishedEvents();
  // Filter out any existing item with same ID or slug to allow idempotent updates
  const updated = [
    event,
    ...existing.filter((e) => e.id !== event.id && e.title !== event.title),
  ];
  globalThis.__SALSA_PUBLISHED_EVENTS = updated;
  return updated;
}

export function removePublishedEvent(eventId: string): ParsedEventCard[] {
  const existing = getPublishedEvents();
  const updated = existing.filter((e) => e.id !== eventId);
  globalThis.__SALSA_PUBLISHED_EVENTS = updated;
  return updated;
}

export function clearPublishedEvents(): void {
  globalThis.__SALSA_PUBLISHED_EVENTS = [];
}
