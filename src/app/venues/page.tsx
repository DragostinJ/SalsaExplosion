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
                  Thursdays & Sundays Hub
                </Badge>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  The Triangle, Bournemouth
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black drop-shadow-sm">
                  BOH Studios Bournemouth
                </h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  104 Commercial Road, The Triangle, Bournemouth BH2 5LR
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  BOH Studios is the permanent flagship home of Salsa Explosion UK in Bournemouth town centre. Featuring a state-of-the-art sprung Canadian maple dance floor, full-length mirror wall, professional acoustic sound, licensed bar, and vibrant social dance floor.
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
                    <strong>Bournemouth Library (Avenue Rd, BH2 5SL):</strong> 2-minute walk from the studio doors.
                  </li>
                  <li>
                    <strong>West Hill Car Park (BH2 5PG):</strong> Multi-storey and surface parking adjacent to The Triangle.
                  </li>
                  <li>
                    <strong>Commercial Road & Surrounding Streets:</strong> Free on-street parking after 6:00 PM.
                  </li>
                </ul>
              </div>

              {/* Transit Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Bus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Public Transit & Buses:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>The Triangle Bus Hub:</strong> Virtually all MoreBus lines (M1, M2, 1, 3, 5, 6) stop at The Triangle (30 seconds walk).
                  </li>
                  <li>
                    <strong>Bournemouth Central Train Station:</strong> 5-minute taxi or 7-minute direct bus.
                  </li>
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0 border-t mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Postcode: BH2 5LR</span>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="text-xs h-8 font-semibold">
                <a
                  href="https://maps.apple.com/?address=104+Commercial+Road,Bournemouth,BH2+5LR"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
                  Apple Maps
                </a>
              </Button>
              <Button asChild size="sm" className="bg-primary-base hover:bg-primary-hover text-white font-bold text-xs h-8">
                <a
                  href="https://maps.google.com/?q=BOH+Studios+Bournemouth+104+Commercial+Rd+BH2+5LR"
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

        {/* Venue 2: The Woodlands Ballroom Poole */}
        <Card className="border shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="relative h-48 w-full bg-gradient-to-tr from-emerald-800 via-teal-700 to-amber-600 p-6 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Badge className="bg-black/40 text-white border-none backdrop-blur-sm text-xs font-bold">
                  Wednesdays Cuban Hub
                </Badge>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Upper Parkstone, Poole
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black drop-shadow-sm">
                  The Woodlands Ballroom
                </h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  @ Parkstone Trade & Labour Club, 485 Ashley Rd, Poole BH14 0BB
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Home of our Wednesday Cuban Salsa courses with Enrique Perez Valdes. A stunning, spacious ballroom with a traditional sprung wooden dance floor accommodating 100+ dancers comfortably.
                </p>
              </div>

              {/* Parking Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Car className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Parking Advice:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>On-Site Club Car Park:</strong> Free parking directly on-site at Parkstone Trade & Labour Club.
                  </li>
                  <li>
                    <strong>Ashley Road On-Street Parking:</strong> Plentiful free on-street parking bays right outside the venue.
                  </li>
                </ul>
              </div>

              {/* Class Schedule Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Wednesday Schedule:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>7:00 PM – 8:00 PM:</strong> 6-Week Absolute Beginners Cuban Salsa Course with Enrique from Cuba.
                  </li>
                  <li>
                    <strong>7:00 PM:</strong> Salsa Beginner 2 & Salsa Improvers 2 / Intermediates.
                  </li>
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0 border-t mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Postcode: BH14 0BB</span>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="text-xs h-8 font-semibold">
                <a
                  href="https://maps.apple.com/?address=485+Ashley+Road,Poole,BH14+0BB"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
                  Apple Maps
                </a>
              </Button>
              <Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8">
                <a
                  href="https://maps.google.com/?q=Parkstone+Trade+and+Labour+Club+485+Ashley+Rd+Poole+BH14+0BB"
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

        {/* Venue 3: Neptune Hall Boscombe */}
        <Card className="border shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="relative h-48 w-full bg-gradient-to-tr from-blue-700 via-sky-600 to-amber-500 p-6 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Badge className="bg-black/40 text-white border-none backdrop-blur-sm text-xs font-bold">
                  Tuesdays Cuban Hub
                </Badge>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Boscombe Seafront
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black drop-shadow-sm">
                  Neptune Hall
                </h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  Harvester, Undercliff Drive, Boscombe BH5 1BN (Above Harvester)
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Tuesday nights overlooking the waves! Join Jim & Enrique for Beginner 2 & Improver Cuban Salsa partnerwork with fresh sea air and a friendly, relaxed community spirit.
                </p>
              </div>

              {/* Parking Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Parking & Seafront Access:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Boscombe Seafront & Overstrand Car Parks:</strong> Ample parking along Undercliff Drive right next to the beach.
                  </li>
                  <li>
                    <strong>Entrance:</strong> Located above Harvester restaurant with beachfront staircase access.
                  </li>
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0 border-t mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Postcode: BH5 1BN</span>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="text-xs h-8 font-semibold">
                <a
                  href="https://maps.apple.com/?address=Undercliff+Drive,Boscombe,BH5+1BN"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
                  Apple Maps
                </a>
              </Button>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8">
                <a
                  href="https://maps.google.com/?q=Harvester+Undercliff+Drive+Boscombe+BH5+1BN"
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

        {/* Venue 4: The Roundhouse Hotel */}
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
