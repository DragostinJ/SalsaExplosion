import {
  ClaveTypeSchema,
  SegmentColorThemeSchema,
  SongDanceGearSchema,
  SongDifficultySchema,
  SongStyleSchema,
  TimingModeSchema,
  type SegmentColorTheme,
  type SongDanceGear,
} from "@/lib/constants/timba-song-anatomy";
import { CUBAN_CURRICULUM_DATA } from "@/lib/constants/cuban-curriculum-2027";

/**
 * Setup for the Google AI Studio "song maker" (Argus): system instructions and
 * the structured-output schema, built from the same enums the importer
 * validates against, so AI Studio can only produce values the app accepts.
 * Regenerate the files with: npx tsx scripts/ai-studio-song-maker.ts
 */

export const GEAR_GUIDE: Record<SongDanceGear, { color: SegmentColorTheme; meaning: string }> = {
  "Wait / Breathe": { color: "slate", meaning: "no beat, talking or rubato intro: stand, listen, find the clave, don't start dancing" },
  "Son Cubano": { color: "blue", meaning: "real son feel: small steps, close hold, often contratiempo, lyrical tema" },
  "Casino (Smooth)": { color: "emerald", meaning: "relaxed social casino: basic figures, storytelling verses" },
  "Casino (Flow)": { color: "emerald", meaning: "full-energy casino: coro-pregón montuno, longer turn patterns" },
  "Rumba Guaguancó": { color: "red", meaning: "a rumba section is really played: open break, guaguancó steps, vacunao play" },
  "Afro-Cuban Orishas": { color: "amber", meaning: "6/8 or Afro section is really played: Orisha movements (Yemayá, Eleguá, Changó…)" },
  "Suelta / Shines": { color: "purple", meaning: "let go: solo footwork/shines on mambos, breaks, bloques, instrumental solos" },
  "Despelote / Reparto": { color: "red", meaning: "timba despelote/bomba: hands off, body isolations, hips, cintura (TIMBA ONLY)" },
};

export function buildSongMakerSystemInstructions(): string {
  const gears = SongDanceGearSchema.options
    .map((gear) => `- "${gear}" (colorTheme "${GEAR_GUIDE[gear].color}"): ${GEAR_GUIDE[gear].meaning}`)
    .join("\n");
  const moves = CUBAN_CURRICULUM_DATA.map((move) => `${move.id} = ${move.name}`).join("; ");

  return `You are Argus, the song maker for RitmoFlow, the Salsa Explosion UK (Bournemouth) dance practice player.

WHAT THE APP DOES WITH YOUR ANSWER
The player plays the attached YouTube video full-screen on a phone and shows a NOW card (what to dance in this section) and a NEXT card. The card flips on the EXACT second you give as a section start. Dancers use it to learn where to dance slow, fast, contratiempo, son, rumba, shines or despelote. Timing accuracy matters more than anything else. Your answer must follow the response schema exactly; every label comes from fixed lists.

HOW TO WORK (one song per run)
1. Listen to the WHOLE attached video from 0:00 to the end. Use only what you hear in THIS video. Never use timings from the album version, another upload, lyrics sites or memory.
2. durationSeconds = the full length of this video in whole seconds, including any talking, silence or cinematic intro.
3. Find every section change by ear: vocals entering, tema to coro, coro-pregón montuno, mambo/brass, bloque or break, despelote/bomba drop, piano or timbal solo, outro.
4. Put each section start on the downbeat (the "1") where the new section is HEARD, not where the singer breathes before it. One decimal is allowed (e.g. 61.5).
5. Count the 4/4 bars in each section ("bars") and say whether it starts on a "1" ("startsOnOne").
6. Self-check every section: bars should be close to (endTimeSeconds - startTimeSeconds) x bpm / 240. If it is off by more than one bar, listen again and fix the boundary or the bar count.
7. List every section start you are not sure of to within 1 second in "unsureBoundaries" (with the range it could be and why). An empty list means you are sure of all of them.

TIMING RULES (the app rejects anything else)
- The first section starts at 0. endTimeSeconds of a section = startTimeSeconds of the next one (0-28, 28-60, never 0-27, 28-59). The last section ends exactly at durationSeconds.
- formattedRange matches the numbers as "m:ss - m:ss".
- 8 to 16 sections per song. No section shorter than 6 seconds unless it is a real break the dancers must react to. Merge neighbouring sections that would get the same dance instructions.
- Section ids: a short prefix for the song plus a number, e.g. "pupy-seg-1". Song id: kebab-case title without the artist.

STYLE (genre of the whole track; be honest, not every salsa song is timba)
- "Timba" only for modern Cuban timba bands (Havana D'Primera, Los Van Van, Maykel Blanco, El Niño y La Verdad, Manolito Simonet, Pupy y Los Que Son Son, Elito Revé…).
- For any other style: never use "Despelote / Reparto"; use "Rumba Guaguancó" or "Afro-Cuban Orishas" only when that rhythm is really played; use "Son Cubano" only for real son.

DANCE GEARS (what the dancers should do, not just the musical section name)
${gears}

TIMING MODES: "A Tiempo (On1)" for normal casino on 1; "Contratiempo (On2)" or "Contratiempo (On2) or Smooth On1" for son feel; "Contrapunto (On2 <-> On1)" when the music plays against the beat; "Syncopated Reparto" for reparto/despelote grooves; "Free / Polyrhythmic (6/8)" for Afro 6/8; "Ambient (No Beat)" when there is no beat.

LEVEL: Beginner = steady beat, long clear sections. Improver = some breaks and gear changes. Intermediate = frequent gear changes, montuno/mambo shifts. Advanced = fast tempo, many bloques, contratiempo/contrapunto, despelote.

CUES (read on a phone while dancing)
- Every cue at most ~20 words, plain English; Spanish dance terms are fine.
- leaderCue and followerCue must differ when the roles really do different things.
- musicalTrigger = what you HEAR at the start of the section (instrument, vocal line, coro words), with timestamps like 2:55 when useful.
- instrumentMapping = which instrument the feet, hips/knees and chest/shoulders follow.

MOVES: recommendedMoveSlugs = 1 to 3 ids that really fit the section and the song's level. Vary them; don't repeat the same pair in every section.
${moves}

RUEDA CALL: handGesture = a real rueda call and its hand signal, written "Call (signal)", e.g. "Dedo (Index finger pointing straight up)", only where a caller would really call it. Otherwise an empty string "". Never adjectives like "relaxed" or "dynamic".

Answer with the JSON only.`;
}

