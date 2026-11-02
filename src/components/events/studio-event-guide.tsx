"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Car,
  GlassWater,
  Music2,
} from "lucide-react";
import { TYPE, KICKER } from "@/components/poster/poster-kit";

interface StudioEventGuideProps {
  eventTitle: string;
  venueName: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const STUDIO_FAQS: FaqItem[] = [
  {
    question: "Do I need to come with a partner?",
    answer:
      "Not at all! Partner rotation is standard practice across all Cuban Salsa and Rueda de Casino classes. During the social party, our community is warm, friendly, and dancers invite each other onto the floor throughout the night.",
  },
  {
    question: "Where can I park near BOH Studios Bournemouth?",
    answer:
      "Convenient parking is located 2 minutes walk away at Bournemouth Library (Avenue Rd, BH2 5SL) and West Hill Car Park (BH2 5PG). Free on-street parking along Commercial Road and surrounding streets is usually available after 18:00.",
  },
  {
    question: "Is there a licensed bar inside the venue?",
    answer:
      "Yes! BOH Studios features a licensed bar serving chilled refreshments, Cuban Havana Club rum, beer, wine, and soft drinks. Card and contactless payments are accepted at the bar.",
  },
  {
    question: "What is the dress code and shoe policy?",
    answer:
      "Smart casual / comfortable dancewear. BOH Studios has a pristine sprung wooden dance floor, so please bring clean suede-sole dance shoes, smooth leather shoes, or clean dance sneakers. Stiletto metal heels without protective caps are not permitted.",
  },
  {
    question: "Can I pay at the door or should I reserve online?",
    answer:
      "Book your pass online with Apple Pay, Google Pay or card to secure it and skip the door queue. Choosing Lead or Follow only helps the teachers plan the rotations; it never limits who can book.",
  },
];

export function StudioEventGuide({
  eventTitle,
  venueName,
}: StudioEventGuideProps) {
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);

  function toggleFaq(index: number) {
    setOpenFaqIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  return (
    <section className="mt-12 space-y-8 border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_#161311]">
      {/* Header */}
      <div className="space-y-2 border-b-4 border-ink pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border-2 border-ink bg-poster-mustard px-2.5 py-0.5 text-xs font-bold uppercase text-ink">
            Guía del evento
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
            BOH Studios Bournemouth (The Triangle)
          </span>
        </div>
        <p className={KICKER}>Venue &amp; Social Guide</p>
        <h2 className={`font-display ${TYPE.card} sm:text-4xl text-ink leading-tight`}>
          Everything You Need to Know for {eventTitle}
        </h2>
        <p className="text-xs sm:text-sm text-ink max-w-2xl leading-relaxed font-medium">
          Direct directions, parking, floor etiquette, and party schedule for an authentic Cuban dance night in the heart of Bournemouth.
        </p>
      </div>

      {/* Guide Pillars */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="border-2 border-ink bg-surface-1 p-4 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-accent-red font-bold uppercase mb-2">
            <MapPin className="h-4 w-4" />
            <h3 className="font-display text-base text-ink">Location</h3>
          </div>
          <p className="font-bold text-ink">{venueName}</p>
          <p className="text-ink">104 Commercial Road</p>
          <p className="text-ink">Bournemouth, BH2 5LR</p>
          <p className="text-[11px] font-bold text-accent-red pt-1">
            Next to The Triangle
          </p>
        </article>

        <article className="border-2 border-ink bg-surface-1 p-4 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-accent-teal font-bold uppercase mb-2">
            <Car className="h-4 w-4" />
            <h3 className="font-display text-base text-ink">Parking</h3>
          </div>
          <p className="font-bold text-ink">Triangle Car Park</p>
          <p className="text-ink">2 mins walk (BH2 5RH)</p>
          <p className="text-ink">Avenue Rd Multi-Storey</p>
          <p className="text-[11px] font-bold text-accent-teal pt-1">
            Free on-street after 18:00
          </p>
        </article>

        <article className="border-2 border-ink bg-surface-1 p-4 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-poster-mustard font-bold uppercase mb-2">
            <GlassWater className="h-4 w-4" />
            <h3 className="font-display text-base text-ink">Licensed Bar</h3>
          </div>
          <p className="font-bold text-ink">Authentic Cuban Rum</p>
          <p className="text-ink">Havana Club 3 &amp; 7 Años</p>
          <p className="text-ink">Cold Beers, Ciders &amp; Softs</p>
          <p className="text-[11px] font-bold text-ink/70 pt-1">
            Contactless accepted
          </p>
        </article>

        <article className="border-2 border-ink bg-surface-1 p-4 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-accent-red font-bold uppercase mb-2">
            <Music2 className="h-4 w-4" />
            <h3 className="font-display text-base text-ink">Cuban Music</h3>
          </div>
          <p className="font-bold text-ink">Curated by DJ Enrique</p>
          <p className="text-ink">Timba, Son, Salsa &amp; Reparto</p>
          <p className="text-ink">Sensual Bachata Room</p>
          <p className="text-[11px] font-bold text-accent-red pt-1">
            Top Sound &amp; Sprung Wood
          </p>
        </article>
      </div>

      {/* Evening Timetable Breakdown */}
      <div className="border-2 border-ink bg-surface-1 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent-red" />
          <h3 className={`font-display ${TYPE.card} text-ink`}>
            Evening Format &amp; Flow
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="border border-ink bg-paper p-4 space-y-1">
            <span className="font-bold uppercase text-accent-red block">
              Phase 1 · 19:30
            </span>
            <p className="font-bold text-ink">Warm-up &amp; Technique</p>
            <p className="text-ink/70 text-[11px] leading-relaxed">
              Cuban body isolation, footwork drill, and Rueda de Casino basics.
            </p>
          </div>
          <div className="border border-ink bg-paper p-4 space-y-1">
            <span className="font-bold uppercase text-accent-red block">
              Phase 2 · 20:30
            </span>
            <p className="font-bold text-ink">Partnerwork Combinations</p>
            <p className="text-ink/70 text-[11px] leading-relaxed">
              Turn patterns, dynamic Dile Que No transitions &amp; lead/follow frame.
            </p>
          </div>
          <div className="border border-ink bg-paper p-4 space-y-1">
            <span className="font-bold uppercase text-accent-red block">
              Phase 3 · 21:30 – Late
            </span>
            <p className="font-bold text-ink">Social Party Fiesta</p>
            <p className="text-ink/70 text-[11px] leading-relaxed">
              Social dancing, spontaneous Rueda circles, and Latin party animation.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-accent-teal" />
          <h3 className={`font-display ${TYPE.card} text-ink`}>
            Frequently Asked Questions
          </h3>
        </div>

        <div className="divide-y-2 divide-ink border-2 border-ink bg-paper">
          {STUDIO_FAQS.map((faq, index) => {
            const isOpen = openFaqIndices.includes(index);
            return (
              <div key={faq.question} className="p-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left text-sm font-bold text-ink hover:text-poster-red transition-colors"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-ink" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs text-ink leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
