"use client";

import { useEffect, useRef, useCallback } from "react";

export class TimeoutController {
  private timeoutId: NodeJS.Timeout | number | null = null;

  clear(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId as NodeJS.Timeout);
      this.timeoutId = null;
    }
  }

  schedule(fn: () => void, ms: number): void {
    this.clear();
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      fn();
    }, ms);
  }

  isActive(): boolean {
    return this.timeoutId !== null;
  }
}

export interface TimeoutHandle {
  schedule: (fn: () => void, ms: number) => void;
  clear: () => void;
}

/**
 * Hook to manage safe timeouts in components:
 * - Auto-cleans any active timer on unmount to prevent state updates after unmount
 * - Cancels/replaces the previous timer when schedule() is invoked again
 * - Provides an explicit clear() function
 */
export function useTimeout(): TimeoutHandle {
  const timeoutIdRef = useRef<NodeJS.Timeout | number | null>(null);

  const clear = useCallback(() => {
    if (timeoutIdRef.current != null) {
      clearTimeout(timeoutIdRef.current as NodeJS.Timeout);
      timeoutIdRef.current = null;
    }
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    if (timeoutIdRef.current != null) {
      clearTimeout(timeoutIdRef.current as NodeJS.Timeout);
    }
    timeoutIdRef.current = setTimeout(() => {
      timeoutIdRef.current = null;
      fn();
    }, ms);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current != null) {
        clearTimeout(timeoutIdRef.current as NodeJS.Timeout);
      }
    };
  }, []);

  return { schedule, clear };
}
