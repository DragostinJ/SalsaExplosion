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

export const TEACHER_LINKS: readonly MobileNavLink[] = [
  { href: "/instructor/ai-studio", label: "AI Studio & Copilot", icon: Sparkles },
  { href: "/instructor/students", label: "Student Roster & Notes", icon: Users },
  { href: "/instructor/submissions", label: "Video Grading Queue", icon: ClipboardCheck },
  { href: "/instructor/roster", label: "Live QR Class Check-In", icon: QrCode },
];

export const OWNER_LINKS: readonly MobileNavLink[] = [
  { href: "/instructor/ai-studio", label: "AI Studio & Event Importer", icon: Sparkles },
  { href: "/admin/operations", label: "Studio Desk Operations", icon: ClipboardList },
  { href: "/admin/analytics", label: "Executive Analytics", icon: BarChart3 },
  { href: "/admin/classes", label: "Schedule Class Sessions", icon: CalendarPlus },
  { href: "/admin/events", label: "Congress & Party Admin", icon: ShieldCheck },
];
