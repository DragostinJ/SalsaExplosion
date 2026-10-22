"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Camera,
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
      className="cv-auto py-14 sm:py-20 border-b border-border/70 bg-gradient-to-b from-card/30 via-background to-muted/20 scroll-mt-20"
      data-testid="instructor-roster-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge
            variant="outline"
            className="border-primary-base/30 bg-primary-light/50 text-primary-hover px-3.5 py-1 text-xs font-semibold mb-3 inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary-base" />
            Resident Maestros & Guest Specialists
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Meet the Salsa Explosion Faculty
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
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
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                  }`}
                >
                  {`${cat.label} (${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8-Card Responsive Trading Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredInstructors.map((instructor, idx) => (
            <div
              key={instructor.id}
              id={`instructors-${instructor.id}`}
              data-artist-id={instructor.id}
              className={`group relative flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-base/50 hover:shadow-xl hover:shadow-primary-base/5 ${
                idx >= 4 && !isMobileExpanded && activeCategory === "all" ? "hidden md:flex" : "flex"
              }`}
              data-testid={`instructor-card-${instructor.id}`}
            >
              <div className="space-y-3.5">
                {/* Photo Container / Graphic Fallback */}
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border border-border/60 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-rose-950/40 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1.5 z-10">
                    <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white/90 border border-white/10">
                      {instructor.origin}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/10 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-semibold text-white/80">
                      <Camera className="h-2.5 w-2.5" />
                      ✨ Official Faculty
                    </span>
                  </div>

                  {/* Stylized Monogram Centerpiece */}
                  <div className="my-auto flex flex-col items-center justify-center py-2">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary-base via-rose-600 to-accent-tangerine flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-white/20 group-hover:scale-105 transition-transform duration-300">
                      {instructor.avatarFallback}
                    </div>
                  </div>

                  <div className="z-10 truncate">
                    <span className="rounded-md bg-rose-950/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-rose-200 border border-rose-800/40 truncate block">
                      {instructor.badge}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-foreground tracking-tight group-hover:text-primary-base transition-colors">
                    {instructor.name}
                  </h3>
                  <p className="text-xs font-semibold text-text-muted line-clamp-1">
                    {instructor.role}
                  </p>

                  {/* Style Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {instructor.styles.slice(0, 3).map((st) => (
                      <span
                        key={st}
                        className="rounded-md bg-muted text-foreground/80 border border-border/60 px-1.5 py-0.5 text-[10px] font-semibold"
                      >
                        {st}
                      </span>
                    ))}
                  </div>

                  {/* Teaching Days */}
                  <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground pt-1.5">
                    <Calendar className="h-3.5 w-3.5 text-secondary-base shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{instructor.teachingDays}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border/60 mt-4 flex items-center gap-2">
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
          ))}
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-border/60 pb-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary-base via-rose-600 to-accent-tangerine flex items-center justify-center text-white font-black text-2xl shadow-md border-2 border-white/20 shrink-0">
                {selectedInstructor.avatarFallback}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary-base text-white text-[10px] font-bold">
                    {selectedInstructor.origin}
                  </Badge>
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                    {selectedInstructor.badge}
                  </span>
                </div>
                <h3 id={titleId} className="text-xl sm:text-2xl font-extrabold text-foreground">
                  {selectedInstructor.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-text-muted">
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
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
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
