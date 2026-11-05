/**
 * The chain of moves a dancer walked through by tapping "learn first" links (Abajo y arriba →
 * Paso básico → …), kept in the same order as the browser's history so "Back to …" can simply
 * go one step back.
 */

export interface TrailStop {
  id: string;
  name: string;
}

/** How the dancer reached this move page. */
export type Arrival =
  /** Tapped a link on another move's page (that move's id). */
  | { kind: "from-move"; moveId: string }
  /** Back/forward button or a reload: the history entry was already on the trail. */
  | { kind: "history" }
  /** Anything else: the move list, a song, a shared link. */
  | { kind: "fresh" };

/** Long chains are rare; the cap keeps storage small. */
export const MAX_TRAIL = 20;

/** Move ids are slugs; anything else in storage is not ours and never becomes a link. */
const MOVE_ID = /^[a-z0-9-]+$/;

function lastIndexOf(trail: readonly TrailStop[], moveId: string): number {
  for (let i = trail.length - 1; i >= 0; i--) {
    if (trail[i].id === moveId) return i;
  }
  return -1;
}

/** The trail after arriving on `here`. */
export function nextTrail(trail: readonly TrailStop[], here: TrailStop, arrival: Arrival): TrailStop[] {
  if (arrival.kind === "from-move") {
    const from = lastIndexOf(trail, arrival.moveId);
    if (from !== -1) return [...trail.slice(0, from + 1), here].slice(-MAX_TRAIL);
  }
  if (arrival.kind === "history") {
    const seen = lastIndexOf(trail, here.id);
    if (seen !== -1) return trail.slice(0, seen + 1);
  }
  return [here];
}

/** The move "Back to …" returns to, if the dancer came from one. */
export function previousStop(trail: readonly TrailStop[]): TrailStop | null {
  return trail.length > 1 ? trail[trail.length - 2] : null;
}

/** Reads a stored trail, ignoring anything malformed. */
export function parseTrail(raw: string | null): TrailStop[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (stop): stop is TrailStop =>
          typeof stop === "object" &&
          stop !== null &&
          typeof (stop as Record<string, unknown>).id === "string" &&
          MOVE_ID.test((stop as Record<string, string>).id) &&
          typeof (stop as Record<string, unknown>).name === "string"
      )
      .slice(-MAX_TRAIL);
  } catch {
    return [];
  }
}
