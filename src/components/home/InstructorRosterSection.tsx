"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ExternalLink,
  MessageCircle,
  X,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sitePhotos } from "@/lib/site-photos";
import {
  INSTRUCTORS,
  type InstructorProfile,
  type InstructorCategory,
} from "@/lib/data/instructors";

interface InstructorRosterSectionProps {
  id?: string;
}

const CATEGORIES: { key: InstructorCategory | "all"; label: string }[] = [
  { key: "all", label: "All Artists" },
  { key: "cuban_weekly", label: "Weekly Cuban Team" },
  { key: "afro_timba", label: "Afro-Rumba & Timba Guest Artists" },
  { key: "boh_special", label: "BOH Venue Partner & Special Events" },
];

const ARTIST_GLOWS: Record<string, { bg: string; text: string }> = {
  enrique: {
    bg: "from-amber-500/25 via-rose-950/40 to-transparent",
    text: "ENRIQUE",
  },
  "moe-flex": {
    bg: "from-amber-400/25 via-emerald-950/40 to-transparent",
    text: "MOE FLEX",
  },
  justyna: {
    bg: "from-rose-500/25 via-amber-950/40 to-transparent",
    text: "JUSTYNA",
  },
  arturas: {
    bg: "from-orange-500/25 via-zinc-950/50 to-transparent",
    text: "ARTURAS",
  },
  jim: {
    bg: "from-amber-600/25 via-teal-950/40 to-transparent",
    text: "JIM",
  },
  "xaris-anna": {
    bg: "from-red-600/25 via-amber-950/30 to-transparent",
    text: "XARIS & ANNA",
  },
  "alex-spindlove": {
    bg: "from-purple-500/25 via-amber-950/30 to-transparent",
    text: "ALEX SPINDLOVE",
  },
};

