"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { stripe } from "@/lib/stripe";
import {
  CLASSES_PAY_AT_DOOR_MESSAGE,
  CheckoutDomainError,
  type PackageId,
  type CheckoutActionResponse,
} from "@/lib/constants/pricing";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";
import { recordAuditLog } from "@/lib/audit-log";
import { ticketSalesBlockReason } from "@/lib/event-sales";

/** The retired class-pack request shape (kept so stale clients get a clear refusal) */
export type CreateCheckoutInput = { packageId: PackageId };

// ==========================================
// HELPER: RESOLVE APP BASE URL
// ==========================================

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function isLiveStripeConfigured(priceId: string): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key || key.includes("placeholder") || key.includes("...")) {
    return false;
  }
  if (!priceId || priceId.includes("placeholder") || priceId.includes("...")) {
    return false;
  }
  return true;
}

// ==========================================
// 1. WEEKLY CLASSES: NEVER SOLD ONLINE
// ==========================================

/**
 * Weekly Thursday and Sunday classes are paid at the door only (AGENTS.md §2, Enrique's rule).
 * This action used to sell class-credit packs and a monthly membership through Stripe; it now
 * always refuses, so no button can ever take money online for a class. Festival and
 * special-event passes go through createEventCheckoutSessionAction below.
 */
export async function createCheckoutSessionAction(
  rawInput: CreateCheckoutInput
): Promise<CheckoutActionResponse> {
  // An attempt means a stale page or someone probing: worth seeing in the logs
  console.warn("[createCheckoutSessionAction] Refused online class purchase:", String(rawInput?.packageId).slice(0, 40));
  return {
    success: false,
    error: { code: "PLAN_UNAVAILABLE", message: CLASSES_PAY_AT_DOOR_MESSAGE },
  };
}

// ==========================================
// 2. CREATE STRIPE BILLING PORTAL ACTION
// ==========================================

