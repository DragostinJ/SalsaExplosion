"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACADEMY_GALLERY_PHOTOS,
  VENUE_INFO,
  type AcademyGalleryPhoto,
} from "@/lib/academy-data";

export function ArtHouseGallerySection() {
  return (
    <section
      id="gallery"
      data-testid="art-house-gallery-section"
      className="cv-auto py-12 sm:py-16 bg-canvas border-b border-white/10 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* theplace.org.uk-inspired 4-Pillar Photo Gateways ("Explore Salsa Explosion") */}
        <div data-testid="theplace-classes-gateway" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 block mb-1">
                BOURNEMOUTH CUBAN CULTURAL INSTITUTION • EXPLORE SALSA EXPLOSION
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Explore Salsa Explosion
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ivory-muted max-w-md">
              Weekly Classes, Flagship Festivals &amp; Authentic Cuban Culture. £12 for 1 class / £14 for 2 classes at the door.
            </p>
          </div>

          {/* The Place 4-Pillar Photo Gateway Grid (Pure Action Photography) */}
          <div
            data-testid="theplace-four-pillars"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Gateway 01: Weekly Classes */}
            <Link
              href="/dashboard/schedule"
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-surface-2 overflow-hidden transition-all duration-500 hover:border-amber-400/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                <Image
                  src="https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=1000&q=80"
                  alt="Weekly Cuban Salsa & Rueda de Casino Classes at BOH Studios Bournemouth"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-300">
                    PAY AT THE DOOR • £12 / £14
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    Weekly Classes &amp; Socials
                  </h3>
                  <p className="text-xs text-ivory-muted mt-1 leading-relaxed">
                    Thursdays (19:00 &amp; 20:15) and Sundays (18:30) at BOH Studios. £12 for 1 class or £14 for 2 classes at the door. No partner needed.
                  </p>
                </div>
                <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                  View Thu &amp; Sun Timetable →
                </span>
              </div>
            </Link>

            {/* Gateway 02: Festivals & Congresses */}
            <Link
              href="/events"
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-surface-2 overflow-hidden transition-all duration-500 hover:border-amber-400/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                <Image
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80"
                  alt="Made in Cuba Dance Weekend 2026 Official Festival Passes"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-300">
                    BOOK ONLINE • OFFICIAL PASSES
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    Festivals &amp; Special Events
                  </h3>
                  <p className="text-xs text-ivory-muted mt-1 leading-relaxed">
                    Reserve your official online passes for Made in Cuba Dance Weekend 2026 (4–6 Dec), Halloween Party, and SB&amp;K Nights.
                  </p>
                </div>
                <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                  Book Festival Tickets →
                </span>
              </div>
            </Link>

            {/* Gateway 03: Rueda Call Dictionary (Action Photography — No Cropped Flyer!) */}
            <Link
              href="/dashboard/rueda"
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-surface-2 overflow-hidden transition-all duration-500 hover:border-amber-400/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                <Image
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80"
                  alt="Authentic Cuban Rueda de Casino Dance Circle Action"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-300">
                    40+ CUBAN CIRCLE CALLS
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    Rueda Call Dictionary
                  </h3>
                  <p className="text-xs text-ivory-muted mt-1 leading-relaxed">
                    Master authentic Havana Rueda de Casino calls, caller hand signals, and our 4-tier Cuban syllabus.
                  </p>
                </div>
                <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                  Explore Rueda Library →
                </span>
              </div>
            </Link>

            {/* Gateway 04: Timba Song Trainer (Action Music/Dance Photography — No Cropped Flyer!) */}
            <Link
              href="/music"
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-surface-2 overflow-hidden transition-all duration-500 hover:border-amber-400/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                <Image
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80"
                  alt="Cuban Salsa Percussion Clave & Timba Musicality"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-300">
                    INTERACTIVE AUDIO COCKPIT
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    Timba Song Trainer
                  </h3>
                  <p className="text-xs text-ivory-muted mt-1 leading-relaxed">
                    Train your ear with our real-time song progression map, 8-count rhythm bar, and Leader/Follower cues.
                  </p>
                </div>
                <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                  Open Song Trainer →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InsideCubanCircleGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<AcademyGalleryPhoto | null>(null);

  return (
    <section className="cv-auto py-12 sm:py-16 bg-canvas border-b border-line text-ivory">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-line">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gold">
              <Camera className="h-3.5 w-3.5" />
              <span>Exhibition Photo Archive • {VENUE_INFO.name}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-ivory leading-none">
              INSIDE THE{" "}
              <span className="font-display italic font-normal text-gold lowercase">
                cuban circle
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-ivory-muted leading-relaxed">
              Captured on Thursday and Sunday nights at {VENUE_INFO.name}. Real dancers, live Rueda de Casino calls, and authentic Havana musicality in the heart of Bournemouth.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-line bg-surface-3 hover:bg-surface-2 text-ivory font-bold text-xs rounded-xl"
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
              className="group relative flex flex-col text-left rounded-2xl border border-line bg-surface-2 overflow-hidden transition-all duration-500 hover:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold cursor-pointer"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-950">
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas via-black/20 to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-black/75 backdrop-blur-xs border border-white/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-gold">
                    {photo.kicker}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-ivory group-hover:text-gold transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-ivory-muted line-clamp-2 mt-1 leading-relaxed">
                    {photo.caption}
                  </p>
                </div>
                <span className="pt-2 text-[11px] font-bold uppercase tracking-wider text-gold inline-flex items-center gap-1">
                  Inspect Frame →
                </span>
              </div>
            </button>
          ))}
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
            className="relative max-w-3xl w-full rounded-2xl border border-line bg-surface-2 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] w-full bg-black">
              <Image
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
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
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                  {selectedPhoto.kicker}
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {selectedPhoto.title}
                </h4>
                <p className="text-xs text-ivory-muted mt-1">
                  {selectedPhoto.caption}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shrink-0"
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