export function InstructorRosterSection({ id = "instructors" }: InstructorRosterSectionProps) {
  const [activeCategory, setActiveCategory] = useState<InstructorCategory | "all">("all");
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorProfile | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const titleId = useId();

  // Escape key listener & body scroll lock
  useEffect(() => {
    if (!selectedInstructor) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedInstructor(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedInstructor]);

  // Deep linking: listen to hash changes for #instructors-{id}
  useEffect(() => {
    const checkHash = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      if (hash.startsWith("#instructors-")) {
        const instructorId = hash.replace("#instructors-", "");
        const found = INSTRUCTORS.find((i) => i.id === instructorId);
        if (found) {
          setSelectedInstructor(found);
        }
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const filteredInstructors =
    activeCategory === "all"
      ? INSTRUCTORS
      : INSTRUCTORS.filter((i) => i.categories.includes(activeCategory));

  return (
    <section
      id={id}
      className="cv-auto py-14 sm:py-20 bg-[#0c0908] border-b border-amber-500/15 scroll-mt-20 text-white"
      data-testid="instructor-roster-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-300 px-3.5 py-1 text-xs font-semibold mb-3 inline-flex items-center gap-1.5 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Resident Maestros & Guest Specialists
          </Badge>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Meet the Salsa Explosion Faculty{" "}
            <span className="block sm:inline font-display italic font-normal text-amber-300 sm:ml-2">
              Maestros &amp; Artists
            </span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            From Cuban-born lifetime achievers to international festival headliners, our passionate teaching team brings authentic Casino technique, high-energy Rueda circles, and warm South Coast community spirit to BOH Studios every week.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {CATEGORIES.map((cat) => {
              const count =
                cat.key === "all"
                  ? INSTRUCTORS.length
                  : INSTRUCTORS.filter((i) => i.categories.includes(cat.key as InstructorCategory)).length;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary-base text-white shadow-sm shadow-primary-base/20"
                      : "bg-black/60 text-zinc-300 hover:bg-black/80 hover:text-white border border-amber-500/20"
                  }`}
                >
                  {`${cat.label} (${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8-Card Responsive Character Posters Grid with Mobile Touch-Snap */}
        <div className="md:hidden flex items-center justify-between text-xs text-amber-300 font-bold px-1 mb-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Swipe Faculty (1/{filteredInstructors.length})
          </span>
          <span className="text-[11px] text-zinc-400">Swipe →</span>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 sm:gap-5 pb-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
          {filteredInstructors.map((instructor, idx) => {
            const glow = ARTIST_GLOWS[instructor.id] || {
              bg: "from-amber-500/20 via-zinc-900/40 to-transparent",
              text: instructor.name.toUpperCase(),
            };
            const photoSrc = sitePhotos.instructors[instructor.id as keyof typeof sitePhotos.instructors];
            return (
              <div
                key={instructor.id}
                id={`instructors-${instructor.id}`}
                data-artist-id={instructor.id}
                className={`art-card group relative flex flex-col justify-between rounded-t-[120px] sm:rounded-t-[140px] rounded-b-2xl border border-amber-500/20 bg-gradient-to-b from-[#140f0c] via-[#100b08] to-[#080605] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-amber-400/50 hover:shadow-[0_12px_35px_-8px_rgba(245,158,11,0.25)] w-[82vw] shrink-0 snap-center md:w-auto ${
                  idx >= 4 && !isMobileExpanded && activeCategory === "all" ? "hidden md:flex" : "flex"
                }`}
                data-testid={`instructor-card-${instructor.id}`}
              >
                <div>
                  {/* Theatrical Poster Frame */}
                  <div
                    className={`relative h-[250px] sm:h-[270px] w-full overflow-hidden p-3.5 flex flex-col justify-between bg-gradient-to-b ${glow.bg}`}
                  >
                    {/* Giant Oversized Background Typography */}
                    <div
                      className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
                      aria-hidden="true"
                    >
                      <span className="font-display italic font-black text-6xl sm:text-7xl uppercase tracking-tighter text-white/[0.05] whitespace-nowrap scale-110">
                        {glow.text}
                      </span>
                    </div>

                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-1.5 z-10">
                      <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white/90 border border-white/10 uppercase">
                        {instructor.origin}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-black/40 backdrop-blur-xs px-2 py-0.5 text-[10px] font-black uppercase text-amber-300 border border-amber-400/20">
                        [ OFFICIAL FACULTY ]
                      </span>
                    </div>

                    {/* Stylized Monogram Crest or Editorial Photo Centerpiece */}
                    <div className="relative z-10 my-auto flex flex-col items-center justify-center py-2">
                      <div className="relative">
                        <div className="absolute -inset-2 rounded-full bg-amber-500/20 blur-md group-hover:bg-amber-400/35 transition-all duration-500" />
                        <div className="relative h-18 w-18 rounded-2xl bg-gradient-to-tr from-[#1f1510] via-[#2c1d15] to-[#452b1e] border-2 border-amber-500/40 overflow-hidden flex flex-col items-center justify-center text-amber-200 font-display italic font-bold text-2xl shadow-xl group-hover:scale-105 transition-transform duration-500">
                          {photoSrc && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={photoSrc}
                              alt={instructor.name}
                              className="editorial-photo absolute inset-0 h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                              }}
                            />
                          )}
                          <span className="select-none">{instructor.avatarFallback}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Role / Accolade Badge */}
                    <div className="z-10 truncate">
                      <span className="rounded-md bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-amber-500/30 truncate block">
                        {instructor.badge}
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                      {instructor.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-200/90 line-clamp-1">
                      {instructor.role}
                    </p>

                    {/* Style Pills */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {instructor.styles.slice(0, 3).map((st) => (
                        <span
                          key={st}
                          className="rounded-md bg-white/[0.04] text-zinc-300 border border-white/10 px-2 py-0.5 text-[10px] font-semibold"
                        >
                          {st}
                        </span>
                      ))}
                    </div>

                    {/* Teaching Days */}
                    <div className="flex items-start gap-1.5 text-[11px] text-zinc-400 pt-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{instructor.teachingDays}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0">
                  <Button
                    type="button"
                    onClick={() => setSelectedInstructor(instructor)}
                    size="sm"
                    className="w-full text-xs font-bold bg-primary-base hover:bg-primary-hover text-white shadow-xs"
                  >
                    View Profile & Bookings →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Expand / Collapse Toggle for "All" Category */}
        {activeCategory === "all" && (
          <div className="mt-6 flex justify-center md:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              className="text-xs font-bold border-primary-base/40 text-primary-base hover:bg-primary-light/40 h-10 px-5 rounded-full shadow-xs"
            >
              {isMobileExpanded
                ? "Show Fewer Artists ↑"
                : "Show All 8 Maestros & Guest Artists (+4) ↓"}
            </Button>
          </div>
        )}
      </div>

      {/* Expanded Artist Spotlight Modal */}
      {selectedInstructor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in-0 duration-200"
          onClick={() => setSelectedInstructor(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#18110d] via-[#120d0a] to-[#080605] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
            data-testid="instructor-spotlight-modal"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedInstructor(null)}
              className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close spotlight modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-white/10 pb-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#251812] via-[#3a2217] to-[#5a3622] flex items-center justify-center text-amber-200 font-display italic font-bold text-2xl shadow-md border-2 border-amber-500/40 shrink-0">
                {selectedInstructor.avatarFallback}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary-base text-white text-[10px] font-bold">
                    {selectedInstructor.origin}
                  </Badge>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    {selectedInstructor.badge}
                  </span>
                </div>
                <h3 id={titleId} className="text-xl sm:text-2xl font-extrabold text-foreground font-display">
                  {selectedInstructor.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-amber-200/90">
                  {selectedInstructor.role}
                </p>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-4 py-5 text-xs sm:text-sm">
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 leading-relaxed font-medium text-foreground/90">
                {selectedInstructor.bio}
              </div>

              {/* Styles Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Specialties & Syllabus Focus
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInstructor.styles.map((style) => (
                    <span
                      key={style}
                      className="inline-flex items-center gap-1 rounded-lg border border-secondary-base/30 bg-secondary-light/40 px-2.5 py-1 text-xs font-semibold text-secondary-hover"
                    >
                      <CheckCircle2 className="h-3 w-3 text-secondary-base" />
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              {/* Teaching Schedule & Hub */}
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Calendar className="h-4 w-4 text-primary-base" />
                  <span>Teaching Schedule at BOH Studios</span>
                </div>
                <p className="text-xs text-muted-foreground dark:text-zinc-300 leading-relaxed pl-6">
                  {selectedInstructor.teachingDays}
                </p>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="pt-2 border-t border-border/60 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Button
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-11 shadow-sm"
                >
                  <a
                    href={`https://wa.me/447969633701?text=Hi%20Enrique%2C%20I%27d%20love%20to%20enquire%20about%20a%201-on-1%20private%20dance%20lesson%20with%20${encodeURIComponent(selectedInstructor.name)}!`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Book 1-on-1 Private via WhatsApp
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-primary-base/40 text-primary-base hover:bg-primary-light/40 font-bold text-xs h-11"
                >
                  <Link href={`/private-lessons?instructor=${selectedInstructor.id}`}>
                    <GraduationCap className="mr-1.5 h-4 w-4" />
                    View Coaching Packages
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-primary-base hover:text-primary-hover font-bold h-8 px-2"
                >
                  <Link href="/dashboard/schedule">
                    See All Weekly Classes at BOH Studios →
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground font-semibold h-8 px-2"
                >
                  <a
                    href={selectedInstructor.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    <InstagramIcon className="h-3.5 w-3.5" />
                    Follow {selectedInstructor.instagramHandle}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