export async function createBillingPortalSessionAction(): Promise<CheckoutActionResponse> {
  // fallback-guard
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(identifier, "CHECKOUT", async (): Promise<CheckoutActionResponse> => {
    try {
      if (!user) {
        throw new CheckoutDomainError(
          "UNAUTHORIZED",
          "You must be signed in to manage your billing."
        );
      }
      if (isFallbackUser(user)) {
        throw new CheckoutDomainError("SERVICE_UNAVAILABLE", SERVICE_UNAVAILABLE_MESSAGE);
      }

      if (!user.stripeCustomerId) {
        throw new CheckoutDomainError(
          "USER_NOT_FOUND",
          "Memberships and weekly class admissions are handled directly at the door."
        );
      }

      const baseUrl = getAppBaseUrl();
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/pricing`,
      });

      return {
        success: true,
        data: { url: portalSession.url },
      };
    } catch (error) {
      if (error instanceof CheckoutDomainError) {
        return {
          success: false,
          error: { code: error.code, message: error.message },
        };
      }

      console.error("[createBillingPortalSessionAction Error]:", error);
      return {
        success: false,
        error: {
          code: "STRIPE_API_ERROR",
          message: "Could not open the billing portal. Please try again.",
        },
      };
    }
  });
}

// ==========================================
// 3. CREATE EVENT TICKET STRIPE CHECKOUT ACTION
// ==========================================

const CreateEventCheckoutSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  ticketTierId: z.string().min(1, "Ticket tier ID is required"),
  role: z.enum(["LEAD", "FOLLOW", "SOLO"] as const, {
    message: "Dance role must be LEAD, FOLLOW, or SOLO",
  }),
});

export type CreateEventCheckoutInput = z.infer<typeof CreateEventCheckoutSchema>;

export async function createEventCheckoutSessionAction(
  rawInput: CreateEventCheckoutInput
): Promise<CheckoutActionResponse> {
  // fallback-guard
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(identifier, "CHECKOUT", async (): Promise<CheckoutActionResponse> => {
    try {
      if (!user) {
        throw new CheckoutDomainError(
          "UNAUTHORIZED",
          "Please sign in to purchase an event pass."
        );
      }
      if (isFallbackUser(user)) {
        throw new CheckoutDomainError("SERVICE_UNAVAILABLE", SERVICE_UNAVAILABLE_MESSAGE);
      }

    const parsed = CreateEventCheckoutSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new CheckoutDomainError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid event pass selection."
      );
    }

    const { eventId, ticketTierId, role } = parsed.data;

    // Safety net: canonical / fallback mock tier check
    if (
      ticketTierId.startsWith("tier-") ||
      ticketTierId.startsWith("canonical-") ||
      eventId.startsWith("canonical-")
    ) {
      throw new CheckoutDomainError(
        "PLAN_UNAVAILABLE",
        "This event isn't open for online booking yet."
      );
    }

    const tier = await prisma.eventTicketTier.findUnique({
      where: { id: ticketTierId },
      include: {
        event: { select: { id: true, slug: true, title: true, status: true, endDate: true } },
        registrations: {
          where: { paymentStatus: "PAID" },
          select: { id: true, userId: true, role: true },
        },
      },
    });

    if (!tier || tier.eventId !== eventId) {
      throw new CheckoutDomainError("USER_NOT_FOUND", "Ticket tier not found.");
    }

    const salesBlocked = ticketSalesBlockReason(tier.event, tier);
    if (salesBlocked) {
      throw new CheckoutDomainError("PLAN_UNAVAILABLE", salesBlocked);
    }

    const existingUserPass = tier.registrations.find((r) => r.userId === user.id);
    if (existingUserPass) {
      throw new CheckoutDomainError(
        "ALREADY_SUBSCRIBED",
        "You already hold an active pass for this tier!"
      );
    }

    if (tier.registrations.length >= tier.totalCapacity) {
      throw new CheckoutDomainError(
        "PLAN_UNAVAILABLE",
        "This ticket tier is completely sold out."
      );
    }

    // The dance role is information for the teachers, never a limit (Enrique: classes and events
    // welcome everyone, even uneven); only the tier's ticket total can sell out.

    const baseUrl = getAppBaseUrl();

    // The pass is the only thing sold (no extras), at the server's price, never the client's
    const totalAmountInCents = tier.priceInCents;

    // Check if live Stripe is configured
    if (!isLiveStripeConfigured("live")) {
      if (
        process.env.NODE_ENV === "production" &&
        process.env.ALLOW_DEMO_PAYMENTS !== "true"
      ) {
        throw new CheckoutDomainError(
          "MISSING_STRIPE_CONFIG",
          "Live payment processing is not configured for this pass. Contact the studio administrator."
        );
      }

      // Demo/Pitch mode transactional registration and audit log
      const shortCode = randomUUID().slice(0, 8).toUpperCase();
      const qrCodeHash = `RF-PASS-${shortCode}`;

      await prisma.$transaction(async (tx) => {
        await tx.eventRegistration.create({
          data: {
            userId: user.id,
            eventId: tier.event.id,
            ticketTierId: tier.id,
            role,
            qrCodeHash,
            paymentStatus: "PAID",
            amountPaidInCents: totalAmountInCents,
          },
        });
      });

      await recordAuditLog({
        actorId: user.id,
        action: "EVENT_MUTATION",
        targetType: "EventRegistration",
        targetId: tier.id,
        metadata: {
          mode: "demo_checkout",
          tierName: tier.name,
          role,
          amountPaidInCents: totalAmountInCents,
        },
      });

      revalidatePath(`/events/${tier.event.slug}`);
      revalidatePath("/events");
      revalidatePath("/admin/events");

      return {
        success: true,
        data: {
          url: `${baseUrl}/events/${tier.event.slug}?checkout=demo_registered&tier=${tier.id}&role=${role}`,
        },
      };
    }

    // Ensure Stripe Customer exists
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
        metadata: { userId: user.id, clerkId: user.clerkId },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "gbp",
          unit_amount: tier.priceInCents,
          product_data: {
            name: `${tier.event.title} — ${tier.name}`,
            description: `${tier.description ?? "Congress Pass"} [Dance Role: ${role}]`,
          },
        },
        quantity: 1,
      },
    ];

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: user.id,
      mode: "payment",
      line_items: lineItems,
      metadata: {
        mode: "event_registration",
        eventId: tier.event.id,
        ticketTierId: tier.id,
        role,
        userId: user.id,
      },
      payment_intent_data: {
        metadata: {
          mode: "event_registration",
          eventId: tier.event.id,
          ticketTierId: tier.id,
          role,
          userId: user.id,
        },
      },
      success_url: `${baseUrl}/events/${tier.event.slug}?checkout=success&tier=${tier.id}`,
      cancel_url: `${baseUrl}/events/${tier.event.slug}?checkout=cancelled`,
    });

    if (!checkoutSession.url) {
      throw new CheckoutDomainError(
        "STRIPE_API_ERROR",
        "Failed to generate a Stripe Checkout redirect URL."
      );
    }

    return {
      success: true,
      data: { url: checkoutSession.url },
    };
  } catch (error) {
    if (error instanceof CheckoutDomainError) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }

    console.error("[createEventCheckoutSessionAction Error]:", error);
    return {
      success: false,
      error: {
        code: "STRIPE_API_ERROR",
        message: "Unable to connect to payment processor. Please try again.",
      },
    };
  }
  });
}
