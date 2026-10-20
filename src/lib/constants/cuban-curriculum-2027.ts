import { z } from "zod";
import { DanceLevel } from "@prisma/client";

// ==========================================
// 1. ZOD SCHEMAS & TYPES
// ==========================================

export const CurriculumLevelSchema = z.enum([
  "Beginner",
  "Improver",
  "Intermediate",
  "Advanced",
]);
export type CurriculumLevel = z.infer<typeof CurriculumLevelSchema>;

export const CurriculumPillarSchema = z.enum([
  "partnerwork_casino",
  "solo_suelta",
  "sub_styles_gears",
  "musicality",
  "reference_songs",
]);
export type CurriculumPillar = z.infer<typeof CurriculumPillarSchema>;

export const CurriculumSkillItemSchema = z.object({
  id: z.string(),
  level: CurriculumLevelSchema,
  pillar: CurriculumPillarSchema,
  name: z.string(),
  aliases: z.array(z.string()).optional(),
  phonetic: z.string().optional(),
  summary: z.string(),
  entryExitGeometry: z.string().optional(),
  handholdType: z.string().optional(),
  unConfuserTip: z.string(),
  claveSync: z.string().optional(),
});
export type CurriculumSkillItem = z.infer<typeof CurriculumSkillItemSchema>;

export const DanceGearShiftSchema = z.object({
  gearNumber: z.number(),
  gearName: z.string(),
  rhythmStyle: z.string(),
  musicalTiming: z.string(),
  whenToShift: z.string(),
  bodyBiomechanics: z.string(),
  unConfuserTip: z.string(),
});
export type DanceGearShift = z.infer<typeof DanceGearShiftSchema>;

export const TimbaSongPhaseSchema = z.object({
  phase: z.enum(["Tema", "Montuno", "Mambo", "Bomba/Presión"]),
  title: z.string(),
  musicalEnergy: z.string(),
  instrumentsActive: z.string(),
  dancerFocus: z.string(),
  recommendedGear: z.string(),
});
export type TimbaSongPhase = z.infer<typeof TimbaSongPhaseSchema>;

export const CurriculumReferenceSongSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  bpm: z.number(),
  level: CurriculumLevelSchema,
  subGenre: z.string(),
  whyThisSong: z.string(),
  gearShiftsObserved: z.array(z.string()),
  instrumentsToListenFor: z.array(z.string()),
  spotifySearchUrl: z.string(),
});
export type CurriculumReferenceSong = z.infer<typeof CurriculumReferenceSongSchema>;

// Helper mapping to Prisma DanceLevel enum
export const CURRICULUM_TO_PRISMA_LEVEL_MAP: Record<CurriculumLevel, DanceLevel> = {
  Beginner: DanceLevel.BEGINNER,
  Improver: DanceLevel.IMPROVER,
  Intermediate: DanceLevel.INTERMEDIATE,
  Advanced: DanceLevel.ADVANCED,
};

export const PILLAR_LABELS: Record<CurriculumPillar, string> = {
  partnerwork_casino: "Partnerwork (Casino)",
  solo_suelta: "Solo Footwork & Shines",
  sub_styles_gears: "Sub-Styles & Cuban Gears",
  musicality: "Musicality & Clave Timing",
  reference_songs: "Reference Songs",
};

// ==========================================
// 2. TIMBA 4-PHASE SONG ANATOMY
// ==========================================

export const TIMBA_SONG_PHASES: TimbaSongPhase[] = [
  {
    phase: "Tema",
    title: "1. The Opening Verse (Cuerpo / Tema)",
    musicalEnergy: "Low to Moderate • Melodic & Narrative",
    instrumentsActive: "Acoustic Piano, Bass, Conga Tumbao, Lead Vocals (No Cowbell yet)",
    dancerFocus: "Connect with your partner, establish weight transfer, dance calm Casino or Son Cubano.",
    recommendedGear: "Gear 1 (Son On2) or relaxed Gear 2 (Casino Guapea On1)",
  },
  {
    phase: "Montuno",
    title: "2. The Call & Response (El Montuno)",
    musicalEnergy: "Moderate to High • Driving Groove",
    instrumentsActive: "Campana (Cowbell) enters on 1-3-5-7, Coro vocal response, active horns",
    dancerFocus: "Shift to full circular Casino partnerwork, Rueda de Casino calls, and clear arm pretzels.",
    recommendedGear: "Gear 2 (Casino Partnerwork: Enchufla, Setenta, Vacilala)",
  },
  {
    phase: "Mambo",
    title: "3. The Horn Breakdown (El Mambo)",
    musicalEnergy: "High Voltage • Rhythmic Climax",
    instrumentsActive: "Explosive Brass horn riffs (Trumpets/Trombones) interlocked with piano tumbaos",
    dancerFocus: "Break apart into Suelta shines, dynamic footwork breaks, or Rumba Guaguancó play.",
    recommendedGear: "Gear 3 (Rumba Guaguancó) or Gear 2 Suelta Breakaway Shines",
  },
  {
    phase: "Bomba/Presión",
    title: "4. The Bass Drop & Street Explosion (La Bomba / Presión)",
    musicalEnergy: "Maximum Euphoria • Raw Street Power",
    instrumentsActive: "Piano cuts out or plays pedal stabs, Bass plays heavy sliding slides, Timbales crash",
    dancerFocus: "STOP big arm turns immediately! Drop your center of gravity into Despelote, Tembleque, or Reparto.",
    recommendedGear: "Gear 4 (Afro Orishas) & Gear 5 (Reparto / Despelote / Tembleque)",
  },
];

