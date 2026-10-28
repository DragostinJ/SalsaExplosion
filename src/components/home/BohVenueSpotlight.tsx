"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Car,
  Bus,
  DoorOpen,
  ExternalLink,
  Clock,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ArrivalTab = "parking" | "transit" | "door";

export function BohVenueSpotlight() {
  const [activeTab, setActiveTab] = useState<ArrivalTab>("parking");

  return (
    <section
      id="venue-spotlight"
      className="cv-auto py-16 sm:py-24 border-b border-border/70 bg-canvas scroll-mt-20"
      data-testid="boh-venue-spotlight"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge
            variant="outline"
            className="border-secondary-base/40 bg-secondary-light/50 text-secondary-hover px-3.5 py-1 text-xs font-semibold mb-3 inline-flex items-center gap-1.5"
          >
            <MapPin className="h-3.5 w-3.5 text-secondary-base" />
            Flagship Home Venue • Bournemouth Town Centre
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Hosted at BOH Studios Bournemouth
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            104 Commercial Road, Bournemouth, BH2 5LR — Salsa Explosion proudly hires BOH Studios (co-owned by Alex Spindlove) as our flagship home base in The Triangle for our Thursday &amp; Sunday Cuban nights, special event multi-room SB&amp;K parties, and the Made in Cuba Congress.
          </p>
        </div>

        {/* Crisp 3-Pillar Venue Specification Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Flagship Location</span>
              </div>
              <h4 className="text-base font-bold text-foreground">104 Commercial Rd, BH2 5LR</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Triangle, Bournemouth town centre. Dual-room venue featuring authentic Canadian sprung maple dance floors.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Weekly Schedule</span>
              </div>
              <h4 className="text-base font-bold text-foreground">Thursdays 18:45 &amp; Sundays 18:15</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Doors open 15 minutes before class. Progressive levels 1–4 followed by Bournemouth&apos;s late-night Havana social fiesta.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <Ticket className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Door Admission</span>
              </div>
              <h4 className="text-base font-bold text-foreground">£12 / £14 at the Door</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                £12 for 1 class or £14 for 2 classes on the same night (includes social party). Pay contactless or cash at reception.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Parking, Transit & First-Timer Arrival Guide */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  Dancer Arrival Planner
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground">
                How to Get to BOH Studios (BH2 5LR)
              </h3>
            </div>

            {/* Tab Controls */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-muted/60 p-1 border border-border/60 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("parking")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "parking"
                    ? "bg-primary-base text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Car className="h-3.5 w-3.5" />
                Easy Parking (2–4 Min Walk)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("transit")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "transit"
                    ? "bg-primary-base text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bus className="h-3.5 w-3.5" />
                Bus & Train
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("door")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "door"
                    ? "bg-primary-base text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <DoorOpen className="h-3.5 w-3.5" />
                First-Timer Door Guide
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[140px] flex flex-col justify-between">
            {activeTab === "parking" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs leading-relaxed animate-in fade-in-50 duration-200">
                <div className="rounded-xl border border-border/70 bg-background/80 p-3.5 space-y-1">
                  <div className="font-extrabold text-foreground flex items-center gap-1.5">
                    <span>🅿️</span>
                    <span>The Avenue Multi-Storey (BH2 5SL)</span>
                  </div>
                  <p className="text-muted-foreground">
                    Only a 3-minute flat walk to BOH Studios. Covered, well-lit, and CCTV-monitored with affordable evening flat rates after 18:00.
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3.5 space-y-1">
                  <div className="font-extrabold text-foreground flex items-center gap-1.5">
                    <span>🅿️</span>
                    <span>West Hill Car Park (BH2 5PG)</span>
                  </div>
                  <p className="text-muted-foreground">
                    Just a 4-minute walk straight down Commercial Hill. Open-air surface parking with quick contactless pay via RingGo or card.
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3.5 space-y-1">
                  <div className="font-extrabold text-foreground flex items-center gap-1.5">
                    <span>🅿️</span>
                    <span>Cotlands Road & Triangle Bays</span>
                  </div>
                  <p className="text-muted-foreground">
                    Free on-street evening parking bays available around The Triangle and Poole Hill after 20:00 (subject to council signs).
                  </p>
                </div>
              </div>
            )}

            {activeTab === "transit" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs leading-relaxed animate-in fade-in-50 duration-200">
                <div className="rounded-xl border border-border/70 bg-background/80 p-3.5 space-y-1">
                  <div className="font-extrabold text-foreground flex items-center gap-1.5">
                    <span>🚌</span>
                    <span>Bournemouth Square & Poole Hill Bus Stops</span>
                  </div>
                  <p className="text-muted-foreground">
                    A quick 2-minute walk from major Morebus routes (M1, M2, 13, and Breeze lines) providing continuous late-night links to Poole, Westbourne, Boscombe, and Christchurch.
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3.5 space-y-1">
                  <div className="font-extrabold text-foreground flex items-center gap-1.5">
                    <span>🚆</span>
                    <span>Bournemouth Central Train Station</span>
                  </div>
                  <p className="text-muted-foreground">
                    Approximately 5 minutes by taxi or direct bus down to Bournemouth Square. Direct South Western Railway services from London Waterloo, Southampton, and Weymouth.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "door" && (
              <div className="rounded-xl border border-border/70 bg-background/80 p-4 text-xs leading-relaxed space-y-2 animate-in fade-in-50 duration-200">
                <div className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <span>🚪</span>
                  <span>104 Commercial Road (The Triangle) • Reception & Check-In</span>
                </div>
                <p className="text-muted-foreground">
                  Located directly opposite Poole Hill in Bournemouth town centre. Studio doors open <strong>15 minutes before class</strong> (18:45 on Thursdays). No physical ticket printing needed—simply present your 1-second QR pass from your phone digital wallet or pay contactless at the reception desk. Staff and greeters will guide you to your level hall!
                </p>
              </div>
            )}

            {/* Direct Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-border/60">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
                <span>104 Commercial Road, The Triangle, Bournemouth, BH2 5LR</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <Button
                  asChild
                  size="sm"
                  className="bg-primary-base hover:bg-primary-hover text-white font-bold text-xs shadow-xs w-full sm:w-auto"
                >
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=BOH+Studios+104+Commercial+Rd+Bournemouth+BH2+5LR"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Open in Google Maps (BH2 5LR)
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-muted font-semibold text-xs w-full sm:w-auto"
                >
                  <Link href="/venues">
                    View All Studio &amp; Festival Venues →
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
