"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronDown, ArrowRight, Camera, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACADEMY_GALLERY_PHOTOS,
  ACADEMY_FAQS,
  VENUE_INFO,
  type AcademyGalleryPhoto,
} from "@/lib/academy-data";

export function ArtHouseGallerySection() {
  const [selectedPhoto, setSelectedPhoto] = useState<AcademyGalleryPhoto | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section
      id="gallery"
      data-testid="art-house-gallery-section"
      className="cv-auto py-14 sm:py-20 bg-[#080605] border-t border-white/10 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* theplace.org.uk-inspired 2-Card Photo-Led Classes Gateway */}
        <div data-testid="theplace-classes-gateway" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 block mb-1">
                BOURNEMOUTH CUBAN CULTURAL INSTITUTION • EXPLORE SALSA EXPLOSION
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Weekly Classes &amp;{" "}
                <span className="font-display italic font-normal text-amber-300 lowercase">
                  social fiestas
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-md">
              Weekly Thursday &amp; Sunday classes (£12 for 1 class / £14 for 2 classes at the door), online festival passes, and interactive Cuban dance &amp; music tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Thursday */}
            <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120d0a] overflow-hidden transition-all duration-500 hover:border-amber-400/50">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80"
                  alt="Thursday Cuban Salsa, Musicality & Rueda at BOH Studios Bournemouth"
                  loading="lazy"
                  decoding="async"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a] via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-black/80 backdrop-blur-xs border border-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    EVERY THURSDAY • £12 (1 CLASS) / £14 (2 CLASSES) AT DOOR
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                    Thursday Cuban Salsa, Musicality &amp; Rueda
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">
                    19:00 Beginners &amp; Solo Musicality • 20:15 Improvers, Intermediate &amp; Rueda • 21:30 Havana Social Fiesta.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    19:00 – LATE
                  </span>
                  <Link
                    href="/dashboard/schedule#timetable-thursday"
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-300 hover:text-white transition-colors"
                  >
                    <span>Explore Thursday Lineup</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Sunday */}
            <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120d0a] overflow-hidden transition-all duration-500 hover:border-amber-400/50">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80"
                  alt="Sunday Masterclass & Havana Social Fiesta at BOH Studios Bournemouth"
                  loading="lazy"
                  decoding="async"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a] via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-black/80 backdrop-blur-xs border border-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    EVERY SUNDAY • £12 MASTERCLASS AT DOOR
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                    Sunday Masterclass &amp; Havana Social Fiesta
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">
                    18:30 All-Levels Cuban Workshop &amp; Rueda Circle followed by our 19:30 Sunday Social Fiesta at BOH Studios.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    18:30 – LATE
                  </span>
                  <Link
                    href="/dashboard/schedule#timetable-sunday"
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-300 hover:text-white transition-colors"
                  >
                    <span>Explore Sunday Lineup</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* The Place 4-Pillar Photo Gateway Grid */}
          <div data-testid="theplace-four-pillars" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
            {/* Pillar 1: Weekly Classes */}
            <Link
              href="/dashboard/schedule"
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120d0a] overflow-hidden transition-all duration-500 hover:border-amber-400/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80"
                  alt="Weekly Cuban Salsa & Rueda de Casino Classes at BOH Studios Bournemouth"
                  loading="lazy"
                  decoding="async"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a] via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                    PAY AT THE DOOR • £12 / £14
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    Thu &amp; Sun Classes
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    £12 for 1 class or £14 for 2 classes at BOH Studios. No prior booking or partner required.
                  </p>
                </div>
                <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                  View Timetable →
                </span>
              </div>
            </Link>

            {/* Pillar 2: Festivals & Congresses */}
            <Link
              href="/events"
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120d0a] overflow-hidden transition-all duration-500 hover:border-amber-400/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/made-in-cuba-2026-poster.jpg"
                  alt="Made in Cuba Dance Weekend 2026 Official Festival Passes"
                  loading="lazy"
                  decoding="async"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a] via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                    BOOK ONLINE • OFFICIAL TICKETS
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    Festivals &amp; Congresses
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Book official online passes for Made in Cuba 2026 (4–6 Dec), Halloween Party, and SB&amp;K Nights.
                  </p>
                </div>
                <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                  Book Event Passes →
                </span>
              </div>
            </Link>

            {/* Pillar 3: Rueda Call Dictionary */}
            <Link
              href="/dashboard/rueda"
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120d0a] overflow-hidden transition-all duration-500 hover:border-amber-400/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/thursdays-moe-flex-poster.png"
                  alt="Rueda de Casino Call Dictionary and Cuban Dance Syllabus"
                  loading="lazy"
                  decoding="async"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a] via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                    40+ CUBAN CIRCLE CALLS
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    Rueda Call Dictionary
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Learn authentic Havana circle calls, hand signals, and our 4-tier Cuban Casino reference.
                  </p>
                </div>
                <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                  Explore Rueda Calls →
                </span>
              </div>
            </Link>

            {/* Pillar 4: Timba Song Trainer */}
            <Link
              href="/music"
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120d0a] overflow-hidden transition-all duration-500 hover:border-amber-400/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/danza-2026-2027-calendar.png"
                  alt="Interactive Timba Song Trainer and Cuban Rhythm HUD"
                  loading="lazy"
                  decoding="async"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a] via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                    INTERACTIVE AUDIO COCKPIT
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    Timba Song Trainer
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Practice timing with live clave click, 8-count rhythm bar, and Leader/Follower cues.
                  </p>
                </div>
                <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                  Open Song Trainer →
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Part 1: Curated Exhibition Photo Gallery (Inspired by The Place) */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300">
                <Camera className="h-3.5 w-3.5" />
                <span>Exhibition Photo Archive • {VENUE_INFO.name}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
                INSIDE THE{" "}
                <span className="font-display italic font-normal text-amber-300 lowercase">
                  cuban circle
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Captured on Thursday and Sunday nights at {VENUE_INFO.name}. Real dancers, live Rueda de Casino calls, and authentic Havana musicality in the heart of Bournemouth.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl"
              >
                <a
                  href={VENUE_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow {VENUE_INFO.instagramHandle} →
                </a>
              </Button>
            </div>
          </div>

          {/* 4-Frame Asymmetric Architectural Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ACADEMY_GALLERY_PHOTOS.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="group relative flex flex-col text-left rounded-2xl border border-white/10 bg-[#120d0a] overflow-hidden transition-all duration-500 hover:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    loading="lazy"
                    decoding="async"
                    className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080605] via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-md bg-black/75 backdrop-blur-xs border border-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                      {photo.kicker}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-zinc-300 line-clamp-2 mt-1 leading-relaxed">
                      {photo.caption}
                    </p>
                  </div>
                  <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                    Inspect Frame →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Part 2: First-Timer & Academy FAQ Accordion (Rich Structured Answers) */}
        <div className="rounded-3xl border border-white/10 bg-[#120d0a] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Essential Visitor Information</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Frequently Asked Questions
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Everything you need to know before your first Thursday or Sunday session at {VENUE_INFO.name} ({VENUE_INFO.address}, {VENUE_INFO.postcode}).
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs h-10 px-5 rounded-xl"
                >
                  <Link href="/dashboard/schedule#timetable">
                    View Thursday &amp; Sunday Timetable
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs h-10 px-4 rounded-xl"
                >
                  <Link href="/dashboard/rueda">
                    Explore Rueda Dictionary →
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 divide-y divide-white/10 border-t border-b border-white/10">
              {ACADEMY_FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={faq.question} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left text-sm sm:text-base font-bold text-white hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-amber-300 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed pr-6">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discrete Studio Operations link for teachers and staff */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
            <span>
              {VENUE_INFO.name} • {VENUE_INFO.address}, {VENUE_INFO.postcode}
            </span>
            <Link
              href="/admin/operations"
              className="font-bold text-amber-300 hover:underline inline-flex items-center gap-1"
            >
              Academy Teaching &amp; Operations Portal →
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl border border-white/15 bg-[#120d0a] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] w-full bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Close photo view"
                className="absolute top-3 right-3 rounded-full bg-black/80 p-2 text-white hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                  {selectedPhoto.kicker}
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {selectedPhoto.title}
                </h4>
                <p className="text-xs text-zinc-300 mt-1">
                  {selectedPhoto.caption}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shrink-0"
              >
                <Link href="/dashboard/schedule#timetable" onClick={() => setSelectedPhoto(null)}>
                  Book Spot →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