// ==========================================
// 3. THE 5 CUBAN DANCE GEARS COMPARISON MATRIX
// ==========================================

export const CUBAN_DANCE_GEARS: DanceGearShift[] = [
  {
    gearNumber: 1,
    gearName: "Son Cubano",
    rhythmStyle: "Contratiempo Elegance",
    musicalTiming: "On2 Contratiempo (Steps on counts 2-3-4, 6-7-8)",
    whenToShift: "During the opening Tema, slow romantic sections, or acoustic bass/tres intros.",
    bodyBiomechanics: "Upright Cuban salon posture, subtle delayed weight shift on beat 2, minimal arm flailing.",
    unConfuserTip: "Never rush into count 1 when the song is in Son tempo. Wait for the bongo martillo accent on count 2.",
  },
  {
    gearNumber: 2,
    gearName: "Casino (Cuban Salsa)",
    rhythmStyle: "Circular Partnerwork Flow",
    musicalTiming: "On1 A Tiempo (Steps on 1-2-3, 5-6-7)",
    whenToShift: "When the cowbell (campana) locks into the Montuno and the Coro starts singing.",
    bodyBiomechanics: "Circular geometry around a central vortex, constant elastic spring in arms (Guapea push-pull), continuous stepping.",
    unConfuserTip: "Casino is circular, NOT linear like Cross-Body LA/NY salsa. Walk around the circumference of the circle rather than pulling your partner back-and-forth.",
  },
  {
    gearNumber: 3,
    gearName: "Rumba (Guaguancó & Columbia)",
    rhythmStyle: "Playful Flirtation & Acrobatics",
    musicalTiming: "Rumba Clave (3-2 or 2-3) with earthy polyrhythmic syncopation",
    whenToShift: "During brass pauses, percussion breaks, or when the singer quotes traditional rumba rumbas.",
    bodyBiomechanics: "Low stance, flexible knees, fluid chest undulations, lead attempts playful Vacunao pelvic flick; follow blocks with skirt/pañuelo.",
    unConfuserTip: "Never stay in tight closed partnerwork during a Rumba breakdown. Release your hold into a solo breakaway circle.",
  },
  {
    gearNumber: 4,
    gearName: "Afro-Cuban Orishas",
    rhythmStyle: "Sacred Earth Grounding",
    musicalTiming: "6/8 Poly-meter over Timba 4/4 meter",
    whenToShift: "When Batá drums or Santería deity chants (Eleguá, Yemayá, Oggún, Changó, Ochún) are invoked.",
    bodyBiomechanics: "Deep knee bend, grounded connection to the earth, torso articulation matching the deity (e.g. Changó thunder axes, Yemayá ocean waves).",
    unConfuserTip: "Do not dance modern hip-hop bounce during Afro breaks. Channel the specific energy and gesture of the deity called in the lyric.",
  },
  {
    gearNumber: 5,
    gearName: "Reparto / Timba Fusion",
    rhythmStyle: "Urban Havana Street Explosion",
    musicalTiming: "Heavy syncopated dembow/timba bass drops (La Bomba)",
    whenToShift: "When the band strips the melody down to raw drums, heavy bass, and the singer shouts '¡Presión!' or '¡Bomba!'.",
    bodyBiomechanics: "Explosive foot slides, rapid pelvic/ribcage dissociation (Despelote), high-frequency torso vibration (Tembleque).",
    unConfuserTip: "The #1 mistake is trying to lead a complicated arm turn (like Setenta or Montana) during Bomba. It breaks partner connection and looks disconnected from the music.",
  },
];

// ==========================================
// 4. THE 4-LEVEL × 5-PILLAR CURRICULUM DATASET
// ==========================================

