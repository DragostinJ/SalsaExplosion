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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentSecurityTrustBar } from "@/components/pricing/payment-security-trust-bar";

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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-3 text-sm">
          <CreditCard className="h-5 w-5 text-primary" />
          <span>
            Current Balance:{" "}
            <strong className="font-semibold">{currentCredits} Credits</strong>
          </span>
          {hasActiveSubscription && (
            <Badge className="bg-emerald-700 text-white">
              Unlimited Membership Active
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs font-semibold">
            <Link href="/dashboard/schedule">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
              Go to Class Schedule
            </Link>
          </Button>

          {hasActiveSubscription && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handleOpenBillingPortal}
            >
              {isPending && activePackageId === "PORTAL" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Settings className="mr-2 h-4 w-4" />
              )}
              Manage Subscription in Stripe
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
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
            <Card
              key={pkg.id}
              className={`flex flex-col justify-between transition-all ${
                isParchment
                  ? "bg-surface-3 text-ivory border-2 border-amber-500/40 shadow-xl ring-1 ring-amber-500/30"
                  : pkg.popular
                  ? "border-primary shadow-md ring-1 ring-primary bg-surface-2"
                  : "bg-surface-2 border-white/10"
              } ${
                isSubCard
                  ? "border-emerald-500/40 bg-emerald-950/20"
                  : ""
              }`}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={isSubCard ? "default" : "secondary"}
                    className={
                      isParchment
                        ? "bg-amber-500 text-stone-950 font-black"
                        : isSubCard
                        ? "bg-emerald-800 hover:bg-emerald-800 text-white"
                        : ""
                    }
                  >
                    {isParchment
                      ? "Havana Rhythm Pack"
                      : isSubCard
                      ? "Monthly Membership"
                      : pkg.id === "PACK_10"
                      ? "Best Value Casinero"
                      : "Class Pack"}
                  </Badge>
                  {(pkg.popular || isParchment) && (
                    <Badge
                      className={
                        isParchment
                          ? "bg-amber-400 text-stone-950 font-black text-[11px]"
                          : "bg-primary-base text-white font-bold text-[11px]"
                      }
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      {isParchment ? "Maestro Pick" : "Most Popular"}
                    </Badge>
                  )}
                </div>

                <CardTitle
                  className={`pt-2 text-xl ${
                    isParchment ? "text-white font-black" : ""
                  }`}
                >
                  {pkg.name}
                </CardTitle>
                <div
                  className={`text-3xl font-extrabold tracking-tight ${
                    isParchment ? "text-amber-300" : ""
                  }`}
                >
                  {pkg.priceDisplay}
                </div>
                <CardDescription
                  className={`text-xs leading-relaxed ${
                    isParchment ? "text-stone-300 font-medium" : ""
                  }`}
                >
                  {pkg.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
                <ul className="space-y-2.5 text-xs">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isParchment ? "text-amber-400" : "text-emerald-500"
                        }`}
                      />
                      <span className={isParchment ? "text-stone-200 font-semibold" : ""}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter
                className={`border-t pt-4 ${
                  isParchment ? "border-black/10 bg-black/[0.03]" : "bg-muted/10"
                }`}
              >
                {pkg.id === "PACK_SINGLE" ? (
                  <Button
                    asChild
                    className="w-full h-10 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs shadow-md"
                  >
                    <Link href="/dashboard/schedule">
                      Pay at Door (£12/£14) • View Schedule →
                    </Link>
                  </Button>
                ) : isSubCard && hasActiveSubscription ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={handleOpenBillingPortal}
                    className="w-full h-10 rounded-xl font-bold"
                  >
                    Manage Membership
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleCheckout(pkg.id)}
                    className={`w-full h-10 rounded-xl font-bold shadow-xs transition-colors ${
                      isParchment
                        ? "bg-amber-500 hover:bg-amber-400 text-stone-950 font-black"
                        : isSubCard
                        ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                        : pkg.popular
                        ? "bg-primary-base hover:bg-primary-hover text-white shadow-sm"
                        : "border-2 border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-600 hover:text-white"
                    }`}
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
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 max-w-3xl mx-auto">
        <PaymentSecurityTrustBar />
      </div>
    </div>
  );
}
