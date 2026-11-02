import { MOVE_CATEGORIES, MoveCategorySchema } from "./move-schema";
import { CurriculumLevelSchema } from "@/lib/constants/cuban-curriculum-2027";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { getPublishedMoves } from "./move-library";
import type { JsonSchema } from "./move-maker-spec";

/**
 * Setup for the Google AI Studio "Move Mapper": it watches a YouTube clip of dancers and writes a
 * "ritmoflow-clip-breakdown" that a teacher checks row by row at /instructor/clips.
 * Two prompts: the segmenter (pass 1, whole video at 1 fps: where does each piece of dancing start
 * and end) and the mapper (pass 2, one piece at a time at a higher frame rate: what is danced).
 * Regenerate the AI Studio files with: npx tsx scripts/ai-studio-move-mapper.ts
 */

export const CLIP_BREAKDOWN_KIND = "ritmoflow-clip-breakdown";
export const CLIP_ROW_TYPES = [
  "figure",
  "shine",
  "rumba",
  "body-movement",
  "musicality-accent",
  "show-trick",
  "other",
] as const;
export const CLIP_MATCHES = ["same", "variation", "not-in-library"] as const;
export const CLIP_CONFIDENCES = ["high", "medium", "low"] as const;
export const CLIP_PIECE_KINDS = ["partnerwork", "solo", "rumba", "break", "not-dancing"] as const;

/** Frame rate the mapper pass should use: hand changes take less than a second. */
export const MAPPER_DEFAULT_FPS = 8;

const text = (description: string): JsonSchema => ({ type: "string", description });
const choice = (values: readonly string[], description: string): JsonSchema => ({
  type: "string",
  format: "enum",
  enum: [...values],
  description,
});
const object = (properties: Record<string, JsonSchema>, required: string[]): JsonSchema => ({
  type: "object",
  properties,
  required,
  propertyOrdering: Object.keys(properties),
});

const TIME_FORMAT =
  'Time in the ORIGINAL video as "M:SS" (e.g. "1:05", "12:40"); one decimal only when sure ("1:05.5"); "H:MM:SS" past an hour';

/** One line per move dancers can see: what the mapper may name. */
export function buildMoveCatalogue(): string {
  return getPublishedMoves()
    .map((m) => {
      const spanish = m.spanishName && m.spanishName !== m.name ? ` (${m.spanishName})` : "";
      return `- ${m.id} | ${m.name}${spanish} | ${m.category} | ${m.eightCounts}x8 | ${m.summary}`;
    })
    .join("\n");
}

