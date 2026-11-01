import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upcomingCanonicalEvents } from "@/lib/academy-data";
import { cn } from "@/lib/utils";

const MAX_POSTERS = 3;

/**
 * "What's On" poster grid: the next festivals and parties from UPCOMING_EVENTS,
 * so finished events drop off by themselves. When fewer than three are left,
 * the last slot links to the full calendar on /events.
 */
export function UpcomingEventPosters() {
  const events = upcomingCanonicalEvents().slice(0, MAX_POSTERS);
  const showCalendarTile = events.length < MAX_POSTERS;
  const tiles = events.length + (showCalendarTile ? 1 : 0);

  return (
    <div className={cn("grid grid-cols-1 gap-8", tiles >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
      {events.map((event, index) => {
        const isNext = index === 0;
        return (
          <div
            key={event.slug}
            className={cn(
              "group relative flex flex-col justify-between rounded-2xl border bg-surface-2 overflow-hidden transition-all duration-300",
              isNext
                ? "border-white/10 shadow-2xl hover:border-amber-400/50"
                : "border-line shadow-xs hover:border-gold/40"
            )}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-950">
              <Image
                src={event.posterUrl}
                alt={`${event.title} official event poster`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2.5 py-1 text-xs font-black uppercase tracking-wider",
                    isNext ? "text-amber-300" : "text-gold"
                  )}
                >
                  {event.dateBadge}
                </span>
                {isNext && (
                  <span className="rounded-md bg-amber-400 text-stone-950 px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                    Next up
                  </span>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <span
                  className={cn(
                    "rounded-md text-stone-950 px-2 py-0.5 text-xs font-black uppercase tracking-wider",
                    isNext ? "bg-amber-400" : "bg-gold"
                  )}
                >
                  From £{event.minPricePounds}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {event.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-ivory-muted mt-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{event.venueName}</span>
                </div>
                <p className="text-xs text-ivory-muted mt-2 line-clamp-2 leading-relaxed">{event.description}</p>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-between">
                <Button
                  asChild
                  className="w-full bg-brand hover:bg-brand-hover text-white font-black text-xs h-10 rounded-xl shadow-xs"
                >
                  <Link href={`/events/${event.slug}`}>
                    <Ticket className="mr-1.5 h-3.5 w-3.5" />
                    Book Pass Online →
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {showCalendarTile && (
        <div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface-2 overflow-hidden shadow-xs hover:border-gold/40 transition-all duration-300">
          <div className="relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 overflow-hidden bg-surface-1 p-6 text-center">
            <CalendarDays className="h-10 w-10 text-gold" aria-hidden="true" />
            <p className="font-display text-4xl italic text-ivory">2026 / 2027</p>
            <p className="text-xs font-black uppercase tracking-wider text-gold">DANZA! special events calendar</p>
          </div>

          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                The full events calendar
              </h3>
              <p className="text-xs text-ivory-muted mt-2 line-clamp-2 leading-relaxed">
                Every party, weekender and masterclass through 2027, with online passes.
              </p>
            </div>

            <div className="pt-3 border-t border-line flex items-center justify-between">
              <Button
                asChild
                variant="outline"
                className="w-full border-gold/40 text-gold font-black text-xs h-10 rounded-xl shadow-xs"
              >
                <Link href="/events">
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                  Browse the full calendar →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
