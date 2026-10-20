export interface CoachingInstructor {
  id: "enrique" | "moe" | "justyna" | "arturas" | "jim";
  name: string;
  title: string;
  hourlyRatePounds: number;
  blockRatePounds: number; // 5-hour package
  specialties: string[];
  avatarUrl?: string;
  bio: string;
}

export const COACHING_INSTRUCTORS_CATALOG: Record<
  "enrique" | "moe" | "justyna" | "arturas" | "jim",
  CoachingInstructor
> = {
  enrique: {
    id: "enrique",
    name: "Enrique Perez Valdes",
    title: "Founder & Director • Lifetime Achievement Recipient",
    hourlyRatePounds: 65,
    blockRatePounds: 275,
    specialties: [
      "Cuban Body Isolation & Despelote",
      "Cantante Master Training",
      "Authentic Cuban Son & Chachacha",
      "Lead/Follow Tension Mechanics",
    ],
    bio: "Pioneered Cuban Salsa & Rueda in the UK for over 25 years. Tailored coaching for competitive dancers, social perfectionists, and wedding routines at BOH Studios.",
  },
  moe: {
    id: "moe",
    name: "Moe Flex",
    title: "International Master Instructor & Choreographer",
    hourlyRatePounds: 65,
    blockRatePounds: 275,
    specialties: [
      "Flex-Fun Technique & Musicality",
      "Pasitos & Body Isolation",
      "Rueda de Casino Dynamic Styling",
      "Stage Presence & Master of Ceremonies",
    ],
    bio: "London-based, world-renowned salsa instructor, choreographer, DJ, and Master of Ceremonies (MC). Active on the international Latin dance scene since 1998, he is widely celebrated as the 'General of MCs' and is famous for his infectious positive energy, humour, and 'Flex-fun' teaching style.",
    avatarUrl: "/images/thursdays-moe-flex-poster.png",
  },
  justyna: {
    id: "justyna",
    name: "Justyna",
    title: "Resident Academy Instructor",
    hourlyRatePounds: 50,
    blockRatePounds: 220,
    specialties: [
      "Follower Arm Styling & Spin Technique",
      "Guapea Frame Sensitivity",
      "Beginner-to-Social Confidence",
    ],
    bio: "Resident Salsa Explosion instructor specializing in fluid Cuban Salsa partnerwork, follower body movement, and social styling at BOH Studios.",
  },
  arturas: {
    id: "arturas",
    name: "Arturas",
    title: "Resident Academy Instructor",
    hourlyRatePounds: 50,
    blockRatePounds: 220,
    specialties: [
      "Cuban Casino Partnerwork",
      "Rueda de Casino Precision",
      "Leading Clarity & Turn Mechanics",
    ],
    bio: "Resident Salsa Explosion instructor focused on Cuban Casino structure, dynamic leading tension, and clear footwork fundamentals.",
  },
  jim: {
    id: "jim",
    name: "Jim",
    title: "Resident Academy Instructor",
    hourlyRatePounds: 50,
    blockRatePounds: 220,
    specialties: [
      "Beginner Foundations & Clave Timing",
      "Tuesday Cuban Partnerwork (Neptune Hall)",
      "Social Floor Confidence",
    ],
    bio: "Resident Salsa Explosion instructor teaching Tuesdays at Neptune Hall Boscombe and Thursdays at BOH Studios with Maestro Enrique.",
  },
};

export const COACHING_FOCUS_TOPICS = [
  "Cuban Motion, Ribcage & Afro-Isolation",
  "Lead/Follow Elastic Tension & Frame Connection",
  "Rueda de Casino Cantante (Calling) Mastery",
  "Footwork Timing on the 1 vs Son on the 2",
  "Wedding First Dance (Cuban Romance Routine)",
  "Bournemouth Congress Intensive Preparation",
] as const;