export function buildMoveMapperSystemInstructions(): string {
  const songIds = TIMBA_SONG_ANATOMY_DATA.map((s) => `${s.id} (${s.title})`).join("; ");

  return `You are the Move Mapper for RitmoFlow, the practice app of Salsa Explosion, a Cuban salsa (casino) school in Bournemouth, UK.

YOUR JOB
You watch one piece of a YouTube video of dancers dancing Cuban salsa (casino, rumba, son, reparto, Afro-Cuban) and write down what they dance, row by row. A teacher at the school checks every row against the video before any dancer sees it. A row the teacher can check quickly is worth more than a clever guess. Being right about what you could not see is impossible; say so instead.

WHAT THE USER MESSAGE GIVES YOU
- The video (attached) and its URL.
- The piece to analyse: its start and end time in the original video. No piece given = the whole video.
- Clip id, title, channel, dancers and song id: copy them exactly into the header. Never invent them. If one is missing write "unknown" (leave songId out).
- Optionally the song map (the sections of the music with times) and the frame rate you were given.

HOW TO WORK
1. Times. Every time is in the ORIGINAL video, as "M:SS". If the video was clipped for you so that its first frame is the piece start, add the piece start to what you see. Rows are in time order, inside the piece, and never overlap.
2. One row per unit of dancing, cut where the dancing changes, never at fixed intervals:
   - a partnerwork figure from its entry to its exit (Cuban figures usually start and end in open position: guapea, dile que no, or a check);
   - a shine (suelta) phrase;
   - a rumba passage;
   - a body-movement passage (despelote, tembleque);
   - a short musical accent (a freeze, a hit, a stop).
   Rows usually last 4 to 20 seconds. Teaching talk, walking and applause are one "other" row each, or are skipped.
3. Describe first, name last. In "mechanics" write what you actually see, count by count where you can:
   - which hands hold (right-to-right, left-to-left, both, cross-hand, none) and every hand change;
   - who turns, how many times, and which way (to the follower's right or left);
   - where the hands travel (over her head, over his head, behind a back, around the neck, at the waist);
   - the position (open, closed, side by side, one behind the other).
   If someone in the video SAYS the move's name, start mechanics with "Name heard: <name>." and still describe what you see.
   Keep mechanics between 20 and 1,200 characters (about 150 words); a long row is a sign it should be two rows.
   Only then choose moveIds.
4. Naming:
   - moveIds come only from the catalogue below. Several ids in one row = danced one after the other, in that order.
   - "same": it is that move as defined. "variation": clearly that move, changed (extra turn, other exit, styling); say what changed in mechanics. "not-in-library": nothing in the catalogue fits; leave moveIds empty.
   - The catalogue definitions are drafts written by an AI and not yet checked by the school's teachers. When what you see contradicts a definition, trust your eyes, describe it and lower the confidence.
   - A figure the video names that is not in the catalogue (for example "Tornillo" or "Figura 85") is "not-in-library", even if a catalogue move looks similar. Never force a catalogue name onto it.
5. Confidence:
   - "high": you saw the hand holds and turns clearly through the whole row.
   - "medium": the move is clear but part of it was hidden or too fast.
   - "low": you are inferring (camera cut, other dancers in the way, out of frame, frames too sparse).
   A famous move is not more likely; never give "high" to a name you did not see happen.
6. Can't see it? Say where and why in mechanics ("his hands hidden behind her from 1:12 to 1:14") and use "low". Never fill a gap with a likely move.
7. Musicality. Listen to the music too. When the dancers react to something in it (a break, a brass hit, a drum solo, a coro entry, the montuno or mambo starting, a stop), write in musicalMoment (at most 300 characters) what they hear and what they do, e.g. "brass hits on 1 and 2: both freeze, then she answers with a hip accent on 3". If a song map is given, use its section names. A short reaction that is not a figure is its own row of type "musicality-accent". If the user message says "Focus: musicality", give every reaction to the music its own row, even small ones (a shoulder accent on a conga slap), and keep figure rows brief.
8. Show tricks (dips, drops, lifts, aerials, death drops): type "show-trick", no moveIds, match "not-in-library", no newMove. The school teaches social dancing.
9. newMove only for a real, teachable social move missing from the catalogue. Not for a combination of catalogue moves (list their ids instead), not for a show trick, not for walking, greeting or posing. Use its usual Cuban name if you know one for sure; otherwise a plain English description. Never invent a Spanish-sounding name.
10. Never invent YouTube ids, channels, dancer names, song titles or moves.
11. analysis: the model name if you know it, the frame rate you were given (1 if none), and notes on what limited you (camera cuts, crowd, light, frame rate too low for the hand changes).
12. kind is always "${CLIP_BREAKDOWN_KIND}" and version is always 1.

ROW TYPES
- "figure": partnerwork (a casino figure or a sequence of them).
- "shine": solo footwork, side by side or facing (suelta).
- "rumba": guaguancó, yambú or columbia.
- "body-movement": despelote, tembleque, isolations, body waves.
- "musicality-accent": a short reaction to the music that is not a figure.
- "show-trick": dips, drops, lifts and other performance-only moves.
- "other": teaching talk, walking, greeting, posing, applause.

NEW MOVE CATEGORIES: ${MOVE_CATEGORIES.join(", ")}.
NEW MOVE LEVELS: ${CurriculumLevelSchema.options.join(", ")}.

SONG IDS (only if the user message gives one): ${songIds}

THE CATALOGUE (id | name | category | length in 8-counts | what it is)
${buildMoveCatalogue()}
`;
}

/**
 * Structured output for the mapper pass. With `moveIdEnum` (the default) Gemini can only answer
 * with real move ids; the "lite" file drops that enum for when AI Studio says the schema is too big.
 */
