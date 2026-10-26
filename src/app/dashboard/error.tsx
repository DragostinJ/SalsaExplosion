"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Dashboard Boundary]", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-destructive">
            Student Portal Notice
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-ivory sm:text-3xl">
            Unable to Load Dashboard
          </h1>
          <p className="text-sm text-ivory-muted leading-relaxed">
            We could not connect to your dance records right now. Weekly classes run strictly Thursdays and Sundays at BOH Studios.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono tracking-wider uppercase text-stone-400 pt-1">
              Reference: {typeof error.digest === "string" ? error.digest : "SESSION_ERROR"}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto bg-primary-base hover:bg-primary-hover text-white font-bold"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reload Portal
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-white/10 text-ivory-muted hover:bg-white/5"
          >
            <Link href="/dashboard/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              View Timetable
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
