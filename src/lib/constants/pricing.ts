// src/lib/constants/pricing.ts
import { DOOR_PRICING } from "@/lib/academy-data";

/** Weekly classes are paid at the door only; online payment is for festival and special-event passes. */
export const CLASSES_PAY_AT_DOOR_MESSAGE = `Weekly classes are paid at the door: £${DOOR_PRICING.oneClassPounds} for 1 class, £${DOOR_PRICING.twoClassesPounds} for 2. Online payment is only for festival and special-event passes.`;

/** Retired class-pack ids: only used to refuse stale requests (classes are paid at the door) */
export type PackageId =
  | "PACK_SINGLE"
  | "PACK_5"
  | "PACK_10"
  | "SUB_UNLIMITED_MONTHLY";

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
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE";

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
