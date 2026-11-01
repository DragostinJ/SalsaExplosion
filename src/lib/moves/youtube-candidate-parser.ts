import { z } from "zod";
import { parseIsoDurationSeconds } from "@/lib/music/video-health";

/**
 * YouTube Data API v3 Search List item schema.
 */
export const YouTubeSearchItemSchema = z.object({
  id: z.object({
    kind: z.string().optional(),
    videoId: z.string().optional(),
  }),
  snippet: z
    .object({
      title: z.string().optional(),
      channelTitle: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export const YouTubeSearchResponseSchema = z.object({
  items: z.array(YouTubeSearchItemSchema).optional().default([]),
});

/**
 * YouTube Data API v3 Videos List item schema.
 */
export const YouTubeVideoItemSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    channelTitle: z.string(),
    description: z.string().optional(),
  }),
  contentDetails: z.object({
    duration: z.string(), // ISO 8601 duration e.g. "PT4M12S"
  }),
  status: z
    .object({
      embeddable: z.boolean().optional().default(true),
      privacyStatus: z.string().optional(),
    })
    .optional(),
});

export const YouTubeVideosResponseSchema = z.object({
  items: z.array(YouTubeVideoItemSchema),
});

export interface YouTubeCandidateVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  durationSeconds: number;
  formattedDuration: string;
  embeddable: boolean;
  link: string;
}

/**
 * Formats duration in seconds to "m:ss" format.
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Pure function: merges and parses YouTube Search and Video API responses into candidate videos.
 */
export function parseYouTubeCandidateResponses(
  searchJson: unknown,
  videosJson: unknown
): YouTubeCandidateVideo[] {
  const searchParsed = YouTubeSearchResponseSchema.safeParse(searchJson);
  const videosParsed = YouTubeVideosResponseSchema.safeParse(videosJson);

  if (!videosParsed.success) {
    throw new Error(
      `Failed to parse YouTube videos response: ${videosParsed.error.message}`
    );
  }

  // Create a map of video details by videoId
  const videoDetailsMap = new Map<string, z.infer<typeof YouTubeVideoItemSchema>>();
  for (const item of videosParsed.data.items) {
    videoDetailsMap.set(item.id, item);
  }

  // Preserve order from search results if available
  const orderedIds: string[] = [];
  if (searchParsed.success) {
    for (const searchItem of searchParsed.data.items) {
      if (searchItem.id.videoId && !orderedIds.includes(searchItem.id.videoId)) {
        orderedIds.push(searchItem.id.videoId);
      }
    }
  }

  // Include any IDs in videos.list that were not in search.list
  for (const id of videoDetailsMap.keys()) {
    if (!orderedIds.includes(id)) {
      orderedIds.push(id);
    }
  }

  const results: YouTubeCandidateVideo[] = [];

  for (const id of orderedIds) {
    const video = videoDetailsMap.get(id);
    if (!video) continue;

    const durationSeconds = parseIsoDurationSeconds(video.contentDetails.duration) ?? 0;
    const embeddable = video.status?.embeddable ?? true;

    results.push({
      videoId: id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      durationSeconds,
      formattedDuration: formatDuration(durationSeconds),
      embeddable,
      link: `https://www.youtube.com/watch?v=${id}`,
    });
  }

  return results;
}

/**
 * Formats a move's candidate videos as a clean markdown table.
 */
export function formatCandidatesMarkdownTable(
  moveName: string,
  candidates: readonly YouTubeCandidateVideo[]
): string {
  const lines: string[] = [
    `### ${moveName}`,
    "",
    "| Title | Channel | Length | Link | Embeddable |",
    "|---|---|---|---|---|",
  ];

  if (candidates.length === 0) {
    lines.push("| *(No embeddable candidates found)* | - | - | - | - |");
  } else {
    for (const c of candidates) {
      const sanitizedTitle = c.title.replace(/\|/g, "\\|").trim();
      const sanitizedChannel = c.channelTitle.replace(/\|/g, "\\|").trim();
      lines.push(
        `| ${sanitizedTitle} | ${sanitizedChannel} | ${c.formattedDuration} | [Watch](${c.link}) | ${c.embeddable ? "Yes" : "No"} |`
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}
