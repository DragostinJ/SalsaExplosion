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
import {
  WEEKLY_SCHEDULE as CANONICAL_WEEKLY_SCHEDULE,
  VENUE_INFO,
} from "@/lib/academy-data";
import { TYPE, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

export interface DaySchedule {
  day: "Thursdays" | "Sundays";
  dayBadge: string;
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
    dayBadge: "Cuban Sunday Masterclass & Social",
    venueName: VENUE_INFO.name,
    venueAddress: `${VENUE_INFO.streetAddress}, ${VENUE_INFO.city} ${VENUE_INFO.postcode}`,
    venueLocationHighlight: `Authentic Cuban Social Fiesta with Maestro Enrique`,
    venueImage: "/images/editorial/social-night.jpg",
    specialGuestNotice: "Sunday Havana Matinee & Evening Fiesta",
    teachers: "Maestro Enrique Perez Valdes & Special Guest Instructors",
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-4 border-ink pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="border border-ink bg-poster-red text-paper font-bold text-xs uppercase tracking-wider px-2.5 py-0.5 inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Weekly Class Calendar
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink/75">
              Every Thursday &amp; Sunday • BOH Studios
            </span>
          </div>
          <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card} pt-1`}>
            BOH Studios Bournemouth Weekly Schedule
          </h2>
          <p className="text-xs sm:text-sm text-ink/80 font-medium max-w-2xl leading-relaxed">
            Pure weekly rhythm with no fixed date lock-in. Turn up on Thursdays or Sundays, rotate partners in the circle, and learn authentic Cuban Salsa with Maestro Enrique Perez Valdes and guest artists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:+447969633701"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center`}
          >
            <Phone className="mr-1.5 h-3.5 w-3.5" />
            Call / WhatsApp: 07969 633701
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {WEEKLY_SCHEDULE.map((item) => (
          <div
            key={item.day}
            className="flex flex-col justify-between border-4 border-ink bg-paper text-ink shadow-[6px_6px_0_0_#161311]"
          >
            <div>
              {/* Day Header Banner */}
              <div className="bg-poster-mustard/30 p-5 border-b-4 border-ink space-y-2">
                <div className="flex items-center justify-between">
                  <span className="border border-ink bg-ink text-paper font-black text-xs uppercase tracking-wider px-2 py-0.5">
                    {item.day}
                  </span>
                  <span className="text-xs font-bold text-ink/80 uppercase">
                    {item.dayBadge}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 pt-1">
                  <div>
                    <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                      {item.venueName}
                    </h3>
                    <p className="text-xs text-ink/75 font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-poster-red shrink-0" />
                      <span>{item.venueAddress}</span>
                    </p>
                  </div>
                </div>

                {item.specialGuestNotice && (
                  <div className="border border-ink bg-paper p-2.5 flex items-center gap-2 text-xs font-bold text-ink shadow-[2px_2px_0_0_#161311]">
                    <Flame className="h-4 w-4 text-poster-red shrink-0" />
                    <span>{item.specialGuestNotice}</span>
                  </div>
                )}
              </div>

              {/* Optional Venue Visual Photo */}
              {item.venueImage && (
                <div className="relative h-44 w-full bg-ink border-b-4 border-ink overflow-hidden">
                  <Image
                    src={item.venueImage}
                    alt={item.venueName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 text-paper text-xs font-bold drop-shadow-sm flex items-center justify-between">
                    <span>{item.venueLocationHighlight}</span>
                    <BadgeCheck className="h-4 w-4 text-poster-teal shrink-0" />
                  </div>
                </div>
              )}

              {/* Classes Timetable */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b-2 border-ink text-xs font-bold">
                  <span className="text-ink/80 uppercase">Teaching Team:</span>
                  <span className="text-ink">
                    {item.teachers}
                  </span>
                </div>

                <div className="space-y-2">
                  {item.classes.map((cls, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-ink bg-paper p-2.5 flex items-start gap-3 text-xs"
                    >
                      <div className="flex items-center gap-1 font-bold text-xs bg-poster-mustard border border-ink px-2 py-0.5 text-ink shrink-0 pt-0.5">
                        <Clock className="h-3.5 w-3.5 text-ink" />
                        <span>{cls.time}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-ink">{cls.title}</h4>
                        {cls.levelOrNotes && (
                          <p className="text-xs text-ink/75 font-medium mt-0.5">
                            {cls.levelOrNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-ink bg-poster-mustard/20 p-2.5 text-xs font-bold text-ink flex items-center justify-between">
                  <span>🚗 {item.freeParkingInfo}</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              {item.actionHref?.startsWith("tel:") ? (
                <a
                  href={item.actionHref}
                  className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} w-full text-xs font-bold min-h-[40px] flex items-center justify-center`}
                >
                  <Phone className="mr-1.5 h-3.5 w-3.5" />
                  {item.actionLabel}
                </a>
              ) : (
                <Link
                  href={item.actionHref ?? "/dashboard/schedule"}
                  className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} w-full text-xs font-bold min-h-[40px] flex items-center justify-center gap-1.5`}
                >
                  <span>{item.actionLabel ?? "View Classes"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
