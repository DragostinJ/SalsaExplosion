"use client";

import * as React from "react";
import {
  Check,
  Sparkles,
  CreditCard,
  Loader2,
  AlertCircle,
  Settings,
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

interface PricingCardsProps {
  hasActiveSubscription: boolean;
  currentCredits: number;
}

export function PricingCards({
  hasActiveSubscription,
  currentCredits,
}: PricingCardsProps) {
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

      window.location.assign(response.data.url);
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

      window.location.assign(response.data.url);
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
            <Badge className="bg-emerald-600 text-white">
              Unlimited Membership Active
            </Badge>
          )}
        </div>

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
          const isCurrentLoading = isPending && activePackageId === pkg.id;

          return (
            <Card
              key={pkg.id}
              className={`flex flex-col justify-between transition-all ${
                pkg.popular
                  ? "border-primary shadow-md ring-1 ring-primary"
                  : ""
              } ${
                isSubCard
                  ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                  : ""
              }`}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={isSubCard ? "default" : "secondary"}
                    className={
                      isSubCard ? "bg-emerald-600 hover:bg-emerald-600" : ""
                    }
                  >
                    {isSubCard ? "Monthly Membership" : "Class Pack"}
                  </Badge>
                  {pkg.popular && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/40 text-amber-600 dark:text-amber-400"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Most Popular
                    </Badge>
                  )}
                </div>

                <CardTitle className="pt-2 text-xl">{pkg.name}</CardTitle>
                <div className="text-3xl font-extrabold tracking-tight">
                  {pkg.priceDisplay}
                </div>
                <CardDescription className="text-xs leading-relaxed">
                  {pkg.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
                <ul className="space-y-2.5 text-xs">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="border-t bg-muted/10 pt-4">
                {isSubCard && hasActiveSubscription ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={handleOpenBillingPortal}
                    className="w-full"
                  >
                    Manage Membership
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant={pkg.popular || isSubCard ? "default" : "secondary"}
                    disabled={isPending}
                    onClick={() => handleCheckout(pkg.id)}
                    className="w-full"
                  >
                    {isCurrentLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting to Stripe...
                      </>
                    ) : isSubCard ? (
                      "Subscribe Now"
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
    </div>
  );
}
