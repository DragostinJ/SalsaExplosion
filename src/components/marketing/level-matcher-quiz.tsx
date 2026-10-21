"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LevelResult {
  levelTitle: string;
  badge: string;
  description: string;
  classTiming: string;
  recommendedTrack: string;
  href: string;
}

const LEVEL_RECOMMENDATIONS: Record<string, LevelResult> = {
  absolute_beginner: {
    levelTitle: "Beginner 1 • Fundamentos & Guapea",
    badge: "Level 1: No Experience Needed",
    description:
      "Start with basic footwork (Paso Básico), Cuban frame connection, Dile Que No, and your very first Dame in the Rueda circle. Zero partner needed!",
    classTiming: "Every Tuesday 7:00 PM • BOH Studios",
    recommendedTrack: "Claim your 1 Free Welcome Credit and join our friendly Tuesday cohort.",
    href: "/dashboard/schedule",
  },
  some_basics: {
    levelTitle: "Beginner 2 / Improver • Casino Turn Patterns",
    badge: "Level 2: 1-3 Months Dancing",
    description:
      "Master Vacílala, Enchúfla doble, Sombrero, and fluid partner lead/follow technique with Cuban musicality on Clave.",
    classTiming: "Every Tuesday 8:00 PM & Thursday 7:00 PM",
    recommendedTrack: "Great fit to build confidence with turn patterns and fast Rueda transitions.",
    href: "/dashboard/schedule",
  },
  rueda_regular: {
    levelTitle: "Intermediate • Complex Setenta & Dynamic Rueda",
    badge: "Level 3: 6+ Months Dancing",
    description:
      "Tackle Setenta Complicada, El Dedo, Bayamo, fast partner switches, and body isolations (Despelote).",
    classTiming: "Every Thursday 8:00 PM • BOH Studios",
    recommendedTrack: "High-energy Cuban Timba dancing with Maestro Enrique's advanced cohort.",
    href: "/dashboard/schedule",
  },
  experienced_timbero: {
    levelTitle: "Advanced / Masterclass • Contratiempo, Son & Afro-Cuban",
    badge: "Level 4: Masterclass Cohort",
    description:
      "Refine Contratiempo timing, Son Cubano elegance, Rumba Guaguancó styling, and complex multi-turn Casino combinations.",
    classTiming: "Thursday Masterclasses + Weekend Congress Bootcamps",
    recommendedTrack: "Eligible for Congress Masterclasses and 1-on-1 private styling coaching.",
    href: "/pricing",
  },
};

export function LevelMatcherQuiz() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const questions = [
    {
      key: "absolute_beginner",
      title: "I've never danced Cuban Salsa before",
      detail: "Or looking for a fresh, welcoming start from step one.",
    },
    {
      key: "some_basics",
      title: "I know basic steps & simple turns",
      detail: "Have danced 1-3 months; ready to learn classic Cuban Casino figures.",
    },
    {
      key: "rueda_regular",
      title: "I dance in the Rueda circle confidently",
      detail: "Familiar with Enchúfla, Sombrero, and ready for faster combinations.",
    },
    {
      key: "experienced_timbero",
      title: "Experienced Social Dancer / Salsero",
      detail: "1+ years dancing; looking for Contratiempo, Son, Afro styling & musicality.",
    },
  ];

  const result = selectedKey ? LEVEL_RECOMMENDATIONS[selectedKey] : null;

  return (
    <div
      data-testid="level-matcher-card"
      className="rounded-3xl border border-primary-base/20 bg-gradient-to-br from-primary-light/30 via-background to-secondary-light/20 p-6 sm:p-8 shadow-sm"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-base/10 px-3 py-1 text-xs font-black text-rose-800 dark:text-rose-300">
            <Sparkles className="h-3.5 w-3.5 text-primary-base" />
            <span>Interactive Level Finder • 15 Seconds</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Not Sure Which Cuban Salsa Level to Book?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tap your dance experience below to get an instant tailored class recommendation from Maestro Enrique.
          </p>
        </div>

        {!result ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {questions.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => setSelectedKey(q.key)}
                className="text-left rounded-2xl border bg-card p-4 hover:border-primary-base hover:shadow-sm transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-base"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary-base transition-colors">
                      {q.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {q.detail}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:translate-x-1 group-hover:text-primary-base transition-all" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/40 bg-card p-6 shadow-sm space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {result.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground">
                  {result.levelTitle}
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedKey(null)}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 self-start sm:self-auto"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Change Answer
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
              {result.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold">
                <CheckCircle2 className="h-4 w-4 text-primary-base shrink-0" />
                <span>{result.classTiming}</span>
              </div>

              <Button
                asChild
                size="default"
                className="bg-primary-base hover:bg-primary-hover text-white font-extrabold shadow-sm text-xs min-h-10"
              >
                <Link href={result.href}>
                  <span>Book This Level • Free Welcome Pass</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
