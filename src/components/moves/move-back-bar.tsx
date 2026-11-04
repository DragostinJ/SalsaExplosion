"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLayoutEffect, useRef, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { MOVES_LIST_URL_KEY, safeMovesListUrl } from "@/lib/moves/move-filters-url";
import { nextTrail, parseTrail, previousStop, type Arrival, type TrailStop } from "@/lib/moves/move-trail";

const TRAIL_KEY = "moves:trail";

// How the dancer reached the move page that mounts next. A tap on a "learn first" link says which
// move it came from; the back/forward buttons fire popstate; any other link tap starts afresh.
let arrival: Arrival = { kind: "fresh" };

if (typeof window !== "undefined") {
  try {
    const [entry] = performance.getEntriesByType("navigation");
    const type = entry && "type" in entry ? (entry as PerformanceNavigationTiming).type : "navigate";
    if (type === "reload" || type === "back_forward") arrival = { kind: "history" };
  } catch {
    // Older browsers: treat the first page as a fresh visit
  }
  window.addEventListener("popstate", () => {
    arrival = { kind: "history" };
  });
  // Capture phase: runs before TrailLink's own click handler, which then says where it came from
  document.addEventListener(
    "click",
    (event) => {
      if (event.target instanceof Element && event.target.closest("a[href]")) arrival = { kind: "fresh" };
    },
    true
  );
}

function readStorage(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Private mode or storage blocked: the page still works, just without "Back to …"
  }
}

// The previous move lives outside React (keyed by the page it belongs to) so a new move page
// never shows the last page's answer, and the bar updates before the browser paints
let current: { moveId: string; previous: TrailStop | null } = { moveId: "", previous: null };
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const noopSubscribe = () => () => {};

const plainClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/** A link from one move's page to another; it tells the next page where the dancer came from. */
export function TrailLink({ fromMoveId, href, className, children }: { fromMoveId: string; href: string; className?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (plainClick(event)) arrival = { kind: "from-move", moveId: fromMoveId };
      }}
    >
      {children}
    </Link>
  );
}

/** "← Back to <previous move>" when the dancer came from another move, and "All moves" with their search kept. */
export function MoveBackBar({ moveId, moveName }: { moveId: string; moveName: string }) {
  // Strict mode runs effects twice in development; the arrival must only be counted once per page
  const handled = useRef<string | null>(null);

  useLayoutEffect(() => {
    const stored = parseTrail(readStorage(TRAIL_KEY));
    let trail = stored;
    if (handled.current !== moveId) {
      handled.current = moveId;
      trail = nextTrail(stored, { id: moveId, name: moveName }, arrival);
      arrival = { kind: "fresh" };
      writeStorage(TRAIL_KEY, JSON.stringify(trail));
    }
    current = { moveId, previous: previousStop(trail) };
    listeners.forEach((listener) => listener());
  }, [moveId, moveName]);

  const back = useSyncExternalStore(
    subscribe,
    () => (current.moveId === moveId ? current.previous : null),
    () => null
  );
  const listUrl = useSyncExternalStore(noopSubscribe, () => safeMovesListUrl(readStorage(MOVES_LIST_URL_KEY)), () => "/moves");

  const link = "inline-flex min-h-[40px] items-center gap-2 underline underline-offset-4";
  return (
    <nav aria-label="Back" className="flex min-h-[40px] items-center justify-between gap-4 text-sm font-bold">
      {back ? (
        <Link
          href={`/moves/${back.id}`}
          className={`${link} min-w-0`}
          onClick={(event) => {
            // The trail follows the browser's history, so one step back lands on that move where the dancer left it
            if (plainClick(event) && window.history.length > 1) {
              event.preventDefault();
              window.history.back();
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Back to {back.name}</span>
        </Link>
      ) : null}
      <Link href={listUrl} className={`${link} shrink-0`}>
        {!back && <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />}
        All moves
      </Link>
    </nav>
  );
}
