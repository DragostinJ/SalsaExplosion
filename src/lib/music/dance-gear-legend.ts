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
 * Fills are the ICAIC poster inks (identical on paper and ink); text and chip
 * colours are scope-aware tokens, so they read on either surface.
 */
export interface DanceGearStyle {
  shortLabel: string;
  /** 0 = stand still, 1 = slow, 2 = medium, 3 = fast */
  energy: 0 | 1 | 2 | 3;
  icon: LucideIcon;
  /** Solid fill, used for song-map blocks and dots */
  fillClass: string;
  /** Text colour that reads on the current surface */
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
    fillClass: "bg-poster-blue",
    textClass: "text-info",
    chipClass: "bg-info-soft border-info-line",
  },
  "Casino (Smooth)": {
    shortLabel: "Casino smooth",
    energy: 2,
    icon: Waves,
    fillClass: "bg-poster-teal",
    textClass: "text-success",
    chipClass: "bg-success-soft border-success-line",
  },
  "Casino (Flow)": {
    shortLabel: "Casino flow",
    energy: 3,
    icon: RefreshCw,
    fillClass: "bg-poster-mustard",
    textClass: "text-warning",
    chipClass: "bg-warning-soft border-warning-line",
  },
  "Rumba Guaguancó": {
    shortLabel: "Rumba",
    energy: 1,
    icon: Drum,
    fillClass: "bg-poster-red",
    textClass: "text-danger",
    chipClass: "bg-danger-soft border-danger-line",
  },
  "Afro-Cuban Orishas": {
    shortLabel: "Orishas",
    energy: 1,
    icon: Sparkles,
    fillClass: "bg-poster-plum",
    textClass: "text-purple-300",
    chipClass: "bg-purple-500/10 border-purple-400/40",
  },
  "Suelta / Shines": {
    shortLabel: "Shines",
    energy: 2,
    icon: Star,
    fillClass: "bg-poster-pink",
    textClass: "text-role-follow",
    chipClass: "bg-role-follow-soft border-role-follow-line",
  },
  "Despelote / Reparto": {
    shortLabel: "Despelote",
    energy: 3,
    icon: Flame,
    fillClass: "bg-ivory",
    textClass: "text-ivory",
    chipClass: "bg-ivory/10 border-ivory/30",
  },
};

export const ENERGY_LABELS: Record<DanceGearStyle["energy"], string> = {
  0: "Stand still",
  1: "Slow",
  2: "Medium",
  3: "Fast",
};
