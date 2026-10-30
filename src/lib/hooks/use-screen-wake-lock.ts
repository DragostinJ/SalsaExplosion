"use client";

import { useEffect } from "react";

/**
 * Keeps the phone screen awake while `active` is true (e.g. a song is playing),
 * so cues stay visible between practice runs. Browsers release the lock when
 * the tab is hidden, so it is re-acquired when the page becomes visible again.
 * Silently does nothing where the Screen Wake Lock API is unsupported.
 */
export function useScreenWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          await lock.release();
          return;
        }
        sentinel = lock;
      } catch {
        // Denied (battery saver, permissions policy): the screen may sleep as usual
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && (!sentinel || sentinel.released)) {
        void acquire();
      }
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release().catch(() => undefined);
      sentinel = null;
    };
  }, [active]);
}
