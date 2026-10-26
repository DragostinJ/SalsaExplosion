"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

function getUkDayFromDate(date: Date): number {
  try {
    const ukDateString = date.toLocaleString("en-US", { timeZone: "Europe/London" });
    return new Date(ukDateString).getDay();
  } catch {
    return date.getDay();
  }
}

function getServerUkDay(): number {
  return getUkDayFromDate(new Date());
}

function getClientUkDay(): number {
  try {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get("liveDemo")?.toLowerCase();
    if (demo === "thursday") return 4;
    if (demo === "sunday") return 0;
    if (demo === "friday") return 5;
    if (demo === "saturday") return 6;
    if (demo === "weekend") return 6;
    if (demo === "monday") return 1;

    return getUkDayFromDate(new Date());
  } catch {
    return new Date().getDay();
  }
}

const emptySubscribe = () => () => {};

export function LiveTonightBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const dayOfWeek = useSyncExternalStore(
    emptySubscribe,
    getClientUkDay,
    getServerUkDay
  );

  const isThursday = dayOfWeek === 4;
  const isSunday = dayOfWeek === 0;
  const isLiveTonight = isThursday || isSunday;

  // Strictly display ONLY on class days (Thursdays and Sundays)
  if (isDismissed || !isLiveTonight) return null;

  const targetAnchor = isSunday ? "#timetable-sunday" : "#timetable-thursday";

  return (
    <aside
      aria-label="Live classes tonight banner"
      data-testid="live-tonight-banner"
      className="relative z-20 border-b bg-gradient-to-r from-emerald-950/90 via-[#09120e] to-emerald-950/90 border-emerald-500/40 text-emerald-100 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Status Message */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              CLASSES LIVE TONIGHT AT BOH STUDIOS
            </span>

            <div className="font-medium text-xs leading-snug text-stone-100">
              {isThursday ? (
                <span>
                  <strong className="text-white font-extrabold">Thursday Havana Residency Tonight:</strong>{" "}
                  19:00 Beginners &amp; Solo Musicality • 20:15 Improvers, Intermediates &amp; Rueda • 21:30 Havana Social Fiesta
                </span>
              ) : (
                <span>
                  <strong className="text-white font-extrabold">Sunday Havana Session Tonight:</strong>{" "}
                  18:30 Cuban Salsa &amp; Rueda Masterclass • 19:30 Sunday Havana Social Fiesta with Maestro Enrique
                </span>
              )}
            </div>
          </div>

          {/* Action Button & Dismiss */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              size="sm"
              className="h-7 px-3 text-[11px] font-black bg-emerald-400 hover:bg-emerald-300 text-emerald-950 border border-emerald-300 shadow-xs"
            >
              <a href={targetAnchor}>
                {isSunday ? "View Sunday Lineup & Book ↓" : "View Tonight's Lineup & Book ↓"}
              </a>
            </Button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="rounded-full p-1 text-emerald-200/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
