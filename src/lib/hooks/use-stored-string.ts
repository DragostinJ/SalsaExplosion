"use client";

import { useSyncExternalStore } from "react";

/**
 * Per-device string preference backed by localStorage, read through
 * useSyncExternalStore (server snapshot = null, so SSR and hydration agree).
 * Values are mirrored in memory so the UI still updates when storage is
 * blocked (private mode); they just won't survive a reload there.
 */

const CHANGE_EVENT = "ritmoflow:stored-string-change";
const memory = new Map<string, string>();

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function read(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStoredString(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the in-memory value still drives this session
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useStoredString(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null
  );
}
