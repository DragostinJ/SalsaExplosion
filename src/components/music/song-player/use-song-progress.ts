"use client";

import { useCallback, useEffect, useState } from "react";
import { getMySongProgressAction, setSongSectionMasteredAction } from "@/actions/song-progress.actions";

export interface SongProgressState {
  /** null while loading */
  signedIn: boolean | null;
  mastered: ReadonlySet<string>;
  error: string | null;
  toggle: (sectionId: string) => void;
}

/**
 * Loads and optimistically updates the dancer's "got it" sections for one song.
 * Disabled (e.g. previewing an imported song that isn't published yet) it stays
 * in the loading state, which hides the "got it" UI.
 */
export function useSongProgress(songId: string, enabled = true): SongProgressState {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [mastered, setMastered] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    getMySongProgressAction(songId)
      .then((snapshot) => {
        if (cancelled) return;
        setSignedIn(snapshot.signedIn);
        setMastered(new Set(snapshot.masteredSectionIds));
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [songId, enabled]);

  const toggle = useCallback(
    (sectionId: string) => {
      const nextMastered = !mastered.has(sectionId);
      const previous = mastered;
      const optimistic = new Set(mastered);
      if (nextMastered) optimistic.add(sectionId);
      else optimistic.delete(sectionId);
      setMastered(optimistic);
      setError(null);

      setSongSectionMasteredAction({ songId, sectionId, mastered: nextMastered })
        .then((result) => {
          if (result.success) {
            setMastered(new Set(result.data.masteredSectionIds));
          } else {
            setMastered(previous);
            setError(result.error.message);
            if (result.error.code === "UNAUTHORIZED") setSignedIn(false);
          }
        })
        .catch(() => {
          setMastered(previous);
          setError("Could not save your progress.");
        });
    },
    [mastered, songId]
  );

  return { signedIn, mastered, error, toggle };
}
