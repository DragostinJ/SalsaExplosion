"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Stripe from "stripe";
import { SubscriptionStatus, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { stripe } from "@/lib/stripe";
import {
  PackageId,
  PRICING_CATALOG,
  CheckoutDomainError,
  type CheckoutActionResponse,
} from "@/lib/constants/pricing";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";

// ==========================================
// ZOD VALIDATION SCHEMA
// ==========================================

const CreateCheckoutSchema = z.object({
  packageId: z.enum(
    ["PACK_SINGLE", "PACK_5", "PACK_10", "SUB_UNLIMITED_MONTHLY"] as const,
    {
      message: "Invalid pricing package selected.",
    }
  ),
});

export type CreateCheckoutInput = z.infer<typeof CreateCheckoutSchema>;

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
// 1. CREATE STRIPE CHECKOUT SESSION ACTION
// ==========================================

export async function createCheckoutSessionAction(
  rawInput: CreateCheckoutInput
): Promise<CheckoutActionResponse> {
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(identifier, "CHECKOUT", async (): Promise<CheckoutActionResponse> => {
    try {
      // 1. Verify Authentication & Provision User
      if (!user) {
        throw new CheckoutDomainError(
          "UNAUTHORIZED",
          "Please sign in to purchase a class pass or membership."
        );
      }

    // 2. Validate Package Selection
    const parsed = CreateCheckoutSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new CheckoutDomainError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid package selection."
      );
    }

    const pkg = PRICING_CATALOG[parsed.data.packageId as PackageId];
    const stripePriceId =
      process.env[pkg.stripePriceIdEnvVar] ||
      `price_${pkg.id.toLowerCase()}_placeholder`;

    // 3. Guard Against Duplicate Active Subscriptions
    const now = new Date();
    const hasActiveSubscription =
      user.subscription !== null &&
      user.subscription.status === SubscriptionStatus.ACTIVE &&
      user.subscription.currentPeriodEnd > now;

    if (pkg.mode === "subscription" && hasActiveSubscription) {
      throw new CheckoutDomainError(
        "ALREADY_SUBSCRIBED",
        "You already have an active Unlimited Studio Membership."
      );
    }

    // 4. Local / Studio Demo Direct Fulfillment Mode (when Stripe Price IDs or Keys are placeholders)
    if (!isLiveStripeConfigured(stripePriceId)) {
      if (
        process.env.NODE_ENV === "production" &&
        process.env.ALLOW_DEMO_PAYMENTS !== "true"
      ) {
        throw new CheckoutDomainError(
          "MISSING_STRIPE_CONFIG",
          "Live payment processing is not configured for this package. Contact the studio administrator."
        );
      }

      await prisma.$transaction(async (tx) => {
        if (pkg.mode === "subscription") {
          const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await tx.subscription.upsert({
            where: { userId: user.id },
            update: {
              status: SubscriptionStatus.ACTIVE,
              stripePriceId,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
            },
            create: {
              userId: user.id,
              stripeSubscriptionId: `sub_demo_${randomUUID().slice(0, 10)}`,
              stripePriceId,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
            },
          });
        } else {
          const updatedUser = await tx.user.update({
            where: { id: user.id },
            data: { classCredits: { increment: pkg.creditAmount } },
            select: { classCredits: true },
          });

          await tx.creditLedger.create({
            data: {
              userId: user.id,
              amount: pkg.creditAmount,
              balanceAfter: updatedUser.classCredits,
              type: TransactionType.CREDIT_PACK_PURCHASE,
              stripePaymentIntentId: `pi_demo_${randomUUID()}`,
              description: `Purchased ${pkg.name} (+${pkg.creditAmount} credits)`,
            },
          });
        }
      });

      revalidatePath("/dashboard/schedule");
      revalidatePath("/pricing");
      revalidatePath("/instructor/students");
      revalidatePath("/admin/analytics");

      return {
        success: true,
        data: {
          url: `/dashboard/schedule?checkout=demo_success&pkg=${pkg.id}`,
        },
      };
    }

    // 5. Ensure User Has a Linked Stripe Customer ID
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        metadata: {
          userId: user.id,
          clerkId: user.clerkId,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const baseUrl = getAppBaseUrl();

    // 6. Construct Mode-Specific Metadata & Session Parameters
    const sharedMetadata: Record<string, string> = {
      userId: user.id,
      clerkId: user.clerkId,
      packageId: pkg.id,
      packName: pkg.name,
      creditAmount: String(pkg.creditAmount),
    };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      client_reference_id: user.id,
      mode: pkg.mode,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      metadata: sharedMetadata,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${baseUrl}/dashboard/schedule?checkout=success&pkg=${pkg.id}`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      ...(pkg.mode === "subscription"
        ? {
            subscription_data: {
              metadata: {
                userId: user.id,
                clerkId: user.clerkId,
                packageId: pkg.id,
              },
            },
          }
        : {
            payment_intent_data: {
              metadata: sharedMetadata,
            },
          }),
    };

    // 7. Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

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

    console.error("[createCheckoutSessionAction Error]:", error);
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

// ==========================================
// 2. CREATE STRIPE BILLING PORTAL ACTION
// ==========================================

export async function createBillingPortalSessionAction(): Promise<CheckoutActionResponse> {
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

      if (!user.stripeCustomerId) {
        throw new CheckoutDomainError(
          "USER_NOT_FOUND",
          "Your Unlimited Studio Membership is currently managed in local demo mode."
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
  role: z.enum(["LEAD", "FOLLOW"] as const, {
    message: "Dance role must be LEAD or FOLLOW",
  }),
});

export type CreateEventCheckoutInput = z.infer<typeof CreateEventCheckoutSchema>;

export async function createEventCheckoutSessionAction(
  rawInput: CreateEventCheckoutInput
): Promise<CheckoutActionResponse> {
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

    const parsed = CreateEventCheckoutSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new CheckoutDomainError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid event pass selection."
      );
    }

    const { eventId, ticketTierId, role } = parsed.data;

    const tier = await prisma.eventTicketTier.findUnique({
      where: { id: ticketTierId },
      include: {
        event: { select: { id: true, slug: true, title: true } },
        registrations: {
          where: { paymentStatus: "PAID" },
          select: { id: true, userId: true, role: true },
        },
      },
    });

    if (!tier || tier.eventId !== eventId) {
      throw new CheckoutDomainError("USER_NOT_FOUND", "Ticket tier not found.");
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

    if (role === "LEAD" && tier.maxLeads !== null) {
      const leads = tier.registrations.filter((r) => r.role === "LEAD").length;
      if (leads >= tier.maxLeads) {
        throw new CheckoutDomainError(
          "PLAN_UNAVAILABLE",
          "Lead spots for this tier are currently full."
        );
      }
    }

    if (role === "FOLLOW" && tier.maxFollows !== null) {
      const follows = tier.registrations.filter((r) => r.role === "FOLLOW").length;
      if (follows >= tier.maxFollows) {
        throw new CheckoutDomainError(
          "PLAN_UNAVAILABLE",
          "Follow spots for this tier are currently full."
        );
      }
    }

    const baseUrl = getAppBaseUrl();

    // Check if live Stripe is configured
    if (!isLiveStripeConfigured("live")) {
      return {
        success: true,
        data: {
          url: `${baseUrl}/events/${tier.event.slug}?checkout=demo_registered&tier=${tier.id}`,
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

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: user.id,
      mode: "payment",
      line_items: [
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
      ],
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
