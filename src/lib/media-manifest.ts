/**
 * Centralized media manifest defining canonical aspect ratios,
 * intrinsic dimensions, and responsive sizes for all photography assets.
 * Guarantees zero cumulative layout shift (CLS) across mobile and desktop.
 */

export interface MediaAssetConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio: string;
  sizes: string;
  priority?: boolean;
}

export const MEDIA_MANIFEST = {
  hero: {
    src: "/images/bournemouth-beach-hero.png",
    alt: "Bournemouth Coastline and Salsa Explosion Studio Culture",
    width: 1920,
    height: 1080,
    aspectRatio: "16/9",
    sizes: "100vw",
    priority: true,
  },
  studioHeroBg: {
    src: "/images/studio-hero-bg.png",
    alt: "BOH Studios Atmospheric Dance Hall",
    width: 1920,
    height: 1080,
    aspectRatio: "16/9",
    sizes: "100vw",
    priority: false,
  },
  posters: {
    danzaCalendar: {
      src: "/images/danza-2026-2027-calendar.png",
      alt: "DANZA! 2026 | 2027 Official Calendar of Cuban Salsa Events",
      width: 1200,
      height: 1600,
      aspectRatio: "3/4",
      sizes: "(max-width: 768px) 100vw, 50vw",
      priority: true,
    },
    madeInCuba2026: {
      src: "/images/made-in-cuba-2026-poster.jpg",
      alt: "Made in Cuba Dance Weekend 2026 Official Festival Poster",
      width: 1200,
      height: 1600,
      aspectRatio: "3/4",
      sizes: "(max-width: 768px) 100vw, 50vw",
      priority: false,
    },
    weeklyClasses: {
      src: "/images/thursdays-moe-flex-poster.png",
      alt: "Thursday & Sunday Weekly Classes Poster",
      width: 1200,
      height: 1600,
      aspectRatio: "3/4",
      sizes: "(max-width: 768px) 100vw, 50vw",
      priority: false,
    },
    halloweenParty: {
      src: "/images/halloween-latin-party-poster.png",
      alt: "Halloween Latin Party Poster",
      width: 1200,
      height: 1600,
      aspectRatio: "3/4",
      sizes: "(max-width: 768px) 100vw, 50vw",
      priority: false,
    },
  },
  gateways: {
    weeklyClasses: {
      src: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=1000&q=80",
      alt: "Weekly Cuban Salsa & Rueda de Casino Classes at BOH Studios Bournemouth",
      width: 1000,
      height: 625,
      aspectRatio: "16/10",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    },
    festivals: {
      src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
      alt: "Made in Cuba Dance Weekend 2026 Official Festival Passes",
      width: 1000,
      height: 625,
      aspectRatio: "16/10",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    },
    rueda: {
      src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
      alt: "Authentic Cuban Rueda de Casino Dance Circle Action",
      width: 1000,
      height: 625,
      aspectRatio: "16/10",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    },
    timba: {
      src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
      alt: "Cuban Salsa Percussion Clave & Timba Musicality",
      width: 1000,
      height: 625,
      aspectRatio: "16/10",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    },
  },
} as const;
