"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  CreditCard,
  Loader2,
  AlertCircle,
  Settings,
  CalendarDays,
} from "lucide-react";
import {
  createCheckoutSessionAction,
  createBillingPortalSessionAction,
} from "@/actions/checkout.actions";
import {
  PackageId,
  PRICING_CATALOG,
  PricingPackage,
} from "@/lib/constants/pricing";
import { PaymentSecurityTrustBar } from "@/components/pricing/payment-security-trust-bar";
import { TYPE, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

interface PricingCardsProps {
  hasActiveSubscription: boolean;
  currentCredits: number;
}

export function PricingCards({
  hasActiveSubscription,
  currentCredits,
}: PricingCardsProps) {
  const router = useRouter();
  const [activePackageId, setActivePackageId] = React.useState<
    PackageId | "PORTAL" | null
  >(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const packages: PricingPackage[] = Object.values(PRICING_CATALOG);

  const handleCheckout = (packageId: PackageId) => {
    setErrorMessage(null);
    setActivePackageId(packageId);

    startTransition(async () => {
      const response = await createCheckoutSessionAction({ packageId });

      if (!response.success) {
        setErrorMessage(response.error.message);
        setActivePackageId(null);
        return;
      }

      if (response.data.url.startsWith("/")) {
        router.push(response.data.url);
        router.refresh();
      } else {
        window.location.assign(response.data.url);
      }
    });
  };

  const handleOpenBillingPortal = () => {
    setErrorMessage(null);
    setActivePackageId("PORTAL");

    startTransition(async () => {
      const response = await createBillingPortalSessionAction();

      if (!response.success) {
        setErrorMessage(response.error.message);
        setActivePackageId(null);
        return;
      }

      if (response.data.url.startsWith("/")) {
        router.push(response.data.url);
      } else {
        window.location.assign(response.data.url);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Wallet Summary Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-4 border-ink bg-paper p-4 sm:p-5 text-ink shadow-[6px_6px_0_0_#161311]">
        <div className="flex items-center gap-3 text-sm">
          <CreditCard className="h-5 w-5 text-poster-red" />
          <span className="font-semibold">
            Current Balance:{" "}
            <strong className="font-extrabold text-ink">{currentCredits} Credits</strong>
          </span>
          {hasActiveSubscription && (
            <span className="border border-ink bg-poster-teal text-ink font-bold uppercase text-xs px-2 py-0.5">
              Unlimited Pass Active
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/schedule"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs min-h-[40px] px-3 flex items-center gap-1.5`}
          >
            <CalendarDays className="h-3.5 w-3.5 text-poster-mustard" />
            Go to Class Schedule
          </Link>

          {hasActiveSubscription && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleOpenBillingPortal}
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs min-h-[40px] px-3 flex items-center gap-1.5`}
            >
              {isPending && activePackageId === "PORTAL" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Settings className="mr-2 h-4 w-4" />
              )}
              Manage in Stripe
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 border-2 border-poster-red bg-poster-red/10 p-4 text-xs font-bold text-poster-red shadow-[4px_4px_0_0_#161311]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pricing Tier Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => {
          const isSubCard = pkg.mode === "subscription";
          const isParchment = pkg.id === "PACK_5";
          const isCurrentLoading = isPending && activePackageId === pkg.id;

          return (
            <div
              key={pkg.id}
              className={`flex flex-col justify-between border-4 border-ink bg-paper text-ink shadow-[6px_6px_0_0_#161311] ${
                pkg.popular
                  ? "ring-2 ring-poster-red"
                  : ""
              }`}
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-1 border-b-2 border-ink pb-2.5">
                  <span
                    className={`border border-ink font-bold text-xs uppercase tracking-wider px-2 py-0.5 ${
                      isParchment
                        ? "bg-poster-mustard text-ink"
                        : isSubCard
                        ? "bg-poster-teal text-ink"
                        : pkg.id === "PACK_10"
                        ? "bg-poster-blue text-paper"
                        : "bg-paper text-ink"
                    }`}
                  >
                    {isParchment
                      ? "Havana Pack"
                      : isSubCard
                      ? "Monthly Pass"
                      : pkg.id === "PACK_10"
                      ? "Best Value"
                      : "Door Single"}
                  </span>
                  {(pkg.popular || isParchment) && (
                    <span className="border border-ink bg-poster-red text-paper font-bold uppercase text-[10px] px-2 py-0.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {isParchment ? "Maestro Pick" : "Popular"}
                    </span>
                  )}
                </div>

                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-ink pt-1">
                  {pkg.name}
                </h3>
                <div className={`font-display font-black ${TYPE.number} text-ink`}>
                  {pkg.priceDisplay}
                </div>
                <p className="text-xs text-ink/75 font-medium leading-relaxed min-h-[36px]">
                  {pkg.description}
                </p>

                <div className="border-t-2 border-ink pt-3">
                  <ul className="space-y-2 text-xs font-medium">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-poster-teal" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t-4 border-ink bg-surface-1 p-4">
                {pkg.id === "PACK_SINGLE" ? (
                  <Link
                    href="/dashboard/schedule"
                    className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.mustard} w-full text-center text-xs min-h-[44px] flex items-center justify-center font-bold`}
                  >
                    Pay at Door (£12/£14) • View Schedule →
                  </Link>
                ) : isSubCard && hasActiveSubscription ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleOpenBillingPortal}
                    className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper w-full text-center text-xs min-h-[44px] flex items-center justify-center font-bold`}
                  >
                    Manage Membership
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleCheckout(pkg.id)}
                    className={`${POSTER_BUTTON} ${
                      pkg.popular
                        ? "border-poster-red bg-poster-red text-paper hover:bg-ink hover:text-paper"
                        : POSTER_BUTTON_COLORS.ink
                    } w-full text-center text-xs min-h-[44px] flex items-center justify-center font-bold`}
                  >
                    {isCurrentLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting to Stripe...
                      </>
                    ) : isSubCard ? (
                      "Join Unlimited Pass"
                    ) : (
                      `Buy ${pkg.creditAmount} ${
                        pkg.creditAmount === 1 ? "Credit" : "Credits"
                      }`
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 max-w-3xl mx-auto">
        <PaymentSecurityTrustBar />
      </div>
    </div>
  );
}
