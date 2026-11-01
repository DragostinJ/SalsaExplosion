"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, AlertCircle, ArrowLeft } from "lucide-react";
import { reportError } from "@/lib/monitoring";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EventsErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    reportError("Events Boundary", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full border-4 border-ink bg-paper p-6 sm:p-8 text-center text-ink shadow-[8px_8px_0_0_#161311] space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border-4 border-ink bg-poster-red text-ink">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <p className={KICKER}>Festival Calendar</p>
          <h1 className={`font-display ${TYPE.card} text-ink`}>
            Could Not Load Festival Information
          </h1>
          <p className="text-sm text-ink/80 leading-relaxed font-medium">
            The festival and congress passes directory encountered an issue while retrieving ticket tiers.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink/60 pt-1">
              Reference: {typeof error.digest === "string" ? error.digest : "SESSION_ERROR"}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} w-full sm:w-auto text-xs`}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Events
          </button>

          <Link
            href="/dashboard/schedule"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper w-full sm:w-auto text-xs`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Weekly Classes
          </Link>
        </div>
      </div>
    </main>
  );
}
