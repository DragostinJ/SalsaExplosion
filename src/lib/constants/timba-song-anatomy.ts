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

export const TimingModeSchema = z.enum([
  "Free / Polyrhythmic (6/8)",
  "Contratiempo (On2)",
  "A Tiempo (On1)",
  "Contrapunto (On2 <-> On1)",
  "Syncopated Reparto",
]);
export type TimingMode = z.infer<typeof TimingModeSchema>;

export const InstrumentMappingSchema = z.object({
  feet: z.string(),
  hipsAndKnees: z.string(),
  chestAndShoulders: z.string(),
});
export type InstrumentMapping = z.infer<typeof InstrumentMappingSchema>;

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
  timingMode: TimingModeSchema.optional(),
  instrumentMapping: InstrumentMappingSchema.optional(),
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
  youtubeVideoId: z.string().min(5),
  alternateYoutubeVideoId: z.string().optional(),
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
  // Level: Beginner / Improver • 90 BPM • 2-3 Son Clave • 275 seconds (4:35)
  // Official Video ID: jBNgDYJjZP8
  // -----------------------------------------------------------------
  {
    id: "me-dicen-cuba",
    title: "Me Dicen Cuba",
    artist: "Alexander Abreu y Havana D'Primera",
    bpm: 90,
    claveType: "2-3 Son",
    difficultyLevel: "Beginner",
    durationSeconds: 275,
    youtubeVideoId: "jBNgDYJjZP8",
    spotifyOrYoutubeEmbedUrl:
      "https://open.spotify.com/search/Alexander%20Abreu%20Me%20Dicen%20Cuba",
    segments: [
      {
        id: "mdc-seg-1",
        startTimeSeconds: 0,
        endTimeSeconds: 46,
        formattedRange: "0:00 - 0:46",
        sectionName: "Intro",
        danceGear: "Son Cubano",
        colorTheme: "blue",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Melodic piano & Alexander Abreu's voice -> Closed Hold Weight Transfers / Basic Son.",
        leaderCue:
          "Take closed Cuban salon hold. Do not rush to count 1; establish posture and feel the pulse with gentle weight shift.",
        followerCue:
          "Light left hand resting on leader's right shoulder; match frame tension and keep feet kissing the floor.",
        commonMistakeWarning:
          "Don't start cranking turn patterns during the acoustic intro—breathe and listen for the downbeat.",
        recommendedMoveSlugs: ["beg-solo-1", "beg-mus-1"],
      },
      {
        id: "mdc-seg-2",
        startTimeSeconds: 46,
        endTimeSeconds: 108,
        formattedRange: "0:46 - 1:48",
        sectionName: "Tema (Verse)",
        danceGear: "Casino (Smooth)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Steady conga enters -> Beginner Casino (Guapea, Dile Que No, Enchufla, Prima).",
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
        startTimeSeconds: 108,
        endTimeSeconds: 155,
        formattedRange: "1:48 - 2:35",
        sectionName: "Montuno",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Chorus 'Me dicen Cuba...' + Bongo bell enters -> Improver Casino (Setenta, Sombrero, Vacilala).",
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
        startTimeSeconds: 155,
        endTimeSeconds: 195,
        formattedRange: "2:35 - 3:15",
        sectionName: "Mambo",
        danceGear: "Suelta / Shines",
        colorTheme: "purple",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Horns punch in followed by a rhythmic vocal breakdown -> Break Apart for Basic Suelta (Lateral, Suspiro, basic Guaguancó side-step).",
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
        startTimeSeconds: 195,
        endTimeSeconds: 275,
        formattedRange: "3:15 - 4:35",
        sectionName: "Finale",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Anthemic chorus + trumpet solos -> Full Casino Flow or Rueda de Casino energy.",
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
  // Level: Intermediate / Advanced • 96 BPM • 2-3 Rumba Clave • 292 seconds (4:52)
  // Official Studio Audio: et8gHrBf_6s
  // Alternate Music Video: 8GXd6UuNJ7A
  // -----------------------------------------------------------------
  {
    id: "la-cosa-mala",
    title: "La Cosa Mala",
    artist: "El Niño y La Verdad",
    bpm: 96,
    claveType: "2-3 Rumba",
    difficultyLevel: "Intermediate",
    durationSeconds: 292,
    youtubeVideoId: "et8gHrBf_6s",
    alternateYoutubeVideoId: "8GXd6UuNJ7A",
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
        timingMode: "Free / Polyrhythmic (6/8)",
        musicalTrigger:
          "Dramatic horn hits over a heavy percussion roll, settling into a sharp groove at 0:11.",
        leaderCue:
          "Don't rush into partnerwork on second 1. Start apart with slow weight transfers, Eleguá or Oggún chest accents on the brass hits, and connect into closed hold at 0:23.",
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
        timingMode: "Contratiempo (On2)",
        musicalTrigger:
          "El Niño enters smoothly with the main melody; piano plays a gentle tumbao and the conga is soft with no heavy cowbell.",
        leaderCue:
          "Dance Son (On2 Contratiempo) or ultra-smooth closed-position Casino (Paseala, Kentucky, slow Exhibela). Zero complicated arm knots—let the vocals breathe.",
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
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Horn builds intensity; the Campana (bongo bell) enters to drive the rhythm forward.",
        leaderCue:
          "Transition from closed hold to open two-hand and one-hand figures: Setenta Simple, Sombrero, Vacilala. Increase circular traveling momentum.",
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
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          'The call-and-response chorus ("Quítate la cosa mala...") kicks in with full brass and driving piano.',
        leaderCue:
          "Peak partnerwork territory. Use continuous flow combinations (Montana, Dedo, Siete, Coca-Cola). Hit the mini-breaks with sharp frame freezes.",
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
        timingMode: "Free / Polyrhythmic (6/8)",
        musicalTrigger:
          'Melodic instruments strip back; heavy conga/cajón texture and folkloric vocal chants take center stage ("Santería / Palo / Abakuá" lyrics).',
        leaderCue:
          "Crucial Un-Confuser Moment: Stop doing turn patterns! Break apart on an Enchufla or Dile Que No. Dance Guaguancó (playful Vacunao pursuit) or Orisha movement (Changó / Eleguá) matching the lyrics.",
        followerCue:
          "Protect center with skirt/hand cover defense; keep eyes on lead's hips and feet while stepping playful Guaguancó.",
        commonMistakeWarning:
          "Continuing to crank Setenta pretzels when the bass drops out and the band shifts to pure Rumba!",
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
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Explosive, syncopated brass riffs repeat in tight loops.",
        leaderCue:
          "Either stay in Suelta doing sharp syncopated shines (Tornillo, Pa'ti Pa'mi) or reconnect for tight, snappy directional changes (Bayamo, El Uno).",
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
        timingMode: "Syncopated Reparto",
        musicalTrigger:
          "The bass drops into a dirty, sliding Timba groove; percussion goes into overdrive and the singer hypes the crowd.",
        leaderCue:
          "Drop the hands completely or go into Shadow Position. Use low knee bend, Despelote (body rolls), Tembleque (vibration), and urban Reparto footwork.",
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
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Full band returns at maximum energy leading to the sharp final brass hits.",
        leaderCue:
          "Reconnect with a high-energy Dile Que No, flow through 2–3 favorite combinations, and hit a clean dip or freeze on the final trumpet hit.",
        followerCue:
          "Re-engage partner frame with joy and smile, hitting the final rhythmic punctuation together.",
        commonMistakeWarning:
          "Losing timing on the final stop. Watch the lead's core to freeze simultaneously with the band.",
        recommendedMoveSlugs: ["imp-pw-4", "int-pw-2", "adv-pw-1"],
      },
    ],
  },

  // -----------------------------------------------------------------
  // 3. "Agua Pa' Yemayá" - Elito Revé y su Charangón
  // Level: Advanced (Level 4 Boss Track) • 108 BPM • 2-3 Rumba Clave • 342 seconds (5:42)
  // Official Video ID: ZuaNY9AKoLc
  // Alternate Video ID: ROH1qfLdAh0
  // -----------------------------------------------------------------
  {
    id: "agua-pa-yemaya",
    title: "Agua Pa' Yemayá",
    artist: "Elito Revé y su Charangón",
    bpm: 108,
    claveType: "2-3 Rumba",
    difficultyLevel: "Advanced",
    durationSeconds: 342,
    youtubeVideoId: "ZuaNY9AKoLc",
    alternateYoutubeVideoId: "ROH1qfLdAh0",
    spotifyOrYoutubeEmbedUrl:
      "https://open.spotify.com/search/Elito%20Reve%20Agua%20Pa%20Yemaya",
    segments: [
      {
        id: "apy-seg-1",
        startTimeSeconds: 0,
        endTimeSeconds: 42,
        formattedRange: "0:00 - 0:42",
        sectionName: "Intro",
        danceGear: "Afro-Cuban Orishas",
        colorTheme: "amber",
        timingMode: "Free / Polyrhythmic (6/8)",
        musicalTrigger:
          "Ocean waves, Bata drum invocation, and Lucumí folkloric vocal chant with no salsa beat yet.",
        leaderCue:
          "Do NOT grab your partner for Guapea! Start apart with grounded Yemayá torso waves, building from calm water to stormy undulations at 0:35.",
        followerCue:
          "Use skirt/arm styling and spinal waves matching the vocal swells; prepare to connect on the first Changüí bass hit at 0:42.",
        commonMistakeWarning:
          "Counting 1-2-3-5-6-7 mechanically during an un-metered Orisha prayer.",
        instrumentMapping: {
          feet: "Grounded slow weight shifts",
          hipsAndKnees: "Ocean swell wave motion",
          chestAndShoulders: "Bata drum call accents",
        },
        recommendedMoveSlugs: ["int-sub-1", "adv-mus-1"],
      },
      {
        id: "apy-seg-2",
        startTimeSeconds: 42,
        endTimeSeconds: 95,
        formattedRange: "0:42 - 1:35",
        sectionName: "Tema (Verse)",
        danceGear: "Son Cubano",
        colorTheme: "blue",
        timingMode: "Contrapunto (On2 <-> On1)",
        musicalTrigger:
          "Syncopated tres guitar, marímbula bass, and bongo enter with a signature Guantánamo Changüí bounce.",
        leaderCue:
          "Connect in closed frame on Contratiempo (On2). Practice flipping smoothly to On1 on the brass accents at 1:10 via core weight transfer.",
        followerCue:
          "Stay slightly delayed in the knees to feel the pause on counts 1 and 5; follow the leader's ribcage frame to sense the On2-to-On1 flip.",
        commonMistakeWarning:
          "Rushing the feet at 108 BPM instead of letting the Changüí syncopation breathe.",
        instrumentMapping: {
          feet: "Tres guitar tumbao (2-3-4 / 6-7-8)",
          hipsAndKnees: "Marímbula bass groove",
          chestAndShoulders: "Smooth upright Son posture",
        },
        recommendedMoveSlugs: ["imp-sub-1", "int-pw-1"],
      },
      {
        id: "apy-seg-3",
        startTimeSeconds: 95,
        endTimeSeconds: 148,
        formattedRange: "1:35 - 2:28",
        sectionName: "Montuno",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Heavy trombone chorus ('Agua pa' Yemayá') and driving timbal campana kick in at full speed.",
        leaderCue:
          "Keep steps compact underneath your center to survive 108 BPM. Lead Montana, Siete Loco, and Coca-Cola with micro-led direction reversals.",
        followerCue:
          "Keep elbows relaxed and close to the ribs during complex wraps; use compact circular steps rather than large lunges.",
        commonMistakeWarning:
          "Taking huge steps at 108 BPM—causing you to drag behind the clave and yank your partner's shoulders.",
        instrumentMapping: {
          feet: "Timbal bell & Conga marcha",
          hipsAndKnees: "Continuous circular momentum",
          chestAndShoulders: "Trombone stab freezes",
        },
        recommendedMoveSlugs: ["int-pw-2", "adv-pw-1"],
      },
      {
        id: "apy-seg-4",
        startTimeSeconds: 148,
        endTimeSeconds: 192,
        formattedRange: "2:28 - 3:12",
        sectionName: "Rumba / Afro Break",
        danceGear: "Afro-Cuban Orishas",
        colorTheme: "amber",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "6/8 Afro-Cuban feel overlays the 4/4 rhythm as lyrics invoke Yemayá and Changó.",
        leaderCue:
          "Mid-figure fusion: Release the hand on count 3 of Vacilala, trade 8 counts of explosive Changó lightning pulls, and reconnect on Dile Que No.",
        followerCue:
          "Answer the leader's Changó challenge with fluid Yemayá turns or sharp Ochún/Yemayá torso undulations before re-entering the frame.",
        commonMistakeWarning:
          "Treating Orisha breaks like generic cardio shines instead of embodying the specific deity called by the singer.",
        instrumentMapping: {
          feet: "Rumba clave pulse",
          hipsAndKnees: "Grounded Afro knee bounce",
          chestAndShoulders: "Orisha undulation & Changó strikes",
        },
        recommendedMoveSlugs: ["int-sub-1", "adv-sub-1"],
      },
      {
        id: "apy-seg-5",
        startTimeSeconds: 192,
        endTimeSeconds: 235,
        formattedRange: "3:12 - 3:55",
        sectionName: "Mambo",
        danceGear: "Suelta / Shines",
        colorTheme: "purple",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Vocals drop out; stacked trombones fire aggressive, syncopated Mambo riffs.",
        leaderCue:
          "Break apart into Rumba Columbia footwork—use Taco-Punta (heel-toe) syncopations and sharp freezes on the horn hits.",
        followerCue:
          "Match the horn riffs with rapid syncopated footwork and sharp shoulder/ribcage isolations.",
        commonMistakeWarning:
          "Staying locked in repetitive two-hand partner knots while the horn section is screaming for footwork.",
        instrumentMapping: {
          feet: "Quinto drum & Piano syncopations",
          hipsAndKnees: "Sharp directional switches",
          chestAndShoulders: "Trombone Mambo hits",
        },
        recommendedMoveSlugs: ["int-solo-1", "adv-mus-1"],
      },
      {
        id: "apy-seg-6",
        startTimeSeconds: 235,
        endTimeSeconds: 288,
        formattedRange: "3:55 - 4:48",
        sectionName: "Bomba / Presión",
        danceGear: "Despelote / Reparto",
        colorTheme: "red",
        timingMode: "Syncopated Reparto",
        musicalTrigger:
          "Bass drops into a dirty sliding Timba groove while bongo and timbal go into street overdrive.",
        leaderCue:
          "Drop posture 4 inches. Enter Shadow Position or close face-to-face proximity for Despelote, Tembleque vibrations, and Reparto grooves.",
        followerCue:
          "Release standard Casino frame tension and switch to full-body isolation—ribcage circles, Despelote body rolls, and Tembleque hip vibrations.",
        commonMistakeWarning:
          "Trying to lead forceful turn patterns during a dirty bass-drop Bomba section.",
        instrumentMapping: {
          feet: "Taco-Punta Reparto bounce",
          hipsAndKnees: "High-speed Tembleque & Bass slides",
          chestAndShoulders: "Despelote circular rolls",
        },
        recommendedMoveSlugs: ["int-solo-1", "adv-solo-1"],
      },
      {
        id: "apy-seg-7",
        startTimeSeconds: 288,
        endTimeSeconds: 342,
        formattedRange: "4:48 - 5:42",
        sectionName: "Finale",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Full Charangón band roars back for the final chorus, ending on a sharp brass stab at 5:40.",
        leaderCue:
          "Reconnect with Dile Que No, flow through high-speed rotational combinations, and set up a clean musical freeze or shadow dip at 5:40.",
        followerCue:
          "Maintain core engagement through the fast finale spins and lock in your balance on count 7 for the final hit.",
        commonMistakeWarning:
          "Missing the final brass cutoff at 5:40 and awkwardly stepping two extra beats after the music stops.",
        instrumentMapping: {
          feet: "Full Montuno speed",
          hipsAndKnees: "Rotational grounding",
          chestAndShoulders: "Final brass hit freeze",
        },
        recommendedMoveSlugs: ["int-pw-3", "adv-pw-1"],
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

export function formatSecondsToTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/**
 * Pure helper function to dynamically scale song segments if YouTube's live stream reports
 * a duration variance (e.g. 371s music video vs 292s official audio).
 * Crucially, preserves all exact authored intermediate transition timestamps!
 */
export function scaleSongSegmentsToDuration(
  song: SongAnatomy,
  actualDurationSeconds: number
): SongSegment[] {
  if (
    !actualDurationSeconds ||
    actualDurationSeconds <= 0 ||
    Math.abs(actualDurationSeconds - song.durationSeconds) < 2
  ) {
    return song.segments;
  }

  return song.segments.map((seg, idx) => {
    const isLast = idx === song.segments.length - 1;
    if (!isLast) {
      return seg;
    }

    const end = Math.max(seg.startTimeSeconds + 5, actualDurationSeconds);
    return {
      ...seg,
      endTimeSeconds: end,
      formattedRange: `${formatSecondsToTime(seg.startTimeSeconds)} - ${formatSecondsToTime(end)}`,
    };
  });
}
