import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Award,
  ArrowRight,
  QrCode,
  MapPin,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { LevelMatcherQuiz } from "@/components/marketing/level-matcher-quiz";
import { getCachedUpcomingEvents } from "@/lib/cached-queries";
import { InstructorRosterSection } from "@/components/home/InstructorRosterSection";
import { LiveTonightBanner } from "@/components/home/LiveTonightBanner";
import { WhyCubanSection } from "@/components/home/WhyCubanSection";
import { HavanaGrooveToggle } from "@/components/home/HavanaGrooveToggle";
import { TwoDayExhibitionTimetable } from "@/components/home/TwoDayExhibitionTimetable";
import { QuickBookDrawer } from "@/components/booking/QuickBookDrawer";
import { ArtReveal } from "@/components/ui/ArtReveal";

const DanceVouchersShowcase = dynamic(
  () => import("@/components/marketing/dance-vouchers-showcase").then((m) => m.DanceVouchersShowcase),
  {
    loading: () => <div className="py-12 min-h-[300px] animate-pulse bg-muted/10 rounded-3xl" />,
  }
);

const BohVenueSpotlight = dynamic(
  () => import("@/components/home/BohVenueSpotlight").then((m) => m.BohVenueSpotlight),
  {
    loading: () => <div className="py-20 min-h-[400px] animate-pulse bg-muted/20" />,
  }
);

const SocialProofGrid = dynamic(
  () => import("@/components/marketing/social-proof-grid").then((m) => m.SocialProofGrid),
  {
    loading: () => (
      <div className="py-20 flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse space-y-4 w-full max-w-7xl px-4">
          <div className="h-8 bg-muted rounded-xl w-64 mx-auto" />
          <div className="h-4 bg-muted/60 rounded-lg w-96 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="h-64 bg-muted/40 rounded-2xl" />
            <div className="h-64 bg-muted/40 rounded-2xl" />
            <div className="h-64 bg-muted/40 rounded-2xl" />
          </div>
        </div>
      </div>
    ),
  }
);

