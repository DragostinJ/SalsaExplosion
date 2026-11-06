"use client";

import { useState } from "react";
import {
  Hotel,
  MapPin,
  Calendar,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Bed,
  CheckCircle2,
} from "lucide-react";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Do I need to bring a partner to the Made in Cuba Festival?",
    answer:
      "No partner required! All daytime workshops rotate partners continuously so everyone dances with equal practice time. Evening socials are exceptionally welcoming, with dancers inviting each other regardless of level.",
  },
  {
    question: "Where do the festival events take place across the weekend?",
    answer:
      "All 3 days of Made in Cuba Dance Weekend take place at BOH Studios Bournemouth, 104 Commercial Rd in The Triangle (BH2 5LR). Friday 4 Dec (19:00–00:00 Welcome Party & Masterclasses), Saturday 5 Dec (12:00–17:00 workshops, 20:00–02:00 shows & party), and Sunday 6 Dec (18:00–00:00 classes & farewell fiesta).",
  },
  {
    question: "What are the two dedicated rooms during the parties?",
    answer:
      "Both Friday and Saturday nights feature two separate rooms with dedicated sound systems: Room 1 is the Cuban Salsa & Timba Room with authentic Havana rhythms, and Room 2 is the Bachata Room playing modern, sensual, and traditional Dominican Bachata.",
  },
  {
    question: "Is dancer parking available on-site at the venue?",
    answer:
      "Yes. For BOH Studios, the Bournemouth Library Car Park (Avenue Rd, BH2 5SL) is just a 2-minute walk away, with free on-street evening parking along Commercial Road after 18:00. The Roundhouse Hotel also has secure underground parking with discounted dancer permits.",
  },
  {
    question: "What is the dress code for Saturday Gala & Shows Night?",
    answer:
      "Saturday Gala is 'Havana Glamour / Tropical Elegance' — think crisp guayaberas, vibrant dresses, fedoras, and elegant dance attire. Remember your suede-sole or smooth leather dance shoes for the sprung Canadian maple floor at BOH Studios!",
  },
  {
    question: "How do I book passes or get direct enquiries?",
    answer:
      "You can book passes directly online with instant confirmation or contact Maestro Enrique Perez Valdes and the festival team on 07969 633701, email info@salsaexplosion.co.uk, or DM on Instagram @salsaexplosion.",
  },
];

