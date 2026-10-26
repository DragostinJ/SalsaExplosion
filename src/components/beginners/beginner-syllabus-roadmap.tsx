import { CheckCircle2, Award, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SyllabusStep {
  number: number;
  name: string;
  phonetic: string;
  description: string;
  status: "MASTERED" | "CURRENT_DRILL" | "COMING_UP";
  category: "Footwork & Frame" | "Circular Transition" | "Rueda Calling" | "Turn Patterns";
}

const BEGINNER_STEPS: SyllabusStep[] = [
  {
    number: 1,
    name: "Paso Básico (Tiempo 1 & 5)",
    phonetic: "PAH-soh BAH-see-koh",
    description: "The heartbeat 1-2-3, 5-6-7 stepping rhythm. Stepping back on 1 (Leads with left foot, Follows with right foot).",
    status: "MASTERED",
    category: "Footwork & Frame",
  },
  {
    number: 2,
    name: "Guapea (Cuban Push-Pull)",
    phonetic: "gwah-PEH-ah",
    description: "The primary open-position basic in Casino. Natural tension on count 3, palm-to-palm touch on count 5.",
    status: "MASTERED",
    category: "Footwork & Frame",
  },
  {
    number: 3,
    name: "Dile Que No (Circular Transition)",
    phonetic: "DEE-leh keh NOH",
    description: "The signature transition that moves dancers from open position back into circular closed position.",
    status: "CURRENT_DRILL",
    category: "Circular Transition",
  },
  {
    number: 4,
    name: "Enchufla (Underarm Turn)",
    phonetic: "en-CHOO-flah",
    description: "Lead turns the follow under the left arm and steps inside the circle to trade places.",
    status: "CURRENT_DRILL",
    category: "Circular Transition",
  },
  {
    number: 5,
    name: "Dame (Partner Exchange)",
    phonetic: "DAH-meh",
    description: "The quintessential Rueda command: Leads step counter-clockwise to welcome the next follow.",
    status: "CURRENT_DRILL",
    category: "Rueda Calling",
  },
  {
    number: 6,
    name: "Vacilala (Solo Follow Turn)",
    phonetic: "vah-see-LAH-lah",
    description: "A free spin for the follow guided by lead's finger gesture, finished with a Dile Que No.",
    status: "COMING_UP",
    category: "Turn Patterns",
  },
  {
    number: 7,
    name: "Sombrero (The Cuban Hat)",
    phonetic: "sohm-BREH-roh",
    description: "Two-handed head wrap draping arms over shoulders like a traditional sombrero hat.",
    status: "COMING_UP",
    category: "Turn Patterns",
  },
  {
    number: 8,
    name: "Setenta (Classic 70)",
    phonetic: "seh-TEN-tah",
    description: "The world-famous Cuban pretzel combination that unlocks your Improver promotion certificate!",
    status: "COMING_UP",
    category: "Turn Patterns",
  },
];

export function BeginnerSyllabusRoadmap() {
  const masteredCount = BEGINNER_STEPS.filter((s) => s.status === "MASTERED").length;
  const progressPercent = Math.round((masteredCount / BEGINNER_STEPS.length) * 100);

  return (
    <Card className="border border-secondary-base/30 bg-gradient-to-br from-secondary-light/30 via-background to-secondary-light/10 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                Level 0 → Level 1 Roadmap
              </Badge>
              <span className="text-xs font-semibold text-emerald-400">
                Foundational Cuban Figures
              </span>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold">
              Progressive Syllabus: Your First 8 Figures
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 text-xs bg-muted/40 px-3 py-1.5 rounded-xl border border-border/60">
            <Award className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-foreground">{masteredCount} of 8 Mastered</span>
            <span className="text-[10px] text-text-muted">({progressPercent}%)</span>
          </div>
        </div>

        <CardDescription className="text-xs text-text-muted leading-relaxed pt-1">
          No guessing what is being taught. This visual syllabus breaks down every move taught in your first month at Salsa Explosion so you always know what&apos;s coming next.
        </CardDescription>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 space-y-2.5">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {BEGINNER_STEPS.map((step) => {
            const isMastered = step.status === "MASTERED";
            const isCurrent = step.status === "CURRENT_DRILL";

            return (
              <div
                key={step.number}
                className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                  isMastered
                    ? "border-secondary-base/40 bg-secondary-light/30"
                    : isCurrent
                      ? "border-accent-tangerine/50 bg-accent-tangerine/[0.08] ring-1 ring-accent-tangerine/30"
                      : "border-border/60 bg-card/60 opacity-80"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Figure {step.number} • {step.category}
                    </span>
                    {isMastered ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary-base">
                        <CheckCircle2 className="h-3 w-3" /> Mastered
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-tangerine animate-pulse">
                        <Flame className="h-3 w-3" /> Practicing Now
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-muted font-medium">
                        Coming Up
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {step.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono italic">
                      [{step.phonetic}]
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