type JsonSchema = Record<string, unknown>;

const text = (description: string): JsonSchema => ({ type: "string", description });
const choice = (values: readonly string[], description: string): JsonSchema => ({
  type: "string",
  format: "enum",
  enum: [...values],
  description,
});

/** Structured-output schema for AI Studio (OpenAPI subset Gemini supports). */
export function buildSongMakerResponseSchema(): JsonSchema {
  const segmentProperties: Record<string, JsonSchema> = {
    id: text('Short song prefix plus number, e.g. "pupy-seg-1"'),
    startTimeSeconds: { type: "number", description: "Second the section is HEARD in this video (downbeat). First section 0." },
    endTimeSeconds: { type: "number", description: "Equals the next section's start; last section ends at durationSeconds." },
    formattedRange: text('"m:ss - m:ss" matching the numbers'),
    sectionName: text("Intro / Tema / Coro / Montuno / Mambo / Bloque / Despelote / Final …, with the coro words if useful"),
    bars: { type: "integer", description: "4/4 bars in this section; close to duration x bpm / 240" },
    startsOnOne: { type: "boolean", description: "True when the section starts on a downbeat (the 1)" },
    danceGear: choice(SongDanceGearSchema.options, "What the dancers should do (see system instructions)"),
    colorTheme: choice(SegmentColorThemeSchema.options, "Colour that matches the dance gear"),
    timingMode: choice(TimingModeSchema.options, "How to time the steps in this section"),
    musicalTrigger: text("What you hear at the start of this section"),
    leaderCue: text("What the leader dances, at most ~20 words"),
    followerCue: text("What the follower dances, at most ~20 words"),
    commonMistakeWarning: text("The typical mistake here"),
    instrumentMapping: {
      type: "object",
      properties: {
        feet: text("Instrument the feet follow"),
        hipsAndKnees: text("Instrument the hips and knees follow"),
        chestAndShoulders: text("Instrument the chest and shoulders follow"),
      },
      required: ["feet", "hipsAndKnees", "chestAndShoulders"],
      propertyOrdering: ["feet", "hipsAndKnees", "chestAndShoulders"],
    },
    recommendedMoveSlugs: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: choice(
        CUBAN_CURRICULUM_DATA.map((move) => move.id),
        "Curriculum move id that fits this section"
      ),
    },
    handGesture: text('Real rueda call "Call (signal)" or "" when none'),
  };
  const segmentKeys = Object.keys(segmentProperties);

  const rootProperties: Record<string, JsonSchema> = {
    id: text("kebab-case song id, title without the artist"),
    title: text("Song title as on the video, e.g. 'Me Dicen Cuba (Official Video)'"),
    artist: text("Artist and band"),
    style: choice(SongStyleSchema.options, "Genre of the whole track; Timba only for modern Cuban timba bands"),
    bpm: { type: "integer", description: "Main tempo in beats per minute" },
    claveType: choice(ClaveTypeSchema.options, "Clave of the song"),
    difficultyLevel: choice(SongDifficultySchema.options, "One level only"),
    durationSeconds: { type: "integer", description: "Full length of THIS video in whole seconds" },
    youtubeVideoId: text("11-character id of the attached video"),
    youtubeUrl: text("https://www.youtube.com/watch?v=<id>"),
    segments: {
      type: "array",
      minItems: 3,
      maxItems: 20,
      items: { type: "object", properties: segmentProperties, required: segmentKeys, propertyOrdering: segmentKeys },
    },
    unsureBoundaries: {
      type: "array",
      description: "Section starts you are not sure of to within 1 second; empty when sure of all",
      items: {
        type: "object",
        properties: {
          sectionId: text("Section id"),
          start: { type: "number", description: "The start you gave" },
          couldBe: text('Range it could be, e.g. "2:50-3:00"'),
          reason: text("Why it is unclear"),
        },
        required: ["sectionId", "start", "couldBe", "reason"],
        propertyOrdering: ["sectionId", "start", "couldBe", "reason"],
      },
    },
  };
  const rootKeys = Object.keys(rootProperties);
  return { type: "object", properties: rootProperties, required: rootKeys, propertyOrdering: rootKeys };
}
