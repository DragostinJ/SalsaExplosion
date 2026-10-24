"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
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

  if (isDismissed) return null;

  const isThursday = dayOfWeek === 4;
  const isSunday = dayOfWeek === 0;
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
  const isLiveTonight = isThursday || isSunday;

  return (
    <aside
      aria-label="Live classes and schedule banner"
      data-testid="live-tonight-banner"
      className={`relative z-20 border-b transition-colors ${
        isLiveTonight
          ? "bg-gradient-to-r from-emerald-950/80 via-zinc-950 to-emerald-950/80 border-emerald-500/40 text-emerald-100"
          : isWeekend
          ? "bg-gradient-to-r from-amber-950/80 via-zinc-950 to-amber-950/80 border-amber-500/40 text-amber-100"
          : "bg-gradient-to-r from-zinc-950 via-muted/40 to-zinc-950 border-border/70 text-foreground"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Status Message */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start text-center sm:text-left">
            {isSunday ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                LIVE TONIGHT AT BOH STUDIOS
              </span>
            ) : isThursday ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                LIVE TONIGHT AT BOH STUDIOS
              </span>
            ) : isWeekend ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                THIS SUNDAY AT BOH STUDIOS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                THIS THURSDAY AT BOH STUDIOS
              </span>
            )}

            <div className="font-medium text-xs leading-snug">
              {isThursday ? (
                <span>
                  <strong className="text-white font-extrabold">Thursday Cuban Night:</strong> 7:00 PM Beginners Foundation (Maestro Enrique) &amp; All-Levels Musicality/Pasitos (Moe Flex) • 8:15 PM Improvers (Justyna), Intermediates (Arturas) &amp; Rueda (Jim) • Social till late!
                </span>
              ) : isSunday ? (
                <span>
                  <strong className="text-white font-extrabold">LIVE TONIGHT AT BOH STUDIOS:</strong> 18:30 Sunday Cuban Masterclass &amp; 19:30 Havana Social Fiesta with Maestro Enrique!
                </span>
              ) : isWeekend ? (
                <span>
                  <strong className="text-white font-extrabold">NEXT UP TOMORROW (SUNDAY) AT BOH STUDIOS:</strong> 18:30 Cuban Masterclass &amp; 19:30 Havana Social Fiesta with Maestro Enrique • Every Thursday from 19:00
                </span>
              ) : (
                <span>
                  <strong className="text-white font-extrabold">Thursday Cuban Night:</strong> 4 Levels of Cuban Salsa, Solo Pasitos with Moe Flex &amp; Havana Fiesta Social (7:00 PM – Late)! • <span className="text-muted-foreground">Free Trial Available</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Button & Dismiss */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              size="sm"
              className={`h-7 px-3 text-[11px] font-extrabold shadow-xs ${
                isLiveTonight
                  ? "bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black border border-emerald-300"
                  : isWeekend
                  ? "bg-amber-400 hover:bg-amber-300 text-amber-950 font-black border border-amber-300"
                  : "bg-primary-base hover:bg-primary-hover text-white"
              }`}
            >
              <Link href="/dashboard/schedule">
                {isSunday
                  ? "Book Tonight's Masterclass →"
                  : isThursday
                  ? "Book Tonight's Spot →"
                  : isWeekend
                  ? "Reserve Sunday / Thursday →"
                  : "Reserve Thursday Spot →"}
              </Link>
            </Button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
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
