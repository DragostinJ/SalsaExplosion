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
    id: "photo-1",
    title: "Friday Night Rueda de Casino Circle",
    caption:
      "24 dancers rotating in synchronized harmony to Alexander Abreu & Havana D'Primera. Every lead and follow in flow.",
    category: "RUEDA",
    imageUrl:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
    location: "Main Havana Studio",
  },
  {
    id: "photo-2",
    title: "Sensual Afro-Cuban Rumba Styling",
    caption:
      "Maestra Elena breaking down the circular shoulder isolations and Vacilala styling in our Saturday styling masterclass.",
    category: "BOOTCAMPS",
    imageUrl:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
    location: "Studio B (Mirrors)",
  },
  {
    id: "photo-3",
    title: "Havana Social Fiesta & Timba Jam",
    caption:
      "Dancers from beginner to advanced sharing the floor with live conga percussion and authentic Santiago de Cuba energy.",
    category: "SOCIALS",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    location: "Havana Social Hall",
  },
  {
    id: "photo-4",
    title: "Dynamic Contratiempo Turn Patterns",
    caption:
      "Maestro Marcos coaching the Setenta Complicado frame tension and foot placement with intermediate salsa students.",
    category: "RUEDA",
    imageUrl:
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=1200&q=80",
    location: "Main Havana Studio",
  },
  {
    id: "photo-5",
    title: "International Guest Maestro Weekender",
    caption:
      "Full house for our visiting guest maestra masterclass focusing on authentic Son timing and Cuban body isolations.",
    category: "BOOTCAMPS",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    location: "Gran Teatro Havana Hall",
  },
  {
    id: "photo-6",
    title: "Community Smiles & Post-Class Recaps",
    caption:
      "The best part of Salsa Explosion: community, laughter, and dancers filming the end-of-class recap to practice with friends.",
    category: "STUDIO_LIFE",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    location: "Studio Lounge",
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
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === cat.key
                ? "bg-amber-500 text-zinc-950 shadow-xs"
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
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />

            {/* Bottom Caption Info */}
            <div className="absolute inset-x-0 bottom-0 p-4 text-white space-y-1">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500 text-zinc-950 font-bold text-[10px]">
                  {photo.category.replace("_", " ")}
                </Badge>
                <span className="text-[11px] text-zinc-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-3 w-3" /> Click to view
                </span>
              </div>
              <h3 className="text-sm font-extrabold line-clamp-1">{photo.title}</h3>
              <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
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
            className="relative flex flex-col max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-3xl border border-amber-500/30 bg-zinc-950 text-white shadow-2xl"
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
            <div className="p-5 space-y-2 bg-zinc-900 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500 text-zinc-950 font-bold text-xs">
                  {activePhoto.category.replace("_", " ")}
                </Badge>
                <span className="text-xs text-zinc-400">
                  📍 {activePhoto.location}
                </span>
              </div>
              <h4 className="text-lg font-extrabold">{activePhoto.title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
                {activePhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
