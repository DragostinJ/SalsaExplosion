"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Volume2,
  Hand,
  Repeat,
  Filter,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface RuedaCall {
  name: string;
  phonetic: string;
  level: "Beginner" | "Improver" | "Intermediate" | "Advanced";
  switchesPartner: boolean;
  handholdType: string;
  entryExitGeometry: string;
  handSignal: string;
  description: string;
  claveTiming: string;
  cantanteTip: string;
}

export const RUEDA_CALLS: RuedaCall[] = [
  // ==========================================
  // 1. BEGINNER (LEVEL 1)
  // ==========================================
  {
    name: "Guapea",
    phonetic: "Gwah-PAY-ah",
    level: "Beginner",
    switchesPartner: false,
    handholdType: "Open Two-Hand / Single Left-to-Right",
    entryExitGeometry: "Linear Pasillo (Forward/Back Compression)",
    handSignal: "Open palms pressing forward then backward at chest level.",
    description: "The fundamental open-position dance step in Casino and Rueda. Leads step back on 1-2-3 and push palm-to-palm on 5-6-7 with elastic arm tension.",
    claveTiming: "Step back on 1, push palm-to-palm on 3, open on 5.",
    cantanteTip: "Call at count 7 of the preceding bar to reset the circle.",
  },
  {
    name: "Dile Que No",
    phonetic: "DEE-leh keh NOH",
    level: "Beginner",
    switchesPartner: false,
    handholdType: "Closed Cuban Position to Open Hold",
    entryExitGeometry: "Circular Counter-Clockwise Arc",
    handSignal: "Finger wagging 'no' horizontally.",
    description: "The engine of Cuban Casino. Rotates the couple 90-180 degrees counter-clockwise from closed position into open Guapea.",
    claveTiming: "Prep on 1, lead crosses slot on 3, open circular promenade on 5-6-7.",
    cantanteTip: "Must finish every closed figure to reopen the Rueda circle.",
  },
  {
    name: "Dame",
    phonetic: "DAH-meh",
    level: "Beginner",
    switchesPartner: true,
    handholdType: "Open Single Hand (Left to Right)",
    entryExitGeometry: "Circular Clockwise Ring Flow",
    handSignal: "One finger pointed toward the next follower clockwise.",
    description: "Direct partner change. Lead releases current follower on 5 and steps counter-clockwise into the next follower's open hold.",
    claveTiming: "Initiate release on 5, walk on 6-7, connect to next follow on 1.",
    cantanteTip: "Call clearly on 1 or 5: '¡Dame!'",
  },
  {
    name: "Dame Dos",
    phonetic: "DAH-meh DOHS",
    level: "Beginner",
    switchesPartner: true,
    handholdType: "Open Single Hand",
    entryExitGeometry: "Double Skip Clockwise Ring Flow",
    handSignal: "Two fingers held high, rotating overhead.",
    description: "Double partner change. Lead claps hands once on 1, bypasses the immediate next follower, and connects with the second follower clockwise.",
    claveTiming: "Clap on 1, walk through 2-3, 5-6-7 to the 2nd follow.",
    cantanteTip: "Add energy by shouting '¡Con Palma!' (with clap).",
  },
  {
    name: "Enchufla (Enchufe)",
    phonetic: "En-CHOO-flah",
    level: "Beginner",
    switchesPartner: true,
    handholdType: "Open Single Left-to-Right",
    entryExitGeometry: "Radial Inside Arc to Partner Pass",
    handSignal: "Hand mimics plugging a cord into an electrical socket.",
    description: "Inside turn for the follower followed by a partner exchange. Lead raises left hand on 1-2-3 and moves under to the next follower on 5-6-7.",
    claveTiming: "Lift left hand on count 1, Follow turns under on 2-3, switch on 5.",
    cantanteTip: "The foundation of over 40 complex Cuban figure variations.",
  },
  {
    name: "Prima",
    phonetic: "PREE-mah",
    level: "Beginner",
    switchesPartner: true,
    handholdType: "Open Single Hand",
    entryExitGeometry: "Circular Double Pass Arc",
    handSignal: "Tapping thumb and index finger together.",
    description: "'The Cousin' — Lead performs Enchufla, walks past the first follower on 5-6-7, and takes the next follower with a Dile Que No.",
    claveTiming: "Enchufla on 1-2-3, pass on 5-6-7, catch on count 1.",
    cantanteTip: "Keep steps compact inside the circle perimeter.",
  },
  {
    name: "Exhibela (Sacala)",
    phonetic: "Ex-HEE-beh-lah",
    level: "Beginner",
    switchesPartner: false,
    handholdType: "Open Single Hand (Left-to-Right)",
    entryExitGeometry: "Outside Follower Pivot Arc",
    handSignal: "Flourishing open palm toward the follower.",
    description: "Follower is guided into a right-turn showcase (free turn) while lead steps in place, catching her hand on count 5 for a Dile Que No.",
    claveTiming: "Prep on 1, follow turns 2-3, lead catches on 5.",
    cantanteTip: "Translates to 'Show her off!' — maintain upright celebratory posture.",
  },
  {
    name: "Fly",
    phonetic: "FLY",
    level: "Beginner",
    switchesPartner: false,
    handholdType: "Open Clapped Hands",
    entryExitGeometry: "Radial Center Leap & Retract",
    handSignal: "Palms flapping like bird wings overhead.",
    description: "Dancers step boldly into the center of the Rueda circle on count 1, leap or clap together overhead, and return to Guapea on 5.",
    claveTiming: "Step in 1-2-3, clap high on 3/4, step back 5-6-7.",
    cantanteTip: "Injects massive adrenaline into high-tempo Rueda sets.",
  },
  {
    name: "Un Tarro",
    phonetic: "Oon TAH-rroh",
    level: "Beginner",
    switchesPartner: true,
    handholdType: "Open Single Hand to Follow Pass",
    entryExitGeometry: "Forward Linear Progression",
    handSignal: "Two index fingers up on head like bull horns.",
    description: "Translates to 'A Horn' (or cheat). Lead walks forward to take the preceding partner while moving against the standard direction.",
    claveTiming: "Forward march on 1-2-3, partner latch on 5-6-7.",
    cantanteTip: "Great for testing if dancers are paying attention to the cantante.",
  },
  {
    name: "Prima con la Hermana",
    phonetic: "PREE-mah kon lah Er-MAH-nah",
    level: "Beginner",
    switchesPartner: true,
    handholdType: "Open Single Hand",
    entryExitGeometry: "Circular Multi-Partner Weave",
    handSignal: "Tapping index and middle fingers together.",
    description: "'Cousin with the Sister' — Lead executes Enchufla, walks to the immediate next follow (cousin), then continues onto the next (sister).",
    claveTiming: "Inside turn 1-2-3, pass 1st follow on 5, take 2nd follow on next 1.",
    cantanteTip: "Commonly called early in Rueda warm-ups to energize dancers.",
  },

  // ==========================================
  // 2. IMPROVER (LEVEL 2)
  // ==========================================
  {
    name: "Enchufla Doble",
    phonetic: "En-CHOO-flah DOH-bleh",
    level: "Improver",
    switchesPartner: true,
    handholdType: "Open Single Hand",
    entryExitGeometry: "Double Radial Inside Arc",
    handSignal: "Two fingers plugging downward twice.",
    description: "Enchufla repeated twice before completing the partner pass. On the first turn, lead taps follow's shoulder before repeating.",
    claveTiming: "Turn 1 on beats 1-2-3, shoulder tap on 5-6-7, turn 2 on next 1-2-3.",
    cantanteTip: "Great for testing group synchronization in the circle.",
  },
  {
    name: "Vacilala",
    phonetic: "Vah-see-LAH-lah",
    level: "Improver",
    switchesPartner: false,
    handholdType: "Open Single Hand to Free Turn",
    entryExitGeometry: "Linear Inside Cross to Circular Catch",
    handSignal: "Fingers brushing past the temple or sunglasses gesture.",
    description: "Right-hand outside free turn for the follower without partner change. Lead tosses follower's right hand gently at count 3.",
    claveTiming: "Prep on 1, release with right-side turn on 3, catch back in Guapea on 5.",
    cantanteTip: "Followers keep their left arm poised for the catch on 5.",
  },
  {
    name: "Setenta (70)",
    phonetic: "Seh-TEN-tah",
    level: "Improver",
    switchesPartner: false,
    handholdType: "Open Double Hand (Both Hands)",
    entryExitGeometry: "Dual Rotational Spiral Wrap",
    handSignal: "Seven fingers (5 on one hand, 2 on other).",
    description: "Classic Cuban two-handed figure. Follower turns inside, Lead turns under both arms, ending in an intricate 'hammerlock' arm wrap before unwinding.",
    claveTiming: "Count 1 prep, count 3 arm hook, count 5-6-7 lead turn under.",
    cantanteTip: "Keep handholds loose and soft to protect wrists during the wrap.",
  },
  {
    name: "Setenta Complicado",
    phonetic: "Seh-TEN-tah Kom-plee-KAH-doh",
    level: "Improver",
    switchesPartner: false,
    handholdType: "Cross-Handed Grip into Neck Wrap",
    entryExitGeometry: "Multi-Axis Circular Corkscrew",
    handSignal: "Seven fingers crossing wrists in front of face.",
    description: "Advanced variation of Setenta featuring additional neck draping and wrist reverses before resolving into Dile Que No.",
    claveTiming: "Setenta entry 1-2-3, neck drape on 5-6-7, secondary unwind on next 1-2-3.",
    cantanteTip: "Keep elbows relaxed and close to center to prevent arm leverage.",
  },
  {
    name: "Sombrero",
    phonetic: "Som-BREH-roh",
    level: "Improver",
    switchesPartner: false,
    handholdType: "Crossed Double Handhold",
    entryExitGeometry: "Overhead Dual Arch to Shoulder Drape",
    handSignal: "Both hands placing an imaginary hat over the head.",
    description: "Two-handed turn ending with both arms gracefully draped over the partner's shoulders like a wide-brimmed Cuban hat.",
    claveTiming: "Double hand cross on 1-2-3, drape over head on 5-6-7.",
    cantanteTip: "Smile and make eye contact as the arms drape on 5.",
  },
  {
    name: "Kentucky",
    phonetic: "Ken-TUH-kee",
    level: "Improver",
    switchesPartner: false,
    handholdType: "Waist Wrap to Hook Handhold",
    entryExitGeometry: "Cross-Body Pivot with Head Loop",
    handSignal: "Tapping the side of the thigh like a horse rider.",
    description: "Dynamic Cuban combination with hand release, waist wrap, and duck-under pivot, named after 1970s Havana cabaret styling.",
    claveTiming: "Waist catch on 3, underarm loop on 5, pivot unwind on 7.",
    cantanteTip: "A crowd favorite at Havana Fiesta socials in Bournemouth.",
  },
  {
    name: "Paseala",
    phonetic: "Pah-seh-AH-lah",
    level: "Improver",
    switchesPartner: false,
    handholdType: "Closed Promenade Hold / Arm Around Waist",
    entryExitGeometry: "Circular Clockwise Stroll (Walking Arc)",
    handSignal: "Two fingers walking along the other forearm.",
    description: "Lead brings follower into closed Cuban promenade and strolls around her in a wide circular walk while maintaining Cuban hip rhythm.",
    claveTiming: "Promenade lock on 1, walking steps on 2-3, 5-6-7.",
    cantanteTip: "Allows dancers to breathe and lock onto the conga tumbao.",
  },
  {
    name: "Pelota (con Una / con Dos)",
    phonetic: "Peh-LOH-tah",
    level: "Improver",
    switchesPartner: true,
    handholdType: "Open Hands with Syncopated Claps",
    entryExitGeometry: "Center Radial Step with Partner Pass",
    handSignal: "Clapping hands mimicking bouncing a rubber ball.",
    description: "Rhythmic partner change with hand claps. Dancers step into the center of the circle, clap on specific syncopated clave beats, and rotate.",
    claveTiming: "Step center 1-2-3, clap on 1 (or 1 and 2), walk to next partner 5-6-7.",
    cantanteTip: "Everyone claps in unison — loud and energetic!",
  },
  {
    name: "Príncipe Bueno / Príncipe Malo",
    phonetic: "PREEN-see-peh BWEH-noh / MAH-loh",
    level: "Improver",
    switchesPartner: true,
    handholdType: "Open Promenade to Gentle Caress or Tease",
    entryExitGeometry: "Linear Forward Pass with Drama Accent",
    handSignal: "Halo gesture for Bueno, devil horns for Malo.",
    description: "Stylized partner change where lead either gives a polite bow/caress (Bueno) or playfully ignores/spins away from the follower (Malo).",
    claveTiming: "Approach on 1-2-3, stylistic gesture on 5-6-7, switch on 1.",
    cantanteTip: "Brings Cuban 'choteo' (playful humor) alive in the Rueda circle.",
  },
  {
    name: "Evelyn",
    phonetic: "EH-veh-leen",
    level: "Improver",
    switchesPartner: false,
    handholdType: "Behind-the-Back Catch to Elbow Latch",
    entryExitGeometry: "Circular Despelote Arc",
    handSignal: "Strumming an air guitar across the chest.",
    description: "Intricate Cuban styling routine involving a behind-the-back hand toss, elbow latch, and circular despelote hip roll.",
    claveTiming: "Toss behind back on 2, latch elbow on 4, roll hips on 5-6-7.",
    cantanteTip: "Requires deep grounding into the Canadian maple floor at BOH Studios.",
  },

  // ==========================================
  // 3. INTERMEDIATE (LEVEL 3)
  // ==========================================
  {
    name: "Montana (Mountain)",
    phonetic: "Mon-TAHN-yah",
    level: "Intermediate",
    switchesPartner: false,
    handholdType: "Double Arch Over-Head Hold",
    entryExitGeometry: "Overhead Mountain Wave Progression",
    handSignal: "Hands peaking together forming a mountain triangular roof.",
    description: "Two-hand Cuban combination featuring high double-arm arches that mimic mountain peaks, concluding with a Dile Que No exit.",
    claveTiming: "Arch hands overhead on 3, rotate torso on 5, unwind on 7.",
    cantanteTip: "Keep hands high above follower's head so hair is not caught.",
  },
  {
    name: "Dedo",
    phonetic: "DEH-doh",
    level: "Intermediate",
    switchesPartner: true,
    handholdType: "Single Index Finger Latch",
    entryExitGeometry: "Circular Spiral Pivot to Enchufla",
    handSignal: "Pointing single index finger straight up.",
    description: "Executed using only the index fingers hooked. Lead guides follower through an Enchufla, spins around partner, and completes partner change.",
    claveTiming: "Finger hook on 1, follow spin on 3, lead loop on 5-6-7.",
    cantanteTip: "Strictly requires zero wrist pulling — pure momentum guiding.",
  },
  {
    name: "El Uno",
    phonetic: "El OO-noh",
    level: "Intermediate",
    switchesPartner: false,
    handholdType: "Single Right-to-Right Handhold",
    entryExitGeometry: "Linear Pasillo Wrap with Neck Loop",
    handSignal: "Single finger pointing horizontally across throat.",
    description: "Lead loops right arm over own head, connects with follower's waist, and directs a tight inside turn with waist support.",
    claveTiming: "Loop over head on 2, waist catch on 3-4, unwind on 5-6-7.",
    cantanteTip: "Keep the connection grounded and close to partner.",
  },
  {
    name: "El Dos",
    phonetic: "El DOHS",
    level: "Intermediate",
    switchesPartner: false,
    handholdType: "Double Crossed Handhold",
    entryExitGeometry: "Continuous Double Axis Turn",
    handSignal: "Two fingers pointing horizontally across chest.",
    description: "Follows El Uno with a secondary double-hand knot, leading both dancers through interlocking pivots before a clean open break.",
    claveTiming: "Double hand lead on 1-2-3, synchronized back break on 5-6-7.",
    cantanteTip: "Do not rush the turn — let the conga beat 4 carry the pivot.",
  },
  {
    name: "Siete",
    phonetic: "see-EH-teh",
    level: "Intermediate",
    switchesPartner: false,
    handholdType: "Open Single Hand into Back Wrap",
    entryExitGeometry: "Rotational Spiral Unwind",
    handSignal: "Forming the number 7 with index fingers.",
    description: "Single-hand version of Setenta where lead performs an Enchufla, wraps follower's hand behind her back, and guides a smooth circular sweep.",
    claveTiming: "Enchufla prep on 1, back wrap on 3, circular sweep on 5-6-7.",
    cantanteTip: "Gentle back wrap — never force follow's hand past lumbar spine.",
  },
  {
    name: "Siete Loco",
    phonetic: "see-EH-teh LOH-koh",
    level: "Intermediate",
    switchesPartner: false,
    handholdType: "Interlocked Wrist Grip",
    entryExitGeometry: "Continuous Siete Reversal Arc",
    handSignal: "Number 7 followed by finger twirling at temple.",
    description: "'Crazy Seven' — Siete entered with reverse momentum, featuring sudden rhythm stops, shoulder checks, and rapid unwinds.",
    claveTiming: "Count 1 entry, sudden stop on beat 4, explosive unwind on 5-6-7.",
    cantanteTip: "Requires dancers to be locked into the campana cowbell.",
  },
  {
    name: "Coca-Cola",
    phonetic: "Koh-kah KOH-lah",
    level: "Intermediate",
    switchesPartner: false,
    handholdType: "Right-to-Right Diagonal Grip",
    entryExitGeometry: "Reverse Outside Pivot (Right-to-Left)",
    handSignal: "Mimicking uncapping a glass soda bottle.",
    description: "Inside turn for the follower followed immediately by a rapid reverse outside roll, named after the classic bottle spin.",
    claveTiming: "Inside turn 1-2-3, reverse unroll on counts 5-6-7.",
    cantanteTip: "Keep follower's arm framed at chest height to absorb rotation.",
  },
  {
    name: "Bayamo",
    phonetic: "Bah-YAH-moh",
    level: "Intermediate",
    switchesPartner: false,
    handholdType: "Double Waist Drape Hold",
    entryExitGeometry: "Circular Promenade Drop & Slide",
    handSignal: "Chopping motion with right hand to left elbow.",
    description: "Named after the historic Cuban city, this figure weaves both dancers through alternating low waist wraps and high arm releases.",
    claveTiming: "Waist drape on 1-2-3, arm release on 5-6-7.",
    cantanteTip: "Practice slow with counts before dancing to 105+ BPM Timba.",
  },
  {
    name: "Adios con la Hermana",
    phonetic: "Ah-dee-OHS kon lah Er-MAH-nah",
    level: "Intermediate",
    switchesPartner: true,
    handholdType: "Enchufla Hook to Shoulder Tap",
    entryExitGeometry: "Circular Double Change Orbit",
    handSignal: "Wave goodbye with right hand then touch left forearm.",
    description: "'Goodbye to the Sister' — Lead performs an Enchufla hook, turns around partner to hook the next follower's arm, and completes a double change.",
    claveTiming: "Enchufla on 1-2-3, pass behind follow on 5-6-7, switch on next 1.",
    cantanteTip: "Keep posture upright; do not lean forward while walking around.",
  },

  // ==========================================
  // 4. ADVANCED (LEVEL 4)
  // ==========================================
  {
    name: "Rueda Cruzada",
    phonetic: "RWEH-dah Kroo-ZAH-dah",
    level: "Advanced",
    switchesPartner: true,
    handholdType: "Crossed Inside Circle Hold",
    entryExitGeometry: "Inverted Counter-Circle Cross",
    handSignal: "Arms crossed at wrists forming an 'X' over the chest.",
    description: "The entire circle splits into alternating crossed pathways where dancers trade places through the core center rather than around the ring.",
    claveTiming: "Center advance on 1-2-3, crossed weave on 5-6-7.",
    cantanteTip: "Requires laser-sharp spatial discipline from all couples.",
  },
  {
    name: "Pa'Fuera (Casino Afuera)",
    phonetic: "Pah FWEH-rah",
    level: "Advanced",
    switchesPartner: false,
    handholdType: "Inverted Back-to-Center Open Hold",
    entryExitGeometry: "Convex Radial Circle (Outward Facing)",
    handSignal: "Palms pushing outward away from chest.",
    description: "Inverts the geometry of the circle: all dancers turn to face outward away from the center while continuing Guapea and turns.",
    claveTiming: "Invert turn on 5-6-7, outward Guapea on 1-2-3.",
    cantanteTip: "Tests whether dancers rely on looking at other couples.",
  },
  {
    name: "Micro-leading (Conexión Fina)",
    phonetic: "MEE-kroh LEE-ding",
    level: "Advanced",
    switchesPartner: false,
    handholdType: "Feather-Touch Fingertip Connection",
    entryExitGeometry: "Rotational Torso Vector Transfer",
    handSignal: "Pinching thumb and index finger together with micro pulse.",
    description: "Leading complex Cuban figures without arm force, using only 50-gram fingertip pressure and core torso redirection.",
    claveTiming: "Anticipate lead on beat 8, follow absorbs on beat 1.",
    cantanteTip: "The hallmark of senior social dancers at Havana Fiesta.",
  },
  {
    name: "Contrapunto On1 / On2",
    phonetic: "Kon-trah-POON-toh",
    level: "Advanced",
    switchesPartner: false,
    handholdType: "Open to Closed Micro-Grip",
    entryExitGeometry: "Linear Pasillo with Rhythm Reversal",
    handSignal: "Two fingers flipping rhythmically back and forth.",
    description: "Seamless mid-figure transition from A Tiempo (On1) into Contratiempo (On2 Son) matching the percussion switch to Bongo Martillo.",
    claveTiming: "Step 1-2-3 on1, pause on 1, break on 2 (contratiempo) when timbal bell rings.",
    cantanteTip: "Demonstrates complete mastery of Cuban polyrhythm.",
  },
  {
    name: "Cero (Zero)",
    phonetic: "SEH-roh",
    level: "Advanced",
    switchesPartner: true,
    handholdType: "Center Open Free-Glide",
    entryExitGeometry: "Continuous Center Weave Triangle",
    handSignal: "Fingers forming an 'O' shape in the air.",
    description: "High-speed continuous Rueda turn sequence where leads snake through the center of the circle without stopping, rotating through 3 partners.",
    claveTiming: "Continuous triple-beat stepping on counts 1-2-3, 5-6-7, 1-2-3.",
    cantanteTip: "Strictly for dancers with solid spatial awareness and timing.",
  },
];

