import { SubscriptionStatus } from "@prisma/client";
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
