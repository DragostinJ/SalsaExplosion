import Link from "next/link";
import {
  MapPin,
  Car,
  Bus,
  Clock,
  Sparkles,
  ExternalLink,
  Footprints,
  Compass,
  ArrowRight,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/navigation/back-button";
import { VenueArrivalPlanner } from "@/components/venues/venue-arrival-planner";

export const metadata = {
  title: "Venues & Parking Guide | BOH Studios Bournemouth | Salsa Explosion",
  description:
    "Official venue, parking, bus routes, and arrival guide for Salsa Explosion classes at BOH Studios and Bournemouth Summer Congress at The Roundhouse Hotel.",
};

export default function VenuesGuidePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-black/30 text-white border-white/20 backdrop-blur-sm text-xs font-bold">
              <Compass className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
              Bournemouth Studio Hub & Congress Hotel
            </Badge>
            <Badge className="bg-white/20 text-white border-none backdrop-blur-sm text-xs font-semibold">
              Travel, Parking & Arrival Guide
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight drop-shadow-sm">
            Venues & Parking Guide
          </h1>

          <p className="text-base sm:text-lg text-amber-50/95 leading-relaxed font-normal">
            Everything you need for a smooth arrival at Maestro Enrique Perez Valdes&apos; weekly classes at BOH Studios and the annual Bournemouth Cuban Salsa Congress.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              className="bg-white text-zinc-950 hover:bg-amber-100 font-extrabold shadow-md text-xs sm:text-sm"
            >
              <Link href="/dashboard/schedule">
                View Weekly Class Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white/10 text-white hover:bg-white/20 border-white/30 text-xs sm:text-sm font-semibold"
            >
              <Link href="/events">Congress Passes & Info</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Door-to-Door Arrival Planner & Parking Calculator */}
      <VenueArrivalPlanner />

      {/* Venues Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Venue 1: BOH Studios Bournemouth */}
        <Card className="border shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="relative h-48 w-full bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-500 p-6 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Badge className="bg-black/40 text-white border-none backdrop-blur-sm text-xs font-bold">
                  Primary Weekly Hub
                </Badge>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Boscombe, Bournemouth
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black drop-shadow-sm">
                  BOH Studios Bournemouth
                </h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  11-15 Haviland Road West, Boscombe, Bournemouth BH5 1DD
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  BOH Studios is the permanent home of Salsa Explosion UK. Featuring a state-of-the-art sprung Canadian maple dance floor, full-length mirror wall, professional acoustic sound, changing facilities, and a social refreshment lounge.
                </p>
              </div>

              {/* Parking Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Car className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Parking Advice:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Hawkwood Road Car Park (BH5 1BY):</strong> 2-minute walk from the studio. Over 180 spaces. Free parking after 6:00 PM every evening.
                  </li>
                  <li>
                    <strong>Haviland Road West & Ashley Road:</strong> Free on-street parking available on a first-come basis right outside the studio.
                  </li>
                </ul>
              </div>

              {/* Bus & Train Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Bus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Public Transit & Buses:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>MoreBus M1 & M2:</strong> Runs every 5–7 minutes connecting Bournemouth Central Station, Poole, and Southbourne directly to Boscombe Bus Station (3-minute walk).
                  </li>
                  <li>
                    <strong>Bournemouth Central Train Station:</strong> 10-minute taxi ride or 8-minute direct bus on the M1/M2 lines.
                  </li>
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0 border-t mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Postcode: BH5 1DD</span>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="text-xs h-8 font-semibold">
                <a
                  href="https://maps.apple.com/?address=11-15+Haviland+Road+West,Bournemouth,BH5+1DD"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
                  Apple Maps
                </a>
              </Button>
              <Button asChild size="sm" className="bg-primary-base hover:bg-primary-hover text-white font-bold text-xs h-8">
                <a
                  href="https://maps.google.com/?q=BOH+Studios+Bournemouth+11-15+Haviland+Road+West+BH5+1DD"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="mr-1.5 h-3.5 w-3.5" />
                  Google Maps
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </Card>

        {/* Venue 2: The Roundhouse Hotel */}
        <Card className="border shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="relative h-48 w-full bg-gradient-to-tr from-purple-800 via-indigo-700 to-amber-600 p-6 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Badge className="bg-black/40 text-white border-none backdrop-blur-sm text-xs font-bold">
                  Annual Congress Festival Hotel
                </Badge>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Lansdowne, Bournemouth
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black drop-shadow-sm">
                  The Roundhouse Hotel
                </h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  Meyrick Road, Gervis Road, Lansdowne, Bournemouth BH1 2PR
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Official flagship venue for the Bournemouth Summer Cuban Salsa Congress. Featuring 3 simultaneous workshop ballrooms, international maestro staging, full hotel bar, and late-night social dancing until 4:00 AM.
                </p>
              </div>

              {/* Parking Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Car className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Parking Advice:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>On-Site Hotel Car Park:</strong> Dedicated guest parking right in front of the hotel (discounted rates for congress pass holders).
                  </li>
                  <li>
                    <strong>Cotlands Road Car Park (BH1 3JR):</strong> 4-minute walk with large 24-hour pay-and-display capacity.
                  </li>
                </ul>
              </div>

              {/* Transit Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Bus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Transit & Walking Distance:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Bournemouth Central Train Station:</strong> Only a 5-minute walk (400 meters) straight down Holdenhurst Road.
                  </li>
                  <li>
                    <strong>Bournemouth Beach & Pier:</strong> 8-minute walk from the hotel to the sea!
                  </li>
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0 border-t mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Postcode: BH1 2PR</span>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="text-xs h-8 font-semibold">
                <a
                  href="https://maps.apple.com/?address=Meyrick+Road,Bournemouth,BH1+2PR"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
                  Apple Maps
                </a>
              </Button>
              <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-8">
                <a
                  href="https://maps.google.com/?q=The+Roundhouse+Hotel+Meyrick+Road+Bournemouth+BH1+2PR"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="mr-1.5 h-3.5 w-3.5" />
                  Google Maps
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Newcomer Arrival & Etiquette Guide */}
      <div className="rounded-3xl border bg-muted/20 p-8 sm:p-10 space-y-6">
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs font-semibold">
            First-Timer FAQs
          </Badge>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            What to Expect on Your First Visit to Salsa Explosion
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Footprints className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">Footwear & Attire</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Wear comfortable shoes with smooth soles (leather or suede soles are best). Avoid high-traction running sneakers so your knees can pivot freely during spins. Comfortable casual wear is perfect.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">No Partner Needed</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Over 70% of dancers arrive on their own! In Cuban Casino and Rueda de Casino, we rotate partners continuously so everyone gets to dance and practice both leading and following.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">1-Second QR Check-In</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Arrive 10 minutes before class. Simply pull up your class pass QR code from your Salsa Explosion dashboard on your phone for immediate check-in at the BOH Studios door.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
