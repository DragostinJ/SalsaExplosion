import Link from "next/link";
import { ArrowRight, Compass, Users, Sparkles, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LINEAR_POINTS = [
  "Danced back-and-forth in a narrow, rigid straight line with strict slot boundaries",
  "Heavy focus on solo spinning drills and staring into rehearsal studio mirrors",
  "Unbalanced lines where followers wait on the sidelines for a partner",
  "Intimidating if you attend alone without a regular dance partner",
];

const CUBAN_POINTS = [
  "360° Dynamic Circular Flow — natural, relaxed walking rhythm and fluid body movement",
  "High-Energy Rueda Circles — 40+ dancers switching partners, laughing, and learning as one team",
  "Strict Lead/Follow Ratio Capping — continuous partner rotation so you never wait out",
  "2-Room SB&K Socials — Dedicated Cuban Timba Ballroom + Separate Bachata & Kizomba Room!",
];

export function WhyCubanSection() {
  return (
    <section
      id="why-cuban"
      className="cv-auto py-14 sm:py-20 bg-muted/30 border-b border-border/70 scroll-mt-20"
      data-testid="why-cuban-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge
            variant="outline"
            className="border-primary-base/30 bg-primary-light/50 text-primary-hover px-3.5 py-1 text-xs font-semibold mb-3 inline-flex items-center gap-1.5"
          >
            <Compass className="h-3.5 w-3.5 text-primary-base" />
            🇨🇺 The Havana Difference • Circle vs. Slot
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Why Dancers Fall in Love with Authentic Cuban Salsa
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            New to Latin dance—or switching over from linear ballroom/LA style or Bachata? Discover why Cuban Casino &amp; Rueda de Casino is the most social, musical, and welcoming dance floor on the South Coast.
          </p>
        </div>

        {/* 2-Card Visual Contrast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card A: Standard Linear */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8 opacity-90 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full inline-block mb-1">
                    Rigid Slot Stepping
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">
                    Standard Linear / Cross-Body Classes Elsewhere
                  </h3>
                </div>
              </div>

              <ul className="space-y-3.5 pt-2 text-xs sm:text-sm text-muted-foreground">
                {LINEAR_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="h-3.5 w-3.5" />
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-border/50 text-xs text-muted-foreground italic">
              Often leaves beginners feeling self-conscious or isolated on the social dance floor.
            </div>
          </div>

          {/* Card B: Enrique's Cuban Casino */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-primary-base/50 bg-gradient-to-b from-card via-card to-primary-light/10 p-6 sm:p-8 shadow-lg shadow-primary-base/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-primary-base/20 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-hover bg-primary-light/80 px-2 py-0.5 rounded-full inline-block mb-1">
                    🏆 25+ Years Cuban Heritage
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-foreground">
                    Authentic Cuban Casino &amp; Rueda at BOH Studios
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-primary-base/15 flex items-center justify-center text-primary-base shrink-0">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <ul className="space-y-3.5 pt-2 text-xs sm:text-sm text-foreground/90 font-medium">
                {CUBAN_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-primary-base/20 space-y-3">
              <Button
                asChild
                className="w-full h-11 text-xs font-extrabold bg-primary-base hover:bg-primary-hover text-white shadow-sm"
              >
                <Link href="/dashboard/schedule">
                  Experience the Cuban Circle • Claim Free Trial
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Reassurance Pill */}
        <div className="mt-8 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary-base/30 bg-secondary-light/40 px-4 py-2 text-xs font-semibold text-secondary-hover shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-secondary-base shrink-0" />
            <span>Over 35% of our intermediate dancers switched from linear/ballroom salsa or modern bachata — our teachers make the circular transition seamless!</span>
          </div>
        </div>
      </div>
    </section>
  );
}
