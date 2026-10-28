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
  "2-3 Son Clave",
  "3-2 Son",
  "2-3 Rumba",
  "2-3 Rumba Clave",
  "3-2 Rumba",
  "2-3 Son / 6/8 Afro-Bembé Hybrid",
  "2-3 Son/Rumba Clave",
]);
export type ClaveType = z.infer<typeof ClaveTypeSchema>;

export const SongDifficultySchema = z.enum([
  "Beginner",
  "Improver",
  "Intermediate",
  "Advanced",
]);
export type SongDifficulty = z.infer<typeof SongDifficultySchema>;

export const SongSectionNameSchema = z.string().min(1);
export type SongSectionName = z.infer<typeof SongSectionNameSchema>;

export const SongDanceGearSchema = z.enum([
  "Wait / Breathe",
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
  "slate",
  "blue",
  "emerald",
  "amber",
  "red",
  "purple",
]);
export type SegmentColorTheme = z.infer<typeof SegmentColorThemeSchema>;

export const TimingModeSchema = z.enum([
  "Ambient (No Beat)",
  "Free / Polyrhythmic (6/8)",
  "Contratiempo (On2)",
  "Contratiempo (On2) or Smooth On1",
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
  recommendedMoveSlugs: z.array(z.string()).default([]),
  timingMode: TimingModeSchema.optional(),
  handGesture: z.string().optional(),
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
  youtubeUrl: z.string().url().optional(),
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
  // 1. "Me Dicen Cuba" - Alexander Abreu & Havana D'Primera
  // Level: Beginner / Improver • 91 BPM • 2-3 Son Clave • 328 seconds (5:28)
  // Official Video ID: jBNgDYJjZP8
  // -----------------------------------------------------------------
  {
    id: "me-dicen-cuba",
    title: "Me Dicen Cuba (Official Video)",
    artist: "Alexander Abreu & Havana D'Primera",
    bpm: 91,
    claveType: "2-3 Son Clave",
    difficultyLevel: "Beginner",
    durationSeconds: 328,
    youtubeVideoId: "jBNgDYJjZP8",
    youtubeUrl: "https://www.youtube.com/watch?v=jBNgDYJjZP8",
    spotifyOrYoutubeEmbedUrl:
      "https://open.spotify.com/search/Alexander%20Abreu%20Me%20Dicen%20Cuba",
    segments: [
      {
        id: "mdc-seg-1",
        startTimeSeconds: 0,
        endTimeSeconds: 18,
        formattedRange: "0:00 - 0:18",
        sectionName: "Intro Cinematográfico (No Music)",
        danceGear: "Wait / Breathe",
        colorTheme: "slate",
        timingMode: "Ambient (No Beat)",
        musicalTrigger:
          "EGREM studio clapperboard countdown (0:00-0:08) followed by ocean waves on the Havana Malecón (0:08-0:18).",
        leaderCue:
          "Do not step yet! Stand relaxed, smile at your partner, and wait for the piano and conga entrance at 0:18.",
        followerCue:
          "Relax your shoulders and wait for the first piano tumbao note at 0:18.",
        commonMistakeWarning:
          "Stepping awkwardly in silence during the 18-second movie intro.",
        instrumentMapping: {
          feet: "Still / Grounded",
          hipsAndKnees: "Relaxed posture",
          chestAndShoulders: "Breathing before the music starts",
        },
        recommendedMoveSlugs: ["beg-solo-1", "beg-mus-1"],
      },
      {
        id: "mdc-seg-2",
        startTimeSeconds: 18,
        endTimeSeconds: 40,
        formattedRange: "0:18 - 0:40",
        sectionName: "Intro Rumbero (Piano & Guaguancó)",
        danceGear: "Rumba Guaguancó",
        colorTheme: "amber",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Syncopated piano tumbao and Guaguancó conga/clave rhythm enter at 0:18 (no bass or horns yet).",
        leaderCue:
          "Start apart! Groove with a basic Rumba Guaguancó side-step or slow Suelta weight transfers.",
        followerCue:
          "Match the conga slaps with gentle hip and shoulder sway in solo position.",
        commonMistakeWarning:
          "Jumping straight into cranked partnerwork turns before the bass and horns even enter.",
        instrumentMapping: {
          feet: "Guaguancó basic side-step",
          hipsAndKnees: "Soft Cuban knee bend",
          chestAndShoulders: "Subtle Rumba shoulder isolation",
        },
        recommendedMoveSlugs: ["beg-solo-1", "beg-sub-1"],
      },
      {
        id: "mdc-seg-3",
        startTimeSeconds: 40,
        endTimeSeconds: 60,
        formattedRange: "0:40 - 1:00",
        sectionName: "Tema Instrumental (Entrada de Metales)",
        danceGear: "Suelta / Shines",
        colorTheme: "purple",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 0:40 the upright bass and Alexander Abreu's trumpet melody enter, locking in the 4/4 groove.",
        leaderCue:
          "Dance 16 counts of smooth Suelta basic steps, then walk in and connect into Closed Frame on the brass break at 0:57.",
        followerCue:
          "Finish your solo basic steps and offer a light, connected closed frame at 0:57 right before the vocals begin.",
        commonMistakeWarning:
          "Rushing the connection instead of using the 0:57 horn break to frame up cleanly.",
        instrumentMapping: {
          feet: "4/4 Paso Básico & Lateral",
          hipsAndKnees: "Grounded weight transfer",
          chestAndShoulders: "Framing up at 0:57",
        },
        recommendedMoveSlugs: ["beg-solo-1", "beg-pw-1"],
      },
      {
        id: "mdc-seg-4",
        startTimeSeconds: 60,
        endTimeSeconds: 105,
        formattedRange: "1:00 - 1:45",
        sectionName: "Tema / Verso 1 ('Vengo de donde el sol')",
        danceGear: "Son Cubano",
        colorTheme: "blue",
        timingMode: "Contratiempo (On2) or Smooth On1",
        musicalTrigger:
          "Alexander Abreu sings the warm opening verse over soft bongo martillo, maracas, and piano.",
        leaderCue:
          "Keep it intimate and smooth in Closed Frame (Paseala, basic Dile Que No, Guapea). Let the romantic lyrics breathe.",
        followerCue:
          "Focus on smooth weight transfers and maintaining a soft, responsive connection.",
        commonMistakeWarning:
          "Leading frantic, bouncy Rueda moves during a poetic verse about 'enamorando a la rumba, cantándole aquel bolero'.",
        instrumentMapping: {
          feet: "Smooth closed steps",
          hipsAndKnees: "Pendulum Cuban motion",
          chestAndShoulders: "Calm upright frame",
        },
        recommendedMoveSlugs: ["beg-pw-1", "beg-pw-2"],
      },
      {
        id: "mdc-seg-5",
        startTimeSeconds: 105,
        endTimeSeconds: 155,
        formattedRange: "1:45 - 2:35",
        sectionName: "Verso 2 & Puente ('Cubano soy de pura cepa')",
        danceGear: "Casino (Smooth)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Percussion builds intensity at 1:45, leading to a dramatic vocal suspension at 2:25 ('A mí... me dicen Cuba') and a 7-second brass bridge.",
        leaderCue:
          "Open up into Beginner Casino figures (Enchufla, Prima, Exhibela). Hit a slow freeze or dip on 'A mí me dicen Cuba' at 2:25!",
        followerCue:
          "Travel smoothly around the circle and pause with the leader on the 2:25 vocal suspension before the 2:28 horns.",
        commonMistakeWarning:
          "Stepping right through the dramatic pause at 2:25-2:28.",
        instrumentMapping: {
          feet: "Circular Casino basic",
          hipsAndKnees: "Grounded rotational travel",
          chestAndShoulders: "2:25 vocal pause freeze",
        },
        recommendedMoveSlugs: ["beg-pw-3", "beg-pw-4", "beg-pw-5"],
      },
      {
        id: "mdc-seg-6",
        startTimeSeconds: 155,
        endTimeSeconds: 200,
        formattedRange: "1:35 - 3:20".replace("1:35", "2:35"),
        sectionName: "Montuno 1 ('Para saber de verdad')",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 2:35 the chorus ('Para saber de verdad lo que es sentirse cubano') and the Bongo Campana (cowbell) kick in!",
        leaderCue:
          "The cowbell is your green light! Lead flowing Improver Casino combinations (Setenta, Sombrero, Vacilala, Kentucky).",
        followerCue:
          "Keep your elbows down in Setenta/Sombrero wraps and walk cleanly around the leader's circle.",
        commonMistakeWarning:
          "Not noticing the energy lift when the bongo cowbell enters at 2:35.",
        instrumentMapping: {
          feet: "Bongo bell drive (1-2-3, 5-6-7)",
          hipsAndKnees: "Continuous circular flow",
          chestAndShoulders: "Active rotational frame",
        },
        recommendedMoveSlugs: ["imp-pw-1", "imp-pw-2", "imp-pw-3"],
      },
      {
        id: "mdc-seg-7",
        startTimeSeconds: 200,
        endTimeSeconds: 217,
        formattedRange: "3:20 - 3:37",
        sectionName: "Mambo ('Camina por arriba del mambo')",
        danceGear: "Suelta / Shines",
        colorTheme: "purple",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 3:19 Alexander shouts '¡Havana D'Primera! ¡Vaya camina por arriba del mambo!' and the brass section fires a tight Mambo riff.",
        leaderCue:
          "Use an Enchufla at 3:20 to break apart for 16 counts of Suelta footwork on the horn riffs, then reconnect at 3:37.",
        followerCue:
          "Enjoy 16 seconds of solo footwork shines and body movement before reconnecting on the 3:37 chorus.",
        commonMistakeWarning:
          "Ignoring the singer literally telling you to 'walk on top of the Mambo'!",
        instrumentMapping: {
          feet: "Syncopated Suelta shines",
          hipsAndKnees: "Sharp Mambo groove",
          chestAndShoulders: "Horn riff accents",
        },
        recommendedMoveSlugs: ["imp-solo-1", "beg-sub-1"],
      },
      {
        id: "mdc-seg-8",
        startTimeSeconds: 217,
        endTimeSeconds: 256,
        formattedRange: "3:37 - 4:16",
        sectionName: "Montuno 2 ('Nadie baila como yo')",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "The signature dance chorus ('Nadie baila como yo, nadie goza como yo') drops with prominent clave and guiro.",
        leaderCue:
          "Lead open, playful figures (Vacilala, Exhibela, Setenta con Alarde) that let both partners show off on 'Nadie baila como yo'!",
        followerCue:
          "Use open turns to express your own styling and cubanía on the chorus lyrics.",
        commonMistakeWarning:
          "Trapping the follower in tight two-hand knots during a chorus about dancing freely.",
        instrumentMapping: {
          feet: "Son Clave & Conga pulse",
          hipsAndKnees: "Playful Cuban hip motion",
          chestAndShoulders: "Expressive styling on chorus",
        },
        recommendedMoveSlugs: ["imp-pw-4", "imp-pw-5", "imp-pw-6"],
      },
      {
        id: "mdc-seg-9",
        startTimeSeconds: 256,
        endTimeSeconds: 328,
        formattedRange: "4:16 - 5:28",
        sectionName: "Montuno Climax ('¡Pa'lante!') & Trumpet Solo",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "High-energy '¡Cubano / Pa'lante!' call-and-response at 4:16, followed by Alexander Abreu's iconic trumpet solo at 4:38 and final hit at 5:24.",
        leaderCue:
          "Peak celebratory Casino flow! Ride the trumpet solo energy and hit a clean final freeze or dip on the last brass chord at 5:24.",
        followerCue:
          "Keep steps compact and energized through the finale, locking in your balance for the 5:24 final chord.",
        commonMistakeWarning:
          "Running out of stamina before the 4:38 trumpet solo climax.",
        instrumentMapping: {
          feet: "Full Timbal & Bongo bell drive",
          hipsAndKnees: "Dynamic circular momentum",
          chestAndShoulders: "Final brass hit freeze at 5:24",
        },
        recommendedMoveSlugs: ["imp-pw-2", "int-pw-1"],
      },
    ],
  },

  // -----------------------------------------------------------------
  // 2. "La Cosa Mala" - El Niño y La Verdad
  // Level: Intermediate / Advanced • 95 BPM • 2-3 Son Clave • 347 seconds (5:47)
  // Official Audio ID: et8gHrBf_6s | Backup ID: 8GXd6UuNJ7A
  // -----------------------------------------------------------------
  {
    id: "la-cosa-mala",
    title: "La Cosa Mala (Official Audio)",
    artist: "El Niño y La Verdad",
    bpm: 95,
    claveType: "2-3 Son Clave",
    difficultyLevel: "Intermediate",
    durationSeconds: 347,
    youtubeVideoId: "et8gHrBf_6s",
    alternateYoutubeVideoId: "8GXd6UuNJ7A",
    youtubeUrl: "https://www.youtube.com/watch?v=et8gHrBf_6s",
    spotifyOrYoutubeEmbedUrl:
      "https://open.spotify.com/search/El%20Nino%20y%20La%20Verdad%20La%20Cosa%20Mala",
    segments: [
      {
        id: "lcm-seg-1",
        startTimeSeconds: 0,
        endTimeSeconds: 15,
        formattedRange: "0:00 - 0:15",
        sectionName: "Intro de Tres Cubano ('Tú ten cuidado')",
        danceGear: "Son Cubano",
        colorTheme: "blue",
        timingMode: "Contratiempo (On2)",
        musicalTrigger:
          "Opens immediately with the syncopated Cuban Tres guitar, bongo martillo, and maracas as El Niño warns 'Tú ten cuidado no te dé... la cosa mala'.",
        leaderCue:
          "Start apart marking Contratiempo (On2) to the Tres guitar, and connect into elegant closed Son hold at 0:15.",
        followerCue:
          "Feel the syncopated Tres guitar and step smoothly onto counts 2-3-4 / 6-7-8.",
        commonMistakeWarning:
          "Rushing On1 turn patterns over a classic Tres Cubano Son intro.",
        instrumentMapping: {
          feet: "Tres guitar tumbao (2-3-4 / 6-7-8)",
          hipsAndKnees: "Delayed Son weight transfer",
          chestAndShoulders: "Upright Son frame",
        },
        recommendedMoveSlugs: ["beg-solo-1", "int-sub-1"],
      },
      {
        id: "lcm-seg-2",
        startTimeSeconds: 15,
        endTimeSeconds: 102,
        formattedRange: "0:15 - 1:42",
        sectionName: "Tema Narrativo (Las 3 Historias en Son)",
        danceGear: "Son Cubano",
        colorTheme: "blue",
        timingMode: "Contrapunto (On2 <-> On1)",
        musicalTrigger:
          "Three humorous Havana stories (the bank queue at 0:15, Felo the vendor at 0:44, and the park Wi-Fi girl at 1:15) backed by acoustic Son percussion with NO cowbell.",
        leaderCue:
          "Stay in Son Cubano (On2) or ultra-smooth Closed/One-Hand Casino (Paseala, Kentucky, slow Setenta). Hit the funny vocal break at 1:33 ('¡No te oigo!').",
        followerCue:
          "Keep movements smooth and grounded; play with the '¡No te oigo!' (cupping ear) lyrical break at 1:33!",
        commonMistakeWarning:
          "Dancing high-stress Timba knots during a laid-back Son storytelling section.",
        instrumentMapping: {
          feet: "Bongo martillo & Maracas",
          hipsAndKnees: "Smooth circular walking",
          chestAndShoulders: "Playful stop at 1:33 ('¡No te oigo!')",
        },
        recommendedMoveSlugs: ["imp-sub-1", "beg-pw-2", "imp-pw-6"],
      },
      {
        id: "lcm-seg-3",
        startTimeSeconds: 102,
        endTimeSeconds: 133,
        formattedRange: "1:42 - 2:13",
        sectionName: "Montuno de Son ('Tienen que relajarse')",
        danceGear: "Casino (Smooth)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 1:40 El Niño shouts '¡Señores!' and launches the first call-and-response chorus ('Le dio una cosa mala'), still keeping the warm Son percussion.",
        leaderCue:
          "Transition to flowing circular Casino (Sombrero, Vacilala, Montana). Prepare to break apart when the horns hit at 2:13!",
        followerCue:
          "Open up your turns and listen for the brass transition right after 'te puede dar una cosa mala' at 2:12.",
        commonMistakeWarning:
          "Missing the brass transition at 2:13 because you're stuck mid-combination.",
        instrumentMapping: {
          feet: "4/4 Casino flow",
          hipsAndKnees: "Relaxed rotational momentum",
          chestAndShoulders: "Fluid two-hand and one-hand connection",
        },
        recommendedMoveSlugs: ["beg-pw-1", "imp-pw-3", "imp-pw-4"],
      },
      {
        id: "lcm-seg-4",
        startTimeSeconds: 133,
        endTimeSeconds: 174,
        formattedRange: "2:13 - 2:54",
        sectionName: "Mambo & Tumbao de Pachy ('Dicen que es el estrés')",
        danceGear: "Suelta / Shines",
        colorTheme: "amber",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 2:13 the horns fire ('Metales que no mienten'); at 2:24 El Niño calls '¡Dale tumbao, Pachy!' as the piano tumbao enters, stripping down to a funky bass/piano groove at 2:35 ('Dicen que es el estrés').",
        leaderCue:
          "Break apart at 2:13 for horn-section Suelta shines! At 2:35 when the horns drop out, lower your posture into a groovy Rumba/Timba solo play with your partner.",
        followerCue:
          "Hit sharp footwork on the 2:13-2:34 horns, then switch to low, isolation-heavy body movement on the 2:35 'Dicen que es el estrés' breakdown.",
        commonMistakeWarning:
          "Staying locked in closed partnerwork during the stripped-back 2:35-2:54 'Dicen que es el estrés' groove!",
        instrumentMapping: {
          feet: "Pachy's syncopated piano tumbao",
          hipsAndKnees: "Low Timba & Rumba groove",
          chestAndShoulders: "Playful shoulder/torso isolations",
        },
        recommendedMoveSlugs: ["imp-solo-1", "int-sub-1"],
      },
      {
        id: "lcm-seg-5",
        startTimeSeconds: 174,
        endTimeSeconds: 232,
        formattedRange: "2:54 - 3:52",
        sectionName: "Montuno Timbero (Entra la Campana)",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 2:54 ('Ay pero sé que les da...') the Bongo and Timbal bells slam in at full Timba power, including the 3:14 '¡Mano pa' arriba!' and 3:24 '¡Alaroye!' shoutouts.",
        leaderCue:
          "Reconnect at 2:54! Now the full Timba engine is roaring—lead your best Intermediate/Advanced combinations (Dedo, Siete Loco, Coca-Cola, Bayamo).",
        followerCue:
          "Match the driving cowbell energy with crisp turns and hit a quick Eleguá/Afro accent on '¡Alaroye!' at 3:24.",
        commonMistakeWarning:
          "Not shifting up a gear when the heavy Timba bells finally drop at 2:54.",
        instrumentMapping: {
          feet: "Driving Bongo & Timbal bells",
          hipsAndKnees: "High-energy circular Casino",
          chestAndShoulders: "3:14 'Mano pa' arriba' & 3:24 'Alaroye' accents",
        },
        recommendedMoveSlugs: ["int-pw-3", "int-pw-4", "adv-mus-1"],
      },
      {
        id: "lcm-seg-6",
        startTimeSeconds: 232,
        endTimeSeconds: 252,
        formattedRange: "3:52 - 4:12",
        sectionName: "El Conteo Regresivo ('4, 3, 2, 1... ¡Se le quitó!')",
        danceGear: "Despelote / Reparto",
        colorTheme: "red",
        timingMode: "Syncopated Reparto",
        musicalTrigger:
          "At 3:52 El Niño announces '¡Preparados pa'l conteo regresivo!', counts '4, 3, 2, 1' (4:03-4:06), shouts '¡Se le quitó!' (4:07), and the band hits a DEAD-SILENT STOP from 4:09 to 4:11!",
        leaderCue:
          "ULTIMATE MUSICALITY FLEX: Enter Shadow Position or Despelote at 3:52, mark '4-3-2-1' with body hits, and FREEZE COMPLETELY on the 4:08 horn stab until 4:12!",
        followerCue:
          "Hit the 4-3-2-1 countdown accents and hold a dramatic, statuesque freeze with zero movement during the 4:09-4:11 silence!",
        commonMistakeWarning:
          "Stepping through the famous 4:09-4:11 dead-silent freeze while the entire social dance floor stops!",
        instrumentMapping: {
          feet: "Planted on the 4-3-2-1 countdown",
          hipsAndKnees: "Despelote roll into total lock at 4:08",
          chestAndShoulders: "Complete freeze from 4:08 to 4:12",
        },
        recommendedMoveSlugs: ["int-solo-1", "adv-solo-1", "int-mus-1"],
      },
      {
        id: "lcm-seg-7",
        startTimeSeconds: 252,
        endTimeSeconds: 310,
        formattedRange: "4:12 - 5:10",
        sectionName: "Mambo Fuerte & Montuno Climax",
        danceGear: "Casino (Flow)",
        colorTheme: "purple",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Explosive brass Mambo erupts out of the silence at 4:12, followed by rapid-fire pregones ('Sé que la vida está muy dura...') and international shoutouts.",
        leaderCue:
          "Explode out of the freeze at 4:12 into fast Suelta or high-velocity rotational Casino combinations.",
        followerCue:
          "Snap right back into full-speed motion on the 4:12 chorus entrance.",
        commonMistakeWarning:
          "Recovering too slowly from the 4:09 freeze and missing the 4:12 drop.",
        instrumentMapping: {
          feet: "Fast Mambo & Timba footwork",
          hipsAndKnees: "Compact high-speed turns",
          chestAndShoulders: "Sharp brass section accents",
        },
        recommendedMoveSlugs: ["imp-pw-4", "int-pw-2", "adv-pw-1"],
      },
      {
        id: "lcm-seg-8",
        startTimeSeconds: 310,
        endTimeSeconds: 347,
        formattedRange: "5:10 - 5:47",
        sectionName: "Coda Final ('Sin presión y sin estrés')",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Final pregón block at 5:10 leading into a syncopated piano/brass outro at 5:32 ('¡Vaya la cosa mala!') and a sharp final cutoff at 5:42.",
        leaderCue:
          "Wind down with smooth, celebratory combinations and hit a clean final dip or pose on the last brass hit at 5:41-5:42.",
        followerCue:
          "Finish your final turn cleanly on count 7 and lock into the final pose at 5:42.",
        commonMistakeWarning:
          "Missing the 5:42 final brass cutoff.",
        instrumentMapping: {
          feet: "Syncopated outro cadence",
          hipsAndKnees: "Grounded final weight lock",
          chestAndShoulders: "Final pose at 5:42",
        },
        recommendedMoveSlugs: ["imp-pw-1", "imp-pw-2", "int-pw-1"],
      },
    ],
  },

  // -----------------------------------------------------------------
  // 3. "Agua Pa' Yemayá" - El Niño y La Verdad & Elito Revé y su Charangón
  // Level: Advanced Boss Track • 99 BPM • 2-3 Son / 6/8 Afro-Bembé Hybrid • 417 seconds (6:57)
  // Official Video ID: ZuaNY9AKoLc | Backup ID: ROH1qfLdAh0
  // -----------------------------------------------------------------
  {
    id: "agua-pa-yemaya",
    title: "Agua Pa' Yemayá (2026 Official Video)",
    artist: "El Niño y La Verdad & Elito Revé y su Charangón",
    bpm: 99,
    claveType: "2-3 Son / 6/8 Afro-Bembé Hybrid",
    difficultyLevel: "Advanced",
    durationSeconds: 417,
    youtubeVideoId: "ZuaNY9AKoLc",
    alternateYoutubeVideoId: "ROH1qfLdAh0",
    youtubeUrl: "https://www.youtube.com/watch?v=ZuaNY9AKoLc",
    spotifyOrYoutubeEmbedUrl:
      "https://open.spotify.com/search/Agua%20Pa%20Yemaya%20Elito%20Reve",
    segments: [
      {
        id: "apy-seg-1",
        startTimeSeconds: 0,
        endTimeSeconds: 29,
        formattedRange: "0:00 - 0:29",
        sectionName: "Rezo Lucumí (Toque de Batá)",
        danceGear: "Afro-Cuban Orishas",
        colorTheme: "amber",
        timingMode: "Free / Polyrhythmic (6/8)",
        musicalTrigger:
          "Sacred 6/8 Batá drums (Añá) and Yorùbá Akpon prayer ('Olo baraba...') over ocean waves. Zero 4/4 salsa beat.",
        leaderCue:
          "Stand apart. Do NOT ask for closed hold or Guapea during a Batá invocation. Mark slow, grounded Yemayá torso undulations.",
        followerCue:
          "Channel Yemayá (owner of the ocean)—use flowing skirt/arm styling and spinal waves matching the Iyá drum calls.",
        commonMistakeWarning:
          "Grabbing your partner on second 5 and stepping 1-2-3-5-6-7 over a sacred 6/8 Yorùbá prayer.",
        instrumentMapping: {
          feet: "Grounded 6/8 earth connection",
          hipsAndKnees: "Rolling ocean swell",
          chestAndShoulders: "Iyá Batá drum accents",
        },
        recommendedMoveSlugs: ["int-sub-1", "adv-mus-1"],
      },
      {
        id: "apy-seg-2",
        startTimeSeconds: 29,
        endTimeSeconds: 56,
        formattedRange: "0:29 - 0:56",
        sectionName: "Intro Instrumental (Mambo de Entrada)",
        danceGear: "Suelta / Shines",
        colorTheme: "purple",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 0:29 the 4/4 piano tumbao, bass, and trombones burst in; at 0:33 El Niño shouts '¡Oye sí! Dedicado para todo aquel que tiene fe!'",
        leaderCue:
          "Shift from 6/8 Afro into 4/4 Suelta footwork on the 0:29 brass hit, then walk in to connect in Closed Frame at 0:44 ('Yelele').",
        followerCue:
          "Match the 0:29 horn entrance with sharp Suelta shines and transition smoothly into closed hold as the vocals soften at 0:44.",
        commonMistakeWarning:
          "Missing the 6/8-to-4/4 rhythm switch at 0:29.",
        instrumentMapping: {
          feet: "4/4 Piano tumbao entrance",
          hipsAndKnees: "Cuban salsa bounce",
          chestAndShoulders: "Trombone fanfare hits",
        },
        recommendedMoveSlugs: ["imp-sub-1", "int-pw-1"],
      },
      {
        id: "apy-seg-3",
        startTimeSeconds: 56,
        endTimeSeconds: 101,
        formattedRange: "0:56 - 1:41",
        sectionName: "Tema (Cuerpo / Narrative Verse)",
        danceGear: "Son Cubano",
        colorTheme: "blue",
        timingMode: "Contrapunto (On2 <-> On1)",
        musicalTrigger:
          "El Niño sings the main narrative verse ('Camarada del edificio...'). Percussion is soft (martillo bongo & conga marcha, no heavy bell).",
        leaderCue:
          "Dance elegant Son Cubano (Contratiempo On2) or smooth Closed Casino (Paseala, Kentucky). Hit the brass accent at 1:08 ('Vela y siete caracoles').",
        followerCue:
          "Keep your frame light and steps compact; let the vocal storytelling breathe without forcing big styling.",
        commonMistakeWarning:
          "Cranking aggressive, high-speed arm knots during an intimate narrative verse.",
        instrumentMapping: {
          feet: "Soft conga tumbao (On2 or smooth On1)",
          hipsAndKnees: "Smooth pendulum weight transfer",
          chestAndShoulders: "Upright elegant Son frame",
        },
        recommendedMoveSlugs: ["beg-pw-2", "imp-pw-6"],
      },
      {
        id: "apy-seg-4",
        startTimeSeconds: 101,
        endTimeSeconds: 134,
        formattedRange: "1:41 - 2:14",
        sectionName: "Montuno 1 (Agua pa' aquí, agua pa' allá)",
        danceGear: "Casino (Smooth)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "Elito Revé introduces the band at 1:41 ('Oye Niño, el Charangón es la escuela') and the first chorus drops at 1:48 with the bongo bell.",
        leaderCue:
          "Open the frame into circular Casino flow (Setenta, Sombrero, Vacilala). Prepare to break apart right at 2:14!",
        followerCue:
          "Flow through circular traveling turns and listen for the sudden rhythm drop coming right after 'A la purita!' at 2:10.",
        commonMistakeWarning:
          "Starting a long 32-count knot combination at 2:12 right before the 4/4 beat disappears.",
        instrumentMapping: {
          feet: "4/4 Casino circular step",
          hipsAndKnees: "Grounded rotational flow",
          chestAndShoulders: "Relaxed Casino frame",
        },
        recommendedMoveSlugs: ["imp-pw-3", "imp-pw-4"],
      },
      {
        id: "apy-seg-5",
        startTimeSeconds: 134,
        endTimeSeconds: 169,
        formattedRange: "2:14 - 2:49",
        sectionName: "Moyugba en 6/8 (Pachy Piano & Batá Break)",
        danceGear: "Afro-Cuban Orishas",
        colorTheme: "amber",
        timingMode: "Free / Polyrhythmic (6/8)",
        musicalTrigger:
          "At 2:14 ('Dale tumbao Pachy... Mayito'), the 4/4 salsa beat drops out completely into a 6/8 Afro-Cuban piano tumbao and Batá groove while Elito Revé recites the Moyugba prayer ('Omi tuto, ana tuto...').",
        leaderCue:
          "CRITICAL SALSERO TEST: Release your partner at 2:14! Dance solo 6/8 Afro-Cuban movement (Eleguá / Yemayá) matching Pachy's piano and Mayito's Batá drums.",
        followerCue:
          "Break away and groove in 6/8 time—use grounded Afro footwork and torso undulation until Elito shouts '¡Weeeaaa!' at 2:48.",
        commonMistakeWarning:
          "Continuing to lead 4/4 Casino turn patterns between 2:14 and 2:49 while the band is playing a 6/8 religious Moyugba!",
        instrumentMapping: {
          feet: "6/8 Afro-Cuban pulse",
          hipsAndKnees: "Deep grounded knee flexion",
          chestAndShoulders: "Pachy's 6/8 piano & Batá accents",
        },
        recommendedMoveSlugs: ["int-sub-1", "adv-mus-1"],
      },
      {
        id: "apy-seg-6",
        startTimeSeconds: 169,
        endTimeSeconds: 217,
        formattedRange: "2:49 - 3:37",
        sectionName: "Montuno 2 (Coro 'Agua' + Batá Fusion)",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 2:49 the 4/4 Timba beat slams back in with the chorus chanting '¡Agua!' over heavy Batá drums.",
        leaderCue:
          "Reconnect with Dile Que No at 2:49 and fuse Casino with Afro-Cuban flavor—leave 4-count or 8-count windows mid-Vacilala for Orisha styling.",
        followerCue:
          "Blend Yemayá waves and Ochún/Changó accents into your open shines before reconnecting with the leader's frame.",
        commonMistakeWarning:
          "Dancing robotic partnerwork and ignoring the Batá drums roaring underneath the chorus.",
        instrumentMapping: {
          feet: "4/4 Casino step",
          hipsAndKnees: "Rotational drive",
          chestAndShoulders: "Afro-Cuban torso undulation",
        },
        recommendedMoveSlugs: ["int-pw-1", "adv-pw-1"],
      },
      {
        id: "apy-seg-7",
        startTimeSeconds: 217,
        endTimeSeconds: 276,
        formattedRange: "3:37 - 4:36",
        sectionName: "Montuno 3 (Cambio a 'Agua Bendita')",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 3:37 El Niño fires a vocal roll ('Sere-pipipipi...') and launches the main anthem at 3:40: 'Pregunto qué es lo que tú necesitas — ¡Agua Bendita!'",
        leaderCue:
          "Full Casino Gear! The timbal bell and trombones are firing—lead continuous combinations (Montana, Dedo, Siete Loco, Coca-Cola).",
        followerCue:
          "Match the high-energy chorus with crisp turns, active frame connection, and celebratory styling on '¡Mano pa' arriba el mundo!' (4:08).",
        commonMistakeWarning:
          "Losing circular geometry and pulling with the arms as the excitement increases.",
        instrumentMapping: {
          feet: "Driving Timbal campana",
          hipsAndKnees: "Fast compact circular steps",
          chestAndShoulders: "Coro & brass call-and-response",
        },
        recommendedMoveSlugs: ["int-pw-2", "adv-pw-1"],
      },
      {
        id: "apy-seg-8",
        startTimeSeconds: 276,
        endTimeSeconds: 341,
        formattedRange: "4:36 - 5:41",
        sectionName: "Presión & Mambo ('A Remar' / 'Mano Pa' Arriba')",
        danceGear: "Despelote / Reparto",
        colorTheme: "red",
        timingMode: "Syncopated Reparto",
        musicalTrigger:
          "At 4:36 El Niño chants '¡A remar, a remar!' (rowing cue), builds crowd pressure at 5:00 ('Mano pa' arriba'), and hits a fierce brass Mambo at 5:18.",
        leaderCue:
          "Musicality goldmine: On 'A remar' (4:36-4:50), drop into Shadow Position or face-to-face and hit the Yemayá/Changó rowing paddle motion! At 5:18, unleash fast Suelta or Despelote.",
        followerCue:
          "Join the 'A remar' rowing groove at 4:36, throw hands up on the 5:04-5:15 vocal swells, and hit sharp hip/ribcage isolations on the 5:18 Mambo.",
        commonMistakeWarning:
          "Ignoring literal lyrical cues like 'A remar' (row the boat) that every Cuban dancer hits on the floor.",
        instrumentMapping: {
          feet: "Syncopated Mambo footwork",
          hipsAndKnees: "Despelote & Tembleque groove",
          chestAndShoulders: "'A remar' rowing motion & brass hits",
        },
        recommendedMoveSlugs: ["int-solo-1", "adv-solo-1"],
      },
      {
        id: "apy-seg-9",
        startTimeSeconds: 341,
        endTimeSeconds: 396,
        formattedRange: "5:41 - 6:36",
        sectionName: "Cierre en Güiro / Bembé (Toque pa' Eleguá)",
        danceGear: "Afro-Cuban Orishas",
        colorTheme: "amber",
        timingMode: "Free / Polyrhythmic (6/8)",
        musicalTrigger:
          "At 5:41 El Niño shouts '¡Vaya Güiro!' and the band shifts into an authentic 6/8 Afro-Cuban Bembé/Güiro ('Chapeando fino') invoking Eleguá ('Se va, se va... Alaroye, Eshu Alaguana' at 5:57).",
        leaderCue:
          "Drop hands immediately at 5:41! Dance 6/8 Eleguá ('chapeando fino'—clearing the grass with low sweeping gestures and playful footwork), then pause on the dramatic 6:24 blessing.",
        followerCue:
          "Switch to 6/8 Bembé/Eleguá footwork and torso movement; at 6:24 ('Que Yemayá bendiga al Charangón...'), hit dramatic slow-motion Orisha poses on each brass stab.",
        commonMistakeWarning:
          "Dancing 4/4 Salsa when the band is playing a 6/8 Güiro for Eleguá ('Se va, se va').",
        instrumentMapping: {
          feet: "6/8 Bembé / Eleguá step",
          hipsAndKnees: "Low grounded Afro bounce",
          chestAndShoulders: "'Chapeando fino' & Eleguá gestures",
        },
        recommendedMoveSlugs: ["int-sub-1", "adv-mus-1"],
      },
      {
        id: "apy-seg-10",
        startTimeSeconds: 396,
        endTimeSeconds: 417,
        formattedRange: "6:36 - 6:57",
        sectionName: "Coda Final ('Agua Bendita' + Corte)",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        musicalTrigger:
          "At 6:36 the 4/4 Timba band blasts back in for the final 'Agua Bendita' chorus, ending on a stuttering vocal/brass cutoff ('Bendi-bi-bi-bi-ta!') at 6:52.",
        leaderCue:
          "Reconnect at 6:36 for one final burst of Casino turns and lock in a clean freeze or shadow dip on the stuttering brass hit at 6:50-6:52.",
        followerCue:
          "Reconnect frame instantly at 6:36 and hit the final 'Bendi-bi-bi-bi-ta' stutter at 6:50 with sharp shoulder/chest accents into a clean freeze.",
        commonMistakeWarning:
          "Still spinning after 6:52 when the band has already hit the final cutoff.",
        instrumentMapping: {
          feet: "Final 4/4 sprint",
          hipsAndKnees: "Locked balance on count 7",
          chestAndShoulders: "Stutter-hit freeze at 6:50",
        },
        recommendedMoveSlugs: ["int-pw-3", "adv-pw-1"],
      },
    ],
  },

  // -----------------------------------------------------------------
  // 4. "Aguanile" - Marc Anthony (El Cantante / Héctor Lavoe Tribute)
  // Level: Advanced • 105 BPM • 2-3 Son/Rumba Clave • 316 seconds (5:16)
  // Official Video ID: b4rd9VfMhWM
  // -----------------------------------------------------------------
  {
    id: "aguanile",
    title: "Aguanile (Advanced Afro-Cuban & Casino Masterclass)",
    artist: "Marc Anthony",
    bpm: 105,
    claveType: "2-3 Son/Rumba Clave",
    difficultyLevel: "Advanced",
    durationSeconds: 316,
    youtubeVideoId: "b4rd9VfMhWM",
    youtubeUrl: "https://www.youtube.com/watch?v=b4rd9VfMhWM",
    spotifyOrYoutubeEmbedUrl:
      "https://open.spotify.com/search/Marc%20Anthony%20Aguanile",
    segments: [
      {
        id: "ag-seg-1",
        startTimeSeconds: 0,
        endTimeSeconds: 26,
        formattedRange: "0:00 - 0:26",
        sectionName: "01. Ritual Batá & Oggún Invocation",
        danceGear: "Afro-Cuban Orishas",
        colorTheme: "amber",
        timingMode: "Free / Polyrhythmic (6/8)",
        handGesture: "Oggún Machete Slice & Water Flick",
        musicalTrigger:
          "Sacred Batá drums, chekeré, and Afro-Cuban Lucumí chant ('Aguanile Mai Mai, Oggún Arere') invoke Oggún and purify the floor before the 4/4 groove begins.",
        leaderCue:
          "Start apart in solo Suelta! Ground your knees and lead Oggún's symbolic machete-clearing strikes across the body combined with holy-water flicks.",
        followerCue:
          "Answer with grounded 6/8 Afro-Cuban torso undulations (ondulación) and expressive Yemayá/Oggún arm sweeps.",
        commonMistakeWarning:
          "Grabbing closed partner frame on 0:01 and forcing 1-2-3-5-6-7 steps over sacred 6/8 Batá ritual percussion.",
        instrumentMapping: {
          feet: "6/8 grounded Orisha earth-stomp",
          hipsAndKnees: "Deep Afro-Cuban knee compression",
          chestAndShoulders: "Oggún machete strike & chest contraction",
        },
        recommendedMoveSlugs: ["adv-sub-1", "adv-mus-1"],
      },
      {
        id: "ag-seg-2",
        startTimeSeconds: 26,
        endTimeSeconds: 50,
        formattedRange: "0:27 - 0:50",
        sectionName: "02. The Sacred Liturgical Freeze",
        danceGear: "Wait / Breathe",
        colorTheme: "slate",
        timingMode: "Ambient (No Beat)",
        handGesture: "Palms-Up Prayer / Silencio Freeze",
        musicalTrigger:
          "At 0:27 percussion drops out completely as Marc Anthony delivers a dramatic, rubato liturgical cry ('¡Señor...!') suspended in open space.",
        leaderCue:
          "Signal 'Palms-Up Prayer / Silencio Freeze'! Hold a slow, theatrical suspension facing your partner and build eye-contact tension for the 0:51 drop.",
        followerCue:
          "Match the theatrical freeze with a slow, poised arm extension and breathing suspension until the clave ignites at 0:51.",
        commonMistakeWarning:
          "Fidgeting or stepping aimlessly during the dramatic rubato vocal prayer.",
        instrumentMapping: {
          feet: "Anchored split-weight stance",
          hipsAndKnees: "Poised stillness",
          chestAndShoulders: "Slow theatrical breath expansion",
        },
        recommendedMoveSlugs: ["beg-mus-1", "adv-mus-1"],
      },
      {
        id: "ag-seg-3",
        startTimeSeconds: 50,
        endTimeSeconds: 98,
        formattedRange: "0:51 - 1:38",
        sectionName: "03. Clave & Trombone Ignition",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        handGesture: "'70' Fingers + Neck Wrap — Setenta Complicado",
        musicalTrigger:
          "At 0:51 the piano montuno, upright bass tumbao, and roaring trombones lock into a driving 105 BPM 2-3 clave groove.",
        leaderCue:
          "Flash '70' fingers into neck-wrap signal! Connect on 0:51 and launch into high-velocity Setenta Complicado, Sombrero Doble, and circular Casino flow.",
        followerCue:
          "Frame up with active lat connection at 0:51, keeping tight axis control through fast Setenta and Sombrero combinations.",
        commonMistakeWarning:
          "Missing the 0:51 beat-1 trombone explosion or letting arms go limp at 105 BPM.",
        instrumentMapping: {
          feet: "Crisp 105 BPM circular Casino steps",
          hipsAndKnees: "Driven Cuban motion on conga tumbao",
          chestAndShoulders: "Connected rotational partner frame",
        },
        recommendedMoveSlugs: ["int-pw-1", "adv-pw-1"],
      },
      {
        id: "ag-seg-4",
        startTimeSeconds: 98,
        endTimeSeconds: 125,
        formattedRange: "1:39 - 2:05",
        sectionName: "04. First Trombone Mambo Attack",
        danceGear: "Suelta / Shines",
        colorTheme: "purple",
        timingMode: "Contrapunto (On2 <-> On1)",
        handGesture: "Double Chest Tap + 2 Fingers Down — Pasitos",
        musicalTrigger:
          "At 1:39 the brass section unleashes a ferocious, syncopated trombone Mambo riff while bongo and timbales trade artillery.",
        leaderCue:
          "Tap chest twice + point 2 fingers down for Pasitos! Break apart via Enchufla into fiery Suelta footwork, syncopated kicks, and Columbia touches.",
        followerCue:
          "Explode into solo shines—hit the trombone stabs with sharp Cuban body rolls, heel-toe syncopations, and shoulder shimmies.",
        commonMistakeWarning:
          "Staying locked in closed-hold partnerwork when the trombones demand solo Suelta footwork.",
        instrumentMapping: {
          feet: "Fast Columbia & Mambo syncopations",
          hipsAndKnees: "Sharp rhythmic accents",
          chestAndShoulders: "Trombone-hit shoulder shimmies",
        },
        recommendedMoveSlugs: ["int-solo-1", "adv-solo-1"],
      },
      {
        id: "ag-seg-5",
        startTimeSeconds: 125,
        endTimeSeconds: 166,
        formattedRange: "2:06 - 2:46",
        sectionName: "05. 'Tambores' Earth-Shaker Coro",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        handGesture: "Air-Drum Fingers + Crazy 7 — Siete Loco",
        musicalTrigger:
          "The iconic 'Aguanile Mai Mai' coro returns at 2:06 with rolling conga/timbal fills ('¡Que suenen los tambores!').",
        leaderCue:
          "Signal Air-Drum Fingers into Crazy 7 ('Siete Loco')! Reconnect and lead intricate Coca-Cola, Siete Loco, and Montana turn patterns.",
        followerCue:
          "Spot cleanly through rapid traveling turns and accent the 'Mai Mai' vocal hits with hip and ribcage punctuation.",
        commonMistakeWarning:
          "Rushing the prep on count 7-8 during fast traveling turns.",
        instrumentMapping: {
          feet: "Quick pivot turns & circular travel",
          hipsAndKnees: "Grounded axis stability",
          chestAndShoulders: "Compact arm-knot transitions",
        },
        recommendedMoveSlugs: ["int-pw-2", "adv-pw-2"],
      },
      {
        id: "ag-seg-6",
        startTimeSeconds: 166,
        endTimeSeconds: 226,
        formattedRange: "2:47 - 3:46",
        sectionName: "06. Staccato Brass Drops & Storytelling",
        danceGear: "Rumba Guaguancó",
        colorTheme: "red",
        timingMode: "Contrapunto (On2 <-> On1)",
        handGesture: "Flat Palm Horizontal Slice — Congelado Check",
        musicalTrigger:
          "Between 2:47 and 3:46, the arrangement alternates between sharp staccato brass drops, dramatic silences, and rumba percussion breaks.",
        leaderCue:
          "Use the Flat Palm Horizontal Slice ('Congelado') on every brass cutoff! Alternate between cheeky Rumba Guaguancó vacunao play and sudden musical freezes.",
        followerCue:
          "React instantly to the brass cutoffs with sharp freezes and playful Guaguancó skirt/hand defense on the percussion fills.",
        commonMistakeWarning:
          "Spinning blindly through the staccato horn stops instead of hitting the freezes.",
        instrumentMapping: {
          feet: "Precision check-steps & Rumba timing",
          hipsAndKnees: "Instant stop-and-go compression",
          chestAndShoulders: "Sharp staccato brass isolation",
        },
        recommendedMoveSlugs: ["int-sub-1", "adv-mus-1"],
      },
      {
        id: "ag-seg-7",
        startTimeSeconds: 226,
        endTimeSeconds: 280,
        formattedRange: "3:47 - 4:40",
        sectionName: "07. Timbal, Campana & Montuno Climax",
        danceGear: "Despelote / Reparto",
        colorTheme: "amber",
        timingMode: "Syncopated Reparto",
        handGesture: "Overhead Lasso + Shoulder Point — Tornillo & Despelote",
        musicalTrigger:
          "At 3:47 the timbales, bongo bell, and screaming brass hit maximum overdrive in a relentless Montuno climax.",
        leaderCue:
          "Signal Overhead Lasso + Shoulder Point! Unleash high-speed Tornillo spins, Tembleque vibration, and face-to-face Despelote body isolation.",
        followerCue:
          "Match the climax energy with rapid hip-shimmy Tembleque, polyrhythmic Despelote isolations, and lightning-fast spins.",
        commonMistakeWarning:
          "Losing posture or tensing the neck during high-speed Tembleque and Despelote.",
        instrumentMapping: {
          feet: "Rapid timbal-roll footwork",
          hipsAndKnees: "High-frequency Tembleque vibration",
          chestAndShoulders: "Explosive Despelote & Rumba Columbia",
        },
        recommendedMoveSlugs: ["adv-solo-1", "adv-pw-1"],
      },
      {
        id: "ag-seg-8",
        startTimeSeconds: 280,
        endTimeSeconds: 316,
        formattedRange: "4:41 - 5:16",
        sectionName: "08. Final Ritual Coda & Big Finish",
        danceGear: "Casino (Flow)",
        colorTheme: "emerald",
        timingMode: "A Tiempo (On1)",
        handGesture: "Crossed Wrists Overhead — Fin de Fiesta Lunge",
        musicalTrigger:
          "From 4:41 to 5:16 the full orchestra races toward the final ritual brass crescendo and decisive cutoff.",
        leaderCue:
          "Signal Crossed Wrists Overhead ('Fin de Fiesta')! Lead a final Enchufla Doble into a dramatic, supported lunge/pose right on the final brass chord.",
        followerCue:
          "Maintain core engagement through the final spin and lock into a clean, theatrical finish line pose on the final cutoff.",
        commonMistakeWarning:
          "Dropping your frame early before the final brass chord finishes ringing.",
        instrumentMapping: {
          feet: "Anchored final lunge stance",
          hipsAndKnees: "Supported counterbalance",
          chestAndShoulders: "Triumphant theatrical finish line",
        },
        recommendedMoveSlugs: ["adv-pw-1", "adv-pw-2"],
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
