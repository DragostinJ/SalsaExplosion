/**
 * Helpers for the weekly song video check (scripts/check-song-videos.ts).
 * Several songs are fan uploads that can disappear or be re-cut; when the
 * video changes, every authored section time is suspect.
 */

/** Seconds from an ISO 8601 duration as returned by the YouTube Data API (e.g. "PT5M43S"). */
export function parseIsoDurationSeconds(value: string): number | null {
  const match = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(value);
  if (!match || value === "P" || value === "PT") return null;
  const [, days, hours, minutes, seconds] = match;
  return Number(days ?? 0) * 86400 + Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0);
}

export type VideoAvailability = "ok" | "not-embeddable" | "unavailable" | "unknown";

/** Meaning of the HTTP status from https://www.youtube.com/oembed for a video URL. */
export function availabilityFromOembedStatus(status: number): VideoAvailability {
  if (status === 200) return "ok";
  if (status === 401 || status === 403) return "not-embeddable";
  if (status === 404 || status === 400) return "unavailable";
  return "unknown";
}

/** The player warns at 2s; the weekly check uses the same tolerance. */
export const VIDEO_DURATION_TOLERANCE_SECONDS = 2;

export interface SongVideoCheck {
  songId: string;
  title: string;
  videoId: string;
  availability: VideoAvailability;
  authoredSeconds: number;
  actualSeconds: number | null;
}

export function describeVideoProblem(check: SongVideoCheck): string | null {
  if (check.availability === "unavailable") return "video removed or private";
  if (check.availability === "not-embeddable") return "embedding disabled by the uploader";
  if (check.availability === "unknown") return "YouTube didn't answer clearly (re-run later)";
  if (check.actualSeconds !== null) {
    const diff = check.actualSeconds - check.authoredSeconds;
    if (Math.abs(diff) >= VIDEO_DURATION_TOLERANCE_SECONDS) {
      return `video is ${Math.abs(diff).toFixed(1)}s ${diff > 0 ? "longer" : "shorter"} than the song map (re-cut? re-time it)`;
    }
  }
  return null;
}
