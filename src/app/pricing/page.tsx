import type { Metadata } from "next";
import Link from "next/link";
import { SubscriptionStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Door Admission & Festival Passes",
  description:
    "Transparent door admission for weekly Cuban Salsa classes at BOH Studios Bournemouth (£12 for 1 class / £14 for 2 classes), and online passes for Made in Cuba Dance Weekend.",
};
import { ShieldCheck, DoorOpen, Ticket, Sparkles } from "lucide-react";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { isNextControlFlowError } from "@/lib/safe-url";
import { PageHeader } from "@/components/layout/page-header";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { DanceVouchersShowcase } from "@/components/marketing/dance-vouchers-showcase";
import { MultiAgeReassuranceBanner } from "@/components/marketing/multi-age-reassurance-banner";
import { VENUE_INFO, DOOR_PRICING } from "@/lib/academy-data";
import { Button } from "@/components/ui/button";

export default async function PricingPage() {
  let user: Awaited<ReturnType<typeof getOrProvisionCurrentUser>> = null;
  try {
    user = await getOrProvisionCurrentUser();
  } catch (err: unknown) {
    if (isNextControlFlowError(err)) {
      throw err;
    }
    console.error("[PricingPage:getOrProvisionCurrentUser]", err);
  }

  let hasActiveSubscription = false;
  let currentCredits = 0;

  if (user) {
    currentCredits = user.classCredits;
    const now = new Date();
    hasActiveSubscription =
      user.subscription !== null &&
      user.subscription.status === SubscriptionStatus.ACTIVE &&
      user.subscription.currentPeriodEnd > now;
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* "The Place" Havana Nocturne Architectural PageHeader */}
      <PageHeader
        backHref="/dashboard/schedule"
        backLabel="Back to Schedule"
        eyebrowLeft="TRANSPARENT STUDIO ADMISSION & FESTIVAL PASSES"
        eyebrowRight={`${VENUE_INFO.shortName} • BOURNEMOUTH BH2 5LR`}
        title="DOOR ADMISSION &"
        highlight="Festival Passes"
        description={`Strictly Thursdays & Sundays at ${VENUE_INFO.name}. Transparent door admission for weekly studio classes, and secure online Stripe checkout for festivals, parties, and vouchers.`}
      />

      {/* 2-Column Policy Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gold text-xs font-black uppercase tracking-wider">
              <DoorOpen className="h-4 w-4" />
              <span>1. Weekly Classes (Paid at the Door)</span>
            </div>
            <div className="mt-2 space-y-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-ivory">
                £12 for 1 Class / £14 for 2 Classes
              </span>
              <p className="text-xs text-amber-100 font-semibold leading-relaxed">
                £12 for 1 Class / £14 for 2 Classes (Cash or Card at the Door — Havana Social Fiesta Included • No Prior Booking Required)
              </p>
              <p className="text-xs text-ivory-muted leading-relaxed">
                Pay Maestro Enrique directly when you arrive at BOH Studios Bournemouth. Both options include entry to the Havana Social Fiesta.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gold/20">
            <Button asChild variant="outline" className="w-full sm:w-auto border-gold/40 text-gold hover:bg-gold/20 text-xs font-bold h-9 rounded-xl">
              <Link href="/dashboard/schedule">
                View Class Schedule →
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-200 text-xs font-black uppercase tracking-wider">
              <Ticket className="h-4 w-4 text-emerald-400" />
              <span>2. Festivals &amp; Tickets (Booked Online)</span>
            </div>
            <div className="mt-2 space-y-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-ivory">
                Festivals, Special Nights &amp; Gift Vouchers
              </span>
              <p className="text-xs text-ivory-muted leading-relaxed">
                Official online passes for Made in Cuba Dance Weekend 2026, Halloween Fancy Dress Party, SB&amp;K Nights, and digital gift vouchers below.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line">
            <Button asChild className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white font-extrabold text-xs h-9 rounded-xl shadow-xs">
              <Link href="/events">
                <Ticket className="mr-1.5 h-3.5 w-3.5" />
                Book Festival Passes &amp; Tickets Online →
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-ivory-muted pt-2 border-t border-line">
        <div className="flex items-center gap-1.5 font-bold text-gold">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{DOOR_PRICING.summaryBadge}</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-ivory-muted">
          <span>{DOOR_PRICING.paymentMethodNote}</span>
        </div>
      </div>

      {/* UK Consumer Rights Pre-Checkout Guarantee */}
      <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="font-extrabold">UK Consumer Rights Guarantee:</strong> 14-day statutory cooling-off refund right on unused credit packs &amp; vouchers. Cancel weekly classes up to 2 hours before start for instant 100% credit return.
          </span>
        </div>
        <Link
          href="/terms#refunds"
          className="font-bold text-emerald-300 hover:underline shrink-0"
        >
          Read Refund Policy →
        </Link>
      </div>

      <PricingCards
        hasActiveSubscription={hasActiveSubscription}
        currentCredits={currentCredits}
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
