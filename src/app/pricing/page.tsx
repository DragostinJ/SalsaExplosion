import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, DoorOpen, Ticket, Sparkles } from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { PricingViewerContext } from "@/components/pricing/pricing-viewer-context";
import { DanceVouchersShowcase } from "@/components/marketing/dance-vouchers-showcase";
import { MultiAgeReassuranceBanner } from "@/components/marketing/multi-age-reassurance-banner";
import { VENUE_INFO, DOOR_PRICING } from "@/lib/academy-data";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

export const metadata: Metadata = {
  title: "Door Admission & Festival Passes | Salsa Explosion Bournemouth",
  description:
    "Transparent door admission for weekly Cuban Salsa classes at BOH Studios Bournemouth (£12 for 1 class / £14 for 2 classes), and online passes for Made in Cuba Dance Weekend.",
};

export default function PricingPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Cartelera Architectural Poster Hero */}
      <section
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_#161311]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-3 text-xs font-bold uppercase tracking-[0.3em] text-ink">
          <span>Cartelera · Studio Admission &amp; Box Office</span>
          <span className="opacity-70">{VENUE_INFO.shortName} · BOURNEMOUTH BH2 5LR</span>
        </div>

        <div className="mt-4 space-y-3">
          <p className={KICKER}>Transparent Studio Admission &amp; Festival Passes</p>
          <h1 className={`${TYPE.section} text-ink`}>
            DOOR ADMISSION &amp; <span className="text-poster-red">Festival Passes</span>
          </h1>
          <p className="max-w-3xl text-sm font-semibold text-ink/80 leading-relaxed">
            Strictly Thursdays &amp; Sundays at {VENUE_INFO.name}. Transparent door admission for weekly studio classes, and secure online Stripe checkout for festivals, parties, and vouchers.
          </p>
        </div>
      </section>

      {/* 2-Column Cartelera Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Door Pricing Cartelera Block */}
        <div className="border-4 border-ink bg-poster-mustard p-6 text-ink shadow-[6px_6px_0_0_#161311] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b-2 border-ink pb-2">
              <span className="border border-ink bg-poster-red text-paper font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-0.5">
                <DoorOpen className="h-4 w-4" />
                1. Weekly Classes (Paid at the Door)
              </span>
              <span className="text-xs font-bold uppercase text-ink/80">
                No Booking Needed
              </span>
            </div>

            <div className="pt-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`font-display font-black ${TYPE.number} text-ink`}>
                  £12
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-ink/80">
                  1 Class
                </span>
                <span className="mx-1 text-ink/50 font-bold text-xl">/</span>
                <span className={`font-display font-black ${TYPE.number} text-ink`}>
                  £14
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-ink/80">
                  2 Classes &amp; Fiesta
                </span>
              </div>
              <p className="mt-2 text-xs font-bold text-ink leading-relaxed">
                Cash or Card at the Door — Havana Social Fiesta Included • No Prior Booking Required
              </p>
              <p className="mt-1 text-xs text-ink/80 font-medium leading-relaxed">
                Pay Maestro Enrique directly when you arrive at BOH Studios Bournemouth. Both options include full access to the late social fiesta.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-ink">
            <Link
              href="/dashboard/schedule"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold w-full sm:w-auto inline-flex items-center justify-center`}
            >
              View Class Schedule →
            </Link>
          </div>
        </div>

        {/* Festival Passes & Online Tickets */}
        <div className="border-4 border-ink bg-paper p-6 text-ink shadow-[6px_6px_0_0_#161311] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b-2 border-ink pb-2">
              <span className="border border-ink bg-poster-teal text-ink font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-0.5">
                <Ticket className="h-4 w-4" />
                2. Festivals &amp; Tickets (Booked Online)
              </span>
              <span className="text-xs font-bold uppercase text-ink/80">
                Stripe Box Office
              </span>
            </div>

            <div className="pt-1 space-y-2">
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-ink">
                Festivals, Special Nights &amp; Gift Vouchers
              </h3>
              <p className="text-xs text-ink/80 font-medium leading-relaxed">
                Official online passes for Made in Cuba Dance Weekend 2026, SB&amp;K Nights, seasonal parties, and digital gift vouchers below with instant digital tickets.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-ink">
            <Link
              href="/events"
              className={`${POSTER_BUTTON} border-poster-red bg-poster-red text-paper hover:bg-ink hover:text-paper text-xs font-bold w-full sm:w-auto inline-flex items-center justify-center gap-1.5`}
            >
              <Ticket className="h-3.5 w-3.5" />
              Book Festival Passes Online →
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Notes Bar */}
      <div className="border-2 border-ink bg-paper p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-ink shadow-[2px_2px_0_0_#161311]">
        <div className="flex items-center gap-1.5 text-poster-red">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{DOOR_PRICING.summaryBadge}</span>
        </div>
        <div className="flex items-center gap-1.5 text-ink/80 font-medium">
          <span>{DOOR_PRICING.paymentMethodNote}</span>
        </div>
      </div>

      {/* UK Consumer Rights Pre-Checkout Guarantee */}
      <div className="border-2 border-ink bg-poster-teal/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-ink shadow-[2px_2px_0_0_#161311]">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-poster-teal shrink-0" />
          <span>
            <strong className="font-bold">UK Consumer Rights Guarantee:</strong> 14-day statutory cooling-off refund right on unused credit packs &amp; vouchers. Cancel weekly classes up to 2 hours before start for instant 100% credit return.
          </span>
        </div>
        <Link
          href="/terms#refunds"
          className="font-bold underline text-ink shrink-0 hover:text-poster-red"
        >
          Read Refund Policy →
        </Link>
      </div>

      <PricingViewerContext
        initialHasActiveSubscription={false}
        initialCredits={0}
      />

      <div className="mt-12">
        <MultiAgeReassuranceBanner />
      </div>

      <div className="mt-14">
        <DanceVouchersShowcase />
      </div>
    </main>
  );
}