export function buildMoveMapperResponseSchema({ moveIdEnum = true }: { moveIdEnum?: boolean } = {}): JsonSchema {
  const moveIds = getPublishedMoves().map((m) => m.id);
  const songIds = TIMBA_SONG_ANATOMY_DATA.map((s) => s.id);

  const newMove = object(
    {
      name: text("Usual Cuban name if you are sure of it, otherwise a plain English description"),
      category: choice(MoveCategorySchema.options, "Move category"),
      level: choice(CurriculumLevelSchema.options, "Curriculum level"),
    },
    ["name", "category", "level"]
  );

  const row = object(
    {
      start: text(TIME_FORMAT),
      end: text(TIME_FORMAT),
      type: choice(CLIP_ROW_TYPES, "What kind of dancing this row is"),
      mechanics: text(
        'What you SEE, count by count: hand holds and changes, who turns and which way, where the hands travel, the position. Start with "Name heard: ..." if the video says the name. 20 to 1,200 characters.'
      ),
      moveIds: {
        type: "array",
        description: "Catalogue ids danced in this row, in order; empty if nothing fits",
        items: moveIdEnum ? choice(moveIds, "A catalogue move id") : text("A catalogue move id"),
      },
      match: choice(CLIP_MATCHES, "same, variation, or not-in-library"),
      confidence: choice(CLIP_CONFIDENCES, "high only if you saw the holds and turns clearly"),
      musicalMoment: text("Optional: what in the music they react to, and how (at most 300 characters)"),
      newMove,
    },
    ["start", "end", "type", "mechanics", "moveIds", "match", "confidence"]
  );

  return object(
    {
      kind: choice([CLIP_BREAKDOWN_KIND], "Always this value"),
      version: { type: "integer", description: "Always 1", minimum: 1, maximum: 1 },
      id: text("The clip id from the user message (kebab-case)"),
      youtubeVideoId: text("The 11-character YouTube id from the user message"),
      title: text("The video title from the user message, or unknown"),
      channelTitle: text("The channel from the user message, or unknown"),
      dancers: { type: "array", description: "Dancer names from the user message", items: { type: "string" } },
      songId: choice(songIds, "Only if the user message gives a song id"),
      analysis: object(
        {
          model: text("Your model name if you know it"),
          fps: { type: "number", description: "The frame rate you were given, or 1", minimum: 0.1, maximum: 60 },
          notes: text("What limited you: camera cuts, crowd, light, frame rate"),
        },
        ["model", "fps", "notes"]
      ),
      rows: { type: "array", description: "In time order, never overlapping", minItems: 1, items: row },
    },
    ["kind", "version", "id", "youtubeVideoId", "title", "channelTitle", "dancers", "analysis", "rows"]
  );
}

export function buildMoveMapperSegmenterInstructions(): string {
  return `You are the Segmenter for RitmoFlow's Move Mapper. You watch a whole YouTube video of Cuban salsa dancers at a low frame rate and only find WHERE each piece of dancing starts and ends. Another pass will look at each piece closely, so do not name figures.

HOW TO WORK
1. Times are in the video, as "M:SS" (e.g. "1:05"). Pieces are in time order and never overlap.
2. Cut where the dancing changes: a new partnerwork figure or sequence, a switch to solo shines, a rumba passage, a break in the music the dancers react to, or a stretch with no dancing (talking, walking, applause).
3. Keep each piece between 8 and 30 seconds. Split a longer stretch where a figure ends (back in open position, guapea or dile que no) or where the music changes section.
4. kind: "partnerwork", "solo" (shines, body movement), "rumba", "break" (a short reaction to the music: freeze, stop, hit) or "not-dancing".
5. label: a few plain words about what happens, e.g. "turn pattern ending in a hammerlock", "side-by-side shines on the brass", "teacher explains counts".
6. Never invent anything about the video you did not see.
`;
}

export function buildMoveMapperSegmenterSchema(): JsonSchema {
  const piece = object(
    {
      start: text('Piece start as "M:SS"'),
      end: text('Piece end as "M:SS"'),
      kind: choice(CLIP_PIECE_KINDS, "What happens in this piece"),
      label: text("A few plain words about what happens"),
    },
    ["start", "end", "kind", "label"]
  );
  return object(
    {
      pieces: { type: "array", description: "In time order, never overlapping, 8-30 s each", minItems: 1, items: piece },
      notes: text("What made the video hard to cut (camera cuts, crowd, no clear figure ends)"),
    },
    ["pieces", "notes"]
  );
}
