"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Volume2,
  Hand,
  Repeat,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface RuedaCall {
  name: string;
  phonetic: string;
  level: "Beginner" | "Improver" | "Intermediate" | "Advanced";
  switchesPartner: boolean;
  handSignal: string;
  description: string;
  claveTiming: string;
  cantanteTip: string;
}

export const RUEDA_CALLS: RuedaCall[] = [
  {
    name: "Guapea",
    phonetic: "Gwah-PAY-ah",
    level: "Beginner",
    switchesPartner: false,
    handSignal: "Open palms pressing forward then backward at chest level.",
    description: "The fundamental open-position dance step in Casino and Rueda. Leads push forward on 1-2-3 and step back on 5-6-7 with elastic arm tension.",
    claveTiming: "Step back on 1, push palm-to-palm on 3, open on 5.",
    cantanteTip: "Call at count 7 of the preceding bar to reset the circle.",
  },
  {
    name: "Dame",
    phonetic: "DAH-meh",
    level: "Beginner",
    switchesPartner: true,
    handSignal: "One finger pointed toward the next follower clockwise.",
    description: "Direct partner change. Lead releases their partner and steps counter-clockwise into the next follower's open hold.",
    claveTiming: "Initiate release on 5, walk on 6-7, connect to next follow on 1.",
    cantanteTip: "Call clearly on 1 or 5: '¡Dame!'",
  },
  {
    name: "Dame Dos",
    phonetic: "DAH-meh DOHS",
    level: "Beginner",
    switchesPartner: true,
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
    handSignal: "Hand mimics plugging a cord into an electrical socket.",
    description: "Inside turn for the follower followed by a partner exchange. Lead raises left hand on 1-2-3 and moves under to the next follower on 5-6-7.",
    claveTiming: "Lift left hand on count 1, Follow turns under on 2-3, switch on 5.",
    cantanteTip: "The foundation of over 40 complex Cuban figure variations.",
  },
  {
    name: "Enchufla Doble",
    phonetic: "En-CHOO-flah DOH-bleh",
    level: "Improver",
    switchesPartner: true,
    handSignal: "Two fingers plugging downward twice.",
    description: "Enchufla repeated twice before completing the partner pass. On the first turn, lead taps follow's shoulder before repeating.",
    claveTiming: "Turn 1 on beats 1-2-3, shoulder tap on 5-6-7, turn 2 on next 1-2-3.",
    cantanteTip: "Great for testing group synchronization in the circle.",
  },
  {
    name: "Dile Que No",
    phonetic: "DEE-leh keh NOH",
    level: "Beginner",
    switchesPartner: false,
    handSignal: "Finger wagging 'no' horizontally.",
    description: "Cross-body lead in closed Cuban position that opens the couple back into the circular Guapea formation. Translates to 'Tell her no'.",
    claveTiming: "Prep on 1, cross on 3, open circular promenade on 5-6-7.",
    cantanteTip: "Must finish every closed figure to reopen the Rueda circle.",
  },
  {
    name: "Vacilala",
    phonetic: "Vah-see-LAH-lah",
    level: "Improver",
    switchesPartner: false,
    handSignal: "Fingers brushing past the temple or sunglasses gesture.",
    description: "Right-hand outside free turn for the follower without partner change. Lead tosses follower's right hand gently at count 3.",
    claveTiming: "Prep on 1, release with right-side turn on 3, catch back in Guapea on 5.",
    cantanteTip: "Followers keep their left arm poised for the catch on 5.",
  },
  {
    name: "Setenta (70)",
    phonetic: "Seh-TEN-tah",
    level: "Intermediate",
    switchesPartner: false,
    handSignal: "Seven fingers (5 on one hand, 2 on other).",
    description: "Classic Cuban two-handed figure. Follower turns inside, Lead turns under both arms, ending in an intricate 'hammerlock' arm wrap before unwinding.",
    claveTiming: "Count 1 prep, count 3 arm hook, count 5-6-7 lead turn under.",
    cantanteTip: "Keep handholds loose and soft to protect wrists during the wrap.",
  },
  {
    name: "Sombrero",
    phonetic: "Som-BREH-roh",
    level: "Improver",
    switchesPartner: false,
    handSignal: "Both hands placing an imaginary hat over the head.",
    description: "Two-handed turn ending with both arms gracefully draped over the partner's shoulders like a wide-brimmed Cuban hat.",
    claveTiming: "Double hand cross on 1-2-3, drape over head on 5-6-7.",
    cantanteTip: "Smile and make eye contact as the arms drape on 5.",
  },
  {
    name: "Pelota (con Una / con Dos)",
    phonetic: "Peh-LOH-tah",
    level: "Intermediate",
    switchesPartner: true,
    handSignal: "Clapping hands mimicking bouncing a rubber ball.",
    description: "Rhythmic partner change with hand claps. Dancers step into the center of the circle, clap on specific syncopated clave beats, and rotate.",
    claveTiming: "Step center 1-2-3, clap on 1 (or 1 and 2), walk to next partner 5-6-7.",
    cantanteTip: "Everyone claps in unison — loud and energetic!",
  },
  {
    name: "Adios con la Hermana",
    phonetic: "Ah-dee-OHS kon lah Er-MAH-nah",
    level: "Intermediate",
    switchesPartner: true,
    handSignal: "Wave goodbye with right hand then touch left forearm.",
    description: "'Goodbye to the Sister' — Lead performs an Enchufla hook, turns around partner to hook the next follower's arm, and completes a double change.",
    claveTiming: "Enchufla on 1-2-3, pass behind follow on 5-6-7, switch on next 1.",
    cantanteTip: "Keep posture upright; do not lean forward while walking around.",
  },
  {
    name: "Kentucky",
    phonetic: "Ken-TUH-kee",
    level: "Intermediate",
    switchesPartner: false,
    handSignal: "Tapping the side of the thigh like a horse rider.",
    description: "Dynamic Cuban combination with hand release, waist wrap, and duck-under pivot, named after 1970s Havana cabaret styling.",
    claveTiming: "Waist catch on 3, underarm loop on 5, pivot unwind on 7.",
    cantanteTip: "A crowd favorite at Havana Fiesta socials in Bournemouth.",
  },
  {
    name: "Montana (Mountain)",
    phonetic: "Mon-TAHN-yah",
    level: "Intermediate",
    switchesPartner: false,
    handSignal: "Hands peaking together forming a mountain triangular roof.",
    description: "Two-hand Cuban combination featuring high double-arm arches that mimic mountain peaks, concluding with a Dile Que No exit.",
    claveTiming: "Arch hands overhead on 3, rotate torso on 5, unwind on 7.",
    cantanteTip: "Keep hands high above follower's head so hair is not caught.",
  },
  {
    name: "Cero (Zero)",
    phonetic: "SEH-roh",
    level: "Advanced",
    switchesPartner: true,
    handSignal: "Fingers forming an 'O' shape in the air.",
    description: "High-speed continuous Rueda turn sequence where leads snake through the center of the circle without stopping, rotating through 3 partners.",
    claveTiming: "Continuous triple-beat stepping on counts 1-2-3, 5-6-7, 1-2-3.",
    cantanteTip: "Strictly for dancers with solid spatial awareness and timing.",
  },
  {
    name: "Evelyn",
    phonetic: "EH-veh-leen",
    level: "Advanced",
    switchesPartner: false,
    handSignal: "Strumming an air guitar across the chest.",
    description: "Intricate Cuban styling routine involving a behind-the-back hand toss, elbow latch, and circular despelote hip roll.",
    claveTiming: "Toss behind back on 2, latch elbow on 4, roll hips on 5-6-7.",
    cantanteTip: "Requires deep grounding into the Canadian maple floor at BOH Studios.",
  },
  {
    name: "Prima con la Hermana",
    phonetic: "PREE-mah kon lah Er-MAH-nah",
    level: "Beginner",
    switchesPartner: true,
    handSignal: "Tapping index and middle fingers together.",
    description: "'Cousin with the Sister' — Lead executes Enchufla, walks to the immediate next follow (cousin), then continues onto the next (sister).",
    claveTiming: "Inside turn 1-2-3, pass 1st follow on 5, take 2nd follow on next 1.",
    cantanteTip: "Commonly called early in Rueda warm-ups to energize dancers.",
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
