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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      "Convenient parking is located 2 minutes walk away at Bournemouth Library (Avenue Rd, BH2 5SL) and West Hill Car Park (BH2 5PG). Free on-street parking along Commercial Road and surrounding streets is usually available after 6:00 PM.",
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
      "You can reserve your pass online in seconds with Apple Pay, Google Pay, or card to guarantee your Lead/Follow balance spot and avoid door queues. If capacity allows, cash/card entry at the desk is also accepted.",
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
    <section className="mt-12 space-y-8 rounded-3xl border border-amber-500/20 bg-card/60 p-6 sm:p-10 shadow-sm backdrop-blur-xs">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-amber-600 text-white font-bold text-xs uppercase tracking-wider">
            Venue & Social Guide
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            BOH Studios Bournemouth (The Triangle)
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Everything You Need to Know for {eventTitle}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Direct directions, parking, floor etiquette, and party schedule for an authentic Cuban dance night in the heart of Bournemouth.
        </p>
      </div>

      {/* Guide Pillars */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-background/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <MapPin className="h-4 w-4" />
              <CardTitle className="text-sm font-bold">Location</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">{venueName}</p>
            <p>104 Commercial Road</p>
            <p>Bournemouth, BH2 5LR</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-1">
              Next to The Triangle
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Car className="h-4 w-4" />
              <CardTitle className="text-sm font-bold">Parking</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Triangle Car Park</p>
            <p>2 mins walk (BH2 5RH)</p>
            <p>Avenue Rd Multi-Storey</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
              Free on-street after 6pm
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <GlassWater className="h-4 w-4" />
              <CardTitle className="text-sm font-bold">Licensed Bar</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Authentic Cuban Rum</p>
            <p>Havana Club 3 & 7 Años</p>
            <p>Cold Beers, Ciders & Softs</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-1">
              Contactless accepted
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Music2 className="h-4 w-4" />
              <CardTitle className="text-sm font-bold">Cuban Music</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Curated by DJ Enrique</p>
            <p>Timba, Son, Salsa & Reparto</p>
            <p>Sensual Bachata Room (Saturdays)</p>
            <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium pt-1">
              Top Sound & Sprung Wood
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evening Timetable Breakdown */}
      <div className="rounded-2xl border border-border/80 bg-background/70 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-bold tracking-tight">
            Evening Format & Flow
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-border/50 bg-card p-3 space-y-1">
            <span className="font-bold text-amber-600 dark:text-amber-400 block">
              Phase 1 • 7:30 PM
            </span>
            <p className="font-semibold text-foreground">Warm-up & Technique</p>
            <p className="text-muted-foreground text-[11px]">
              Cuban body isolation, footwork drill, and Rueda de Casino basics.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-3 space-y-1">
            <span className="font-bold text-amber-600 dark:text-amber-400 block">
              Phase 2 • 8:30 PM
            </span>
            <p className="font-semibold text-foreground">Partnerwork Combinations</p>
            <p className="text-muted-foreground text-[11px]">
              Turn patterns, dynamic Dile Que No transitions & lead/follow frame.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-3 space-y-1">
            <span className="font-bold text-amber-600 dark:text-amber-400 block">
              Phase 3 • 9:30 PM – Late
            </span>
            <p className="font-semibold text-foreground">Social Party Fiesta</p>
            <p className="text-muted-foreground text-[11px]">
              Social dancing, spontaneous Rueda circles, and Latin party animation.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border bg-background/80">
          {STUDIO_FAQS.map((faq, index) => {
            const isOpen = openFaqIndices.includes(index);
            return (
              <div key={faq.question} className="p-4 transition-colors">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-foreground hover:text-primary"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
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
