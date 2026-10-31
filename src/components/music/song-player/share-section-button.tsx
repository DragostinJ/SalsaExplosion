"use client";

import { useState } from "react";
import { Link2, Share2 } from "lucide-react";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";
import { buildSectionLink } from "@/lib/music/section-link";

interface ShareSectionButtonProps {
  songId: string;
  segment: SongSegment;
}

/** Share (or copy) a link that opens the player at this section, e.g. for the class WhatsApp group. */
export function ShareSectionButton({ songId, segment }: ShareSectionButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = buildSectionLink(window.location.origin, songId, segment.id);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: segment.sectionName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Share sheet dismissed or clipboard blocked: nothing to do
    }
  };

  const Icon = copied ? Link2 : Share2;
  return (
    <button
      type="button"
      onClick={share}
      className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-3 text-xs font-bold text-ivory focus-visible:outline-2 focus-visible:outline-gold"
    >
      <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
      {copied ? "Link copied" : "Share this section"}
    </button>
  );
}
