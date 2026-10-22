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
    "Official venue, parking, bus routes, and arrival guide for Salsa Explosion classes at BOH Studios, The Woodlands Ballroom, and Salsa Explosion dance weekend festivals.",
};

export default function VenuesGuidePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-rose-950 p-8 sm:p-12 text-white shadow-xl border border-border/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary-base text-white border-none text-xs font-bold">
              <Compass className="mr-1.5 h-3.5 w-3.5 text-white" />
              Bournemouth Studio Hub &amp; Festival Partner Venues
            </Badge>
            <Badge className="bg-white/20 text-white border-none backdrop-blur-sm text-xs font-semibold">
              Travel, Parking &amp; Arrival Guide
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight drop-shadow-sm">
            Venues &amp; Parking Guide
          </h1>

          <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal">
            Everything you need for a smooth arrival at Maestro Enrique Perez Valdes&apos; weekly classes at BOH Studios and Salsa Explosion dance weekend festivals.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              className="bg-primary-base text-white hover:bg-primary-hover font-extrabold shadow-md text-xs sm:text-sm h-10 rounded-xl"
            >
              <Link href="/dashboard/schedule">
                View Weekly Class Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white/10 text-white hover:bg-white/20 border-white/30 text-xs sm:text-sm font-semibold h-10 rounded-xl"
            >
              <Link href="/events">Festival Passes &amp; Info</Link>
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
            <div className="relative h-48 w-full bg-gradient-to-tr from-zinc-900 via-zinc-900 to-rose-950 p-6 text-white flex flex-col justify-between">
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
                  Salsa Explosion UK proudly hires BOH Studios (co-owned by Alex Spindlove) as our flagship home base in Bournemouth town centre. Featuring a state-of-the-art sprung Canadian maple dance floor, full-length mirror wall, professional acoustic sound, licensed bar, and vibrant social dance floor.
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
                  @ Parkstone Trades &amp; Labour Club, 485 Ashley Rd, Poole BH14 0BB • Tel: 01202 746491
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Home of our Wednesday Cuban Salsa courses with Maestro Enrique Perez Valdes, Justyna &amp; Arturas. A stunning, spacious ballroom with a famous <strong>original vintage sprung wooden dance floor</strong>, private licensed bar, stage area, and 100+ dancer capacity.
                </p>
              </div>

              {/* Parking Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Car className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Parking &amp; Venue Features:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Free On-Site Club Car Park:</strong> Generous free parking directly in the Parkstone Trades &amp; Labour Club rear car park.
                  </li>
                  <li>
                    <strong>Ashley Road On-Street Parking:</strong> Plentiful free on-street parking bays right outside the venue doors.
                  </li>
                  <li>
                    <strong>Amenities:</strong> Traditional sprung timber floor, private member club bar, and high-ceiling acoustics.
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
                    <strong>7:00 PM – 8:00 PM:</strong> 6-Week Absolute Beginners Cuban Salsa Course (Maestro Enrique) + Salsa Improvers (Justyna).
                  </li>
                  <li>
                    <strong>8:00 PM – 9:00 PM:</strong> Cuban Salsa Intermediates Partnerwork (Arturas &amp; Maestro Enrique).
                  </li>
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0 border-t mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Postcode: BH14 0BB • Tel: 01202 746491</span>
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
                  The Neptune Harvester, Undercliff Drive, Boscombe Pier, Bournemouth BH5 1BN
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Tuesday nights overlooking the waves! Private beachfront function room setting directly opposite <strong>Boscombe Pier</strong> with panoramic sea views over Poole Bay. Join Jim &amp; Enrique for Cuban Salsa Level 1 and Level 2 (Improvers Partnerwork &amp; Rueda).
                </p>
              </div>

              {/* Parking Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Verified Parking &amp; Seafront Access:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Boscombe Undercliff Car Park (Right Next Door, BH5 1BN):</strong> BCP Council PayByPhone Code <strong>59200</strong>. Hundreds of bays with direct beach level access. Note: 2.1m height barrier, car park gates close at midnight until 8:00 AM, so exit before 12:00 AM.
                  </li>
                  <li>
                    <strong>Free Evening Street Parking:</strong> Plentiful free evening bays up along <strong>Boscombe Overcliff Drive</strong> (a brisk 2-minute stroll down the illuminated Zig-Zag cliff path).
                  </li>
                  <li>
                    <strong>Entrance:</strong> Located on the first floor above The Neptune Harvester with private beach-facing entrance and panoramic ocean balcony.
                  </li>
                </ul>
              </div>

              {/* Class Schedule Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Tuesday Schedule:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>7:15 PM – 8:15 PM:</strong> Cuban Salsa Level 1 (Beginner 2) with Jim &amp; Enrique.
                  </li>
                  <li>
                    <strong>8:30 PM – 9:30 PM:</strong> Cuban Salsa Level 2 (Improvers Partnerwork &amp; Rueda de Casino).
                  </li>
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0 border-t mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Postcode: BH5 1BN • PayByPhone Code: 59200</span>
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
                  Festival Accommodation Partner
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
                  Recommended accommodation partner for Salsa Explosion dance weekend festivals and visiting dancers. Featuring ballroom facilities, discounted dancer rates (Code: SALSA2026), full hotel bar, and easy transit to BOH Studios.
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

      {/* Dedicated Nearby Hotels for Dance Weekends Section */}
      <div className="rounded-3xl border border-primary-base/20 bg-gradient-to-br from-card via-card to-primary-light/20 p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Badge className="bg-primary-base text-white text-xs font-bold uppercase tracking-wider mb-2">
              Visiting Dancer Guide
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Nearby Hotels for Dance Weekends &amp; DANZA! Festivals
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
              Travelling from London, Bristol, Southampton, or abroad for our weekend festivals? These verified walkable hotels are all within 3 to 10 minutes of BOH Studios Bournemouth (104 Commercial Rd, BH2 5LR).
            </p>
          </div>
          <Badge variant="outline" className="border-secondary-base/40 text-secondary-hover bg-secondary-light/30 text-xs font-semibold shrink-0">
            Walking Distance to BOH Studios
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Hotel 1: Hilton Bournemouth */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-900 text-white text-[10px] font-bold">
                  4-Star Premium
                </Badge>
                <span className="text-[11px] font-bold text-primary-hover">3–5 min walk</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">Hilton Bournemouth</h3>
              <p className="text-xs text-text-muted">Terrace Rd, Bournemouth BH2 5EL</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Closest upscale hotel to BOH Studios with secure on-site parking, Schpoons &amp; Forx restaurant, heated indoor pool, and luxury rooms.
              </p>
            </div>
            <div className="pt-2 border-t text-[11px] font-semibold text-text-muted">
              Secure underground parking
            </div>
          </div>

          {/* Hotel 2: Hampton by Hilton */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-900 text-white text-[10px] font-bold">
                  Free Hot Breakfast
                </Badge>
                <span className="text-[11px] font-bold text-primary-hover">5 min walk</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">Hampton by Hilton</h3>
              <p className="text-xs text-text-muted">Upper Terrace Rd, Bournemouth BH2 5NW</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Modern dancer favorite! Includes complimentary hot breakfast, 24/7 fitness center, on-site parking, and spacious rooms just around the corner from The Triangle.
              </p>
            </div>
            <div className="pt-2 border-t text-[11px] font-semibold text-text-muted">
              Breakfast included with every stay
            </div>
          </div>

          {/* Hotel 3: Premier Inn Bournemouth Central */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-600 text-white text-[10px] font-bold">
                  Top Value
                </Badge>
                <span className="text-[11px] font-bold text-primary-hover">8 min walk</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">Premier Inn Central</h3>
              <p className="text-xs text-text-muted">Westover Rd, Bournemouth BH1 2BZ</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Superb central location overlooking Lower Gardens and 2 minutes from the pier. King-size Hypnos beds, quiet rooms, and very budget-friendly rates.
              </p>
            </div>
            <div className="pt-2 border-t text-[11px] font-semibold text-text-muted">
              Close to beach &amp; gardens
            </div>
          </div>

          {/* Hotel 4: Holiday Inn Bournemouth */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-600 text-white text-[10px] font-bold">
                  Full Service
                </Badge>
                <span className="text-[11px] font-bold text-primary-hover">10 min walk</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">Holiday Inn Bournemouth</h3>
              <p className="text-xs text-text-muted">Bath Rd, Lansdowne, Bournemouth BH1 2NT</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Convenient direct road access via Wessex Way with large on-site car park, open-lobby lounge bar, and full hot buffet breakfast.
              </p>
            </div>
            <div className="pt-2 border-t text-[11px] font-semibold text-text-muted">
              Easy road access &amp; ample parking
            </div>
          </div>
        </div>
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
