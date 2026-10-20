import Link from "next/link";
import { SubscriptionStatus } from "@prisma/client";
import { ShieldCheck } from "lucide-react";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { BackButton } from "@/components/navigation/back-button";
import { DanceVouchersShowcase } from "@/components/marketing/dance-vouchers-showcase";
import { MultiAgeReassuranceBanner } from "@/components/marketing/multi-age-reassurance-banner";

export default async function PricingPage() {
  const user = await getOrProvisionCurrentUser();

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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Class Passes & Memberships
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
          Choose a drop-in pass, multi-class rhythm pack, or unlimited monthly
          access to our Cuban Salsa (Casino & Rueda) schedule.
        </p>
      </div>

      {/* UK Consumer Rights Pre-Checkout Guarantee */}
      <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="font-extrabold">UK Consumer Rights Guarantee:</strong> 14-day statutory cooling-off refund right on unused credit packs & vouchers. Cancel weekly classes up to 2 hours before start for instant 100% credit return.
          </span>
        </div>
        <Link
          href="/terms#refunds"
          className="font-bold text-emerald-800 dark:text-emerald-300 hover:underline shrink-0"
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
