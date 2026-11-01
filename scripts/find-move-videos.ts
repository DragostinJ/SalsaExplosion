/**
 * YouTube Candidate Video Finder for the RitmoFlow Move Library.
 * Queries YouTube Data API v3 for tutorial videos matching curriculum moves.
 *
 * Usage:
 *   npx tsx scripts/find-move-videos.ts                 (finds candidates for core beginner moves)
 *   npx tsx scripts/find-move-videos.ts guapea         (finds candidates for a specific move)
 *   npx tsx scripts/find-move-videos.ts --all          (finds candidates for all 30 curriculum moves)
 *
 * Requirements:
 *   YOUTUBE_API_KEY in environment or .env.local
 */

import { writeFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { SEEDED_MOVES, findMove } from "../src/lib/moves/move-library";
import {
  parseYouTubeCandidateResponses,
  formatCandidatesMarkdownTable,
  type YouTubeCandidateVideo,
} from "../src/lib/moves/youtube-candidate-parser";

const CANDIDATES_FILE = path.resolve(__dirname, "../docs/move-video-candidates.md");

const YOUTUBE_RULES_HEADER = `# YouTube Video Candidates & Integration Standards

> [!IMPORTANT]
> **Strict YouTube Platform Rules & Terms of Service**
> All move video integrations in RitmoFlow must strictly adhere to YouTube's developer terms:
> 1. **Official Embedded Player Only:** Render videos solely via the official YouTube IFrame Player API.
> 2. **Start and End Timing Permitted:** You may configure \`startSeconds\` and \`endSeconds\` player parameters to cue the exact demonstration moment.
> 3. **No Downloading or Re-Hosting:** Video files must never be scraped, downloaded, transcoded, or re-hosted.
> 4. **No Obscuring or Shrinking:** Never place UI overlays over active video controls, and maintain player dimensions at or above 200×200 px.
> 5. **Creator Attribution:** Always credit the source channel title and link directly to the original video.
> 6. **Zero Paywalls on Third-Party Content:** Third-party tutorials may never be placed behind paywalls or premium tiers.
> 7. **Direct Permission:** Reach out to Cuban salsa dance creators and channels for explicit collaboration wherever possible.

---

## YouTube Data API v3 Quota Economics
- \`search.list\` query: **100 units** per call.
- \`videos.list\` query: **1 unit** per call.
- Default developer quota: **10,000 units / day** (approx. 90-95 search queries per day).
- Recommendation: Query moves in batches or on-demand rather than running bulk automated sweeps daily.

---

## Move Video Candidates Table
A human instructor or curator must review candidates, select the cleanest demonstration, determine precise \`startSeconds\` and \`endSeconds\`, and verify embeddability before committing to move data.

`;

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.log(`
========================================================================
Notice: YOUTUBE_API_KEY environment variable is not set.
========================================================================
To query live YouTube tutorial candidates:
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create or select your project.
3. Enable 'YouTube Data API v3' in APIs & Services -> Library.
4. Go to Credentials -> Create Credentials -> API key.
5. Set your key:
   PowerShell:  $env:YOUTUBE_API_KEY="AIzaSy..."
   Bash:        export YOUTUBE_API_KEY="AIzaSy..."
   or place it in your local .env file.
========================================================================
`);
    // Ensure docs/move-video-candidates.md exists with YouTube rules and quota guide
    if (!existsSync(CANDIDATES_FILE)) {
      writeFileSync(CANDIDATES_FILE, YOUTUBE_RULES_HEADER);
      console.log(`Initialized ${CANDIDATES_FILE} with YouTube rules and quota guidelines.`);
    }
    process.exit(0);
  }

  const args = process.argv.slice(2);
  let targetMoves = SEEDED_MOVES.slice(0, 5); // default first 5 core moves

  if (args.includes("--all")) {
    targetMoves = [...SEEDED_MOVES];
  } else if (args[0] && !args[0].startsWith("-")) {
    const move = findMove(args[0]);
    if (move) {
      targetMoves = [move];
    } else {
      console.error(`Move "${args[0]}" not found in curriculum.`);
      process.exit(1);
    }
  }

  console.log(`Searching YouTube candidates for ${targetMoves.length} move(s)...`);
  console.log(`Estimated quota cost: ${targetMoves.length * 101} units (out of 10,000 daily units).`);

  let docContent = existsSync(CANDIDATES_FILE)
    ? readFileSync(CANDIDATES_FILE, "utf8")
    : YOUTUBE_RULES_HEADER;

  for (const move of targetMoves) {
    const searchPhrase = `${move.spanishName || move.name} casino salsa tutorial`;
    console.log(`\nQuerying for: "${searchPhrase}"`);

    try {
      // 1. search.list (100 units)
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        searchPhrase
      )}&type=video&maxResults=10&videoEmbeddable=true&safeSearch=strict&key=${apiKey}`;

      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) {
        console.error(`YouTube search error: ${searchRes.status} ${searchRes.statusText}`);
        continue;
      }
      const searchJson = await searchRes.json();
      const videoIds = (searchJson.items || [])
        .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
        .filter(Boolean) as string[];

      if (videoIds.length === 0) {
        console.log(`No videos found for "${move.name}".`);
        continue;
      }

      // 2. videos.list (1 unit)
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${videoIds.join(
        ","
      )}&key=${apiKey}`;

      const videosRes = await fetch(videosUrl);
      if (!videosRes.ok) {
        console.error(`YouTube videos.list error: ${videosRes.status} ${videosRes.statusText}`);
        continue;
      }
      const videosJson = await videosRes.json();

      // 3. Parse with pure parser
      const candidates: YouTubeCandidateVideo[] = parseYouTubeCandidateResponses(
        searchJson,
        videosJson
      );

      console.log(`Found ${candidates.length} candidate video(s) for "${move.name}".`);

      const tableMd = formatCandidatesMarkdownTable(
        `${move.name} (${move.id})`,
        candidates
      );

      // Append or replace table in markdown
      if (docContent.includes(`### ${move.name}`)) {
        // Replace existing section
        const regex = new RegExp(`### ${move.name}[\\s\\S]*?(?=### |$)`);
        docContent = docContent.replace(regex, tableMd);
      } else {
        docContent += "\n" + tableMd;
      }
    } catch (err) {
      console.error(`Failed to fetch YouTube candidates for "${move.name}":`, err);
    }
  }

  writeFileSync(CANDIDATES_FILE, docContent);
  console.log(`\nUpdated ${CANDIDATES_FILE}`);
}

main().catch((err) => {
  console.error("Unhandled error in find-move-videos:", err);
  process.exit(1);
});
