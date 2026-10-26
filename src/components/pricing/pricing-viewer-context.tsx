"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getMyPassContextAction } from "@/actions/viewer.actions";
import { PricingCards } from "@/components/pricing/pricing-cards";

interface PricingViewerContextProps {
  initialHasActiveSubscription?: boolean;
  initialCredits?: number;
}

export function PricingViewerContext({
  initialHasActiveSubscription = false,
  initialCredits = 0,
}: PricingViewerContextProps) {
  const { isLoaded, isSignedIn } = useUser();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(
    initialHasActiveSubscription
  );
  const [currentCredits, setCurrentCredits] = useState(initialCredits);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      getMyPassContextAction().then((ctx) => {
        if (ctx.signedIn) {
          setCurrentCredits(ctx.classCredits);
          setHasActiveSubscription(ctx.hasActiveSubscription);
        }
      });
    }
  }, [isLoaded, isSignedIn]);

  return (
    <PricingCards
      hasActiveSubscription={hasActiveSubscription}
      currentCredits={currentCredits}
    />
  );
}
