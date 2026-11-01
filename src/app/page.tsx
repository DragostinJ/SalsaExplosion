import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { InstructorRosterSection } from "@/components/home/InstructorRosterSection";
import { LiveTonightBanner } from "@/components/home/LiveTonightBanner";
import { UpcomingEventPosters } from "@/components/home/UpcomingEventPosters";
import {
  ArtHouseGallerySection,
  InsideCubanCircleGallery,
} from "@/components/home/ArtHouseGallerySection";
import { ACADEMY_METRICS, VENUE_INFO } from "@/lib/academy-data";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

const BohVenueSpotlight = dynamic(
  () => import("@/components/home/BohVenueSpotlight").then((m) => m.BohVenueSpotlight),
  {
    loading: () => <div className="py-20 min-h-[400px] animate-pulse bg-muted/20" />,
  }
);

// Re-render hourly so finished events leave the "What's On" posters without a redeploy
export const revalidate = 3600;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ivory">
      <main id="main-content" tabIndex={-1} className="flex-1">
        <LiveTonightBanner />

        {/* ================= SECTION 1: EDITORIAL SPLIT HERO ================= */}
        <section className="relative overflow-hidden py-4 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-canvas border-b border-line text-ivory">
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
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5 mb-4 sm:pb-4 sm:mb-8">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-gold">
                  BOH STUDIOS BOURNEMOUTH • THURSDAYS &amp; SUNDAYS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/venues"
                  className="text-xs font-bold uppercase tracking-widest text-ivory-muted hover:text-gold transition-colors"
                >
                  {VENUE_INFO.streetAddress.toUpperCase()}, {VENUE_INFO.postcode} →
                </Link>
              </div>
            </div>

            {/* 12-Column Architectural Split (6/6 Balanced on Desktop, Top Visual on Mobile) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">
              {/* Left Column (6 cols): Editorial Typography & Direct Action */}
              <div className="order-2 lg:order-1 lg:col-span-6 flex flex-col items-start text-left space-y-3.5 sm:space-y-5">
                {/* Monumental Architectural Headline */}
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-ivory">
                  Cuban Salsa &amp; Rueda de Casino
                  <span className="block font-sans text-lg sm:text-2xl font-normal tracking-tight text-ivory-muted mt-2 sm:mt-3">
                    In the heart of Bournemouth with Maestro Enrique Perez Valdes.
                  </span>
                </h1>

                <p className="text-sm sm:text-lg text-ivory-muted leading-relaxed max-w-xl mt-2 sm:mt-4">
                  Directed by Salsa UK Lifetime Achievement Award winner Maestro Enrique Perez Valdes. Join our weekly Thursday and Sunday classes (£12 / £14 at the door) and major Cuban festivals.
                </p>

                {/* Two Solid Architectural CTAs */}
                <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
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
                <p className="text-xs text-ivory-muted mt-1 sm:mt-2">
                  Weekly classes: pay at the door &middot; Festivals: book online
                </p>

                {/* Architectural Metrics Bar */}
                <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-line grid grid-cols-3 gap-4 sm:gap-6 w-full">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-gold">{ACADEMY_METRICS.yearsInUk}</div>
                    <div className="text-xs font-semibold text-ivory-muted uppercase tracking-wide">{ACADEMY_METRICS.yearsInUkLabel}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-ivory">{ACADEMY_METRICS.dancersMentored}</div>
                    <div className="text-xs font-semibold text-ivory-muted uppercase tracking-wide">{ACADEMY_METRICS.dancersMentoredLabel}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-gold">{ACADEMY_METRICS.partnerPolicy}</div>
                    <div className="text-xs font-semibold text-ivory-muted uppercase tracking-wide">{ACADEMY_METRICS.partnerPolicyLabel}</div>
                  </div>
                </div>
              </div>

              {/* Right Column (6 cols on desktop, top banner on mobile): Full-Colour Cinematic Dance Frame */}
              <div className="order-1 lg:order-2 lg:col-span-6 relative w-full">
                <div className="relative aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-canvas shadow-2xl group">
                  {MEDIA_MANIFEST.heroPortrait.src ? (
                    <Image
                      src={MEDIA_MANIFEST.heroPortrait.src}
                      alt={MEDIA_MANIFEST.heroPortrait.alt}
                      fill
                      priority
                      sizes={MEDIA_MANIFEST.heroPortrait.sizes}
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      {/* Architectural Stage Frame awaiting official portrait */}
                      <div className="absolute inset-0 pointer-events-none border border-white/[0.04]">
                        <div className="absolute top-3 right-3 text-white/20 text-xs font-mono select-none">+</div>
                        <div className="absolute bottom-3 right-3 text-white/20 text-xs font-mono select-none">+</div>
                        <div className="absolute inset-x-0 top-1/2 border-t border-white/[0.03]" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center font-display italic font-bold text-6xl sm:text-7xl text-amber-200/30 select-none">
                        EPV
                      </div>
                    </>
                  )}
                  {/* Soft left-edge and bottom-edge gradient vignettes to melt into Obsidian background */}
                  <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#080706] via-[#080706]/15 to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-[#080706]/10 to-transparent pointer-events-none z-10" />
                  <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-5 text-left z-20">
                    <span className="text-xs font-black uppercase tracking-widest text-gold block mb-0.5">
                      BOH Studios Bournemouth Residency
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-stone-200 leading-snug">
                      Cuban Salsa Social Dancing &amp; Rueda de Casino
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

            {/* Next festivals & parties from UPCOMING_EVENTS (finished ones drop off) */}
            <UpcomingEventPosters />
          </div>
        </section>

        {/* Interactive Instructor Roster Section */}
        <InstructorRosterSection id="instructors" />

        {/* Sleek Architectural Callout Banner for Gift Vouchers */}
        <div className="border-b border-line bg-surface-2/60 py-3.5 px-4 text-center">
          <p className="text-xs text-ivory-muted">
            Looking for a unique Cuban dance gift?{" "}
            <Link href="/pricing#vouchers" className="font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4 decoration-amber-400/40 ml-1">
              Explore Salsa Explosion Dance Gift Vouchers &rarr;
            </Link>
          </p>
        </div>

        {/* ================= SECTION 5: INSIDE THE CUBAN CIRCLE & BOH VENUE ================= */}
        <InsideCubanCircleGallery />

        {/* Flagship BOH Studios Venue & Arrival Guide */}
        <BohVenueSpotlight />
      </main>
    </div>
  );
}
