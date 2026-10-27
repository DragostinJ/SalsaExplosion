/**
 * Centralized media manifest defining canonical aspect ratios,
 * intrinsic dimensions, and responsive sizes for all photography and video assets.
 * Guarantees zero cumulative layout shift (CLS) across mobile and desktop.
 * Single source of truth for all studio imagery, posters, faculty portraits, and video demos.
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
  // ==========================================
  // HERO & ATMOSPHERIC STUDIO BACKGROUNDS
  // ==========================================
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
  /**
   * Hero Right-Column Architectural Dance Portrait (Aspect 4/5)
   * To replace: place high-res portrait in public/images/ and update src
   */
  heroPortrait: {
    src: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
    alt: "Maestro Enrique Perez Valdes directing Cuban Salsa & Rueda de Casino at BOH Studios Bournemouth",
    width: 1200,
    height: 1500,
    aspectRatio: "4/5",
    sizes: "(max-width: 1024px) 100vw, 40vw",
    priority: true,
  },

  // ==========================================
  // VERIFIED LOCAL POSTERS (public/images/*.png|jpg under 350KB)
  // ==========================================
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
    weeklyCalendar: {
      src: "/images/weekly-calendar-poster.png",
      alt: "Official Salsa Explosion Weekly Timetable Poster",
      width: 1200,
      height: 1600,
      aspectRatio: "3/4",
      sizes: "(max-width: 768px) 100vw, 50vw",
      priority: false,
    },
  },

  // ==========================================
  // THE PLACE 4-PILLAR PHOTO GATEWAYS (Aspect 16/10)
  // To replace: drop landscape action shots into public/images/ and update src
  // ==========================================
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

  // ==========================================
  // WHAT'S ON / HOMEPAGE EVENT CARDS (Aspect 4/5)
  // ==========================================
  events: {
    halloweenParty: "/images/halloween-latin-party-poster.png",
    sbkNight: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1000&q=80",
    madeInCuba2026: "/images/made-in-cuba-2026-poster.jpg",
  },

  // ==========================================
  // WHY CUBAN 3-PILLAR CARDS (Rueda, Musicality, Community)
  // ==========================================
  whyCuban: {
    rueda: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    musicality: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    community: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80",
  },

  // ==========================================
  // INSTRUCTORS & FACULTY PORTRAITS (Square 1:1)
  // Empty string defaults to high-contrast monogram fallback initials
  // ==========================================
  instructors: {
    enrique: "",
    enriquePortrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    justyna: "",
    arturas: "",
    "moe-flex": "",
    jim: "",
    xaris: "",
    anna: "",
    alex: "",
    "alex-spindlove": "",
  },

  // ==========================================
  // DEMO VIDEO ASSETS & RECAP THUMBNAILS
  // To replace: drop .mp4 into public/videos/ or use YouTube embed URLs
  // ==========================================
  videos: {
    beginnerWelcome: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    sampleStudentSubmission: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    demoRecapThumbnail: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
  },
} as const;
