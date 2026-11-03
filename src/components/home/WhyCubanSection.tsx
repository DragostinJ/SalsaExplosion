"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { sitePhotos } from "@/lib/site-photos";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

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
      className="cv-auto py-12 sm:py-16 bg-paper border-b-4 border-ink scroll-mt-20 text-ink"
      data-testid="why-cuban-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 border border-ink bg-poster-mustard text-ink px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_0_var(--color-ink)]">
            <Sparkles className="h-3.5 w-3.5 text-accent-red" />
            THE HEARTBEAT OF HAVANA IN BOURNEMOUTH
          </div>
          <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.section} pt-1`}>
            WHAT MAKES CUBAN CASINO &amp; RUEDA{" "}
            <span className="text-accent-red">
              SO ADDICTIVE?
            </span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ink font-semibold leading-relaxed">
            Whether you are taking your very first dance step tonight or you already dance other styles and want to add authentic Cuban flavour to your repertoire—everyone is welcome in our circle.
          </p>
        </div>

        {/* 3-Card Pure Editorial Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {CELEBRATION_CARDS.map((card) => (
            <div
              key={card.title}
              className="group relative flex flex-col justify-between border-4 border-ink bg-paper p-5 sm:p-6 shadow-[6px_6px_0_0_var(--color-ink)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div>
                {/* 1. Top Photo Frame */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink mb-4 border-2 border-ink">
                  <Image
                    src={card.photo}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="editorial-photo h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* 2. Clean Kicker */}
                <div className={`${KICKER} text-accent-red mb-1.5`}>
                  {card.kicker}
                </div>

                {/* 3. Bold Editorial Title */}
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink mb-2 leading-snug">
                  {card.title}
                </h3>

                {/* 4. Concise 2-Sentence Paragraph */}
                <p className="text-ink text-xs sm:text-sm leading-relaxed mb-4 font-medium">
                  {card.description}
                </p>
              </div>

              {/* 5. Clean Bottom Link */}
              <div className="pt-3 border-t-2 border-ink">
                <Link
                  href="/classes"
                  className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold w-full inline-flex items-center justify-center gap-1.5 min-h-[40px]`}
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
          <Link
            href="/classes"
            className={`${POSTER_BUTTON} border-poster-red bg-poster-red text-ink hover:bg-ink hover:text-ink text-xs sm:text-sm font-black uppercase tracking-wider px-6 py-3 min-h-[44px] shadow-[4px_4px_0_0_var(--color-ink)] inline-flex items-center`}
          >
            Join the Cuban Circle • £12 / £14 at the Door
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
