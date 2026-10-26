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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <section className="space-y-8 rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
      {/* Section Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary-base text-white border-none text-xs font-bold uppercase tracking-wider">
            🎉 MADE IN CUBA Dance Festival 2026
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">• 4, 5 &amp; 6 December 2026 • Bournemouth</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Hotel, Travel &amp; Weekend Festival Guide
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need for an unforgettable coastal Cuban dance weekend celebrating 25+ years of Salsa Explosion heritage: partner hotel rates, nearby Bournemouth accommodations, full 3-day programme, and transit directions.
        </p>
      </div>

      {/* Flagship Venue Quick Tip */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            Flagship Venue in Bournemouth Triangle
          </span>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            All 3 Days of Workshops, Shows &amp; Socials hosted at <strong className="text-foreground">BOH Studios Bournemouth</strong> (104 Commercial Rd, BH2 5LR).
          </p>
        </div>
        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded shrink-0">
          Heart of Bournemouth
        </span>
      </div>

      {/* Grid: Official Hotel & B&B Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* The Roundhouse Hotel Dancer Block */}
        <Card className="border border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/[0.04]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary-base text-white font-bold text-[10px]">
                Recommended Hotel Partner
              </Badge>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Special Dancer Rate
              </span>
            </div>
            <CardTitle className="text-lg font-bold flex items-center gap-2 mt-2">
              <Hotel className="h-5 w-5 text-amber-500" />
              The Roundhouse Hotel Bournemouth
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Meyrick Rd, Lansdowne, Bournemouth BH1 2PR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              Stay in comfort during the festival weekend! Located just 5-8 minutes from BOH Studios with discounted room rates for Salsa Explosion dancers and late bar access.
            </p>

            <div className="rounded-lg border border-border/80 bg-background/80 p-3 space-y-2">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Dancer Block Rates (Code: <code className="text-primary font-mono">SALSA2026</code>)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">From £69/night</span>
              </div>
              <ul className="space-y-1 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Single Room: £69/night (inc. full English breakfast)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Double / Twin Room: £89/night (£44.50 per dancer sharing)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Late 02:30 bar access &amp; complimentary dancer parking permit</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="default" asChild className="h-8 text-xs font-semibold bg-primary-base hover:bg-primary-hover text-white">
                <a
                  href="tel:+441202554444"
                  className="inline-flex items-center gap-1.5"
                >
                  Call Hotel: 01202 554444
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild className="h-8 text-xs">
                <a
                  href="https://maps.google.com/?q=The+Roundhouse+Hotel+Bournemouth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Directions
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Walkable BOH Studios & Seafront Hotels */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <Badge variant="outline" className="w-fit text-[10px]">
              Walkable Hotels for Dance Weekends
            </Badge>
            <CardTitle className="text-lg font-bold flex items-center gap-2 mt-2">
              <Bed className="h-5 w-5 text-primary" />
              Nearby Hotels for BOH Studios Dance Weekends
            </CardTitle>
            <CardDescription className="text-xs">
              All within 3 to 10 minutes walking distance of BOH Studios (104 Commercial Rd, BH2 5LR)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="rounded-lg border border-border/70 p-3 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Hilton Bournemouth (4-Star Premium)</span>
                <span className="text-muted-foreground text-[11px]">3–5 min walk</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Terrace Rd, BH2 5EL. Heated pool, Schpoons &amp; Forx restaurant, and secure on-site parking.
              </p>
            </div>

            <div className="rounded-lg border border-border/70 p-3 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Hampton by Hilton Bournemouth</span>
                <span className="text-muted-foreground text-[11px]">5 min walk</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Upper Terrace Rd, BH2 5NW. Modern rooms with free hot breakfast included and on-site parking.
              </p>
            </div>

            <div className="rounded-lg border border-border/70 p-3 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Premier Inn Bournemouth Central</span>
                <span className="text-muted-foreground text-[11px]">8 min walk</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Westover Rd, BH1 2BZ. Budget-friendly, overlooking Lower Gardens and 2 minutes from the pier.
              </p>
            </div>

            <div className="rounded-lg border border-border/70 p-3 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Holiday Inn Bournemouth</span>
                <span className="text-muted-foreground text-[11px]">10 min walk</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Bath Rd, BH1 2NT. Direct road access from Wessex Way with large on-site car park and open-lobby bar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3-Day Festival Timetable Overview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold tracking-tight">
            Friday-to-Sunday Festival Timetable Overview
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Friday */}
          <div className="rounded-xl border border-border bg-background/80 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="text-sm font-bold text-foreground">Friday, 4 December</span>
                <span className="block text-[11px] text-muted-foreground">BOH Studios Bournemouth</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Day 1
              </Badge>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">19:00 - 20:00:</span> Registration &amp; Cuban Warm-Up Masterclasses
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">20:00 - 00:00:</span> Welcome Party &amp; Social Dancing Fiesta
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">2 Dedicated Rooms:</span> Room 1 (Salsa &amp; Timba) + Room 2 (Bachata)
                </div>
              </li>
            </ul>
          </div>

          {/* Saturday */}
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/[0.03] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <div>
                <span className="text-sm font-bold text-foreground">Saturday, 5 December</span>
                <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-semibold">BOH Studios Bournemouth</span>
              </div>
              <Badge className="bg-primary-base text-white text-[10px] font-bold">
                Gala Day
              </Badge>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">12:00 - 17:00:</span> 2 Days of Workshops: Cuban Casino, Timba &amp; Afro-Cuban
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">20:00 - 21:00:</span> Evening Masterclasses &amp; Show Previews
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">21:00 - 02:00:</span> 2 Spectacular Shows &amp; Social Fiesta Until 02:00 (2 Rooms)
                </div>
              </li>
            </ul>
          </div>

          {/* Sunday */}
          <div className="rounded-xl border border-border bg-background/80 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="text-sm font-bold text-foreground">Sunday, 6 December</span>
                <span className="block text-[11px] text-muted-foreground">BOH Studios Bournemouth</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Day 3
              </Badge>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">18:00 - 19:30:</span> Musicality, Tumbao Drills &amp; Reparto Masterclass
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">19:30 - 00:00:</span> Dancing with the Stars &amp; Farewell Social Fiesta
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Closing Social:</span> Celebrating 25+ Years of Salsa Explosion Heritage
                </div>
              </li>
            </ul>
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
          {FAQS.map((faq, index) => {
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
