"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Music, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MusicErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Music Player Boundary]", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
          <Music className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-destructive">
            Audio Studio
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-ivory sm:text-3xl">
            Timba Engine Offline
          </h1>
          <p className="text-sm text-ivory-muted leading-relaxed">
            The interactive Timba Song Anatomy console experienced an audio buffer interruption. Tap below to reload the track stem:
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto bg-primary-base hover:bg-primary-hover text-white font-bold"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reload Track
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-white/10 text-ivory-muted hover:bg-white/5"
          >
            <Link href="/dashboard/schedule">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Class Schedule
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
