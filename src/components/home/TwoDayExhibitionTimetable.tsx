"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerQuickBookDrawer } from "@/components/booking/QuickBookDrawer";

interface ClassRow {
  time: string;
  level: string;
  title: string;
  instructor: string;
  instructorHref?: string;
  badge?: string;
  isSocial?: boolean;
}

const THURSDAY_CLASSES: ClassRow[] = [
  {
    time: "19:00",
    level: "ALL LEVELS",
    title: "Solo Salsa: Musicality, Pasitos & Rhythm",
    instructor: "Moe Flex",
    instructorHref: "#instructors-moe-flex",
    badge: "Open to Everyone",
  },
  {
    time: "19:00",
    level: "BEGINNERS",
    title: "Cuban Salsa Beginners Foundation",
    instructor: "Maestro Enrique Perez Valdes",
    instructorHref: "#instructors-enrique",
    badge: "1st Timers Welcome",
  },
  {
    time: "20:15",
    level: "IMPROVERS",
    title: "Cuban Salsa Improvers Partnerwork",
    instructor: "Justyna",
    instructorHref: "#instructors-justyna",
    badge: "Guapea & Turns",
  },
  {
    time: "20:15",
    level: "INTERMEDIATE",
    title: "Cuban Salsa Intermediates & Rueda de Casino",
    instructor: "Arturas, Moe Flex & Jim",
    instructorHref: "#instructors-arturas",
    badge: "Fast Rueda Circles",
  },
  {
    time: "21:30 – Late",
    level: "ALL DANCERS",
    title: "Thursday Havana Social Fiesta",
    instructor: "DJ Enrique & Resident Team",
    instructorHref: "#instructors-enrique",
    badge: "Social Dance Practice",
    isSocial: true,
  },
];

const SUNDAY_CLASSES: ClassRow[] = [
  {
    time: "18:30",
    level: "ALL LEVELS & IMPROVERS",
    title: "Sunday Cuban Salsa & Rueda Masterclass",
    instructor: "Maestro Enrique Perez Valdes & Team",
    instructorHref: "#instructors-enrique",
    badge: "Open Circle & Partnerwork",
  },
  {
    time: "19:30 – Late",
    level: "ALL DANCERS",
    title: "Sunday Havana Social Fiesta",
    instructor: "Maestro Enrique",
    instructorHref: "#instructors-enrique",
    badge: "Pure Timba, Son & Rueda Circles",
    isSocial: true,
  },
];

const RUEDA_CALLS = [
  {
    name: "Setenta (70)",
    level: "Improver / Intermediate",
    signal: "7 Fingers Signal",
    description: "Classic hammerlock turn combination into back-to-back cross break — Improver/Intermediate staple.",
    callerCue: "¡SE-TEN-TA!",
  },
  {
    name: "Dile Que No",
    level: "Beginner Foundation",
    signal: "Palm Open Break",
    description: "The heartbeat cross-body open break of Cuban Casino — leads the transition into every dynamic Rueda figure.",
    callerCue: "¡DILE QUE NO!",
  },
  {
    name: "Dame Dos",
    level: "All Dancers",
    signal: "Two Fingers Raised",
    description: "Skip one partner and rotate two places down the Rueda circle with high-energy clap & turn!",
    callerCue: "¡DAME DOS CON CHUA!",
  },
];

