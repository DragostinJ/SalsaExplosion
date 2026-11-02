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
      className="mb-6 border-2 border-ink bg-poster-mustard p-4 text-ink shadow-[4px_4px_0_var(--color-ink)]"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-wider text-ink">
            {title}
          </p>
          <p className="text-xs text-ink leading-relaxed font-medium">
            {description}
          </p>
        </div>
        <a
          href=""
          className="inline-flex items-center justify-center border-2 border-ink bg-ink px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-ink hover:bg-poster-red transition-colors shadow-[2px_2px_0_var(--color-ink)]"
        >
          Reload
        </a>
      </div>
    </div>
  );
}
