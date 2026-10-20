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
    question: "Do I need to bring a partner to the Congress?",
    answer:
      "No partner required! All daytime masterclasses rotate partners continuously so everyone dances with equal practice time. Evening socials are notoriously welcoming, with dancers inviting each other regardless of level.",
  },
  {
    question: "How do I get to the venue from Bournemouth Train & Coach Station?",
    answer:
      "The Roundhouse Hotel and BOH Studios are located in Lansdowne, just a 6-minute walk (0.3 miles) from Bournemouth Central Train & Coach Station. Direct South Western Railway trains run from London Waterloo in 1h 45m.",
  },
  {
    question: "Is dancer parking available on-site?",
    answer:
      "Yes. The Roundhouse Hotel has secure underground parking with a discounted rate for Salsa Explosion pass holders (validate your registration QR pass at hotel reception). Additional 24/7 parking is located at Lansdowne Road Car Park (BH1 1SN, 2 min walk).",
  },
  {
    question: "What is the dress code for the Saturday Havana Gala Night?",
    answer:
      "Saturday Havana Gala is 'Havana Glamour / Tropical Elegance' — think crisp guayaberas, vibrant dresses, fedoras, and elegant dance attire. Remember your suede-sole or smooth leather dance shoes for the sprung ballroom floor!",
  },
  {
    question: "Can I upgrade my pass at the door if tier spaces are still available?",
    answer:
      "Yes, subject to Lead/Follow balance availability. However, Congress passes usually sell out in advance to ensure dance floor comfort, so booking early via your Salsa Explosion account is strongly advised.",
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
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-xs font-semibold">
            Bournemouth Summer Congress 2026
          </Badge>
          <span className="text-xs text-muted-foreground">• Lansdowne Coastal Hub</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Hotel, Travel & Weekend Festival Guide
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need for an unforgettable coastal dance weekend: official room block rates, nearby B&Bs, full 3-day timetable, and transit directions.
        </p>
      </div>

      {/* Grid: Official Hotel & B&B Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* The Roundhouse Hotel Dancer Block */}
        <Card className="border border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/[0.04]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-500 text-white font-bold text-[10px]">
                Official Festival Hotel
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
              Stay in the heart of the action! All daytime masterclasses, evening socials, and late-night social dancing take place inside The Roundhouse Hotel and adjacent BOH Studios ballrooms.
            </p>

            <div className="rounded-lg border border-border/80 bg-background/80 p-3 space-y-2">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Dancer Block Rates (Code: <code className="text-primary font-mono">SALSA2026</code>)</span>
                <span className="text-amber-500 font-bold">From £69/night</span>
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
                  <span>Late 2:30 AM bar access & complimentary dancer parking permit</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="default" asChild className="h-8 text-xs font-semibold">
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
              <span className="text-sm font-bold text-foreground">Friday, 17 July</span>
              <Badge variant="secondary" className="text-[10px]">
                Day 1
              </Badge>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">18:00 - 20:00:</span> Registration & Badge Pick-Up (Roundhouse Foyer)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">20:00 - 21:00:</span> Welcome Warm-up Rueda Masterclass
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">21:00 - 02:00:</span> Welcome Social & DJ Sets (White & Red Fiesta)
                </div>
              </li>
            </ul>
          </div>

          {/* Saturday */}
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/[0.03] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <span className="text-sm font-bold text-foreground">Saturday, 18 July</span>
              <Badge className="bg-amber-500 text-white text-[10px] font-bold">
                Gala Day
              </Badge>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">10:30 - 13:00:</span> Daytime Masterclasses: Afro-Cuban & Casino Footwork
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">14:00 - 17:30:</span> Advanced Rueda Callers & Son Styling Intensives
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">20:30 - 03:00:</span> The Havana Gala Show & Live Band Cuban Social
                </div>
              </li>
            </ul>
          </div>

          {/* Sunday */}
          <div className="rounded-xl border border-border bg-background/80 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-bold text-foreground">Sunday, 19 July</span>
              <Badge variant="secondary" className="text-[10px]">
                Day 3
              </Badge>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">11:30 - 14:00:</span> Musicality, Tumbao Drills & Reparto Masterclass
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">15:00 - 19:00:</span> Sunday Beach Farewell Open-Air Social (Bournemouth Pier)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">19:30:</span> Farewell Tapas & Paella Dinner (Optional)
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
