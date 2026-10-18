"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintRosterControlsProps {
  autoPrint?: boolean;
  backUrl?: string;
}

export function PrintRosterControls({
  autoPrint = false,
  backUrl = "/instructor/roster",
}: PrintRosterControlsProps) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  return (
    <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-xs">
      <Button variant="outline" size="sm" asChild className="text-xs font-semibold">
        <Link href={backUrl}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Live Roster
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Format: Clean A4 portrait with Lead/Follow tables
        </span>
        <Button
          type="button"
          onClick={() => window.print()}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
        >
          <Printer className="mr-1.5 h-4 w-4" />
          Print Paper Roster
        </Button>
      </div>
    </div>
  );
}
