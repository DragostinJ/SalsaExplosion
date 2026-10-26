"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log exception safely to diagnostics without exposing details to user
    console.error("[Salsa Explosion Boundary]", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-destructive">
            Temporary Misstep
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            A Misstep on the Floor
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Something went off-beat while loading this section. Our dance studio coordinators have been informed. Try recovering the step below:
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground/80 pt-1">
              Reference: {typeof error.digest === "string" ? error.digest : "SESSION_ERROR"}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto bg-primary-base hover:bg-primary-hover text-white font-bold shadow-md shadow-primary-base/20 transition-colors"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again (Recover Step)
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-secondary-base/40 text-secondary-hover hover:bg-secondary-light/40 font-semibold"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4 text-secondary-base" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
