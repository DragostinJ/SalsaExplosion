export type InstructorCategory = "cuban_weekly" | "afro_timba" | "boh_special";

export interface InstructorProfile {
  id: string;
  name: string;
  role: string;
  badge: string;
  origin: string;
  categories: InstructorCategory[];
  styles: string[];
  teachingDays: string;
  bio: string;
  instagramUrl: string;
  instagramHandle: string;
  privateCoachingAvailable: boolean;
  avatarFallback: string;
  imageUrl?: string;
  isGuest?: boolean;
}

export const INSTRUCTORS: InstructorProfile[] = [
  {
    id: "enrique",
    name: "Enrique Perez Valdes",
    role: "Founder & Artistic Director • Cuban Master Teacher",
    badge: "UK LIFETIME AWARD",
    origin: "Havana, Cuba",
    categories: ["cuban_weekly"],
    styles: ["Cuban Casino", "Beginners Foundation", "Rueda de Casino", "Son Cubano"],
    teachingDays: "Thursdays 19:00 (Beginners Foundation) & 20:15 (Rueda Masterclass) • Sundays 18:30 (Havana Social & Masterclass)",
    bio: "Born and raised in Havana, Cuba, Maestro Enrique brought authentic Cuban Casino and Rueda de Casino to the UK over 25 years ago. He personally leads and nurtures the Beginners classes, giving newcomers authentic Havana foundations from day one, plus flagship Rueda circles and Congress masterclasses.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "EP",
  },
  {
    id: "justyna",
    name: "Justyna",
    role: "Core Cuban Salsa Instructor • Styling & Technique",
    badge: "TECHNIQUE & STYLING",
    origin: "Salsa Explosion Team",
    categories: ["cuban_weekly"],
    styles: ["Cuban Salsa Improvers", "Partner Connection", "Cuban Styling"],
    teachingDays: "Thursdays 20:15 (Improvers Partnerwork) & Sundays (Masterclass & Social)",
    bio: "Resident Cuban Salsa instructor teaching our weekly Improvers classes, focusing on smooth transitions, follower frame, graceful arm styling, and grounded body movement with authentic partner connection.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "JU",
  },
  {
    id: "arturas",
    name: "Arturas",
    role: "Core Cuban Salsa Instructor • Advanced Partnerwork",
    badge: "INTERMEDIATE SPECIALIST",
    origin: "Salsa Explosion Team",
    categories: ["cuban_weekly"],
    styles: ["Cuban Salsa Intermediates", "Advanced Partnerwork", "Casino Technique"],
    teachingDays: "Thursdays 20:15 (Intermediate Cuban Partnerwork)",
    bio: "Resident Cuban Salsa instructor teaching our weekly Intermediate classes (not Beginners), specializing in complex Casino combinations, dynamic turn mechanics, leading clarity, and high-energy partner connection.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "AR",
  },
  {
    id: "moe-flex",
    name: "Moe Flex",
    role: "International Maestro & Thursday Resident Specialist",
    badge: "UK & INTERNATIONAL DANCE ICON",
    origin: "UK International",
    categories: ["cuban_weekly"],
    styles: ["Musicality for All Levels", "Pasitos & Footwork", "Intermediate Salsa", "Showmanship"],
    teachingDays: "Thursdays 19:00 (Solo Salsa Musicality & Pasitos — All Levels) & 20:15 (Intermediate Salsa)",
    bio: "World-renowned salsa instructor, choreographer, and Master of Ceremonies. Every Thursday at BOH Studios, Moe delivers an electrifying All-Levels Musicality, Pasitos & Body Movement class for everyone, followed by Intermediate Cuban partnerwork.",
    instagramUrl: "https://www.instagram.com/moeflex/",
    instagramHandle: "@moeflex",
    privateCoachingAvailable: true,
    avatarFallback: "MF",
  },
  {
    id: "jim",
    name: "Jim",
    role: "Rueda de Casino & Cuban Salsa Instructor",
    badge: "RUEDA MASTER",
    origin: "Salsa Explosion Team",
    categories: ["cuban_weekly"],
    styles: ["Rueda de Casino", "Group Call Mastery", "Cuban Partnerwork"],
    teachingDays: "Thursdays 20:15 (Rueda de Casino & Intermediate Cuban)",
    bio: "Drives our dynamic Rueda de Casino circles and partner rotations on Thursdays, teaching lightning-fast call recognition, ring spacing, and fluid transitions with authentic Cuban energy.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "JM",
  },
  {
    id: "xaris",
    name: "Xaris",
    role: "Featured Guest Maestro • Afro-Cuban & Timba Specialist",
    badge: "AFRO-CUBAN & TIMBA MAESTRO",
    origin: "Guest Artist • South Coast",
    categories: ["afro_timba"],
    styles: ["Cuban Salsa", "Afro-Cuban & Rumba", "Timba Musicality", "Cuban Body Movement"],
    teachingDays: "Featured Masterclasses & Weekend Congress Bootcamps",
    bio: "A celebrated guest teacher for Salsa Explosion special masterclasses, Xaris specializes purely in authentic Cuban Salsa, Afro-Cuban folkloric rhythms, Rumba Guaguancó, and high-octane Timba musicality.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "XA",
    isGuest: true,
  },
  {
    id: "anna",
    name: "Anna",
    role: "Featured Guest Specialist • Afro-Rumba & Cuban Styling",
    badge: "AFRO-RUMBA & STYLING",
    origin: "Guest Artist • South Coast",
    categories: ["afro_timba"],
    styles: ["Cuban Salsa", "Afro-Rumba", "Timba & Styling", "Partner Connection"],
    teachingDays: "Featured Masterclasses & Styling Bootcamps",
    bio: "Featured guest specialist for Salsa Explosion workshops, Anna focuses strictly on Cuban Salsa body isolations, Afro-Rumba expression, and elegant Cuban styling with fluid partner connection.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "AN",
    isGuest: true,
  },
  {
    id: "alex-spindlove",
    name: "Alex Spindlove",
    role: "Co-Owner, BOH Studios • Special Event Guest Artist",
    badge: "BOH STUDIOS CO-OWNER",
    origin: "Co-Owner, BOH Studios Bournemouth",
    categories: ["boh_special"],
    styles: ["Bachata Moderna", "Bachata Sensual", "Musicality & Body Waves", "Latin Socials"],
    teachingDays: "Special Monthly Weekend Parties & SB&K Extravaganzas",
    bio: "Co-Owner of BOH Studios Bournemouth (our proud host venue). Alex joins Salsa Explosion as a featured guest artist bringing Bachata flavour during our special multi-room weekend parties, Halloween socials, and SB&K extravaganzas.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "AS",
    isGuest: true,
  },
];

export function getInstructorById(id: string): InstructorProfile | undefined {
  return INSTRUCTORS.find((instructor) => instructor.id === id);
}

export function getInstructorsByCategory(category?: InstructorCategory | "all"): InstructorProfile[] {
  if (!category || category === "all") {
    return INSTRUCTORS;
  }
  return INSTRUCTORS.filter((instructor) => instructor.categories.includes(category));
}
