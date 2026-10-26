"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportError } from "@/lib/monitoring";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    reportError("Admin Boundary", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-destructive">
            Admin Console Disruption
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-ivory sm:text-3xl">
            Operations Workspace Unavailable
          </h1>
          <p className="text-sm text-ivory-muted leading-relaxed">
            A temporary issue occurred while loading administrative reports or permissions. Your administrative session remains authenticated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto bg-primary-base hover:bg-primary-hover text-white font-bold"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Workspace
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-white/10 text-ivory-muted hover:bg-white/5"
          >
            <Link href="/dashboard/schedule">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Studio Schedule
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