export const CUBAN_CURRICULUM_DATA: CurriculumSkillItem[] = [
  // ----------------------------------------------------
  // LEVEL 1: BEGINNER (Foundational Cuban Mechanics)
  // ----------------------------------------------------
  {
    id: "beg-pw-1",
    level: "Beginner",
    pillar: "partnerwork_casino",
    name: "Guapea",
    aliases: ["Cuban Push-Pull Basic"],
    phonetic: "Gwah-PEH-ah",
    summary: "The foundational open-position dance step in Casino. Leads and Follows step backward on 1-2-3 and push gently forward on 5-6-7.",
    entryExitGeometry: "Circular open hold • Step back on count 1, gentle palm-to-palm compression on count 3, release on count 5.",
    handholdType: "Single or double open palm-to-palm hold at solar plexus height.",
    unConfuserTip: "Do NOT grip your partner's fingers like hooks. Keep open palms with gentle resistance—like pressing against a swimming pool wave.",
    claveSync: "Step back on 1, palm touch on 3, neutralize on 5-6-7.",
  },
  {
    id: "beg-pw-2",
    level: "Beginner",
    pillar: "partnerwork_casino",
    name: "Dile Que No",
    aliases: ["Tell Her No", "Cross-Body Circular Transition"],
    phonetic: "DEE-leh keh NOH",
    summary: "The master transition in Casino that guides the follow across the lead from closed position back into open Guapea.",
    entryExitGeometry: "Circular promenade from closed frame to open circle circumference.",
    handholdType: "Closed Cuban frame (Lead right hand on Follow left shoulder blade) opening to single left-to-right handhold.",
    unConfuserTip: "Do not pull the follower in a straight linear slot. Lead her around your body in an arc—she moves counter-clockwise while you pivot clockwise.",
    claveSync: "Prep on 1, step across on 3, open into Guapea on 5-6-7.",
  },
  {
    id: "beg-pw-3",
    level: "Beginner",
    pillar: "partnerwork_casino",
    name: "Enchufla (Simple & Doble)",
    aliases: ["Enchufe", "Inside Underarm Pivot"],
    phonetic: "En-CHOO-flah",
    summary: "The gateway figure to 80% of Casino turn patterns. Follow turns under lead's left arm as partners trade positions.",
    entryExitGeometry: "Circular inside pivot trading positions on the perimeter.",
    handholdType: "Lead left hand holding Follow right hand at temple height.",
    unConfuserTip: "Leads: Never pull the follower forward on count 1. Step backward with your left foot on count 1 to give her space to walk inside on count 2-3.",
    claveSync: "Lead steps back on 1, Follow inside turn on 2-3, trade places on 5-6-7.",
  },
  {
    id: "beg-pw-4",
    level: "Beginner",
    pillar: "partnerwork_casino",
    name: "Prima (Adiós)",
    aliases: ["The Cousin", "Adiós"],
    phonetic: "PREE-mah",
    summary: "Essential underarm walk-around turn where lead guides follower into a gentle behind-the-back rotation.",
    entryExitGeometry: "Perimeter loop with lead following follower's trajectory.",
    handholdType: "Single left-to-right loose wrist connection.",
    unConfuserTip: "Followers: Keep your left hand raised near your collarbone ready to reconnect with the lead on count 5.",
    claveSync: "Turn on 1-2-3, walk behind on 5-6-7.",
  },
  {
    id: "beg-pw-5",
    level: "Beginner",
    pillar: "partnerwork_casino",
    name: "Exhíbela (Sacala)",
    aliases: ["Show Her Off", "Sacala"],
    phonetic: "Eks-HEE-beh-lah",
    summary: "A crisp right-hand outside turn showcasing the follower while lead pivots into closed frame.",
    entryExitGeometry: "Outside circular rotation concluding in Cuban closed hold.",
    handholdType: "High right-hand framing arch.",
    unConfuserTip: "Leads: Do not wrench the follow's arm overhead. Create an arch like a doorway and let her step through under her own balance.",
    claveSync: "Prep on 1, turn on 2-3, catch frame on 5-6-7.",
  },
  {
    id: "beg-solo-1",
    level: "Beginner",
    pillar: "solo_suelta",
    name: "Paso Básico, Lateral y Atrás",
    aliases: ["Three Cuban Basics"],
    phonetic: "PAH-soh BAH-see-koh",
    summary: "Mastery of the 3 fundamental Cuban solo steps: forward/back basic, side lateral step, and open back cross-step.",
    unConfuserTip: "Never jump or bounce on your toes. In Cuban salsa, your feet kiss the floor smoothly—weight is transferred into the heel/midfoot on every beat.",
    claveSync: "Steps land on 1-2-3 (pause 4), 5-6-7 (pause 8).",
  },
  {
    id: "beg-sub-1",
    level: "Beginner",
    pillar: "sub_styles_gears",
    name: "Rueda de Casino Level 1 Essentials",
    aliases: ["Dame, Fly, Un Tarro"],
    summary: "The foundational group circle commands: partner change (Dame), syncopated clap overhead (Fly), and single-direction arm hook (Un Tarro).",
    unConfuserTip: "Always watch the Cantante (caller). If you miss the call, continue your Guapea on time—never freeze in the middle of the circle!",
  },
  {
    id: "beg-mus-1",
    level: "Beginner",
    pillar: "musicality",
    name: "Finding Beat 1 & Conga Tumbao",
    summary: "Training your ear to hear the low open tones (slap-open-open) of the Conga drum and locking your step 1 to the downbeat.",
    unConfuserTip: "Listen for the deep bass drop and trumpet entry. If you are lost, count aloud: '1-2-3... 5-6-7...' until your body locks in.",
  },

  // ----------------------------------------------------
  // LEVEL 2: IMPROVER (Pretzels, Vacilala & Contratiempo)
  // ----------------------------------------------------
  {
    id: "imp-pw-1",
    level: "Improver",
    pillar: "partnerwork_casino",
    name: "Setenta (70)",
    aliases: ["Classic 70", "The Cuban Pretzel"],
    phonetic: "Seh-TEN-tah",
    summary: "The world-famous signature Cuban figure featuring an inside follow turn, lead duck-under, and intricate hammerlock arm wrap.",
    entryExitGeometry: "Double-hand circular weave around a central pivot.",
    handholdType: "Double crossed hands (right-to-right on top, left-to-left underneath).",
    unConfuserTip: "Common Mistake: Pulling with biceps during the wrap. Keep wrists loose and walk smoothly around your partner's right shoulder.",
    claveSync: "Prep on 1, follow inside turn 2-3, lead turns under on 5-6-7, unwind on second 1-2-3.",
  },
  {
    id: "imp-pw-2",
    level: "Improver",
    pillar: "partnerwork_casino",
    name: "Setenta Complicado",
    aliases: ["70 with Shoulder Catch"],
    phonetic: "Seh-TEN-tah Kom-plee-KAH-doh",
    summary: "Extended Setenta adding a neck draping loop, wrist tap, and double counter-clockwise turn exit.",
    entryExitGeometry: "Continuous multi-bar circular pretzel with neck wrap.",
    handholdType: "Double hand connection transitioning through neck slide.",
    unConfuserTip: "Leads: Avoid tight fingers around follow's neck. Slide open palms softly over her shoulders without pressing down.",
  },
  {
    id: "imp-pw-3",
    level: "Improver",
    pillar: "partnerwork_casino",
    name: "Vacílala & Vacílala con la Mano",
    aliases: ["Free Outside Spin"],
    phonetic: "Vah-SEE-lah-lah",
    summary: "The definitive Cuban outside free spin guided by lead's subtle hand release, leaving follower to complete a solo 360-degree pivot.",
    entryExitGeometry: "Outside follow spin with lead circling to catch on count 5.",
    handholdType: "Fingertip flick transitioning to catch on shoulder blade.",
    unConfuserTip: "Followers: Keep your eyes on the lead as long as possible before spotting the turn. Do not drift away from the circle perimeter.",
  },
  {
    id: "imp-pw-4",
    level: "Improver",
    pillar: "partnerwork_casino",
    name: "Sombrero",
    aliases: ["The Cuban Hat"],
    phonetic: "Sohm-BREH-roh",
    summary: "Double-hand inside rotation where arms rise simultaneously and drape gracefully over both partners' shoulders.",
    entryExitGeometry: "Circular canopy arch dropping into shoulder drapery.",
    handholdType: "Parallel double-hand hold.",
    unConfuserTip: "Lift both hands high on count 3 so the follower doesn't have to duck her head awkwardly. Drape gently on count 5.",
  },
  {
    id: "imp-pw-5",
    level: "Improver",
    pillar: "partnerwork_casino",
    name: "Kentucky",
    phonetic: "Ken-TUH-kee",
    summary: "High-energy combination featuring hand release, waist latch, duck-under hook, and tap-step pivot.",
    entryExitGeometry: "Mid-level duck-under with waist pivot.",
    handholdType: "Right-to-right handhold switching to waist tap.",
    unConfuserTip: "Bend your knees to duck under the arm—never bend your spine at a 90-degree angle.",
  },
  {
    id: "imp-pw-6",
    level: "Improver",
    pillar: "partnerwork_casino",
    name: "Paséala (con Falda)",
    aliases: ["Walk Her Out"],
    phonetic: "Pah-SEH-ah-lah",
    summary: "Stately forward promenade where lead and follow walk side-by-side in closed/open hold showcasing musicality.",
    entryExitGeometry: "Circular promenade walking counter-clockwise.",
    handholdType: "Side-by-side waist connection.",
    unConfuserTip: "Followers can pick up their skirt (falda) on count 1 to match traditional Havana styling.",
  },
  {
    id: "imp-solo-1",
    level: "Improver",
    pillar: "solo_suelta",
    name: "Rumba Guaguancó Basics & Vacunao Defense",
    summary: "Introductory Rumba footwork, pelvic weight shift, and the classic cat-and-mouse Vacunao gesture and skirt/hand defense.",
    unConfuserTip: "Vacunao is playful and theatrical, never aggressive. Follows defend with a relaxed cover gesture using hand or dress.",
  },
  {
    id: "imp-sub-1",
    level: "Improver",
    pillar: "sub_styles_gears",
    name: "Son Cubano Contratiempo Intro (On2)",
    summary: "Stepping on counts 2-3-4 and 6-7-8 to traditional Son music, mastering the delayed pause on count 1.",
    unConfuserTip: "Wait for beat 2! The most common mistake is hearing beat 1 and immediately stepping. Hold your weight on beat 1.",
  },
  {
    id: "imp-mus-1",
    level: "Improver",
    pillar: "musicality",
    name: "Son Clave Direction (2-3 vs 3-2)",
    summary: "Identifying whether the two-beat syncopation comes first (2-3) or the three-beat syncopation comes first (3-2).",
    unConfuserTip: "The 3-side has the syncopated 'ponche' beat on 4. The 2-side feels grounded and steady on counts 2 and 3.",
  },

  // ----------------------------------------------------
  // LEVEL 3: INTERMEDIATE (Orishas, Montana, Siete & Timba Anatomy)
  // ----------------------------------------------------
  {
    id: "int-pw-1",
    level: "Intermediate",
    pillar: "partnerwork_casino",
    name: "Montana (Mountain)",
    phonetic: "Mon-TAHN-yah",
    summary: "Signature double-arm figure creating peaked triangles overhead before transitioning into an Enchufla hook exit.",
    entryExitGeometry: "High apex triangles over partners' heads.",
    handholdType: "Double handhold with arched wrists.",
    unConfuserTip: "Keep hand arches directly over the crown of the head. Tilting forward traps your partner's hair.",
  },
  {
    id: "int-pw-2",
    level: "Intermediate",
    pillar: "partnerwork_casino",
    name: "Dedo, El Uno & El Dos",
    phonetic: "DEH-doh",
    summary: "Classic Havana complex sequences where lead hooks index finger around follow's hand, combining spins and wraps.",
    entryExitGeometry: "Multi-layered circular arm wraps with fingertip hooks.",
    handholdType: "Index finger lock (Dedo) requiring gentle wrist flexibility.",
    unConfuserTip: "Never clamp down with your thumb. The finger hook should slide freely like a carabiner.",
  },
  {
    id: "int-pw-3",
    level: "Intermediate",
    pillar: "partnerwork_casino",
    name: "Siete & Siete Loco",
    phonetic: "see-EH-teh",
    summary: "Complex wrap on count 7 with reverse unwind, transitioning into Siete Loco with a fast waist roll.",
    entryExitGeometry: "Rapid counter-rotational unwind.",
    handholdType: "Behind-the-back hand transfer.",
    unConfuserTip: "Stay close to your partner during Siete. If you drift apart, the arm length is insufficient for the reverse loop.",
  },
  {
    id: "int-pw-4",
    level: "Intermediate",
    pillar: "partnerwork_casino",
    name: "Coca-Cola & Bayamo",
    phonetic: "Koh-kah KOH-lah",
    summary: "Dynamic double outside spin for follow with lead sliding behind, combined with the Bayamo multi-hand change.",
    entryExitGeometry: "Double outside spin with lead executing a counter-body pivot.",
    handholdType: "Right-to-right hand toss caught by left hand behind back.",
    unConfuserTip: "Do not rush count 5 on Coca-Cola. Complete the full Enchufla on 1-2-3 before launching the spin.",
  },
  {
    id: "int-solo-1",
    level: "Intermediate",
    pillar: "solo_suelta",
    name: "Thoracic Ribcage Isolation & Despelote",
    summary: "Fluid side-to-side and circular ribcage rolls independent of hip movement, unlocking authentic Cuban body wave.",
    unConfuserTip: "Isolate your chest from your shoulders. Your shoulders should remain level while your ribs glide left and right.",
  },
  {
    id: "int-sub-1",
    level: "Intermediate",
    pillar: "sub_styles_gears",
    name: "Afro-Cuban Orishas: Eleguá, Yemayá & Oggún",
    summary: "Movement vocabularies for Eleguá (the trickster opener), Yemayá (rolling sea waves), and Oggún (machete strength and earth stomps).",
    unConfuserTip: "Dance with intention: Eleguá has a light, mischievous hop; Oggún is heavy, rooted in the thighs; Yemayá flows with swirling circular skirts.",
  },
  {
    id: "int-mus-1",
    level: "Intermediate",
    pillar: "musicality",
    name: "Timba 4-Phase Anatomy (Tema, Montuno, Mambo, Bomba)",
    summary: "Deconstructing modern Cuban tracks to predict when the brass will drop, when to breakaway, and when to hit Bomba.",
    unConfuserTip: "Listen for the singer's guiding cues: '¡Manos arriba!', '¡Ataca chichí!', or '¡Bomba!'. They tell the band and dancers the exact moment energy shifts.",
  },

  // ----------------------------------------------------
  // LEVEL 4: ADVANCED (Micro-Leading, Rumba Columbia, Changó & Reparto)
  // ----------------------------------------------------
  {
    id: "adv-pw-1",
    level: "Advanced",
    pillar: "partnerwork_casino",
    name: "Micro-Leading & Frame Modulation",
    summary: "Leading multi-directional Casino combinations using subtle fingertip pressure, breath cues, and core rotation without pulling.",
    entryExitGeometry: "Fluid organic geometry adapting to crowded social dance floors.",
    handholdType: "Feather-light fingertip connection.",
    unConfuserTip: "If you feel arm strain or partner resistance, reduce physical force by 50%. The lead comes from your torso rotation, not your arms.",
  },
  {
    id: "adv-pw-2",
    level: "Advanced",
    pillar: "partnerwork_casino",
    name: "Mid-Figure Rhythm Reversals & Son/Casino Contrapunto",
    summary: "Switching from On1 Casino to On2 Son Cubano in the middle of a figure without dropping partner connection.",
    entryExitGeometry: "Seamless transition between circular On1 and delayed linear/circular On2.",
    handholdType: "Elastic dynamic tension.",
    unConfuserTip: "Signal the rhythm shift through a steady weight-hold on beat 1 before stepping into the contratiempo beat 2.",
  },
  {
    id: "adv-solo-1",
    level: "Advanced",
    pillar: "solo_suelta",
    name: "Tembleque (High-Frequency Body Vibration)",
    summary: "Mastering the rapid, continuous muscular vibration of the upper chest and torso over a relaxed, grounded lower body.",
    unConfuserTip: "Relax your breath. If you hold your breath, your chest locks up. Breathe naturally while vibrating the pectorals.",
  },
  {
    id: "adv-sub-1",
    level: "Advanced",
    pillar: "sub_styles_gears",
    name: "Rumba Columbia & Orishas (Changó & Ochún)",
    summary: "Fast acrobatic Columbia footwork challenges combined with the fiery masculine thunder of Changó and the fluid sensuality of Ochún.",
    unConfuserTip: "Changó leads with the solar plexus and chest, jumping high over thunderbolts; Ochún ripples through the wrists, hips, and mirrors.",
  },
  {
    id: "adv-sub-2",
    level: "Advanced",
    pillar: "sub_styles_gears",
    name: "Rueda Cruzada & Pa'Fuera",
    summary: "Elite Rueda calls where dancers cross through the center of the wheel or rotate facing outward from the circle.",
    unConfuserTip: "Requires 360-degree spatial awareness. Keep steps compact so you don't collide with couples crossing from the opposite side.",
  },
  {
    id: "adv-mus-1",
    level: "Advanced",
    pillar: "musicality",
    name: "Rumba Clave Syncopation & Multi-Instrument Emulation",
    summary: "Expressing polyrhythmic layers by emulating different instruments with your body: piano tumbao in hips, brass accents in shoulders, clave in feet.",
    unConfuserTip: "Don't try to dance all instruments at once. Pick one instrument (e.g. the bass line) for 8 counts, then switch to the brass horns on the next break.",
  },
];

