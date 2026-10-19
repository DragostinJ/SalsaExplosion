export interface CoachingInstructor {
  id: "enrique" | "yaniel" | "elena";
  name: string;
  title: string;
  hourlyRatePounds: number;
  blockRatePounds: number; // 5-hour package
  specialties: string[];
  avatarUrl?: string;
  bio: string;
}

export const COACHING_INSTRUCTORS_CATALOG: Record<
  "enrique" | "yaniel" | "elena",
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
  yaniel: {
    id: "yaniel",
    name: "Yaniel Castillo",
    title: "Guest Artist & Afro-Cuban Master",
    hourlyRatePounds: 60,
    blockRatePounds: 250,
    specialties: [
      "Afro-Cuban Rumba (Yambu & Guaguanco)",
      "Orisha Body Isolations",
      "Footwork Speed & Musicality",
    ],
    bio: "Internationally renowned Cuban artist bringing sacred Afro-Cuban movement and high-energy Timba body isolation to your dancing.",
  },
  elena: {
    id: "elena",
    name: "Elena Reyes",
    title: "Senior Academy Instructor",
    hourlyRatePounds: 50,
    blockRatePounds: 220,
    specialties: [
      "Follower Arm Styling & Spin Technique",
      "Guapea Frame Sensitivity",
      "Beginner-to-Social Confidence",
    ],
    bio: "Specializes in developing graceful styling, fluid armwork, and rapid confidence for beginners stepping onto the Bournemouth social floor.",
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
