/**
 * Salsa Explosion UK — Canonical Single Source of Truth (SSOT)
 * All pages (/ , /dashboard/schedule, /events, /pricing, /venues, /about, /llms.txt, SiteFooter, JsonLdSchema)
 * import their metrics, weekly schedule, pricing, venue details, and gallery assets from this module.
 */

export const ACADEMY_METRICS = {
  yearsInUk: "25+ Years",
  yearsInUkLabel: "UK Teaching Heritage",
  dancersTrained: "4,200+",
  dancersTrainedLabel: "Dancers Mentored",
  dancersMentored: "4,200+",
  dancersMentoredLabel: "Dancers Mentored",
  partnerPolicy: "Zero Partner",
  partnerPolicyLabel: "Required to Join",
  founderName: "Enrique Perez Valdes",
  founderTitleName: "Maestro Enrique Perez Valdes",
  founderOrigin: "Havana, Cuba",
  founderAward: "Salsa UK Lifetime Achievement Award",
  lifetimeAward: "UK Lifetime Achievement Award",
  promoterAward: "UK's Most Popular Salsa Promoter",
  establishedYear: 1993,
} as const;

export const VENUE_INFO = {
  name: "BOH Studios Bournemouth",
  shortName: "BOH Studios",
  streetAddress: "104 Commercial Rd",
  address: "104 Commercial Rd, The Triangle",
  fullAddress: "BOH Studios, 104 Commercial Rd, The Triangle, Bournemouth BH2 5LR",
  postcode: "BH2 5LR",
  city: "Bournemouth",
  region: "Dorset",
  country: "GB",
  floor: "Canadian Sprung Maple Floor",
  parkingSummary: "Free on-street parking after 6 PM & Bournemouth Library Car Park (2-min walk, BH2 5SL)",
  phoneDisplay: "07969 633701",
  phoneE164: "+447969633701",
  phoneHref: "tel:+447969633701",
  whatsappHref: "https://wa.me/447969633701",
  instagramUrl: "https://www.instagram.com/salsaexplosion/",
  instagramHandle: "@salsaexplosion",
  facebookUrl: "https://www.facebook.com/salsaexplosion",
  googleMapsUrl:
    "https://maps.google.com/?q=BOH+Studios+104+Commercial+Road+Bournemouth+BH2+5LR",
} as const;

export const DOOR_PRICING = {
  oneClassPounds: 12,
  twoClassesPounds: 14,
  socialOnlyPounds: 5,
  oneClassDisplay: "£12 (1 Class)",
  twoClassesDisplay: "£14 (2 Classes)",
  summaryBadge: "£12 for 1 Class • £14 for 2 Classes (Includes Social Fiesta)",
  paymentMethodNote: "Cash or Card Accepted at the Door • No Pre-Booking Required",
} as const;

export interface CanonicalClassSession {
  id: string;
  time: string;
  level: string;
  badge: string;
  title: string;
  instructor: string;
  instructorHref: string;
  room: string;
  priceDisplay: string;
  ctaLabel: string;
  isSocial?: boolean;
}

export interface CanonicalDaySchedule {
  id: "thursday" | "sunday";
  dayOfWeekNumber: 4 | 0;
  dayName: "Thursday" | "Sunday";
  dayPlural: "Thursdays" | "Sundays";
  dayLabel: string;
  anchorId: "timetable-thursday" | "timetable-sunday";
  doorsTime: string;
  headline: string;
  subtitle: string;
  sessions: CanonicalClassSession[];
}