// ==========================================
// 5. THE 14 CURRICULUM REFERENCE TRACKS
// ==========================================

export const CURRICULUM_REFERENCE_SONGS: CurriculumReferenceSong[] = [
  // Beginner
  {
    id: "ref-beg-1",
    title: "Me Dicen Cuba",
    artist: "Alexander Abreu y Havana D'Primera",
    bpm: 98,
    level: "Beginner",
    subGenre: "Modern Timba Anthem",
    whyThisSong: "Crisp downbeat, clear acoustic intro leading to clean Montuno cowbell. The premier track to find beat 1.",
    gearShiftsObserved: ["Gear 1 (Son intro)", "Gear 2 (Casino Montuno)"],
    instrumentsToListenFor: ["Lead Trumpet", "Conga Tumbao", "Campana (Cowbell)"],
    spotifySearchUrl: "https://open.spotify.com/search/Alexander%20Abreu%20Me%20Dicen%20Cuba",
  },
  {
    id: "ref-beg-2",
    title: "537 C.U.B.A.",
    artist: "Orishas",
    bpm: 90,
    level: "Beginner",
    subGenre: "Cuban Hip-Hop / Traditional Son Fusion",
    whyThisSong: "Acoustic Chan-Chan guitar riff with slow, unmistakable 4/4 downbeat. Ideal for practicing Guapea and Dile Que No.",
    gearShiftsObserved: ["Gear 1 (Son)", "Gear 2 (Casino Basic)"],
    instrumentsToListenFor: ["Tres Guitar", "Bongo Martillo", "Hip-hop Bass"],
    spotifySearchUrl: "https://open.spotify.com/search/Orishas%20537%20CUBA",
  },
  {
    id: "ref-beg-3",
    title: "Chan Chan",
    artist: "Buena Vista Social Club",
    bpm: 84,
    level: "Beginner",
    subGenre: "Classic Son Cubano",
    whyThisSong: "Slow tempo allowing dancers to master steady weight transfer and eliminate rushing.",
    gearShiftsObserved: ["Gear 1 (Son Cubano)"],
    instrumentsToListenFor: ["Acoustic Guitar", "Maracas", "Bass Tumbao"],
    spotifySearchUrl: "https://open.spotify.com/search/Buena%20Vista%20Social%20Club%20Chan%20Chan",
  },

  // Improver
  {
    id: "ref-imp-1",
    title: "Pasaporte",
    artist: "Alexander Abreu y Havana D'Primera",
    bpm: 104,
    level: "Improver",
    subGenre: "Modern Timba",
    whyThisSong: "Dynamic energy shifts between melodious verse and driving cowbell montuno for Setenta & Sombrero.",
    gearShiftsObserved: ["Gear 2 (Casino)", "Gear 3 (Rumba break)", "Gear 5 (Despelote)"],
    instrumentsToListenFor: ["Piano Tumbao", "Trumpet Fanfares", "Campana"],
    spotifySearchUrl: "https://open.spotify.com/search/Havana%20D%27Primera%20Pasaporte",
  },
  {
    id: "ref-imp-2",
    title: "Idilio",
    artist: "Leoni Torres",
    bpm: 94,
    level: "Improver",
    subGenre: "Son Tradicional con Timba",
    whyThisSong: "Clean Son Cubano timing that transitions smoothly into a modern Casino groove.",
    gearShiftsObserved: ["Gear 1 (Son Contratiempo)", "Gear 2 (Casino On1)"],
    instrumentsToListenFor: ["Acoustic Tres", "Bongos", "Horns"],
    spotifySearchUrl: "https://open.spotify.com/search/Leoni%20Torres%20Idilio",
  },
  {
    id: "ref-imp-3",
    title: "Recoge y Vete",
    artist: "Maykel Blanco y Su Salsa Mayor",
    bpm: 102,
    level: "Improver",
    subGenre: "Timba Romántica y Brava",
    whyThisSong: "Great test of Montuno transitions and rhythm changes for Vacilala and Kentucky.",
    gearShiftsObserved: ["Gear 2 (Casino)", "Gear 5 (Bomba)"],
    instrumentsToListenFor: ["Driving Cowbell", "Electric Bass Slap"],
    spotifySearchUrl: "https://open.spotify.com/search/Maykel%20Blanco%20Recoge%20y%20Vete",
  },
  {
    id: "ref-imp-4",
    title: "Baile Inolvidable",
    artist: "Bad Bunny (Latin Fusion / Son)",
    bpm: 96,
    level: "Improver",
    subGenre: "Contemporary Son-Pop",
    whyThisSong: "Clear tempo showing how classic Cuban timing underpins modern urban Latin music.",
    gearShiftsObserved: ["Gear 1 (Son)", "Gear 2 (Casino)"],
    instrumentsToListenFor: ["Bongos", "Piano", "Vocals"],
    spotifySearchUrl: "https://open.spotify.com/search/Bad%20Bunny%20Baile%20Inolvidable",
  },

  // Intermediate
  {
    id: "ref-int-1",
    title: "La Cosa Mala",
    artist: "El Niño y La Verdad",
    bpm: 105,
    level: "Intermediate",
    subGenre: "Rumba-Timba Fusion",
    whyThisSong: "Explicit fusion of Rumba Guaguancó rhythms into heavy modern Timba. Essential for Montana and Orisha breaks.",
    gearShiftsObserved: ["Gear 2 (Casino)", "Gear 3 (Rumba Guaguancó)", "Gear 4 (Orishas)"],
    instrumentsToListenFor: ["Clave", "Congas", "Trombones"],
    spotifySearchUrl: "https://open.spotify.com/search/El%20Nino%20y%20La%20Verdad%20La%20Cosa%20Mala",
  },
  {
    id: "ref-int-2",
    title: "Tremenda Pinta",
    artist: "Maykel Blanco y Su Salsa Mayor",
    bpm: 106,
    level: "Intermediate",
    subGenre: "Timba Brava",
    whyThisSong: "Rapid 4-phase song progression showing exact moments where Tema shifts to Montuno, Mambo, and Bomba.",
    gearShiftsObserved: ["Gear 2 (Casino)", "Gear 5 (Bomba/Despelote)"],
    instrumentsToListenFor: ["Timbales Roll", "Heavy Bass Slides", "Piano Tumbao"],
    spotifySearchUrl: "https://open.spotify.com/search/Maykel%20Blanco%20Tremenda%20Pinta",
  },
  {
    id: "ref-int-3",
    title: "De La Timba a Pogolotti",
    artist: "Elito Revé y Su Charangón",
    bpm: 100,
    level: "Intermediate",
    subGenre: "Changüí-Timba",
    whyThisSong: "Changüí syncopation with rustic tres chords and explosive polyrhythmic breaks.",
    gearShiftsObserved: ["Gear 1 (Changüí)", "Gear 2 (Casino)", "Gear 4 (Afro)"],
    instrumentsToListenFor: ["Bongó de Monte", "Marímbula", "Violins"],
    spotifySearchUrl: "https://open.spotify.com/search/Elito%20Reve%20De%20La%20Timba%20a%20Pogolotti",
  },

  // Advanced
  {
    id: "ref-adv-1",
    title: "Pueblo Grifo",
    artist: "Pupy y Los Que Son Son",
    bpm: 108,
    level: "Advanced",
    subGenre: "Virtuoso Timba",
    whyThisSong: "Complex polyrhythmic layers composed by former Los Van Van pianist Pupy Pedroso. Tests micro-leading at high tempo.",
    gearShiftsObserved: ["Gear 2 (Casino)", "Gear 3 (Rumba)", "Gear 5 (Tembleque / Reparto)"],
    instrumentsToListenFor: ["Syncopated Piano", "Drum Kit Songo", "Horns"],
    spotifySearchUrl: "https://open.spotify.com/search/Pupy%20y%20Los%20Que%20Son%20Son%20Pueblo%20Grifo",
  },
  {
    id: "ref-adv-2",
    title: "Agua Pa' Yemayá",
    artist: "Alexander Abreu y Havana D'Primera",
    bpm: 106,
    level: "Advanced",
    subGenre: "Afro-Cuban Timba",
    whyThisSong: "Direct 6/8 sacred Batá drumming invoked over 4/4 Timba rhythm for Yemayá and Changó expressions.",
    gearShiftsObserved: ["Gear 4 (Afro-Cuban Orishas)", "Gear 5 (Reparto)"],
    instrumentsToListenFor: ["Batá Drums", "Vocal Chants in Lucumí", "Brass Fanfare"],
    spotifySearchUrl: "https://open.spotify.com/search/Alexander%20Abreu%20Agua%20Pa%20Yemaya",
  },
  {
    id: "ref-adv-3",
    title: "El Cuento de la Buena Pipa",
    artist: "Elito Revé y Su Charangón",
    bpm: 104,
    level: "Advanced",
    subGenre: "Changüí-Timba Climax",
    whyThisSong: "Aggressive Bomba breaks, multi-instrument emulation, and lightning-fast Rueda Cruzada transitions.",
    gearShiftsObserved: ["Gear 1 (Son)", "Gear 3 (Rumba Columbia)", "Gear 5 (Reparto)"],
    instrumentsToListenFor: ["Timbales", "Guiro", "Heavy Bass Stabs"],
    spotifySearchUrl: "https://open.spotify.com/search/Elito%20Reve%20El%20Cuento%20de%20la%20Buena%20Pipa",
  },
];

// ==========================================
// 6. QUERY / FILTER HELPER FUNCTIONS
// ==========================================

export function getSkillsByLevel(level: CurriculumLevel): CurriculumSkillItem[] {
  return CUBAN_CURRICULUM_DATA.filter((s) => s.level === level);
}

export function getSkillsByPillar(pillar: CurriculumPillar): CurriculumSkillItem[] {
  return CUBAN_CURRICULUM_DATA.filter((s) => s.pillar === pillar);
}

export function getSongsByLevel(level: CurriculumLevel): CurriculumReferenceSong[] {
  return CURRICULUM_REFERENCE_SONGS.filter((s) => s.level === level);
}
