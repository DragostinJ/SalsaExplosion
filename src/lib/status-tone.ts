import type { StatusTone } from "@/components/ui/status-badge";

/**
 * Pure mapping functions from application and Prisma status strings to semantic design tones.
 * Fallback is always "neutral" for unexpected or undefined statuses.
 */

export function bookingStatusTone(status: string | null | undefined): StatusTone {
  if (!status) return "neutral";
  const s = status.toUpperCase().trim();
  switch (s) {
    case "ATTENDED":
    case "CONFIRMED":
    case "PAID":
      return "success";
    case "WAITLISTED":
    case "PENDING":
      return "warning";
    case "CANCELLED":
    case "CANCELED":
    case "NO_SHOW":
    case "REFUNDED":
      return "danger";
    case "COMPLETED":
      return "info";
    default:
      return "neutral";
  }
}

export function merchStatusTone(status: string | null | undefined): StatusTone {
  if (!status) return "neutral";
  const s = status.toUpperCase().trim();
  switch (s) {
    case "COLLECTED":
    case "FULFILLED":
    case "PAID":
      return "success";
    case "RESERVED":
    case "PENDING":
      return "warning";
    case "CANCELLED":
    case "CANCELED":
      return "danger";
    default:
      return "neutral";
  }
}

export function waitlistStatusTone(status: string | null | undefined): StatusTone {
  if (!status) return "neutral";
  const s = status.toUpperCase().trim();
  switch (s) {
    case "PAIRED":
      return "success";
    case "NOTIFIED":
      return "info";
    case "WAITING":
    case "PENDING":
      return "warning";
    case "CANCELLED":
    case "CANCELED":
      return "danger";
    default:
      return "neutral";
  }
}

export function coachingStatusTone(status: string | null | undefined): StatusTone {
  if (!status) return "neutral";
  const s = status.toUpperCase().trim();
  switch (s) {
    case "CONFIRMED":
      return "success";
    case "COMPLETED":
      return "info";
    case "PENDING":
      return "warning";
    case "CANCELLED":
    case "CANCELED":
      return "danger";
    default:
      return "neutral";
  }
}

export function sentimentTone(sentiment: string | null | undefined): StatusTone {
  if (!sentiment) return "neutral";
  const s = sentiment.toUpperCase().trim();
  switch (s) {
    case "LOVED_IT":
    case "GREAT":
    case "EXCELLENT":
      return "success";
    case "A_BIT_OVERWHELMED":
    case "HARD":
    case "STRUGGLING":
      return "danger";
    case "PACE_WAS_FAST":
    case "PACE_WAS_SLOW":
      return "warning";
    case "JUST_RIGHT":
    case "GOOD":
      return "info";
    default:
      return "neutral";
  }
}
