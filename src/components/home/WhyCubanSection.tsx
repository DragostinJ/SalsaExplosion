"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sitePhotos } from "@/lib/site-photos";

const CELEBRATION_CARDS = [
  {
    kicker: "Rueda de Casino",
    title: "The Magic of the Rueda Circle",
    photo: sitePhotos.whyCuban.rueda,
    description:
      "In Rueda de Casino, couples form one dynamic circle and swap partners on the caller's command. Within minutes, everyone is dancing, communicating, and laughing together as one community.",
  },
  {
    kicker: "Havana Musicality",
    title: "Pure Havana Rhythm, Timba & Afro-Rumba",
    photo: sitePhotos.whyCuban.musicality,
    description:
      "Grounded, circular walking body movement that flows naturally in 360 degrees. From smooth Son Cubano to high-energy Timba and Afro-Rumba expression, you learn to truly feel the clave.",
  },
  {
    kicker: "Open Community",
    title: "Danced Other Styles Before? Come Play",
    photo: sitePhotos.whyCuban.community,
    description:
      "Already dance another style of Salsa, Bachata, or Latin dance? You will love how liberating and playful circular Cuban movement feels with zero ego and warm South Coast community spirit.",
  },
];

export function WhyCubanSection() {
  return (
    <section
      id="why-cuban"
      className="cv-auto py-14 sm:py-20 bg-[#080605] border-b border-amber-500/15 scroll-mt-20 text-white"
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
            THE HEARTBEAT OF HAVANA IN BOURNEMOUTH
          </Badge>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            What Makes Cuban Casino &amp; Rueda{" "}
            <span className="font-display italic font-normal text-amber-300 drop-shadow-sm">
              So Addictive?
            </span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Whether you are taking your very first dance step tonight or you already dance other styles and want to add authentic Cuban flavour to your repertoire—everyone is welcome in our circle.
          </p>
        </div>

        {/* 3-Card Pure Editorial Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {CELEBRATION_CARDS.map((card) => (
            <div
              key={card.title}
              className="art-card group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120d0a] p-6 sm:p-7 transition-all duration-500 hover:border-amber-400/40"
            >
              <div>
                {/* 1. Top Photo Frame */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-900 mb-5 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.photo}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    className="editorial-photo h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* 2. Clean Kicker */}
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400 mb-2">
                  {card.kicker}
                </div>

                {/* 3. Bold Editorial Title */}
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3 leading-snug">
                  {card.title}
                </h3>

                {/* 4. Concise 2-Sentence Paragraph */}
                <p className="text-stone-300 text-sm leading-relaxed mb-6 font-normal">
                  {card.description}
                </p>
              </div>

              {/* 5. Clean Bottom Link */}
              <div className="pt-4 border-t border-white/10">
                <Link
                  href="/dashboard/schedule"
                  className="text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Explore Classes</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          ))}
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
        </div>
      </div>
    </section>
  );
}
