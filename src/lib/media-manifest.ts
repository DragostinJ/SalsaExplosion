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
    practiceHome: {
      src: "/images/editorial/practice-home.jpg",
      alt: "A woman practising salsa steps at home in her living room, music playing from a phone on the shelf",
      width: 1856,
      height: 2304,
      aspectRatio: "1856/2304",
      sizes: "(max-width: 768px) 100vw, 40vw",
    },
    glassCouple: {
      src: "/images/editorial/glass-couple.jpg",
      alt: "A couple dancing casino in a Havana courtyard under a stained-glass fan window",
      width: 896,
      height: 1200,
      aspectRatio: "896/1200",
      sizes: "(max-width: 768px) 90vw, 24rem",
    },
    glassHands: {
      src: "/images/editorial/glass-hands.jpg",
      alt: "Two dancers' hands joined in a casino hold, lit by patches of coloured glass light",
      width: 1600,
      height: 1600,
      aspectRatio: "1600/1600",
      sizes: "(max-width: 640px) 100vw, 25vw",
    },
    bannerBigBand: {
      src: "/images/editorial/banner-big-band.jpg",
      alt: "Screen-print poster of a Cuban big band under string lights, dancers in silhouette and a red sun",
      width: 2400,
      height: 1018,
      aspectRatio: "2400/1018",
      sizes: "100vw",
    },
    bannerHavana: {
      src: "/images/editorial/banner-havana.jpg",
      alt: "Screen-print poster of the Havana Capitolio and the Malecón at sunset, a wave breaking over the sea wall",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "100vw",
    },
    bannerDoor: {
      src: "/images/editorial/banner-door.jpg",
      alt: "Screen-print poster of a dance hall's open doors at night, dancers inside and a street lamp outside",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "100vw",
    },
    bannerFestival: {
      src: "/images/editorial/banner-festival.jpg",
      alt: "Screen-print poster of a dance festival on a beach at sunset: couples in silhouette by a striped tent, a pier and a red sun",
      width: 2400,
      height: 1018,
      aspectRatio: "2400/1018",
      sizes: "100vw",
    },
    bannerStudio: {
      src: "/images/editorial/banner-studio.jpg",
      alt: "Screen-print poster of a dance studio at night, a couple dancing and their reflection in the wall mirror",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "100vw",
    },
    bannerTeacher: {
      src: "/images/editorial/banner-teacher.jpg",
      alt: "Screen-print poster of a teacher clapping the count in front of a line of students and their long shadows",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "100vw",
    },
    glassRecord: {
      src: "/images/editorial/glass-record.jpg",
      alt: "A record player in coloured light from a stained-glass window",
      width: 2400,
      height: 1340,
      aspectRatio: "2400/1340",
      sizes: "100vw",
    },
    timbalero: {
      src: "/images/editorial/timbalero.jpg",
      alt: "A timbales player mid-fill on a small stage in crimson and amber light",
      width: 1856,
      height: 2304,
      aspectRatio: "1856/2304",
      sizes: "(max-width: 768px) 100vw, 40vw",
    },
    dancerKit: {
      src: "/images/editorial/dancer-kit.jpg",
      alt: "Dance shoes, claves, a towel and a red water bottle on a studio bench",
      width: 1856,
      height: 2304,
      aspectRatio: "1856/2304",
      sizes: "(max-width: 768px) 100vw, 40vw",
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
    guiro: {
      src: "/images/editorial/icaic-guiro.png",
      alt: "Screen-print illustration of a güiro and a pair of maracas",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    timbales: {
      src: "/images/editorial/icaic-timbales.png",
      alt: "Screen-print illustration of timbales drums with a cowbell",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    car: {
      src: "/images/editorial/icaic-car.png",
      alt: "Screen-print illustration of a 1950s car on the Malecón with a wave behind it",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    rueda: {
      src: "/images/editorial/icaic-rueda.png",
      alt: "Screen-print illustration of a rueda de casino circle seen from above",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    radio: {
      src: "/images/editorial/icaic-radio.png",
      alt: "Screen-print illustration of a vintage radio playing music",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    ticket: {
      src: "/images/editorial/icaic-ticket.png",
      alt: "Screen-print illustration of a torn cinema admission ticket with a star",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    clock: {
      src: "/images/editorial/icaic-clock.png",
      alt: "Screen-print illustration of a ringing twin-bell alarm clock",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    pier: {
      src: "/images/editorial/icaic-pier.png",
      alt: "Screen-print illustration of a seaside pier with a palm tree and the sun",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    phone: {
      src: "/images/editorial/icaic-phone.png",
      alt: "Screen-print illustration of a hand holding a phone with musical notes",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    caller: {
      src: "/images/editorial/icaic-caller.png",
      alt: "Screen-print illustration of a rueda caller's raised hand with a whistle",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    gift: {
      src: "/images/editorial/icaic-gift.png",
      alt: "Screen-print illustration of a gift envelope tied with a ribbon",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    medal: {
      src: "/images/editorial/icaic-medal.png",
      alt: "Screen-print illustration of a star medal on a striped ribbon",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    camera: {
      src: "/images/editorial/icaic-camera.png",
      alt: "Screen-print illustration of a vintage film camera on a tripod",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    record: {
      src: "/images/editorial/icaic-record.png",
      alt: "Screen-print illustration of a spinning vinyl record with a star label",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    shoes: {
      src: "/images/editorial/icaic-shoes.png",
      alt: "Screen-print illustration of a pair of dance shoes",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    // Round 5 (2026-11-03): one for each page that had no illustration yet
    maracas: {
      src: "/images/editorial/icaic-maracas.png",
      alt: "Screen-print illustration of a pair of crossed maracas with a star",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    map: {
      src: "/images/editorial/icaic-map.png",
      alt: "Screen-print illustration of a folded road map with a dotted route to a star pin",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    calendar: {
      src: "/images/editorial/icaic-calendar.png",
      alt: "Screen-print illustration of a tear-off calendar with a page flying away",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    stars: {
      src: "/images/editorial/icaic-stars.png",
      alt: "Screen-print illustration of five stars bursting out of a speech bubble",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    bag: {
      src: "/images/editorial/icaic-bag.png",
      alt: "Screen-print illustration of a paper shopping bag with a star, a ticket and a ribbon",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    letter: {
      src: "/images/editorial/icaic-letter.png",
      alt: "Screen-print illustration of a fountain pen on a letter closed with a star wax seal",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    key: {
      src: "/images/editorial/icaic-key.png",
      alt: "Screen-print illustration of an old door key with a star-shaped bow and a blank tag",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    footprints: {
      src: "/images/editorial/icaic-footprints.png",
      alt: "Screen-print dance-step diagram: a leader's and a follower's shoe prints with turning arrows",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    claves: {
      src: "/images/editorial/icaic-claves.png",
      alt: "Screen-print illustration of two crossed clave sticks being struck",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 50vw, 20vw",
    },
    // Round 6: one picture per move family on /moves, three teacher pages and the error page.
    familyCasino: {
      src: "/images/editorial/icaic-family-casino.png",
      alt: "Screen-print illustration of a leader's and a follower's hands joined in an arch, with a turning arrow",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    familyRueda: {
      src: "/images/editorial/icaic-family-rueda.png",
      alt: "Screen-print illustration of dancers holding hands in a ring around a raised calling hand",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    familyShine: {
      src: "/images/editorial/icaic-family-shine.png",
      alt: "Screen-print illustration of two-tone dance shoes mid-step with stars",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    familyBody: {
      src: "/images/editorial/icaic-family-body.png",
      alt: "Screen-print silhouette of a dancer's torso with ripple lines showing a body wave",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    familyRumba: {
      src: "/images/editorial/icaic-family-rumba.png",
      alt: "Screen-print illustration of a conga drum with a knotted handkerchief over its rim",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    familySon: {
      src: "/images/editorial/icaic-family-son.png",
      alt: "Screen-print illustration of a guitar leaning against a pair of bongos",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    familyReparto: {
      src: "/images/editorial/icaic-family-reparto.png",
      alt: "Screen-print illustration of a loudspeaker on a doorstep beside a pair of trainers",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    familyOrishas: {
      src: "/images/editorial/icaic-family-orishas.png",
      alt: "Screen-print illustration of three laced drums of different sizes",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    clipboard: {
      src: "/images/editorial/icaic-clipboard.png",
      alt: "Screen-print illustration of a clipboard with ticked boxes and a pencil",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    stopwatch: {
      src: "/images/editorial/icaic-stopwatch.png",
      alt: "Screen-print illustration of a stopwatch wrapped in a sound wave",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    filmstrip: {
      src: "/images/editorial/icaic-filmstrip.png",
      alt: "Screen-print illustration of a strip of film under a magnifying glass",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 25vw, 10vw",
    },
    dizzyDrum: {
      src: "/images/editorial/icaic-dizzy-drum.png",
      alt: "Screen-print illustration of a conga drum knocked over with stars circling above it",
      width: 1024,
      height: 1024,
      aspectRatio: "1/1",
      sizes: "(max-width: 768px) 40vw, 15vw",
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
    sampleStudentSubmission: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    demoRecapThumbnail: "/images/photos/classes-gateway.jpg",
  },
} as const;
