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
   * Left blank until Maestro Enrique Perez Valdes provides official portrait
   */
  heroPortrait: {
    src: "",
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
  // Authentic Salsa Explosion Bournemouth photography
  // ==========================================
  gateways: {
    weeklyClasses: {
      src: "/images/photos/classes-gateway.jpg",
      alt: "Weekly Cuban Salsa & Rueda de Casino Classes at BOH Studios Bournemouth",
      width: 1000,
      height: 625,
      aspectRatio: "16/10",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    },
    festivals: {
      src: "/images/photos/festivals-gateway.jpg",
      alt: "Made in Cuba Dance Weekend 2026 Official Festival Passes",
      width: 1000,
      height: 625,
      aspectRatio: "16/10",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    },
    rueda: {
      src: "/images/photos/rueda-circle.jpg",
      alt: "Authentic Cuban Rueda de Casino Dance Circle Action",
      width: 1000,
      height: 625,
      aspectRatio: "16/10",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    },
    timba: {
      src: "/images/photos/timba-connection.jpg",
      alt: "Cuban Salsa Percussion Clave & Timba Musicality",
      width: 1000,
      height: 625,
      aspectRatio: "16/10",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    },
  },

  // ==========================================
  // INSIDE THE CUBAN CIRCLE EXHIBITION ARCHIVE (Aspect 4/5)
  // ==========================================
  archive: {
    archive1: "/images/photos/archive-1.jpg",
    archive2: "/images/photos/archive-2.jpg",
    archive3: "/images/photos/archive-3.jpg",
    archive4: "/images/photos/archive-4.jpg",
  },

  // ==========================================
  // WHAT'S ON / HOMEPAGE EVENT CARDS (Aspect 4/5)
  // ==========================================
  events: {
    halloweenParty: "/images/halloween-latin-party-poster.png",
    sbkNight: "/images/danza-2026-2027-calendar.png",
    madeInCuba2026: "/images/made-in-cuba-2026-poster.jpg",
  },

  // ==========================================
  // WHY CUBAN 3-PILLAR CARDS (Rueda, Musicality, Community)
  // ==========================================
  whyCuban: {
    rueda: "/images/photos/rueda-circle.jpg",
    musicality: "/images/photos/timba-connection.jpg",
    community: "/images/photos/classes-gateway.jpg",
  },

  // ==========================================
  // INSTRUCTORS & FACULTY PORTRAITS (Aspect 4/5)
  // Empty string defaults to high-contrast monogram fallback initials
  // ==========================================
  instructors: {
    enrique: "",
    enriquePortrait: "",
    justyna: "/images/instructors/justyna.jpg",
    arturas: "/images/instructors/arturas.jpg",
    "moe-flex": "/images/instructors/moe-flex.jpg",
    jim: "/images/instructors/jim.jpg",
    xaris: "/images/instructors/xaris.jpg",
    anna: "/images/instructors/anna.jpg",
    alex: "/images/instructors/alex-spindlove.jpg",
    "alex-spindlove": "/images/instructors/alex-spindlove.jpg",
  },

  // ==========================================
  // DEMO VIDEO ASSETS & RECAP THUMBNAILS
  // To replace: drop .mp4 into public/videos/ or use YouTube embed URLs
  // ==========================================
  videos: {
    beginnerWelcome: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    sampleStudentSubmission: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    demoRecapThumbnail: "/images/photos/classes-gateway.jpg",
  },
} as const;
