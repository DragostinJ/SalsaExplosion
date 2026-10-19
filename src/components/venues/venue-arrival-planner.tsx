"use client";

import { useState } from "react";
import {
  Car,
  Clock,
  Compass,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DestinationInfo {
  id: string;
  name: string;
  address: string;
  postcode: string;
  googleMapsUrl: string;
  appleMapsUrl: string;
  wazeUrl: string;
  eveningParking: {
    title: string;
    description: string;
    estimatedCost: string;
    isFree: boolean;
  };
  daytimeParking: {
    title: string;
    description: string;
    estimatedCost: string;
    isFree: boolean;
  };
}

const DESTINATIONS: DestinationInfo[] = [
  {
    id: "boh",
    name: "BOH Studios (Weekly Classes)",
    address: "11-15 Haviland Road West, Boscombe",
    postcode: "BH5 1DD",
    googleMapsUrl: "https://maps.google.com/?q=BOH+Studios+Bournemouth+11-15+Haviland+Road+West+BH5+1DD",
    appleMapsUrl: "https://maps.apple.com/?address=11-15+Haviland+Road+West,Bournemouth,BH5+1DD",
    wazeUrl: "https://waze.com/ul?q=11-15+Haviland+Road+West+Bournemouth",
    eveningParking: {
      title: "Hawkwood Road Car Park (BH5 1BY) & On-Street",
      description: "Free council parking after 6:00 PM every evening. Over 180 spaces just a 2-minute walk from the studio doors.",
      estimatedCost: "£0.00 (FREE after 6 PM)",
      isFree: true,
    },
    daytimeParking: {
      title: "Sovereign Centre Multi-Storey (BH5 1NT)",
      description: "Secure barrier car park with 500+ spaces. Direct covered pedestrian exit onto Christchurch Road.",
      estimatedCost: "£1.60 / hour",
      isFree: false,
    },
  },
  {
    id: "roundhouse",
    name: "The Roundhouse Hotel (Congress Hub)",
    address: "Meyrick Road, Lansdowne",
    postcode: "BH1 2PR",
    googleMapsUrl: "https://maps.google.com/?q=The+Roundhouse+Hotel+Meyrick+Road+Bournemouth+BH1+2PR",
    appleMapsUrl: "https://maps.apple.com/?address=Meyrick+Road,Bournemouth,BH1+2PR",
    wazeUrl: "https://waze.com/ul?q=The+Roundhouse+Hotel+Bournemouth",
    eveningParking: {
      title: "Hotel Forecourt & Cotlands Road (BH1 3JR)",
      description: "Dedicated hotel guest parking spaces. Overflow parking at Cotlands Road 24h council car park just 300m away.",
      estimatedCost: "£4.50 evening flat rate (Free for hotel residents)",
      isFree: false,
    },
    daytimeParking: {
      title: "Cotlands Road Pay & Display (BH1 3JR)",
      description: "Large 24-hour pay-and-display car park adjacent to Lansdowne roundabout.",
      estimatedCost: "£2.10 / hour",
      isFree: false,
    },
  },
];

export function VenueArrivalPlanner() {
  const [selectedDestId, setSelectedDestId] = useState<string>("boh");
  const [arrivalTime, setArrivalTime] = useState<"evening" | "daytime">("evening");

  const currentDest = DESTINATIONS.find((d) => d.id === selectedDestId) ?? DESTINATIONS[0];
  const activeParking = arrivalTime === "evening" ? currentDest.eveningParking : currentDest.daytimeParking;

  return (
    <Card className="border border-border/80 bg-card shadow-sm overflow-hidden rounded-3xl">
      <CardHeader className="p-6 bg-gradient-to-r from-muted/50 to-muted/20 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-accent-tangerine" />
              <CardTitle className="text-lg font-black tracking-tight text-foreground">
                Door-to-Door Arrival Planner & Parking Calculator
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Select your venue and arrival time to find the fastest parking, one-tap navigation, and safety tips.
            </CardDescription>
          </div>
          <Badge className="bg-accent-tangerine/10 text-accent-tangerine border-accent-tangerine/30 text-xs font-bold w-fit">
            Local Bournemouth Guide
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Step 1 & 2 Selectors */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Destination Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Select Venue Destination</label>
            <div className="grid grid-cols-2 gap-2">
              {DESTINATIONS.map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => setSelectedDestId(dest.id)}
                  className={`rounded-xl border p-2.5 text-left text-xs font-bold transition-all ${
                    selectedDestId === dest.id
                      ? "border-accent-tangerine bg-accent-tangerine/[0.08] text-foreground shadow-xs ring-1 ring-accent-tangerine"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <p className="line-clamp-1">{dest.name}</p>
                  <p className="text-[10px] text-muted-foreground font-normal">{dest.postcode}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Arrival Window</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setArrivalTime("evening")}
                className={`rounded-xl border p-2.5 text-left text-xs font-bold transition-all ${
                  arrivalTime === "evening"
                    ? "border-emerald-500 bg-emerald-500/[0.08] text-foreground shadow-xs ring-1 ring-emerald-500"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Evening Class (After 6 PM)</span>
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Best for Free Parking
                </p>
              </button>

              <button
                type="button"
                onClick={() => setArrivalTime("daytime")}
                className={`rounded-xl border p-2.5 text-left text-xs font-bold transition-all ${
                  arrivalTime === "daytime"
                    ? "border-amber-500 bg-amber-500/[0.08] text-foreground shadow-xs ring-1 ring-amber-500"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Daytime (Before 6 PM)</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                  Pay & Display Car Parks
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Calculated Parking Result Banner */}
        <div className="rounded-2xl border bg-muted/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-accent-tangerine" />
              <span className="text-xs font-bold text-foreground">
                Recommended Spot: {activeParking.title}
              </span>
            </div>
            <Badge
              className={`text-[10px] font-black ${
                activeParking.isFree
                  ? "bg-emerald-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {activeParking.estimatedCost}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeParking.description}
          </p>
        </div>

        {/* One-Tap Navigation Deep Links */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-foreground block">
            Launch GPS Navigation to {currentDest.name}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              asChild
              variant="outline"
              className="text-xs h-9 font-bold border-border hover:border-blue-500 hover:bg-blue-500/10"
            >
              <a href={currentDest.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Google Maps
                <ExternalLink className="ml-1 h-3 w-3 opacity-60" />
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="text-xs h-9 font-bold border-border hover:border-purple-500 hover:bg-purple-500/10"
            >
              <a href={currentDest.appleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
                Apple Maps
                <ExternalLink className="ml-1 h-3 w-3 opacity-60" />
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="text-xs h-9 font-bold border-border hover:border-cyan-500 hover:bg-cyan-500/10"
            >
              <a href={currentDest.wazeUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="mr-1.5 h-3.5 w-3.5 text-cyan-600" />
                Waze Navigation
                <ExternalLink className="ml-1 h-3 w-3 opacity-60" />
              </a>
            </Button>
          </div>
        </div>

        {/* Late Night Safety & Reception Desk Support Card */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t">
          <div className="rounded-2xl border bg-muted/20 p-4 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              Late-Night Studio Safety
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Boscombe high street and Hawkwood Road car parks are fully streetlit. When leaving after 10:30 PM, instructors and reception staff are happy to walk dancers back to their vehicles upon request.
            </p>
          </div>

          <div className="rounded-2xl border bg-accent-tangerine/[0.06] border-accent-tangerine/30 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Studio Desk Hotline & WhatsApp</span>
              <span className="text-[10px] text-muted-foreground font-semibold">Director Support</span>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Need directions or running 5 minutes late for door check-in? Message Maestro Enrique Perez Valdes directly:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-7 flex-1">
                <a
                  href="https://wa.me/447970153254?text=Hi%20Enrique,%20I'm%20on%20my%20way%20to%20Salsa%20Explosion%20and%20need%20assistance!"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-1 h-3 w-3" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="text-xs font-bold h-7 flex-1 border-border">
                <a href="tel:+447970153254">
                  <Phone className="mr-1 h-3 w-3" />
                  Call Desk
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