export const WEEKLY_SCHEDULE: Record<"thursday" | "sunday", CanonicalDaySchedule> = {
  thursday: {
    id: "thursday",
    dayOfWeekNumber: 4,
    dayName: "Thursday",
    dayPlural: "Thursdays",
    dayLabel: "Every Thursday",
    anchorId: "timetable-thursday",
    doorsTime: "18:45",
    headline: "Every Thursday • 19:00 – Late",
    subtitle:
      "Doors 18:45 • 4 Progressive Tracks + Solo Musicality + Havana Social Fiesta",
    sessions: [
      {
        id: "thu-1900-musicality",
        time: "19:00",
        level: "ALL LEVELS",
        badge: "Open to Everyone",
        title: "Solo Salsa: Musicality, Pasitos & Rhythm",
        instructor: "Moe Flex",
        instructorHref: "#instructors-moe-flex",
        room: "BOH Studios Main Hall",
        priceDisplay: "£12 (1 Class) / £14 (2 Classes)",
        ctaLabel: "Pay at Door (£12 / £14)",
      },
      {
        id: "thu-1900-beginners",
        time: "19:00",
        level: "BEGINNERS",
        badge: "1st Timers Welcome",
        title: "Cuban Salsa Beginners Foundation",
        instructor: "Maestro Enrique Perez Valdes",
        instructorHref: "#instructors-enrique",
        room: "BOH Studios Main Hall",
        priceDisplay: "£12 (1 Class) / £14 (2 Classes)",
        ctaLabel: "Pay at Door (£12 / £14)",
      },
      {
        id: "thu-2015-improvers",
        time: "20:15",
        level: "IMPROVERS",
        badge: "Guapea & Turns",
        title: "Cuban Salsa Improvers Partnerwork",
        instructor: "Justyna",
        instructorHref: "#instructors-justyna",
        room: "BOH Studios Main Hall",
        priceDisplay: "£12 (1 Class) / £14 (2 Classes)",
        ctaLabel: "Pay at Door (£12 / £14)",
      },
      {
        id: "thu-2015-intermediate",
        time: "20:15",
        level: "INTERMEDIATE",
        badge: "Fast Rueda Circles",
        title: "Cuban Salsa Intermediates & Rueda de Casino",
        instructor: "Arturas, Moe Flex & Jim",
        instructorHref: "#instructors-arturas",
        room: "BOH Studios Main Hall",
        priceDisplay: "£12 (1 Class) / £14 (2 Classes)",
        ctaLabel: "Pay at Door (£12 / £14)",
      },
      {
        id: "thu-2130-social",
        time: "21:30 – Late",
        level: "ALL DANCERS",
        badge: "Social Dance Practice",
        title: "Thursday Havana Social Fiesta",
        instructor: "DJ Enrique & Resident Team",
        instructorHref: "#instructors-enrique",
        room: "BOH Studios Main Hall",
        priceDisplay: "Included w/ Class or £5",
        ctaLabel: "Drop-In Welcome",
        isSocial: true,
      },
    ],
  },
  sunday: {
    id: "sunday",
    dayOfWeekNumber: 0,
    dayName: "Sunday",
    dayPlural: "Sundays",
    dayLabel: "Every Sunday",
    anchorId: "timetable-sunday",
    doorsTime: "18:15",
    headline: "Every Sunday • 18:30 – Late",
    subtitle:
      "Doors 18:15 • Cuban Salsa & Rueda Masterclass + Relaxed Havana Social Fiesta",
    sessions: [
      {
        id: "sun-1830-masterclass",
        time: "18:30",
        level: "ALL LEVELS & IMPROVERS",
        badge: "Open Circle & Partnerwork",
        title: "Sunday Cuban Salsa & Rueda Masterclass",
        instructor: "Maestro Enrique Perez Valdes & Team",
        instructorHref: "#instructors-enrique",
        room: "BOH Studios Main Hall",
        priceDisplay: "£12 (1 Class) / £14 (2 Classes)",
        ctaLabel: "Pay at Door (£12 / £14)",
      },
      {
        id: "sun-1930-social",
        time: "19:30 – Late",
        level: "ALL DANCERS",
        badge: "Pure Timba, Son & Rueda Circles",
        title: "Sunday Havana Social Fiesta",
        instructor: "Maestro Enrique",
        instructorHref: "#instructors-enrique",
        room: "BOH Studios Main Hall",
        priceDisplay: "Included w/ Class or £5",
        ctaLabel: "Drop-In Welcome",
        isSocial: true,
      },
    ],
  },
};

export const WEEKLY_SCHEDULE_LIST: CanonicalDaySchedule[] = [
  WEEKLY_SCHEDULE.thursday,
  WEEKLY_SCHEDULE.sunday,
];

