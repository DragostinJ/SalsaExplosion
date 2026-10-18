"use client";

import { useState } from "react";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CalendarEventDetails,
  downloadIcsFile,
  getGoogleCalendarUrl,
} from "@/lib/calendar-export";

interface AddToCalendarButtonProps {
  event: CalendarEventDetails;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function AddToCalendarButton({
  event,
  size = "sm",
  variant = "outline",
  className = "",
}: AddToCalendarButtonProps) {
  const [showOptions, setShowOptions] = useState(false);

  const googleUrl = getGoogleCalendarUrl(event);

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        size={size}
        variant={variant}
        onClick={() => setShowOptions((prev) => !prev)}
        className={`text-xs font-semibold ${className}`}
      >
        <Calendar className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
        Add to Calendar
      </Button>

      {showOptions && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-52 rounded-xl border bg-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
        >
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setShowOptions(false)}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold hover:bg-muted text-foreground transition-colors"
          >
            <span>Google Calendar</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>

          <button
            type="button"
            onClick={() => {
              downloadIcsFile(event);
              setShowOptions(false);
            }}
            className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold hover:bg-muted text-foreground transition-colors text-left"
          >
            <span>Apple / Outlook (.ics)</span>
            <Download className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
