import { DanceLevel } from "@prisma/client";

export const LEVEL_WEIGHT: Record<DanceLevel, number> = {
  BEGINNER: 1,
  IMPROVER: 2,
  INTERMEDIATE: 3,
  ADVANCED: 4,
} as const;

export const CANCELLATION_WINDOW_HOURS = 12;

/**
 * Solo classes (footwork, pasitos, suelta) say so in their title, e.g. "Solo Salsa: Musicality,
 * Pasitos & Rhythm". Lead/Follow caps used to mark the partner classes, but the class manager
 * clears them now that they are never limits, so they can't tell the two apart any more.
 */
export function isSoloClassTitle(title: string): boolean {
  return /\b(solo|pasitos|suelta)\b/i.test(title);
}

export type BookingErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "USER_NOT_FOUND"
  | "CLASS_NOT_FOUND"
  | "CLASS_CANCELLED"
  | "CLASS_ALREADY_STARTED"
  | "INSUFFICIENT_LEVEL"
  | "ALREADY_BOOKED"
  | "CLASS_FULL"
  | "ROLE_CAPACITY_FULL"
  | "BOOKING_NOT_FOUND"
  | "ALREADY_CANCELLED"
  | "INTERNAL_ERROR"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE";

export class BookingDomainError extends Error {
  public readonly code: BookingErrorCode;

  constructor(code: BookingErrorCode, message: string) {
    super(message);
    this.name = "BookingDomainError";
    this.code = code;
  }
}

export type ActionResponse<T = undefined> =
  | { success: true; data: T; message: string }
  | { success: false; error: { code: BookingErrorCode; message: string } };
