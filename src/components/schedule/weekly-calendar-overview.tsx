"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Flame,
  BadgeCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  WEEKLY_SCHEDULE as CANONICAL_WEEKLY_SCHEDULE,
  VENUE_INFO,
} from "@/lib/academy-data";

export interface DaySchedule {
  day: "Thursdays" | "Sundays";
  dayBadge: string;
  badgeVariant?: "default" | "secondary" | "outline";
  venueName: string;
  venueAddress: string;
  venueLocationHighlight: string;
  venueImage?: string;
  specialGuestNotice?: string;
  teachers: string;
  classes: Array<{
    time: string;
    title: string;
    levelOrNotes?: string;
  }>;
  freeParkingInfo: string;
  actionHref?: string;
  actionLabel?: string;
}

export const WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    day: "Thursdays",
    dayBadge: "Flagship Thursday Night",
    venueName: VENUE_INFO.name,
    venueAddress: `${VENUE_INFO.streetAddress}, ${VENUE_INFO.city} ${VENUE_INFO.postcode}`,
    venueLocationHighlight: `Centrally located next to The Triangle with ${VENUE_INFO.floor}`,
    venueImage: "/images/thursdays-moe-flex-poster.png",
    specialGuestNotice: "Resident Specialist MOE FLEX & The Salsa Explosion Team",
    teachers: "Maestro Enrique, Justyna, Arturas, Moe Flex & Jim",
    classes: CANONICAL_WEEKLY_SCHEDULE.thursday.sessions.map((s) => ({
      time: s.time,
      title: s.title,
      levelOrNotes: `${s.level} • Directed by ${s.instructor} (${s.badge})`,
    })),
    freeParkingInfo: VENUE_INFO.parkingSummary,
    actionHref: "/dashboard/schedule?day=thursday",
    actionLabel: "View Thursday Classes",
  },
  {
    day: "Sundays",
    dayBadge: "Every Sunday Evening",
    venueName: VENUE_INFO.name,
    venueAddress: `${VENUE_INFO.streetAddress}, ${VENUE_INFO.city} ${VENUE_INFO.postcode}`,
    venueLocationHighlight: "Relaxed Sunday Cuban Masterclass & Social Fiesta",
    specialGuestNotice: "Cuban Salsa Masterclass & Rueda Circle with Maestro Enrique & Faculty",
    teachers: "Maestro Enrique Perez Valdes & Faculty",
    classes: CANONICAL_WEEKLY_SCHEDULE.sunday.sessions.map((s) => ({
      time: s.time,
      title: s.title,
      levelOrNotes: `${s.level} • Directed by ${s.instructor} (${s.badge})`,
    })),
    freeParkingInfo: VENUE_INFO.parkingSummary,
    actionHref: "/dashboard/schedule?day=sunday",
    actionLabel: "View Sunday Classes",
  },
];

export function WeeklyCalendarOverview() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <Badge className="bg-primary-base text-white font-extrabold text-xs">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              Weekly Class Calendar
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              Every Thursday &amp; Sunday • BOH Studios Bournemouth
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            BOH Studios Bournemouth Weekly Schedule
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Pure weekly rhythm with no fixed date lock-in. Turn up on Thursdays or Sundays, rotate partners in the circle, and learn authentic Cuban Salsa with Maestro Enrique Perez Valdes and guest artists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
            <a href="tel:+447969633701">
              <Phone className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              Call / WhatsApp: 07969 633701
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {WEEKLY_SCHEDULE.map((item) => (
          <Card
            key={item.day}
            className="flex flex-col justify-between overflow-hidden border border-border/80 shadow-xs hover:border-primary-base/40 hover:shadow-md transition-all"
          >
            <div>
              {/* Day Header Banner */}
              <div className="bg-muted/30 p-5 border-b space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-foreground text-background font-black text-xs uppercase tracking-wider">
                    {item.day}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {item.dayBadge}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-foreground">
                      {item.venueName}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{item.venueAddress}</span>
                    </p>
                  </div>
                </div>

                {item.specialGuestNotice && (
                  <div className="rounded-xl border border-primary-base/30 bg-primary-base/5 p-2.5 flex items-center gap-2 text-xs font-bold text-foreground">
                    <Flame className="h-4 w-4 text-primary-base shrink-0" />
                    <span>{item.specialGuestNotice}</span>
                  </div>
                )}
              </div>

              {/* Optional Venue Visual Photo */}
              {item.venueImage && (
                <div className="relative h-44 w-full bg-surface-1 border-b border-line overflow-hidden">
                  <Image
                    src={item.venueImage}
                    alt={item.venueName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top opacity-90 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 text-white text-[11px] font-semibold drop-shadow-sm flex items-center justify-between">
                    <span>{item.venueLocationHighlight}</span>
                    <BadgeCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  </div>
                </div>
              )}

              {/* Classes Timetable */}
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b text-xs">
                  <span className="font-bold text-foreground">Teaching Team:</span>
                  <span className="font-extrabold text-foreground">
                    {item.teachers}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {item.classes.map((cls, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border bg-muted/30 p-2.5 flex items-start gap-3 text-xs"
                    >
                      <div className="flex items-center gap-1 font-bold text-xs bg-muted px-2 py-0.5 rounded-md text-foreground shrink-0 pt-0.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{cls.time}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground">{cls.title}</h4>
                        {cls.levelOrNotes && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {cls.levelOrNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>🚗 {item.freeParkingInfo}</span>
                </div>
              </CardContent>
            </div>

            <div className="p-5 pt-0">
              {item.actionHref?.startsWith("tel:") ? (
                <Button asChild className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-10 rounded-xl shadow-xs">
                  <a href={item.actionHref}>
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    {item.actionLabel}
                  </a>
                </Button>
              ) : (
                <Button asChild className="w-full bg-primary-base hover:bg-primary-hover text-white font-bold text-xs h-10 rounded-xl shadow-xs">
                  <Link href={item.actionHref ?? "/dashboard/schedule"}>
                    <span>{item.actionLabel ?? "View Classes"}</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
