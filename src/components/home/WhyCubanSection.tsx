import Link from "next/link";
import { ArrowRight, Sparkles, Users, Music, HeartHandshake, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CELEBRATION_CARDS = [
  {
    icon: Users,
    badge: "Instant Community",
    title: "🔄 The Magic of the Rueda Circle",
    subheading: "Danced in one big circle with partner swaps on every call",
    description:
      "In Rueda de Casino, couples form one big circle and swap partners on the caller's command. Within five minutes, everyone is laughing, high-fiving, and dancing together as one big family.",
    highlights: [
      "Continuous partner rotation so everyone dances",
      "Zero partner required — join solo anytime",
      "Instant social connection & high-fives on the floor",
    ],
    borderAccent: "border-primary-base/40 hover:border-primary-base",
  },
  {
    icon: Music,
    badge: "Authentic Musicality",
    title: "🎶 Pure Havana Rhythm, Timba & Afro-Rumba",
    subheading: "Grounded body movement and 360° fluid circular flow",
    description:
      "Grounded, natural walking movement that flows in a 360-degree circle. From smooth Son Cubano to high-energy Timba and Afro-Rumba expression, you learn to truly feel the music.",
    highlights: [
      "Authentic Afro-Cuban roots & cultural richness",
      "Musicality on Clave and dynamic body isolations",
      "Relaxed walking rhythm with zero rigid stress",
    ],
    borderAccent: "border-secondary-base/40 hover:border-secondary-base",
  },
  {
    icon: HeartHandshake,
    badge: "All Styles Welcome",
    title: "🤝 Danced Other Styles Before? Come Play!",
    subheading: "A warm, zero-ego transition for Latin & social dancers",
    description:
      "Already dance another style of Salsa, Bachata, or Latin dance? You'll love how playful and liberating circular Cuban movement feels. Our team will warmly guide you into Guapea and Dile Que No with zero ego and 100% fun.",
    highlights: [
      "Easily transfer your existing rhythm and frame",
      "Expand your repertoire with circular partnerwork",
      "Zero ego, 100% friendly South Coast community",
    ],
    borderAccent: "border-accent-tangerine/40 hover:border-accent-tangerine",
  },
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
            className="border-amber-500/30 bg-amber-500/10 text-amber-300 px-3.5 py-1 text-xs font-semibold mb-3 inline-flex items-center gap-1.5 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            🇨🇺 The Heartbeat of Havana in Bournemouth
          </Badge>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            What Makes Cuban Casino &amp; Rueda{" "}
            <span className="font-display italic font-normal text-amber-300 drop-shadow-sm">
              So Addictive?
            </span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Whether you are taking your very first dance step tonight or you already dance other styles and want to add authentic Cuban flavour to your repertoire—everyone is welcome in our circle.
          </p>
        </div>

        {/* 3-Card Joyful Celebration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {CELEBRATION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="flex flex-col justify-between rounded-3xl border border-amber-500/15 bg-gradient-to-b from-[#140f0c] via-[#100b08] to-[#080605] p-6 sm:p-7 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block">
                      {card.badge}
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs font-semibold text-amber-200/90 mt-1">
                      {card.subheading}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>

                  <ul className="space-y-2 pt-2 text-xs text-foreground/90 font-medium">
                    {card.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA & Reassurance Bar */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center">
          <Button
            asChild
            size="lg"
            className="h-11 px-7 text-xs sm:text-sm font-extrabold bg-primary-base hover:bg-primary-hover text-white shadow-md shadow-primary-base/20"
          >
            <Link href="/dashboard/schedule">
              Join the Cuban Circle • Claim Free Welcome Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <div className="inline-flex items-center gap-2 rounded-full border border-secondary-base/30 bg-secondary-light/40 px-4 py-1.5 text-xs font-semibold text-secondary-hover shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-secondary-base shrink-0" />
            <span>Over 35% of our community started in other dance styles — our instructors make your circular Cuban transition effortless and fun!</span>
          </div>
        </div>
      </div>
    </section>
  );
}