function TimetableRow({
  item,
  day,
}: {
  item: ClassRow;
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
            <span className="text-[#733500] font-medium">BOH Studios Main Hall</span>
          </p>
        </div>

        {/* Column 4: Action (col-span-2) */}
        <div className="lg:col-span-2 lg:text-right pt-2 lg:pt-0">
          <Button
            size="sm"
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
            className="w-full lg:w-auto h-9 px-5 text-xs font-black uppercase tracking-wider bg-[#120D0A] hover:bg-black text-[#F4ECE1] rounded-full shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            {item.isSocial ? "JOIN FIESTA →" : "BOOK SPOT →"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TwoDayExhibitionTimetable() {
  const [activeRuedaIdx, setActiveRuedaIdx] = useState(0);
  const activeCall = RUEDA_CALLS[activeRuedaIdx];

  return (
    <section id="timetable" className="cv-auto py-12 sm:py-16 bg-[#F4ECE1] border-b border-black/15 text-[#120D0A] scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/15">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                Official BOH Studios Residency • Thursdays &amp; Sundays
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#120D0A] leading-none">
              WEEKLY PROGRAMME <span className="font-display italic font-normal text-[#A83800] lowercase">lineup</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#524336] font-medium max-w-xl">
              Strictly Thursdays and Sundays at BOH Studios Bournemouth. High-energy partner rotations, authentic Cuban Casino footwork, and zero partner required.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-black/5 px-4 py-2.5 rounded-2xl border border-black/10 text-xs font-bold text-[#524336]">
            <MapPin className="h-4 w-4 text-[#A83800] shrink-0" />
            <span>BOH Studios Bournemouth • 104 Commercial Rd, The Triangle, BH2 5LR</span>
          </div>
        </div>

        {/* ================= THURSDAY 4-COLUMN SWISS ARCHITECTURAL TABLE ================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-black/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#120D0A] text-[#F4ECE1] text-xs font-black tracking-wider">
                  THURSDAY
                </span>
                <span className="text-xs font-bold text-[#524336]">
                  5 Sessions • Doors 18:45 • Canadian Sprung Maple Floor
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#120D0A] mt-1">
                Thursday Havana Residency
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#524336] max-w-sm sm:text-right">
              Beginners Foundation to Advanced Partnerwork &bull; Canadian Sprung Maple Floor
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
            {THURSDAY_CLASSES.map((item, idx) => (
              <TimetableRow key={`thursday-${idx}`} item={item} day="thursday" />
            ))}
          </div>
        </div>

        {/* ================= SUNDAY 4-COLUMN SWISS ARCHITECTURAL TABLE ================= */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-black/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#E59819] text-[#120D0A] text-xs font-black tracking-wider">
                  SUNDAY
                </span>
                <span className="text-xs font-bold text-[#524336]">
                  Doors 18:15 • Every Sunday • Masterclass &amp; Social
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#120D0A] mt-1">
                Sunday Havana Sessions — BOH Studios
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#524336] max-w-sm sm:text-right">
              Weekly Masterclass &amp; Havana Social Fiesta &bull; Pure Timba &amp; Son Cubano
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
            {SUNDAY_CLASSES.map((item, idx) => (
              <TimetableRow key={`sunday-${idx}`} item={item} day="sunday" />
            ))}
          </div>
        </div>

        {/* Interactive "Rueda Call of the Week" Strip */}
        <div className="p-4 rounded-2xl border border-black/15 bg-black/[0.04] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#120D0A]">
              01 / RUEDA • This Week&apos;s Rueda Call at BOH Studios
            </span>
            <Link
              href="/dashboard/rueda"
              className="text-xs font-extrabold text-[#A83800] hover:text-[#D9480F] hover:underline"
            >
              Explore Full Rueda Dictionary (40+ Calls) →
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {RUEDA_CALLS.map((call, idx) => (
              <button
                key={call.name}
                type="button"
                onClick={() => setActiveRuedaIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeRuedaIdx === idx
                    ? "bg-[#120D0A] text-[#F4ECE1] shadow-xs"
                    : "bg-black/5 text-[#524336] hover:bg-black/10 hover:text-[#120D0A]"
                }`}
              >
                {call.name}
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-800 text-sm">
                  {activeCall.callerCue}
                </span>
                <span className="font-bold text-[#120D0A]">{activeCall.name}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-black/5 text-[#524336]">
                  {activeCall.level}
                </span>
              </div>
              <p className="text-[#524336] text-[11px] font-medium leading-relaxed">
                {activeCall.description}
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-500/15 border border-amber-600/20 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-center">
              {activeCall.signal}
            </span>
          </div>
        </div>

        {/* Bottom Editorial Confidence Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-black/10 bg-black/[0.03]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-[#3A2D23] font-semibold">
            <span className="flex items-center gap-1.5 text-[#733500]">
              <Sparkles className="h-3.5 w-3.5" />
              £10 Drop-In Available
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

          <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-[#A83800] hover:text-black p-0 sm:px-2">
            <Link href="/dashboard/schedule">
              Full Schedule &amp; Digital Passes →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
