import { auth } from "@clerk/nextjs/server";
import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PricingCards } from "@/components/pricing/pricing-cards";

export default async function PricingPage() {
  const { userId: clerkId } = await auth();

  let hasActiveSubscription = false;
  let currentCredits = 0;

  if (clerkId) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    });

    if (user) {
      currentCredits = user.classCredits;
      const now = new Date();
      hasActiveSubscription =
        user.subscription !== null &&
        user.subscription.status === SubscriptionStatus.ACTIVE &&
        user.subscription.currentPeriodEnd > now;
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
    </main>
  );
}
