"use client";

import Link from "next/link";
import { BookOpen, ChevronLeft, Ear, Maximize2 } from "lucide-react";
import type { SongAnatomy } from "@/lib/constants/timba-song-anatomy";
import { cn } from "@/lib/utils";
import type { PracticeMode } from "./player-settings";
import type { DancerRole } from "./song-player-more-sheet";

const MODE_ICONS = { learn: BookOpen, dance: Maximize2, quiz: Ear } as const;

interface PlayerHeaderProps {
  song: SongAnatomy;
  title: string;
  mode: PracticeMode;
  onCycleMode: () => void;
  role: DancerRole;
  onChangeRole: (role: DancerRole) => void;
  /** When set (import preview), the back button calls this instead of linking to /music. */
  onExit?: () => void;
}

/** Top bar of the practice player: back, song, practice mode and Lead/Follow. */
export function PlayerHeader({ song, title, mode, onCycleMode, role, onChangeRole, onExit }: PlayerHeaderProps) {
  const ModeIcon = MODE_ICONS[mode];
  return (
    <header className="flex shrink-0 items-center gap-2 pb-2">
      {onExit ? (
        <button
          type="button"
          onClick={onExit}
          aria-label="Close preview"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : (
        <Link
          href="/music"
          aria-label="Back to all songs"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-bold">{title}</h1>
        <p className="truncate text-xs text-ivory-muted">
          {song.style} · {song.artist} · {song.bpm} BPM
        </p>
      </div>
      <button
        type="button"
        onClick={onCycleMode}
        aria-label={`Practice mode: ${mode}. Tap to switch`}
        data-testid="player-mode"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-gold"
      >
        <ModeIcon className="h-5 w-5" />
      </button>
      <div className="flex shrink-0 rounded-full border border-line bg-surface-2 p-0.5" role="radiogroup" aria-label="Your role">
        {(["leader", "follower"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={role === option}
            onClick={() => onChangeRole(option)}
            className={cn(
              "min-h-[40px] rounded-full px-2.5 text-xs font-bold",
              role === option
                ? option === "leader"
                  ? "bg-role-lead-soft text-role-lead"
                  : "bg-role-follow-soft text-role-follow"
                : "text-ivory-muted"
            )}
          >
            {option === "leader" ? "Lead" : "Follow"}
          </button>
        ))}
      </div>
    </header>
  );
}
