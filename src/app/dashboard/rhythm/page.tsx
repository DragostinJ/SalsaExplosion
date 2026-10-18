import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";
import { Music2, Sparkles } from "lucide-react";
import { ClaveTrainerClient } from "@/components/rhythm/clave-trainer-client";

export const metadata = {
  title: "Cuban Clave & Rhythm Trainer | Salsa Explosion UK",
  description:
    "Interactive Web Audio Cuban Clave & Rhythm trainer. Master Son Clave 2-3, 3-2, Campana, and Conga Tumbao timing at home.",
};

export default function RhythmTrainerPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold px-3 py-1 flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          Interactive Web Audio Engine
        </Badge>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Cuban Clave & Rhythm Trainer
            </h1>
            <Badge className="bg-amber-500 text-zinc-950 font-bold">
              <Music2 className="mr-1 h-3.5 w-3.5" />
              Salsa Timing
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Never struggle to find beat 1 again! Practice stepping on counts 1-2-3 and 5-6-7 to synthesized Son Clave, Conga Tumbao, and Cowbell rhythms with live tempo control.
          </p>
        </div>
      </div>

      {/* Interactive Trainer Audio Engine */}
      <ClaveTrainerClient />
    </main>
  );
}
