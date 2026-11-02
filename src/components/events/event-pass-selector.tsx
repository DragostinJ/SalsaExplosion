"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
import { PaymentSecurityTrustBar } from "@/components/pricing/payment-security-trust-bar";
import { ScannableQrCode } from "@/components/ui/scannable-qr-code";
import { VENUE_INFO } from "@/lib/academy-data";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

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
  purchasesUnavailable?: boolean;
  /** The event is over: show it as finished and disable every booking button. */
  eventFinished?: boolean;
}

export function EventPassSelector({
  tiers: initialTiers,
  defaultPreferredRole,
  purchasesUnavailable: bookingOffline = false,
  eventFinished = false,
}: EventPassSelectorProps) {
  const purchasesUnavailable = bookingOffline || eventFinished;
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
    if (purchasesUnavailable) return;
    const isCongressPass =
      tier.name.toLowerCase().includes("full") ||
      tier.name.toLowerCase().includes("congress") ||
      tier.name.toLowerCase().includes("weekend") ||
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
      {eventFinished && (
        <div
          data-testid="event-finished"
          role="status"
          className="border-4 border-ink bg-poster-mustard p-5 text-ink shadow-[6px_6px_0_0_#161311] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="font-display text-2xl text-ink">This event has finished</p>
            <p className="text-xs sm:text-sm font-semibold text-ink mt-1">
              Thank you to everyone who danced with us. Passes for the next parties and weekenders are on sale now.
            </p>
          </div>
          <Link
            href="/events"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} shrink-0 text-xs`}
          >
            See what&apos;s on next →
          </Link>
        </div>
      )}

      {bookingOffline && !eventFinished && (
        <div
          data-testid="event-purchases-unavailable"
          role="status"
          className="border-4 border-ink bg-poster-mustard p-5 text-ink shadow-[6px_6px_0_0_#161311] space-y-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-display text-2xl text-ink">
                Online Booking Opening Soon
              </p>
              <p className="text-xs sm:text-sm font-semibold text-ink mt-1">
                Online booking is temporarily unavailable. Please check back shortly or message us on WhatsApp.
              </p>
            </div>
            {VENUE_INFO.whatsappHref && (
              <a
                href={VENUE_INFO.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} shrink-0 text-xs`}
              >
                Message on WhatsApp →
              </a>
            )}
          </div>
        </div>
      )}

      {banner && (
        <div
          className={`border-4 border-ink p-4 text-xs font-bold ${
            banner.type === "success"
              ? "bg-poster-teal text-ink"
              : "bg-poster-red text-ink"
          }`}
        >
          {banner.text}
        </div>
      )}

      {/* Pass Tiers as Ticket Stubs */}
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const price = (tier.priceInCents / 100).toFixed(0);
          const isSoldOut = tier.totalBooked >= tier.totalCapacity;
          const remainingSpots = Math.max(0, tier.totalCapacity - tier.totalBooked);


          return (
            <article
              key={tier.id}
              className={`flex flex-col border-4 border-ink bg-paper text-ink transition-transform hover:-translate-y-0.5 shadow-[6px_6px_0_0_#161311] ${
                tier.userRegistration ? "ring-4 ring-poster-teal" : ""
              }`}
            >
              {/* Ticket Stub Perforated Header */}
              <div className="flex items-start justify-between gap-3 border-b-4 border-dashed border-ink bg-poster-mustard/20 p-5">
                <div>
                  <span className={`font-display ${TYPE.card} leading-none text-ink block`}>
                    {tier.name}
                  </span>
                  {tier.userRegistration ? (
                    <span className="mt-2 inline-block border-2 border-ink bg-poster-teal px-2 py-0.5 text-xs font-bold uppercase text-ink">
                      Pass Active
                    </span>
                  ) : isSoldOut ? (
                    <span className="mt-2 inline-block border-2 border-ink bg-poster-red px-2 py-0.5 text-xs font-bold uppercase text-ink">
                      Sold Out
                    </span>
                  ) : (
                    <span className="mt-2 inline-block border border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase text-ink">
                      {remainingSpots} spots left
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-display ${TYPE.number} text-accent-red leading-none block`}>
                    £{price}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink/70">
                    / pass
                  </span>
                </div>
              </div>

              {/* Ticket Stub Body */}
              <div className="flex flex-1 flex-col justify-between p-5 gap-4">
                {tier.description && (
                  <p className="text-xs font-medium text-ink leading-relaxed line-clamp-3">
                    {tier.description}
                  </p>
                )}

                {tier.userRegistration ? (
                  <div className="border-4 border-dashed border-ink bg-paper p-4 text-center space-y-3">
                    <div className="flex justify-center">
                      <ScannableQrCode
                        value={tier.userRegistration.qrCodeHash}
                        size={120}
                        label={tier.userRegistration.qrCodeHash}
                      />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-accent-red">
                      Verified Door QR Pass ({tier.userRegistration.role})
                    </div>
                    <p className="text-xs font-medium text-ink/70">
                      Show this code at the festival entrance for 1-second check-in.
                    </p>
                  </div>
                ) : (
                  null
                )}

                {/* Ticket Action Button(s) */}
                <div className="border-t-2 border-ink pt-3 flex flex-col gap-2">
                  {tier.userRegistration ? (
                    <button
                      type="button"
                      disabled
                      className={`${POSTER_BUTTON} border-poster-teal bg-poster-teal text-ink w-full text-xs font-bold cursor-default`}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Registered ({tier.userRegistration.qrCodeHash})
                    </button>
                  ) : (
                    // Lead or Follow is information for the teachers, never a limit
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        type="button"
                        disabled={
                          purchasesUnavailable ||
                          isPending ||
                          isSoldOut
                        }
                        aria-disabled={purchasesUnavailable || undefined}
                        onClick={() =>
                          onInitiateBooking(tier, DanceRole.LEAD)
                        }
                        className={`${POSTER_BUTTON} ${
                          defaultPreferredRole === DanceRole.LEAD
                            ? POSTER_BUTTON_COLORS.ink
                            : `${POSTER_BUTTON_COLORS.outline} bg-paper`
                        } text-xs min-h-[44px] py-2 px-2 text-center justify-center leading-tight`}
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Ticket className="mr-1 h-3.5 w-3.5 shrink-0" />
                            <span>{isSoldOut ? "Sold out" : "Book as Lead"}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={
                          purchasesUnavailable ||
                          isPending ||
                          isSoldOut
                        }
                        aria-disabled={purchasesUnavailable || undefined}
                        onClick={() =>
                          onInitiateBooking(tier, DanceRole.FOLLOW)
                        }
                        className={`${POSTER_BUTTON} ${
                          defaultPreferredRole === DanceRole.FOLLOW
                            ? POSTER_BUTTON_COLORS.ink
                            : `${POSTER_BUTTON_COLORS.outline} bg-paper`
                        } text-xs min-h-[44px] py-2 px-2 text-center justify-center leading-tight`}
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Ticket className="mr-1 h-3.5 w-3.5 shrink-0" />
                            <span>{isSoldOut ? "Sold out" : "Book as Follow"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Payment Security Trust Bar */}
      <div className="pt-2">
        <PaymentSecurityTrustBar showRefundPolicy={false} />
      </div>

      {/* Congress VIP Upsell Modal */}
      {upsellTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 animate-in fade-in duration-200"
          onClick={() => setUpsellTarget(null)}
        >
          <div
            className="relative w-full max-w-lg border-4 border-ink bg-paper p-6 text-ink shadow-[12px_12px_0_0_#161311] space-y-5 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b-4 border-ink">
              <div>
                <p className={`${KICKER} text-accent-red`}>VIP Congress Upgrade</p>
                <h3 className={`font-display ${TYPE.card} text-ink leading-tight mt-1`}>
                  Upgrade Your Pass
                </h3>
                <p className="text-xs font-semibold text-ink/70 mt-1">
                  Base Selection:{" "}
                  <span className="font-bold text-ink">
                    {upsellTarget.tier.name} ({upsellTarget.role}) — £
                    {(upsellTarget.tier.priceInCents / 100).toFixed(0)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setUpsellTarget(null)}
                className="border-2 border-ink p-1 text-ink hover:bg-ink hover:text-paper transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Add-ons options */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-ink/70 uppercase tracking-wider block">
                Official Festival Add-Ons (Optional):
              </span>

              {/* Add-on 1: Official Congress T-Shirt */}
              <div
                onClick={() => setAddShirt((prev) => !prev)}
                className={`cursor-pointer border-2 border-ink p-3.5 flex items-start gap-3 transition-colors ${
                  addShirt
                    ? "bg-poster-mustard/30 ring-2 ring-ink"
                    : "bg-paper hover:bg-surface-1"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-ink ${
                    addShirt ? "bg-ink text-paper" : "bg-paper text-ink"
                  }`}
                >
                  <Shirt className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Official 2026 Congress T-Shirt</span>
                    <span className="font-display text-base text-accent-red">+£20</span>
                  </div>
                  <p className="text-[11px] text-ink/70 leading-relaxed font-medium">
                    100% organic cotton Salsa Explosion UK festival tee. Sizes S–XXL collected at the BOH Studios welcome desk.
                  </p>
                </div>
                <div
                  className={`h-5 w-5 border-2 border-ink flex items-center justify-center text-xs font-bold ${
                    addShirt ? "bg-ink text-paper" : "bg-paper"
                  }`}
                >
                  {addShirt ? "✓" : ""}
                </div>
              </div>

              {/* Add-on 2: Maestro Private Masterclass */}
              <div
                onClick={() => setAddMasterclass((prev) => !prev)}
                className={`cursor-pointer border-2 border-ink p-3.5 flex items-start gap-3 transition-colors ${
                  addMasterclass
                    ? "bg-poster-mustard/30 ring-2 ring-ink"
                    : "bg-paper hover:bg-surface-1"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-ink ${
                    addMasterclass ? "bg-ink text-paper" : "bg-paper text-ink"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Maestro Private Masterclass</span>
                    <span className="font-display text-base text-accent-red">+£35</span>
                  </div>
                  <p className="text-[11px] text-ink/70 leading-relaxed font-medium">
                    Exclusive 45-minute small-group footwork & body isolation clinic with Maestro Enrique Perez Valdes. Limited to 12 Casineros.
                  </p>
                </div>
                <div
                  className={`h-5 w-5 border-2 border-ink flex items-center justify-center text-xs font-bold ${
                    addMasterclass ? "bg-ink text-paper" : "bg-paper"
                  }`}
                >
                  {addMasterclass ? "✓" : ""}
                </div>
              </div>
            </div>

            {/* Total breakdown */}
            <div className="border-2 border-ink bg-surface-1 p-3.5 space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between text-ink/70">
                <span>{upsellTarget.tier.name} ({upsellTarget.role})</span>
                <span>£{(upsellTarget.tier.priceInCents / 100).toFixed(0)}</span>
              </div>
              {addShirt && (
                <div className="flex justify-between text-ink/70">
                  <span>Official Congress T-Shirt</span>
                  <span>+£20</span>
                </div>
              )}
              {addMasterclass && (
                <div className="flex justify-between text-ink/70">
                  <span>Maestro Private Masterclass</span>
                  <span>+£35</span>
                </div>
              )}
              <div className="pt-2 border-t-2 border-ink flex justify-between font-display text-lg text-ink">
                <span>Total Amount:</span>
                <span className="text-accent-red">
                  £
                  {upsellTarget.tier.priceInCents / 100 +
                    (addShirt ? 20 : 0) +
                    (addMasterclass ? 35 : 0)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t-4 border-ink">
              <button
                type="button"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper w-full sm:w-auto text-xs`}
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
              </button>
              <button
                type="button"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} w-full sm:flex-1 text-xs`}
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
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
