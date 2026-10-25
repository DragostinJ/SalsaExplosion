"use client";

import Link from "next/link";
import { MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerQuickBookDrawer } from "@/components/booking/QuickBookDrawer";
import {
  WEEKLY_SCHEDULE,
  VENUE_INFO,
  PASS_PRICING,
  type CanonicalClassSession,
} from "@/lib/academy-data";

function TimetableRow({
  item,
  day,
}: {
  item: CanonicalClassSession;
  day: "thursday" | "sunday";
}) {
  return (
    <div className="py-4 sm:py-5 border-b border-black/10 hover:bg-black/[0.025] px-3 sm:px-4 rounded-xl transition-colors">
      {/* Desktop 4-Column Architectural Grid / Mobile Responsive Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start lg:items-center">
        {/* Column 1: Time (col-span-2) */}
        <div className="lg:col-span-2 flex items-center gap-2.5">
          <span className="font-mono text-lg sm:text-xl font-black text-[#120D0A] tracking-tight whitespace-nowrap">
            {item.time}
          </span>
        </div>

        {/* Column 2: Level / Category Badge (col-span-3) */}
        <div className="lg:col-span-3 flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              item.isSocial
                ? "bg-emerald-800/15 text-emerald-950 border-emerald-800/30"
                : "bg-amber-500/20 text-[#733500] border-amber-600/30"
            }`}
          >
            {item.level}
          </span>
          {item.badge && (
            <span className="text-[10px] font-semibold text-[#524336] bg-black/5 border border-black/10 px-2 py-0.5 rounded-md">
              {item.badge}
            </span>
          )}
        </div>

        {/* Column 3: Class Title & Instructor / Hall Details (col-span-5) */}
        <div className="lg:col-span-5 min-w-0 space-y-0.5">
          <h4 className="text-base sm:text-lg font-black text-[#120D0A] tracking-tight">
            {item.title}
          </h4>
          <p className="text-xs text-[#524336]">
            Directed by{" "}
            {item.instructorHref ? (
              <Link
                href={item.instructorHref}
                className="font-bold text-[#A83800] hover:text-[#D9480F] hover:underline transition-colors"
              >
                {item.instructor}
              </Link>
            ) : (
              <span className="font-bold text-[#A83800]">{item.instructor}</span>
            )}
            {" • "}
            <span className="text-[#733500] font-medium">{item.room}</span>
          </p>
        </div>

        {/* Column 4: Action (col-span-2) */}
        <div className="lg:col-span-2 lg:text-right pt-2 lg:pt-0">
          <button
            type="button"
            onClick={() =>
              triggerQuickBookDrawer({
                title: item.title,
                time: item.time,
                level: item.level,
                instructor: item.instructor,
                isSocial: item.isSocial,
                day,
              })
            }
            className={
              item.isSocial
                ? "w-full md:w-auto inline-flex items-center justify-between md:justify-center gap-2 px-5 py-2.5 border border-[#11100E] text-[#11100E] hover:bg-[#11100E] hover:text-[#F5F2EB] text-xs font-bold uppercase tracking-[0.14em] rounded-full transition-colors cursor-pointer"
                : "w-full md:w-auto inline-flex items-center justify-between md:justify-center gap-2 px-5 py-2.5 bg-[#11100E] hover:bg-[#C83E2B] text-[#F5F2EB] text-xs font-bold uppercase tracking-[0.14em] rounded-full transition-colors cursor-pointer shadow-xs"
            }
          >
            <span>{item.ctaLabel || (item.isSocial ? "Join Social" : "Book Spot")}</span>
            <span aria-hidden="true">→</span>
          </button>
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
      className="cv-auto py-12 sm:py-16 bg-[#F4ECE1] border-b border-black/15 text-[#120D0A] scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/15">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                Official {VENUE_INFO.shortName} Residency • Thursdays &amp; Sundays
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#120D0A] leading-none">
              WEEKLY PROGRAMME{" "}
              <span className="font-display italic font-normal text-[#A83800] lowercase">
                lineup
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#524336] font-medium max-w-xl">
              Strictly Thursdays and Sundays at {VENUE_INFO.name}. High-energy partner rotations, authentic Cuban Casino footwork, and zero partner required.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-black/5 px-4 py-2.5 rounded-2xl border border-black/10 text-xs font-bold text-[#524336]">
            <MapPin className="h-4 w-4 text-[#A83800] shrink-0" />
            <span>
              {VENUE_INFO.name} • {VENUE_INFO.address}, {VENUE_INFO.postcode}
            </span>
          </div>
        </div>

        {/* ================= THURSDAY 4-COLUMN SWISS ARCHITECTURAL TABLE ================= */}
        <div id="timetable-thursday" className="space-y-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-black/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#120D0A] text-[#F4ECE1] text-xs font-black tracking-wider">
                  THURSDAY
                </span>
                <span className="text-xs font-bold text-[#524336]">
                  {thursdaySchedule.sessions.length} Sessions • Doors {thursdaySchedule.doorsTime} • {VENUE_INFO.floor}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#120D0A] mt-1">
                Thursday Havana Residency
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#524336] max-w-sm sm:text-right">
              {thursdaySchedule.subtitle}
            </p>
          </div>

          {/* Table Header (Desktop only) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#524336]/80 border-b border-black/10">
            <span className="col-span-2">Time</span>
            <span className="col-span-3">Level / Track</span>
            <span className="col-span-5">Class &amp; Faculty</span>
            <span className="col-span-2 text-right">Reservation</span>
          </div>

          <div className="divide-y divide-black/10 border-b border-black/10">
            {thursdaySchedule.sessions.map((item) => (
              <TimetableRow key={item.id} item={item} day="thursday" />
            ))}
          </div>
        </div>

        {/* ================= SUNDAY 4-COLUMN SWISS ARCHITECTURAL TABLE ================= */}
        <div id="timetable-sunday" className="space-y-4 pt-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-black/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#E59819] text-[#120D0A] text-xs font-black tracking-wider">
                  SUNDAY
                </span>
                <span className="text-xs font-bold text-[#524336]">
                  Doors {sundaySchedule.doorsTime} • Every Sunday • Masterclass &amp; Social
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#120D0A] mt-1">
                Sunday Havana Sessions — {VENUE_INFO.shortName}
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#524336] max-w-sm sm:text-right">
              {sundaySchedule.subtitle}
            </p>
          </div>

          {/* Table Header (Desktop only) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#524336]/80 border-b border-black/10">
            <span className="col-span-2">Time</span>
            <span className="col-span-3">Level / Track</span>
            <span className="col-span-5">Class &amp; Faculty</span>
            <span className="col-span-2 text-right">Reservation</span>
          </div>

          <div className="divide-y divide-black/10 border-b border-black/10">
            {sundaySchedule.sessions.map((item) => (
              <TimetableRow key={item.id} item={item} day="sunday" />
            ))}
          </div>
        </div>

        {/* Bottom Editorial Confidence Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-black/10 bg-black/[0.03]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-[#3A2D23] font-semibold">
            <span className="flex items-center gap-1.5 text-[#733500]">
              <Sparkles className="h-3.5 w-3.5" />
              {PASS_PRICING.PACK_SINGLE.priceDisplay} Drop-In Available
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              1st Class Free Trial
            </span>
            <span className="flex items-center gap-1.5 text-[#3A2D23]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#A83800]" />
              Zero Partner Required
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-[#3A2D23]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#A83800]" />
              Strict Lead &amp; Follow Balance
            </span>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-[#A83800] hover:text-black p-0 sm:px-2"
          >
            <Link href="/dashboard/schedule">
              Full Schedule &amp; Digital Passes →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
