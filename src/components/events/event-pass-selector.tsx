"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DanceRole } from "@prisma/client";
import { CheckCircle2, Loader2, Ticket } from "lucide-react";
import { registerForEventTierAction } from "@/actions/management.actions";
import { createEventCheckoutSessionAction } from "@/actions/checkout.actions";
import { PaymentSecurityTrustBar } from "@/components/pricing/payment-security-trust-bar";
import { ScannableQrCode } from "@/components/ui/scannable-qr-code";
import { VENUE_INFO } from "@/lib/academy-data";
import { TYPE, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

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
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  // Every pass goes straight to checkout: Enrique removed the T-shirt and masterclass extras (2026-11-02)
  const onInitiateBooking = (tier: SerializedEventTier, role: DanceRole) => {
    if (purchasesUnavailable) return;
    handleRegister(tier.eventId, tier.id, role);
  };

  const handleRegister = (eventId: string, ticketTierId: string, role: DanceRole) => {
    setBanner(null);
    startTransition(async () => {
      const tier = tiers.find((t) => t.id === ticketTierId);

      // Paid passes route through hardened server-validated Stripe checkout
      if (tier && tier.priceInCents > 0) {
        const checkoutRes = await createEventCheckoutSessionAction({
          eventId,
          ticketTierId,
          role,
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
          className="border-4 border-ink bg-poster-mustard p-5 text-ink shadow-[6px_6px_0_0_var(--color-ink)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
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
          className="border-4 border-ink bg-poster-mustard p-5 text-ink shadow-[6px_6px_0_0_var(--color-ink)] space-y-2"
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
              className={`flex flex-col border-4 border-ink bg-paper text-ink transition-transform hover:-translate-y-0.5 shadow-[6px_6px_0_0_var(--color-ink)] ${
                tier.userRegistration ? "ring-4 ring-poster-teal" : ""
              }`}
            >
              {/* Ticket Stub Perforated Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b-4 border-dashed border-ink bg-poster-mustard/20 p-5">
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

    </div>
  );
}
