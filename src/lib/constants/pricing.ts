// src/lib/constants/pricing.ts
import { PASS_PRICING } from "@/lib/academy-data";

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
    name: PASS_PRICING.PACK_SINGLE.name,
    description: PASS_PRICING.PACK_SINGLE.description,
    priceDisplay: PASS_PRICING.PACK_SINGLE.priceDisplay,
    mode: "payment",
    stripePriceIdEnvVar: "STRIPE_PRICE_SINGLE_DROPIN",
    creditAmount: 1,
    features: PASS_PRICING.PACK_SINGLE.features,
  },
  PACK_5: {
    id: "PACK_5",
    name: PASS_PRICING.PACK_5.name,
    description: PASS_PRICING.PACK_5.description,
    priceDisplay: PASS_PRICING.PACK_5.priceDisplay,
    mode: "payment",
    stripePriceIdEnvVar: "STRIPE_PRICE_5_PACK",
    creditAmount: 5,
    popular: true,
    features: PASS_PRICING.PACK_5.features,
  },
  PACK_10: {
    id: "PACK_10",
    name: PASS_PRICING.PACK_10.name,
    description: PASS_PRICING.PACK_10.description,
    priceDisplay: PASS_PRICING.PACK_10.priceDisplay,
    mode: "payment",
    stripePriceIdEnvVar: "STRIPE_PRICE_10_PACK",
    creditAmount: 10,
    features: PASS_PRICING.PACK_10.features,
  },
  SUB_UNLIMITED_MONTHLY: {
    id: "SUB_UNLIMITED_MONTHLY",
    name: PASS_PRICING.SUB_UNLIMITED_MONTHLY.name,
    description: PASS_PRICING.SUB_UNLIMITED_MONTHLY.description,
    priceDisplay: PASS_PRICING.SUB_UNLIMITED_MONTHLY.priceDisplay,
    mode: "subscription",
    stripePriceIdEnvVar: "STRIPE_PRICE_UNLIMITED_MONTHLY",
    creditAmount: 0,
    features: PASS_PRICING.SUB_UNLIMITED_MONTHLY.features,
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
