import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  Prisma,
  SubscriptionStatus,
  TransactionType,
} from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// ==========================================
// HELPER: MAP STRIPE SUBSCRIPTION STATUS
// ==========================================

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
    case "unpaid":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "paused":
      return SubscriptionStatus.CANCELED;
    case "incomplete":
    case "incomplete_expired":
    default:
      return SubscriptionStatus.INCOMPLETE;
  }
}

// ==========================================
// HELPER: SYNC SUBSCRIPTION STATE
// ==========================================

async function upsertSubscriptionFromStripe(
  stripeSub: Stripe.Subscription,
  fallbackUserId?: string
): Promise<void> {
  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id;

  const primaryItem = stripeSub.items.data[0];
  const priceId = primaryItem?.price.id ?? "unknown_price";

  // Resolve user by metadata userId first, falling back to stripeCustomerId
  const metadataUserId = stripeSub.metadata?.userId ?? fallbackUserId;

  const user = await prisma.user.findFirst({
    where: metadataUserId
      ? { OR: [{ id: metadataUserId }, { stripeCustomerId: customerId }] }
      : { stripeCustomerId: customerId },
    select: { id: true, stripeCustomerId: true },
  });

  if (!user) {
    throw new Error(
      `[Stripe Webhook]: Unable to resolve User for subscription ${stripeSub.id} (customer: ${customerId})`
    );
  }

  // Ensure user.stripeCustomerId is linked
  if (!user.stripeCustomerId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const mappedStatus = mapStripeSubscriptionStatus(stripeSub.status);
  const subAny = stripeSub as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    period_start?: number;
    period_end?: number;
    start_date?: number;
  };
  const periodStart =
    subAny.current_period_start ??
    subAny.period_start ??
    subAny.start_date ??
    Math.floor(Date.now() / 1000);
  const periodEnd =
    subAny.current_period_end ??
    subAny.period_end ??
    periodStart + 30 * 24 * 60 * 60;

  const currentPeriodStart = new Date(periodStart * 1000);
  const currentPeriodEnd = new Date(periodEnd * 1000);

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      status: mappedStatus,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      status: mappedStatus,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  });
}

// ==========================================
// POST ROUTE HANDLER
// ==========================================

export async function POST(req: Request): Promise<NextResponse> {
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[Stripe Webhook]: Missing STRIPE_WEBHOOK_SECRET env variable.");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // 1. Read Raw Body & Signature Header
  const rawBody = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // 2. Verify Stripe Cryptographic Signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Stripe Webhook]: Signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // 3. Handle Verified Stripe Events
  try {
    switch (event.type) {
      // ----------------------------------------------------------------
      // A. CHECKOUT SESSION COMPLETED (One-Time Credit Packs & Initial Subs)
      // ----------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId ?? session.client_reference_id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        // Branch 1: One-Time Class Pass Purchase (Credits)
        if (session.mode === "payment") {
          if (session.payment_status !== "paid") {
            break;
          }

          const creditAmount = Number.parseInt(
            session.metadata?.creditAmount ?? "0",
            10
          );
          const packName = session.metadata?.packName ?? "Class Credit Pack";
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id;

          if (!userId || !paymentIntentId || Number.isNaN(creditAmount) || creditAmount <= 0) {
            console.error(
              "[Stripe Webhook]: Missing userId, paymentIntentId, or valid creditAmount in session metadata:",
              session.id
            );
            return NextResponse.json(
              { error: "Invalid payment metadata" },
              { status: 400 }
            );
          }

          try {
            await prisma.$transaction(async (tx) => {
              const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                  classCredits: { increment: creditAmount },
                  ...(customerId ? { stripeCustomerId: customerId } : {}),
                },
                select: { classCredits: true },
              });

              await tx.creditLedger.create({
                data: {
                  userId,
                  amount: creditAmount,
                  balanceAfter: updatedUser.classCredits,
                  type: TransactionType.CREDIT_PACK_PURCHASE,
                  stripePaymentIntentId: paymentIntentId,
                  description: `Purchased ${packName} (+${creditAmount} credits)`,
                },
              });
            });
          } catch (txError) {
            if (
              txError instanceof Prisma.PrismaClientKnownRequestError &&
              txError.code === "P2002"
            ) {
              console.info(
                `[Stripe Webhook]: Idempotent skip — PaymentIntent ${paymentIntentId} already credited.`
              );
              return NextResponse.json({ received: true, idempotent: true }, { status: 200 });
            }
            throw txError;
          }
        }

        // Branch 2: Recurring Membership Checkout Completed
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertSubscriptionFromStripe(stripeSub, userId ?? undefined);
        }

        break;
      }

      // ----------------------------------------------------------------
      // B. INVOICE PAID (Recurring Membership Renewals)
      // ----------------------------------------------------------------
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceAny = invoice as unknown as {
          subscription?: string | { id: string };
          parent?: { subscription_details?: { subscription?: string | { id: string } } };
          payment_intent?: string | { id: string };
        };

        const rawSub = invoiceAny.subscription ?? invoiceAny.parent?.subscription_details?.subscription;
        const subscriptionId = typeof rawSub === "string" ? rawSub : rawSub?.id;

        if (subscriptionId) {
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertSubscriptionFromStripe(stripeSub);

          const rawPaymentIntent = invoiceAny.payment_intent;
          const paymentIntentId =
            typeof rawPaymentIntent === "string"
              ? rawPaymentIntent
              : rawPaymentIntent?.id;

          if (paymentIntentId) {
            const subRecord = await prisma.subscription.findUnique({
              where: { stripeSubscriptionId: subscriptionId },
              include: { user: { select: { id: true, classCredits: true } } },
            });

            if (subRecord) {
              await prisma.creditLedger
                .create({
                  data: {
                    userId: subRecord.user.id,
                    amount: 0,
                    balanceAfter: subRecord.user.classCredits,
                    type: TransactionType.SUBSCRIPTION_RENEWAL,
                    stripePaymentIntentId: paymentIntentId,
                    description: `Unlimited Membership renewed through ${subRecord.currentPeriodEnd.toLocaleDateString("en-GB")}`,
                  },
                })
                .catch((err: unknown) => {
                  if (
                    !(
                      err instanceof Prisma.PrismaClientKnownRequestError &&
                      err.code === "P2002"
                    )
                  ) {
                    throw err;
                  }
                });
            }
          }
        }
        break;
      }

      // ----------------------------------------------------------------
      // C. SUBSCRIPTION UPDATED OR DELETED (Upgrades, Cancellations, Past Due)
      // ----------------------------------------------------------------
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        await upsertSubscriptionFromStripe(stripeSub);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(`[Stripe Webhook Error on ${event.type}]:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
