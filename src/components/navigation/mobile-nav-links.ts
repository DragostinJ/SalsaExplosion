import {
  CalendarDays,
  Sparkles,
  CreditCard,
  Award,
  MapPin,
  Compass,
  Users,
  ClipboardCheck,
  QrCode,
  BarChart3,
  CalendarPlus,
  ShieldCheck,
  Flame,
  Music,
  HelpCircle,
  ClipboardList,
  Sun,
  type LucideIcon,
} from "lucide-react";

/**
 * The mobile menu's links. Each one is a named constant and the lists name them, never pick
 * them by position: removing a link then breaks the build instead of leaving a hole that
 * crashes the menu for signed-in dancers.
 */
export interface MobileNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const schedule: MobileNavLink = { href: "/classes", label: "Schedule & Booking", icon: CalendarDays };
const venues: MobileNavLink = { href: "/venues", label: "Bournemouth Venues", icon: MapPin };
const rueda: MobileNavLink = { href: "/rueda", label: "Rueda Call Dictionary", icon: Users };
const privateLessons: MobileNavLink = { href: "/private-lessons", label: "1-on-1 Private Lessons", icon: Flame };
const events: MobileNavLink = { href: "/events", label: "Guest Festivals & Congress", icon: Sparkles };
const prices: MobileNavLink = { href: "/pricing", label: "Prices (Pay at the Door)", icon: CreditCard };
const wallet: MobileNavLink = { href: "/dashboard/wallet", label: "Receipts & History", icon: QrCode };
const progression: MobileNavLink = { href: "/dashboard/progression", label: "Syllabus Progression", icon: Award };

/** Signed-in dancers also get their receipts and syllabus progression */
export function dancerLinks(signedIn: boolean): readonly MobileNavLink[] {
  return signedIn
    ? [schedule, wallet, venues, rueda, progression, privateLessons, events, prices]
    : [schedule, venues, rueda, privateLessons, events, prices];
}

export const EXPLORE_LINKS: readonly MobileNavLink[] = [
  { href: "/music", label: "Cuban Music & Playlists", icon: Music },
  { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
  { href: "/about", label: "About Maestro Enrique", icon: Compass },
];

// Staff menus start at Today (tonight's classes and what needs doing), in plain words
export const TEACHER_LINKS: readonly MobileNavLink[] = [
  { href: "/instructor", label: "Today", icon: Sun },
  { href: "/instructor/roster", label: "Door check-in", icon: QrCode },
  { href: "/instructor/moves", label: "Moves to check", icon: ClipboardCheck },
  { href: "/instructor/submissions", label: "Video assessments", icon: Sparkles },
  { href: "/instructor/students", label: "Students", icon: Users },
];

export const OWNER_LINKS: readonly MobileNavLink[] = [
  { href: "/instructor", label: "Today", icon: Sun },
  { href: "/admin/classes", label: "Classes", icon: CalendarPlus },
  { href: "/admin/events", label: "Festivals & tickets", icon: ShieldCheck },
  { href: "/admin/operations", label: "Lesson requests & shop", icon: ClipboardList },
  { href: "/admin/analytics", label: "Numbers", icon: BarChart3 },
];
