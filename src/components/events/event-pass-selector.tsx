"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DanceRole } from "@prisma/client";
import {
  CheckCircle2,
  Sparkles,
  Loader2,
  Ticket,
  Shirt,
  GraduationCap,
  X,
} from "lucide-react";
import { registerForEventTierAction } from "@/actions/management.actions";
import { createEventCheckoutSessionAction } from "@/actions/checkout.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentSecurityTrustBar } from "@/components/pricing/payment-security-trust-bar";
import { ScannableQrCode } from "@/components/ui/scannable-qr-code";

export interface SerializedEventTier {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  priceInCents: number;
  totalCapacity: number;
  maxLeads: number | null;
  maxFollows: number | null;
  bookedLeads: number;
  bookedFollows: number;
  totalBooked: number;
  userRegistration: {
    id: string;
    role: DanceRole;
    qrCodeHash: string;
    checkedIn: boolean;
  } | null;
}

interface EventPassSelectorProps {
  tiers: SerializedEventTier[];
  defaultPreferredRole: DanceRole;
}

export function EventPassSelector({
  tiers: initialTiers,
  defaultPreferredRole,
}: EventPassSelectorProps) {
  const [tiers, setTiers] = useState<SerializedEventTier[]>(initialTiers);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [upsellTarget, setUpsellTarget] = useState<{
    tier: SerializedEventTier;
    role: DanceRole;
  } | null>(null);
  const [addShirt, setAddShirt] = useState(false);
  const [addMasterclass, setAddMasterclass] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const onInitiateBooking = (tier: SerializedEventTier, role: DanceRole) => {
    const isCongressPass =
      tier.name.toLowerCase().includes("full") ||
      tier.name.toLowerCase().includes("congress") ||
      tier.name.toLowerCase().includes("bootcamp");

    if (isCongressPass) {
      setUpsellTarget({ tier, role });
      setAddShirt(false);
      setAddMasterclass(false);
    } else {
      handleRegister(tier.eventId, tier.id, role, false, false);
    }
  };

  const handleRegister = (
    eventId: string,
    ticketTierId: string,
    role: DanceRole,
    withShirt = false,
    withMasterclass = false
  ) => {
    setBanner(null);
    startTransition(async () => {
      const tier = tiers.find((t) => t.id === ticketTierId);

      // Paid passes route through hardened server-validated Stripe checkout
      if (tier && tier.priceInCents > 0) {
        const checkoutRes = await createEventCheckoutSessionAction({
          eventId,
          ticketTierId,
          role,
          addShirt: withShirt,
          addMasterclass: withMasterclass,
        });

        if (!checkoutRes.success) {
          setBanner({ type: "error", text: checkoutRes.error.message });
          return;
        }

        if (checkoutRes.data.url.startsWith("/")) {
          router.push(checkoutRes.data.url);
          router.refresh();
        } else {
          window.location.assign(checkoutRes.data.url);
        }
        return;
      }

      // Free / RSVP tier direct registration
      const res = await registerForEventTierAction({
        eventId,
        ticketTierId,
        role,
      });

      if (res.success) {
        setTiers((prev) =>
          prev.map((t) => {
            if (t.id !== ticketTierId) return t;
            return {
              ...t,
              totalBooked: t.totalBooked + 1,
              bookedLeads:
                role === DanceRole.LEAD ? t.bookedLeads + 1 : t.bookedLeads,
              bookedFollows:
                role === DanceRole.FOLLOW
                  ? t.bookedFollows + 1
                  : t.bookedFollows,
              userRegistration: {
                id: res.data.registrationId,
                role,
                qrCodeHash: res.data.qrCodeHash,
                checkedIn: false,
              },
            };
          })
        );
        setBanner({ type: "success", text: res.message });
      } else {
        setBanner({ type: "error", text: res.error.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
            banner.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const price = (tier.priceInCents / 100).toFixed(0);
          const isSoldOut = tier.totalBooked >= tier.totalCapacity;
          const remainingSpots = Math.max(0, tier.totalCapacity - tier.totalBooked);

          const remainingLeads =
            tier.maxLeads !== null
              ? Math.max(0, tier.maxLeads - tier.bookedLeads)
              : null;
          const remainingFollows =
            tier.maxFollows !== null
              ? Math.max(0, tier.maxFollows - tier.bookedFollows)
              : null;

          const hasRoleCap = tier.maxLeads !== null && tier.maxFollows !== null;

          return (
            <Card
              key={tier.id}
              className={`flex flex-col justify-between border shadow-sm transition-all ${
                tier.userRegistration
                  ? "border-emerald-500/50 bg-emerald-500/[0.02]"
                  : "hover:border-amber-500/50"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-bold leading-tight">{tier.name}</CardTitle>
                  {tier.userRegistration ? (
                    <Badge className="bg-emerald-600 text-white shrink-0 whitespace-nowrap">
                      Pass Active
                    </Badge>
                  ) : isSoldOut ? (
                    <Badge variant="destructive" className="shrink-0 whitespace-nowrap">Sold Out</Badge>
                  ) : (
                    <Badge variant="secondary" className="font-semibold text-xs shrink-0 whitespace-nowrap">
                      {remainingSpots} spots left
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight">
                    £{price}
                  </span>
                  <span className="text-xs text-muted-foreground">/ pass</span>
                </div>

                {tier.description && (
                  <CardDescription className="text-xs mt-2 line-clamp-3">
                    {tier.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {tier.userRegistration ? (
                  <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-3">
                    <div className="flex justify-center">
                      <ScannableQrCode
                        value={tier.userRegistration.qrCodeHash}
                        size={120}
                        label={tier.userRegistration.qrCodeHash}
                      />
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Verified Door QR Pass ({tier.userRegistration.role})
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Show this code at the festival entrance for 1-second check-in.
                    </p>
                  </div>
                ) : (
                  hasRoleCap && (
                    <div className="rounded-xl border bg-muted/40 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">
                          Lead Spots:
                        </span>
                        <span
                          className={`font-bold ${
                            remainingLeads !== null && remainingLeads <= 5
                              ? "text-amber-600 dark:text-amber-400"
                              : ""
                          }`}
                        >
                          {remainingLeads !== null && remainingLeads > 0
                            ? `${remainingLeads} available`
                            : "Full"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">
                          Follow Spots:
                        </span>
                        <span
                          className={`font-bold ${
                            remainingFollows !== null && remainingFollows <= 5
                              ? "text-amber-600 dark:text-amber-400"
                              : ""
                          }`}
                        >
                          {remainingFollows !== null && remainingFollows > 0
                            ? `${remainingFollows} available`
                            : "Full"}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t flex flex-col gap-2">
                {tier.userRegistration ? (
                  <Button
                    variant="secondary"
                    disabled
                    className="w-full text-xs font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Registered ({tier.userRegistration.qrCodeHash})
                  </Button>
                ) : hasRoleCap ? (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                      type="button"
                      disabled={
                        isPending ||
                        isSoldOut ||
                        (remainingLeads !== null && remainingLeads <= 0)
                      }
                      onClick={() =>
                        onInitiateBooking(tier, DanceRole.LEAD)
                      }
                      variant={
                        defaultPreferredRole === DanceRole.LEAD
                          ? "default"
                          : "outline"
                      }
                      className="text-xs font-bold min-h-11 h-auto py-2.5 px-2 whitespace-normal text-center flex items-center justify-center leading-tight"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Ticket className="mr-1 h-3.5 w-3.5 shrink-0" />
                          <span>Book as Lead</span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      disabled={
                        isPending ||
                        isSoldOut ||
                        (remainingFollows !== null && remainingFollows <= 0)
                      }
                      onClick={() =>
                        onInitiateBooking(tier, DanceRole.FOLLOW)
                      }
                      variant={
                        defaultPreferredRole === DanceRole.FOLLOW
                          ? "default"
                          : "outline"
                      }
                      className="text-xs font-bold min-h-11 h-auto py-2.5 px-2 whitespace-normal text-center flex items-center justify-center leading-tight"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Ticket className="mr-1 h-3.5 w-3.5 shrink-0" />
                          <span>Book as Follow</span>
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    disabled={isPending || isSoldOut}
                    onClick={() =>
                      onInitiateBooking(tier, DanceRole.SOLO)
                    }
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold shadow-xs text-xs min-h-11 h-auto py-2.5 px-3 whitespace-normal text-center leading-snug"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                    <span>{isSoldOut ? "Tier Sold Out" : `Get ${tier.name}`}</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Payment Security & Direct Registration Trust Bar */}
      <div className="pt-2">
        <PaymentSecurityTrustBar showRefundPolicy={false} />
      </div>

      {/* Congress VIP Upsell Modal / Drawer */}
      {upsellTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setUpsellTarget(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-5 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  VIP Congress Upgrade
                </div>
                <h3 className="text-lg font-black tracking-tight text-foreground">
                  Upgrade Your Bournemouth Congress Pass
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Base Selection:{" "}
                  <span className="font-bold text-foreground">
                    {upsellTarget.tier.name} ({upsellTarget.role}) — £
                    {(upsellTarget.tier.priceInCents / 100).toFixed(0)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setUpsellTarget(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Add-ons options */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Official Festival Add-Ons (Optional):
              </span>

              {/* Add-on 1: Official Congress T-Shirt */}
              <div
                onClick={() => setAddShirt((prev) => !prev)}
                className={`cursor-pointer rounded-xl border p-3.5 flex items-start gap-3 transition-all ${
                  addShirt
                    ? "border-amber-500 bg-amber-500/[0.08] ring-1 ring-amber-500/30"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    addShirt ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Shirt className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Official 2026 Congress T-Shirt</span>
                    <span className="text-amber-700 dark:text-amber-400 font-extrabold">+£20</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    100% organic cotton Salsa Explosion UK festival tee. Sizes S–XXL collected at the BOH Studios welcome desk.
                  </p>
                </div>
                <div
                  className={`h-4 w-4 rounded-xs border-2 flex items-center justify-center text-[10px] font-bold ${
                    addShirt ? "border-amber-600 bg-amber-600 text-white" : "border-muted-foreground"
                  }`}
                >
                  {addShirt ? "✓" : ""}
                </div>
              </div>

              {/* Add-on 2: Maestro Private Masterclass */}
              <div
                onClick={() => setAddMasterclass((prev) => !prev)}
                className={`cursor-pointer rounded-xl border p-3.5 flex items-start gap-3 transition-all ${
                  addMasterclass
                    ? "border-amber-500 bg-amber-500/[0.08] ring-1 ring-amber-500/30"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    addMasterclass ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Maestro Private Masterclass</span>
                    <span className="text-amber-700 dark:text-amber-400 font-extrabold">+£35</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Exclusive 45-minute small-group footwork & body isolation clinic with Maestro Enrique Perez Valdes. Limited to 12 Casineros.
                  </p>
                </div>
                <div
                  className={`h-4 w-4 rounded-xs border-2 flex items-center justify-center text-[10px] font-bold ${
                    addMasterclass ? "border-amber-600 bg-amber-600 text-white" : "border-muted-foreground"
                  }`}
                >
                  {addMasterclass ? "✓" : ""}
                </div>
              </div>
            </div>

            {/* Total breakdown */}
            <div className="rounded-xl border bg-muted/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{upsellTarget.tier.name} ({upsellTarget.role})</span>
                <span>£{(upsellTarget.tier.priceInCents / 100).toFixed(0)}</span>
              </div>
              {addShirt && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Official Congress T-Shirt</span>
                  <span>+£20</span>
                </div>
              )}
              {addMasterclass && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Maestro Private Masterclass</span>
                  <span>+£35</span>
                </div>
              )}
              <div className="pt-1.5 border-t flex justify-between font-extrabold text-sm text-foreground">
                <span>Total Amount:</span>
                <span className="text-amber-700 dark:text-amber-400">
                  £
                  {upsellTarget.tier.priceInCents / 100 +
                    (addShirt ? 20 : 0) +
                    (addMasterclass ? 35 : 0)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs"
                onClick={() => {
                  handleRegister(
                    upsellTarget.tier.eventId,
                    upsellTarget.tier.id,
                    upsellTarget.role,
                    false,
                    false
                  );
                  setUpsellTarget(null);
                }}
              >
                Pass Only (£{(upsellTarget.tier.priceInCents / 100).toFixed(0)})
              </Button>
              <Button
                type="button"
                size="sm"
                className="w-full sm:flex-1 bg-primary-base hover:bg-primary-hover text-white font-bold text-xs shadow-xs"
                onClick={() => {
                  handleRegister(
                    upsellTarget.tier.eventId,
                    upsellTarget.tier.id,
                    upsellTarget.role,
                    addShirt,
                    addMasterclass
                  );
                  setUpsellTarget(null);
                }}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Confirm & Proceed (£
                {upsellTarget.tier.priceInCents / 100 +
                  (addShirt ? 20 : 0) +
                  (addMasterclass ? 35 : 0)}
                )
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
