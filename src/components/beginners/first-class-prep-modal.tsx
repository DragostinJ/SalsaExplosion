"use client";

import { useState } from "react";
import { Video, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FirstClassPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirstClassPrepModal({
  isOpen,
  onClose,
}: FirstClassPrepModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400">
            <Video className="h-3.5 w-3.5 text-amber-600" />
            <span>Pre-Class Orientation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Your First 15 Minutes at BOH Studios
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Watch what walking into your first Cuban Salsa class feels like. From stepping through the door to your very first Rueda circle.
          </p>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-1 border border-line shadow-inner flex items-center justify-center">
          {isPlaying ? (
            <video
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              controls
              autoPlay
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="relative flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 pointer-events-none" />
              <div className="relative z-10 space-y-2">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setIsPlaying(true)}
                  className="h-14 w-14 rounded-full bg-brand hover:bg-brand-hover text-white shadow-lg"
                >
                  <Play className="h-6 w-6 fill-white ml-1" />
                </Button>
                <p className="text-xs font-bold text-white drop-shadow-sm">
                  Watch 60-Second Studio Walkthrough & Basic Step Preview
                </p>
                <p className="text-[11px] text-stone-300 max-w-sm drop-shadow-sm">
                  See where to hang your coat, how door check-in works, and how the beginner circle begins.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Arrival Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Step-by-Step Arrival Timeline:
          </h3>
          <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1">
              <span className="font-bold text-amber-400 block text-[11px]">
                1. 15 Mins Before Start
              </span>
              <p className="font-semibold text-foreground">Front Desk Welcome</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Arrive at 104 Commercial Rd. Show your digital QR pass from your phone for 1-second check-in.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1">
              <span className="font-bold text-blue-400 block text-[11px]">
                2. 10 Mins Before Start
              </span>
              <p className="font-semibold text-foreground">Change Shoes & Coat</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Store bag in the dancer cubbies. Put on your smooth-soled shoes and grab a complimentary mint.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1">
              <span className="font-bold text-emerald-400 block text-[11px]">
                3. On the Hour
              </span>
              <p className="font-semibold text-foreground">Join the Warm-Up</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Step into the Level 0 circle with Sofia & David (Floor Ambassadors). Maestro Enrique starts counting!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="bg-primary-base hover:bg-primary-hover text-white font-bold text-xs px-6"
          >
            I&apos;m Ready! Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
