"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Crash]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-black text-rose-600">
            Salsa Explosion
          </h1>
          <h2 className="text-lg font-bold text-slate-900">
            Critical Studio Error
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            The studio platform encountered an unexpected hiccup. Please refresh the page or try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-rose-700 transition-colors"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reload Studio
          </button>
        </div>
      </body>
    </html>
  );
}
