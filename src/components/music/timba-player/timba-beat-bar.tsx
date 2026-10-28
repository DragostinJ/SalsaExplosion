"use client";

import React from "react";
import { Headphones } from "lucide-react";

interface TimbaBeatBarProps {
  isPlaying: boolean;
  currentDancerBeat: number;
}

export function TimbaBeatBar({ isPlaying, currentDancerBeat }: TimbaBeatBarProps) {
  return (
    <div
      data-testid="dancer-beat-bar"
      className="rounded-xl sm:rounded-2xl border border-line bg-surface-2 p-1.5 sm:p-3 flex items-center justify-between gap-1.5 sm:gap-2.5 text-xs shadow-xs"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-ivory shrink-0">
        <Headphones className="h-3.5 w-3.5 text-gold" />
        <span className="text-xs">Dancer Rhythm Bar:</span>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((beatNum) => {
          const isCurrent = isPlaying && currentDancerBeat === beatNum;
          const isBreakOn1 = beatNum === 1;
          const isSonOn2 = beatNum === 2;

          return (
            <div
              key={beatNum}
              className={`h-6 sm:h-7 px-1.5 sm:px-2.5 rounded-lg flex items-center justify-center font-mono font-black text-xs transition-all ${
                isCurrent
                  ? "bg-gold text-stone-950 font-black shadow-xs scale-105 ring-2 ring-gold"
                  : isBreakOn1
                  ? "border border-rose-500/40 bg-rose-500/20 text-rose-300"
                  : isSonOn2
                  ? "border border-sky-500/40 bg-sky-500/20 text-sky-300"
                  : "border border-line bg-surface-1 text-ivory-muted"
              }`}
              title={
                isBreakOn1
                  ? "Beat 1: Casino On1 Break Step"
                  : isSonOn2
                  ? "Beat 2: Son Contratiempo Step"
                  : `Beat ${beatNum}`
              }
            >
              {beatNum}
            </div>
          );
        })}
      </div>

      <span className="text-xs text-ivory-muted font-medium hidden lg:inline">
        Red = Beat 1 (On1) • Blue = Beat 2 (Son)
      </span>
    </div>
  );
}
