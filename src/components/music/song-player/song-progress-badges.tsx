"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMyProgressSummaryAction } from "@/actions/song-progress.actions";

const ProgressContext = createContext<Record<string, number>>({});

/**
 * Loads the signed-in dancer's "Got it" counts once for the whole song list (the list itself
 * stays a static page). Signed-out visitors get no badges.
 */
export function SongProgressProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<Record<string, number>>({});
  useEffect(() => {
    let live = true;
    getMyProgressSummaryAction()
      .then((data) => {
        if (live) setSummary(data);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  return <ProgressContext.Provider value={summary}>{children}</ProgressContext.Provider>;
}

/** "4 / 9 ✓" once a dancer has ticked a section of this song; "Todo ✓" when every section is got. */
export function SongProgressBadge({ songId, total }: { songId: string; total: number }) {
  const got = Math.min(useContext(ProgressContext)[songId] ?? 0, total);
  if (got === 0) return null;
  return (
    <span className="border-2 border-ink bg-poster-teal px-2 py-0.5 tabular-nums text-ink" data-testid="song-progress-badge">
      {got === total ? "Todo ✓" : `${got} / ${total} ✓`}
      <span className="sr-only"> sections you&apos;ve got</span>
    </span>
  );
}