export function RuedaDictionaryClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [partnerSwitchOnly, setPartnerSwitchOnly] = useState(false);

  const filteredCalls = useMemo(() => {
    return RUEDA_CALLS.filter((call) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        call.name.toLowerCase().includes(q) ||
        call.phonetic.toLowerCase().includes(q) ||
        call.description.toLowerCase().includes(q) ||
        call.handholdType.toLowerCase().includes(q) ||
        call.entryExitGeometry.toLowerCase().includes(q) ||
        call.handSignal.toLowerCase().includes(q);

      const matchesLevel = levelFilter === "ALL" || call.level === levelFilter;
      const matchesSwitch = !partnerSwitchOnly || call.switchesPartner;

      return matchesSearch && matchesLevel && matchesSwitch;
    });
  }, [searchQuery, levelFilter, partnerSwitchOnly]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              aria-label="Search Rueda calls"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by call name (e.g. Enchufla, Setenta, Dame, Sombrero)..."
              className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <select
              aria-label="Filter by syllabus level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Syllabus Levels</option>
              <option value="Beginner">Level 1: Beginner</option>
              <option value="Improver">Level 2: Improver</option>
              <option value="Intermediate">Level 3: Intermediate</option>
              <option value="Advanced">Level 4: Advanced</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Buttons & Partner Switch Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
            {["ALL", "Beginner", "Improver", "Intermediate", "Advanced"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
                  levelFilter === lvl
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {lvl === "ALL" ? "All Levels" : lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPartnerSwitchOnly((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap ${
              partnerSwitchOnly
                ? "bg-purple-600 text-white shadow-xs"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span>Partner Changes Only</span>
          </button>
        </div>
      </div>

      {/* Rueda Calls Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredCalls.length === 0 ? (
          <div className="col-span-2 text-center py-12 rounded-2xl border bg-muted/20">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-3 font-bold text-base">No Rueda Calls Found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or syllabus level filter.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setLevelFilter("ALL");
                setPartnerSwitchOnly(false);
              }}
              className="mt-4 text-xs font-bold"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <Card
              key={call.name}
              className="rounded-2xl border bg-card shadow-xs hover:border-amber-500/50 transition-all flex flex-col justify-between overflow-hidden"
            >
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                      {call.name}
                    </h3>
                    <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                      <Volume2 className="h-3 w-3" />
                      &ldquo;{call.phonetic}&rdquo;
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={`text-[10px] font-bold ${
                        call.level === "Beginner"
                          ? "bg-blue-600 text-white"
                          : call.level === "Improver"
                          ? "bg-emerald-600 text-white"
                          : call.level === "Intermediate"
                          ? "bg-amber-600 text-white"
                          : "bg-purple-600 text-white"
                      }`}
                    >
                      {call.level}
                    </Badge>

                    {call.switchesPartner ? (
                      <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        Switches Partner
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Same Partner
                      </span>
                    )}
                  </div>
                </div>

                {/* Handhold & Entry/Exit Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <Badge variant="outline" className="text-[10px] font-semibold border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300">
                    <Hand className="mr-1 h-2.5 w-2.5" />
                    {call.handholdType}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-semibold border-blue-500/30 bg-blue-500/5 text-blue-800 dark:text-blue-300">
                    <Compass className="mr-1 h-2.5 w-2.5" />
                    {call.entryExitGeometry}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {call.description}
                </p>

                {/* Hand Signal Callout for noisy clubs */}
                <div className="rounded-xl border bg-muted/40 p-3 space-y-1">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Hand className="h-3.5 w-3.5 text-amber-600" />
                    Cantante Visual Hand Signal:
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {call.handSignal}
                  </p>
                </div>

                {/* Clave Timing & Maestro Tip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="rounded-lg bg-background border p-2.5 space-y-0.5">
                    <span className="font-bold text-foreground block">Clave Cadence:</span>
                    <span className="text-muted-foreground">{call.claveTiming}</span>
                  </div>
                  <div className="rounded-lg bg-amber-500/[0.04] border border-amber-500/20 p-2.5 space-y-0.5">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block">Maestro Tip:</span>
                    <span className="text-muted-foreground">{call.cantanteTip}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
