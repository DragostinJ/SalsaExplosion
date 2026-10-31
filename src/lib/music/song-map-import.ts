import {
  ClaveTypeSchema,
  SegmentColorThemeSchema,
  SongAnatomySchema,
  SongDanceGearSchema,
  SongDifficultySchema,
  SongStyleSchema,
  TIMBA_SONG_ANATOMY_DATA,
  TimingModeSchema,
  formatSecondsToTime,
  resolveCurriculumMove,
  type SongAnatomy,
} from "@/lib/constants/timba-song-anatomy";
import { CUBAN_CURRICULUM_DATA } from "@/lib/constants/cuban-curriculum-2027";
import { validateSongTimeline } from "@/lib/music/song-timing";

/**
 * Import pipeline for song maps produced by Argus (the Gemini timing tool):
 * paste output → parse → schema + timeline checks → preview in the real player
 * → copy a ready-to-commit entry for timba-song-anatomy.ts.
 */

export interface SongMapImportResult {
  song: SongAnatomy | null;
  errors: string[];
  warnings: string[];
}

/** Accepts raw JSON, JSON inside ```fences```, or `{ "song": {...} }`. */
function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = (fenced ? fenced[1] : raw).trim();
  const parsed: unknown = JSON.parse(text);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "song" in parsed) {
    return (parsed as { song: unknown }).song;
  }
  return parsed;
}

export function parseSongMapInput(raw: string): SongMapImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw.trim()) return { song: null, errors: ["Paste the Argus output first."], warnings };

  let candidate: unknown;
  try {
    candidate = extractJson(raw);
  } catch (err) {
    return {
      song: null,
      errors: [`Not valid JSON: ${err instanceof Error ? err.message : "parse error"}`],
      warnings,
    };
  }

  if (Array.isArray(candidate)) {
    if (candidate.length === 0) return { song: null, errors: ["The array is empty."], warnings };
    if (candidate.length > 1) warnings.push(`Found ${candidate.length} songs; only the first is imported.`);
    candidate = candidate[0];
  }

  const parsed = SongAnatomySchema.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 25)) {
      errors.push(`${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    return { song: null, errors, warnings };
  }

  const song = parsed.data;
  errors.push(...validateSongTimeline(song));

  const ids = song.segments.map((segment) => segment.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`Duplicate section ids: ${[...new Set(duplicates)].join(", ")}`);

  if (!/^[A-Za-z0-9_-]{11}$/.test(song.youtubeVideoId)) {
    warnings.push(`youtubeVideoId "${song.youtubeVideoId}" doesn't look like an 11-character YouTube id.`);
  }

  if (TIMBA_SONG_ANATOMY_DATA.some((existing) => existing.id === song.id)) {
    warnings.push(`A song with id "${song.id}" already exists; this entry would replace it.`);
  }

  for (const segment of song.segments) {
    const expectedRange = `${formatSecondsToTime(segment.startTimeSeconds)} - ${formatSecondsToTime(segment.endTimeSeconds)}`;
    if (segment.formattedRange !== expectedRange) {
      warnings.push(`${segment.id}: formattedRange "${segment.formattedRange}" should be "${expectedRange}" (fixed on copy).`);
    }
    const unknownMoves = segment.recommendedMoveSlugs.filter((slug) => !resolveCurriculumMove(slug));
    if (unknownMoves.length) {
      warnings.push(`${segment.id}: unknown move ids ${unknownMoves.join(", ")} (they won't show in "Moves to try").`);
    }
    if (segment.recommendedMoveSlugs.length === 0) {
      warnings.push(`${segment.id}: no recommended moves.`);
    }
    if (song.style !== "Timba" && segment.danceGear === "Despelote / Reparto") {
      warnings.push(`${segment.id}: despelote in a ${song.style} song; despelote belongs to timba.`);
    }
  }

  return { song: errors.length ? null : withFixedRanges(song), errors, warnings };
}

function withFixedRanges(song: SongAnatomy): SongAnatomy {
  return {
    ...song,
    segments: song.segments.map((segment) => ({
      ...segment,
      formattedRange: `${formatSecondsToTime(segment.startTimeSeconds)} - ${formatSecondsToTime(segment.endTimeSeconds)}`,
    })),
  };
}

/** Entry to paste into TIMBA_SONG_ANATOMY_DATA (JSON is valid TypeScript). */
export function toSongDataEntry(song: SongAnatomy): string {
  const header = [
    "  // -----------------------------------------------------------------",
    `  // "${song.title}" - ${song.artist}`,
    `  // ${song.style} • ${song.difficultyLevel} • ${song.bpm} BPM • ${song.claveType} • ${song.durationSeconds}s`,
    `  // Video ID: ${song.youtubeVideoId} • timings from Argus`,
    "  // -----------------------------------------------------------------",
  ].join("\n");
  const body = JSON.stringify(song, null, 2)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `${header}\n${body},`;
}

const quote = (values: readonly string[]) => values.map((value) => `"${value}"`).join(" | ");

/** Prompt for Argus so its output matches the app's schema exactly. */
export function buildArgusPrompt(): string {
  const moveIds = CUBAN_CURRICULUM_DATA.map((move) => `${move.id} (${move.name})`).join("; ");
  return `You are timing a Cuban timba/salsa song for a dance practice app.
Listen to the YouTube video and return ONLY a JSON object (no prose) with this exact shape:

{
  "id": "kebab-case-song-id",
  "title": "Song title (Official Video)",
  "artist": "Artist",
  "style": ${quote(SongStyleSchema.options)},
  "bpm": 95,
  "claveType": ${quote(ClaveTypeSchema.options)},
  "difficultyLevel": ${quote(SongDifficultySchema.options)},
  "durationSeconds": <exact video length in whole seconds>,
  "youtubeVideoId": "<11-char id of the exact video you timed>",
  "youtubeUrl": "https://www.youtube.com/watch?v=<id>",
  "segments": [
    {
      "id": "<song-prefix>-seg-1",
      "startTimeSeconds": 0,
      "endTimeSeconds": 18,
      "formattedRange": "0:00 - 0:18",
      "sectionName": "Intro / Tema / Coro / Montuno / Mambo / Bloque ...",
      "danceGear": ${quote(SongDanceGearSchema.options)},
      "colorTheme": ${quote(SegmentColorThemeSchema.options)},
      "timingMode": ${quote(TimingModeSchema.options)},
      "musicalTrigger": "What you HEAR at the start of this section",
      "leaderCue": "What the leader should dance",
      "followerCue": "What the follower should dance",
      "commonMistakeWarning": "Typical mistake here",
      "instrumentMapping": { "feet": "...", "hipsAndKnees": "...", "chestAndShoulders": "..." },
      "recommendedMoveSlugs": ["<2-3 move ids from the list below>"],
      "handGesture": "optional rueda call"
    }
  ]
}

Timing rules (critical, the app switches cues on these exact seconds):
- Time against THIS video, including any intro before the music starts.
- First segment starts at 0. Each segment starts exactly where the previous one ends (no gaps, no overlaps).
- The last segment ends exactly at durationSeconds.
- Put each boundary on the moment the new section is HEARD (the downbeat where the change lands).

Style rules:
- "style" is the genre of the whole track. Only use "Timba" for modern Cuban timba bands.
- For any other style, never use the "Despelote / Reparto" gear, and only use "Rumba Guaguancó" or "Afro-Cuban Orishas" when that rhythm is really played in the section.

Allowed move ids for recommendedMoveSlugs: ${moveIds}`;
}
