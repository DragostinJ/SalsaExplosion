import Link from "next/link";
import {
  MapPin,
  Car,
  Bus,
  Clock,
  Sparkles,
  ExternalLink,
  Footprints,
  ArrowRight,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { VenueArrivalPlanner } from "@/components/venues/venue-arrival-planner";

export const metadata = {
  title: "Venues & Parking Guide | BOH Studios Bournemouth | Salsa Explosion",
  description:
    "Official venue, parking, bus routes, and arrival guide for Salsa Explosion classes and dance weekend festivals at BOH Studios Bournemouth.",
};

export default function VenuesGuidePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* "The Place" Havana Nocturne Architectural PageHeader */}
      <PageHeader
        backHref="/dashboard/schedule"
        backLabel="Back to Schedule"
        eyebrowLeft="BOURNEMOUTH STUDIO HUB & FESTIVAL PARTNER VENUES"
        eyebrowRight="TRAVEL, PARKING & ARRIVAL GUIDE"
        title="Venues &"
        highlight="Parking Guide"
        description="Everything you need for a smooth arrival at Maestro Enrique Perez Valdes' weekly classes at BOH Studios and Salsa Explosion dance weekend festivals across Bournemouth."
        badge={
          <div className="inline-flex items-center gap-2 rounded-2xl border border-gold/30 bg-gold/10 px-3.5 py-2 text-xs font-semibold text-gold">
            <span>📍 Thu &amp; Sun Classes at BOH Studios: <strong>£12 (1 Class) / £14 (2 Classes) at the Door</strong></span>
          </div>
        }
        actions={
          <>
            <Button
              asChild
              className="bg-brand text-white hover:bg-brand-hover font-extrabold shadow-xs text-xs sm:text-sm h-10 rounded-xl"
            >
              <Link href="/dashboard/schedule">
                View Weekly Class Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-line bg-surface-3 text-ivory hover:bg-surface-2 text-xs sm:text-sm font-semibold h-10 rounded-xl"
            >
              <Link href="/events">Festival Passes &amp; Info</Link>
            </Button>
          </>
        }
      />

      {/* Interactive Door-to-Door Arrival Planner & Parking Calculator */}
      <VenueArrivalPlanner />

      {/* Venues Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Venue 1: BOH Studios Bournemouth */}
        <Card className="border shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="relative h-48 w-full bg-gradient-to-tr from-stone-900 via-surface-1 to-stone-950 p-6 text-ivory flex flex-col justify-between">
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
                  <Car className="h-4 w-4 text-amber-400" />
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
                    <strong>Commercial Road &amp; Surrounding Streets:</strong> Free on-street parking after 18:00.
                  </li>
                </ul>
              </div>

              {/* Transit Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Bus className="h-4 w-4 text-blue-400" />
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

        {/* Venue 2: BOH Studios Studio 2 Bournemouth */}
        <Card className="border shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="relative h-48 w-full bg-gradient-to-tr from-emerald-800 via-teal-700 to-amber-600 p-6 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Badge className="bg-black/40 text-white border-none backdrop-blur-sm text-xs font-bold">
                  BOH Studios • Studio 2
                </Badge>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  The Triangle, Bournemouth
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black drop-shadow-xs">
                  BOH Studios Studio 2
                </h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  104 Commercial Rd, Bournemouth BH2 5LR • Tel: 07969 633701
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Intimate secondary studio and social lounge for Level 0 beginners foundation drills, Bachata Sensual styling, and multi-room festival parties. Featuring mirror walls, high-definition sound, and sprung dance flooring.
                </p>
              </div>

              {/* Parking Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Car className="h-4 w-4 text-emerald-400" />
                  Parking &amp; Venue Features:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Bournemouth Library (BH2 5SL):</strong> 2-minute flat walk from the studio entrance.
                  </li>
                  <li>
                    <strong>Commercial Road &amp; Poole Hill:</strong> Free on-street parking bays after 18:00.
                  </li>
                  <li>
                    <strong>Amenities:</strong> Air-conditioned, full-wall dance mirrors, reception lounge, and licensed social bar.
                  </li>
                </ul>
              </div>

              {/* Festival Schedule Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Session Timetable:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Thursdays &amp; Sundays:</strong> 19:00 – 23:00 Beginners Foundation, Bachata Sensual &amp; Festival Multi-Room Fiestas.
                  </li>
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0 border-t mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Postcode: BH2 5LR • Tel: 07969 633701</span>
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
              <Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8">
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

        {/* Venue 3: Neptune Hall Boscombe */}
        <Card className="border shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="relative h-48 w-full bg-gradient-to-tr from-blue-700 via-sky-600 to-amber-500 p-6 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Badge className="bg-black/40 text-white border-none backdrop-blur-sm text-xs font-bold">
                  Special Events Venue
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
                  Atmospheric beachfront function room setting directly opposite <strong>Boscombe Pier</strong> with panoramic sea views over Poole Bay. Selected home for special seasonal workshops, outdoor summer socials, and private Latin party bookings.
                </p>
              </div>

              {/* Parking Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Car className="h-4 w-4 text-blue-400" />
                  Verified Parking &amp; Seafront Access:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Boscombe Undercliff Car Park (Right Next Door, BH5 1BN):</strong> BCP Council PayByPhone Code <strong>59200</strong>. Hundreds of bays with direct beach level access. Note: 2.1m height barrier, car park gates close at midnight until 08:00.
                  </li>
                  <li>
                    <strong>Free Evening Street Parking:</strong> Plentiful free evening bays up along <strong>Boscombe Overcliff Drive</strong> (a brisk 2-minute stroll down the illuminated Zig-Zag cliff path).
                  </li>
                  <li>
                    <strong>Entrance:</strong> Located on the first floor above The Neptune Harvester with private beach-facing entrance and panoramic ocean balcony.
                  </li>
                </ul>
              </div>

              {/* Events Info */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Seasonal Schedule:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Special Events:</strong> Special seasonal socials, beachfront workshops, and party dates announced in our live event calendar.
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
                  <Car className="h-4 w-4 text-purple-400" />
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
                  <Bus className="h-4 w-4 text-blue-400" />
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
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Travelling from London, Bristol, Southampton, or abroad for our weekend festivals? These verified walkable hotels are all within 3 to 10 minutes of BOH Studios Bournemouth (104 Commercial Rd, BH2 5LR).
            </p>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 text-xs font-semibold shrink-0">
            Walking Distance to BOH Studios
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Hotel 1: Hilton Bournemouth */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  4-Star Premium
                </Badge>
                <span className="text-[11px] font-bold text-rose-400">3–5 min walk</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">Hilton Bournemouth</h3>
              <p className="text-xs text-muted-foreground">Terrace Rd, Bournemouth BH2 5EL</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Closest upscale hotel to BOH Studios with secure on-site parking, Schpoons &amp; Forx restaurant, heated indoor pool, and luxury rooms.
              </p>
            </div>
            <div className="pt-2 border-t text-[11px] font-semibold text-muted-foreground">
              Secure underground parking
            </div>
          </div>

          {/* Hotel 2: Hampton by Hilton */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Free Hot Breakfast
                </Badge>
                <span className="text-[11px] font-bold text-rose-400">5 min walk</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">Hampton by Hilton</h3>
              <p className="text-xs text-muted-foreground">Upper Terrace Rd, Bournemouth BH2 5NW</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Modern dancer favorite! Includes complimentary hot breakfast, 24/7 fitness center, on-site parking, and spacious rooms just around the corner from The Triangle.
              </p>
            </div>
            <div className="pt-2 border-t text-[11px] font-semibold text-muted-foreground">
              Breakfast included with every stay
            </div>
          </div>

          {/* Hotel 3: Premier Inn Bournemouth Central */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  Top Value
                </Badge>
                <span className="text-[11px] font-bold text-rose-400">8 min walk</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">Premier Inn Central</h3>
              <p className="text-xs text-muted-foreground">Westover Rd, Bournemouth BH1 2BZ</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Superb central location overlooking Lower Gardens and 2 minutes from the pier. King-size Hypnos beds, quiet rooms, and very budget-friendly rates.
              </p>
            </div>
            <div className="pt-2 border-t text-[11px] font-semibold text-muted-foreground">
              Close to beach &amp; gardens
            </div>
          </div>

          {/* Hotel 4: Holiday Inn Bournemouth */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                  Full Service
                </Badge>
                <span className="text-[11px] font-bold text-rose-400">10 min walk</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">Holiday Inn Bournemouth</h3>
              <p className="text-xs text-muted-foreground">Bath Rd, Lansdowne, Bournemouth BH1 2NT</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Convenient direct road access via Wessex Way with large on-site car park, open-lobby lounge bar, and full hot buffet breakfast.
              </p>
            </div>
            <div className="pt-2 border-t text-[11px] font-semibold text-muted-foreground">
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
