"use client";

import Link from "next/link";
import { MapPin, CheckCircle2, CreditCard } from "lucide-react";
import {
  WEEKLY_SCHEDULE,
  VENUE_INFO,
  DOOR_PRICING,
  type CanonicalClassSession,
} from "@/lib/academy-data";
import { TYPE, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

import { DOOR } from "@/lib/constants/door-prices";
function TimetableRow({
  item,
}: {
  item: CanonicalClassSession;
  day: "thursday" | "sunday";
}) {
  return (
    <div className="py-4 border-b-2 border-ink px-2 sm:px-4 hover:bg-black/[0.02] transition-colors">
      {/* Desktop 4-Column Architectural Grid / Mobile Responsive Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start lg:items-center">
        {/* Column 1: Time (col-span-2) */}
        <div className="lg:col-span-2 flex items-center gap-2.5">
          <span className={`font-display tabular-nums ${TYPE.card} text-ink whitespace-nowrap`}>
            {item.time}
          </span>
        </div>

        {/* Column 2: Level / Category Badge (col-span-3) */}
        <div className="lg:col-span-3 flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-ink shadow-[2px_2px_0_0_var(--color-ink)] ${
              item.isSocial
                ? "bg-poster-teal text-ink"
                : "bg-paper text-ink"
            }`}
          >
            {item.level}
          </span>
          {item.badge && (
            <span className="text-xs font-bold text-ink bg-poster-mustard border border-ink px-2 py-0.5 shadow-[2px_2px_0_0_var(--color-ink)]">
              {item.badge}
            </span>
          )}
        </div>

        {/* Column 3: Class Title & Instructor / Hall Details (col-span-5) */}
        <div className="lg:col-span-5 min-w-0 space-y-0.5">
          <h4 className="text-base font-bold text-ink">
            {item.title}
          </h4>
          <p className="text-xs text-ink/75 font-medium">
            Directed by{" "}
            {item.instructorHref ? (
              <Link
                href={item.instructorHref}
                className="font-bold text-accent-red hover:underline transition-colors"
              >
                {item.instructor}
              </Link>
            ) : (
              <span className="font-bold text-accent-red">{item.instructor}</span>
            )}
            {" • "}
            <span className="font-medium text-ink">{item.room}</span>
          </p>
        </div>

        {/* Column 4: Action (col-span-2) */}
        <div className="lg:col-span-2 lg:text-right pt-2 lg:pt-0">
          <Link
            href="/venues"
            data-testid={`timetable-book-${item.id}`}
            className={`${POSTER_BUTTON} ${
              item.isSocial
                ? "border-poster-teal bg-poster-teal text-ink hover:bg-ink hover:text-paper"
                : POSTER_BUTTON_COLORS.ink
            } text-xs font-bold px-3 py-1.5 w-full md:w-auto inline-flex items-center justify-between md:justify-center gap-1.5 min-h-[40px]`}
          >
            <span>{item.isSocial ? `Included / ${DOOR.social} Door` : `Pay at Door • ${DOOR.one} / ${DOOR.two}`}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function TwoDayExhibitionTimetable() {
  const thursdaySchedule = WEEKLY_SCHEDULE.thursday;
  const sundaySchedule = WEEKLY_SCHEDULE.sunday;

  return (
    <section
      id="timetable"
      className="cv-auto border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_var(--color-ink)] scroll-mt-20 space-y-10"
    >
      {/* Section header: kept small, because the page hero right above already says Thursdays & Sundays */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-4 border-ink">
        <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card}`}>
          The weekly <span className="text-accent-red">timetable</span>
        </h2>

        <div className="flex items-center gap-2 self-start md:self-auto border-2 border-ink bg-poster-mustard px-4 py-2 text-xs font-bold text-ink shadow-[4px_4px_0_0_var(--color-ink)]">
          <MapPin className="h-4 w-4 text-accent-red shrink-0" />
          <span>
            {VENUE_INFO.name} • {VENUE_INFO.address}, {VENUE_INFO.postcode}
          </span>
        </div>
      </div>

      {/* ================= THURSDAY CARTELERA TABLE ================= */}
      <div id="timetable-thursday" className="border-4 border-ink bg-paper p-5 sm:p-7 shadow-[6px_6px_0_0_var(--color-ink)] space-y-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b-4 border-ink">
          <div>
            <div className="flex items-center gap-2">
              <span className="border border-ink px-2.5 py-0.5 bg-poster-mustard text-ink text-xs font-black tracking-wider uppercase">
                THURSDAY
              </span>
              <span className="text-xs font-bold text-ink/75">
                {thursdaySchedule.sessions.length} Sessions • Doors {thursdaySchedule.doorsTime} • {VENUE_INFO.floor}
              </span>
            </div>
            <h3 className={`font-display text-accent-red ${TYPE.section} mt-2`}>
              JUEVES
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-ink mt-1">
              Thursday Havana Residency
            </p>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-ink max-w-sm sm:text-right">
            {thursdaySchedule.subtitle}
          </p>
        </div>

        {/* Table Header (Desktop only) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-black uppercase tracking-wider text-ink border-b-2 border-ink">
          <span className="col-span-2">Time</span>
          <span className="col-span-3">Level / Track</span>
          <span className="col-span-5">Class &amp; Faculty</span>
          <span className="col-span-2 text-right">Admission (At Door)</span>
        </div>

        <div className="border-t-2 border-ink">
          {thursdaySchedule.sessions.map((item) => (
            <TimetableRow key={item.id} item={item} day="thursday" />
          ))}
        </div>
      </div>

      {/* ================= SUNDAY CARTELERA TABLE ================= */}
      <div id="timetable-sunday" className="border-4 border-ink bg-paper p-5 sm:p-7 shadow-[6px_6px_0_0_var(--color-ink)] space-y-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b-4 border-ink">
          <div>
            <div className="flex items-center gap-2">
              <span className="border border-ink px-2.5 py-0.5 bg-poster-teal text-ink text-xs font-black tracking-wider uppercase">
                SUNDAY
              </span>
              <span className="text-xs font-bold text-ink/75">
                Doors {sundaySchedule.doorsTime} • Every Sunday • Masterclass &amp; Social
              </span>
            </div>
            <h3 className={`font-display text-accent-red ${TYPE.section} mt-2`}>
              DOMINGO
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-ink mt-1">
              Sunday Havana Sessions — {VENUE_INFO.shortName}
            </p>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-ink max-w-sm sm:text-right">
            {sundaySchedule.subtitle}
          </p>
        </div>

        {/* Table Header (Desktop only) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-black uppercase tracking-wider text-ink border-b-2 border-ink">
          <span className="col-span-2">Time</span>
          <span className="col-span-3">Level / Track</span>
          <span className="col-span-5">Class &amp; Faculty</span>
          <span className="col-span-2 text-right">Admission (At Door)</span>
        </div>

        <div className="border-t-2 border-ink">
          {sundaySchedule.sessions.map((item) => (
            <TimetableRow key={item.id} item={item} day="sunday" />
          ))}
        </div>
      </div>

      {/* Bottom Editorial Confidence Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-4 border-ink bg-poster-mustard text-ink shadow-[4px_4px_0_0_var(--color-ink)]">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-ink font-bold">
          <span className="flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" />
            {DOOR_PRICING.summaryBadge}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-accent-teal" />
            Cash or Card at Door
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-accent-teal" />
            Zero Partner Required
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-accent-teal" />
            No Online Pre-Booking Needed
          </span>
        </div>

        <Link
          href="/pricing"
          className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center`}
        >
          View Door Pricing &amp; Passes →
        </Link>
      </div>
    </section>
  );
}
