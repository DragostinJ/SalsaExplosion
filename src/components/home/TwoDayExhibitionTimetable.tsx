"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    badge: "Casino & Rueda Masterclass",
  },
  {
    time: "19:30 – Late",
    level: "ALL DANCERS",
    title: "Sunday Havana Social Fiesta & Rueda Circles",
    instructor: "Maestro Enrique",
    instructorHref: "#instructors-enrique",
    badge: "Cuban Timba & Son Social",
    isSocial: true,
  },
];

export function TwoDayExhibitionTimetable() {
  const [activeDay, setActiveDay] = useState<"thursday" | "sunday">("thursday");

  const currentClasses = activeDay === "thursday" ? THURSDAY_CLASSES : SUNDAY_CLASSES;

  return (
    <section className="cv-auto py-12 sm:py-16 bg-[#F4ECE1] border-b border-black/15 text-[#120D0A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Architectural Day Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/15">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                Official BOH Studios Residency • Thursdays &amp; Sundays
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#120D0A] leading-none">
              Thursday &amp; Sunday <span className="font-display italic font-normal text-[#A83800]">Havana Lineup</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#524336] font-medium max-w-xl">
              Strictly Thursdays and Sundays at BOH Studios Bournemouth. High-energy partner rotations, authentic Cuban Casino footwork, and zero partner required.
            </p>
          </div>

          {/* Monumental Day Tabs */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-black/5 p-1.5 rounded-2xl border border-black/10">
            <button
              type="button"
              onClick={() => setActiveDay("thursday")}
              className={`px-4 sm:px-5 py-3 rounded-xl text-left transition-all ${
                activeDay === "thursday"
                  ? "bg-[#120D0A] text-[#F4ECE1] shadow-lg font-black"
                  : "text-[#524336] hover:text-[#120D0A] hover:bg-black/5 font-bold"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg uppercase tracking-tight leading-none font-black">THU</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                  activeDay === "thursday" ? "bg-amber-400 text-black font-black" : "bg-black/10 text-[#524336]"
                }`}>
                  5 Sessions
                </span>
              </div>
              <div className="text-[10px] opacity-90 mt-1 font-semibold">Doors 6:45 PM • 19:00</div>
            </button>
            <button
              type="button"
              onClick={() => setActiveDay("sunday")}
              className={`px-4 sm:px-5 py-3 rounded-xl text-left transition-all ${
                activeDay === "sunday"
                  ? "bg-[#120D0A] text-[#F4ECE1] shadow-lg font-black"
                  : "text-[#524336] hover:text-[#120D0A] hover:bg-black/5 font-bold"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg uppercase tracking-tight leading-none font-black">SUN</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                  activeDay === "sunday" ? "bg-amber-400 text-black font-black" : "bg-black/10 text-[#524336]"
                }`}>
                  Fiesta Night
                </span>
              </div>
              <div className="text-[10px] opacity-90 mt-1 font-semibold">Doors 6:15 PM • 18:30</div>
            </button>
          </div>
        </div>

        {/* Venue Context Header Bar */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#524336] border-b border-black/10">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#A83800] shrink-0" />
            <span className="font-semibold text-[#120D0A]">
              BOH Studios Bournemouth (104 Commercial Rd, The Triangle, BH2 5LR)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#A83800] shrink-0" />
            <span>
              {activeDay === "thursday"
                ? "Thursdays: 7:00 PM – Late • Canadian Sprung Maple Floor"
                : "Sundays: 6:30 PM – Late • Masterclass & Cuban Social"}
            </span>
          </div>
        </div>

        {/* Personal Maestro Handwritten Note */}
        {activeDay === "thursday" ? (
          <div className="pt-4 pb-1">
            <p className="font-hand text-xl sm:text-2xl text-rose-800 -rotate-1">
              “Brand new? Start right here with me on Thursday at 7pm — zero partner needed, we rotate and laugh all night!” — Enrique 🇨🇺
            </p>
          </div>
        ) : (
          <div className="pt-4 pb-1">
            <p className="font-hand text-xl sm:text-2xl text-amber-900 -rotate-1">
              “Our Sunday evening family social — the best way to finish your weekend in Bournemouth!” — Enrique
            </p>
          </div>
        )}

        {/* Architectural Horizontal Rows */}
        <div className="divide-y divide-black/10 border-b border-black/10">
          {currentClasses.map((item, idx) => (
            <div
              key={`${activeDay}-${idx}`}
              className="py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-black/[0.03] px-2 sm:px-3 rounded-xl transition-colors"
            >
              {/* Left Column: Timestamp & Level Badge */}
              <div className="flex items-center gap-3 shrink-0 sm:min-w-[240px]">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#120D0A] tracking-tight">
                  {item.time}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    item.isSocial
                      ? "bg-emerald-800/15 text-emerald-950 border-emerald-800/30"
                      : "bg-amber-500/20 text-[#733500] border-amber-600/30"
                  }`}
                >
                  {item.level}
                </span>
              </div>

              {/* Center Column: Class Title & Instructor Tag */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-[#120D0A] tracking-tight">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="text-[10px] font-semibold text-[#524336] bg-black/5 border border-black/10 px-2 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </div>
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
                </p>
              </div>

              {/* Right Column: Instant Action Pill */}
              <div className="shrink-0 flex items-center justify-end">
                <Button
                  asChild
                  size="sm"
                  className="w-full sm:w-auto h-10 px-5 text-xs font-black uppercase tracking-wider bg-[#120D0A] hover:bg-black text-[#F4ECE1] rounded-full shadow-sm transition-transform active:scale-95"
                >
                  <Link href="/dashboard/schedule">
                    <span>{item.isSocial ? "JOIN FIESTA →" : "BOOK SPOT →"}</span>
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Dual Day Quick Switch Strip */}
        {activeDay === "thursday" ? (
          <div className="mt-4 p-4 rounded-xl border border-amber-700/20 bg-amber-600/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-800 text-base">🇨🇺</span>
              <span className="text-[#120D0A]">
                <strong>Sunday Havana Sessions:</strong> 18:30 Masterclass &amp; 19:30 Social Fiesta with Maestro Enrique.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveDay("sunday")}
              className="px-3.5 py-1.5 rounded-lg bg-[#120D0A] hover:bg-black text-[#F4ECE1] font-extrabold text-[11px] uppercase tracking-wider transition-colors shrink-0"
            >
              View Sunday Schedule (2 Sessions) →
            </button>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl border border-amber-700/20 bg-amber-600/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-800 text-base">🇨🇺</span>
              <span className="text-[#120D0A]">
                <strong>Thursday Cuban Nights:</strong> 4 Levels of Salsa, Moe Flex Pasitos, and Social till late.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveDay("thursday")}
              className="px-3.5 py-1.5 rounded-lg bg-[#120D0A] hover:bg-black text-[#F4ECE1] font-extrabold text-[11px] uppercase tracking-wider transition-colors shrink-0"
            >
              View Thursday Schedule (5 Sessions) →
            </button>
          </div>
        )}

        {/* Bottom Editorial Confidence Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-black/10 bg-black/[0.03]">
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
