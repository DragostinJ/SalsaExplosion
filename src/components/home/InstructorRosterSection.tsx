"use client";

import { useState, useEffect, useId, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  ExternalLink,
  MessageCircle,
  X,
  CheckCircle2,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
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

const SPOTLIGHT_GRADIENTS: Record<string, string> = {
  enrique: "from-amber-500/25 via-amber-950/40 to-black/60",
  justyna: "from-amber-400/20 via-rose-950/30 to-black/60",
  arturas: "from-amber-500/20 via-amber-950/35 to-black/60",
  "moe-flex": "from-yellow-400/25 via-amber-950/40 to-black/60",
  jim: "from-orange-500/20 via-amber-950/30 to-black/60",
  xaris: "from-red-500/25 via-orange-950/35 to-black/60",
  anna: "from-amber-400/20 via-rose-950/30 to-black/60",
  "alex-spindlove": "from-amber-600/20 via-stone-900/40 to-black/60",
};

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
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);
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

  const handleCategoryChange = (catKey: InstructorCategory | "all") => {
    setActiveCategory(catKey);
    setActiveMobileIndex(0);
    reelRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const handleReelScroll = () => {
    const el = reelRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    if (!firstCard) return;
    const cardStride = firstCard.offsetWidth + 16; // 16px = gap-4
    if (cardStride <= 0) return;
    const index = Math.round(el.scrollLeft / cardStride);
    const clamped = Math.max(0, Math.min(filteredInstructors.length - 1, index));
    if (clamped !== activeMobileIndex) {
      setActiveMobileIndex(clamped);
    }
  };

  const scrollToCard = (targetIndex: number) => {
    const el = reelRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(filteredInstructors.length - 1, targetIndex));
    const firstCard = el.firstElementChild as HTMLElement | null;
    if (firstCard) {
      const cardStride = firstCard.offsetWidth + 16;
      el.scrollTo({ left: clamped * cardStride, behavior: "smooth" });
    }
    setActiveMobileIndex(clamped);
  };

  return (
    <section
      id={id}
      className="cv-auto py-14 sm:py-20 bg-canvas border-b border-line scroll-mt-20 text-ivory"
      data-testid="instructor-roster-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Meet the Salsa Explosion Faculty{" "}
            <span className="block sm:inline font-display italic font-normal text-amber-300 sm:ml-2">
              Maestros &amp; Artists
            </span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-ivory-muted leading-relaxed">
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
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-brand text-white shadow-xs"
                      : "bg-surface-3 text-ivory-muted hover:bg-surface-2 hover:text-ivory border border-gold/20"
                  }`}
                >
                  {`${cat.label} (${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Snap Reel Header Controls (< 640px) */}
        {filteredInstructors.length > 1 && (
          <div className="flex sm:hidden items-center justify-between mb-3 px-0.5">
            <span className="text-xs font-bold text-amber-300/90 tracking-wide">
              Artist {Math.min(activeMobileIndex + 1, filteredInstructors.length)} of {filteredInstructors.length} • Swipe →
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous instructor"
                disabled={activeMobileIndex <= 0}
                onClick={() => scrollToCard(activeMobileIndex - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-surface-2 text-ivory hover:border-gold hover:text-gold disabled:opacity-35 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next instructor"
                disabled={activeMobileIndex >= filteredInstructors.length - 1}
                onClick={() => scrollToCard(activeMobileIndex + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-surface-2 text-ivory hover:border-gold hover:text-gold disabled:opacity-35 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Snap Reel / Desktop 4-Column Architectural Grid */}
        <div
          ref={reelRef}
          onScroll={handleReelScroll}
          className="flex sm:grid overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none gap-4 sm:gap-6 pb-2 sm:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {filteredInstructors.map((instructor) => {
            const photoSrc = sitePhotos.instructors[instructor.id as keyof typeof sitePhotos.instructors];
            return (
              <div
                key={instructor.id}
                id={`instructors-${instructor.id}`}
                data-artist-id={instructor.id}
                className="art-card group relative flex flex-col justify-between rounded-2xl border border-line bg-surface-2 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_12px_35px_-8px_rgba(245,158,11,0.2)] w-[82vw] max-w-[310px] sm:w-full sm:max-w-none shrink-0 sm:shrink snap-center sm:snap-align-none"
                data-testid={`instructor-card-${instructor.id}`}
              >
                <div>
                  {/* Bespoke Architectural Typographic Portrait Plate */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-3 border-b border-line">
                    {/* Fine 1px Architectural Grid Lines & Stage Crosshairs */}
                    <div className="absolute inset-0 pointer-events-none border border-white/[0.04]">
                      <div className="absolute top-2.5 right-2.5 text-white/20 text-xs font-mono select-none">+</div>
                      <div className="absolute bottom-2.5 right-2.5 text-white/20 text-xs font-mono select-none">+</div>
                      <div className="absolute inset-x-0 top-1/2 border-t border-white/[0.03]" />
                    </div>

                    {/* Warm Directional Spotlight Wash Unique to Each Artist */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        SPOTLIGHT_GRADIENTS[instructor.id] || "from-gold/15 via-stone-900/40 to-transparent"
                      } pointer-events-none`}
                    />

                    {/* Authentic Image if Available / Error-Safe */}
                    {photoSrc && (
                      <Image
                        src={photoSrc}
                        alt={instructor.name}
                        fill
                        sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 25vw"
                        className="editorial-photo relative z-10 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    )}

                    {/* Museum-Grade Typographic Monogram */}
                    <div className="absolute inset-0 flex items-center justify-center font-display italic font-bold text-4xl sm:text-5xl text-amber-200/90 select-none z-0">
                      {instructor.avatarFallback}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-black/30 pointer-events-none z-10" />

                    {/* Top Right Origin Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                      <span className="rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-white/90 border border-white/10 uppercase">
                        {instructor.origin}
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                      {instructor.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-200/90 line-clamp-1 uppercase tracking-wide">
                      {instructor.role}
                    </p>

                    {/* Style Pills */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {instructor.styles.slice(0, 3).map((st) => (
                        <span
                          key={st}
                          className="rounded-md bg-white/[0.04] text-ivory-muted border border-white/10 px-2 py-0.5 text-xs font-semibold"
                        >
                          {st}
                        </span>
                      ))}
                    </div>

                    {/* Teaching Days */}
                    <div className="flex items-start gap-1.5 text-[11px] text-ivory-muted pt-1">
                      <Calendar className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
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
                    className="w-full text-xs font-bold bg-brand hover:bg-brand-hover text-white shadow-xs"
                  >
                    View Profile & Bookings →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Pagination Dots & Bottom Arrow Controls (< 640px) */}
        {filteredInstructors.length > 1 && (
          <div className="mt-4 flex sm:hidden items-center justify-between px-1">
            <button
              type="button"
              aria-label="Previous artist card"
              disabled={activeMobileIndex <= 0}
              onClick={() => scrollToCard(activeMobileIndex - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-surface-2 text-ivory hover:border-gold hover:text-gold disabled:opacity-35 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {filteredInstructors.map((inst, idx) => {
                const isCurrent = idx === activeMobileIndex;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    aria-label={`View ${inst.name}`}
                    onClick={() => scrollToCard(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCurrent ? "w-6 bg-gold" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              aria-label="Next artist card"
              disabled={activeMobileIndex >= filteredInstructors.length - 1}
              onClick={() => scrollToCard(activeMobileIndex + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-surface-2 text-ivory hover:border-gold hover:text-gold disabled:opacity-35 disabled:pointer-events-none transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gold/30 bg-surface-2 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
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
              <div className="h-16 w-16 rounded-2xl bg-surface-3 flex items-center justify-center text-amber-200 font-display italic font-bold text-2xl shadow-md border-2 border-gold/40 shrink-0">
                {selectedInstructor.avatarFallback}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary-base text-white text-xs font-bold">
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
                <p className="text-xs text-ivory-muted leading-relaxed pl-6">
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
