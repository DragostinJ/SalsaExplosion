"use client";

import { useState } from "react";
import {
  Compass,
  Music,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CUBAN_DANCE_GEARS,
  TIMBA_SONG_PHASES,
  TimbaSongPhase,
  DanceGearShift,
} from "@/lib/constants/cuban-curriculum-2027";

interface CubanDanceGearsMatrixProps {
  className?: string;
  initiallyCollapsed?: boolean;
}

export function CubanDanceGearsMatrix({
  className = "",
  initiallyCollapsed = false,
}: CubanDanceGearsMatrixProps) {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);
  const [selectedPhase, setSelectedPhase] = useState<TimbaSongPhase["phase"]>("Tema");
  const [activeGearFilter, setActiveGearFilter] = useState<number | "ALL">("ALL");

  const currentPhaseData =
    TIMBA_SONG_PHASES.find((p) => p.phase === selectedPhase) ?? TIMBA_SONG_PHASES[0];

  const displayedGears =
    activeGearFilter === "ALL"
      ? CUBAN_DANCE_GEARS
      : CUBAN_DANCE_GEARS.filter((g) => g.gearNumber === activeGearFilter);

  if (isCollapsed) {
    return (
      <section
        data-testid="cuban-dance-gears-matrix"
        aria-label="The Cuban Dance Gears & Timba Song Anatomy Guide"
        className={`rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-rose-500/5 p-6 sm:p-8 space-y-4 shadow-sm ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-gradient-to-r from-amber-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 px-3 py-0.5">
                <Compass className="h-3.5 w-3.5" />
                Optional Deep-Dive • Best for Improvers &amp; Social Dancers
              </Badge>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Timba Musicality
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-foreground">
              Curious Why Advanced Dancers Change Styles Mid-Song?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore the 4 Phases of a Timba Song (Tema, Montuno, Mambo, Bomba) and the 5 Cuban Dance Gears whenever you&apos;re ready.
            </p>
          </div>

          <Button
            type="button"
            data-testid="toggle-dance-gears-guide"
            onClick={() => setIsCollapsed(false)}
            className="shrink-0 bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-xs shadow-sm"
          >
            Open Interactive Musicality &amp; Gears Guide
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="cuban-dance-gears-matrix"
      aria-label="The Cuban Dance Gears & Timba Song Anatomy Guide"
      className={`space-y-6 ${className}`}
    >
      {/* Header Hub */}
      <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-rose-500/5 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-amber-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 px-3 py-1">
                <Compass className="h-3.5 w-3.5" />
                2027 Curriculum Guide
              </Badge>
              <Badge variant="outline" className="border-amber-500/40 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                Zero Floor Confusion
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              The 5 Cuban Dance Gears &amp; Song Anatomy
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="toggle-dance-gears-guide"
              onClick={() => setIsCollapsed(true)}
              className="font-bold text-xs"
            >
              Hide Musicality Guide
            </Button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed max-w-3xl">
          The #1 problem for social dancers is not knowing <em>which dance style</em> to use as a Timba song evolves. A single modern Cuban track shifts through 4 distinct phases. Use this interactive roadmap to understand when and how to shift between Son, Casino, Rumba, Afro-Cuban Orishas, and Reparto.
        </p>

        {/* 1. Timba 4-Phase Song Anatomy Interactive Timeline */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-rose-500" />
              Timba Song Anatomy Timeline (Click a Phase to Explore)
            </span>
            <span className="hidden sm:inline font-mono text-[11px] text-amber-800 dark:text-amber-300">
              Verse → Chorus → Horns → Bass Drop
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIMBA_SONG_PHASES.map((phaseItem, index) => {
              const isSelected = selectedPhase === phaseItem.phase;
              return (
                <button
                  key={phaseItem.phase}
                  type="button"
                  onClick={() => setSelectedPhase(phaseItem.phase)}
                  className={`rounded-2xl border p-3 text-left transition-all min-h-[72px] flex flex-col justify-between ${
                    isSelected
                      ? "border-primary-base bg-primary-base/10 shadow-sm ring-2 ring-primary-base/30 text-foreground"
                      : "border-border bg-card/60 hover:bg-muted/60 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest">
                      Phase {index + 1}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-primary-base animate-pulse" />
                    )}
                  </div>
                  <div className="font-black text-xs sm:text-sm text-foreground">
                    {phaseItem.phase}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Explainer Box */}
          <div className="rounded-2xl border-2 border-primary-base/30 bg-card p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
                  Active Song Phase
                </span>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  {currentPhaseData.title}
                </h3>
              </div>
              <Badge className="bg-amber-800 dark:bg-amber-700 text-white font-extrabold text-xs self-start sm:self-auto">
                {currentPhaseData.musicalEnergy}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border bg-muted/40 p-3 space-y-1">
                <span className="font-bold text-muted-foreground uppercase text-[10px] block">
                  What the Band is Playing
                </span>
                <p className="text-foreground font-medium leading-relaxed">
                  {currentPhaseData.instrumentsActive}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-3 space-y-1">
                <span className="font-bold text-muted-foreground uppercase text-[10px] block">
                  How Dancers Should Respond
                </span>
                <p className="text-foreground font-medium leading-relaxed">
                  {currentPhaseData.dancerFocus}
                </p>
              </div>

              <div className="rounded-xl border border-primary-base/30 bg-primary-base/5 p-3 space-y-1">
                <span className="font-bold text-rose-900 dark:text-rose-200 uppercase text-[10px] block">
                  Recommended Dance Gear
                </span>
                <p className="text-foreground font-extrabold leading-relaxed">
                  {currentPhaseData.recommendedGear}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. The 5 Cuban Dance Gears Comparison Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight">
              The 5 Cuban Dance Gears Breakdown
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Filter by specific gear or view all 5 styles side-by-side.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Button
              type="button"
              variant={activeGearFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveGearFilter("ALL")}
              className={`text-xs font-bold ${
                activeGearFilter === "ALL"
                  ? "bg-primary-base text-white"
                  : "bg-card text-foreground"
              }`}
            >
              All 5 Gears
            </Button>
            {CUBAN_DANCE_GEARS.map((gear) => (
              <Button
                key={gear.gearNumber}
                type="button"
                variant={activeGearFilter === gear.gearNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGearFilter(gear.gearNumber)}
                className={`text-xs font-bold ${
                  activeGearFilter === gear.gearNumber
                    ? "bg-primary-base text-white"
                    : "bg-card text-foreground"
                }`}
              >
                Gear {gear.gearNumber}: {gear.gearName.split(" ")[0]}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedGears.map((gear: DanceGearShift) => (
            <Card
              key={gear.gearNumber}
              className="border-2 border-border/80 shadow-xs hover:border-amber-500/50 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-amber-700 to-rose-700 text-white font-black text-[11px] uppercase tracking-wider">
                    Gear {gear.gearNumber}
                  </Badge>
                  <span className="text-[11px] font-mono font-extrabold text-amber-800 dark:text-amber-300">
                    {gear.musicalTiming}
                  </span>
                </div>

                <div>
                  <CardTitle className="text-lg font-black text-foreground">
                    {gear.gearName}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground font-bold">
                    {gear.rhythmStyle}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs leading-relaxed flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="rounded-xl border bg-muted/30 p-2.5 space-y-1">
                    <span className="font-extrabold text-[10px] text-muted-foreground uppercase tracking-wider block">
                      When to Shift Here
                    </span>
                    <p className="text-foreground/90 font-medium">{gear.whenToShift}</p>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-2.5 space-y-1">
                    <span className="font-extrabold text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Body Biomechanics
                    </span>
                    <p className="text-foreground/90 font-medium">{gear.bodyBiomechanics}</p>
                  </div>
                </div>

                {/* Un-Confuser Diagnostic Warning Box */}
                <div className="rounded-xl border-2 border-rose-500/40 bg-rose-500/5 p-3 space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-black text-[11px] uppercase tracking-wider">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Un-Confuser Diagnostic:</span>
                  </div>
                  <p className="text-foreground font-semibold leading-snug">
                    {gear.unConfuserTip}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
