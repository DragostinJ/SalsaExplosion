// src/lib/constants/pricing.ts

export type PackageId =
  | "PACK_SINGLE"
  | "PACK_5"
  | "PACK_10"
  | "SUB_UNLIMITED_MONTHLY";

export interface PricingPackage {
  id: PackageId;
  name: string;
  description: string;
  priceDisplay: string;
  mode: "payment" | "subscription";
  stripePriceIdEnvVar: string;
  creditAmount: number; // 0 for recurring unlimited subscriptions
  features: string[];
  popular?: boolean;
}

export const PRICING_CATALOG: Record<PackageId, PricingPackage> = {
  PACK_SINGLE: {
    id: "PACK_SINGLE",
    name: "Single Drop-In Pass",
    description: "Perfect for trying out a Cuban Salsa Casino or Rueda class.",
    priceDisplay: "£12",
    mode: "payment",
    stripePriceIdEnvVar: "STRIPE_PRICE_SINGLE_DROPIN",
    creditAmount: 1,
    features: [
      "1 Class Credit",
      "Valid for any unlocked dance level",
      "12-hour free cancellation refund",
    ],
  },
  PACK_5: {
    id: "PACK_5",
    name: "5-Class Rhythm Pack",
    description: "Ideal for weekly dancers building consistent Casino technique.",
    priceDisplay: "£50",
    mode: "payment",
    stripePriceIdEnvVar: "STRIPE_PRICE_5_PACK",
    creditAmount: 5,
    features: [
      "5 Class Credits (£10 / class)",
      "Valid across all Cuban Salsa levels",
      "Credits never expire",
    ],
  },
  PACK_10: {
    id: "PACK_10",
    name: "10-Class Salsero Pack",
    description: "Best value credit bundle for dedicated Cuban Salsa dancers.",
    priceDisplay: "£90",
    mode: "payment",
    stripePriceIdEnvVar: "STRIPE_PRICE_10_PACK",
    creditAmount: 10,
    popular: true,
    features: [
      "10 Class Credits (£9 / class)",
      "Valid for all Cuban Salsa & Rueda classes",
      "Priority video level-up reviews",
    ],
  },
  SUB_UNLIMITED_MONTHLY: {
    id: "SUB_UNLIMITED_MONTHLY",
    name: "Unlimited Studio Membership",
    description: "All-access monthly pass for dedicated dancers.",
    priceDisplay: "£110 / month",
    mode: "subscription",
    stripePriceIdEnvVar: "STRIPE_PRICE_UNLIMITED_MONTHLY",
    creditAmount: 0,
    features: [
      "Unlimited weekly studio classes",
      "Zero credit deductions when booking",
      "Free entry to monthly social practice",
      "Cancel anytime via Billing Portal",
    ],
  },
} as const;

// ==========================================
// DOMAIN ERRORS & RESPONSE TYPES
// ==========================================

export type CheckoutErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "USER_NOT_FOUND"
  | "ALREADY_SUBSCRIBED"
  | "PLAN_UNAVAILABLE"
  | "MISSING_STRIPE_CONFIG"
  | "STRIPE_API_ERROR"
  | "RATE_LIMITED";

export class CheckoutDomainError extends Error {
  public readonly code: CheckoutErrorCode;

  constructor(code: CheckoutErrorCode, message: string) {
    super(message);
    this.name = "CheckoutDomainError";
    this.code = code;
  }
}

export type CheckoutActionResponse =
  | { success: true; data: { url: string } }
  | { success: false; error: { code: CheckoutErrorCode; message: string } };
