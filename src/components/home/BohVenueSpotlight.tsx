"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Car,
  Bus,
  DoorOpen,
  ExternalLink,
  Camera,
  Layers,
  Volume2,
  Coffee,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ArrivalTab = "parking" | "transit" | "door";

interface Amenity {
  icon: typeof Layers;
  title: string;
  description: string;
}

const AMENITIES: Amenity[] = [
  {
    icon: Layers,
    title: "Sprung Hardwood Dance Floors",
    description:
      "Engineered for effortless spins, friction-free pivot turns, and maximum joint protection during 4-hour high-energy Cuban socials.",
  },
  {
    icon: Volume2,
    title: "Multi-Room Sound Isolation",
    description:
      "Dedicated Cuban Casino & Timba main ballroom + separate Bachata & Kizomba room opened specifically during our special monthly events and SB&K parties.",
  },
  {
    icon: Coffee,
    title: "Social Lounge & Licensed Bar",
    description:
      "Grab water, soft drinks, or a relaxed social beverage and catch up with friends between fast-paced Rueda circles.",
  },
  {
    icon: Sparkles,
    title: "Full-Wall Mirrors & Air Conditioning",
    description:
      "Bright rehearsal lighting for focused footwork classes, shifting to warm Havana club lighting for Thursday & Sunday socials.",
  },
];

const PHOTO_SLOTS = [
  {
    id: "main-ballroom",
    title: "Main Ballroom & Rueda Floor",
    caption: "Spacious sprung maple floor hosting our 7:00 PM – 10:30 PM Thursday & Sunday sessions.",
    tag: "Room 1 • Casino & Timba",
    gradient: "from-zinc-950 via-rose-950/60 to-zinc-900",
  },
  {
    id: "studio-two",
    title: "Studio 2 • Foundation & SB&K",
    caption: "Intimate secondary studio for Level 0 absolute beginners, Bachata Sensual, and masterclasses.",
    tag: "Room 2 • Beginners & Bachata",
    gradient: "from-zinc-950 via-amber-950/50 to-zinc-900",
  },
  {
    id: "entrance-lounge",
    title: "104 Commercial Rd Entrance & Lounge",
    caption: "Warm welcome desk, social seating area, coat storage, and licensed bar.",
    tag: "Reception & Social Bar",
    gradient: "from-zinc-950 via-emerald-950/50 to-zinc-900",
  },
];

export function BohVenueSpotlight() {
  const [activeTab, setActiveTab] = useState<ArrivalTab>("parking");

  return (
    <section
      id="venue-spotlight"
      className="cv-auto py-16 sm:py-24 border-b border-border/70 bg-gradient-to-b from-background via-muted/20 to-background scroll-mt-20"
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

        {/* 4 Amenity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {AMENITIES.map((amenity) => {
            const Icon = amenity.icon;
            return (
              <div
                key={amenity.title}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-secondary-base/50 transition-all space-y-2.5"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary-light text-secondary-hover flex items-center justify-center font-bold">
                  <Icon className="h-5 w-5 text-secondary-base" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {amenity.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {amenity.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* 3-Slot Visual Gallery */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary-base" />
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                Inside BOH Studios
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Studio Photography Showcase
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PHOTO_SLOTS.map((slot) => (
              <div
                key={slot.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm hover:border-primary-base/50 transition-all"
              >
                <div
                  className={`relative aspect-[16/10] w-full bg-gradient-to-br ${slot.gradient} p-4 flex flex-col justify-between border-b border-border/60`}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white/90 border border-white/10">
                      {slot.tag}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/10 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-semibold text-white/80">
                      <Camera className="h-2.5 w-2.5" />
                      📸 BOH Studios
                    </span>
                  </div>

                  <div className="my-auto flex flex-col items-center justify-center py-4 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white/90 mb-2 group-hover:scale-105 transition-transform">
                      <Sparkles className="h-6 w-6 text-accent-tangerine" />
                    </div>
                    <span className="text-xs font-bold text-white/90">
                      {slot.title}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h4 className="text-sm font-extrabold text-foreground">
                    {slot.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {slot.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Parking, Transit & First-Timer Arrival Guide */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
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
                    Only a 3-minute flat walk to BOH Studios. Covered, well-lit, and CCTV-monitored with affordable evening flat rates after 6:00 PM.
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
                    Free on-street evening parking bays available around The Triangle and Poole Hill after 8:00 PM (subject to council signs).
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
                  Located directly opposite Poole Hill in Bournemouth town centre. Studio doors open <strong>15 minutes before class</strong> (6:45 PM on Thursdays). No physical ticket printing needed—simply present your 1-second QR pass from your phone digital wallet or pay contactless at the reception desk. Staff and greeters will guide you to your level hall!
                </p>
              </div>
            )}

            {/* Direct Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-border/60">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
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
