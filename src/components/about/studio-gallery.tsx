"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  category: "RUEDA" | "SOCIALS" | "BOOTCAMPS" | "STUDIO_LIFE";
  imageUrl: string;
  location: string;
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "photo-thursdays-moe-flex",
    title: "Thursdays with Special Guest Moe Flex & Salsa Explosion Team",
    caption:
      "High-energy Cuban Salsa, Pasitos, Musicality, and Rueda de Casino at BOH Studios Bournemouth with Moe Flex, Justyna, Arturas, Jim & Enrique.",
    category: "BOOTCAMPS",
    imageUrl: "/images/thursdays-moe-flex-poster.png",
    location: "BOH Studios Bournemouth (104 Commercial Rd)",
  },
  {
    id: "photo-boh-ballroom",
    title: "BOH Studios Main Ballroom & Rueda Floor",
    caption:
      "Flagship Made in Cuba Dance Festival & weekly classes venue with Enrique Perez Valdes. Gorgeous sprung Canadian maple ballroom for 100+ dancers.",
    category: "STUDIO_LIFE",
    imageUrl: "/images/danza-2026-2027-calendar.png",
    location: "BOH Studios Bournemouth (104 Commercial Rd)",
  },
  {
    id: "photo-halloween-latin-party",
    title: "Halloween Fancy Dress Latin Party (Saturday 31st October)",
    caption:
      "Premier South Coast Cuban & Latin Halloween event featuring Bachata masterclasses with Alex Spindlove, SB&K social dancing, and best costume prizes.",
    category: "SOCIALS",
    imageUrl: "/images/halloween-latin-party-poster.png",
    location: "BOH Studios Bournemouth",
  },
  {
    id: "photo-weekly-calendar",
    title: "Official Salsa Explosion Weekly Timetable",
    caption:
      "Full weekly rhythm: Thursdays & Sundays at BOH Studios Bournemouth.",
    category: "RUEDA",
    imageUrl: "/images/weekly-calendar-poster.png",
    location: "Bournemouth, Boscombe & Poole Hubs",
  },
  {
    id: "photo-1",
    title: "Thursday Night Rueda de Casino Circle",
    caption:
      "Dancers rotating in synchronized harmony to Alexander Abreu & Havana D'Primera. Every lead and follow in flow.",
    category: "RUEDA",
    imageUrl: "/images/rueda-social.jpg",
    location: "BOH Studios Bournemouth",
  },
  {
    id: "photo-4",
    title: "Made in Cuba Dance Weekend",
    caption:
      "Full house for our international guest maestros weekend festival with 3 days of workshops and Havana nights social parties.",
    category: "BOOTCAMPS",
    imageUrl: "/images/danza-2026-2027-calendar.png",
    location: "BOH Studios Bournemouth",
  },
];

const CATEGORIES = [
  { key: "ALL", label: "All Photos" },
  { key: "RUEDA", label: "Rueda Circles" },
  { key: "SOCIALS", label: "Social Nights" },
  { key: "BOOTCAMPS", label: "Masterclasses & Bootcamps" },
  { key: "STUDIO_LIFE", label: "Studio Life" },
] as const;

export function StudioGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const filtered =
    selectedCategory === "ALL"
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
              selectedCategory === cat.key
                ? "bg-amber-500 text-stone-950 shadow-xs"
                : "border bg-card text-muted-foreground hover:border-amber-500/50 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setActivePhoto(photo)}
            className="group relative aspect-4/3 cursor-pointer overflow-hidden rounded-2xl border bg-muted shadow-sm transition-all hover:border-amber-500 hover:shadow-lg"
          >
            <Image
              src={photo.imageUrl}
              alt={photo.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />

            {/* Bottom Caption Info */}
            <div className="absolute inset-x-0 bottom-0 p-4 text-white space-y-1">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500 text-stone-950 font-bold text-[10px]">
                  {photo.category.replace("_", " ")}
                </Badge>
                <span className="text-[11px] text-stone-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-3 w-3" /> Click to view
                </span>
              </div>
              <h3 className="text-sm font-extrabold line-clamp-1">{photo.title}</h3>
              <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                {photo.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-3xl border border-line bg-surface-1 text-ivory shadow-2xl"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              aria-label="Close photo preview"
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image Container */}
            <div className="relative aspect-16/10 w-full bg-black">
              <Image
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
                priority
              />
            </div>

            {/* Caption & Location Footer */}
            <div className="p-5 space-y-2 bg-surface-2 border-t border-line">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500 text-stone-950 font-bold text-xs">
                  {activePhoto.category.replace("_", " ")}
                </Badge>
                <span className="text-xs text-stone-400">
                  📍 {activePhoto.location}
                </span>
              </div>
              <h4 className="text-lg font-extrabold">{activePhoto.title}</h4>
              <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
                {activePhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
