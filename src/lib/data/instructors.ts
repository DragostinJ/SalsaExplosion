export type InstructorCategory = "cuban" | "solo" | "sbk";

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
}

export const INSTRUCTORS: InstructorProfile[] = [
  {
    id: "enrique",
    name: "Enrique Perez Valdes",
    role: "Founder & Artistic Director",
    badge: "🏆 UK Lifetime Achievement Award",
    origin: "🇨🇺 Havana, Cuba",
    categories: ["cuban"],
    styles: ["Cuban Casino", "Rueda de Casino", "Son Cubano", "Timba Musicality"],
    teachingDays: "Thursdays & Sundays at BOH Studios • Congresses",
    bio: "Born and raised in Havana, Cuba, Maestro Enrique brought authentic Cuban Casino and Rueda de Casino to the UK over 25 years ago, mentoring 4,200+ dancers and directing the Made in Cuba festival.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "EP",
  },
  {
    id: "moe-flex",
    name: "Moe Flex",
    role: "International Guest Maestro & Resident Specialist",
    badge: "🌍 UK & International Dance Icon",
    origin: "🇬🇧 UK International",
    categories: ["solo", "cuban"],
    styles: ["Solo Salsa & Pasitos", "Cuban Body Movement", "Musicality", "Showmanship"],
    teachingDays: "Thursdays at BOH Studios • Made in Cuba Weekend",
    bio: "Renowned worldwide for high-energy footwork, infectious charisma, and razor-sharp musicality breakdowns that transform how dancers move solo and in partnerwork.",
    instagramUrl: "https://www.instagram.com/moeflex/",
    instagramHandle: "@moeflex",
    privateCoachingAvailable: true,
    avatarFallback: "MF",
  },
  {
    id: "arturas",
    name: "Arturas",
    role: "Core Cuban Salsa Instructor",
    badge: "⚡ Foundation & Technique Specialist",
    origin: "Salsa Explosion Team",
    categories: ["cuban", "sbk"],
    styles: ["Cuban Salsa Beginners", "Lead/Follow Frame", "Guapea & Dile Que No", "SB&K Nights"],
    teachingDays: "Thursdays at BOH Studios & Monthly SB&K Nights",
    bio: "Known for making absolute beginners feel relaxed and confident from minute one, breaking down core Cuban timing, weight transfer, and smooth partner connection.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "AR",
  },
  {
    id: "jim",
    name: "Jim",
    role: "Rueda de Casino & Intermediate Instructor",
    badge: "🔄 Master Rueda Caller",
    origin: "Salsa Explosion Team",
    categories: ["cuban"],
    styles: ["Rueda de Casino", "Intermediate Partnerwork", "Dynamic Call Transitions"],
    teachingDays: "Thursdays at BOH Studios",
    bio: "Drives our high-energy Intermediate Rueda circles, teaching rapid call recognition, ring spacing, and seamless partner rotations.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "JM",
  },
  {
    id: "justyna",
    name: "Justyna",
    role: "Cuban Salsa & Ladies Styling Instructor",
    badge: "✨ Follower Technique & Connection",
    origin: "Salsa Explosion Team",
    categories: ["cuban", "sbk"],
    styles: ["Follower Styling", "Cuban Partnerwork", "Spins & Balance", "SB&K Socials"],
    teachingDays: "Thursdays & SB&K Extravaganza Nights at BOH",
    bio: "Specializes in follower responsiveness, graceful Cuban arm styling, and grounded body movement without sacrificing frame or partner connection.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "JU",
  },
  {
    id: "alex-spindlove",
    name: "Alex Spindlove",
    role: "Guest Bachata & Latin Specialist",
    badge: "🔥 South Coast Bachata Flavour",
    origin: "BOH Studios Partner Artist",
    categories: ["sbk"],
    styles: ["Bachata Moderna", "Bachata Sensual", "Musicality & Body Waves", "Latin Socials"],
    teachingDays: "Featured Special Events & SB&K Parties at BOH Studios",
    bio: "Bringing top-tier Bachata technique, smooth lead/follow connection, and infectious party energy to our cross-genre South Coast Latin nights.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "AS",
  },
  {
    id: "anna",
    name: "Anna",
    role: "South Coast Latin & Bachata Instructor",
    badge: "💃 Partner Connection & Styling",
    origin: "BOH Studios Partner Artist",
    categories: ["sbk"],
    styles: ["Bachata", "Latin Partnerwork", "Follower Technique"],
    teachingDays: "Featured Socials & Special Parties at BOH Studios",
    bio: "Elevating South Coast social nights with warm, precision-focused instruction in partner connection and musical expression.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "AN",
  },
  {
    id: "xaris",
    name: "Xaris",
    role: "South Coast Latin & Kizomba/Bachata Artist",
    badge: "🎶 Multi-Genre Social Specialist",
    origin: "BOH Studios Partner Artist",
    categories: ["sbk"],
    styles: ["Kizomba", "Bachata", "Cuban & Latin Socials"],
    teachingDays: "Featured Parties & SB&K Nights at BOH Studios",
    bio: "A staple of the Bournemouth and South Coast Latin scene, bringing grounded musicality and smooth social floorcraft across rooms.",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
    instagramHandle: "@salsaexplosion",
    privateCoachingAvailable: true,
    avatarFallback: "XA",
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
