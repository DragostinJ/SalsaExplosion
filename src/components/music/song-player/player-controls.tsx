"use client";

import { Info, Loader2, Pause, Play, Repeat, SkipBack, SkipForward } from "lucide-react";
import { formatPlaybackRate } from "@/lib/music/practice-navigation";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  isReady: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  canGoNext: boolean;
  playbackRate: number;
  isLooping: boolean;
  onOpenMore: () => void;
  onCycleRate: () => void;
  onPrevious: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onToggleLoop: () => void;
}

const roundButton = "flex items-center justify-center rounded-full border border-line bg-surface-2 disabled:opacity-40";

/** Thumb-zone transport: details · speed · previous · play · next · loop. */
export function PlayerControls({
  isReady,
  isPlaying,
  isBuffering,
  canGoNext,
  playbackRate,
  isLooping,
  onOpenMore,
  onCycleRate,
  onPrevious,
  onTogglePlay,
  onNext,
  onToggleLoop,
}: PlayerControlsProps) {
  return (
    <nav aria-label="Playback" className="flex shrink-0 items-center justify-between gap-1.5 pt-1">
      <button
        type="button"
        onClick={onOpenMore}
        aria-label="Section details and practice settings"
        className={cn(roundButton, "h-11 w-11")}
      >
        <Info className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onCycleRate}
        disabled={!isReady}
        aria-label={`Playback speed ${playbackRate}x, tap to change`}
        data-testid="player-speed"
        className={cn(
          roundButton,
          "h-11 w-11 font-mono text-xs font-bold",
          playbackRate !== 1 && "border-gold text-gold"
        )}
      >
        {formatPlaybackRate(playbackRate)}
      </button>
      <button
        type="button"
        onClick={onPrevious}
        disabled={!isReady}
        aria-label="Previous section"
        className={cn(roundButton, "h-13 w-13")}
      >
        <SkipBack className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={onTogglePlay}
        disabled={!isReady}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold text-canvas shadow-lg disabled:opacity-40"
      >
        {isBuffering ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-7 w-7" />
        ) : (
          <Play className="ml-1 h-7 w-7" />
        )}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!isReady || !canGoNext}
        aria-label="Next section"
        className={cn(roundButton, "h-13 w-13")}
      >
        <SkipForward className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={onToggleLoop}
        disabled={!isReady}
        aria-pressed={isLooping}
        aria-label="Loop this section"
        data-testid="player-loop"
        className={cn(roundButton, "h-11 w-11", isLooping && "border-gold bg-gold/15 text-gold")}
      >
        <Repeat className="h-5 w-5" />
      </button>
    </nav>
  );
}
