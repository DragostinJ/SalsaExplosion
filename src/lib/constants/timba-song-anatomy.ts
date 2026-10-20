import { z } from "zod";
import {
  CUBAN_CURRICULUM_DATA,
  CurriculumSkillItem,
} from "./cuban-curriculum-2027";

// ==========================================
// 1. ZOD SCHEMAS & TYPES
// ==========================================

export const ClaveTypeSchema = z.enum([
  "2-3 Son",
  "3-2 Son",
  "2-3 Rumba",
  "3-2 Rumba",
]);
export type ClaveType = z.infer<typeof ClaveTypeSchema>;

export const SongDifficultySchema = z.enum([
  "Beginner",
  "Improver",
  "Intermediate",
  "Advanced",
]);
export type SongDifficulty = z.infer<typeof SongDifficultySchema>;

export const SongSectionNameSchema = z.enum([
  "Intro",
  "Tema (Verse)",
  "Puente",
  "Montuno",
  "Rumba / Afro Break",
  "Mambo",
  "Bomba / Presión",
  "Finale",
]);
export type SongSectionName = z.infer<typeof SongSectionNameSchema>;

export const SongDanceGearSchema = z.enum([
  "Son Cubano",
  "Casino (Smooth)",
  "Casino (Flow)",
  "Rumba Guaguancó",
  "Afro-Cuban Orishas",
  "Suelta / Shines",
  "Despelote / Reparto",
]);
export type SongDanceGear = z.infer<typeof SongDanceGearSchema>;

export const SegmentColorThemeSchema = z.enum([
  "blue",
  "emerald",
  "amber",
  "red",
  "purple",
]);
export type SegmentColorTheme = z.infer<typeof SegmentColorThemeSchema>;

export const SongSegmentSchema = z.object({
  id: z.string(),
  startTimeSeconds: z.number().min(0),
  endTimeSeconds: z.number().min(0),
  formattedRange: z.string(),
  sectionName: SongSectionNameSchema,
  danceGear: SongDanceGearSchema,
  colorTheme: SegmentColorThemeSchema,
  musicalTrigger: z.string(),
  leaderCue: z.string(),
  followerCue: z.string(),
  commonMistakeWarning: z.string(),
  recommendedMoveSlugs: z.array(z.string()),
});
export type SongSegment = z.infer<typeof SongSegmentSchema>;

export const SongAnatomySchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  bpm: z.number().positive(),
  claveType: ClaveTypeSchema,
  difficultyLevel: SongDifficultySchema,
  durationSeconds: z.number().positive(),
  spotifyOrYoutubeEmbedUrl: z.string().optional(),
  segments: z.array(SongSegmentSchema).min(1),
});
export type SongAnatomy = z.infer<typeof SongAnatomySchema>;

// ==========================================
// 2. PRODUCTION SEED DATA
// ==========================================