export default async function Home() {
  const upcomingEvents = await getCachedUpcomingEvents(3);
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <LiveTonightBanner />

        {/* Monumental "The Place" Editorial Hero — Pure Horizontal Architectural Split */}
        <section className="relative overflow-hidden py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#070605] border-b border-white/10 text-white">
          {/* Subtle Ambient Studio Light (zero geometric distortion) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.18), transparent 70%), radial-gradient(circle at 10% 30%, rgba(225, 29, 72, 0.12), transparent 50%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl">
            {/* Top Cultural Tag Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-8 sm:mb-12">
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-300">
                  BOH STUDIOS BOURNEMOUTH • THURSDAYS &amp; SUNDAYS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HavanaGrooveToggle />
              </div>
            </div>

            {/* 12-Column Architectural Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column (7 cols): Editorial Typography & Direct Action */}
              <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5">
                {/* Monumental Architectural Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-[4rem] font-extrabold tracking-tight leading-[1.02] text-white uppercase">
                  Cuban Salsa &amp; Rueda de Casino
                  <span className="block text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-zinc-300 mt-3 normal-case">
                    In the heart of Bournemouth with Maestro Enrique Perez Valdes.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-xl mt-6">
                  Directed by Salsa UK Lifetime Achievement Award winner Maestro Enrique Perez Valdes. Join our weekly Thursday and Sunday classes, Rueda circles, and Havana social fiestas at BOH Studios.
                </p>

                {/* Two Clean Side-by-Side Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Button
                    asChild
                    className="h-12 px-6 text-xs sm:text-sm font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black rounded-xl shadow-[0_10px_30px_rgba(245,158,11,0.25)] transition-transform active:scale-[0.99]"
                  >
                    <Link href="#timetable">
                      <span>Thursday &amp; Sunday Lineup ↓</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                  >
                    <Link href="/events/made-in-cuba-dance-weekend-2026">
                      <span>Made in Cuba — Dec 4–6 →</span>
                    </Link>
                  </Button>
                </div>

                {/* Architectural Metrics Bar */}
                <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-6 w-full">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-amber-300">33+ Years</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">Cuban Heritage</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white">4,200+</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">Dancers Mentored</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-amber-300">Zero Partner</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">Required to Join</div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Aspect-[4/5] Architectural Dance Frame */}
              <div className="lg:col-span-5 relative w-full">
                <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none overflow-hidden rounded-2xl border border-stone-800 bg-[#120d0a] shadow-2xl group">
                  <Image
                    src="https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80"
                    alt="Maestro Enrique Perez Valdes directing Cuban Salsa & Rueda de Casino at BOH Studios Bournemouth"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover editorial-photo transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-left z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block mb-1">
                      BOH Studios Bournemouth Residency
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-200 leading-snug">
                      Maestro Enrique Perez Valdes &amp; BOH Studios Collective
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two-Day Exhibition Timetable Showcase (Inspired by The Place) */}
        <TwoDayExhibitionTimetable />

        {/* Interactive Level Matcher Section — Promoted above the fold */}
        <section className="cv-auto py-10 bg-muted/20 border-b border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <LevelMatcherQuiz />

            {/* First-Timer Quick Guide Reassurance Bar */}
            <div className="mt-6 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-xs">
              <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3 text-center sm:text-left">
                First-Timer Quick Guide
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-xs text-foreground">
                  <span className="font-bold text-amber-500 dark:text-amber-400">Footwear</span>
                  <span className="text-muted-foreground">Comfortable flat shoes or trainers</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-xs text-foreground">
                  <span className="font-bold text-amber-500 dark:text-amber-400">No Partner Needed</span>
                  <span className="text-muted-foreground">Zero partner required (we rotate continuously)</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-xs text-foreground">
                  <span className="font-bold text-amber-500 dark:text-amber-400">Studio Bar &amp; Lounge</span>
                  <span className="text-muted-foreground">Refreshments &amp; social lounge at BOH Studios</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-xs text-foreground">
                  <span className="font-bold text-amber-500 dark:text-amber-400">Town-Centre Parking</span>
                  <span className="text-muted-foreground">Easy parking nearby (The Triangle, BH2 5LR)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Authentic Cuban Casino & Rueda vs Linear Styles */}
        <ArtReveal>
          <WhyCubanSection />
        </ArtReveal>

        {/* Founder & 25+ Year Cuban Heritage Spotlight — Havana Mahogany & Gold Wash */}
        <section className="cv-auto py-12 sm:py-16 bg-gradient-to-br from-[#260907] via-[#120605] to-[#080605] border-y border-amber-900/30 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-b from-[#1b0808]/90 via-[#120605]/95 to-[#080605] p-6 sm:p-10 shadow-2xl backdrop-blur-md">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                <div className="lg:col-span-7 space-y-4 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary-base text-white font-extrabold text-xs uppercase tracking-wider">
                      Academy Founder &amp; Artistic Director
                    </Badge>
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 font-black text-xs uppercase tracking-wider">
                      UK LIFETIME ACHIEVEMENT AWARD
                    </Badge>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                    Learn Cuban Casino from <br className="hidden sm:inline" />
                    <span className="font-display italic font-normal text-amber-300">Maestro Enrique Perez Valdes</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Born and raised in Havana, Cuba, Enrique Perez Valdes brought authentic Cuban Casino and Rueda de Casino to the UK over 25 years ago. Honored with the prestigious <strong>Salsa UK Lifetime Achievement Award</strong>, Enrique has trained over 4,200 dancers and organized Bournemouth&apos;s most celebrated Cuban congresses.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="rounded-xl border border-rose-500/20 bg-black/40 p-3">
                      <span className="block text-xl sm:text-2xl font-black text-rose-400">25+</span>
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Years Teaching</span>
                    </div>
                    <div className="rounded-xl border border-rose-500/20 bg-black/40 p-3">
                      <span className="block text-xl sm:text-2xl font-black text-white">4,200+</span>
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Dancers Mentored</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 rounded-xl border border-rose-500/20 bg-black/40 p-3">
                      <span className="block text-xl sm:text-2xl font-black text-emerald-400">Havana</span>
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Roots &amp; Heritage</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button asChild size="default" className="bg-primary-base hover:bg-primary-hover text-white font-bold h-10 rounded-xl">
                      <Link href="/about">
                        Read Enrique&apos;s Full Story
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="default" className="h-10 rounded-xl font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10">
                      <Link href="/dashboard/schedule">Book a Class with Enrique</Link>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col p-6 rounded-2xl border border-stone-800 bg-[#120d0a]/90 shadow-xl space-y-4">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <div className="relative shrink-0">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full ring-2 ring-rose-500/40 overflow-hidden bg-gradient-to-tr from-zinc-800 via-rose-700 to-zinc-900 flex items-center justify-center text-white shadow-md">
                        <Flame className="h-8 w-8 sm:h-10 sm:w-10 fill-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-primary-base text-white px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider shadow-xs">
                        🇨🇺 Cuba
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-white truncate">
                        Enrique Perez Valdes
                      </h3>
                      <p className="text-xs font-bold text-rose-300">
                        Havana Master Instructor • UK Pioneer
                      </p>
                      <span className="text-[11px] font-semibold text-zinc-400 block mt-0.5">
                        Director, Salsa Explosion UK
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-white/10">
                      <span className="font-semibold text-zinc-400">Specialties</span>
                      <span className="font-bold text-white">Casino • Rueda • Timba • Son</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/10">
                      <span className="font-semibold text-zinc-400">Experience</span>
                      <span className="font-bold text-white">30+ Years Social Dancing</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-semibold text-zinc-400">Recognition</span>
                      <span className="font-extrabold text-amber-300">Salsa UK Lifetime Award</span>
                    </div>
                  </div>

                  <blockquote className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs italic text-amber-100 leading-relaxed font-medium">
                    &ldquo;Cuban salsa is not just steps—it is community, clave, musicality, and pure joy. No partner required, just bring your energy.&rdquo;
                  </blockquote>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold border-amber-500/40 text-amber-200 bg-amber-500/15 hover:bg-amber-500/25"
                  >
                    <Link href="/private-lessons">
                      <span>Book 1-on-1 Private Coaching with Enrique</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Instructor Roster Section */}
        <ArtReveal>
          <InstructorRosterSection id="instructors" />
        </ArtReveal>

        <ArtReveal>
          <section className="cv-auto py-12 bg-[#0c0908] border-y border-amber-500/20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border-2 border-black/30 bg-[#E59819] text-[#0D0907] p-6 sm:p-9 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(229,152,25,0.35)] relative overflow-hidden group">
              <div
                className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-transform duration-1000"
                aria-hidden="true"
              />
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
                <div className="relative w-28 h-36 sm:w-36 sm:h-48 shrink-0 overflow-hidden rounded-2xl border-2 border-black/40 shadow-lg">
                  <Image
                    src="/images/made-in-cuba-2026-poster.jpg"
                    alt="MADE IN CUBA Dance Festival 2026 Official Poster"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 112px, 144px"
                  />
                </div>
                <div className="space-y-2.5">
                  <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge className="bg-black text-[#E59819] font-black text-xs uppercase tracking-wider">
                      🎉 33 Years of Salsa Explosion
                    </Badge>
                    <span className="text-sm font-black text-black">04 — 06 DEC 2026</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0D0907]">
                    MADE IN CUBA — Dance Weekend 2026
                  </h2>
                  <p className="text-xs sm:text-sm text-[#1A120B] max-w-2xl leading-relaxed font-medium">
                    South Coast&apos;s premier Cuban dance event celebrating 33 years! 3 nights of parties, 2 days of workshops, 2 spectacular shows, and dancing until 2:00 AM across 2 dedicated rooms (Salsa &amp; Timba Room + Bachata Room).
                  </p>
                  <p className="text-xs text-[#2A1D11] font-semibold">
                    📍 <strong>The Woodlands Ballroom</strong> (Friday Welcome Party) &amp; <strong>BOH Studios</strong> (Saturday &amp; Sunday Workshops + Shows + Fiesta).
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0 w-full sm:w-auto relative z-10">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-[#0D0907] hover:bg-black text-[#F6EFE6] font-black px-7 h-12 shadow-lg"
                >
                  <Link href="/events/made-in-cuba-dance-weekend-2026">
                    Reserve Passes (From £20)
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto border-black/30 bg-black/5 hover:bg-black/10 text-[#0D0907] font-bold backdrop-blur-sm h-11"
                >
                  <Link href="/events/made-in-cuba-dance-weekend-2026#timetable">
                    Full Festival Programme
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        </ArtReveal>

        {/* Interactive Social Proof & Media Grid */}
        <ArtReveal>
          <div className="cv-auto">
            <SocialProofGrid />
          </div>
        </ArtReveal>

        {/* Incoming Events & Social Parties Showcase */}
        {upcomingEvents.length > 0 && (
          <section className="cv-auto py-14 border-t bg-gradient-to-b from-background via-primary-base/[0.02] to-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <Badge variant="outline" className="text-xs font-bold mb-2 border-primary-base/30 text-rose-800 dark:text-rose-300 bg-primary-light/60">
                    Live Event Calendar
                  </Badge>
                  <h2 className="text-2xl font-extrabold sm:text-3xl tracking-tight">
                    Upcoming Salsa Explosion Nights & Festivals
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    From weekly Thursday parties at BOH Studios to flagship weekend Congresses in Bournemouth.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0 text-xs font-bold border-primary-base/30 text-rose-700 dark:text-rose-300 hover:bg-primary-base hover:text-white transition-colors">
                  <Link href="/events">
                    Browse All Passes & Events
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {/* Mobile Swipe Hint */}
              <div className="md:hidden flex items-center justify-between text-xs text-amber-300 font-bold px-1 mb-2">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  Swipe Upcoming Dates (1/{upcomingEvents.length})
                </span>
                <span className="text-[11px] text-zinc-400">Swipe →</span>
              </div>

              <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-5 pb-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
                {upcomingEvents.map((evt) => {
                  const minPrice = evt.ticketTiers[0]?.priceInCents
                    ? `£${(evt.ticketTiers[0].priceInCents / 100).toFixed(0)}`
                    : "TBA";

                  const startFormatted = new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(evt.startDate));

                  return (
                    <Card
                      key={evt.id}
                      className="flex flex-col overflow-hidden border shadow-xs hover:shadow-md transition-all group hover:border-primary-base/50 w-[82vw] shrink-0 snap-center md:w-auto"
                    >
                      <div className="relative h-36 w-full bg-gradient-to-tr from-primary-base via-rose-600 to-accent-tangerine p-5 text-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-black/40 text-white border-none text-[10px] backdrop-blur-sm">
                            {evt.slug.includes("congress") ? "Flagship Congress" : "Social Night & Class"}
                          </Badge>
                          <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            From {minPrice}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold leading-snug drop-shadow-sm line-clamp-2">
                          {evt.title}
                        </h3>
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {evt.guestArtists.slice(0, 3).map((artist) => {
                            const artistSlug = artist
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "");
                            return (
                              <Link
                                key={artist}
                                href={`#instructors-${artistSlug}`}
                                className="inline-flex"
                              >
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] bg-secondary-light text-secondary-hover font-bold border border-secondary-base/30 hover:bg-secondary-base hover:text-white transition-colors cursor-pointer"
                                >
                                  ★ {artist}
                                </Badge>
                              </Link>
                            );
                          })}
                        </div>
                        <CardDescription className="line-clamp-2 text-xs">
                          {evt.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 pt-1 space-y-1.5 text-xs text-muted-foreground flex-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>{startFormatted}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{evt.venueName}</span>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-2 border-t">
                        <Button asChild size="sm" className="w-full text-xs font-bold bg-primary hover:bg-primary/90">
                          <Link href={`/events/${evt.slug}`}>
                            Reserve Pass
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Dance Vouchers Gift Showcase */}
        <section className="cv-auto py-14 border-t bg-gradient-to-b from-background to-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <DanceVouchersShowcase />
          </div>
        </section>

        {/* Flagship BOH Studios Venue & Arrival Guide */}
        <BohVenueSpotlight />

        {/* 3-Portal Interactive Showcase */}
        <section className="cv-auto py-14 border-t bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="outline" className="text-xs font-semibold mb-2">
                The Complete Dancer Experience
              </Badge>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Everything You Need From Your First Basic Step to the Social Floor
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Purpose-built for Bournemouth dancers: structured 4-tier Cuban syllabus, Maestro Enrique video recaps, and lightning-fast digital passes.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Feature 1: Structured Cuban Learning */}
              <div className="rounded-2xl border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary-base/40 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs font-bold">
                      1. Weekly Classes & Timetable
                    </Badge>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      Beginner Friendly
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold">
                    BOH Studios Bournemouth Hub
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Every Thursday &amp; Sunday at BOH Studios Bournemouth. No partner required, fun social rotations, and strict lead/follow balance so you always have a partner.
                  </p>
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="outline" asChild className="w-full text-xs font-bold">
                    <Link href="/dashboard/schedule">Explore Thursday &amp; Sunday Timetable →</Link>
                  </Button>
                </div>
              </div>

              {/* Feature 2: Authentic Cuban Heritage */}
              <div className="rounded-2xl border border-secondary-base/30 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-secondary-base/60 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-secondary-base text-white text-xs font-bold">
                      2. Authentic Cuban Syllabus
                    </Badge>
                    <span className="text-[10px] font-bold text-secondary-hover bg-secondary-light px-2 py-0.5 rounded-full">
                      Direct from Havana
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold">
                    Casino, Rueda &amp; Musicality
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Progress smoothly from fundamental Guapea &amp; Dile Que No to advanced Vacilala, Sombrero, and lightning-fast Rueda de Casino calls under Maestro Enrique Perez Valdes.
                  </p>
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="outline" asChild className="w-full text-xs font-bold">
                    <Link href="/dashboard/rueda">Explore Rueda Dictionary &amp; Song Hub →</Link>
                  </Button>
                </div>
              </div>

              {/* Feature 3: Festivals & Private Coaching */}
              <div className="rounded-2xl border border-accent-tangerine/30 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-accent-tangerine/60 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-accent-tangerine text-zinc-950 text-xs font-bold">
                      3. Congresses &amp; Bespoke Coaching
                    </Badge>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      VIP Experiences
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold">
                    Weekend Festivals &amp; 1-on-1 Lessons
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Join the international Made in Cuba Dance Weekend or book private 1-on-1 coaching with Maestro Enrique, Moe Flex, Justyna, Arturas, or Jim for fast-track progression.
                  </p>
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="outline" asChild className="w-full text-xs font-bold">
                    <Link href="/events">Explore Congress Passes &amp; Private Lessons →</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Discrete Studio Operations link for teachers and staff */}
            <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Teaching desk or studio administration staff?</span>
              <Link
                href="/admin/operations"
                className="font-black text-rose-700 dark:text-rose-300 hover:underline inline-flex items-center gap-1"
              >
                Access Academy Teaching & Operations Portal →
              </Link>
            </div>
          </div>
        </section>

        {/* Core Capabilities Grid */}
        <section className="cv-auto py-16 border-t">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">
                  Balanced Lead & Follow Ratios
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Our smart real-time booking system automatically caps Lead and Follow tickets so you never spend a class waiting on the sidelines.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary-base mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">
                  4-Tier Cuban Salsa Syllabus
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Clear progression from Beginner to Improver, Intermediate, and Advanced covering Guapea, Dile Que No, Setenta, Vacilala, and Rueda command mastery.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-4">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">
                  Instant Digital Passes — Zero Booking Fees
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  One-tap Apple Pay, Google Pay, and card checkout with instant QR passes saved straight to your phone for 1-second door check-in at BOH Studios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Tap Interactive QuickBook & Live QR Drawer */}
        <QuickBookDrawer />
      </main>
    </div>
  );
}
