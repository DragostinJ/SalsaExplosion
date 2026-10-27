"use server";

/**
 * Management Actions Barrel
 * Explicit async delegation to modular management action implementations.
 * Satisfies Next.js Turbopack requirements (only async functions can be exported from "use server" files).
 */
import * as checkin from "./management/checkin.actions";
import * as coaching from "./management/coaching.actions";
import * as merch from "./management/merch.actions";
import * as waitlist from "./management/waitlist.actions";
import * as qa from "./management/qa.actions";
import * as events from "./management/events.actions";
import * as roster from "./management/roster.actions";

export async function toggleBookingCheckInAction(
  ...args: Parameters<typeof checkin.toggleBookingCheckInAction>
) {
  return checkin.toggleBookingCheckInAction(...args);
}

export async function selfCheckInClassQrAction(
  ...args: Parameters<typeof checkin.selfCheckInClassQrAction>
) {
  return checkin.selfCheckInClassQrAction(...args);
}

export async function toggleEventRegistrationCheckInAction(
  ...args: Parameters<typeof checkin.toggleEventRegistrationCheckInAction>
) {
  return checkin.toggleEventRegistrationCheckInAction(...args);
}

export async function updatePrivateLessonBookingStatusAction(
  ...args: Parameters<typeof coaching.updatePrivateLessonBookingStatusAction>
) {
  return coaching.updatePrivateLessonBookingStatusAction(...args);
}

export async function updateMerchReservationStatusAction(
  ...args: Parameters<typeof merch.updateMerchReservationStatusAction>
) {
  return merch.updateMerchReservationStatusAction(...args);
}

export async function updatePartnerWaitlistStatusAction(
  ...args: Parameters<typeof waitlist.updatePartnerWaitlistStatusAction>
) {
  return waitlist.updatePartnerWaitlistStatusAction(...args);
}

export async function autoPairWaitlistDancersAction(
  ...args: Parameters<typeof waitlist.autoPairWaitlistDancersAction>
) {
  return waitlist.autoPairWaitlistDancersAction(...args);
}

export async function replyAnonymousQuestionAction(
  ...args: Parameters<typeof qa.replyAnonymousQuestionAction>
) {
  return qa.replyAnonymousQuestionAction(...args);
}

export async function registerForEventTierAction(
  ...args: Parameters<typeof events.registerForEventTierAction>
) {
  return events.registerForEventTierAction(...args);
}

export async function createGuestArtistEventAction(
  ...args: Parameters<typeof events.createGuestArtistEventAction>
) {
  return events.createGuestArtistEventAction(...args);
}

export async function switchMyAccountRoleAction(
  ...args: Parameters<typeof roster.switchMyAccountRoleAction>
) {
  return roster.switchMyAccountRoleAction(...args);
}

export async function getCurrentUserRoleAction(
  ...args: Parameters<typeof roster.getCurrentUserRoleAction>
) {
  try {
    return await roster.getCurrentUserRoleAction(...args);
  } catch {
    return { role: null, canSwitchRoles: false };
  }
}

export async function updateStudentProgressionAction(
  ...args: Parameters<typeof roster.updateStudentProgressionAction>
) {
  return roster.updateStudentProgressionAction(...args);
}

export async function adjustStudentCreditsAction(
  ...args: Parameters<typeof roster.adjustStudentCreditsAction>
) {
  return roster.adjustStudentCreditsAction(...args);
}

export async function createClassSessionAction(
  ...args: Parameters<typeof roster.createClassSessionAction>
) {
  return roster.createClassSessionAction(...args);
}

export async function analyzeSubmissionWithAiAction(
  ...args: Parameters<typeof roster.analyzeSubmissionWithAiAction>
) {
  return roster.analyzeSubmissionWithAiAction(...args);
}

export async function updateMyDanceRolePreferenceAction(
  ...args: Parameters<typeof roster.updateMyDanceRolePreferenceAction>
) {
  return roster.updateMyDanceRolePreferenceAction(...args);
}

export async function cancelClassSessionWithRefundsAction(
  ...args: Parameters<typeof roster.cancelClassSessionWithRefundsAction>
) {
  return roster.cancelClassSessionWithRefundsAction(...args);
}

export async function updateClassSessionCapacityAction(
  ...args: Parameters<typeof roster.updateClassSessionCapacityAction>
) {
  return roster.updateClassSessionCapacityAction(...args);
}