export const TIMBA_SONG_ANATOMY_DATA: SongAnatomy[] = [
  // -----------------------------------------------------------------
  // 1. "Me Dicen Cuba" - Alexander Abreu y Havana D'Primera
  // Level: Beginner / Improver • 90 BPM • 2-3 Son Clave • 275 seconds
  // -----------------------------------------------------------------
  {
    id: "me-dicen-cuba",
    title: "Me Dicen Cuba",
    artist: "Alexander Abreu y Havana D'Primera",
    bpm: 90,
    claveType: "2-3 Son",
    difficultyLevel: "Beginner",
    durationSeconds: 275,
    spotifyOrYoutubeEmbedUrl:
      "https://open.spotify.com/search/Alexander%20Abreu%20Me%20Dicen%20Cuba",
    segments: [
      {
        id: "mdc-seg-1",
        startTimeSeconds: 0,
        endTimeSeconds: 32,
        formattedRange: "0:00 - 0:32",
        sectionName: "Intro",
        danceGear: "Son Cubano",
        colorTheme: "blue",
        musicalTrigger:
          "Melodic trumpet fanfare & gentle acoustic piano tumbao; no cowbell. Bongos keep steady contratiempo.",
        leaderCue:
          "Take closed Cuban salon hold. Do not rush to count 1; establish posture and feel the pulse with gentle weight shift.",
        followerCue:
          "Light left hand resting on leader's right shoulder; match frame tension and keep feet kissing the floor.",
        commonMistakeWarning:
          "Don't start cranking turn patterns during the acoustic trumpet intro—breathe and listen for the downbeat.",
        recommendedMoveSlugs: ["beg-solo-1", "beg-mus-1"],
      },
      {
        id: "mdc-seg-2",
        startTimeSeconds: 32,
        endTimeSeconds: 85,
        formattedRange: "0:32 - 1:25",
        sectionName: "Tema (Verse)",
        danceGear: "Casino (Smooth)",
        colorTheme: "emerald",
        musicalTrigger:
          "Alexander Abreu sings the opening story; Conga tumbao locks in with slap on 2 and 6. Bass establishes steady pulse.",
        leaderCue:
          "Open into basic Guapea on count 1. Use Dile Que No to guide follower smoothly around the circle perimeter.",
        followerCue:
          "Step straight back on 1 in Guapea; resist the urge to turn early; wait for circular lead on count 3.",
        commonMistakeWarning:
          "Pulling in a linear straight line like LA-style salsa. Casino is a circle—step around the circumference!",
        recommendedMoveSlugs: ["beg-pw-1", "beg-pw-2"],
      },
      {
        id: "mdc-seg-3",
        startTimeSeconds: 85,
        endTimeSeconds: 160,
        formattedRange: "1:25 - 2:40",
        sectionName: "Montuno",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        musicalTrigger:
          "Campana (cowbell) rings loud and clear on counts 1-3-5-7; backing vocals enter with call-and-response ('¡Me dicen Cuba!').",
        leaderCue:
          "Increase frame elasticity. Lead foundational figures: Enchufla, Prima, Exhibela, and basic Setenta.",
        followerCue:
          "Maintain active core and keep elbows framed at 90 degrees; finish turns on counts 3 and 7 without falling forward.",
        commonMistakeWarning:
          "Gripping fingers like monkey claws during Enchufla. Use open palm-to-palm connection so hands rotate freely.",
        recommendedMoveSlugs: ["beg-pw-3", "beg-pw-4", "beg-pw-5"],
      },
      {
        id: "mdc-seg-4",
        startTimeSeconds: 160,
        endTimeSeconds: 205,
        formattedRange: "2:40 - 3:25",
        sectionName: "Mambo",
        danceGear: "Suelta / Shines",
        colorTheme: "purple",
        musicalTrigger:
          "Brass section plays high-energy unison horns; vocalists pause; rhythm section peaks with driving energy.",
        leaderCue:
          "Release partner hold on count 5. Step side-by-side into Suelta footwork (lateral, atrás) or dynamic Rueda claps.",
        followerCue:
          "Solo footwork freedom: add Cuban hip motion, shoulder shimmies, and keep your gaze playful with your partner.",
        commonMistakeWarning:
          "Clinging onto your partner's hands when the brass is exploding. Give each other space to shine!",
        recommendedMoveSlugs: ["beg-solo-1", "beg-sub-1"],
      },
      {
        id: "mdc-seg-5",
        startTimeSeconds: 205,
        endTimeSeconds: 275,
        formattedRange: "3:25 - 4:35",
        sectionName: "Finale",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        musicalTrigger:
          "Full orchestra crescendo with uplifting chorus reprise and Alexander's signature trumpet solo to close.",
        leaderCue:
          "Re-engage into open Guapea with an Enchufla Doble or Dile Que No, closing into proud Cuban salon frame on final chord.",
        followerCue:
          "Reconnect smoothly; let arms drape cleanly into final pose with weight grounded into the floor.",
        commonMistakeWarning:
          "Continuing to dance past the final chord cut-off. Listen for Alexander's closing cue and hit the final pose on time.",
        recommendedMoveSlugs: ["beg-pw-2", "beg-pw-3", "imp-pw-1"],
      },
    ],
  },

  // -----------------------------------------------------------------
  // 2. "La Cosa Mala" - El Niño y La Verdad
  // Level: Intermediate / Advanced • 96 BPM • 2-3 Rumba Clave • 292 seconds
  // -----------------------------------------------------------------
  {
    id: "la-cosa-mala",
    title: "La Cosa Mala",
    artist: "El Niño y La Verdad",
    bpm: 96,
    claveType: "2-3 Rumba",
    difficultyLevel: "Intermediate",
    durationSeconds: 292,
    spotifyOrYoutubeEmbedUrl:
      "https://open.spotify.com/search/El%20Nino%20y%20La%20Verdad%20La%20Cosa%20Mala",
    segments: [
      {
        id: "lcm-seg-1",
        startTimeSeconds: 0,
        endTimeSeconds: 23,
        formattedRange: "0:00 - 0:23",
        sectionName: "Intro",
        danceGear: "Suelta / Shines",
        colorTheme: "amber",
        musicalTrigger:
          "Atmospheric batá-style percussion, spoken vocal invocation, and syncopated acoustic clave rhythm.",
        leaderCue:
          "Stay in relaxed solo stance; isolate ribcage and knees in grounded Afro groove matching the percussion.",
        followerCue:
          "Bend knees low, articulate shoulders with rhythmic breathing, and establish connection across the space.",
        commonMistakeWarning:
          "Grabbing closed partner hold immediately when the rhythm is still freeform Afro percussion.",
        recommendedMoveSlugs: ["beg-solo-1", "int-sub-1"],
      },
      {
        id: "lcm-seg-2",
        startTimeSeconds: 23,
        endTimeSeconds: 72,
        formattedRange: "0:23 - 1:12",
        sectionName: "Tema (Verse)",
        danceGear: "Son Cubano",
        colorTheme: "blue",
        musicalTrigger:
          "Melodic piano montuno enters alongside El Niño's narrative verse; acoustic bass plays delayed tumbao.",
        leaderCue:
          "Bring partner into closed Cuban hold. Dance smooth Son Contratiempo (On2) or relaxed circular Casino walking.",
        followerCue:
          "Hold weight on beat 1 and step on 2-3-4; focus on torso elegance and upright Cuban salon posture.",
        commonMistakeWarning:
          "Dancing aggressive fast turn patterns over the poetic narrative verse.",
        recommendedMoveSlugs: ["imp-sub-1", "beg-pw-2", "imp-pw-6"],
      },
      {
        id: "lcm-seg-3",
        startTimeSeconds: 72,
        endTimeSeconds: 102,
        formattedRange: "1:12 - 1:42",
        sectionName: "Puente",
        danceGear: "Casino (Smooth)",
        colorTheme: "emerald",
        musicalTrigger:
          "Trombones build rising tension; percussion adds syncopated timbales roll signaling the approaching Montuno.",
        leaderCue:
          "Transition smoothly from closed frame to open Guapea; prep partner for upcoming circular pretzel turns.",
        followerCue:
          "Engage abdominal core to absorb rising energy; keep fingertips sensitive to handhold directional cues.",
        commonMistakeWarning:
          "Ignoring the harmonic build-up; stay aware of the impending cowbell entrance.",
        recommendedMoveSlugs: ["beg-pw-1", "imp-pw-3", "imp-pw-4"],
      },
      {
        id: "lcm-seg-4",
        startTimeSeconds: 102,
        endTimeSeconds: 150,
        formattedRange: "1:42 - 2:30",
        sectionName: "Montuno",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        musicalTrigger:
          "Campana locks into high gear; chorus answers with relentless energy ('¡La cosa mala se acabó!').",
        leaderCue:
          "Unleash complex Casino turn combinations: Setenta Complicado, Sombrero, Montana, and Kentucky.",
        followerCue:
          "Follow continuous rotational flow; spot your lead on exits and maintain firm Cuban frame resistance.",
        commonMistakeWarning:
          "Pulling with biceps during the Montana arm arches. Keep wrists loose and lift arms cleanly overhead.",
        recommendedMoveSlugs: ["imp-pw-1", "imp-pw-2", "int-pw-1"],
      },
      {
        id: "lcm-seg-5",
        startTimeSeconds: 150,
        endTimeSeconds: 188,
        formattedRange: "2:30 - 3:08",
        sectionName: "Rumba / Afro Break",
        danceGear: "Rumba Guaguancó",
        colorTheme: "amber",
        musicalTrigger:
          "Brass cuts out completely; Quinto drum executes rapid solo accents with heavy Rumba clave polyrhythms.",
        leaderCue:
          "Release partner hold immediately! Drop into low, grounded Rumba stance and tease with playful Vacunao attempts.",
        followerCue:
          "Protect center with skirt/hand cover defense; keep eyes on lead's hips and feet while stepping playful Guaguancó.",
        commonMistakeWarning:
          "Continuing to crank Setenta pretzels when the band is playing pure traditional Rumba Guaguancó!",
        recommendedMoveSlugs: ["imp-solo-1", "int-sub-1"],
      },
      {
        id: "lcm-seg-6",
        startTimeSeconds: 188,
        endTimeSeconds: 218,
        formattedRange: "3:08 - 3:38",
        sectionName: "Mambo",
        danceGear: "Suelta / Shines",
        colorTheme: "purple",
        musicalTrigger:
          "Explosive trombone riffs punch through the percussion; timbales crash and piano drives aggressive tumbaos.",
        leaderCue:
          "Execute fast footwork shines (pasitos) or reconnect into tight, compact Casino rotations (Dedo, El Uno, El Dos).",
        followerCue:
          "Match leader's dynamic intensity with sharp ribcage isolations and rhythmic foot taps.",
        commonMistakeWarning:
          "Drifting across the entire social dance floor during high-speed brass mambo.",
        recommendedMoveSlugs: ["int-pw-3", "int-pw-4", "adv-mus-1"],
      },
      {
        id: "lcm-seg-7",
        startTimeSeconds: 218,
        endTimeSeconds: 258,
        formattedRange: "3:38 - 4:18",
        sectionName: "Bomba / Presión",
        danceGear: "Despelote / Reparto",
        colorTheme: "red",
        musicalTrigger:
          "Piano stops melodic chords and drops to bass stabs; electric bass plays sliding glissandos; singer shouts '¡Presión!'.",
        leaderCue:
          "STOP all arm turns! Lower center of gravity, bend knees, and isolate torso in Despelote, Tembleque, or Reparto.",
        followerCue:
          "Drop into pelvic-ribcage dissociation (Despelote) or high-frequency torso vibration (Tembleque). Free individual styling!",
        commonMistakeWarning:
          "Trying to lead a multi-spin turn pattern during Bomba. It breaks connection and looks completely disconnected from the music.",
        recommendedMoveSlugs: ["int-solo-1", "adv-solo-1", "int-mus-1"],
      },
      {
        id: "lcm-seg-8",
        startTimeSeconds: 258,
        endTimeSeconds: 292,
        formattedRange: "4:18 - 4:52",
        sectionName: "Finale",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        musicalTrigger:
          "Coro returns with full brass fanfare; rhythm section drives celebratory groove toward the final unison band hit.",
        leaderCue:
          "Reconnect in celebratory open Casino flow: Sombrero or Paseala, wrapping into a crisp final accent pose.",
        followerCue:
          "Re-engage partner frame with joy and smile, hitting the final rhythmic punctuation together.",
        commonMistakeWarning:
          "Losing timing on the final stop. Watch the lead's core to freeze simultaneously with the band.",
        recommendedMoveSlugs: ["imp-pw-4", "int-pw-2", "adv-pw-1"],
      },
    ],
  },
];

// ==========================================
// 3. HELPER FUNCTIONS
// ==========================================

export function getSongAnatomyById(id: string): SongAnatomy | undefined {
  return TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === id);
}

export function getAllSongAnatomies(): SongAnatomy[] {
  return TIMBA_SONG_ANATOMY_DATA;
}

export function resolveCurriculumMove(slugOrId: string): CurriculumSkillItem | undefined {
  return CUBAN_CURRICULUM_DATA.find(
    (skill) => skill.id === slugOrId || skill.name.toLowerCase() === slugOrId.toLowerCase()
  );
}
