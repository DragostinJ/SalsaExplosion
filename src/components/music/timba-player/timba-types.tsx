import React from "react";
import type { SegmentColorTheme } from "@/lib/constants/timba-song-anatomy";

export function YouTubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export const THEME_STYLES: Record<
  SegmentColorTheme,
  {
    bgActive: string;
    bgInactive: string;
    border: string;
    text: string;
    badge: string;
    pillBg: string;
  }
> = {
  slate: {
    bgActive: "bg-stone-800/80 border-stone-500/50 text-stone-100",
    bgInactive: "bg-surface-3 text-ivory-muted border-line hover:bg-surface-2 hover:text-stone-200",
    border: "border-stone-500/40",
    text: "text-stone-100 font-bold",
    badge: "border-stone-500/40 bg-stone-800/80 text-stone-200 font-bold",
    pillBg: "bg-stone-500",
  },
  blue: {
    bgActive: "bg-sky-950/60 border-sky-500/40 text-sky-200",
    bgInactive: "bg-surface-3 text-ivory-muted border-line hover:bg-surface-2 hover:text-stone-200",
    border: "border-sky-500/40",
    text: "text-sky-200 font-bold",
    badge: "border-sky-500/40 bg-sky-950/60 text-sky-200 font-bold",
    pillBg: "bg-sky-500",
  },
  emerald: {
    bgActive: "bg-emerald-950/60 border-emerald-500/40 text-emerald-200",
    bgInactive: "bg-surface-3 text-ivory-muted border-line hover:bg-surface-2 hover:text-stone-200",
    border: "border-emerald-500/40",
    text: "text-emerald-200 font-bold",
    badge: "border-emerald-500/40 bg-emerald-950/60 text-emerald-200 font-bold",
    pillBg: "bg-emerald-500",
  },
  amber: {
    bgActive: "bg-amber-950/60 border-amber-500/40 text-amber-200",
    bgInactive: "bg-surface-3 text-ivory-muted border-line hover:bg-surface-2 hover:text-stone-200",
    border: "border-amber-500/40",
    text: "text-amber-200 font-bold",
    badge: "border-amber-500/40 bg-amber-950/60 text-amber-200 font-bold",
    pillBg: "bg-amber-500",
  },
  purple: {
    bgActive: "bg-surface-2 border-gold/40 text-gold",
    bgInactive: "bg-surface-3 text-ivory-muted border-line hover:bg-surface-2 hover:text-stone-200",
    border: "border-gold/40",
    text: "text-gold font-bold",
    badge: "border-gold/40 bg-surface-2 text-gold font-bold",
    pillBg: "bg-gold",
  },
  red: {
    bgActive: "bg-rose-950/60 border-rose-500/40 text-rose-200",
    bgInactive: "bg-surface-3 text-ivory-muted border-line hover:bg-surface-2 hover:text-stone-200",
    border: "border-rose-500/40",
    text: "text-rose-200 font-bold",
    badge: "border-rose-500/40 bg-rose-950/60 text-rose-200 font-bold",
    pillBg: "bg-rose-500",
  },
};

export function formatSeconds(secs: number): string {
  const clamped = Math.max(0, Math.floor(secs));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
