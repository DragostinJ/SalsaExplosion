/**
 * Weekly check that every practice-player video still works.
 *
 *   npx tsx scripts/check-song-videos.ts
 *
 * - Always: YouTube oEmbed (no key) -> is the video public and embeddable?
 * - With YOUTUBE_API_KEY set: also compares the real length with the song map.
 *
 * Writes a Markdown report to video-check-report.md (and the GitHub step
 * summary when running in Actions) and exits 1 if any song has a problem.
 */
import { appendFileSync, writeFileSync } from "node:fs";
import { TIMBA_SONG_ANATOMY_DATA } from "../src/lib/constants/timba-song-anatomy";
import {
  availabilityFromOembedStatus,
  describeVideoProblem,
  parseIsoDurationSeconds,
  type SongVideoCheck,
} from "../src/lib/music/video-health";

const REPORT_PATH = "video-check-report.md";

async function oembedStatus(videoId: string): Promise<number> {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
  try {
    const response = await fetch(url);
    return response.status;
  } catch {
    return 0;
  }
}

async function apiDurations(videoIds: string[], apiKey: string): Promise<Map<string, number>> {
  const durations = new Map<string, number>();
  // videos.list takes up to 50 ids per call (1 quota unit each call)
  for (let start = 0; start < videoIds.length; start += 50) {
    const ids = videoIds.slice(start, start + 50).join(",");
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${encodeURIComponent(apiKey)}`
    );
    if (!response.ok) throw new Error(`YouTube Data API answered ${response.status}`);
    const body = (await response.json()) as { items?: { id?: string; contentDetails?: { duration?: string } }[] };
    for (const item of body.items ?? []) {
      const seconds = item.contentDetails?.duration ? parseIsoDurationSeconds(item.contentDetails.duration) : null;
      if (item.id && seconds !== null) durations.set(item.id, seconds);
    }
  }
  return durations;
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  const durations = apiKey
    ? await apiDurations(TIMBA_SONG_ANATOMY_DATA.map((song) => song.youtubeVideoId), apiKey)
    : new Map<string, number>();

  const checks: SongVideoCheck[] = [];
  for (const song of TIMBA_SONG_ANATOMY_DATA) {
    checks.push({
      songId: song.id,
      title: song.title,
      videoId: song.youtubeVideoId,
      availability: availabilityFromOembedStatus(await oembedStatus(song.youtubeVideoId)),
      authoredSeconds: song.durationSeconds,
      actualSeconds: durations.get(song.youtubeVideoId) ?? null,
    });
  }

  const problems = checks.flatMap((check) => {
    const problem = describeVideoProblem(check);
    return problem ? [{ check, problem }] : [];
  });

  const lines = [
    `## Song video check: ${problems.length ? `${problems.length} problem(s)` : "all good"}`,
    "",
    `${checks.length} songs checked. Length check: ${apiKey ? "on" : "off (add a YOUTUBE_API_KEY secret to compare lengths)"}.`,
    "",
    "| Song | Video | Status |",
    "| --- | --- | --- |",
    ...checks.map((check) => {
      const problem = describeVideoProblem(check);
      return `| ${check.title} (\`${check.songId}\`) | [${check.videoId}](https://www.youtube.com/watch?v=${check.videoId}) | ${problem ? `**${problem}**` : "ok"} |`;
    }),
  ];
  if (problems.length) {
    lines.push(
      "",
      "Fix: find a working upload of the same recording, update `youtubeVideoId` in `src/lib/constants/timba-song-anatomy.ts`, then re-time or ear-calibrate the song (a different upload usually shifts every section)."
    );
  }
  const report = lines.join("\n") + "\n";

  writeFileSync(REPORT_PATH, report);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
  console.log(report);
  process.exitCode = problems.length ? 1 : 0;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
