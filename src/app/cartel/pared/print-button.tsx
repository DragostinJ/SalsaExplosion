"use client";

import { Printer } from "lucide-react";
import { POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} gap-2`}>
      <Printer className="h-4 w-4" aria-hidden="true" />
      Print on A3
    </button>
  );
}
