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

export interface DaySchedule {
  day: "Tuesdays" | "Wednesdays" | "Thursdays" | "Sundays";
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
    day: "Tuesdays",
    dayBadge: "Every Tuesday Evening",
    venueName: "Neptune Hall",
    venueAddress: "Harvester, Undercliff Drive, Boscombe BH5 1BN",
    venueLocationHighlight: "Above Harvester on the Boscombe seafront",
    teachers: "Jim & Enrique",
    classes: [
      {
        time: "7:30 PM",
        title: "Beginners 2 & Improvers Cuban Salsa",
        levelOrNotes: "Fun social partnerwork, body movement & foundational timing",
      },
    ],
    freeParkingInfo: "Seafront parking & street bays nearby",
    actionHref: "/dashboard/schedule?day=tuesday",
    actionLabel: "View Tuesday Classes",
  },
  {
    day: "Wednesdays",
    dayBadge: "Every Wednesday Evening",
    venueName: "The Woodlands Ballroom",
    venueAddress: "Parkstone Trade & Labour Club, 485 Ashley Rd, Upper Parkstone, Poole BH14 0BB",
    venueLocationHighlight: "Beautiful ballroom space for 100+ dancers with sprung wood floor",
    venueImage: "/images/woodlands-ballroom.png",
    specialGuestNotice: "6-Week Absolute Beginners Cuban Salsa Course with Enrique from Cuba",
    teachers: "Maestro Enrique, Justyna & Arturas",
    classes: [
      {
        time: "7:00 PM – 8:00 PM",
        title: "Absolute Beginners Cuban Salsa Course",
        levelOrNotes: "with Maestro Enrique • Zero experience needed • No partner required",
      },
      {
        time: "7:00 PM",
        title: "Salsa Improvers",
        levelOrNotes: "with Justyna • Transitions & follower frame connection",
      },
      {
        time: "8:00 PM",
        title: "Salsa Intermediates Partnerwork",
        levelOrNotes: "with Arturas & Enrique • Complex turn patterns & Casino technique",
      },
    ],
    freeParkingInfo: "Free parking on site and on the street",
    actionHref: "/dashboard/schedule?day=wednesday",
    actionLabel: "View Wednesday Classes",
  },
  {
    day: "Thursdays",
    dayBadge: "Flagship Thursday Night",
    venueName: "BOH Studios Bournemouth",
    venueAddress: "104 Commercial Rd, Bournemouth BH2 5LR",
    venueLocationHighlight: "Centrally located next to The Triangle with Canadian maple sprung floor",
    venueImage: "/images/thursdays-moe-flex-poster.png",
    specialGuestNotice: "Resident Specialist MOE FLEX & The Salsa Explosion Team",
    teachers: "Maestro Enrique, Justyna, Arturas, Moe Flex & Jim",
    classes: [
      {
        time: "7:00 PM",
        title: "Solo Salsa: Musicality, Pasitos & Rhythm",
        levelOrNotes: "Open to All Levels with Moe Flex",
      },
      {
        time: "7:00 PM",
        title: "Cuban Salsa Beginners Foundation",
        levelOrNotes: "with Maestro Enrique • Zero experience needed • No partner required",
      },
      {
        time: "8:15 PM",
        title: "Cuban Salsa Improvers & Intermediates",
        levelOrNotes: "Improvers with Justyna • Intermediates with Arturas & Moe Flex",
      },
      {
        time: "8:15 PM",
        title: "Rueda de Casino Circles",
        levelOrNotes: "Dynamic calls & partner rotations with Jim & Maestro Enrique",
      },
      {
        time: "9:15 PM – Late",
        title: "Havana Social & Practice with DJ Enrique",
        levelOrNotes: "Authentic Cuban Timba, Son & Social Floorcraft",
      },
    ],
    freeParkingInfo: "Free on-street parking after 6 PM & nearby Library Car Park",
    actionHref: "/dashboard/schedule?day=thursday",
    actionLabel: "View Thursday Classes",
  },
  {
    day: "Sundays",
    dayBadge: "Every Sunday Evening",
    venueName: "BOH Studios Bournemouth",
    venueAddress: "104 Commercial Rd, Bournemouth BH2 5LR",
    venueLocationHighlight: "Relaxed Sunday Cuban session & social wind-down",
    teachers: "The Salsa Explosion Team",
    classes: [
      {
        time: "6:00 PM",
        title: "Salsa Beginners",
        levelOrNotes: "Level 1 foundations",
      },
      {
        time: "7:00 PM",
        title: "Salsa Improvers",
        levelOrNotes: "Technique & frame elasticity",
      },
      {
        time: "7:00 PM",
        title: "Salsa Intermediates",
        levelOrNotes: "Dynamic turn patterns & musical timing",
      },
      {
        time: "7:00 PM",
        title: "Rueda Intermediates",
        levelOrNotes: "Fast-paced group rotations",
      },
      {
        time: "8:00 PM",
        title: "Social / Practice Session",
        levelOrNotes: "Dance with fellow students & teachers",
      },
    ],
    freeParkingInfo: "Free on-street parking after 6 PM",
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
              Tuesdays • Wednesdays • Thursdays • Sundays
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Bournemouth, Boscombe & Poole Weekly Schedule
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Pure weekly rhythm with no fixed date lock-in. Turn up on your regular evening, rotate partners in the circle, and learn authentic Cuban Salsa with Maestro Enrique Perez Valdes and special guests.
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
                <div className="relative h-44 w-full bg-zinc-950 border-b overflow-hidden">
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
