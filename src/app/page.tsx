import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Flame,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { InstructorRosterSection } from "@/components/home/InstructorRosterSection";
import { LiveTonightBanner } from "@/components/home/LiveTonightBanner";
import {
  ArtHouseGallerySection,
  InsideCubanCircleGallery,
} from "@/components/home/ArtHouseGallerySection";
import { ArtReveal } from "@/components/ui/ArtReveal";
import { ACADEMY_METRICS, VENUE_INFO } from "@/lib/academy-data";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ivory">
      <main id="main-content" tabIndex={-1} className="flex-1">
        <LiveTonightBanner />

        {/* ================= SECTION 1: EDITORIAL SPLIT HERO ================= */}
        <section className="relative overflow-hidden py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-canvas border-b border-line text-ivory">
          {/* Subtle Ambient Studio Light */}
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 mb-8 sm:mb-12">
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-gold">
                  BOH STUDIOS BOURNEMOUTH • THURSDAYS &amp; SUNDAYS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/venues"
                  className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-ivory-muted hover:text-gold transition-colors"
                >
                  {VENUE_INFO.streetAddress.toUpperCase()}, {VENUE_INFO.postcode} →
                </Link>
              </div>
            </div>

            {/* 12-Column Architectural Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column (7 cols): Editorial Typography & Direct Action */}
              <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5">
                {/* Monumental Architectural Headline */}
                <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08] text-ivory">
                  Cuban Salsa &amp; Rueda de Casino
                  <span className="block font-sans text-xl sm:text-2xl lg:text-3xl font-normal tracking-tight text-ivory-muted mt-3">
                    In the heart of Bournemouth with Maestro Enrique Perez Valdes.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-ivory-muted leading-relaxed max-w-xl mt-6">
                  Directed by Salsa UK Lifetime Achievement Award winner Maestro Enrique Perez Valdes. Join our weekly Thursday and Sunday classes (£12 / £14 at the door) and major Cuban festivals.
                </p>

                {/* Two Solid Architectural CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Button
                    asChild
                    className="h-12 px-6 text-xs sm:text-sm font-black uppercase tracking-wider bg-brand hover:bg-brand-hover text-white rounded-xl shadow-xs transition-transform active:scale-[0.99]"
                  >
                    <Link href="/dashboard/schedule">
                      <span>Thu &amp; Sun Classes</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider border border-line hover:border-gold/40 bg-surface-3 text-ivory rounded-xl"
                  >
                    <Link href="/events">
                      <span>Festival Tickets</span>
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-ivory-muted mt-2">
                  Weekly classes: pay at the door &middot; Festivals: book online
                </p>

                {/* Architectural Metrics Bar */}
                <div className="mt-10 pt-6 border-t border-line grid grid-cols-3 gap-6 w-full">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-gold">{ACADEMY_METRICS.yearsInUk}</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-ivory-muted uppercase tracking-wide">{ACADEMY_METRICS.yearsInUkLabel}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-ivory">{ACADEMY_METRICS.dancersMentored}</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-ivory-muted uppercase tracking-wide">{ACADEMY_METRICS.dancersMentoredLabel}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-gold">{ACADEMY_METRICS.partnerPolicy}</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-ivory-muted uppercase tracking-wide">{ACADEMY_METRICS.partnerPolicyLabel}</div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Aspect-[4/5] Architectural Dance Frame */}
              <div className="lg:col-span-5 relative w-full">
                <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-2xl group">
                  <Image
                    src={MEDIA_MANIFEST.heroPortrait.src}
                    alt={MEDIA_MANIFEST.heroPortrait.alt}
                    fill
                    priority
                    sizes={MEDIA_MANIFEST.heroPortrait.sizes}
                    className="object-cover editorial-photo transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-left z-10">
                    <span className="text-[11px] font-black uppercase tracking-widest text-gold block mb-1">
                      BOH Studios Bournemouth Residency
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-stone-200 leading-snug">
                      Maestro Enrique Perez Valdes &amp; BOH Studios Collective
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: 4 CORE PHOTO GATEWAYS ================= */}
        <ArtHouseGallerySection />

        {/* ================= SECTION 3: WHAT'S ON: FESTIVALS & SPECIAL EVENTS (VERTICAL POSTERS) ================= */}
        <section className="cv-auto py-14 sm:py-20 border-b border-line bg-surface-1 text-ivory">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-line">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-gold block mb-1">
                  OFFICIAL ONLINE BOX OFFICE • FESTIVALS &amp; SPECIAL EVENTS
                </span>
                <h2 className="text-2xl font-black sm:text-4xl uppercase tracking-tight text-white leading-none">
                  What&apos;s On:{" "}
                  <span className="font-display italic font-normal text-amber-300 lowercase">
                    festivals &amp; congresses
                  </span>
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-ivory-muted">
                  Book official online passes for Salsa Explosion flagship congresses, bank holiday weekenders, and costume parties in Bournemouth.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0 text-xs font-bold border-white/20 bg-white/5 text-stone-200 hover:bg-white/10 hover:text-white transition-colors rounded-xl">
                <Link href="/events">
                  Browse All 2026/2027 Passes →
                </Link>
              </Button>
            </div>

            {/* 3-Column Exhibition Poster Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Event 1: Halloween Fancy Dress Latin Party */}
              <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-surface-2 overflow-hidden shadow-2xl hover:border-amber-400/50 transition-all duration-300">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-950">
                  <Image
                    src={MEDIA_MANIFEST.events.halloweenParty}
                    alt="Halloween Fancy Dress Latin Party Official Event Poster"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
                      SAT 31 OCT 2026
                    </span>
                    <span className="rounded-md bg-amber-400 text-stone-950 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider">
                      THIS SATURDAY
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="rounded-md bg-amber-400 text-stone-950 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider">
                      From £12
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                      Halloween Fancy Dress Latin Party
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-ivory-muted mt-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>BOH Studios Bournemouth</span>
                    </div>
                    <p className="text-xs text-ivory-muted mt-2 line-clamp-2 leading-relaxed">
                      Cash prizes for best dressed, Cuban Salsa &amp; Bachata workshops, guest maestros, and dancing until 02:00.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between">
                    <Button
                      asChild
                      className="w-full bg-brand hover:bg-brand-hover text-white font-black text-xs h-10 rounded-xl shadow-xs"
                    >
                      <Link href="/events/halloween-fancy-dress-latin-party-2026">
                        <Ticket className="mr-1.5 h-3.5 w-3.5" />
                        Book Party Pass Online →
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Event 2: SB&K Night Extravaganza */}
              <div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface-2 overflow-hidden shadow-xs hover:border-gold/40 transition-all duration-300">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-950">
                  <Image
                    src={MEDIA_MANIFEST.events.sbkNight}
                    alt="SB&K Night Extravaganza Official Event Poster"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-gold">
                      SAT 14 NOV 2026
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="rounded-md bg-gold text-stone-950 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider">
                      From £12
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                      SB&amp;K Night! Extravaganza
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-ivory-muted mt-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>BOH Studios Bournemouth</span>
                    </div>
                    <p className="text-xs text-ivory-muted mt-2 line-clamp-2 leading-relaxed">
                      Salsa, Bachata &amp; Kizomba across 2 vibrant rooms. 20:00 workshops followed by Bournemouth&apos;s premier Saturday social.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between">
                    <Button
                      asChild
                      className="w-full bg-brand hover:bg-brand-hover text-white font-black text-xs h-10 rounded-xl shadow-xs"
                    >
                      <Link href="/events/sbk-night-extravaganza-nov-2026">
                        <Ticket className="mr-1.5 h-3.5 w-3.5" />
                        Book SB&amp;K Pass Online →
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Event 3: MADE IN CUBA Dance Weekend 2026 */}
              <div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface-2 overflow-hidden shadow-xs hover:border-gold/40 transition-all duration-300">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-950">
                  <Image
                    src={MEDIA_MANIFEST.events.madeInCuba2026}
                    alt="MADE IN CUBA Dance Weekend 2026 Official Festival Poster"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-md bg-black/85 backdrop-blur-xs border border-white/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-gold">
                      04 — 06 DEC 2026
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="rounded-md bg-gold text-stone-950 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider">
                      From £20
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-ivory group-hover:text-gold transition-colors leading-snug">
                      MADE IN CUBA — Dance Weekend 2026
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-ivory-muted mt-1">
                      <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                      <span>BOH Studios Bournemouth</span>
                    </div>
                    <p className="text-xs text-ivory-muted mt-2 line-clamp-2 leading-relaxed">
                      3 nights of parties, 2 days of workshops, and dancing until 02:00 across 2 dedicated rooms celebrating 25+ years of Salsa Explosion heritage.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between">
                    <Button
                      asChild
                      className="w-full bg-brand hover:bg-brand-hover text-white font-black text-xs h-10 rounded-xl shadow-xs"
                    >
                      <Link href="/events/made-in-cuba-dance-weekend-2026">
                        <Ticket className="mr-1.5 h-3.5 w-3.5" />
                        Book Official Pass Online →
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: ARTISTIC DIRECTOR & RESIDENT FACULTY ================= */}
        {/* Founder & 25+ Year Cuban Heritage Spotlight */}
        <section className="cv-auto py-12 sm:py-16 bg-canvas border-b border-line text-ivory">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-line bg-surface-1 p-6 sm:p-10 shadow-2xl">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                <div className="lg:col-span-7 space-y-4 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-brand text-white font-extrabold text-xs uppercase tracking-wider">
                      Academy Founder &amp; Artistic Director
                    </Badge>
                    <Badge variant="outline" className="border-gold/30 bg-gold/10 text-gold font-black text-xs uppercase tracking-wider">
                      UK LIFETIME ACHIEVEMENT AWARD
                    </Badge>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ivory uppercase">
                    Learn Cuban Casino from <br className="hidden sm:inline" />
                    <span className="font-display italic font-normal text-gold normal-case">Maestro Enrique Perez Valdes</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-ivory-muted leading-relaxed">
                    Born and raised in Havana, Cuba, Enrique Perez Valdes brought authentic Cuban Casino and Rueda de Casino to the UK over 25 years ago. Honored with the prestigious <strong>Salsa UK Lifetime Achievement Award</strong>, Enrique has trained over 4,200 dancers and organized Bournemouth&apos;s most celebrated Cuban congresses.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="rounded-xl border border-line bg-surface-2 p-3">
                      <span className="block text-xl sm:text-2xl font-black text-gold">{ACADEMY_METRICS.yearsInUk}</span>
                      <span className="text-[11px] font-semibold text-ivory-muted uppercase tracking-wider">{ACADEMY_METRICS.yearsInUkLabel}</span>
                    </div>
                    <div className="rounded-xl border border-line bg-surface-2 p-3">
                      <span className="block text-xl sm:text-2xl font-black text-ivory">{ACADEMY_METRICS.dancersMentored}</span>
                      <span className="text-[11px] font-semibold text-ivory-muted uppercase tracking-wider">{ACADEMY_METRICS.dancersMentoredLabel}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 rounded-xl border border-line bg-surface-2 p-3">
                      <span className="block text-xl sm:text-2xl font-black text-emerald-400">Havana</span>
                      <span className="text-[11px] font-semibold text-ivory-muted uppercase tracking-wider">Roots &amp; Heritage</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button asChild size="default" className="bg-brand hover:bg-brand-hover text-white font-bold h-10 rounded-xl">
                      <Link href="/about">
                        Read Enrique&apos;s Full Story
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="default" className="h-10 rounded-xl font-semibold border-line bg-surface-3 text-ivory hover:bg-surface-2">
                      <Link href="/dashboard/schedule">Join Enrique on Thu &amp; Sun (£12 / £14 at Door) →</Link>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col p-6 rounded-2xl border border-line bg-surface-2 shadow-xl space-y-4">
                  <div className="flex items-center gap-4 border-b border-line pb-4">
                    <div className="relative shrink-0">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full ring-2 ring-gold/40 overflow-hidden bg-surface-3 flex items-center justify-center text-white shadow-md">
                        <Flame className="h-8 w-8 sm:h-10 sm:w-10 fill-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-brand text-white px-1.5 py-0.2 text-[11px] font-black uppercase tracking-wider shadow-xs">
                        🇨🇺 Cuba
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-ivory truncate">
                        Enrique Perez Valdes
                      </h3>
                      <p className="text-xs font-bold text-gold">
                        Havana Master Instructor • UK Pioneer
                      </p>
                      <span className="text-[11px] font-semibold text-ivory-muted block mt-0.5">
                        Director, Salsa Explosion UK
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-line">
                      <span className="font-semibold text-ivory-muted">Specialties</span>
                      <span className="font-bold text-ivory">Casino • Rueda • Timba • Son</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-line">
                      <span className="font-semibold text-ivory-muted">Experience</span>
                      <span className="font-bold text-ivory">{ACADEMY_METRICS.yearsInUk} {ACADEMY_METRICS.yearsInUkLabel}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-semibold text-ivory-muted">Recognition</span>
                      <span className="font-extrabold text-gold">Salsa UK Lifetime Award</span>
                    </div>
                  </div>

                  <blockquote className="rounded-xl border border-gold/20 bg-gold/10 p-3.5 text-xs italic text-amber-100 leading-relaxed font-medium">
                    &ldquo;Cuban salsa is not just steps—it is community, clave, musicality, and pure joy. No partner required, just bring your energy.&rdquo;
                  </blockquote>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold border-gold/40 text-gold bg-gold/10 hover:bg-gold/20"
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

        {/* Community Social Proof Grid */}
        <ArtReveal>
          <div className="cv-auto bg-canvas border-b border-line">
            <SocialProofGrid />
          </div>
        </ArtReveal>

        {/* Dance Vouchers Gift Showcase */}
        <section className="cv-auto py-14 border-b border-line bg-canvas text-ivory">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <DanceVouchersShowcase />
          </div>
        </section>

        {/* ================= SECTION 5: INSIDE THE CUBAN CIRCLE & BOH VENUE ================= */}
        <InsideCubanCircleGallery />

        {/* Flagship BOH Studios Venue & Arrival Guide */}
        <BohVenueSpotlight />
      </main>
    </div>
  );
}