export function CongressTravelGuide() {
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);

  function toggleFaq(index: number) {
    setOpenFaqIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  return (
    <section className="space-y-8 border-4 border-ink bg-paper p-6 sm:p-8 text-ink shadow-[8px_8px_0_0_var(--color-ink)]">
      {/* Section Header */}
      <div className="border-b-4 border-ink pb-4 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border-2 border-ink bg-poster-mustard px-2.5 py-0.5 text-xs font-bold uppercase text-ink">
            Guía de viaje
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
            4, 5 &amp; 6 December 2026 · Bournemouth
          </span>
        </div>
        <p className={KICKER}>MADE IN CUBA Dance Festival 2026</p>
        <h2 className={`font-display ${TYPE.card} sm:text-4xl text-ink leading-tight`}>
          Hotel, Travel &amp; Festival Guide
        </h2>
        <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium max-w-3xl">
          Everything you need for an unforgettable coastal Cuban dance weekend celebrating 25+ years of Salsa Explosion heritage: partner hotel rates, nearby accommodations, full 3-day programme, and transit directions.
        </p>
      </div>

      {/* Flagship Venue Quick Tip */}
      <div className="border-2 border-ink bg-poster-mustard/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-bold text-ink flex items-center gap-1.5 uppercase">
            <MapPin className="h-4 w-4 text-accent-red shrink-0" />
            Flagship Venue in Bournemouth Triangle
          </span>
          <p className="text-ink text-[11px] leading-relaxed">
            All 3 Days of Workshops, Shows &amp; Socials hosted at <strong className="text-ink">BOH Studios Bournemouth</strong> (104 Commercial Rd, BH2 5LR).
          </p>
        </div>
        <span className="text-[11px] font-bold uppercase border border-ink bg-paper px-2 py-1 text-ink shrink-0">
          Heart of Bournemouth
        </span>
      </div>

      {/* Grid: Official Hotel & B&B Options */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* The Roundhouse Hotel Dancer Block */}
        <article className="border-4 border-ink bg-paper p-5 space-y-4 text-ink shadow-[6px_6px_0_0_var(--color-ink)]">
          <div className="border-b-2 border-ink pb-3">
            <div className="flex items-center justify-between">
              <span className="border-2 border-ink bg-poster-teal px-2 py-0.5 text-xs font-bold uppercase text-ink">
                Recommended Partner
              </span>
              <span className="text-xs font-bold uppercase text-accent-red">
                Special Rate
              </span>
            </div>
            <h3 className={`font-display ${TYPE.card} text-ink leading-tight mt-2 flex items-center gap-2`}>
              <Hotel className="h-5 w-5 text-accent-red" />
              The Roundhouse Hotel
            </h3>
            <p className="text-xs text-ink/70 flex items-center gap-1 mt-1 font-medium">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              Meyrick Rd, Lansdowne, Bournemouth BH1 2PR
            </p>
          </div>

          <p className="text-xs text-ink leading-relaxed font-medium">
            Stay in comfort during the festival weekend! Located just 5-8 minutes from BOH Studios with discounted room rates for Salsa Explosion dancers and late bar access.
          </p>

          <div className="border-2 border-ink bg-surface-1 p-3.5 space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-x-2 font-bold text-ink">
              <span>Dancer Block (Code: <code className="font-mono text-accent-red">SALSA2026</code>)</span>
              <span className="font-display text-base text-accent-red">From £69/night</span>
            </div>
            <ul className="space-y-1 text-[11px] font-semibold text-ink">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-teal shrink-0" />
                <span>Single Room: £69/night (inc. full English breakfast)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-teal shrink-0" />
                <span>Double / Twin Room: £89/night (£44.50 per dancer sharing)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-teal shrink-0" />
                <span>Late 02:30 bar access &amp; complimentary dancer parking permit</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="tel:+441202554444"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} min-h-[40px] px-3 text-xs`}
            >
              Call: 01202 554444
            </a>
            <a
              href="https://maps.google.com/?q=The+Roundhouse+Hotel+Bournemouth"
              target="_blank"
              rel="noopener noreferrer"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper min-h-[40px] px-3 text-xs`}
            >
              <MapPin className="h-3.5 w-3.5 mr-1" />
              Directions
            </a>
          </div>
        </article>

        {/* Nearby Walkable BOH Studios & Seafront Hotels */}
        <article className="border-4 border-ink bg-paper p-5 space-y-4 text-ink shadow-[6px_6px_0_0_var(--color-ink)]">
          <div className="border-b-2 border-ink pb-3">
            <span className="border-2 border-ink bg-poster-mustard px-2 py-0.5 text-xs font-bold uppercase text-ink">
              Walkable Hotels
            </span>
            <h3 className={`font-display ${TYPE.card} text-ink leading-tight mt-2 flex items-center gap-2 max-[360px]:text-2xl`}>
              <Bed className="h-5 w-5 text-accent-teal" />
              Nearby Accommodations
            </h3>
            <p className="text-xs text-ink/70 mt-1 font-medium">
              Within 3 to 10 minutes walking distance of BOH Studios (104 Commercial Rd, BH2 5LR)
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="border border-ink bg-surface-1 p-3 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-x-2 font-bold text-ink">
                <span>Hilton Bournemouth (4-Star Premium)</span>
                <span className="text-ink/70 text-[11px]">3–5 min walk</span>
              </div>
              <p className="text-[11px] text-ink/70 font-medium">
                Terrace Rd, BH2 5EL. Heated pool, Schpoons &amp; Forx restaurant, and secure parking.
              </p>
            </div>

            <div className="border border-ink bg-surface-1 p-3 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-x-2 font-bold text-ink">
                <span>Hampton by Hilton Bournemouth</span>
                <span className="text-ink/70 text-[11px]">5 min walk</span>
              </div>
              <p className="text-[11px] text-ink/70 font-medium">
                Upper Terrace Rd, BH2 5NW. Modern rooms with free hot breakfast included.
              </p>
            </div>

            <div className="border border-ink bg-surface-1 p-3 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-x-2 font-bold text-ink">
                <span>Premier Inn Bournemouth Central</span>
                <span className="text-ink/70 text-[11px]">8 min walk</span>
              </div>
              <p className="text-[11px] text-ink/70 font-medium">
                Westover Rd, BH1 2BZ. Budget-friendly, overlooking Lower Gardens and pier.
              </p>
            </div>

            <div className="border border-ink bg-surface-1 p-3 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-x-2 font-bold text-ink">
                <span>Holiday Inn Bournemouth</span>
                <span className="text-ink/70 text-[11px]">10 min walk</span>
              </div>
              <p className="text-[11px] text-ink/70 font-medium">
                Bath Rd, BH1 2NT. Direct road access from Wessex Way with large car park.
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* 3-Day Festival Timetable Overview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent-red" />
          <h3 className={`font-display ${TYPE.card} text-ink`}>
            Festival Timetable Overview
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Friday */}
          <div className="border-2 border-ink bg-surface-1 p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-ink pb-2">
              <div>
                <span className="font-display text-base text-accent-red block">Friday, 4 December</span>
                <span className="text-[11px] font-bold text-ink/70">BOH Studios</span>
              </div>
              <span className="border border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase text-ink">
                Day 1
              </span>
            </div>
            <ul className="space-y-2 text-xs text-ink font-medium">
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-accent-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">19:00 - 20:00:</span> Registration &amp; Cuban Warm-Up Masterclasses
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-accent-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">20:00 - 00:00:</span> Welcome Party &amp; Social Dancing Fiesta
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-teal shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">2 Rooms:</span> Room 1 (Salsa &amp; Timba) + Room 2 (Bachata)
                </div>
              </li>
            </ul>
          </div>

          {/* Saturday */}
          <div className="border-2 border-ink bg-poster-mustard/20 p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-ink pb-2">
              <div>
                <span className="font-display text-base text-accent-red block">Saturday, 5 December</span>
                <span className="text-[11px] font-bold text-ink/70">BOH Studios</span>
              </div>
              <span className="border-2 border-ink bg-poster-red px-2 py-0.5 text-xs font-bold uppercase text-ink">
                Gala Day
              </span>
            </div>
            <ul className="space-y-2 text-xs text-ink font-medium">
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-accent-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">12:00 - 17:00:</span> Workshops: Casino, Timba &amp; Afro-Cuban
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-accent-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">20:00 - 21:00:</span> Evening Masterclasses &amp; Show Previews
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-accent-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">21:00 - 02:00:</span> 2 Shows &amp; Social Fiesta Until 02:00 (2 Rooms)
                </div>
              </li>
            </ul>
          </div>

          {/* Sunday */}
          <div className="border-2 border-ink bg-surface-1 p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-ink pb-2">
              <div>
                <span className="font-display text-base text-accent-red block">Sunday, 6 December</span>
                <span className="text-[11px] font-bold text-ink/70">BOH Studios</span>
              </div>
              <span className="border border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase text-ink">
                Day 3
              </span>
            </div>
            <ul className="space-y-2 text-xs text-ink font-medium">
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-accent-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">18:00 - 19:30:</span> Musicality, Tumbao Drills &amp; Reparto
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-accent-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">19:30 - 00:00:</span> Dancing with the Stars &amp; Farewell Fiesta
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-teal shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">Closing Social:</span> Celebrating 25+ Years Heritage
                </div>
              </li>
            </ul>
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
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndices.includes(index);
            return (
              <div key={faq.question} className="px-4 py-1.5">
                <button
                  type="button"
                  className="flex min-h-[44px] w-full items-center justify-between py-2 text-left text-sm font-bold text-ink hover:text-poster-red transition-colors"
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
