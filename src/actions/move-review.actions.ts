"use server";

import { z } from "zod";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { availabilityFromOembedStatus } from "@/lib/music/video-health";
import {
  CheckMoveVideoOembedInputSchema,
  type MoveVideoOembedResult,
} from "@/lib/moves/move-review";

const OembedResponseSchema = z.object({
  title: z.string().min(1),
  author_name: z.string().min(1),
});

/**
 * Staff-only server action to verify a YouTube video through oEmbed.
 * Enforces STAFF_ROLES, validates videoId via Zod, and times out after 5 seconds.
 */
export async function checkMoveVideoOembedAction(
  rawInput: unknown
): Promise<MoveVideoOembedResult> {
  await requireRole(STAFF_ROLES);

  const parsed = CheckMoveVideoOembedInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const id =
      rawInput && typeof rawInput === "object" && "videoId" in rawInput
        ? String((rawInput as { videoId: unknown }).videoId)
        : "";
    return {
      success: false,
      videoId: id,
      availability: "unknown",
      error: `Invalid video ID: ${parsed.error.issues[0]?.message}`,
    };
  }

  const { videoId } = parsed.data;
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);

    const availability = availabilityFromOembedStatus(res.status);
    if (availability !== "ok" || !res.ok) {
      return {
        success: false,
        videoId,
        availability,
        error:
          availability === "not-embeddable"
            ? "Embedding is disabled by the creator for this video."
            : availability === "unavailable"
            ? "Video is unavailable or private on YouTube."
            : `YouTube returned status ${res.status}`,
      };
    }

    const json = await res.json();
    const data = OembedResponseSchema.parse(json);

    return {
      success: true,
      videoId,
      title: data.title,
      channelTitle: data.author_name,
      availability: "ok",
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    clearTimeout(timer);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    return {
      success: false,
      videoId,
      availability: "unknown",
      error: isTimeout
        ? "YouTube oEmbed request timed out (5s limit)."
        : `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
