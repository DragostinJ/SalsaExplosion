import {
  Drum,
  Flame,
  Footprints,
  Hourglass,
  RefreshCw,
  Sparkles,
  Star,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { SongDanceGear } from "@/lib/constants/timba-song-anatomy";

/**
 * App-wide visual vocabulary for dance gears. Every song uses the same colour,
 * icon and energy level for a gear so dancers learn to read the song map at a glance.
 * Colours come only from design tokens in globals.css.
 */
export interface DanceGearStyle {
  shortLabel: string;
  /** 0 = stand still, 1 = slow, 2 = medium, 3 = fast */
  energy: 0 | 1 | 2 | 3;
  icon: LucideIcon;
  /** Solid fill, used for song-map blocks and dots */
  fillClass: string;
  /** Text colour on dark surfaces */
  textClass: string;
  /** Soft tinted background + border for chips and cards */
  chipClass: string;
}

export const DANCE_GEAR_LEGEND: Record<SongDanceGear, DanceGearStyle> = {
  "Wait / Breathe": {
    shortLabel: "Wait",
    energy: 0,
    icon: Hourglass,
    fillClass: "bg-ivory-muted/40",
    textClass: "text-ivory-muted",
    chipClass: "bg-ivory-muted/10 border-ivory-muted/30",
  },
  "Son Cubano": {
    shortLabel: "Son",
    energy: 1,
    icon: Footprints,
    fillClass: "bg-info",
    textClass: "text-info",
    chipClass: "bg-info-soft border-info-line",
  },
  "Casino (Smooth)": {
    shortLabel: "Casino smooth",
    energy: 2,
    icon: Waves,
    fillClass: "bg-role-lead",
    textClass: "text-role-lead",
    chipClass: "bg-role-lead-soft border-role-lead-line",
  },
  "Casino (Flow)": {
    shortLabel: "Casino flow",
    energy: 3,
    icon: RefreshCw,
    fillClass: "bg-success",
    textClass: "text-success",
    chipClass: "bg-success-soft border-success-line",
  },
  "Rumba Guaguancó": {
    shortLabel: "Rumba",
    energy: 1,
    icon: Drum,
    fillClass: "bg-gold",
    textClass: "text-gold",
    chipClass: "bg-warning-soft border-warning-line",
  },
  "Afro-Cuban Orishas": {
    shortLabel: "Orishas",
    energy: 1,
    icon: Sparkles,
    fillClass: "bg-role-follow",
    textClass: "text-role-follow",
    chipClass: "bg-role-follow-soft border-role-follow-line",
  },
  "Suelta / Shines": {
    shortLabel: "Shines",
    energy: 2,
    icon: Star,
    fillClass: "bg-ember",
    textClass: "text-ember",
    chipClass: "bg-danger-soft border-danger-line",
  },
  "Despelote / Reparto": {
    shortLabel: "Despelote",
    energy: 3,
    icon: Flame,
    fillClass: "bg-danger",
    textClass: "text-danger",
    chipClass: "bg-danger-soft border-danger-line",
  },
};

export const ENERGY_LABELS: Record<DanceGearStyle["energy"], string> = {
  0: "Stand still",
  1: "Slow",
  2: "Medium",
  3: "Fast",
};
