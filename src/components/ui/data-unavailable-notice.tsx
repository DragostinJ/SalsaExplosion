import React from "react";

interface DataUnavailableNoticeProps {
  title?: string;
  description?: string;
}

export function DataUnavailableNotice({
  title = "Data Temporarily Unavailable",
  description = "We couldn't load your latest data. Your passes and bookings are safe — please reload in a moment.",
}: DataUnavailableNoticeProps) {
  return (
    <div
      role="status"
      data-testid="data-unavailable-notice"
      className="mb-6 rounded-xl border border-gold/30 bg-gold/10 p-4 text-white shadow-lg backdrop-blur-md"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-wide text-gold">
            {title}
          </p>
          <p className="text-xs text-white/80 leading-relaxed">
            {description}
          </p>
        </div>
        <a
          href=""
          className="inline-flex items-center justify-center rounded-lg border border-gold/40 bg-gold/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/30 transition-colors"
        >
          Reload
        </a>
      </div>
    </div>
  );
}
