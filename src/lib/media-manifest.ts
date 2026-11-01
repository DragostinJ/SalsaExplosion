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
   * Hero Right-Column Architectural Dance Portrait (Aspect 4/3)
   * Authentic Cuban Salsa Social Dancing at BOH Studios Bournemouth
   */
  heroPortrait: {
    src: "/images/photos/hero-social.jpg",
    alt: "Salsa Explosion Cuban Salsa Social Dancing at BOH Studios Bournemouth",
    width: 2400,
    height: 1792,
    aspectRatio: "4/3",
    sizes: "(max-width: 1024px) 100vw, 50vw",
    priority: true,
  },

  // ==========================================
  // EDITORIAL ART-DIRECTION PHOTOGRAPHY (public/images/editorial, AI-generated
  // atmosphere with Nano Banana Pro; prompts in docs/design-and-roadmap/).
  // Mood imagery only: real teachers, students and BOH Studios use real photos.
  // ==========================================
  editorial: {
    laVueltaHero: {
      src: "/images/editorial/la-vuelta-hero.jpg",
      alt: "A Cuban casino couple mid-turn in a dark studio, her skirt sweeping in crimson light",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "100vw",
    },
    laVueltaHeroMobile: {
      src: "/images/editorial/la-vuelta-hero-mobile.jpg",
      alt: "A Cuban casino couple mid-turn in a dark studio, her skirt sweeping in crimson light",
      width: 1340,
      height: 2400,
      aspectRatio: "1340/2400",
      sizes: "100vw",
    },
    mediopuntoLight: {
      src: "/images/editorial/mediopunto-light.jpg",
      alt: "Coloured light from a Havana stained-glass fan window falling on a dancer in an old colonial room",
      width: 2400,
      height: 1018,
      aspectRatio: "2400/1018",
      sizes: "100vw",
    },
    feetHavanaTiles: {
      src: "/images/editorial/feet-havana-tiles.jpg",
      alt: "Dancers' feet mid-step on worn Cuban patterned floor tiles beside a pair of claves",
      width: 1856,
      height: 2304,
      aspectRatio: "4/5",
      sizes: "(max-width: 768px) 100vw, 40vw",
    },
    congaHands: {
      src: "/images/editorial/conga-hands.jpg",
      alt: "Hands striking a conga drum under red stage light",
      width: 1856,
      height: 2304,
      aspectRatio: "4/5",
      sizes: "(max-width: 768px) 100vw, 40vw",
    },
    ruedaOverhead: {
      src: "/images/editorial/rueda-overhead.jpg",
      alt: "Six couples dancing a rueda de casino circle, seen from above",
      width: 2048,
      height: 2048,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 100vw, 50vw",
    },
    despelote: {
      src: "/images/editorial/despelote.jpg",
      alt: "A laughing dancer mid shoulder isolation in timba despelote style",
      width: 1856,
      height: 2304,
      aspectRatio: "4/5",
      sizes: "(max-width: 768px) 100vw, 40vw",
    },
    rumbaSolar: {
      src: "/images/editorial/rumba-solar.jpg",
      alt: "A rumba guaguancó couple in white dancing in a Havana courtyard with percussionists behind",
      width: 2400,
      height: 1610,
      aspectRatio: "2400/1610",
      sizes: "(max-width: 768px) 100vw, 60vw",
    },
    countingHands: {
      src: "/images/editorial/counting-hands.jpg",
      alt: "A teacher's hands counting in a class reflected in the studio mirror",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "(max-width: 768px) 100vw, 60vw",
    },
    socialNight: {
      src: "/images/editorial/social-night.jpg",
      alt: "Couples dancing at a salsa social under warm festoon lights",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "(max-width: 768px) 100vw, 60vw",
    },
    brassSection: {
      src: "/images/editorial/brass-section.jpg",
      alt: "Trumpets and trombones of a timba band glowing in amber stage light",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "(max-width: 768px) 100vw, 60vw",
    },
    sonCouple: {
      src: "/images/editorial/son-couple.jpg",
      alt: "An older couple dancing son in close hold in a warm Havana living room",
      width: 1856,
      height: 2304,
      aspectRatio: "4/5",
      sizes: "(max-width: 768px) 100vw, 40vw",
    },
    casinoCouple: {
      src: "/images/editorial/casino-couple.jpg",
      alt: "A couple mid casino turn at a crowded salsa social",
      width: 1856,
      height: 2304,
      aspectRatio: "4/5",
      sizes: "(max-width: 768px) 100vw, 40vw",
    },
    mediopuntoWindow: {
      src: "/images/editorial/mediopunto-window.jpg",
      alt: "A Havana stained-glass mediopunto fan window glowing above an old wooden door",
      width: 2400,
      height: 1018,
      aspectRatio: "2400/1018",
      sizes: "100vw",
    },
    congaStage: {
      src: "/images/editorial/conga-stage.jpg",
      alt: "A conga drum on a dark stage in a beam of crimson light",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "100vw",
    },
  },

  // ==========================================
  // ART-DIRECTION GRAPHICS (screen-print illustrations and textures,
  // Nano Banana Pro round 2; illustrations cut out to transparent PNGs)
  // ==========================================
  mockupGraphics: {
    trumpet: {
      src: "/images/editorial/icaic-trumpet.png",
      alt: "Screen-print illustration of a trumpet with bursts of colour",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    couple: {
      src: "/images/editorial/icaic-couple.png",
      alt: "Screen-print illustration of a couple dancing salsa",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    palmMalecon: {
      src: "/images/editorial/icaic-palm-malecon.png",
      alt: "Screen-print illustration of a palm tree and a wave breaking on the Malecón",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    conga: {
      src: "/images/editorial/icaic-conga.png",
      alt: "Screen-print illustration of a conga drum and a pair of claves",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    havanaTile: {
      src: "/images/editorial/havana-tile.jpg",
      alt: "",
      width: 768,
      height: 768,
      aspectRatio: "1/1",
      sizes: "112px",
    },
    paperTexture: {
      src: "/images/editorial/paper-texture.jpg",
      alt: "",
      width: 768,
      height: 768,
      aspectRatio: "1/1",
      sizes: "384px",
    },
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
    enrique: "/images/instructors/enrique.jpg",
    enriquePortrait: "/images/instructors/enrique.jpg",
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
  // FACULTY CIRCULAR PROFILE PHOTOS (Aspect 1/1)
  // Cropped around the face for circular avatars in /about and rosters
  // ==========================================
  instructorProfiles: {
    enrique: "/images/instructors/enrique-profile.jpg",
    justyna: "/images/instructors/justyna-profile.jpg",
    arturas: "/images/instructors/arturas-profile.jpg",
    "moe-flex": "/images/instructors/moe-flex-profile.jpg",
    jim: "/images/instructors/jim-profile.jpg",
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
