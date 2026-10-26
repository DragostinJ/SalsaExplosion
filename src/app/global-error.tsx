"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { reportError } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError("Global Error Crash", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        className="min-h-screen bg-canvas text-ivory flex items-center justify-center p-4 font-sans"
        style={{ backgroundColor: "#080706", color: "#F5F2EB" }}
      >
        <div
          className="max-w-md w-full text-center space-y-4 rounded-2xl border border-line bg-surface-1 p-8 shadow-2xl"
          style={{ backgroundColor: "#0E0C0A", borderColor: "#26221F" }}
        >
          <span className="text-[11px] font-black uppercase tracking-widest text-gold block">
            SALSA EXPLOSION BOURNEMOUTH
          </span>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-ivory">
            Application Error
          </h1>
          <p className="text-sm text-ivory-muted leading-relaxed">
            The studio platform encountered an unexpected hiccup. Please refresh the page or try again.
          </p>
          {error?.digest && (
            <p
              className="text-[11px] font-mono tracking-wider uppercase"
              style={{ color: "#A8A29E" }}
            >
              Reference: {typeof error.digest === "string" ? error.digest : "SESSION_ERROR"}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-brand-hover transition-colors cursor-pointer"
            style={{ backgroundColor: "#D9381E", color: "#FFFFFF" }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reload Studio
          </button>
        </div>
      </body>
    </html>
  );
}
