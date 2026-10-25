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
                  <Link href="#timetable">
                    Book Thursday or Sunday Spot
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
                <Link href="#timetable" onClick={() => setSelectedPhoto(null)}>
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
