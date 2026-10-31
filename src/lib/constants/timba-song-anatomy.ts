import { z } from "zod";

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

/** Musical style of the whole track, so non-timba songs are labelled honestly. */
export const SongStyleSchema = z.enum([
  "Timba",
  "Cuban Son",
  "Cuban Salsa-Pop",
  "Puerto Rican Salsa",
  "New York Salsa",
  "Cuban Hip-Hop / Fusion",
]);
export type SongStyle = z.infer<typeof SongStyleSchema>;

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
  /** 4/4 bars in this section (from the AI Studio song maker; for a future beat count) */
  bars: z.number().int().positive().optional(),
  /** True when the section starts on a downbeat ("1") */
  startsOnOne: z.boolean().optional(),
});
export type SongSegment = z.infer<typeof SongSegmentSchema>;

export const SongAnatomySchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  style: SongStyleSchema,
  bpm: z.number().positive(),
  claveType: ClaveTypeSchema,
  difficultyLevel: SongDifficultySchema,
  durationSeconds: z.number().positive(),
  youtubeVideoId: z.string().min(5),
  youtubeUrl: z.string().url().optional(),
  alternateYoutubeVideoId: z.string().optional(),
  spotifyOrYoutubeEmbedUrl: z.string().optional(),
  /**
   * Rights-cleared audio we host ourselves (e.g. a studio recording). When set,
   * the practice player plays this instead of the YouTube video, which unlocks
   * features YouTube's terms forbid on its player. `license` documents the rights.
   */
  licensedAudio: z
    .object({
      url: z
        .string()
        .min(1)
        .refine(
          (value) => value.startsWith("/") || value.startsWith("https://") || value.startsWith("data:audio/"),
          "Audio must be a site path (/audio/...), an https URL or a data:audio URL"
        ),
      license: z.string().min(3, "Describe the licence / permission for this audio"),
    })
    .optional(),
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
    style: "Timba",
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
  // "La Cosa Mala" - El Niño y La Verdad
  // Timba • Intermediate • 96 BPM • 2-3 Son Clave • 347s
  // Video ID: et8gHrBf_6s • timings from Argus
  // Gemini 4 Argon in AI Studio 2026-10-31. 5 of 13 starts within 2 s of the old map. Ear-check: 1:15.5 (Mi prima Katy, not in the old map), bomba end 3:44.5 (old map 3:52), countdown 4:04 to 4:12.
  // -----------------------------------------------------------------
  {
    "id": "la-cosa-mala",
    "title": "La Cosa Mala",
    "artist": "El Niño y La Verdad",
    "style": "Timba",
    "bpm": 96,
    "claveType": "2-3 Son Clave",
    "difficultyLevel": "Intermediate",
    "durationSeconds": 347,
    "youtubeVideoId": "et8gHrBf_6s",
    "youtubeUrl": "https://www.youtube.com/watch?v=et8gHrBf_6s",
    "alternateYoutubeVideoId": "8GXd6UuNJ7A",
    "spotifyOrYoutubeEmbedUrl": "https://open.spotify.com/search/El%20Nino%20y%20La%20Verdad%20La%20Cosa%20Mala",
    "segments": [
      {
        "id": "cosa-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 15.5,
        "formattedRange": "0:00 - 0:15",
        "sectionName": "Intro: Tú Ten Cuidado No Te Dé",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Syncopated piano-tres tumbao and bongó enter with El Niño warning 'Tú ten cuidado no te dé... La cosa mala'.",
        "leaderCue": "Stand relaxed with your partner, sway to the tres tumbao, and find beat 1 before the story starts.",
        "followerCue": "Match the leader's weight transfer in place and feel the conga slap on 2 and 4.",
        "commonMistakeWarning": "Rushing into full turn patterns during the spoken warning before the first verse begins at 0:15.5.",
        "recommendedMoveSlugs": [
          "beg-mus-1",
          "imp-mus-1"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "Conga slap on 2 and 4",
          "hipsAndKnees": "Bass and tres tumbao",
          "chestAndShoulders": "Bongó martillo"
        },
        "bars": 6,
        "startsOnOne": true
      },
      {
        "id": "cosa-seg-2",
        "startTimeSeconds": 15.5,
        "endTimeSeconds": 75.5,
        "formattedRange": "0:15 - 1:15",
        "sectionName": "Tema 1 & 2: La Cola del Banco y El Vendedor",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "El Niño begins the first story verse 'El otro día en la cola del banco' followed by 'Un vendedor con su carretilla'.",
        "leaderCue": "Dance compact Son Cubano or close-hold Paso Básico, Dile Que No, and Paséala to let the stories breathe.",
        "followerCue": "Keep steps small and grounded, styling softly on the 'Le dio una cosa mala' coro refrains.",
        "commonMistakeWarning": "Over-leading big fast Casino combinations over the traditional Son storytelling verses.",
        "recommendedMoveSlugs": [
          "imp-sub-1",
          "beg-solo-1",
          "imp-pw-6"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "Conga tumbao and clave",
          "hipsAndKnees": "Syncopated bass tumbao",
          "chestAndShoulders": "Piano-tres guajeo"
        },
        "bars": 24,
        "startsOnOne": true,
        "handGesture": "Paséala"
      },
      {
        "id": "cosa-seg-3",
        "startTimeSeconds": 75.5,
        "endTimeSeconds": 105,
        "formattedRange": "1:15 - 1:45",
        "sectionName": "Tema 3 & Break: Mi Prima Katy",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "El Niño sings 'Mi prima Katy estaba en un parque', building to the '¡No te oigo nada!' and '¡Señores!' breaks.",
        "leaderCue": "Open into Guapea, Dile Que No, and Exhíbela; hit a playful freeze on '¡No te oigo nada!' at 1:33.",
        "followerCue": "Maintain a responsive frame through Exhíbela and accent the vocal breaks at 1:33 and 1:40.5.",
        "commonMistakeWarning": "Stepping straight through the '¡No te oigo nada!' stop at 1:33 without acknowledging the vocal break.",
        "recommendedMoveSlugs": [
          "beg-pw-1",
          "beg-pw-2",
          "beg-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bass downbeat and conga",
          "hipsAndKnees": "Piano montuno",
          "chestAndShoulders": "Brass punctuations and vocal breaks"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Exhíbela"
      },
      {
        "id": "cosa-seg-4",
        "startTimeSeconds": 105,
        "endTimeSeconds": 135,
        "formattedRange": "1:45 - 2:15",
        "sectionName": "Montuno 1: Tienes Que Relajarte",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Campana and coro-pregón enter in full swing as El Niño sings 'Oye, tienes que relajarte'.",
        "leaderCue": "Flow into Setenta, Sombrero, and Vacílala as the campana drives the first montuno.",
        "followerCue": "Keep turns crisp and spot cleanly, using free-arm styling on each 'Le dio una cosa mala' coro.",
        "commonMistakeWarning": "Letting your arms go limp during two-handed Sombrero and Setenta transitions.",
        "recommendedMoveSlugs": [
          "imp-pw-1",
          "imp-pw-4",
          "imp-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bongó campana and bass",
          "hipsAndKnees": "Conga and piano montuno",
          "chestAndShoulders": "Coro-pregón call and response"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Setenta"
      },
      {
        "id": "cosa-seg-5",
        "startTimeSeconds": 135,
        "endTimeSeconds": 155,
        "formattedRange": "2:15 - 2:35",
        "sectionName": "Mambo: Metales Que No Mienten",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Percussion drop at 2:15 followed by El Niño shouting '¡Metales que no mienten! ¡De vuelta al barrio!' and brass mambo.",
        "leaderCue": "Release after Vacílala into solo footwork, grooving to Pachi's piano tumbao and sharp brass riffs.",
        "followerCue": "Dance solo shines facing the leader, hitting the brass accents and building energy on 'Y dicen que es el estrés'.",
        "commonMistakeWarning": "Staying locked in closed partner hold when the brass mambo calls for open footwork.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "int-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Syncopated brass mambo hits",
          "hipsAndKnees": "Piano tumbao ('Dale tumbao Pachi')",
          "chestAndShoulders": "Timbal and campana drive"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Pa'Fuera"
      },
      {
        "id": "cosa-seg-6",
        "startTimeSeconds": 155,
        "endTimeSeconds": 175,
        "formattedRange": "2:35 - 2:55",
        "sectionName": "Coro Melódico: Dicen Que Es El Estrés",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Horns drop out and the singers harmonize smoothly on 'Y dicen que es el estrés, yo no sé qué es'.",
        "leaderCue": "Reconnect with Dile Que No into smooth Kentucky and Paséala, matching the relaxed vocal harmony.",
        "followerCue": "Breathe and smooth out your steps, gliding through Paséala after the high-energy mambo.",
        "commonMistakeWarning": "Keeping frantic mambo intensity when the band suddenly drops the volume for this melodic chorus.",
        "recommendedMoveSlugs": [
          "beg-pw-2",
          "imp-pw-5",
          "imp-pw-6"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Smooth bass and conga pulse",
          "hipsAndKnees": "Melodic vocal phrasing",
          "chestAndShoulders": "Light cáscara and maracas"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Kentucky"
      },
      {
        "id": "cosa-seg-7",
        "startTimeSeconds": 175,
        "endTimeSeconds": 195,
        "formattedRange": "2:55 - 3:15",
        "sectionName": "Montuno 2: Cuidado Que Te Da",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "El Niño re-enters with high-energy pregones 'Ay pero sé que les da' and rapid-fire 'Y ten cuidado que te da'.",
        "leaderCue": "Pick up the pace with Setenta Complicado and Dedo; finish in open position on '¡Mano pa'rriba!' at 3:14.",
        "followerCue": "Keep hook-finger tension crisp and prepare to separate when El Niño shouts '¡Mano pa'rriba!'.",
        "commonMistakeWarning": "Starting a long wrapped figure right at 3:14 when the timbal roll announces the Bomba drop.",
        "recommendedMoveSlugs": [
          "imp-pw-2",
          "int-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana and conga tumbao",
          "hipsAndKnees": "Bass and piano montuno",
          "chestAndShoulders": "Rapid-fire pregón rhythm"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Dedo"
      },
      {
        "id": "cosa-seg-8",
        "startTimeSeconds": 195,
        "endTimeSeconds": 224.5,
        "formattedRange": "3:15 - 3:44",
        "sectionName": "Bomba / Presión: ¡Mano Pa'rriba!",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Timbal roll on '¡Mano pa'rriba!' drops into heavy bass presión, synth sweeps, and band shout-outs.",
        "leaderCue": "Hands off for Despelote, ribcage isolations, and cintura groove while trading playful attitude with your partner.",
        "followerCue": "Work body rolls, hip isolations, and tembleque accents on the synth sweeps and 'Una cosa mala' hits.",
        "commonMistakeWarning": "Trying to lead standard Casino turn patterns when the piano drops out for the heavy bass Bomba.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "timingMode": "Syncopated Reparto",
        "instrumentMapping": {
          "feet": "Heavy bass bombo and kick",
          "hipsAndKnees": "Syncopated conga and bass presión",
          "chestAndShoulders": "Synth sweeps and vocal shout-outs"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Al Medio"
      },
      {
        "id": "cosa-seg-9",
        "startTimeSeconds": 224.5,
        "endTimeSeconds": 244,
        "formattedRange": "3:44 - 4:04",
        "sectionName": "Montuno Build: Preparado Pa'l Conteo",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Piano montuno and brass return on 'Ay pero sé que les da... Y preparado pa'l conteo regresivo'.",
        "leaderCue": "Scoop your partner back with Dile Que No into Siete and Enchufla, setting up for the countdown at 4:04.",
        "followerCue": "Re-engage your frame immediately from Despelote and stay alert for the '4, 3, 2, 1' break.",
        "commonMistakeWarning": "Ignoring the lyric warning 'Preparado pa'l conteo regresivo' and getting caught mid-turn at 4:04.",
        "recommendedMoveSlugs": [
          "beg-pw-2",
          "int-pw-3",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana and bass tumbao",
          "hipsAndKnees": "Returning piano montuno",
          "chestAndShoulders": "Brass hits and coro"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Siete"
      },
      {
        "id": "cosa-seg-10",
        "startTimeSeconds": 244,
        "endTimeSeconds": 252,
        "formattedRange": "4:04 - 4:12",
        "sectionName": "Bloque: Conteo Regresivo (4, 3, 2, 1)",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Band hits the countdown '¡Cuatro! ¡Tres! ¡Dos! ¡Uno! ¡Se le quitó! ¡No!' followed by a dramatic pause on '¡Señores!'.",
        "leaderCue": "Mark 4-3-2-1 with sharp foot or hand accents, freeze completely on '¡No!' at 4:09, and wait for 4:12.",
        "followerCue": "Count down with your body, hit a dramatic pose on '¡No!', and hold the silence through '¡Señores!'.",
        "commonMistakeWarning": "Restarting your basic step during the '¡Señores!' silence before the downbeat drops at 4:12.",
        "recommendedMoveSlugs": [
          "int-mus-1",
          "adv-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Countdown hits (4, 3, 2, 1)",
          "hipsAndKnees": "Bass stop on '¡No!'",
          "chestAndShoulders": "Dramatic freeze on '¡Señores!'"
        },
        "bars": 3,
        "startsOnOne": true
      },
      {
        "id": "cosa-seg-11",
        "startTimeSeconds": 252,
        "endTimeSeconds": 282,
        "formattedRange": "4:12 - 4:42",
        "sectionName": "Montuno 3: Sé Que La Vida Está Muy Dura",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Full band explodes back on 'Le dio una cosa mala' followed by El Niño's long pregón 'Sé que la vida está muy dura'.",
        "leaderCue": "Launch right on 4:12 into Montana and Coca-Cola, riding the soaring brass and melodic pregón.",
        "followerCue": "Power out of the freeze with strong spotting on Coca-Cola turns and fluid momentum.",
        "commonMistakeWarning": "Hesitating on the 4:12 downbeat after the countdown silence.",
        "recommendedMoveSlugs": [
          "int-pw-1",
          "int-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Driving campana and conga",
          "hipsAndKnees": "Bass and piano montuno",
          "chestAndShoulders": "Soaring brass and pregón melody"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Montana"
      },
      {
        "id": "cosa-seg-12",
        "startTimeSeconds": 282,
        "endTimeSeconds": 311.5,
        "formattedRange": "4:42 - 5:11",
        "sectionName": "Mambo & Shout-Outs: Vamos Pa' Allá La Gozadera",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "El Niño shouts '¡Vamos pa' allá la gozadera!' as layered brass mambos and DJ/friend shout-outs take over.",
        "leaderCue": "Break into Suelta shines and Rumba Guaguancó play, matching the punchy horn riffs at 5:02.",
        "followerCue": "Answer with solo footwork, guaguancó vacunao defense, and shoulder shimmies on the brass mambo.",
        "commonMistakeWarning": "Running out of stamina—use grounded Afro-Cuban and Rumba steps instead of rushing your feet.",
        "recommendedMoveSlugs": [
          "imp-solo-1",
          "adv-sub-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Brass mambo riffs",
          "hipsAndKnees": "Conga and timbal drive",
          "chestAndShoulders": "Horn section hits"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Pa'Fuera"
      },
      {
        "id": "cosa-seg-13",
        "startTimeSeconds": 311.5,
        "endTimeSeconds": 331.5,
        "formattedRange": "5:11 - 5:31",
        "sectionName": "Montuno Final: Consejo del Niño",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "El Niño cries '¡Oye! No cojas lucha con nada, sin presión y sin estrés... es un consejo del Niño'.",
        "leaderCue": "Reconnect for a final burst of Siete Loco or Enchufla Doble into Sombrero to celebrate the closing advice.",
        "followerCue": "Give full energy for the final partnerwork combinations while keeping your steps compact and on time.",
        "commonMistakeWarning": "Over-complicating the final bars and losing connection right before the outro.",
        "recommendedMoveSlugs": [
          "int-pw-3",
          "beg-pw-3",
          "imp-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana and bass tumbao",
          "hipsAndKnees": "Conga and piano montuno",
          "chestAndShoulders": "El Niño's final pregón"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Siete Loco"
      },
      {
        "id": "cosa-seg-14",
        "startTimeSeconds": 331.5,
        "endTimeSeconds": 347,
        "formattedRange": "5:31 - 5:47",
        "sectionName": "Final: ¡Vaya, La Cosa Mala!",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Piano-tres tumbao returns to the intro motif as El Niño calls '¡Vaya, la cosa mala!' before the final brass hit at 5:41.5.",
        "leaderCue": "Dance playful side-by-side shines to the tres motif and hit a sharp final dip or pose at 5:41.5.",
        "followerCue": "Style out the final piano-tres groove and lock in your finishing pose on the brass hit at 5:41.5.",
        "commonMistakeWarning": "Missing the final brass hit at 5:41.5—prepare your ending pose two beats early.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "beg-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Final brass cadence at 5:41.5",
          "hipsAndKnees": "Tres-piano outro tumbao",
          "chestAndShoulders": "Bongó and timbal fill"
        },
        "bars": 6,
        "startsOnOne": true
      }
    ]
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
    style: "Timba",
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
  // "Aguanile" - Marc Anthony
  // New York Salsa • Advanced • 120 BPM • 2-3 Son / 6/8 Afro-Bembé Hybrid • 316s
  // Video ID: b4rd9VfMhWM • timings from Argus
  // Gemini 4 Argon in AI Studio 2026-10-31 (old map: 8 sections; 4 of 12 new starts near it). Title cleaned (was 'Aguanile (Advanced Afro-Cuban & Casino Masterclass)'). Argon unsure: 0:21.5 (0:21-0:22.5), 2:47.5 (2:47-2:48.5). Ear-check also the drum-only drop 2:38.5 and the short final sections 4:49, 4:56.5, 5:04.
  // -----------------------------------------------------------------
  {
    "id": "aguanile",
    "title": "Aguanile",
    "artist": "Marc Anthony",
    "style": "New York Salsa",
    "bpm": 120,
    "claveType": "2-3 Son / 6/8 Afro-Bembé Hybrid",
    "difficultyLevel": "Advanced",
    "durationSeconds": 316,
    "youtubeVideoId": "b4rd9VfMhWM",
    "youtubeUrl": "https://www.youtube.com/watch?v=b4rd9VfMhWM",
    "spotifyOrYoutubeEmbedUrl": "https://open.spotify.com/search/Marc%20Anthony%20Aguanile",
    "segments": [
      {
        "id": "agua-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 21.5,
        "formattedRange": "0:00 - 0:21",
        "sectionName": "Intro Fanfare & Rubato Cry (Aguanile)",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Dramatic brass fanfare hits, timbal rolls, and Marc Anthony's sustained rubato cry 'Aguanile'",
        "leaderCue": "Stand tall facing your partner, breathe with the brass swells, and wait for the percussion groove.",
        "followerCue": "Hold a grounded posture, mirror the leader's stillness, and let the vocal cry build tension.",
        "commonMistakeWarning": "Stepping into a basic during the rubato brass swells when there is no steady pulse yet.",
        "recommendedMoveSlugs": [
          "beg-mus-1",
          "adv-pw-1"
        ],
        "timingMode": "Ambient (No Beat)",
        "instrumentMapping": {
          "feet": "Stillness on the floor",
          "hipsAndKnees": "Soft knee release on timbal rolls",
          "chestAndShoulders": "Breath expansion with brass swells"
        },
        "startsOnOne": false
      },
      {
        "id": "agua-seg-2",
        "startTimeSeconds": 21.5,
        "endTimeSeconds": 48,
        "formattedRange": "0:21 - 0:48",
        "sectionName": "Afro-Cuban Prayer Invocation (Santo Dios)",
        "danceGear": "Afro-Cuban Orishas",
        "colorTheme": "amber",
        "musicalTrigger": "Afro-Cuban conga and cowbell groove enters followed by 'Santo Dios, Santo Fuerte, Santo Inmortal'",
        "leaderCue": "Dance solo Eleguá and Oggún Orisha movements, keeping knees bent and torso undulating.",
        "followerCue": "Channel Yemayá and Ochún undulating ribcage waves, sweeping arms with the liturgical chant.",
        "commonMistakeWarning": "Trying to force rigid 4/4 partnerwork turns over the ritualistic Afro-Cuban prayer.",
        "recommendedMoveSlugs": [
          "int-sub-1",
          "adv-sub-1",
          "adv-mus-1"
        ],
        "timingMode": "Free / Polyrhythmic (6/8)",
        "instrumentMapping": {
          "feet": "Conga open tones",
          "hipsAndKnees": "Afro-bembé bell pulse",
          "chestAndShoulders": "Vocal chant phrasing"
        },
        "bars": 14,
        "startsOnOne": true
      },
      {
        "id": "agua-seg-3",
        "startTimeSeconds": 48,
        "endTimeSeconds": 96,
        "formattedRange": "0:48 - 1:36",
        "sectionName": "Montuno I: Coro & Pregón (Aguanile, Mai Mai)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Full band explodes with coro 'Aguanile, aguanile, mai mai' and driving campana",
        "leaderCue": "Launch into Dile Que No, Setenta Complicado, and Montana; keep steps compact for the fast tempo.",
        "followerCue": "Take small, quick steps underneath your body and keep active hook-finger tension through rapid turns.",
        "commonMistakeWarning": "Taking huge steps on the fast coro explosion and falling behind the campana.",
        "recommendedMoveSlugs": [
          "imp-pw-2",
          "int-pw-1",
          "adv-pw-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bass tumbao and conga marcha",
          "hipsAndKnees": "Piano montuno drive",
          "chestAndShoulders": "Coro call-and-response"
        },
        "bars": 25,
        "startsOnOne": true,
        "handGesture": "Montana"
      },
      {
        "id": "agua-seg-4",
        "startTimeSeconds": 96,
        "endTimeSeconds": 127,
        "formattedRange": "1:36 - 2:07",
        "sectionName": "Mambo I: Blazing Trombone Descarga",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Fierce syncopated trombone mambo riffs take over after 'eso será una rareza'",
        "leaderCue": "Release hold after Vacílala into fast suelta footwork, rumba columbia taps, and sharp brass hits.",
        "followerCue": "Match the trombone stabs with syncopated suelta shines, sharp shoulder accents, and clean spins.",
        "commonMistakeWarning": "Staying locked in closed partnerwork and ignoring the blazing 16-bar trombone mambo.",
        "recommendedMoveSlugs": [
          "imp-pw-3",
          "adv-sub-1",
          "adv-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Syncopated trombone riffs",
          "hipsAndKnees": "Bongo bell drive",
          "chestAndShoulders": "Sharp brass stabs"
        },
        "bars": 16,
        "startsOnOne": true,
        "handGesture": "Pa'Fuera"
      },
      {
        "id": "agua-seg-5",
        "startTimeSeconds": 127,
        "endTimeSeconds": 158.5,
        "formattedRange": "2:07 - 2:38",
        "sectionName": "Montuno II: Tambores Umaculli",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro 'Aguanile, aguanile, mai mai' returns followed by 'Ay tambores umaculli'",
        "leaderCue": "Reconnect for Siete Loco and Dedo; hit a sharp freeze on the 'muchachas' break at 2:38.5.",
        "followerCue": "Spot cleanly through Siete Loco and be ready to freeze instantly on the cymbal crash at 2:38.5.",
        "commonMistakeWarning": "Plowing through the sudden band drop after 'rociar a las muchachas' at 2:38.5.",
        "recommendedMoveSlugs": [
          "int-pw-2",
          "int-pw-3",
          "adv-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana and bass pulse",
          "hipsAndKnees": "Conga tumbao",
          "chestAndShoulders": "Pregón vocal phrasing"
        },
        "bars": 16,
        "startsOnOne": true,
        "handGesture": "Siete Loco"
      },
      {
        "id": "agua-seg-6",
        "startTimeSeconds": 158.5,
        "endTimeSeconds": 167.5,
        "formattedRange": "2:38 - 2:47",
        "sectionName": "Bloque & Pure Percussion Drop",
        "danceGear": "Rumba Guaguancó",
        "colorTheme": "red",
        "musicalTrigger": "Brass and bass drop out completely, leaving naked conga, chekere, and clave",
        "leaderCue": "Break apart on the crash and Circle your partner with low Rumba Guaguancó steps and vacunao play.",
        "followerCue": "Drop your center into grounded guaguancó motion, guarding and parrying the leader's vacunao.",
        "commonMistakeWarning": "Continuing high-speed casino turn patterns when only naked drums and clave are playing.",
        "recommendedMoveSlugs": [
          "imp-solo-1",
          "adv-mus-1"
        ],
        "timingMode": "Contrapunto (On2 <-> On1)",
        "instrumentMapping": {
          "feet": "Clave and low conga tones",
          "hipsAndKnees": "Quinto slaps",
          "chestAndShoulders": "Chekere pulse"
        },
        "bars": 4,
        "startsOnOne": true
      },
      {
        "id": "agua-seg-7",
        "startTimeSeconds": 167.5,
        "endTimeSeconds": 205.5,
        "formattedRange": "2:47 - 3:25",
        "sectionName": "Liturgical Lament (Los Tres Clavos de la Cruz)",
        "danceGear": "Afro-Cuban Orishas",
        "colorTheme": "amber",
        "musicalTrigger": "Marc Anthony sings the dramatic lament 'Ay que los tres clavos de la cruz' over sparse percussion",
        "leaderCue": "Move with slow, theatrical Afro-Cuban Orisha gestures and grounded contratiempo steps as tension builds.",
        "followerCue": "Use expressive arm styling and slow torso undulations, building intensity on 'yo tengo aguanile mai mai'.",
        "commonMistakeWarning": "Rushing the slow, dramatic vocal lament instead of letting the theatrical suspense build.",
        "recommendedMoveSlugs": [
          "int-sub-1",
          "adv-sub-1",
          "imp-sub-1"
        ],
        "timingMode": "Free / Polyrhythmic (6/8)",
        "instrumentMapping": {
          "feet": "Sparse conga and clave pulse",
          "hipsAndKnees": "Slow bongo rolls",
          "chestAndShoulders": "Dramatic vocal lament"
        },
        "bars": 19,
        "startsOnOne": true
      },
      {
        "id": "agua-seg-8",
        "startTimeSeconds": 205.5,
        "endTimeSeconds": 260,
        "formattedRange": "3:25 - 4:20",
        "sectionName": "Montuno III: Full Band Explosion (Un Judío a Caballo)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Full band crashes back in at top speed with coro 'Aguanile, aguanile, mai mai'",
        "leaderCue": "Drive full-throttle casino with Coca-Cola, Bayamo, and El Uno; keep frame micro-modulated.",
        "followerCue": "Maintain a light, responsive frame through fast 360 Coca-Cola turns and rapid direction changes.",
        "commonMistakeWarning": "Losing posture or pulling on the arms during this long, high-speed 28-bar montuno.",
        "recommendedMoveSlugs": [
          "int-pw-4",
          "int-pw-2",
          "adv-pw-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Driving campana and bass",
          "hipsAndKnees": "Piano montuno",
          "chestAndShoulders": "Coro and pregón interplay"
        },
        "bars": 28,
        "startsOnOne": true,
        "handGesture": "Coca-Cola"
      },
      {
        "id": "agua-seg-9",
        "startTimeSeconds": 260,
        "endTimeSeconds": 266.5,
        "formattedRange": "4:20 - 4:26",
        "sectionName": "Percussion Solo Break (¡Ataca Quintero!)",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Marc Anthony shouts '¡Ataca Quintero!' and timbales/congas launch a 4-bar solo",
        "leaderCue": "Let go immediately on '¡Ataca Quintero!' for high-speed timbal shines and tembleque vibration.",
        "followerCue": "Explode into fast solo footwork and rapid hip/shoulder shimmies matching Quintero's drum rolls.",
        "commonMistakeWarning": "Missing the '¡Ataca Quintero!' call and staying in closed hold during the drum solo.",
        "recommendedMoveSlugs": [
          "adv-solo-1",
          "adv-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Rapid timbal and bongo rolls",
          "hipsAndKnees": "Conga slaps",
          "chestAndShoulders": "High-frequency tembleque"
        },
        "bars": 4,
        "startsOnOne": true,
        "handGesture": "Al Medio"
      },
      {
        "id": "agua-seg-10",
        "startTimeSeconds": 266.5,
        "endTimeSeconds": 289,
        "formattedRange": "4:26 - 4:49",
        "sectionName": "Climax Coro & Brass Moñas",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro 'Aguanile, aguanile, mai mai' returns alternating with roaring brass moñas",
        "leaderCue": "Pick up your partner for Sombrero and Setenta, accenting the roaring 4-bar brass moña in the middle.",
        "followerCue": "Snap cleanly into Sombrero wraps and style with your free arm on the brass moña hits.",
        "commonMistakeWarning": "Over-rotating turns when the conga break arrives suddenly at 4:49.",
        "recommendedMoveSlugs": [
          "imp-pw-4",
          "imp-pw-1",
          "adv-sub-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bass and campana",
          "hipsAndKnees": "Conga marcha",
          "chestAndShoulders": "Roaring brass moñas"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Sombrero"
      },
      {
        "id": "agua-seg-11",
        "startTimeSeconds": 289,
        "endTimeSeconds": 296.5,
        "formattedRange": "4:49 - 4:56",
        "sectionName": "Final Conga Drop & Brass Pickup",
        "danceGear": "Rumba Guaguancó",
        "colorTheme": "red",
        "musicalTrigger": "Band drops to solo congas for 2 bars before a roaring 2-bar brass pickup",
        "leaderCue": "Drop into 2 bars of grounded guaguancó, then prep your partner on the brass pickup at 4:53.",
        "followerCue": "Sink into your hips for the conga drop, then gather your frame on the brass pickup.",
        "commonMistakeWarning": "Being caught off-guard when the brass re-enters mid-break at 4:53.",
        "recommendedMoveSlugs": [
          "imp-solo-1",
          "adv-pw-2"
        ],
        "timingMode": "Contrapunto (On2 <-> On1)",
        "instrumentMapping": {
          "feet": "Conga tumbao",
          "hipsAndKnees": "Clave pulse",
          "chestAndShoulders": "Brass pickup crescendo"
        },
        "bars": 4,
        "startsOnOne": true
      },
      {
        "id": "agua-seg-12",
        "startTimeSeconds": 296.5,
        "endTimeSeconds": 304,
        "formattedRange": "4:56 - 5:04",
        "sectionName": "Final Coro (Aguanile, Mai Mai)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Last full coro 'Aguanile, aguanile, mai mai' enters at 4:56.5",
        "leaderCue": "Execute one crisp Enchufla Doble into Exhíbela to set up the final coda.",
        "followerCue": "Keep your turns tight and centered so you finish facing the leader for the coda.",
        "commonMistakeWarning": "Starting a long 8-bar figure when this final coro is only 4 bars long.",
        "recommendedMoveSlugs": [
          "beg-pw-3",
          "beg-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana drive",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Final coro chant"
        },
        "bars": 4,
        "startsOnOne": true,
        "handGesture": "Enchufla Doble"
      },
      {
        "id": "agua-seg-13",
        "startTimeSeconds": 304,
        "endTimeSeconds": 316,
        "formattedRange": "5:04 - 5:16",
        "sectionName": "Final Mambo Coda & Big Finish",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "High-brass coda fanfare launches into the final climactic hit at 5:12.5",
        "leaderCue": "Break into explosive Changó footwork and hit a dramatic final pose with your partner on the 5:12.5 crash.",
        "followerCue": "Match the brass fanfare with fast shines and lock into a sharp final styling pose at 5:12.5.",
        "commonMistakeWarning": "Dancing past the final brass hit at 5:12.5 during the audio decay.",
        "recommendedMoveSlugs": [
          "adv-sub-1",
          "adv-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Syncopated timbal fills",
          "hipsAndKnees": "Conga rolls",
          "chestAndShoulders": "Final brass fanfare hits"
        },
        "bars": 6,
        "startsOnOne": true
      }
    ]
  },
  // -----------------------------------------------------------------
  // "Esto Te Pone La Cabeza Mala" - Los Van Van (Juan Formell)
  // Advanced • 98 BPM • 2-3 Rumba Clave • 247s
  // Video ID: 0TvrHC4qtgA • timings from Argus
  // -----------------------------------------------------------------
  {
    "id": "esto-te-pone-la-cabeza-mala",
    "title": "Esto Te Pone La Cabeza Mala",
    "artist": "Los Van Van (Juan Formell)",
    "style": "Timba",
    "bpm": 98,
    "claveType": "2-3 Rumba Clave",
    "difficultyLevel": "Advanced",
    "durationSeconds": 247,
    "youtubeVideoId": "0TvrHC4qtgA",
    "youtubeUrl": "https://www.youtube.com/watch?v=0TvrHC4qtgA",
    "segments": [
      {
        "id": "etp-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 28,
        "formattedRange": "0:00 - 0:28",
        "sectionName": "Songo Brass Ignition & 'Soy de Aquí' Call",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Songo brass hits open the song, then the 'Soy de aquí' vocal call.",
        "leaderCue": "Establish closed or two-hand Songo frame; test tension with Guapea.",
        "followerCue": "Match frame elasticity and settle into the bass.",
        "commonMistakeWarning": "Avoid jumping into double spins on the opening brass hits.",
        "recommendedMoveSlugs": [
          "beg-pw-1",
          "beg-solo-1"
        ],
        "handGesture": "Flat Palm Down (Piso / Grounded Basic)",
        "instrumentMapping": {
          "feet": "Light heel-kissed Casino basic on 1-2-3, 5-6-7",
          "hipsAndKnees": "Soft figure-8 Cuban motion",
          "chestAndShoulders": "Relaxed, slight forward Songo lean"
        }
      },
      {
        "id": "etp-seg-2",
        "startTimeSeconds": 28,
        "endTimeSeconds": 60,
        "formattedRange": "0:28 - 1:00",
        "sectionName": "Afro-Cuban Roots Verse ('Hijos de los Africanos')",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Storytelling verse over the piano tumbao: 'hijos de los africanos'.",
        "leaderCue": "Lead smooth circular Dile Que No and Exhibela while letting the lyrics breathe.",
        "followerCue": "Keep steps compact under your center of mass.",
        "commonMistakeWarning": "Avoid rushing the piano tumbao during the cultural storytelling verse.",
        "recommendedMoveSlugs": [
          "beg-pw-2",
          "beg-pw-5"
        ],
        "handGesture": "Point to Earth ('Soy de Aquí' / Paseo)",
        "instrumentMapping": {
          "feet": "Circular Exhibela and Dile Que No travel",
          "hipsAndKnees": "Grounded pendulum swing",
          "chestAndShoulders": "Proud, open ribcage isolation"
        }
      },
      {
        "id": "etp-seg-3",
        "startTimeSeconds": 60,
        "endTimeSeconds": 83,
        "formattedRange": "1:00 - 1:23",
        "sectionName": "Rhythm Roll-Call ('Songo con Samba y Clave de Guaguancó')",
        "danceGear": "Rumba Guaguancó",
        "colorTheme": "amber",
        "musicalTrigger": "The band calls out the rhythms: songo, samba and clave de guaguancó.",
        "leaderCue": "Open into side-by-side or semi-open position to play with Rumba Guaguancó accents.",
        "followerCue": "Answer the Vacunao playfully by covering/deflecting with the skirt or hand.",
        "commonMistakeWarning": "Avoid staying locked in rigid closed-hold posture when the band calls out Rumba and Songo.",
        "recommendedMoveSlugs": [
          "imp-solo-1",
          "imp-mus-1"
        ],
        "handGesture": "2-Finger Clave Tap + Shoulder Flick (Guaguancó)",
        "instrumentMapping": {
          "feet": "Syncopated Guaguancó side-step & Vacunao",
          "hipsAndKnees": "Sharp lateral Rumba accents",
          "chestAndShoulders": "Active polyrhythmic shoulder shimmy"
        }
      },
      {
        "id": "etp-seg-4",
        "startTimeSeconds": 83,
        "endTimeSeconds": 133,
        "formattedRange": "1:23 - 2:13",
        "sectionName": "Campana & Güiro Montuno ('Bombo, Canilla y Campana')",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Montuno locks in on the campana (cowbell) and güiro: 'bombo, canilla y campana'.",
        "leaderCue": "Drive flowing Setenta, Setenta Complicado, and Sombrero combinations riding the campana bell.",
        "followerCue": "Maintain active hook-tension in fingers during overhead hammerlocks.",
        "commonMistakeWarning": "Avoid pulling the partner's shoulder off-axis during multi-turn Setenta variations.",
        "recommendedMoveSlugs": [
          "imp-pw-1",
          "imp-pw-2",
          "imp-pw-4"
        ],
        "handGesture": "Fist Cowbell Knock + '70' Fingers (Setenta)",
        "instrumentMapping": {
          "feet": "Crisp pivot-steps on 3 and 7",
          "hipsAndKnees": "Continuous figure-8 drive locked to the cowbell",
          "chestAndShoulders": "Steady rotational torque on turns"
        }
      },
      {
        "id": "etp-seg-5",
        "startTimeSeconds": 133,
        "endTimeSeconds": 180,
        "formattedRange": "2:13 - 3:00",
        "sectionName": "'Esto Te Pone La Cabeza Mala' Coro & Aspirina Break",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Title coro, then 'una aspirina me duele la cabeza' and three staccato 'Che, Che, Che' hits at 2:28.",
        "leaderCue": "Break apart on 'Una aspirina me duele la cabeza' and hit the 3 staccato 'Che, Che, Che' freezes at 2:28.",
        "followerCue": "Style with hand-to-temple headache gesture and sharp hip hits on 'Che-Che-Che'.",
        "commonMistakeWarning": "Avoid ignoring the staccato vocal stops at 2:28 by plowing through a basic turn pattern.",
        "recommendedMoveSlugs": [
          "int-mus-1",
          "int-solo-1"
        ],
        "handGesture": "Hand to Forehead ('Aspirina / Cabeza Mala' Signal)",
        "instrumentMapping": {
          "feet": "Fast Chassé and syncopated footwork shines",
          "hipsAndKnees": "Heavy, low-center Timba bounce",
          "chestAndShoulders": "Staccato hits on 'Che-Che-Che' (2:28)"
        }
      },
      {
        "id": "etp-seg-6",
        "startTimeSeconds": 180,
        "endTimeSeconds": 218,
        "formattedRange": "3:00 - 3:38",
        "sectionName": "'Todo El Mundo Con La Mano En La Cabeza' Climax",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Singer calls 'todo el mundo con la mano en la cabeza' at 3:00.",
        "leaderCue": "Drop the handhold at 3:00 ('con la mano en la cabeza'), place hands on head, and lead call-and-response Despelote.",
        "followerCue": "Match the hands-on-head groove and unleash full Cintura / hip isolation.",
        "commonMistakeWarning": "Avoid leading complex arm-knots when the singer commands the whole floor to put hands on their heads.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "handGesture": "Both Hands on Head (Mano en la Cabeza / Siete Loco)",
        "instrumentMapping": {
          "feet": "Grounded wide stance, knees bent",
          "hipsAndKnees": "Pelvis-forward Tembleque & body rolls",
          "chestAndShoulders": "Full Afro-Cuban Despelote torso vibration"
        }
      },
      {
        "id": "etp-seg-7",
        "startTimeSeconds": 218,
        "endTimeSeconds": 247,
        "formattedRange": "3:38 - 4:07",
        "sectionName": "'Mano Para Arriba' Rueda Finale",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "'Con la mano para arriba' at 3:38, building to the final hit at 3:58 and the percussion fade.",
        "leaderCue": "On 'con la mano para arriba', raise the free hand sky-high during Enchufla before hitting a clean final pose at 3:58.",
        "followerCue": "Style the free arm overhead on 3:38 and lock into the final frame.",
        "commonMistakeWarning": "Avoid letting the energy die before the final percussion fade out.",
        "recommendedMoveSlugs": [
          "beg-pw-3",
          "beg-sub-1"
        ],
        "handGesture": "One Hand High in the Air + Point to Center (Fin de Fiesta)",
        "instrumentMapping": {
          "feet": "Rapid Enchufla partner switches & final lunge",
          "hipsAndKnees": "Fast Timba groove to the fade",
          "chestAndShoulders": "High-energy celebratory lift"
        }
      }
    ]
  },
  // -----------------------------------------------------------------
  // "Pasaporte" - Alexander Abreu & Havana D'Primera
  // Timba • Intermediate • 89 BPM • 2-3 Son Clave • 303s
  // Video ID: wtWV9P9x4NM • timings from Argus
  // Gemini 4 Argon in AI Studio 2026-10-31 (old map: 6 sections). Starts sit on an ~89 BPM bar grid from 0:00, yet Argon says the first downbeat is at 0:01.3: if every card flips about 1 s early, shift them all. Ear-check 2:01.8 (breakdown), 2:12.7 (coro), 3:31.3 (mambo).
  // -----------------------------------------------------------------
  {
    "id": "pasaporte",
    "title": "Pasaporte",
    "artist": "Alexander Abreu & Havana D'Primera",
    "style": "Timba",
    "bpm": 89,
    "claveType": "2-3 Son Clave",
    "difficultyLevel": "Intermediate",
    "durationSeconds": 303,
    "youtubeVideoId": "wtWV9P9x4NM",
    "youtubeUrl": "https://www.youtube.com/watch?v=wtWV9P9x4NM",
    "segments": [
      {
        "id": "pas-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 21.5,
        "formattedRange": "0:00 - 0:21",
        "sectionName": "Intro: Brass Fanfare & Groove",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Two-beat drum fill into warm brass fanfare, piano tumbao, and steady conga groove.",
        "leaderCue": "Wait through the pickup fill, then connect in closed hold for Paso Básico and Dile Que No.",
        "followerCue": "Settle into a soft frame on the brass downbeat and keep steps compact during the opening groove.",
        "commonMistakeWarning": "Rushing into big turns on the opening drum pickup instead of waiting for beat 1 at 0:01.3.",
        "recommendedMoveSlugs": [
          "beg-mus-1",
          "beg-solo-1",
          "beg-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Conga tumbao",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Trumpet melody"
        },
        "bars": 8,
        "startsOnOne": false
      },
      {
        "id": "pas-seg-2",
        "startTimeSeconds": 21.5,
        "endTimeSeconds": 43.2,
        "formattedRange": "0:21 - 0:43",
        "sectionName": "Tema 1: Ella dice que la vida",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Alexander enters singing 'Ella dice que la vida se le da bien dura' over piano and bongó.",
        "leaderCue": "Dance small, grounded Guapea and Paséala steps to let the opening story breathe.",
        "followerCue": "Maintain unhurried weight transfers and soft ribcage movement matching the lyrical vocal phrasing.",
        "commonMistakeWarning": "Over-leading fast turns while the arrangement drops down for the first storytelling verse.",
        "recommendedMoveSlugs": [
          "imp-sub-1",
          "beg-pw-1",
          "imp-pw-6"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "Bass tumbao",
          "hipsAndKnees": "Conga slaps",
          "chestAndShoulders": "Lead vocal phrasing"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Paséala"
      },
      {
        "id": "pas-seg-3",
        "startTimeSeconds": 43.2,
        "endTimeSeconds": 64.9,
        "formattedRange": "0:43 - 1:04",
        "sectionName": "Tema 2: Ella se aferra al amor",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Second verse 'Ella se aferra al amor, pero el amor le da golpes' with brass responses.",
        "leaderCue": "Flow from Guapea into Exhíbela and Vacílala, accenting the brass swell on 'le parte pa' rriba'.",
        "followerCue": "Spot cleanly through Exhíbela and use free-arm styling on the horn answers.",
        "commonMistakeWarning": "Ignoring the brass accents in the second half of the verse and keeping flat dynamics.",
        "recommendedMoveSlugs": [
          "beg-pw-5",
          "imp-pw-3",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Conga tumbao",
          "hipsAndKnees": "Piano montuno",
          "chestAndShoulders": "Brass responses"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Vacílala"
      },
      {
        "id": "pas-seg-4",
        "startTimeSeconds": 64.9,
        "endTimeSeconds": 89.3,
        "formattedRange": "1:04 - 1:29",
        "sectionName": "Pre-Coro 1: Nadie sabe bien",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Melodic bridge 'Nadie sabe bien lo que se esconde en su alma' with long sustained notes.",
        "leaderCue": "Use sweeping circular Paséala and Sombrero, holding the extra 9th bar on 'sin fin' before the break.",
        "followerCue": "Extend through your back and arms on the long vocal notes and prepare for the bloque at 1:29.3.",
        "commonMistakeWarning": "Forgetting the extra 9th bar on 'sin fin' and starting the next figure two beats early.",
        "recommendedMoveSlugs": [
          "imp-pw-6",
          "imp-pw-4",
          "imp-sub-1"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "Bass tumbao",
          "hipsAndKnees": "Bongó martillo",
          "chestAndShoulders": "Sustained vocal line"
        },
        "bars": 9,
        "startsOnOne": true,
        "handGesture": "Sombrero"
      },
      {
        "id": "pas-seg-5",
        "startTimeSeconds": 89.3,
        "endTimeSeconds": 100.1,
        "formattedRange": "1:29 - 1:40",
        "sectionName": "Bloque & Mambo Interlude",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Two-bar syncopated percussion bloque followed by a two-bar brass mambo melody.",
        "leaderCue": "Release hold on beat 1 to hit the two-bar percussion bloque, then groove footwork on the brass.",
        "followerCue": "Hit the syncopated bloque with sharp ribcage and foot accents, then reconnect after 4 bars.",
        "commonMistakeWarning": "Staying locked in a turn pattern during the sharp 4-bar instrumental break.",
        "recommendedMoveSlugs": [
          "int-mus-1",
          "int-solo-1",
          "beg-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Timbal and bass bloque",
          "hipsAndKnees": "Conga tumbao",
          "chestAndShoulders": "Trumpet mambo line"
        },
        "bars": 4,
        "startsOnOne": true
      },
      {
        "id": "pas-seg-6",
        "startTimeSeconds": 100.1,
        "endTimeSeconds": 121.8,
        "formattedRange": "1:40 - 2:01",
        "sectionName": "Pre-Coro 2: Nadie sabe bien",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Vocal returns on 'Nadie sabe bien lo que se esconde en su alma' over full rhythm section.",
        "leaderCue": "Reconnect with Dile Que No into Setenta and Kentucky, keeping the flow smooth and connected.",
        "followerCue": "Keep steady hook-finger tension through Setenta and follow the circular lead smoothly.",
        "commonMistakeWarning": "Rushing the end of Setenta instead of letting the lyrical melody guide your pace.",
        "recommendedMoveSlugs": [
          "beg-pw-2",
          "imp-pw-1",
          "imp-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Conga tumbao",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Lead vocal and piano"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Kentucky"
      },
      {
        "id": "pas-seg-7",
        "startTimeSeconds": 121.8,
        "endTimeSeconds": 132.7,
        "formattedRange": "2:01 - 2:12",
        "sectionName": "Breakdown: Con su carita así, de pasaporte",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Band drops down as Alexander sings 'Ella está con su carita así, de pasaporte' and shouts '¡Ah, ah!'.",
        "leaderCue": "Drop into low body isolations and cintura play for 4 bars, freezing on the '¡Ah, ah!' brass hits.",
        "followerCue": "Answer with thoracic ribcage isolations and hit the two brass stabs on '¡Ah, ah!' before the coro.",
        "commonMistakeWarning": "Missing the two-stab brass break on '¡Ah, ah!' right before the full coro erupts at 2:12.7.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1",
          "int-mus-1"
        ],
        "timingMode": "Syncopated Reparto",
        "instrumentMapping": {
          "feet": "Syncopated bass",
          "hipsAndKnees": "Conga and cáscara",
          "chestAndShoulders": "Vocal call and brass stabs"
        },
        "bars": 4,
        "startsOnOne": true,
        "handGesture": "Al Medio"
      },
      {
        "id": "pas-seg-8",
        "startTimeSeconds": 132.7,
        "endTimeSeconds": 178.8,
        "formattedRange": "2:12 - 2:58",
        "sectionName": "Montuno 1: Ella está con su carita de pasaporte",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Full coro enters singing 'Ella está con su carita de pasaporte, sobreviviendo a la crisis'.",
        "leaderCue": "Launch into Setenta Complicado, Dedo, and Siete, riding the coro-pregón energy.",
        "followerCue": "Keep active footwork and a responsive frame through multi-turn combinations.",
        "commonMistakeWarning": "Getting thrown off by the 5-bar pregón 'Si el amor le dio a la vida... Repite mi coro'.",
        "recommendedMoveSlugs": [
          "imp-pw-2",
          "int-pw-2",
          "int-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana and conga",
          "hipsAndKnees": "Piano montuno",
          "chestAndShoulders": "Coro and pregón"
        },
        "bars": 17,
        "startsOnOne": true,
        "handGesture": "Setenta Complicado"
      },
      {
        "id": "pas-seg-9",
        "startTimeSeconds": 178.8,
        "endTimeSeconds": 211.3,
        "formattedRange": "2:58 - 3:31",
        "sectionName": "Montuno 2: Y ahora te dicen que se va",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro shifts to 'Y ahora te dicen que se va, y que se va, caminando' with driving campana.",
        "leaderCue": "Drive the circle with Montana and Siete Loco, matching the urgent 'con la guagua andando' groove.",
        "followerCue": "Stay grounded on quick direction changes and keep turns tight and centered.",
        "commonMistakeWarning": "Letting arms get wide and pulling off-balance as the montuno intensity rises.",
        "recommendedMoveSlugs": [
          "int-pw-1",
          "int-pw-3",
          "int-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bongó bell (campana)",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Coro responses"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Montana"
      },
      {
        "id": "pas-seg-10",
        "startTimeSeconds": 211.3,
        "endTimeSeconds": 224.9,
        "formattedRange": "3:31 - 3:44",
        "sectionName": "Mambo con Coro: Por arriba del Mambo",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Timbal fill and Alexander calls 'Vaya camina por arriba del Mambo' as brass mambo enters.",
        "leaderCue": "Break into suelta shines for 5 bars, hitting the timbal roll and brass mambo riffs.",
        "followerCue": "Show off sharp mambo footwork and shoulder shimmies until Alexander calls '¡Ella está!'.",
        "commonMistakeWarning": "Reconnecting on bar 4 instead of dancing through the 1-bar 'Vaya camina' call plus 4-bar mambo.",
        "recommendedMoveSlugs": [
          "int-mus-1",
          "adv-solo-1",
          "int-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Timbal and campana",
          "hipsAndKnees": "Syncopated bass",
          "chestAndShoulders": "Brass mambo riffs"
        },
        "bars": 5,
        "startsOnOne": true,
        "handGesture": "Pa'Fuera"
      },
      {
        "id": "pas-seg-11",
        "startTimeSeconds": 224.9,
        "endTimeSeconds": 246.6,
        "formattedRange": "3:44 - 4:06",
        "sectionName": "Montuno 1 Reprise: Ella está con su carita de pasaporte",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Alexander shouts '¡Ella está, ella está!' bringing back 'Ella está con su carita de pasaporte'.",
        "leaderCue": "Pick up partnerwork with Dile Que No into Coca-Cola and Bayamo.",
        "followerCue": "Spot sharply on the Coca-Cola inside turns and keep your frame energized.",
        "commonMistakeWarning": "Over-rotating on Coca-Cola and losing the downbeat of the second coro repetition.",
        "recommendedMoveSlugs": [
          "beg-pw-2",
          "int-pw-4",
          "imp-pw-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Conga and campana",
          "hipsAndKnees": "Piano montuno",
          "chestAndShoulders": "Coro melody"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Coca-Cola"
      },
      {
        "id": "pas-seg-12",
        "startTimeSeconds": 246.6,
        "endTimeSeconds": 268.3,
        "formattedRange": "4:06 - 4:28",
        "sectionName": "Montuno 3: Un pasaporte sin fecha de vencimiento",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Anthemic coro 'Un pasaporte sin fecha de vencimiento, un pasaporte libre como el viento'.",
        "leaderCue": "Smooth out the energy with Sombrero and Paséala to match the soaring 'libre como el viento' coro.",
        "followerCue": "Breathe into the wider, flowing turns and enjoy the melodic lift before the final climax.",
        "commonMistakeWarning": "Keeping frantic footwork when the coro opens up into a smoother, anthemic groove.",
        "recommendedMoveSlugs": [
          "imp-pw-4",
          "imp-pw-6",
          "beg-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bass tumbao",
          "hipsAndKnees": "Conga tumbao",
          "chestAndShoulders": "Anthemic coro vocals"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Sombrero"
      },
      {
        "id": "pas-seg-13",
        "startTimeSeconds": 268.3,
        "endTimeSeconds": 303,
        "formattedRange": "4:28 - 5:03",
        "sectionName": "Clímax & Final: Libre como el viento",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Alexander shouts '¡Es ahora! ¡Dale!' and '¡Visa!' with full brass climax through the fade-out.",
        "leaderCue": "Go all out with El Uno, El Dos, and Enchufla Doble, winding down smoothly as the track fades.",
        "followerCue": "Match the climax energy with crisp turns, then soften your steps during the final fade-out.",
        "commonMistakeWarning": "Stopping abruptly before the music finishes fading out at 5:03.",
        "recommendedMoveSlugs": [
          "int-pw-2",
          "beg-pw-3",
          "adv-pw-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana and timbal",
          "hipsAndKnees": "Piano and bass tumbao",
          "chestAndShoulders": "Brass hits and pregones"
        },
        "bars": 13,
        "startsOnOne": true,
        "handGesture": "El Uno"
      }
    ]
  },
  // -----------------------------------------------------------------
  // "Esto Está (Live at Le New Morning, Paris)" - Maykel Blanco y su Salsa Mayor
  // Timba • Intermediate • 107 BPM • 2-3 Rumba Clave • 388s
  // Video ID: VD9Oe2zf748 • timings from Argus
  // Gemini 4 Argon in AI Studio 2026-10-31 (live Paris video). Gemini 3.8 Flash agreed within 2 s on 7 of 15 starts. Ear-check: 'Ustedes solos' 1:46.5 or 1:53; 'Arriba, abajo' 2:26.5 or 2:42; how long the despelote lasts after 3:36.8 and 4:48 (Argon ~10 s, Flash 30-40 s); ending 5:52/6:17 or 6:07.
  // -----------------------------------------------------------------
  {
    "id": "esto-esta",
    "title": "Esto Está (Live at Le New Morning, Paris)",
    "artist": "Maykel Blanco y su Salsa Mayor",
    "style": "Timba",
    "bpm": 107,
    "claveType": "2-3 Rumba Clave",
    "difficultyLevel": "Intermediate",
    "durationSeconds": 388,
    "youtubeVideoId": "VD9Oe2zf748",
    "youtubeUrl": "https://www.youtube.com/watch?v=VD9Oe2zf748",
    "segments": [
      {
        "id": "esto-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 21.5,
        "formattedRange": "0:00 - 0:21",
        "sectionName": "Live Intro & Crowd Singalong (Arriba París / Se le lai la la)",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Maykel Blanco plays piano tumbao while the singer hypes Paris and leads 'Se le lai la la'",
        "leaderCue": "Stand relaxed with your partner, clap the clave at 0:18, and wait for the brass pickup.",
        "followerCue": "Breathe, mirror the crowd claps, and set your weight ready to step on the horn entry.",
        "commonMistakeWarning": "Starting partnerwork during the piano teaser before the band stops at 0:18.",
        "recommendedMoveSlugs": [
          "beg-mus-1",
          "imp-mus-1"
        ],
        "timingMode": "Ambient (No Beat)",
        "instrumentMapping": {
          "feet": "Crowd clave claps",
          "hipsAndKnees": "Piano tumbao",
          "chestAndShoulders": "Lead vocal call"
        },
        "startsOnOne": false
      },
      {
        "id": "esto-seg-2",
        "startTimeSeconds": 21.5,
        "endTimeSeconds": 47.2,
        "formattedRange": "0:21 - 0:47",
        "sectionName": "Intro Coro & Brass Bloque (Se le lai la la / Maykel Blanco)",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Full band and horns enter on 'Vamos arriba, dice! Se le lai la la' followed by bloque hits at 0:32.8",
        "leaderCue": "Dance solo Paso Básico and side steps, then hit the sharp brass bloques at 0:33 before connecting.",
        "followerCue": "Match the coro energy with solo footwork and sharp shoulder accents on the horn hits.",
        "commonMistakeWarning": "Rushing into closed hold right before the syncopated brass bloque at 0:32.8.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "int-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bass and conga tumbao",
          "hipsAndKnees": "Piano montuno",
          "chestAndShoulders": "Brass bloque hits"
        },
        "bars": 11,
        "startsOnOne": true
      },
      {
        "id": "esto-seg-3",
        "startTimeSeconds": 47.2,
        "endTimeSeconds": 113,
        "formattedRange": "0:47 - 1:53",
        "sectionName": "Tema (Se creó, se formó, nació en La Habana)",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Singers enter in harmony on 'Se creó, se formó, nació en La Habana'",
        "leaderCue": "Connect for Guapea, Dile Que No, Paséala, and Vacílala; keep turns smooth and musical.",
        "followerCue": "Keep steps compact and grounded, styling smoothly with your free arm on 'somos salsa, timba y guaguancó'.",
        "commonMistakeWarning": "Over-leading fast complicated patterns during the lyrical storytelling verse.",
        "recommendedMoveSlugs": [
          "beg-pw-2",
          "imp-pw-6",
          "imp-pw-3"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "Conga tumbao",
          "hipsAndKnees": "Bass line",
          "chestAndShoulders": "Vocal melody and trombone fills"
        },
        "bars": 29,
        "startsOnOne": true,
        "handGesture": "Dile Que No"
      },
      {
        "id": "esto-seg-4",
        "startTimeSeconds": 113,
        "endTimeSeconds": 121.8,
        "formattedRange": "1:53 - 2:01",
        "sectionName": "Crowd Clave Breakdown (Ustedes solos / Dale la clave cubana)",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Band drops out completely on 'Ustedes solos!' leaving crowd singing and clapping clave",
        "leaderCue": "Release hold immediately, clap the 2-3 clave with the crowd, and prep the 2:01.8 drum pickup.",
        "followerCue": "Pause turn patterns, groove in place with clave claps, and watch the leader for the trombone drop.",
        "commonMistakeWarning": "Continuing full turn patterns through the 8-second a cappella crowd breakdown.",
        "recommendedMoveSlugs": [
          "imp-mus-1",
          "beg-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Implicit pulse",
          "hipsAndKnees": "Crowd singing rhythm",
          "chestAndShoulders": "2-3 clave handclaps"
        },
        "bars": 4,
        "startsOnOne": true
      },
      {
        "id": "esto-seg-5",
        "startTimeSeconds": 121.8,
        "endTimeSeconds": 153,
        "formattedRange": "2:01 - 2:33",
        "sectionName": "Trombone Mambo & Coro (Trombones / Es que me crié con la clave)",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Singer shouts 'Trombones!' as heavy brass mambo riffs and campana kick in",
        "leaderCue": "Break into energetic suelta shines and rumba guaguancó steps, hitting 'Ven, ven, ven' horn calls.",
        "followerCue": "Dance solo shines with strong hip motion and ribcage isolations matching the trombone riffs.",
        "commonMistakeWarning": "Staying static instead of matching the surge in brass energy at 2:01.8.",
        "recommendedMoveSlugs": [
          "imp-solo-1",
          "int-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana and conga slaps",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Trombone and trumpet mambo"
        },
        "bars": 14,
        "startsOnOne": true
      },
      {
        "id": "esto-seg-6",
        "startTimeSeconds": 153,
        "endTimeSeconds": 162,
        "formattedRange": "2:33 - 2:42",
        "sectionName": "Bloque Call & Response (Se le lai la la)",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Singer calls 'Ustedes solos! Se le lai la la' answered by sharp syncopated band bloques",
        "leaderCue": "Freeze on the vocal call, then hit the syncopated band stabs with chest isolations and despelote.",
        "followerCue": "Play with the call-and-response by freezing on the crowd vocal and shaking on the brass stabs.",
        "commonMistakeWarning": "Stepping a straight basic through the stop-and-go bloque hits.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "timingMode": "Syncopated Reparto",
        "instrumentMapping": {
          "feet": "Syncopated bass hits",
          "hipsAndKnees": "Timbal and conga fills",
          "chestAndShoulders": "Brass bloque stabs"
        },
        "bars": 4,
        "startsOnOne": true
      },
      {
        "id": "esto-seg-7",
        "startTimeSeconds": 162,
        "endTimeSeconds": 180.2,
        "formattedRange": "2:42 - 3:00",
        "sectionName": "Piano & Synth Montuno Solo (Arriba, abajo)",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Steady groove resumes on 'Eeeeh!' with Maykel Blanco's piano tumbao and high keyboard solo at 2:48",
        "leaderCue": "Groove in suelta footwork following the playful keyboard melody, then reconnect on 2:59 'Canta ese coro'.",
        "followerCue": "Use fast footwork variations and playful shoulder shimmies to echo the high synth solo.",
        "commonMistakeWarning": "Missing the cue at 2:59 to reconnect for the main coro-pregón montuno.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "int-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Piano montuno",
          "hipsAndKnees": "Bass and conga groove",
          "chestAndShoulders": "High synth lead melody"
        },
        "bars": 8,
        "startsOnOne": true
      },
      {
        "id": "esto-seg-8",
        "startTimeSeconds": 180.2,
        "endTimeSeconds": 216.8,
        "formattedRange": "3:00 - 3:36",
        "sectionName": "Montuno 1 (Esto está pa' comer y pa' llevar)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro enters on 'Esto está pa' comer y pa' llevar' with driving campana",
        "leaderCue": "Lead flowing casino combinations: Setenta, Sombrero, and Montana, keeping momentum circular.",
        "followerCue": "Maintain a responsive hook-finger connection and spot cleanly through continuous traveling turns.",
        "commonMistakeWarning": "Pulling the arms during multi-turn figures instead of stepping around the circle.",
        "recommendedMoveSlugs": [
          "imp-pw-1",
          "imp-pw-4",
          "int-pw-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana and bass tumbao",
          "hipsAndKnees": "Conga marcha",
          "chestAndShoulders": "Coro-pregón call and response"
        },
        "bars": 16,
        "startsOnOne": true,
        "handGesture": "Setenta"
      },
      {
        "id": "esto-seg-9",
        "startTimeSeconds": 216.8,
        "endTimeSeconds": 226.8,
        "formattedRange": "3:36 - 3:46",
        "sectionName": "Despelote Drop 1 (Uno, dos, tres, con la mano arriba)",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Singer counts 'Uno! Dos! Uno, dos, tres, con la mano arriba!' as percussion drops into bomba gear",
        "leaderCue": "Drop hands and hit the 'Uno, dos' accents, then get low into thoracic isolations and cintura.",
        "followerCue": "Throw a hand up on the count and let your ribcage and hips ride the heavy timba breakdown.",
        "commonMistakeWarning": "Staying locked in closed partnerwork during the 'Uno, dos, tres' crowd call.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "timingMode": "Syncopated Reparto",
        "instrumentMapping": {
          "feet": "Kick drum and bass bombs",
          "hipsAndKnees": "Syncopated timbal and conga",
          "chestAndShoulders": "Vocal count and brass stabs"
        },
        "bars": 4,
        "startsOnOne": true
      },
      {
        "id": "esto-seg-10",
        "startTimeSeconds": 226.8,
        "endTimeSeconds": 251.2,
        "formattedRange": "3:46 - 4:11",
        "sectionName": "Mambo & Short Coro 1 (Esto está)",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Horns blast a fiery mambo riff answered every two bars by the short coro 'Esto está'",
        "leaderCue": "Stay in open suelta for high-energy footwork and rumba columbia/guaguancó flair with your partner.",
        "followerCue": "Project big energy on the horn lines and punctuate 'Esto está' with sharp hip or shoulder hits.",
        "commonMistakeWarning": "Losing the downbeat during the syncopated horn riffs before 'Esto está'.",
        "recommendedMoveSlugs": [
          "imp-solo-1",
          "adv-sub-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Driving campana",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Layered trombone and trumpet mambo"
        },
        "bars": 11,
        "startsOnOne": true
      },
      {
        "id": "esto-seg-11",
        "startTimeSeconds": 251.2,
        "endTimeSeconds": 288,
        "formattedRange": "4:11 - 4:48",
        "sectionName": "Montuno 2 (Pa' que lo baile Chencha / Yo meto la mano en la candela)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Singer calls 'Y escucha mi cuento!' and full coro 'Esto está pa' comer y pa' llevar' returns",
        "leaderCue": "Reconnect for Siete, Dedo, and Coca-Cola, matching the playful 'no metas la mano que te quemas' pregón.",
        "followerCue": "Keep your frame light and playful, adding cheeky styling on 'no metas la mano que te quemas'.",
        "commonMistakeWarning": "Rushing the prep on Siete or Coca-Cola as the vocal pregones speed up.",
        "recommendedMoveSlugs": [
          "int-pw-3",
          "int-pw-2",
          "int-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Conga and cowbell pulse",
          "hipsAndKnees": "Piano and bass tumbao",
          "chestAndShoulders": "Rapid-fire lead vocal pregón"
        },
        "bars": 16,
        "startsOnOne": true,
        "handGesture": "Siete"
      },
      {
        "id": "esto-seg-12",
        "startTimeSeconds": 288,
        "endTimeSeconds": 296.8,
        "formattedRange": "4:48 - 4:56",
        "sectionName": "Despelote Drop 2 (Uno, dos, tres, con la mano arriba)",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Second 'Uno! Dos! Ahora, uno, dos, tres, con la mano arriba!' breakdown",
        "leaderCue": "Break apart instantly on 'Uno, dos', hit the freezes, and unleash tembleque and body rolls.",
        "followerCue": "Hit the 'Uno, dos' stops cleanly and use high-frequency tembleque through the horn build-up.",
        "commonMistakeWarning": "Getting caught mid-turn when the band hits the 'Uno, dos' brake at 4:48.",
        "recommendedMoveSlugs": [
          "adv-solo-1",
          "int-solo-1"
        ],
        "timingMode": "Syncopated Reparto",
        "instrumentMapping": {
          "feet": "Brass and bass hits",
          "hipsAndKnees": "Bomba percussion groove",
          "chestAndShoulders": "Crowd call and horn build-up"
        },
        "bars": 4,
        "startsOnOne": true
      },
      {
        "id": "esto-seg-13",
        "startTimeSeconds": 296.8,
        "endTimeSeconds": 320,
        "formattedRange": "4:56 - 5:20",
        "sectionName": "Mambo & Short Coro 2 (Esto está / Repítelo)",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Full brass mambo roars back on 'Canta ese coro!' with 'Esto está'",
        "leaderCue": "Dance explosive solo footwork or challenge your partner with playful rumba vacunao feints.",
        "followerCue": "Answer the leader's footwork challenge and defend the vacunao with sharp hip and skirt/hand accents.",
        "commonMistakeWarning": "Failing to wind down energy at 5:19 when the band drops for the speech.",
        "recommendedMoveSlugs": [
          "imp-solo-1",
          "adv-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Timbal and campana drive",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Full brass mambo section"
        },
        "bars": 10,
        "startsOnOne": true
      },
      {
        "id": "esto-seg-14",
        "startTimeSeconds": 320,
        "endTimeSeconds": 352,
        "formattedRange": "5:20 - 5:52",
        "sectionName": "Breakdown & Smooth Singalong (Con la mano arriba / Sha la la la la)",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Band drops to soft piano and percussion on 'Todo el que quiera el amor' then sings 'Sha la la la la' at 5:29.8",
        "leaderCue": "Keep it super relaxed: sway during the call, then lead gentle Guapea, Dile Que No, and Kentucky.",
        "followerCue": "Take a breath, sing along to 'Sha la la la la', and keep your steps small, soft, and unhurried.",
        "commonMistakeWarning": "Dancing at peak montuno intensity when the band strips the arrangement down.",
        "recommendedMoveSlugs": [
          "beg-pw-1",
          "beg-pw-2",
          "imp-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Soft bass and conga pulse",
          "hipsAndKnees": "Gentle piano montuno",
          "chestAndShoulders": "Smooth 'Sha la la la la' vocal chorus"
        },
        "bars": 14,
        "startsOnOne": true,
        "handGesture": "Kentucky"
      },
      {
        "id": "esto-seg-15",
        "startTimeSeconds": 352,
        "endTimeSeconds": 377.2,
        "formattedRange": "5:52 - 6:17",
        "sectionName": "Final Brass Climax (Sha la la la la / Eeeeh)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Full brass section blasts back in over 'Sha la la la la' at 5:52",
        "leaderCue": "Pour on the finale energy with Setenta Complicado and Enchufla Doble before the 6:17 stop.",
        "followerCue": "Match the final brass surge with crisp turns and prepare to freeze on the sung ending notes.",
        "commonMistakeWarning": "Missing the sudden final cadence when the singers intone 'Sol, si, re, do' at 6:17.2.",
        "recommendedMoveSlugs": [
          "imp-pw-2",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Full percussion drive",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Triumphant brass riffs and coro"
        },
        "bars": 11,
        "startsOnOne": true,
        "handGesture": "Setenta Complicado"
      },
      {
        "id": "esto-seg-16",
        "startTimeSeconds": 377.2,
        "endTimeSeconds": 388,
        "formattedRange": "6:17 - 6:28",
        "sectionName": "Final Cadence & Applause (Sol, si, re, do / Gracias París)",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Singers hold the final notes 'Sol, si, re, do!' followed by a final band hit and Paris applause",
        "leaderCue": "Hit a clean final pose with your partner on 'Sol, si, re, do' and thank them for the dance.",
        "followerCue": "Style the final sustained chord 'do!' and celebrate the finish with your partner.",
        "commonMistakeWarning": "Stepping out of your final pose before the band's closing hit at 6:21.",
        "recommendedMoveSlugs": [
          "beg-mus-1"
        ],
        "timingMode": "Ambient (No Beat)",
        "instrumentMapping": {
          "feet": "Final band chord",
          "hipsAndKnees": "Sustained brass note",
          "chestAndShoulders": "Sung 'Sol, si, re, do' cadence"
        },
        "startsOnOne": true
      }
    ]
  },
  // -----------------------------------------------------------------
  // "537 C.U.B.A." - Orishas
  // Cuban Hip-Hop / Fusion • Improver • 84 BPM • 2-3 Son Clave • 265s
  // Video ID: dAHVvpdbsps • timings from Argus
  // Gemini 4 Argon in AI Studio 2026-10-31 (old map: 7 sections; 3 of 12 new starts near it). Ear-check: percussion entry 0:08.5, the 4-bar sung bridge 2:17, coro after 'jamás, jamás' 3:37.
  // -----------------------------------------------------------------
  {
    "id": "537-cuba",
    "title": "537 C.U.B.A.",
    "artist": "Orishas",
    "style": "Cuban Hip-Hop / Fusion",
    "bpm": 84,
    "claveType": "2-3 Son Clave",
    "difficultyLevel": "Improver",
    "durationSeconds": 265,
    "youtubeVideoId": "dAHVvpdbsps",
    "youtubeUrl": "https://www.youtube.com/watch?v=dAHVvpdbsps",
    "segments": [
      {
        "id": "537-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 8.5,
        "formattedRange": "0:00 - 0:08",
        "sectionName": "Intro: Sub-Bass Tumbao",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Deep solo bass tumbao plays the Chan Chan progression alone",
        "leaderCue": "Stand relaxed with your partner, feel the slow bass pulse and wait for the percussion.",
        "followerCue": "Breathe, soften your knees to the sub-bass and wait for the clave before stepping.",
        "commonMistakeWarning": "Starting full partnerwork immediately on the bare bassline before the percussion enters.",
        "recommendedMoveSlugs": [
          "beg-mus-1"
        ],
        "timingMode": "Ambient (No Beat)",
        "instrumentMapping": {
          "feet": "bass tumbao pulse",
          "hipsAndKnees": "sub-bass resonance",
          "chestAndShoulders": "steady breathing"
        },
        "bars": 3,
        "startsOnOne": true
      },
      {
        "id": "537-seg-2",
        "startTimeSeconds": 8.5,
        "endTimeSeconds": 23,
        "formattedRange": "0:08 - 0:23",
        "sectionName": "Intro Groove: Clave, Tres & Trumpet",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Maracas, 2-3 son clave, bongo and muted trumpet enter on the groove",
        "leaderCue": "Warm up apart with Paso Básico and Lateral steps, adding a relaxed hip-hop shoulder bounce.",
        "followerCue": "Dance solo basic and side steps facing your leader, letting the maracas guide your hips.",
        "commonMistakeWarning": "Rushing the slow 84 BPM groove instead of letting each step sink into the floor.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "imp-mus-1"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "conga and bongo pulse",
          "hipsAndKnees": "maracas shaker",
          "chestAndShoulders": "muted trumpet line"
        },
        "bars": 5,
        "startsOnOne": true
      },
      {
        "id": "537-seg-3",
        "startTimeSeconds": 23,
        "endTimeSeconds": 34,
        "formattedRange": "0:23 - 0:34",
        "sectionName": "Coro 1: Vengo de donde hay un río",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Chorus sings 'Vengo de donde hay un río, tabaco y cañaveral'",
        "leaderCue": "Take closed hold for smooth Son basic and a slow Dile Que No to open up.",
        "followerCue": "Connect into a soft closed frame, stepping small and smooth underneath your body.",
        "commonMistakeWarning": "Taking huge steps during the intimate Chan Chan chorus melody.",
        "recommendedMoveSlugs": [
          "imp-sub-1",
          "beg-pw-2"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "bass tumbao and conga",
          "hipsAndKnees": "son clave",
          "chestAndShoulders": "sung coro melody"
        },
        "bars": 4,
        "startsOnOne": true,
        "handGesture": "Dile Que No"
      },
      {
        "id": "537-seg-4",
        "startTimeSeconds": 34,
        "endTimeSeconds": 57,
        "formattedRange": "0:34 - 0:57",
        "sectionName": "Rap 1: Soy de Cuba lo que impuso",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Rapper enters with 'Soy de Cuba lo que impuso y que se pega'",
        "leaderCue": "Dance grounded Guapea, Exhíbela and Enchufla with a laid-back Havana street-flow bounce.",
        "followerCue": "Keep your turns unhurried on Exhíbela and add subtle hip-hop ribcage groove in Guapea.",
        "commonMistakeWarning": "Pulling arms forcefully when the rap flow is conversational and grounded.",
        "recommendedMoveSlugs": [
          "beg-pw-1",
          "beg-pw-5",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "hip-hop kick and snare",
          "hipsAndKnees": "bass tumbao",
          "chestAndShoulders": "rap vocal cadence"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Exhíbela"
      },
      {
        "id": "537-seg-5",
        "startTimeSeconds": 57,
        "endTimeSeconds": 80,
        "formattedRange": "0:57 - 1:20",
        "sectionName": "Tema Cantado: Allá lejos donde el sol calienta",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Lead singer enters high and lyrical with 'Allá lejos, donde el sol calienta'",
        "leaderCue": "Bring your partner closer for Paséala and Prima, letting the nostalgic vocal breathe.",
        "followerCue": "Extend your free arm gracefully on Prima and glide smoothly through the Paséala walks.",
        "commonMistakeWarning": "Ignoring the switch from rap to lyrical son singing and keeping stiff mechanics.",
        "recommendedMoveSlugs": [
          "imp-pw-6",
          "beg-pw-4",
          "imp-sub-1"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "bongo and conga tumbao",
          "hipsAndKnees": "acoustic tres guitar",
          "chestAndShoulders": "lead vocal melody"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Prima"
      },
      {
        "id": "537-seg-6",
        "startTimeSeconds": 80,
        "endTimeSeconds": 103,
        "formattedRange": "1:20 - 1:43",
        "sectionName": "Coro 2: Vengo de donde hay un río (Doble)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Chorus returns with 'Vengo de donde hay un río' for two full cycles",
        "leaderCue": "Flow into Setenta and Sombrero, keeping a circular paseo around each other.",
        "followerCue": "Maintain soft hook-finger tension through Setenta and style the Sombrero wrap.",
        "commonMistakeWarning": "Cutting the circular walk short instead of using the full slow bar.",
        "recommendedMoveSlugs": [
          "imp-pw-1",
          "imp-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "conga and bassbeat",
          "hipsAndKnees": "maracas and clave",
          "chestAndShoulders": "coro harmonies"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Setenta"
      },
      {
        "id": "537-seg-7",
        "startTimeSeconds": 103,
        "endTimeSeconds": 137,
        "formattedRange": "1:43 - 2:17",
        "sectionName": "Rap 2: Extraño mi tierra querida",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Second rap verse begins: 'Extraño mi tierra querida, hablar de ella ni lo intentes'",
        "leaderCue": "Combine Vacílala, Kentucky and Dile Que No, giving your partner space to style.",
        "followerCue": "Spot cleanly on Vacílala and use the extra time in the slow tempo for body movement.",
        "commonMistakeWarning": "Over-leading Vacílala with a push instead of a clear, light wrist prep.",
        "recommendedMoveSlugs": [
          "imp-pw-3",
          "imp-pw-5",
          "beg-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "boom-bap drum beat",
          "hipsAndKnees": "bassline groove",
          "chestAndShoulders": "rap rhythm and flow"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Vacílala"
      },
      {
        "id": "537-seg-8",
        "startTimeSeconds": 137,
        "endTimeSeconds": 149,
        "formattedRange": "2:17 - 2:29",
        "sectionName": "Puente Cantado: Me arrancaré el corazón",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Melodic bridge enters: 'Me arrancaré el corazón y esperaré mi regreso'",
        "leaderCue": "Reconnect in close hold for four slow bars of Son basic and Paséala.",
        "followerCue": "Sink into your knees and match your leader's chest frame for a lyrical four-bar pause.",
        "commonMistakeWarning": "Starting a long complicated turn pattern right as this short 4-bar bridge ends.",
        "recommendedMoveSlugs": [
          "imp-sub-1",
          "imp-pw-6"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "soft conga pulse",
          "hipsAndKnees": "bass tumbao",
          "chestAndShoulders": "emotional vocal line"
        },
        "bars": 4,
        "startsOnOne": true,
        "handGesture": "Paséala"
      },
      {
        "id": "537-seg-9",
        "startTimeSeconds": 149,
        "endTimeSeconds": 171.5,
        "formattedRange": "2:29 - 2:51",
        "sectionName": "Coro 3: Vengo de donde hay un río",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Chorus swells back in with 'Vengo de donde hay un río'",
        "leaderCue": "Lead Setenta Complicado into Enchufla Doble, riding the chorus momentum.",
        "followerCue": "Keep your elbow soft on the overhead checks in Setenta Complicado.",
        "commonMistakeWarning": "Losing posture during the arm wraps of Setenta Complicado.",
        "recommendedMoveSlugs": [
          "imp-pw-2",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "percussion and bass",
          "hipsAndKnees": "2-3 son clave",
          "chestAndShoulders": "coro vocals"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Setenta Complicado"
      },
      {
        "id": "537-seg-10",
        "startTimeSeconds": 171.5,
        "endTimeSeconds": 194.5,
        "formattedRange": "2:51 - 3:14",
        "sectionName": "Rap 3A: Barrios de La Habana",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Fast neighborhood roll-call rap: 'Cayo Hueso salió por Buenavista, Miramar, Alamar'",
        "leaderCue": "Release after Vacílala con la Mano to trade solo footwork and Cuban hip-hop grooves.",
        "followerCue": "Play with solo footwork, shoulder isolations and rumba-flavored steps facing your leader.",
        "commonMistakeWarning": "Looking down at the floor instead of engaging with your partner during shines.",
        "recommendedMoveSlugs": [
          "imp-pw-3",
          "beg-solo-1",
          "imp-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "snare and conga slaps",
          "hipsAndKnees": "bass tumbao",
          "chestAndShoulders": "rapid-fire rap delivery"
        },
        "bars": 8,
        "startsOnOne": true
      },
      {
        "id": "537-seg-11",
        "startTimeSeconds": 194.5,
        "endTimeSeconds": 217,
        "formattedRange": "3:14 - 3:37",
        "sectionName": "Rap 3B: Soy Yoruba / Jamás, Jamás",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Sung backing chants and muted trumpet join the rap on 'Cambio si le soy Yoruba'",
        "leaderCue": "Pick up your partner with Dile Que No into Sombrero and pause on 'jamás, jamás!'",
        "followerCue": "Flow back into partner hold and hit a clean freeze with attitude on 'jamás, jamás!'",
        "commonMistakeWarning": "Blowing past the dramatic vocal accent 'jamás, jamás' at the end of the verse.",
        "recommendedMoveSlugs": [
          "beg-pw-2",
          "imp-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "kick drum and conga",
          "hipsAndKnees": "bassline",
          "chestAndShoulders": "trumpet counter-melody and rap"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Sombrero"
      },
      {
        "id": "537-seg-12",
        "startTimeSeconds": 217,
        "endTimeSeconds": 240,
        "formattedRange": "3:37 - 4:00",
        "sectionName": "Coro 4: Vengo de donde hay un río (Con Trompeta)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro returns after 'jamás, jamás' with soaring muted trumpet solos",
        "leaderCue": "Dance full-flow Setenta, Exhíbela and Kentucky, matching the trumpet's energy.",
        "followerCue": "Add expressive arm styling and smooth hip motion to echo the trumpet solo.",
        "commonMistakeWarning": "Getting sloppy with footwork near the end of the track.",
        "recommendedMoveSlugs": [
          "imp-pw-1",
          "beg-pw-5",
          "imp-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "conga and bongo drive",
          "hipsAndKnees": "bass and maracas",
          "chestAndShoulders": "muted trumpet solo and coro"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Kentucky"
      },
      {
        "id": "537-seg-13",
        "startTimeSeconds": 240,
        "endTimeSeconds": 265,
        "formattedRange": "4:00 - 4:25",
        "sectionName": "Outro: Coro Final & Fade-Out",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Final chorus cycles begin to fade out gradually with trumpet ad-libs",
        "leaderCue": "Wind down into close-hold Son basic and Paséala, slowing to a gentle finish as it fades.",
        "followerCue": "Make your steps smaller and softer as the volume fades, finishing in a calm embrace.",
        "commonMistakeWarning": "Launching high-energy turns while the music is fading to silence.",
        "recommendedMoveSlugs": [
          "imp-sub-1",
          "imp-pw-6"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "fading bass tumbao",
          "hipsAndKnees": "maracas and clave",
          "chestAndShoulders": "fading trumpet and coro"
        },
        "bars": 9,
        "startsOnOne": true
      }
    ]
  },
  // -----------------------------------------------------------------
  // "Toda Una Vida (Video Oficial)" - Leoni Torres
  // Beginner • 93 BPM • 2-3 Son Clave • 281s
  // Video ID: WOaVhrDLVzQ • timings from Argus
  // -----------------------------------------------------------------
  {
    "id": "toda-una-vida",
    "title": "Toda Una Vida (Video Oficial)",
    "artist": "Leoni Torres",
    "style": "Cuban Salsa-Pop",
    "bpm": 93,
    "claveType": "2-3 Son Clave",
    "difficultyLevel": "Beginner",
    "durationSeconds": 281,
    "youtubeVideoId": "WOaVhrDLVzQ",
    "youtubeUrl": "https://www.youtube.com/watch?v=WOaVhrDLVzQ",
    "segments": [
      {
        "id": "tuv-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 28,
        "formattedRange": "0:00 - 0:28",
        "sectionName": "Intro Cinematic & Piano Prelude",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Cinematic video intro and soft acoustic guitar/piano prelude before Leoni's vocal enters at 0:28",
        "leaderCue": "Stand in relaxed closed embrace, breathe with your partner, and sway gently without stepping.",
        "followerCue": "Rest your left hand softly on the leader's shoulder and match their breathing and sway.",
        "commonMistakeWarning": "Starting a full basic step before the percussion and vocal phrase begin.",
        "recommendedMoveSlugs": [
          "beg-mus-1",
          "beg-solo-1"
        ],
        "timingMode": "Ambient (No Beat)",
        "instrumentMapping": {
          "feet": "Floor stillness and gentle weight sway",
          "hipsAndKnees": "Soft knee softness on chord changes",
          "chestAndShoulders": "Acoustic guitar and piano melody"
        }
      },
      {
        "id": "tuv-seg-2",
        "startTimeSeconds": 28,
        "endTimeSeconds": 65,
        "formattedRange": "0:28 - 1:05",
        "sectionName": "Tema 1 — Como Tú No Hay Nadie",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Leoni Torres enters singing 'Como tú no hay nadie que me cuide y me quiera' (0:41)",
        "leaderCue": "Lead small, smooth Son or close-hold Casino steps, keeping your partner close and unhurried.",
        "followerCue": "Take compact gliding steps directly underneath your hips and enjoy the romantic vocal line.",
        "commonMistakeWarning": "Leading big, wide arm-pulling turns during an intimate opening verse.",
        "recommendedMoveSlugs": [
          "imp-sub-1",
          "beg-pw-1",
          "beg-pw-2"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "Soft bass tumbao and bongó",
          "hipsAndKnees": "Smooth Cuban figure-8 motion",
          "chestAndShoulders": "Lead vocal phrasing"
        }
      },
      {
        "id": "tuv-seg-3",
        "startTimeSeconds": 65,
        "endTimeSeconds": 87,
        "formattedRange": "1:05 - 1:27",
        "sectionName": "Pre-Coro — Podrás Confiar Al Fin",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Percussion locks in fuller as Leoni sings 'Podrás confiar al fin en alguien que te quiera' (1:05)",
        "leaderCue": "Open from closed hold via Dile Que No into smooth Guapea, Exhíbela, and simple Enchufla.",
        "followerCue": "Maintain light frame tension through Dile Que No and spot cleanly on Exhíbela.",
        "commonMistakeWarning": "Rushing count 1 as the conga tumbao builds toward the chorus.",
        "recommendedMoveSlugs": [
          "beg-pw-2",
          "beg-pw-5",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "handGesture": "Dile Que No (Thumb out to the side)",
        "instrumentMapping": {
          "feet": "Conga tumbao on beats 1-2-3, 5-6-7",
          "hipsAndKnees": "Bass pickup on beat 4 and 8",
          "chestAndShoulders": "Smooth romantic brass pads"
        }
      },
      {
        "id": "tuv-seg-4",
        "startTimeSeconds": 87,
        "endTimeSeconds": 118,
        "formattedRange": "1:27 - 1:58",
        "sectionName": "Coro 1 — Provócame, Anda Acaríciame",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Main hook 'Hoy aquí vengo a decirte que ando loco por ti nena, provócame' (1:27)",
        "leaderCue": "Flow into Setenta, Vacílala, and Paséala, letting the chorus melody carry the circular motion.",
        "followerCue": "Add graceful free-arm styling on Vacílala and trail fingertips gently during Paséala.",
        "commonMistakeWarning": "Using forceful arm tension instead of smooth circular momentum.",
        "recommendedMoveSlugs": [
          "imp-pw-1",
          "imp-pw-3",
          "imp-pw-6"
        ],
        "timingMode": "A Tiempo (On1)",
        "handGesture": "Setenta (7 fingers flashed up)",
        "instrumentMapping": {
          "feet": "Tumbadora and bass lock",
          "hipsAndKnees": "Continuous figure-8 Cuban motion",
          "chestAndShoulders": "Chorus vocal hook and horn swells"
        }
      },
      {
        "id": "tuv-seg-5",
        "startTimeSeconds": 118,
        "endTimeSeconds": 140,
        "formattedRange": "1:58 - 2:20",
        "sectionName": "Instrumental Horn Interlude & Tema 2",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Warm brass line at 1:58 followed by 'En esta vida ya no busco nada más' (2:08)",
        "leaderCue": "Dial the energy back down into Prima and relaxed closed-hold walks with your partner.",
        "followerCue": "Settle back into a calm, connected frame and breathe through the second verse.",
        "commonMistakeWarning": "Staying at peak chorus intensity when the arrangement drops back into verse.",
        "recommendedMoveSlugs": [
          "beg-pw-4",
          "beg-pw-2",
          "beg-sub-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "handGesture": "Prima / Adiós (Wave hand goodbye)",
        "instrumentMapping": {
          "feet": "Steady bass pulse",
          "hipsAndKnees": "Relaxed knee bend and hip sway",
          "chestAndShoulders": "Melodic trumpet interlude"
        }
      },
      {
        "id": "tuv-seg-6",
        "startTimeSeconds": 140,
        "endTimeSeconds": 160,
        "formattedRange": "2:20 - 2:40",
        "sectionName": "Pre-Coro 2 — Alguien Que Te Enamore",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Vocal returns to 'Podrás confiar al fin en alguien que te quiera' (2:20)",
        "leaderCue": "Build momentum with Sombrero and Enchufla Doble to prepare for the second chorus.",
        "followerCue": "Keep elbows softly in front of your ribs during the two-hand Sombrero wrap.",
        "commonMistakeWarning": "Lifting the follower's elbows too high during Sombrero.",
        "recommendedMoveSlugs": [
          "imp-pw-4",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "handGesture": "Sombrero (Touch top of head like a hat)",
        "instrumentMapping": {
          "feet": "Conga slap and open tones",
          "hipsAndKnees": "Fluid rotational weight transfers",
          "chestAndShoulders": "Piano montuno build"
        }
      },
      {
        "id": "tuv-seg-7",
        "startTimeSeconds": 160,
        "endTimeSeconds": 178,
        "formattedRange": "2:40 - 2:58",
        "sectionName": "Coro 2 — Tengo Toda Una Vida",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Chorus hits at 2:40: 'Aquí vengo a decirte que ando loco por ti nena'",
        "leaderCue": "Lead Setenta Complicado or Kentucky, keeping the circle tight and musical.",
        "followerCue": "Maintain your own axis through the turn wraps and smile on 'para darte mi amor'.",
        "commonMistakeWarning": "Rushing the exit of Setenta Complicado before beat 7.",
        "recommendedMoveSlugs": [
          "imp-pw-2",
          "imp-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Full percussion section drive",
          "hipsAndKnees": "Deep Cuban motion on 1-2-3, 5-6-7",
          "chestAndShoulders": "Chorus vocal harmony"
        }
      },
      {
        "id": "tuv-seg-8",
        "startTimeSeconds": 178,
        "endTimeSeconds": 208,
        "formattedRange": "2:58 - 3:28",
        "sectionName": "Mambo & Playful Suelta Breakdown",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Instrumental brass mambo and percussion groove takes over after 'para darte mi amor' (2:58)",
        "leaderCue": "Release into open Suelta shines for 2 eight-counts, then reconnect smoothly with Dile Que No.",
        "followerCue": "Play with solo Paso Básico, lateral steps, and shoulder styling while mirroring the leader.",
        "commonMistakeWarning": "Looking down at your feet during solo shines instead of connecting with your partner.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "beg-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Syncopated horn and campana hits",
          "hipsAndKnees": "Playful lateral hip groove",
          "chestAndShoulders": "Brass mambo riffs"
        }
      },
      {
        "id": "tuv-seg-9",
        "startTimeSeconds": 208,
        "endTimeSeconds": 268,
        "formattedRange": "3:28 - 4:28",
        "sectionName": "Montuno Climax — Y No Habrá Nadie Mujer",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Call-and-response coro 'Y no habrá nadie mujer que te regale su amor infinito' (3:34, 4:03)",
        "leaderCue": "Combine Siete, Montana, and Coca-Cola while riding the campana bell to the climax.",
        "followerCue": "Keep active frame connection through continuous montuno turns and enjoy the call-and-response.",
        "commonMistakeWarning": "Letting steps get too big and drifting behind the beat during the montuno.",
        "recommendedMoveSlugs": [
          "int-pw-3",
          "int-pw-1",
          "int-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "handGesture": "Siete (7 fingers held horizontally)",
        "instrumentMapping": {
          "feet": "Campana cowbell and tumbadora drive",
          "hipsAndKnees": "Continuous grounded figure-8",
          "chestAndShoulders": "Coro-pregón call and response"
        }
      },
      {
        "id": "tuv-seg-10",
        "startTimeSeconds": 268,
        "endTimeSeconds": 281,
        "formattedRange": "4:28 - 4:41",
        "sectionName": "Final — Y No Habrá Nadie Mujer Outro",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Final vocal refrain 'Y no habrá nadie mujer' (4:32) slowing into the closing chord",
        "leaderCue": "Slow the rotation down into a gentle Paséala and finish in a warm closed embrace.",
        "followerCue": "Decelerate with the music and extend your free arm into a clean final pose at 4:39.",
        "commonMistakeWarning": "Forcing an aggressive drop dip on a gentle romantic fade-out.",
        "recommendedMoveSlugs": [
          "imp-pw-6",
          "beg-pw-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Final bass and percussion cadence",
          "hipsAndKnees": "Settling weight cleanly over standing leg",
          "chestAndShoulders": "Final vocal sustain"
        }
      }
    ]
  },
  // -----------------------------------------------------------------
  // "Tremenda Pinta (Studio Video)" - Maykel Blanco y su Salsa Mayor
  // Intermediate • 102 BPM • 2-3 Rumba Clave • 243s
  // Video ID: sla7FbLckqM • timings from Argus
  // Argus unsure: 3:45 (could be 3:42)
  // -----------------------------------------------------------------
  {
    "id": "tremenda-pinta",
    "title": "Tremenda Pinta (Studio Video)",
    "artist": "Maykel Blanco y su Salsa Mayor",
    "style": "Timba",
    "bpm": 102,
    "claveType": "2-3 Rumba Clave",
    "difficultyLevel": "Intermediate",
    "durationSeconds": 243,
    "youtubeVideoId": "sla7FbLckqM",
    "youtubeUrl": "https://www.youtube.com/watch?v=sla7FbLckqM",
    "segments": [
      {
        "id": "tp-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 25,
        "formattedRange": "0:00 - 0:25",
        "sectionName": "Intro — Ella Tiene Cara, Ella Tiene Pelo",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Punchy piano and vocal hook 'Ella tiene cara, ella tiene pelo' (0:05)",
        "leaderCue": "Start apart with playful solo groove and eye contact, stepping into closed hold at 0:24.",
        "followerCue": "Style playfully on 'cara' (face) and 'pelo' (hair) with solo footwork before connecting.",
        "commonMistakeWarning": "Rushing into partnerwork turns during the playful 25-second character intro.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "int-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Kick-bass and conga slap",
          "hipsAndKnees": "Playful Cuban hip bounce",
          "chestAndShoulders": "Vocal accents on 'cara' and 'pelo'"
        }
      },
      {
        "id": "tp-seg-2",
        "startTimeSeconds": 25,
        "endTimeSeconds": 70,
        "formattedRange": "0:25 - 1:10",
        "sectionName": "Tema 1 — Ella Es Mi Razón, Mi Necesidad",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Smooth verse groove starts on 'Ella es mi razón, mi necesidad' (0:25)",
        "leaderCue": "Lead crisp, compact Guapea, Dile Que No, and Vacílala while keeping steps small for 102 BPM.",
        "followerCue": "Keep footwork directly underneath your body and maintain responsive frame tension.",
        "commonMistakeWarning": "Taking oversized backward steps on Guapea at 102 BPM.",
        "recommendedMoveSlugs": [
          "beg-pw-1",
          "beg-pw-2",
          "imp-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "handGesture": "Vacílala (Tap temple or small finger circle)",
        "instrumentMapping": {
          "feet": "Tumbadora tumbao",
          "hipsAndKnees": "Tight figure-8 motion",
          "chestAndShoulders": "Piano tumbao and lead vocal"
        }
      },
      {
        "id": "tp-seg-3",
        "startTimeSeconds": 70,
        "endTimeSeconds": 115,
        "formattedRange": "1:10 - 1:55",
        "sectionName": "Tema 2 — Siempre Va A La Moda Atómica",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Brass and percussion intensify on 'Seguro se maquilla, uy siempre va a la moda atómica' (1:10)",
        "leaderCue": "Step up to Sombrero, Setenta, and Kentucky as the Salsa Mayor brass builds pressure.",
        "followerCue": "Spot sharply on turns and hit subtle shoulder accents on 'moda atómica' (1:21, 1:42).",
        "commonMistakeWarning": "Dropping frame connection during fast two-hand Sombrero transitions.",
        "recommendedMoveSlugs": [
          "imp-pw-4",
          "imp-pw-1",
          "imp-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "handGesture": "Kentucky (Hands crossed at wrists)",
        "instrumentMapping": {
          "feet": "Driving bass and conga lock",
          "hipsAndKnees": "Rotational hip drive on 3 and 7",
          "chestAndShoulders": "Brass punches on 'moda atómica'"
        }
      },
      {
        "id": "tp-seg-4",
        "startTimeSeconds": 115,
        "endTimeSeconds": 160,
        "formattedRange": "1:55 - 2:40",
        "sectionName": "Coro 1 — Cara, Pelo y Tremenda Pinta",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Transition 'Pero mira cómo viene' (1:55) into coro 'Cara, pelo y tremenda pinta'",
        "leaderCue": "Drive high-energy Dedo, Siete, and Setenta Complicado patterns riding the heavy cowbell.",
        "followerCue": "Keep turns tight and effortless, styling free hands on the 'tremenda pinta' coro hits.",
        "commonMistakeWarning": "Pulling the follower off-balance during multi-turn combinations.",
        "recommendedMoveSlugs": [
          "int-pw-2",
          "int-pw-3",
          "imp-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "handGesture": "Dedo (Index finger pointing straight up)",
        "instrumentMapping": {
          "feet": "Campana bell and bass tumbao",
          "hipsAndKnees": "Grounded Timba bounce",
          "chestAndShoulders": "Coro vocals and trombone hits"
        }
      },
      {
        "id": "tp-seg-5",
        "startTimeSeconds": 160,
        "endTimeSeconds": 175,
        "formattedRange": "2:40 - 2:55",
        "sectionName": "Salsa Mayor Call & Brass Gear-Shift",
        "danceGear": "Rumba Guaguancó",
        "colorTheme": "red",
        "musicalTrigger": "Maykel Blanco shouts 'Maykel Blanco y su Salsa Mayor... ¿y dónde están las mujeres?' (2:45)",
        "leaderCue": "Open the frame into side-by-side or open Rumba Guaguancó play to set up the breakdown.",
        "followerCue": "Answer the leader's Rumba call with playful Guaguancó skirt/hand defense and hip isolation.",
        "commonMistakeWarning": "Staying locked in closed Casino turn patterns when the band calls out the women.",
        "recommendedMoveSlugs": [
          "imp-solo-1",
          "adv-pw-2"
        ],
        "timingMode": "Contrapunto (On2 <-> On1)",
        "instrumentMapping": {
          "feet": "Rumba clave and percussion breaks",
          "hipsAndKnees": "Sharp lateral Guaguancó hip accents",
          "chestAndShoulders": "Thoracic Rumba shoulder rolls"
        }
      },
      {
        "id": "tp-seg-6",
        "startTimeSeconds": 175,
        "endTimeSeconds": 203,
        "formattedRange": "2:55 - 3:23",
        "sectionName": "Despelote Breakdown — Camina Como Camina",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Bass drops heavy on 'Camina como camina, eh pasito cucú' (2:55, 3:07)",
        "leaderCue": "Drop hands completely; frame your partner and groove with low-center Despelote and Tembleque.",
        "followerCue": "Take center stage on 'camina como camina' with stylized walks, body rolls, and cintura isolations.",
        "commonMistakeWarning": "Holding onto the follower's hands when the music demands solo styling and Despelote.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1",
          "int-mus-1"
        ],
        "timingMode": "Syncopated Reparto",
        "instrumentMapping": {
          "feet": "Syncopated bass bombs and kick",
          "hipsAndKnees": "Cintura circles and knee bends",
          "chestAndShoulders": "Thoracic ribcage isolation & Despelote"
        }
      },
      {
        "id": "tp-seg-7",
        "startTimeSeconds": 203,
        "endTimeSeconds": 225,
        "formattedRange": "3:23 - 3:45",
        "sectionName": "Final Montuno — Todas Las Mujeres Tremenda Pinta",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Full band roars back on 'Vamos otra vez, tremenda pinta, todas las mujeres' (3:23)",
        "leaderCue": "Reconnect cleanly on count 1 for a final burst of Siete Loco and Coca-Cola.",
        "followerCue": "Reconnect frame instantly and match the high-speed montuno drive to the finish.",
        "commonMistakeWarning": "Reconnecting out of phrase after the solo Despelote breakdown.",
        "recommendedMoveSlugs": [
          "int-pw-3",
          "int-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "handGesture": "Coca-Cola (Drinking bottle gesture)",
        "instrumentMapping": {
          "feet": "Full timba percussion drive",
          "hipsAndKnees": "Fast figure-8 motion",
          "chestAndShoulders": "High-brass climax"
        }
      },
      {
        "id": "tp-seg-8",
        "startTimeSeconds": 225,
        "endTimeSeconds": 243,
        "formattedRange": "3:45 - 4:03",
        "sectionName": "Final — Y Me Voy Tremenda Pinta",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Closing vocal tag 'Tremenda pinta y me voy' (3:45) and final studio fade/hit",
        "leaderCue": "Lead a final Enchufla into a crisp closing pose or playful camera-ready freeze.",
        "followerCue": "Hit a sharp model pose on the final 'tremenda pinta' call.",
        "commonMistakeWarning": "Trailing off clumsily without hitting the final musical punctuation.",
        "recommendedMoveSlugs": [
          "beg-pw-3",
          "beg-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Final timbal and bass hits",
          "hipsAndKnees": "Sharp weight lock on final beat",
          "chestAndShoulders": "Proud chest lift on final pose"
        }
      }
    ]
  },
  // -----------------------------------------------------------------
  // "Marcando La Distancia" - Manolito Simonet y su Trabuco
  // Timba • Intermediate • 100 BPM • 2-3 Son Clave • 341s
  // Video ID: uV331c81kz4 • timings from Argus
  // Gemini 4 Argon 2026-10-31 (Gemini web, song-maker rules). An AI Studio Argon run agrees within 0.5 s on 9 of 11 starts. Ear-check: 0:12 (piano-only intro?), mambo 2:07 or 2:10, despelote at 2:38 or 3:20.5, verse at 4:01.
  // -----------------------------------------------------------------
  {
    "id": "marcando-la-distancia",
    "title": "Marcando La Distancia",
    "artist": "Manolito Simonet y su Trabuco",
    "style": "Timba",
    "bpm": 100,
    "claveType": "2-3 Son Clave",
    "difficultyLevel": "Intermediate",
    "durationSeconds": 341,
    "youtubeVideoId": "uV331c81kz4",
    "youtubeUrl": "https://www.youtube.com/watch?v=uV331c81kz4",
    "segments": [
      {
        "id": "marcando-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 31.5,
        "formattedRange": "0:00 - 0:31",
        "sectionName": "Piano & Flute Intro into Brass Mambo",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Syncopated piano tumbao opens at 0:00, flute melody at 0:11, brass hits at 0:21",
        "leaderCue": "Start in close hold with small Son steps or contratiempo basic; open to Guapea on the 0:21 brass.",
        "followerCue": "Keep steps compact underneath your hips, feeling the piano syncopation through a light frame before opening out.",
        "commonMistakeWarning": "Rushing into big turn patterns during the delicate piano and flute intro before the brass enters.",
        "recommendedMoveSlugs": [
          "beg-mus-1",
          "imp-sub-1",
          "beg-solo-1"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "bass tumbao",
          "hipsAndKnees": "conga tumbao",
          "chestAndShoulders": "piano montuno and flute"
        },
        "bars": 13,
        "startsOnOne": true
      },
      {
        "id": "marcando-seg-2",
        "startTimeSeconds": 31.5,
        "endTimeSeconds": 51,
        "formattedRange": "0:31 - 0:51",
        "sectionName": "Tema 1 (Quiero saber qué haces en mi casa)",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Lead vocal enters after brass pickup: 'Quiero saber qué haces en mi casa'",
        "leaderCue": "Guapea into Dile Que No, Exhíbela, and Paséala; keep the lead conversational to match the storytelling verse.",
        "followerCue": "Maintain smooth, grounded weight transfers and use unhurried arm styling on Exhíbela.",
        "commonMistakeWarning": "Over-leading complex knots while the singer is laying out the opening story.",
        "recommendedMoveSlugs": [
          "beg-pw-1",
          "beg-pw-2",
          "imp-pw-6"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "conga tumbao",
          "hipsAndKnees": "bass tumbao",
          "chestAndShoulders": "lead vocal phrasing"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Dile Que No"
      },
      {
        "id": "marcando-seg-3",
        "startTimeSeconds": 51,
        "endTimeSeconds": 69.5,
        "formattedRange": "0:51 - 1:09",
        "sectionName": "Estribillo & Coro 1 (Tú pa'llá y yo pa'cá)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Lyric lifts on 'Por el respeto que yo merezco' into coro 'Tú pa'llá y yo pa'cá'",
        "leaderCue": "Build momentum with Vacílala and Sombrero, then hit the brass break at 1:07 before the second verse.",
        "followerCue": "Spot sharply through Vacílala turns and keep elbows compact for the Sombrero wrap.",
        "commonMistakeWarning": "Missing the punchy brass transition at 1:07 that resets energy back to Tema 2.",
        "recommendedMoveSlugs": [
          "imp-pw-3",
          "imp-pw-4",
          "beg-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "timbal cáscara",
          "hipsAndKnees": "conga slaps",
          "chestAndShoulders": "coro call-and-response"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Sombrero"
      },
      {
        "id": "marcando-seg-4",
        "startTimeSeconds": 69.5,
        "endTimeSeconds": 89,
        "formattedRange": "1:09 - 1:29",
        "sectionName": "Tema 2 (Ahora resulta que está más fea)",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Lead vocal re-enters smoothly: 'Ahora resulta que está más fea'",
        "leaderCue": "Drop back to relaxed Setenta and Kentucky; let the dance breathe during the second verse.",
        "followerCue": "Keep hook-finger tension light during Setenta and glide through the cross-body paths.",
        "commonMistakeWarning": "Staying at peak montuno intensity when the band drops back down into the verse groove.",
        "recommendedMoveSlugs": [
          "imp-pw-1",
          "imp-pw-5",
          "beg-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "bass tumbao",
          "hipsAndKnees": "conga tumbao",
          "chestAndShoulders": "piano montuno"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Setenta"
      },
      {
        "id": "marcando-seg-5",
        "startTimeSeconds": 89,
        "endTimeSeconds": 130,
        "formattedRange": "1:29 - 2:10",
        "sectionName": "Montuno 1 (Tú pa'llá y yo pa'cá)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "'Por el respeto que yo merezco' into extended coro-pregón 'Tú pa'llá y yo pa'cá' with '¡Te repito!' break at 1:45",
        "leaderCue": "Drive into Siete, Montana, and Setenta Complicado; pause or accent the '¡Te repito! ¡Upa!' hit at 1:45.",
        "followerCue": "Maintain active core engagement for continuous turn patterns and accent the 1:45 break with shoulder styling.",
        "commonMistakeWarning": "Plowing straight through the '¡Te repito!' stop at 1:45 without acknowledging the vocal hit.",
        "recommendedMoveSlugs": [
          "int-pw-1",
          "int-pw-3",
          "imp-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "campana",
          "hipsAndKnees": "conga tumbao",
          "chestAndShoulders": "brass hits and coro"
        },
        "bars": 17,
        "startsOnOne": true,
        "handGesture": "Montana"
      },
      {
        "id": "marcando-seg-6",
        "startTimeSeconds": 130,
        "endTimeSeconds": 158,
        "formattedRange": "2:10 - 2:38",
        "sectionName": "Mambo & Brass Bloque (¡Candela! ¡Deja eso!)",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Syncopated brass mambo riffs at 2:10, sharp bloque with '¡Candela! ¡Deja eso!' at 2:18, soaring horns to 2:38",
        "leaderCue": "Release partner on the mambo or after Enchufla; hit the '¡Candela!' bloque at 2:18 with solo footwork and contrapunto.",
        "followerCue": "Use the open break to play with syncopated footwork, freeze on '¡Candela!', then ride the brass waves.",
        "commonMistakeWarning": "Forcing heavy partnerwork wrenches through the sharp 2:18-2:22 brass bloque.",
        "recommendedMoveSlugs": [
          "int-mus-1",
          "adv-pw-2",
          "beg-solo-1"
        ],
        "timingMode": "Contrapunto (On2 <-> On1)",
        "instrumentMapping": {
          "feet": "syncopated brass hits",
          "hipsAndKnees": "timbal fills",
          "chestAndShoulders": "horn mambo riffs"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Pa'Fuera"
      },
      {
        "id": "marcando-seg-7",
        "startTimeSeconds": 158,
        "endTimeSeconds": 179,
        "formattedRange": "2:38 - 2:59",
        "sectionName": "Pregón & Rumba-Tinged Breakdown (Lo que pasó, pasó)",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Horn intensity drops as singer delivers 'Ella mil veces te ha dicho... lo que pasó, pasó'",
        "leaderCue": "Drop into close or semi-open groove with ribcage isolations and playful Rumba/Despelote body movement before the shout.",
        "followerCue": "Answer the singer's 'capricho' lines with thoracic isolations, cintura movement, and grounded knees.",
        "commonMistakeWarning": "Treating this earthy, stripped-back vocal breakdown like a flat-out race-track turn section.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "imp-solo-1",
          "adv-pw-1"
        ],
        "timingMode": "Syncopated Reparto",
        "instrumentMapping": {
          "feet": "syncopated bass",
          "hipsAndKnees": "conga quinto slaps",
          "chestAndShoulders": "pregón vocal accents"
        },
        "bars": 9,
        "startsOnOne": true
      },
      {
        "id": "marcando-seg-8",
        "startTimeSeconds": 179,
        "endTimeSeconds": 229.5,
        "formattedRange": "2:59 - 3:49",
        "sectionName": "Montuno 2 (Pa' la calle / Fuera de mi casa)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Explosive shout '¡Fuera!' into driving coro '¡Pa' la calle! ¡Fuera de mi casa!'",
        "leaderCue": "Full-throttle Casino: Dedo, El Uno, Coca-Cola, and Bayamo riding the relentless 'Pa' la calle' campana.",
        "followerCue": "Keep a responsive, athletic frame for rapid direction changes and finish Coca-Cola spins with crisp balance.",
        "commonMistakeWarning": "Losing the '1' when the singer shouts '¡Alaroye!' and '¡Arriba!' over the coro around 3:19-3:33.",
        "recommendedMoveSlugs": [
          "int-pw-2",
          "int-pw-4",
          "adv-sub-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "campana",
          "hipsAndKnees": "driving bass tumbao",
          "chestAndShoulders": "coro 'Pa' la calle'"
        },
        "bars": 21,
        "startsOnOne": true,
        "handGesture": "Coca-Cola"
      },
      {
        "id": "marcando-seg-9",
        "startTimeSeconds": 229.5,
        "endTimeSeconds": 241,
        "formattedRange": "3:49 - 4:01",
        "sectionName": "Piano & Flute Montuno Interlude",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Vocals and heavy brass drop out; signature piano tumbao and charanga flute return at 3:49.5",
        "leaderCue": "Immediately soften the lead into close hold or smooth Paséala, letting the flute melody cool the floor down.",
        "followerCue": "Melt into the sudden dynamic drop, styling softly with the flute before the second story begins.",
        "commonMistakeWarning": "Continuing high-speed timba turn patterns when the arrangement strips down to piano and flute.",
        "recommendedMoveSlugs": [
          "imp-pw-6",
          "imp-sub-1",
          "adv-pw-1"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "bass tumbao",
          "hipsAndKnees": "conga tumbao",
          "chestAndShoulders": "flute solo and piano"
        },
        "bars": 5,
        "startsOnOne": true,
        "handGesture": "Paséala"
      },
      {
        "id": "marcando-seg-10",
        "startTimeSeconds": 241,
        "endTimeSeconds": 275.5,
        "formattedRange": "4:01 - 4:35",
        "sectionName": "Segunda Historia / Tema 3 (Supe que andabas diciendo)",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Lead vocal enters with the dramatic verse: 'Supe que andabas diciendo que yo no la merecía'",
        "leaderCue": "Dance smooth, connected figures—Vacílala con la Mano, Setenta, and Dile Que No—building tension toward 4:35.",
        "followerCue": "Express the lyrical drama through unhurried turns and poised posture until the '¡Dale echando!' cue.",
        "commonMistakeWarning": "Rushing the build-up before the band explodes back into 'Pa' la calle' at 4:35.5.",
        "recommendedMoveSlugs": [
          "imp-pw-3",
          "imp-pw-1",
          "beg-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "conga tumbao",
          "hipsAndKnees": "bass tumbao",
          "chestAndShoulders": "lead vocal melody"
        },
        "bars": 14,
        "startsOnOne": true,
        "handGesture": "Vacílala"
      },
      {
        "id": "marcando-seg-11",
        "startTimeSeconds": 275.5,
        "endTimeSeconds": 316,
        "formattedRange": "4:35 - 5:16",
        "sectionName": "Montuno 3 & Mambo Call-and-Response (Pa' la calle)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro '¡Pa' la calle! ¡Fuera de mi casa!' returns at 4:35.5, joined by brass mambo riffs from 5:02",
        "leaderCue": "Launch into Siete Loco, Dedo, and Enchufla Doble; match the brass riffs starting at 5:02 with sharp accents.",
        "followerCue": "Stay grounded and compact through fast multi-turn combinations as the brass and coro trade phrases.",
        "commonMistakeWarning": "Letting steps get too wide as the arrangement reaches peak density past the 5:00 mark.",
        "recommendedMoveSlugs": [
          "int-pw-3",
          "int-pw-2",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "campana",
          "hipsAndKnees": "bass and conga drive",
          "chestAndShoulders": "brass mambo and coro"
        },
        "bars": 17,
        "startsOnOne": true,
        "handGesture": "Siete Loco"
      },
      {
        "id": "marcando-seg-12",
        "startTimeSeconds": 316,
        "endTimeSeconds": 341,
        "formattedRange": "5:16 - 5:41",
        "sectionName": "Final Coro, Brass Climax & Coda (¡Agua! ¡Gozando!)",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Coro switches back to 'Tú pa'llá y yo pa'cá' at 5:16, brass climax at 5:28 ('¡Agua!'), final hit at 5:37",
        "leaderCue": "Finish with high-energy Casino or break into solo shines at 5:28 ('¡Agua!') to hit the final '¡Ya!' at 5:37.",
        "followerCue": "Unleash full timba styling, tembleque, and sharp footwork on the final brass run, freezing on the 5:37 hit.",
        "commonMistakeWarning": "Still mid-turn at 5:37 when the band hits the final syncopated stop ('¡Ya!').",
        "recommendedMoveSlugs": [
          "adv-solo-1",
          "adv-mus-1",
          "beg-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "timbal and brass hits",
          "hipsAndKnees": "bass tumbao",
          "chestAndShoulders": "final brass fanfare"
        },
        "bars": 9,
        "startsOnOne": true,
        "handGesture": "Exhíbela"
      }
    ]
  },
  // -----------------------------------------------------------------
  // "BAILE INoLVIDABLE (Official Video)" - Bad Bunny
  // Puerto Rican Salsa • Improver • 100 BPM • 2-3 Son Clave • 379s
  // Video ID: a1Femq4NPxs • timings from Argus
  // Gemini 4 Argon in AI Studio 2026-10-31. The old map ran 1-7 s earlier at most changes (salsa entry 1:05 vs 1:11.5). Argon unsure: 2:35.5 (2:34.5-2:36), 4:39.5 (4:38.5-4:40.5). Ear-check also 1:11.5 and 3:47 (old 3:40).
  // -----------------------------------------------------------------
  {
    "id": "baile-inolvidable",
    "title": "BAILE INoLVIDABLE (Official Video)",
    "artist": "Bad Bunny",
    "style": "Puerto Rican Salsa",
    "bpm": 100,
    "claveType": "2-3 Son Clave",
    "difficultyLevel": "Improver",
    "durationSeconds": 379,
    "youtubeVideoId": "a1Femq4NPxs",
    "youtubeUrl": "https://www.youtube.com/watch?v=a1Femq4NPxs",
    "segments": [
      {
        "id": "baile-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 71.5,
        "formattedRange": "0:00 - 1:11",
        "sectionName": "Intro: Synth Ballad & Spoken Word",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Nostalgic synth pad with vocals 'Pensaba que contigo iba a envejecer', followed by spoken dialogue.",
        "leaderCue": "Stand tall in solo line formation, breathe with the synth intro, and get ready for percussion.",
        "followerCue": "Relax your shoulders, center your weight over the balls of your feet, and wait for the conga.",
        "commonMistakeWarning": "Starting to step during the slow synth ballad before the salsa percussion enters at 1:11.5.",
        "recommendedMoveSlugs": [
          "beg-mus-1"
        ],
        "timingMode": "Ambient (No Beat)",
        "instrumentMapping": {
          "feet": "Floor grounding only",
          "hipsAndKnees": "Soft knee sway",
          "chestAndShoulders": "Breath with synth phrasing"
        },
        "startsOnOne": false
      },
      {
        "id": "baile-seg-2",
        "startTimeSeconds": 71.5,
        "endTimeSeconds": 103,
        "formattedRange": "1:11 - 1:43",
        "sectionName": "Instrumental Intro: Brass Mambo & Shines Class",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Congas and cowbell kick in for one bar before the brass mambo blasts at 1:14.",
        "leaderCue": "Dance Paso Básico, Lateral, and Atrás in solo lines; freeze on the 1:35 break, then take closed hold.",
        "followerCue": "Keep footwork compact underneath your hips, match the teacher's clave claps, and connect in closed hold at 1:36.",
        "commonMistakeWarning": "Dancing past the brass break at 1:35 instead of pausing to form your Rueda circle.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "beg-mus-1",
          "imp-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Conga tumbao and clave claps",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Trombone and trumpet mambo"
        },
        "bars": 13,
        "startsOnOne": true,
        "handGesture": "Al Medio"
      },
      {
        "id": "baile-seg-3",
        "startTimeSeconds": 103,
        "endTimeSeconds": 124.5,
        "formattedRange": "1:43 - 2:04",
        "sectionName": "Tema 1A: Pensaba Que Contigo Iba a Envejecer",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Bad Bunny enters on the salsa beat singing 'Pensaba que contigo iba a envejecer' over piano montuno.",
        "leaderCue": "Start in closed hold with smooth Paso Básico, then open via Dile Que No into relaxed Guapea.",
        "followerCue": "Maintain a soft, responsive frame in closed position and complete your Dile Que No walk cleanly on 5-6-7.",
        "commonMistakeWarning": "Rushing into big turn patterns while the verse arrangement is still intimate and lyrical.",
        "recommendedMoveSlugs": [
          "beg-pw-1",
          "beg-pw-2",
          "beg-sub-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Piano montuno",
          "hipsAndKnees": "Conga slap on 2 and 6",
          "chestAndShoulders": "Lead vocal phrasing"
        },
        "bars": 9,
        "startsOnOne": true,
        "handGesture": "Dile Que No"
      },
      {
        "id": "baile-seg-4",
        "startTimeSeconds": 124.5,
        "endTimeSeconds": 144,
        "formattedRange": "2:04 - 2:24",
        "sectionName": "Tema 1B: Si Me Ven Solo y Triste",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Vocals rise on 'Si me ven solo y triste no me hablen' as warm brass swells enter.",
        "leaderCue": "Lead Enchufla and Dame to switch partners around the Rueda circle, finishing with Exhíbela on 'baile inolvidable'.",
        "followerCue": "Spot the next leader quickly on every Dame call and keep your right arm curved through Enchufla turns.",
        "commonMistakeWarning": "Taking wide steps during Dame and arriving late to your new partner on beat 1.",
        "recommendedMoveSlugs": [
          "beg-pw-3",
          "beg-pw-5",
          "beg-sub-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bass and conga pulse",
          "hipsAndKnees": "Piano guajeo",
          "chestAndShoulders": "Swelling brass chords"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Dame"
      },
      {
        "id": "baile-seg-5",
        "startTimeSeconds": 144,
        "endTimeSeconds": 155.5,
        "formattedRange": "2:24 - 2:35",
        "sectionName": "Electric Piano Interlude",
        "danceGear": "Son Cubano",
        "colorTheme": "blue",
        "musicalTrigger": "Melancholic electric keyboard melody takes the lead after 'baile inolvidable'.",
        "leaderCue": "Slow your upper body down into smooth Paséala and Prima, softening the frame for the keyboard solo.",
        "followerCue": "Let your hips glide smoothly with the keyboard melody and prepare for the brass walk-up break at 2:33.",
        "commonMistakeWarning": "Ignoring the nostalgic keyboard drop and continuing high-energy turns through the interlude.",
        "recommendedMoveSlugs": [
          "beg-pw-4",
          "imp-pw-6",
          "imp-sub-1"
        ],
        "timingMode": "Contratiempo (On2) or Smooth On1",
        "instrumentMapping": {
          "feet": "Soft bass tumbao",
          "hipsAndKnees": "Conga marcha",
          "chestAndShoulders": "Electric keyboard melody"
        },
        "bars": 5,
        "startsOnOne": true,
        "handGesture": "Prima"
      },
      {
        "id": "baile-seg-6",
        "startTimeSeconds": 155.5,
        "endTimeSeconds": 187,
        "formattedRange": "2:35 - 3:07",
        "sectionName": "Coro & Mambo 1: No Te Puedo Olvidar",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro shouts 'No, no te puedo olvidar, no, no te puedo borrar' followed by the 2:45 brass mambo.",
        "leaderCue": "Full Casino flow: lead Vacílala into Setenta and Sombrero, matching the center-circle showcase energy.",
        "followerCue": "Use dynamic free-arm styling on Vacílala, keep hook-finger tension in Setenta, and hit the 3:05 break.",
        "commonMistakeWarning": "Dropping your frame tension during the 2:45 brass mambo when the arrangement hits peak drive.",
        "recommendedMoveSlugs": [
          "imp-pw-3",
          "imp-pw-1",
          "imp-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bongo campana",
          "hipsAndKnees": "Driving bass and conga",
          "chestAndShoulders": "Coro vocals and brass mambo"
        },
        "bars": 13,
        "startsOnOne": true,
        "handGesture": "Setenta"
      },
      {
        "id": "baile-seg-7",
        "startTimeSeconds": 187,
        "endTimeSeconds": 227,
        "formattedRange": "3:07 - 3:47",
        "sectionName": "Pregón Verse: Hay Un Paso Nuevo / Mi Diabla, Mi Ángel",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Bad Bunny drops in with 'Dime cómo le hago pa' olvidarte, hay un paso nuevo que quiero enseñarte'.",
        "leaderCue": "Keep it playful and conversational with Kentucky, Paséala, and Enchufla Doble on the 3:16 coro return.",
        "followerCue": "Play with eye contact and subtle shoulder shimmy during 'Mi diabla, mi ángel, mi loquita'.",
        "commonMistakeWarning": "Over-leading complex hammerlocks over Bad Bunny's rhythmic vocal delivery.",
        "recommendedMoveSlugs": [
          "imp-pw-5",
          "imp-pw-6",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Maracas and conga pulse",
          "hipsAndKnees": "Syncopated bass tumbao",
          "chestAndShoulders": "Rap-sung pregón flow"
        },
        "bars": 17,
        "startsOnOne": true,
        "handGesture": "Kentucky"
      },
      {
        "id": "baile-seg-8",
        "startTimeSeconds": 227,
        "endTimeSeconds": 239,
        "formattedRange": "3:47 - 3:59",
        "sectionName": "Spotlight Brass Mambo Transition",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Bad Bunny shouts '¡Ey!' and layered trumpets and trombones launch a 5-bar mambo.",
        "leaderCue": "Release into open suelta shines, accenting the syncopated horn hits before reconnecting at 3:59.",
        "followerCue": "Step forward with confidence like the spotlight entrance, styling arms and hips with the brass.",
        "commonMistakeWarning": "Staying locked in closed partnerwork when the horns call for open shines.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "imp-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Timbal and campana drive",
          "hipsAndKnees": "Conga tumbao",
          "chestAndShoulders": "Layered brass punches"
        },
        "bars": 5,
        "startsOnOne": true,
        "handGesture": "Pa'Fuera"
      },
      {
        "id": "baile-seg-9",
        "startTimeSeconds": 239,
        "endTimeSeconds": 271,
        "formattedRange": "3:59 - 4:31",
        "sectionName": "Spotlight Campana & Piano Groove: Como Anoche",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Horns drop out to crisp piano montuno and bongo bell as Bad Bunny says 'Esto suena cabrón'.",
        "leaderCue": "Lead tight Setenta Complicado and Dedo under the spotlight groove, finishing with a dip on the 4:30 chord.",
        "followerCue": "Dig your feet into the bongo bell rhythm, keep turns sharp, and brace your core for the 4:30 dip.",
        "commonMistakeWarning": "Missing the sudden musical stop and sustained chord at 4:30.",
        "recommendedMoveSlugs": [
          "imp-pw-2",
          "int-pw-2",
          "beg-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Crisp bongo campana",
          "hipsAndKnees": "Acoustic piano montuno",
          "chestAndShoulders": "Spoken ad-libs 'Aprieta chamaquito'"
        },
        "bars": 13,
        "startsOnOne": true,
        "handGesture": "Setenta Complicado"
      },
      {
        "id": "baile-seg-10",
        "startTimeSeconds": 271,
        "endTimeSeconds": 279.5,
        "formattedRange": "4:31 - 4:39",
        "sectionName": "Rubato Piano Solo Break: ¡Vamo' Allá!",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "All percussion stops for an acoustic upright piano solo ending with the shout '¡Ay, ay, ay, vamo' allá!'",
        "leaderCue": "Hold your dip or slow-pose with your partner, breathe with the piano arpeggios, and prep for 4:39.5.",
        "followerCue": "Maintain balance and elegant arm lines during the piano solo, ready to explode on '¡Vamo' allá!'",
        "commonMistakeWarning": "Trying to keep stepping a basic when the percussion and bass have completely stopped.",
        "recommendedMoveSlugs": [
          "beg-mus-1"
        ],
        "timingMode": "Ambient (No Beat)",
        "instrumentMapping": {
          "feet": "Stillness and weight prep",
          "hipsAndKnees": "Slow weight transfer",
          "chestAndShoulders": "Upright piano solo melody"
        },
        "startsOnOne": false
      },
      {
        "id": "baile-seg-11",
        "startTimeSeconds": 279.5,
        "endTimeSeconds": 311.5,
        "formattedRange": "4:39 - 5:11",
        "sectionName": "Stage Montuno 1: Solo Con Usted",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Full band slams back in on the coro 'No, no te puedo olvidar' after '¡Vamo' allá!'",
        "leaderCue": "Explode back into Montana and Siete, then smooth out slightly on 'Solo con usted, yo bailo con usted'.",
        "followerCue": "Match the band's sudden drop with crisp footwork and active spotting through Montana and Siete.",
        "commonMistakeWarning": "Entering late after the rubato piano solo because you missed the '¡Vamo' allá!' cue.",
        "recommendedMoveSlugs": [
          "int-pw-1",
          "int-pw-3",
          "imp-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Full campana and timbal drive",
          "hipsAndKnees": "Double bass tumbao",
          "chestAndShoulders": "Coro and pregón 'Solo con usted'"
        },
        "bars": 13,
        "startsOnOne": true,
        "handGesture": "Montana"
      },
      {
        "id": "baile-seg-12",
        "startTimeSeconds": 311.5,
        "endTimeSeconds": 333,
        "formattedRange": "5:11 - 5:33",
        "sectionName": "Stage Pregón 2: Yo He Tenido Muchas Novias",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Bad Bunny sings 'Yo he tenido muchas novias, pero como tú ninguna' with trombone fills.",
        "leaderCue": "Combine Vacílala con la Mano and Coca-Cola, building momentum toward the final mambo at 5:33.",
        "followerCue": "Style your free arm during Vacílala con la Mano and ride the momentum of the Coca-Cola turn.",
        "commonMistakeWarning": "Running out of stamina right before the climax brass mambo hits at 5:33.",
        "recommendedMoveSlugs": [
          "imp-pw-3",
          "int-pw-4",
          "beg-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Conga and maraca groove",
          "hipsAndKnees": "Bass tumbao",
          "chestAndShoulders": "Trombone responses and vocals"
        },
        "bars": 9,
        "startsOnOne": true,
        "handGesture": "Coca-Cola"
      },
      {
        "id": "baile-seg-13",
        "startTimeSeconds": 333,
        "endTimeSeconds": 366,
        "formattedRange": "5:33 - 6:06",
        "sectionName": "Climax Brass Mambo, Conga Jam & Finale Coda",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Fiery brass mambo and conga/timbal jam erupt at 5:33, shifting into the syncopated brass coda at 5:54.5.",
        "leaderCue": "Go all out with solo shines and rumba-flavored body movement, then hit a final pose on the 6:05 chord.",
        "followerCue": "Unleash fast footwork and hip isolations with the conga slaps, freezing on the dramatic 6:05 brass hit.",
        "commonMistakeWarning": "Not adapting your footwork at 5:54.5 when the percussion shifts into the syncopated brass coda.",
        "recommendedMoveSlugs": [
          "beg-solo-1",
          "imp-solo-1",
          "adv-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Conga solo slaps and timbal",
          "hipsAndKnees": "Syncopated bass and piano",
          "chestAndShoulders": "Blazing trumpets and trombones"
        },
        "bars": 14,
        "startsOnOne": true
      },
      {
        "id": "baile-seg-14",
        "startTimeSeconds": 366,
        "endTimeSeconds": 379,
        "formattedRange": "6:06 - 6:19",
        "sectionName": "Studio Outro & Applause",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Concert applause fades into quiet dance studio chatter and distant background music.",
        "leaderCue": "Hold your final pose, thank your partner, and applaud the class.",
        "followerCue": "Smile, breathe out after the finale, and thank your partner.",
        "commonMistakeWarning": "Trying to dance to the faint background audio during the cinematic closing scene.",
        "recommendedMoveSlugs": [
          "beg-mus-1"
        ],
        "timingMode": "Ambient (No Beat)",
        "instrumentMapping": {
          "feet": "Rest",
          "hipsAndKnees": "Rest",
          "chestAndShoulders": "Natural breathing"
        },
        "startsOnOne": false
      }
    ]
  },
  // -----------------------------------------------------------------
  // "De La Timba a Pogolotti" - Pupy y Los Que Son Son
  // Timba • Intermediate • 104 BPM • 2-3 Son Clave • 345s
  // Video ID: gBh_lrPOpvQ • timings from the AI Studio song maker (fan upload by "Inversión En Fácil")
  // -----------------------------------------------------------------
  {
    "id": "de-la-timba-a-pogolotti",
    "title": "De La Timba a Pogolotti",
    "artist": "Pupy y Los Que Son Son",
    "style": "Timba",
    "bpm": 104,
    "claveType": "2-3 Son Clave",
    "difficultyLevel": "Intermediate",
    "durationSeconds": 345,
    "youtubeVideoId": "gBh_lrPOpvQ",
    "youtubeUrl": "https://www.youtube.com/watch?v=gBh_lrPOpvQ",
    "segments": [
      {
        "id": "pupy-seg-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 28,
        "formattedRange": "0:00 - 0:28",
        "sectionName": "Intro",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Piano and bass intro",
        "leaderCue": "Relaxed basic steps, establish connection and find the groove.",
        "followerCue": "Follow the smooth flow, keep steps light and grounded.",
        "commonMistakeWarning": "Rushing the beat before the vocals start.",
        "recommendedMoveSlugs": [
          "beg-pw-1",
          "beg-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Tumbao bass",
          "hipsAndKnees": "Guiro",
          "chestAndShoulders": "Piano montuno"
        }
      },
      {
        "id": "pupy-seg-2",
        "startTimeSeconds": 28,
        "endTimeSeconds": 45,
        "formattedRange": "0:28 - 0:45",
        "sectionName": "Verse 1",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Vocals 'Yo nací en la timba...'",
        "leaderCue": "Simple figures, focus on storytelling and musicality.",
        "followerCue": "Smooth styling, maintain frame and connection.",
        "commonMistakeWarning": "Overcomplicating figures during the verse.",
        "recommendedMoveSlugs": [
          "beg-pw-2",
          "beg-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Clave",
          "hipsAndKnees": "Congas",
          "chestAndShoulders": "Vocals"
        }
      },
      {
        "id": "pupy-seg-3",
        "startTimeSeconds": 45,
        "endTimeSeconds": 64,
        "formattedRange": "0:45 - 1:04",
        "sectionName": "Coro 1",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro 'Ven, ven, no te confundas...'",
        "leaderCue": "Increase energy, introduce dynamic turn patterns.",
        "followerCue": "Match the energy, sharp stops if led.",
        "commonMistakeWarning": "Not matching the increased energy of the coro.",
        "recommendedMoveSlugs": [
          "imp-pw-1",
          "imp-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana",
          "hipsAndKnees": "Congas",
          "chestAndShoulders": "Coro"
        }
      },
      {
        "id": "pupy-seg-4",
        "startTimeSeconds": 64,
        "endTimeSeconds": 81,
        "formattedRange": "1:04 - 1:21",
        "sectionName": "Mambo 1",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Brass section",
        "leaderCue": "Break apart, show your footwork and musicality.",
        "followerCue": "Express yourself with shines and body movement.",
        "commonMistakeWarning": "Staying in closed hold during the mambo.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Timbales",
          "hipsAndKnees": "Bass",
          "chestAndShoulders": "Brass"
        }
      },
      {
        "id": "pupy-seg-5",
        "startTimeSeconds": 81,
        "endTimeSeconds": 99,
        "formattedRange": "1:21 - 1:39",
        "sectionName": "Verse 2",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Vocals 'Entonces yo quiero darte...'",
        "leaderCue": "Reconnect, fluid and continuous figures.",
        "followerCue": "Smooth transition back to partner work.",
        "commonMistakeWarning": "Hesitating on the reconnection.",
        "recommendedMoveSlugs": [
          "imp-pw-4",
          "imp-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Clave",
          "hipsAndKnees": "Congas",
          "chestAndShoulders": "Vocals"
        }
      },
      {
        "id": "pupy-seg-6",
        "startTimeSeconds": 99,
        "endTimeSeconds": 153,
        "formattedRange": "1:39 - 2:33",
        "sectionName": "Coro & Pregones",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro 'Ven, ven, no te confundas...'",
        "leaderCue": "High energy, use the full space, complex knots.",
        "followerCue": "Dynamic styling, strong frame, sharp spins.",
        "commonMistakeWarning": "Losing timing during complex patterns.",
        "recommendedMoveSlugs": [
          "int-pw-2",
          "int-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana",
          "hipsAndKnees": "Congas",
          "chestAndShoulders": "Coro"
        }
      },
      {
        "id": "pupy-seg-7",
        "startTimeSeconds": 153,
        "endTimeSeconds": 171,
        "formattedRange": "2:33 - 2:51",
        "sectionName": "Mambo 2",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Brass section",
        "leaderCue": "Separate for shines, interact playfully.",
        "followerCue": "Playful footwork, engage with your partner.",
        "commonMistakeWarning": "Ignoring your partner while doing shines.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Timbales",
          "hipsAndKnees": "Bass",
          "chestAndShoulders": "Brass"
        }
      },
      {
        "id": "pupy-seg-8",
        "startTimeSeconds": 171,
        "endTimeSeconds": 189,
        "formattedRange": "2:51 - 3:09",
        "sectionName": "Pregón",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Vocals 'Se me hierve la sangre...'",
        "leaderCue": "Back to partner work, keep the flow going.",
        "followerCue": "Maintain momentum, responsive styling.",
        "commonMistakeWarning": "Dropping the energy level.",
        "recommendedMoveSlugs": [
          "imp-pw-2",
          "imp-pw-6"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Clave",
          "hipsAndKnees": "Congas",
          "chestAndShoulders": "Vocals"
        }
      },
      {
        "id": "pupy-seg-9",
        "startTimeSeconds": 189,
        "endTimeSeconds": 214,
        "formattedRange": "3:09 - 3:34",
        "sectionName": "Montuno 1",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Coro 'Yo te pongo y tú tocas...'",
        "leaderCue": "Open up, body isolations, playful interaction.",
        "followerCue": "Hips and shoulders, express the rhythm.",
        "commonMistakeWarning": "Being too stiff during the rhythmic section.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bass",
          "hipsAndKnees": "Congas",
          "chestAndShoulders": "Coro"
        }
      },
      {
        "id": "pupy-seg-10",
        "startTimeSeconds": 214,
        "endTimeSeconds": 233,
        "formattedRange": "3:34 - 3:53",
        "sectionName": "Montuno 2",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Coro 'Que me dice ven...'",
        "leaderCue": "Reconnect for dynamic turn patterns.",
        "followerCue": "Sharp turns, maintain connection.",
        "commonMistakeWarning": "Losing the beat during the transition.",
        "recommendedMoveSlugs": [
          "adv-pw-1",
          "adv-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana",
          "hipsAndKnees": "Congas",
          "chestAndShoulders": "Coro"
        }
      },
      {
        "id": "pupy-seg-11",
        "startTimeSeconds": 233,
        "endTimeSeconds": 253,
        "formattedRange": "3:53 - 4:13",
        "sectionName": "Montuno 3",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Coro 'Yo te pongo y tú tocas...'",
        "leaderCue": "Break apart again, high energy body movement.",
        "followerCue": "Tembleque, full body expression.",
        "commonMistakeWarning": "Holding back on the energy.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Bass",
          "hipsAndKnees": "Congas",
          "chestAndShoulders": "Coro"
        }
      },
      {
        "id": "pupy-seg-12",
        "startTimeSeconds": 253,
        "endTimeSeconds": 293,
        "formattedRange": "4:13 - 4:53",
        "sectionName": "Montuno Pregones",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Vocals 'La gente a mí me pregunta...'",
        "leaderCue": "Continuous flow, complex figures.",
        "followerCue": "Fluid movement, strong frame.",
        "commonMistakeWarning": "Tensing up arms during fast turns.",
        "recommendedMoveSlugs": [
          "int-pw-1",
          "int-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Campana",
          "hipsAndKnees": "Congas",
          "chestAndShoulders": "Vocals"
        }
      },
      {
        "id": "pupy-seg-13",
        "startTimeSeconds": 293,
        "endTimeSeconds": 345,
        "formattedRange": "4:53 - 5:45",
        "sectionName": "Outro",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Coro 'Yo te pongo y tú tocas...' fading out",
        "leaderCue": "Final shines, hit the breaks, wind down.",
        "followerCue": "Big finish, pose on the final beat.",
        "commonMistakeWarning": "Missing the final musical accents.",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "Timbales",
          "hipsAndKnees": "Bass",
          "chestAndShoulders": "Brass"
        }
      }
    ]
  },
  // -----------------------------------------------------------------
  // "Temba, Tumba, Timba" - Los Van Van
  // Timba • Intermediate • 102 BPM • 2-3 Son Clave • 296s
  // Video ID: EGabg9DgBPU • timings from Argus
  // AI Studio song maker 2026-10-31 (starts are a 102 BPM bar grid from 0:11.5). Ear-check first: 2:46.8 (another run heard 2:43), 3:38.6 (other run 3:29), 4:11.5 (could be 4:09-4:13).
  // -----------------------------------------------------------------
  {
    "id": "temba-tumba-timba",
    "title": "Temba, Tumba, Timba",
    "artist": "Los Van Van",
    "style": "Timba",
    "bpm": 102,
    "claveType": "2-3 Son Clave",
    "difficultyLevel": "Intermediate",
    "durationSeconds": 296,
    "youtubeVideoId": "EGabg9DgBPU",
    "youtubeUrl": "https://www.youtube.com/watch?v=EGabg9DgBPU",
    "segments": [
      {
        "id": "vanvan-ttt-1",
        "startTimeSeconds": 0,
        "endTimeSeconds": 11.5,
        "formattedRange": "0:00 - 0:11",
        "sectionName": "Intro (Oye!)",
        "danceGear": "Wait / Breathe",
        "colorTheme": "slate",
        "musicalTrigger": "Talking intro 'Oye! Temba, tumba, timba...' leading into a drum fill",
        "leaderCue": "Stand relaxed, wait for the talking to end and the groove to drop in",
        "followerCue": "Listen to the speech, find your balance and prepare your frame",
        "commonMistakeWarning": "Starting to dance before the actual downbeat hits at the end of the intro",
        "recommendedMoveSlugs": [
          "beg-mus-1"
        ],
        "timingMode": "Ambient (No Beat)",
        "instrumentMapping": {
          "feet": "timbal accents",
          "hipsAndKnees": "vocal rhythm",
          "chestAndShoulders": "breathing"
        },
        "bars": 5,
        "startsOnOne": false
      },
      {
        "id": "vanvan-ttt-2",
        "startTimeSeconds": 11.5,
        "endTimeSeconds": 30.3,
        "formattedRange": "0:11 - 0:30",
        "sectionName": "Tema 1 (Voy a hacerte...)",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Vocals start the story: 'Voy a hacerte una versión...'",
        "leaderCue": "Ease into the dance with soft basics like Paséala and Dile Que No",
        "followerCue": "Keep steps small and smooth, matching the storytelling vibe of the singer",
        "commonMistakeWarning": "Dancing too aggressively; keep it conversational and relaxed here",
        "recommendedMoveSlugs": [
          "beg-pw-1",
          "imp-pw-6"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "conga tumbao",
          "hipsAndKnees": "bass tumbao",
          "chestAndShoulders": "vocals"
        },
        "bars": 8,
        "startsOnOne": true
      },
      {
        "id": "vanvan-ttt-3",
        "startTimeSeconds": 30.3,
        "endTimeSeconds": 49.1,
        "formattedRange": "0:30 - 0:49",
        "sectionName": "Coro 1 (Temba tumba y timba)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Chorus hits for the first time: 'Temba, tumba y timba...'",
        "leaderCue": "Increase the energy, use Setenta and continuous flowing turn patterns",
        "followerCue": "Spot sharply on your turns and extend your free arm lines to the music",
        "commonMistakeWarning": "Losing your frame tension when the musical energy goes up",
        "recommendedMoveSlugs": [
          "imp-pw-1",
          "int-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "campana",
          "hipsAndKnees": "bass",
          "chestAndShoulders": "coro"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Setenta"
      },
      {
        "id": "vanvan-ttt-4",
        "startTimeSeconds": 49.1,
        "endTimeSeconds": 77.4,
        "formattedRange": "0:49 - 1:17",
        "sectionName": "Tema 2 (Asi fue...)",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Verse returns to the story: 'Asi fue, tremendo lio...'",
        "leaderCue": "Bring the energy back down, smooth out the moves with Sombrero",
        "followerCue": "Breathe, reconnect with your partner, and relax your styling",
        "commonMistakeWarning": "Ignoring the drop in intensity and rushing the moves",
        "recommendedMoveSlugs": [
          "imp-pw-4",
          "imp-pw-3"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "conga slaps",
          "hipsAndKnees": "bass tumbao",
          "chestAndShoulders": "vocals"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Sombrero"
      },
      {
        "id": "vanvan-ttt-5",
        "startTimeSeconds": 77.4,
        "endTimeSeconds": 96.2,
        "formattedRange": "1:17 - 1:36",
        "sectionName": "Coro 2 (Temba tumba y timba)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Chorus returns: 'Temba, tumba y timba...'",
        "leaderCue": "Open up the slot with Enchufla Doble and playful dynamic changes",
        "followerCue": "Engage your core for quick changes of direction on the double turns",
        "commonMistakeWarning": "Stepping too wide; keep your steps directly under your center",
        "recommendedMoveSlugs": [
          "beg-pw-3",
          "imp-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "campana",
          "hipsAndKnees": "conga tumbao",
          "chestAndShoulders": "coro"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Enchufla Doble"
      },
      {
        "id": "vanvan-ttt-6",
        "startTimeSeconds": 96.2,
        "endTimeSeconds": 124.5,
        "formattedRange": "1:36 - 2:04",
        "sectionName": "Tema 3 (Ay nada mas...)",
        "danceGear": "Casino (Smooth)",
        "colorTheme": "emerald",
        "musicalTrigger": "Verse starts again: 'Ay nada mas que se formo la corredera...'",
        "leaderCue": "Smooth Paséala and Dedo, listen to the ongoing narrative",
        "followerCue": "Maintain a light, responsive connection in closed hold",
        "commonMistakeWarning": "Anticipating the next move instead of following the soft lead",
        "recommendedMoveSlugs": [
          "imp-pw-6",
          "int-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "guiro",
          "hipsAndKnees": "bass",
          "chestAndShoulders": "vocals"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "Dedo"
      },
      {
        "id": "vanvan-ttt-7",
        "startTimeSeconds": 124.5,
        "endTimeSeconds": 143.3,
        "formattedRange": "2:04 - 2:23",
        "sectionName": "Coro 3 (Temba tumba y timba)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Chorus is back: 'Temba, tumba y timba...'",
        "leaderCue": "Build the flow, chain Siete into a smooth Dile Que No",
        "followerCue": "Use the rotational momentum to style your basic steps beautifully",
        "commonMistakeWarning": "Disconnecting visually from your partner during the turns",
        "recommendedMoveSlugs": [
          "int-pw-3",
          "beg-pw-2"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "campana",
          "hipsAndKnees": "bass",
          "chestAndShoulders": "coro"
        },
        "bars": 8,
        "startsOnOne": true,
        "handGesture": "Siete"
      },
      {
        "id": "vanvan-ttt-8",
        "startTimeSeconds": 143.3,
        "endTimeSeconds": 166.8,
        "formattedRange": "2:23 - 2:46",
        "sectionName": "Montuno 1 (La de Brasil)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Pregón calls: 'La de Brasil...'",
        "leaderCue": "Keep it flowing, add Montana and focus on the musicality of the track",
        "followerCue": "Play with your shoulder movement matching the faster vocal phrases",
        "commonMistakeWarning": "Rushing the beat during the lively pregones",
        "recommendedMoveSlugs": [
          "int-pw-1",
          "imp-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "piano montuno",
          "hipsAndKnees": "bass",
          "chestAndShoulders": "timbal cáscara"
        },
        "bars": 10,
        "startsOnOne": true,
        "handGesture": "Montana"
      },
      {
        "id": "vanvan-ttt-9",
        "startTimeSeconds": 166.8,
        "endTimeSeconds": 190.4,
        "formattedRange": "2:46 - 3:10",
        "sectionName": "Montuno 2 (Y ahora me pide...)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "New coro enters: 'Y ahora me pide la temba de tumba...'",
        "leaderCue": "High energy casino, use complex variations like Setenta Complicado",
        "followerCue": "Stay grounded, executing quick footwork during complex turn patterns",
        "commonMistakeWarning": "Losing your balance by stepping too large on complex turns",
        "recommendedMoveSlugs": [
          "imp-pw-2",
          "int-pw-4"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "campana",
          "hipsAndKnees": "piano montuno",
          "chestAndShoulders": "coro"
        },
        "bars": 10,
        "startsOnOne": true,
        "handGesture": "Setenta Complicado"
      },
      {
        "id": "vanvan-ttt-10",
        "startTimeSeconds": 190.4,
        "endTimeSeconds": 218.6,
        "formattedRange": "3:10 - 3:38",
        "sectionName": "Montuno 3 (Llego el doctor)",
        "danceGear": "Casino (Flow)",
        "colorTheme": "emerald",
        "musicalTrigger": "Pregón announces: 'Y en eso llego el doctor...'",
        "leaderCue": "Dynamic flow, try El Uno or El Dos to match the rhythmic drive",
        "followerCue": "Sharp spotting on your turns and active free arm styling",
        "commonMistakeWarning": "Tensing the arms instead of keeping a flexible frame",
        "recommendedMoveSlugs": [
          "int-pw-2",
          "beg-pw-5"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "timbal bell",
          "hipsAndKnees": "bass tumbao",
          "chestAndShoulders": "brass hits"
        },
        "bars": 12,
        "startsOnOne": true,
        "handGesture": "El Uno"
      },
      {
        "id": "vanvan-ttt-11",
        "startTimeSeconds": 218.6,
        "endTimeSeconds": 251.5,
        "formattedRange": "3:38 - 4:11",
        "sectionName": "Bomba (La gente que anoche)",
        "danceGear": "Despelote / Reparto",
        "colorTheme": "red",
        "musicalTrigger": "Bass drops to bomba gear, coro: 'La gente que anoche no durmio...'",
        "leaderCue": "Break apart, hit some body isolations and tembleque to the bass drops",
        "followerCue": "Full body movement, roll your chest and hips to the heavy bass accents",
        "commonMistakeWarning": "Continuing standard casino instead of breaking away for timba despelote",
        "recommendedMoveSlugs": [
          "int-solo-1",
          "adv-solo-1"
        ],
        "timingMode": "Syncopated Reparto",
        "instrumentMapping": {
          "feet": "conga slaps",
          "hipsAndKnees": "bass drum",
          "chestAndShoulders": "coro"
        },
        "bars": 14,
        "startsOnOne": true
      },
      {
        "id": "vanvan-ttt-12",
        "startTimeSeconds": 251.5,
        "endTimeSeconds": 296,
        "formattedRange": "4:11 - 4:56",
        "sectionName": "Mambo Final",
        "danceGear": "Suelta / Shines",
        "colorTheme": "purple",
        "musicalTrigger": "Brass mambo section kicks in powerfully with a shout",
        "leaderCue": "Solo footwork, shine with syncopated steps until the song fades out completely",
        "followerCue": "Express the aggressive brass lines with sharp shines and arm strikes",
        "commonMistakeWarning": "Standing still instead of engaging in solo play during the instrumental climax",
        "recommendedMoveSlugs": [
          "imp-solo-1",
          "int-mus-1"
        ],
        "timingMode": "A Tiempo (On1)",
        "instrumentMapping": {
          "feet": "brass section",
          "hipsAndKnees": "bass",
          "chestAndShoulders": "timbal accents"
        },
        "bars": 19,
        "startsOnOne": true
      }
    ]
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

// Lives with the curriculum so the player can resolve moves without bundling every song
export { resolveCurriculumMove } from "./cuban-curriculum-2027";

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
