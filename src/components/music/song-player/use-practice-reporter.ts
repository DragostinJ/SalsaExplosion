"use client";

import { useCallback, useRef } from "react";
import { recordPracticeEventAction } from "@/actions/practice-stats.actions";

export type PracticeEventKind = "loop" | "replay";

/**
 * Reports anonymous "this section was looped / replayed" counts for the
 * teachers' practice hotspots. At most once per section and kind per page
 * visit, fire-and-forget, so a dancer drilling one section counts once.
 */
export function usePracticeReporter(songId: string, enabled: boolean) {
  const sentRef = useRef<Set<string>>(new Set());
  return useCallback(
    (sectionId: string, kind: PracticeEventKind) => {
      if (!enabled) return;
      const key = `${kind}:${sectionId}`;
      if (sentRef.current.has(key)) return;
      sentRef.current.add(key);
      recordPracticeEventAction({ songId, sectionId, kind }).catch(() => {});
    },
    [songId, enabled]
  );
}