export interface CanonicalPassTier {
  id: string;
  name: string;
  shortLabel: string;
  priceDisplay: string;
  priceInPounds: number;
  perClassNote: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PASS_PRICING: Record<
  "first-timer" | "PACK_SINGLE" | "PACK_5" | "PACK_10" | "SUB_UNLIMITED_MONTHLY",
  CanonicalPassTier
> = {
  "first-timer": {
    id: "first-timer",
    name: "Weekly Class Door Admission (1 or 2 Classes)",
    shortLabel: "Pay at Door",
    priceDisplay: "£12 / £14",
    priceInPounds: 12,
    perClassNote: "£12 for 1 class • £14 for 2 classes at door",
    description:
      "Weekly Cuban Salsa and Rueda classes at BOH Studios Bournemouth. Pay directly at the door with cash or contactless card. Includes the Havana Social Fiesta.",
    features: [
      "£12 for 1 Class + Havana Social Fiesta",
      "£14 for 2 Classes + Havana Social Fiesta",
      "Zero partner required — rotating circle",
    ],
  },
  PACK_SINGLE: {
    id: "PACK_SINGLE",
    name: "Weekly Class Door Admission (1 or 2 Classes)",
    shortLabel: "Pay at Door",
    priceDisplay: "£12 / £14",
    priceInPounds: 12,
    perClassNote: "£12 for 1 class • £14 for 2 classes at the door",
    description:
      "Pay directly at the door on Thursday or Sunday at BOH Studios Bournemouth. No online pre-booking required — includes the evening Havana Social Fiesta.",
    features: [
      "£12 for 1 Class + Havana Social Fiesta",
      "£14 for 2 Classes + Havana Social Fiesta",
      "Cash or contactless card accepted at the door",
    ],
  },
  PACK_5: {
    id: "PACK_5",
    name: "5-Class Havana Credit Pack",
    shortLabel: "5-Class Pack",
    priceDisplay: "£40",
    priceInPounds: 40,
    perClassNote: "£8 / session (Save 20%)",
    description:
      "Ideal for weekly dancers building consistent Cuban Casino & Rueda technique on Thursdays and Sundays.",
    features: [
      "5 Class Credits (£8 / session — Save £10)",
      "Valid any Thursday or Sunday at BOH Studios",
      "Includes evening social fiesta on every visit",
    ],
  },
  PACK_10: {
    id: "PACK_10",
    name: "10-Class Casinero Pass",
    shortLabel: "10-Class Pass",
    priceDisplay: "£75",
    priceInPounds: 75,
    perClassNote: "£7.50 / session (Best Value)",
    description:
      "Best value credit bundle for dedicated Cuban Salsa & Rueda dancers at BOH Studios Bournemouth.",
    popular: true,
    features: [
      "10 Class Credits (£7.50 / session — Save £25)",
      "Priority Lead/Follow ratio lock on busy nights",
      "Priority 4-tier syllabus video level-up reviews",
    ],
  },
  SUB_UNLIMITED_MONTHLY: {
    id: "SUB_UNLIMITED_MONTHLY",
    name: "Unlimited Studio Membership",
    shortLabel: "Unlimited Monthly",
    priceDisplay: "£95 / month",
    priceInPounds: 95,
    perClassNote: "All Thursdays & Sundays",
    description:
      "All-access monthly pass covering every Thursday and Sunday class and social fiesta at BOH Studios.",
    features: [
      "Unlimited Thursday & Sunday classes + socials",
      "Zero credit deductions when booking",
      "Full access to End-of-Class Video Vault",
      "Cancel anytime via Billing Portal",
    ],
  },
};

export const PASS_PRICING_LIST: CanonicalPassTier[] = [
  PASS_PRICING.PACK_SINGLE,
  PASS_PRICING.PACK_5,
  PASS_PRICING.PACK_10,
  PASS_PRICING.SUB_UNLIMITED_MONTHLY,
];

export interface CanonicalUpcomingEvent {
  slug: string;
  title: string;
  dateBadge: string;
  startDateIso: string;
  endDateIso?: string;
  timeRange: string;
  venueName: string;
  priceDisplay: string;
  minPricePounds: number;
  categoryLabel: string;
  description: string;
  posterUrl: string;
}

export const UPCOMING_EVENTS: CanonicalUpcomingEvent[] = [
  {
    slug: "halloween-fancy-dress-latin-party-2026",
    title: "Halloween Fancy Dress Party",
    dateBadge: "31 OCT 2026",
    startDateIso: "2026-10-31T19:30:00Z",
    timeRange: "19:30 – 01:00",
    venueName: "BOH Studios Bournemouth",
    priceDisplay: "From £12",
    minPricePounds: 12,
    categoryLabel: "Special Party & Masterclass",
    description:
      "South Coast Cuban & Latin Halloween fiesta featuring masterclasses, costume prizes, Rueda circles, and social dancing until 1:00 AM.",
    posterUrl: "/images/halloween-latin-party-poster.png",
  },
  {
    slug: "sbk-night-extravaganza-2026",
    title: "SB&K Night! Extravaganza",
    dateBadge: "14 NOV 2026",
    startDateIso: "2026-11-14T19:30:00Z",
    timeRange: "19:30 – 01:00",
    venueName: "BOH Studios Bournemouth",
    priceDisplay: "From £12",
    minPricePounds: 12,
    categoryLabel: "Multi-Room Social Fiesta",
    description:
      "High-energy Cuban Salsa, Timba, Bachata, and Kizomba workshops and late-night social dancing with guest artists at BOH Studios.",
    posterUrl: "/images/danza-2026-2027-calendar.png",
  },
  {
    slug: "made-in-cuba-dance-weekend-2026",
    title: "MADE IN CUBA — Dance Weekend 2026",
    dateBadge: "04–06 DEC 2026",
    startDateIso: "2026-12-04T18:00:00Z",
    endDateIso: "2026-12-06T23:00:00Z",
    timeRange: "3-Day Cuban Congress",
    venueName: "BOH Studios & The Woodlands Ballroom",
    priceDisplay: "From £20 / £65 Full Pass",
    minPricePounds: 20,
    categoryLabel: "Flagship 3-Day Congress",
    description:
      "3 nights of parties, 2 days of authentic Cuban workshops, 2 spectacular shows, and dancing until 2:00 AM across 2 dedicated rooms.",
    posterUrl: "/images/made-in-cuba-2026-poster.jpg",
  },
];

export interface AcademyGalleryPhoto {
  id: string;
  kicker: string;
  title: string;
  caption: string;
  location: string;
  imageUrl: string;
  aspectClass: "aspect-[4/5]" | "aspect-[16/10]";
}

export const ACADEMY_GALLERY_PHOTOS: AcademyGalleryPhoto[] = [
  {
    id: "gallery-thursday-residency",
    kicker: "THURSDAY RESIDENCY",
    title: "Cuban Casino & Musicality at BOH Studios",
    caption:
      "Every Thursday from 19:00: Solo Salsa Musicality with Moe Flex, Beginners with Maestro Enrique, Improvers with Justyna, and Intermediates/Rueda with Arturas & Jim.",
    location: "BOH Studios Bournemouth (104 Commercial Rd)",
    imageUrl: "/images/thursdays-moe-flex-poster.png",
    aspectClass: "aspect-[4/5]",
  },
  {
    id: "gallery-made-in-cuba",
    kicker: "FLAGSHIP CONGRESS • 04–06 DEC 2026",
    title: "MADE IN CUBA — Dance Weekend",
    caption:
      "Celebrating over 25 years of Cuban dance heritage in the UK with international maestros, 2 days of workshops, and 3 nights of Havana fiestas.",
    location: "BOH Studios & The Woodlands Ballroom",
    imageUrl: "/images/made-in-cuba-2026-poster.jpg",
    aspectClass: "aspect-[4/5]",
  },
  {
    id: "gallery-danza-season",
    kicker: "2026 / 2027 EXHIBITION SEASON",
    title: "DANZA! Special Events & Masterclasses",
    caption:
      "Curated monthly Latin extravaganzas, Afro-Cuban & Rumba intensives, and guest artist showcases in the heart of Bournemouth.",
    location: "BOH Studios Bournemouth",
    imageUrl: "/images/danza-2026-2027-calendar.png",
    aspectClass: "aspect-[4/5]",
  },
  {
    id: "gallery-halloween-fiesta",
    kicker: "SPECIAL EVENT • 31 OCT 2026",
    title: "Halloween Fancy Dress Latin Party",
    caption:
      "Bournemouth's flagship autumn social featuring guest workshops, Rueda circles, and late-night social dancing.",
    location: "BOH Studios Bournemouth",
    imageUrl: "/images/halloween-latin-party-poster.png",
    aspectClass: "aspect-[4/5]",
  },
];

export const ACADEMY_FAQS = [
  {
    question: "Which days do weekly Cuban Salsa classes run in Bournemouth?",
    answer:
      "All weekly classes and socials run strictly on Thursdays (doors 18:45, classes at 19:00 and 20:15, social from 21:30) and Sundays (doors 18:15, masterclass at 18:30, social from 19:30) at BOH Studios Bournemouth, 104 Commercial Rd, BH2 5LR.",
  },
  {
    question: "Do I need to bring a dance partner?",
    answer:
      "No partner is ever required. In authentic Cuban Casino and Rueda de Casino, we rotate partners continuously in a friendly circle so solo dancers and couples learn at the same pace.",
  },
  {
    question: "How much do classes cost and do I need to create an account?",
    answer:
      "Weekly Thursday and Sunday classes are paid directly at the door at BOH Studios — no online pre-booking or account is required. Admission is £12 for 1 class or £14 for 2 classes on the same evening (both include the late-night Havana Social Fiesta). Online ticket booking is reserved exclusively for our special events and weekend festivals like Made in Cuba.",
  },
  {
    question: "What shoes should I wear and where do I park?",
    answer:
      "Wear comfortable flat shoes, trainers, or dance shoes that slide smoothly on our Canadian sprung maple floor. Free on-street parking is available after 6:00 PM on surrounding streets, plus Bournemouth Library Car Park (BH2 5SL) is a 2-minute walk away.",
  },
] as const;
