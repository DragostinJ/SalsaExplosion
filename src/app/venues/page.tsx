import Image from "next/image";
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
import { BackButton } from "@/components/navigation/back-button";
import { VenueArrivalPlanner } from "@/components/venues/venue-arrival-planner";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

export const metadata = {
  title: "BOH Studios: Directions & Parking",
  description:
    "How to find BOH Studios at 104 Commercial Rd, Bournemouth BH2 5LR: parking, buses, trains and hotels nearby for festival weekends.",
  alternates: { canonical: "/venues" },
};

export default function VenuesGuidePage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <div>
        <BackButton fallbackUrl="/classes" label="Back to Schedule" />
      </div>

      {/* Cartelera Poster Hero Header */}
      <section
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_var(--color-ink)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-3 text-xs font-bold uppercase tracking-[0.3em] text-ink">
          <span>BOURNEMOUTH STUDIO HUB &amp; FESTIVAL PARTNER VENUES</span>
          <span className="opacity-70">TRAVEL, PARKING &amp; ARRIVAL GUIDE</span>
        </div>
        <Image
          src={MEDIA_MANIFEST.mockupGraphics.map.src}
          alt=""
          width={MEDIA_MANIFEST.mockupGraphics.map.width}
          height={MEDIA_MANIFEST.mockupGraphics.map.height}
          sizes="9rem"
          className="pointer-events-none absolute right-6 top-16 hidden w-28 -rotate-3 sm:block md:right-10 md:w-36"
        />

        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className={KICKER}>Bournemouth Town Centre Studio Hub</p>
            <h1 className={`${TYPE.section} text-ink`}>
              VENUES &amp; <span className="text-accent-red">Parking Guide</span>
            </h1>
            <p className="max-w-2xl text-sm font-semibold text-ink leading-relaxed">
              Everything you need for a smooth arrival at Maestro Enrique Perez Valdes&apos; weekly classes at BOH Studios and Salsa Explosion dance weekend festivals across Bournemouth.
            </p>
            <div className="inline-flex items-center gap-2 border-2 border-ink bg-poster-mustard px-3 py-1 text-xs font-bold shadow-[2px_2px_0_0_var(--color-ink)]">
              <Sparkles className="h-4 w-4 text-accent-red" />
              <span>Thu &amp; Sun Classes at BOH Studios: £12 (1 Class) / £14 (2 Classes) at the Door</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/classes"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold min-h-[40px] px-4 inline-flex items-center justify-center gap-1.5`}
            >
              <span>View Class Schedule</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs font-bold min-h-[40px] px-4 inline-flex items-center justify-center`}
            >
              Festival Passes &amp; Info
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Door-to-Door Arrival Planner & Parking Calculator */}
      <VenueArrivalPlanner />

      {/* Venues Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Venue 1: BOH Studios Bournemouth */}
        <div className="border-4 border-ink bg-paper text-ink shadow-[6px_6px_0_0_var(--color-ink)] flex flex-col justify-between">
          <div>
            <div className="bg-poster-mustard p-6 border-b-4 border-ink text-ink flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="border border-ink bg-ink text-paper text-xs font-black uppercase tracking-wider px-2 py-0.5">
                  Thursdays &amp; Sundays Hub
                </span>
                <span className="border border-ink bg-paper px-2.5 py-0.5 text-xs font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
                  The Triangle, Bournemouth
                </span>
              </div>

              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-ink">
                  BOH Studios Bournemouth
                </h2>
                <p className="text-xs text-ink font-bold mt-0.5">
                  104 Commercial Road, The Triangle, Bournemouth BH2 5LR
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-ink leading-relaxed font-medium">
                Salsa Explosion UK proudly hires BOH Studios as our flagship home base in Bournemouth town centre. Featuring a state-of-the-art sprung Canadian maple dance floor, full-length mirror wall, professional acoustic sound, licensed bar, and vibrant social dance floor.
              </p>

              {/* Parking Info */}
              <div className="border-2 border-ink bg-poster-mustard/20 p-4 space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-ink uppercase tracking-wider text-xs">
                  <Car className="h-4 w-4 text-accent-red" />
                  Parking Advice:
                </h3>
                <ul className="text-ink space-y-1 list-disc pl-4 font-medium">
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
              <div className="border-2 border-ink bg-poster-teal/20 p-4 space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-ink uppercase tracking-wider text-xs">
                  <Bus className="h-4 w-4 text-accent-teal" />
                  Public Transit &amp; Buses:
                </h3>
                <ul className="text-ink space-y-1 list-disc pl-4 font-medium">
                  <li>
                    <strong>The Triangle Bus Hub:</strong> Virtually all MoreBus lines (M1, M2, 1, 3, 5, 6) stop at The Triangle (30 seconds walk).
                  </li>
                  <li>
                    <strong>Bournemouth Central Train Station:</strong> 5-minute taxi or 7-minute direct bus.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 border-t-2 border-ink mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-ink/70 font-bold">Postcode: BH2 5LR</span>
            <div className="flex items-center gap-2">
              <a
                href="https://maps.apple.com/?address=104+Commercial+Road,Bournemouth,BH2+5LR"
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center gap-1.5`}
              >
                <Navigation className="h-3.5 w-3.5" />
                Apple Maps
              </a>
              <a
                href="https://maps.google.com/?q=BOH+Studios+Bournemouth+104+Commercial+Rd+BH2+5LR"
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center gap-1.5`}
              >
                <MapPin className="h-3.5 w-3.5" />
                Google Maps
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Venue 2: BOH Studios Studio 2 Bournemouth */}
        <div className="border-4 border-ink bg-paper text-ink shadow-[6px_6px_0_0_var(--color-ink)] flex flex-col justify-between">
          <div>
            <div className="bg-poster-teal p-6 border-b-4 border-ink text-ink flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="border border-ink bg-ink text-paper text-xs font-black uppercase tracking-wider px-2 py-0.5">
                  BOH Studios • Studio 2
                </span>
                <span className="border border-ink bg-paper px-2.5 py-0.5 text-xs font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
                  The Triangle, Bournemouth
                </span>
              </div>

              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-ink">
                  BOH Studios Studio 2
                </h2>
                <p className="text-xs text-ink font-bold mt-0.5">
                  104 Commercial Rd, Bournemouth BH2 5LR • Tel: 07969 633701
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-ink leading-relaxed font-medium">
                Intimate secondary studio and social lounge for Level 0 beginners foundation drills, Bachata Sensual styling, and multi-room festival parties. Featuring mirror walls, high-definition sound, and sprung dance flooring.
              </p>

              {/* Parking Info */}
              <div className="border-2 border-ink bg-poster-teal/20 p-4 space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-ink uppercase tracking-wider text-xs">
                  <Car className="h-4 w-4 text-accent-teal" />
                  Parking &amp; Venue Features:
                </h3>
                <ul className="text-ink space-y-1 list-disc pl-4 font-medium">
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

              {/* Session Timetable */}
              <div className="border-2 border-ink bg-poster-mustard/20 p-4 space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-ink uppercase tracking-wider text-xs">
                  <Clock className="h-4 w-4 text-accent-red" />
                  Session Timetable:
                </h3>
                <ul className="text-ink space-y-1 list-disc pl-4 font-medium">
                  <li>
                    <strong>Thursdays &amp; Sundays:</strong> 19:00 – 23:00 Beginners Foundation, Bachata Sensual &amp; Festival Multi-Room Fiestas.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 border-t-2 border-ink mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-ink/70 font-bold">Postcode: BH2 5LR • Tel: 07969 633701</span>
            <div className="flex items-center gap-2">
              <a
                href="https://maps.apple.com/?address=104+Commercial+Road,Bournemouth,BH2+5LR"
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center gap-1.5`}
              >
                <Navigation className="h-3.5 w-3.5" />
                Apple Maps
              </a>
              <a
                href="https://maps.google.com/?q=BOH+Studios+Bournemouth+104+Commercial+Rd+BH2+5LR"
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center gap-1.5`}
              >
                <MapPin className="h-3.5 w-3.5" />
                Google Maps
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Venue 3: Neptune Hall Boscombe */}
        <div className="border-4 border-ink bg-paper text-ink shadow-[6px_6px_0_0_var(--color-ink)] flex flex-col justify-between">
          <div>
            <div className="bg-poster-blue p-6 border-b-4 border-ink text-paper flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="border border-paper bg-ink text-paper text-xs font-black uppercase tracking-wider px-2 py-0.5">
                  Special Events Venue
                </span>
                <span className="border border-paper bg-paper text-ink px-2.5 py-0.5 text-xs font-bold shadow-[2px_2px_0_0_var(--color-ink)]">
                  Boscombe Seafront
                </span>
              </div>

              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-paper">
                  Neptune Hall
                </h2>
                <p className="text-xs text-paper/85 font-bold mt-0.5">
                  The Neptune Harvester, Undercliff Drive, Boscombe Pier, Bournemouth BH5 1BN
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-ink leading-relaxed font-medium">
                Atmospheric beachfront function room setting directly opposite <strong>Boscombe Pier</strong> with panoramic sea views over Poole Bay. Selected home for special seasonal workshops, outdoor summer socials, and private Latin party bookings.
              </p>

              {/* Parking Info */}
              <div className="border-2 border-ink bg-poster-blue/10 p-4 space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-ink uppercase tracking-wider text-xs">
                  <Car className="h-4 w-4 text-poster-blue" />
                  Verified Parking &amp; Seafront Access:
                </h3>
                <ul className="text-ink space-y-1 list-disc pl-4 font-medium">
                  <li>
                    <strong>Boscombe Undercliff Car Park (BH5 1BN):</strong> PayByPhone Code <strong>59200</strong>. Direct beach level access. Note: 2.1m height barrier.
                  </li>
                  <li>
                    <strong>Free Evening Street Parking:</strong> Plentiful free evening bays up along <strong>Boscombe Overcliff Drive</strong>.
                  </li>
                </ul>
              </div>

              {/* Events Info */}
              <div className="border-2 border-ink bg-poster-mustard/20 p-4 space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-ink uppercase tracking-wider text-xs">
                  <Clock className="h-4 w-4 text-accent-red" />
                  Seasonal Schedule:
                </h3>
                <ul className="text-ink space-y-1 list-disc pl-4 font-medium">
                  <li>
                    <strong>Special Events:</strong> Special seasonal socials, beachfront workshops, and party dates announced in our live event calendar.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 border-t-2 border-ink mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-ink/70 font-bold">Postcode: BH5 1BN • PayByPhone: 59200</span>
            <div className="flex items-center gap-2">
              <a
                href="https://maps.apple.com/?address=Undercliff+Drive,Boscombe,BH5+1BN"
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center gap-1.5`}
              >
                <Navigation className="h-3.5 w-3.5" />
                Apple Maps
              </a>
              <a
                href="https://maps.google.com/?q=Harvester+Undercliff+Drive+Boscombe+BH5+1BN"
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center gap-1.5`}
              >
                <MapPin className="h-3.5 w-3.5" />
                Google Maps
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Venue 4: The Roundhouse Hotel */}
        <div className="border-4 border-ink bg-paper text-ink shadow-[6px_6px_0_0_var(--color-ink)] flex flex-col justify-between">
          <div>
            <div className="bg-poster-red p-6 border-b-4 border-ink text-ink flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="border border-paper bg-ink text-paper text-xs font-black uppercase tracking-wider px-2 py-0.5">
                  Festival Accommodation Partner
                </span>
                <span className="border border-paper bg-paper text-ink px-2.5 py-0.5 text-xs font-bold shadow-[2px_2px_0_0_var(--color-ink)]">
                  Lansdowne, Bournemouth
                </span>
              </div>

              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-ink">
                  The Roundhouse Hotel
                </h2>
                <p className="text-xs text-ink font-bold mt-0.5">
                  Meyrick Road, Lansdowne, Bournemouth BH1 2PR
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-ink leading-relaxed font-medium">
                Recommended accommodation partner for Salsa Explosion dance weekend festivals and visiting dancers. Featuring ballroom facilities, discounted dancer rates (Code: SALSA2026), full hotel bar, and easy transit to BOH Studios.
              </p>

              {/* Parking Info */}
              <div className="border-2 border-ink bg-poster-mustard/20 p-4 space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-ink uppercase tracking-wider text-xs">
                  <Car className="h-4 w-4 text-accent-red" />
                  Parking Advice:
                </h3>
                <ul className="text-ink space-y-1 list-disc pl-4 font-medium">
                  <li>
                    <strong>On-Site Hotel Car Park:</strong> Dedicated guest parking right in front of the hotel (discounted rates for congress pass holders).
                  </li>
                  <li>
                    <strong>Cotlands Road Car Park (BH1 3JR):</strong> 4-minute walk with large 24-hour pay-and-display capacity.
                  </li>
                </ul>
              </div>

              {/* Transit Info */}
              <div className="border-2 border-ink bg-poster-teal/20 p-4 space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-ink uppercase tracking-wider text-xs">
                  <Bus className="h-4 w-4 text-accent-teal" />
                  Transit &amp; Walking Distance:
                </h3>
                <ul className="text-ink space-y-1 list-disc pl-4 font-medium">
                  <li>
                    <strong>Bournemouth Central Train Station:</strong> Only a 5-minute walk (400 meters) straight down Holdenhurst Road.
                  </li>
                  <li>
                    <strong>Bournemouth Beach &amp; Pier:</strong> 8-minute walk from the hotel to the sea!
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 border-t-2 border-ink mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-ink/70 font-bold">Postcode: BH1 2PR</span>
            <div className="flex items-center gap-2">
              <a
                href="https://maps.apple.com/?address=Meyrick+Road,Bournemouth,BH1+2PR"
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center gap-1.5`}
              >
                <Navigation className="h-3.5 w-3.5" />
                Apple Maps
              </a>
              <a
                href="https://maps.google.com/?q=The+Roundhouse+Hotel+Meyrick+Road+Bournemouth+BH1+2PR"
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-3 py-1.5 min-h-[40px] inline-flex items-center gap-1.5`}
              >
                <MapPin className="h-3.5 w-3.5" />
                Google Maps
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Nearby Hotels for Dance Weekends Section */}
      <div className="border-4 border-ink bg-poster-teal p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_var(--color-ink)] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-ink pb-4">
          <div>
            <span className="border-2 border-ink bg-paper text-ink text-xs font-bold uppercase tracking-wider px-3 py-1 inline-block mb-2 shadow-[2px_2px_0_0_var(--color-ink)]">
              Visiting Dancer Guide
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-ink">
              Nearby Hotels for Dance Weekends &amp; DANZA! Festivals
            </h2>
            <p className="text-xs sm:text-sm text-ink font-semibold mt-1 max-w-2xl leading-relaxed">
              Travelling from London, Bristol, Southampton, or abroad for our weekend festivals? These verified walkable hotels are all within 3 to 10 minutes of BOH Studios Bournemouth (104 Commercial Rd, BH2 5LR).
            </p>
          </div>
          <span className="border-2 border-ink bg-poster-mustard text-ink text-xs font-bold px-3 py-1 shrink-0 shadow-[2px_2px_0_0_var(--color-ink)]">
            Walking Distance to BOH Studios
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Hotel 1: Hilton Bournemouth */}
          <div className="border-2 border-ink bg-paper p-5 space-y-3 shadow-[4px_4px_0_0_var(--color-ink)] flex flex-col justify-between text-ink">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-ink pb-2">
                <span className="border border-ink bg-poster-mustard text-ink text-xs font-bold px-2 py-0.5">
                  4-Star Premium
                </span>
                <span className="text-xs font-bold text-accent-red">3–5 min walk</span>
              </div>
              <h3 className="font-display font-black text-base uppercase text-ink">Hilton Bournemouth</h3>
              <p className="text-xs text-ink/75 font-medium">Terrace Rd, Bournemouth BH2 5EL</p>
              <p className="text-xs text-ink leading-relaxed font-medium">
                Closest upscale hotel to BOH Studios with secure on-site parking, Schpoons &amp; Forx restaurant, heated indoor pool, and luxury rooms.
              </p>
            </div>
            <div className="pt-2 border-t border-ink text-xs font-bold text-ink/70">
              Secure underground parking
            </div>
          </div>

          {/* Hotel 2: Hampton by Hilton */}
          <div className="border-2 border-ink bg-paper p-5 space-y-3 shadow-[4px_4px_0_0_var(--color-ink)] flex flex-col justify-between text-ink">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-ink pb-2">
                <span className="border border-ink bg-poster-teal text-ink text-xs font-bold px-2 py-0.5">
                  Hot Breakfast
                </span>
                <span className="text-xs font-bold text-accent-red">5 min walk</span>
              </div>
              <h3 className="font-display font-black text-base uppercase text-ink">Hampton by Hilton</h3>
              <p className="text-xs text-ink/75 font-medium">Upper Terrace Rd, Bournemouth BH2 5NW</p>
              <p className="text-xs text-ink leading-relaxed font-medium">
                Modern dancer favorite! Includes complimentary hot breakfast, 24/7 fitness center, on-site parking, and spacious rooms just around the corner from The Triangle.
              </p>
            </div>
            <div className="pt-2 border-t border-ink text-xs font-bold text-ink/70">
              Breakfast included with every stay
            </div>
          </div>

          {/* Hotel 3: Premier Inn Bournemouth Central */}
          <div className="border-2 border-ink bg-paper p-5 space-y-3 shadow-[4px_4px_0_0_var(--color-ink)] flex flex-col justify-between text-ink">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-ink pb-2">
                <span className="border border-ink bg-poster-mustard text-ink text-xs font-bold px-2 py-0.5">
                  Top Value
                </span>
                <span className="text-xs font-bold text-accent-red">8 min walk</span>
              </div>
              <h3 className="font-display font-black text-base uppercase text-ink">Premier Inn Central</h3>
              <p className="text-xs text-ink/75 font-medium">Westover Rd, Bournemouth BH1 2BZ</p>
              <p className="text-xs text-ink leading-relaxed font-medium">
                Superb central location overlooking Lower Gardens and 2 minutes from the pier. King-size Hypnos beds, quiet rooms, and very budget-friendly rates.
              </p>
            </div>
            <div className="pt-2 border-t border-ink text-xs font-bold text-ink/70">
              Close to beach &amp; gardens
            </div>
          </div>

          {/* Hotel 4: Holiday Inn Bournemouth */}
          <div className="border-2 border-ink bg-paper p-5 space-y-3 shadow-[4px_4px_0_0_var(--color-ink)] flex flex-col justify-between text-ink">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-ink pb-2">
                <span className="border border-ink bg-poster-blue text-paper text-xs font-bold px-2 py-0.5">
                  Full Service
                </span>
                <span className="text-xs font-bold text-accent-red">10 min walk</span>
              </div>
              <h3 className="font-display font-black text-base uppercase text-ink">Holiday Inn Bournemouth</h3>
              <p className="text-xs text-ink/75 font-medium">Bath Rd, Lansdowne, Bournemouth BH1 2NT</p>
              <p className="text-xs text-ink leading-relaxed font-medium">
                Convenient direct road access via Wessex Way with large on-site car park, open-lobby lounge bar, and full hot buffet breakfast.
              </p>
            </div>
            <div className="pt-2 border-t border-ink text-xs font-bold text-ink/70">
              Easy road access &amp; ample parking
            </div>
          </div>
        </div>
      </div>

      {/* Newcomer Arrival & Etiquette Guide */}
      <div className="border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[6px_6px_0_0_var(--color-ink)] space-y-6">
        <div className="border-b-4 border-ink pb-3 space-y-1">
          <p className={`${KICKER} text-accent-red`}>
            First-Timer FAQs
          </p>
          <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card}`}>
            What to Expect on Your First Visit to Salsa Explosion
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="border-2 border-ink bg-poster-mustard/20 p-5 space-y-2 shadow-[2px_2px_0_0_var(--color-ink)]">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-poster-mustard text-ink">
              <Footprints className="h-5 w-5" />
            </div>
            <h3 className="font-display font-black text-base uppercase text-ink">Footwear &amp; Attire</h3>
            <p className="text-xs text-ink leading-relaxed font-medium">
              Wear comfortable shoes with smooth soles (leather or suede soles are best). Avoid high-traction running sneakers so your knees can pivot freely during spins. Comfortable casual wear is perfect.
            </p>
          </div>

          <div className="border-2 border-ink bg-poster-teal/20 p-5 space-y-2 shadow-[2px_2px_0_0_var(--color-ink)]">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-poster-teal text-ink">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-display font-black text-base uppercase text-ink">No Partner Needed</h3>
            <p className="text-xs text-ink leading-relaxed font-medium">
              Over 70% of dancers arrive on their own! In Cuban Casino and Rueda de Casino, we rotate partners continuously so everyone gets to dance and practice both leading and following.
            </p>
          </div>

          <div className="border-2 border-ink bg-poster-blue/10 p-5 space-y-2 shadow-[2px_2px_0_0_var(--color-ink)]">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-poster-blue text-paper">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-display font-black text-base uppercase text-ink">1-Second Door Arrival</h3>
            <p className="text-xs text-ink leading-relaxed font-medium">
              Arrive 10 minutes before class. Simply pay cash or card at the desk or pull up your digital pass on your phone for immediate check-in at the BOH Studios door.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
