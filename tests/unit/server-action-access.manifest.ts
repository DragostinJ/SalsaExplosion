/**
 * Server Action Access Manifest
 *
 * Explicit declaration of who may call every server action in RitmoFlow / Salsa Explosion.
 * Used by tests/unit/server-action-access.test.ts to verify that:
 * 1. Every exported server action is registered here (no omissions).
 * 2. Every registered entry still exists (no stale manifest entries).
 * 3. Authenticated actions ("signed-in", "staff", "owner") call auth guards before touching Prisma, Gemini or email.
 * 4. Public actions ("public") call rate limit helpers before touching Prisma.
 */

export type ActionAccessLevel =
  | "public"
  | "signed-in"
  | "staff"
  | "owner"
  | "refuses"
  | "delegates";

export interface ActionAccessManifestEntry {
  access: ActionAccessLevel;
  reason: string;
}

export const SERVER_ACTION_MANIFEST: Record<string, ActionAccessManifestEntry> = {
  // src/actions/ai-studio.actions.ts
  "src/actions/ai-studio.actions.ts#generateCoachingPlanAction": {
    access: "staff",
    reason: "Staff only AI coaching plan generator validated against syllabus figures via requireAiStudioStaff.",
  },
  "src/actions/ai-studio.actions.ts#parseFacebookPostToEventAction": {
    access: "staff",
    reason: "Staff only flyer reader on the AI Studio page via requireAiStudioStaff; every call spends the site's Gemini allowance (was open to anyone until the 2026-11-05 review).",
  },
  "src/actions/ai-studio.actions.ts#approveAndPublishEventAction": {
    access: "staff",
    reason: "Staff only action to publish AI-extracted event announcements via requireAiStudioStaff.",
  },
  "src/actions/ai-studio.actions.ts#removePublishedEventAction": {
    access: "staff",
    reason: "Staff only action to unpublish live event announcements via requireAiStudioStaff.",
  },
  "src/actions/ai-studio.actions.ts#getLivePublishedEventsAction": {
    access: "delegates",
    reason: "Delegates to helper getPublishedEvents in published-events-store to retrieve public announcement cards for AI studio preview.",
  },
  "src/actions/ai-studio.actions.ts#preCheckStudentVideoAction": {
    access: "staff",
    reason: "Staff only AI student technique pre-assessment copilot via requireAiStudioStaff.",
  },
  "src/actions/ai-studio.actions.ts#generateGoogleReviewHelperAction": {
    access: "signed-in",
    reason: "Signed-in dancer generates personalized Google review drafts; protected by checkAiRateLimit scoped to user.id.",
  },

  // src/actions/beginner.actions.ts
  "src/actions/beginner.actions.ts#submitAnonymousQuestionAction": {
    access: "public",
    reason: "Public question submission for beginners asking about their first salsa class; protected by withRateLimit.",
  },
  "src/actions/beginner.actions.ts#submitPostClassFeedbackAction": {
    access: "signed-in",
    reason: "Signed-in dancer submits post-class feedback; scopes upsert strictly to authenticated user.id.",
  },

  // src/actions/booking.actions.ts
  "src/actions/booking.actions.ts#bookClassAction": {
    access: "signed-in",
    reason: "Signed-in dancer reserves attendance for a weekly class; scopes booking creation to authenticated user.id.",
  },
  "src/actions/booking.actions.ts#cancelBookingAction": {
    access: "signed-in",
    reason: "Signed-in dancer cancels their reservation; scopes update strictly to authenticated user.id.",
  },

  // src/actions/checkout.actions.ts
  "src/actions/checkout.actions.ts#createCheckoutSessionAction": {
    access: "refuses",
    reason: "Refuses online checkout for weekly classes because classes are pay at the door only.",
  },
  "src/actions/checkout.actions.ts#createBillingPortalSessionAction": {
    access: "signed-in",
    reason: "Signed-in customer accesses Stripe billing portal; scopes session to authenticated user's stripeCustomerId.",
  },
  "src/actions/checkout.actions.ts#createEventCheckoutSessionAction": {
    access: "signed-in",
    reason: "Signed-in dancer purchases festival tickets online; scopes registration to authenticated user.id.",
  },

  // src/actions/class-songs.actions.ts
  "src/actions/class-songs.actions.ts#setClassPracticeSongsAction": {
    access: "staff",
    reason: "Staff only action linking timba practice tracks to weekly class sessions via requireRole(STAFF_ROLES).",
  },

  // src/actions/export.actions.ts
  "src/actions/export.actions.ts#exportStudentRosterCsvAction": {
    access: "owner",
    reason: "Studio owner only CSV export of student rosters via requireRole(ADMIN_ONLY).",
  },
  "src/actions/export.actions.ts#exportCongressTicketHoldersCsvAction": {
    access: "owner",
    reason: "Studio owner only CSV export of congress ticket holders via requireRole(ADMIN_ONLY).",
  },
  "src/actions/export.actions.ts#exportPrivateCoachingCsvAction": {
    access: "owner",
    reason: "Studio owner only CSV export of private coaching data via requireRole(ADMIN_ONLY).",
  },

  // src/actions/grading.actions.ts
  "src/actions/grading.actions.ts#gradeSubmissionAction": {
    access: "staff",
    reason: "Staff only grading and level promotion assessment for student videos in review queue.",
  },

  // src/actions/lessons.actions.ts
  "src/actions/lessons.actions.ts#bookPrivateLessonAction": {
    access: "signed-in",
    reason: "Signed-in dancer submits a 1-on-1 private coaching booking request; scopes record to authenticated user.id.",
  },
  "src/actions/lessons.actions.ts#cancelPrivateLessonBookingAction": {
    access: "signed-in",
    reason: "Signed-in dancer cancels their own coaching request, or staff cancels; scopes cancellation to owner or staff.",
  },

  // src/actions/management.actions.ts (Barrel delegates)
  "src/actions/management.actions.ts#toggleBookingCheckInAction": {
    access: "delegates",
    reason: "Delegates to checkin.toggleBookingCheckInAction in management/checkin.actions.",
  },
  "src/actions/management.actions.ts#selfCheckInClassQrAction": {
    access: "delegates",
    reason: "Delegates to checkin.selfCheckInClassQrAction in management/checkin.actions.",
  },
  "src/actions/management.actions.ts#verifyEventPassAction": {
    access: "delegates",
    reason: "Delegates to checkin.verifyEventPassAction in management/checkin.actions.",
  },
  "src/actions/management.actions.ts#toggleEventRegistrationCheckInAction": {
    access: "delegates",
    reason: "Delegates to checkin.toggleEventRegistrationCheckInAction in management/checkin.actions.",
  },
  "src/actions/management.actions.ts#updatePrivateLessonBookingStatusAction": {
    access: "delegates",
    reason: "Delegates to coaching.updatePrivateLessonBookingStatusAction in management/coaching.actions.",
  },
  "src/actions/management.actions.ts#replyAnonymousQuestionAction": {
    access: "delegates",
    reason: "Delegates to qa.replyAnonymousQuestionAction in management/qa.actions.",
  },
  "src/actions/management.actions.ts#registerForEventTierAction": {
    access: "delegates",
    reason: "Delegates to events.registerForEventTierAction in management/events.actions.",
  },
  "src/actions/management.actions.ts#createGuestArtistEventAction": {
    access: "delegates",
    reason: "Delegates to events.createGuestArtistEventAction in management/events.actions.",
  },
  "src/actions/management.actions.ts#switchMyAccountRoleAction": {
    access: "delegates",
    reason: "Delegates to roster.switchMyAccountRoleAction in management/roster.actions.",
  },
  "src/actions/management.actions.ts#getCurrentUserRoleAction": {
    access: "delegates",
    reason: "Delegates to roster.getCurrentUserRoleAction in management/roster.actions.",
  },
  "src/actions/management.actions.ts#updateStudentProgressionAction": {
    access: "delegates",
    reason: "Delegates to roster.updateStudentProgressionAction in management/roster.actions.",
  },
  "src/actions/management.actions.ts#createClassSessionAction": {
    access: "delegates",
    reason: "Delegates to roster.createClassSessionAction in management/roster.actions.",
  },
  "src/actions/management.actions.ts#analyzeSubmissionWithAiAction": {
    access: "delegates",
    reason: "Delegates to roster.analyzeSubmissionWithAiAction in management/roster.actions.",
  },
  "src/actions/management.actions.ts#updateMyDanceRolePreferenceAction": {
    access: "delegates",
    reason: "Delegates to roster.updateMyDanceRolePreferenceAction in management/roster.actions.",
  },
  "src/actions/management.actions.ts#cancelClassSessionWithRefundsAction": {
    access: "delegates",
    reason: "Delegates to roster.cancelClassSessionWithRefundsAction in management/roster.actions.",
  },
  "src/actions/management.actions.ts#updateClassSessionCapacityAction": {
    access: "delegates",
    reason: "Delegates to roster.updateClassSessionCapacityAction in management/roster.actions.",
  },

  // src/actions/management/checkin.actions.ts
  "src/actions/management/checkin.actions.ts#toggleBookingCheckInAction": {
    access: "staff",
    reason: "Staff only attendance override for student class bookings.",
  },
  "src/actions/management/checkin.actions.ts#selfCheckInClassQrAction": {
    access: "signed-in",
    reason: "Signed-in dancer self-check-in via studio QR code scan; scopes check-in strictly to studentId: user.id.",
  },
  "src/actions/management/checkin.actions.ts#verifyEventPassAction": {
    access: "staff",
    reason: "Staff only lookup of a scanned festival pass at the door. Changes nothing.",
  },
  "src/actions/management/checkin.actions.ts#toggleEventRegistrationCheckInAction": {
    access: "staff",
    reason: "Staff only attendance check-in for congress and special event ticket holders.",
  },

  // src/actions/management/coaching.actions.ts
  "src/actions/management/coaching.actions.ts#updatePrivateLessonBookingStatusAction": {
    access: "staff",
    reason: "Staff only status management for private coaching lesson requests.",
  },

  // src/actions/management/events.actions.ts
  "src/actions/management/events.actions.ts#registerForEventTierAction": {
    access: "signed-in",
    reason: "Signed-in dancer registers for an event ticket tier; scopes registration strictly to authenticated user.id.",
  },
  "src/actions/management/events.actions.ts#createGuestArtistEventAction": {
    access: "owner",
    reason: "Studio owner (Role.ADMIN) only action to publish new guest artist festival events.",
  },

  // src/actions/management/qa.actions.ts
  "src/actions/management/qa.actions.ts#replyAnonymousQuestionAction": {
    access: "staff",
    reason: "Staff only instructor replies to anonymous beginner questions.",
  },

  // src/actions/management/roster.actions.ts
  "src/actions/management/roster.actions.ts#switchMyAccountRoleAction": {
    access: "owner",
    reason: "Studio owner role switcher guarded by canSwitchRoles(user.email).",
  },
  "src/actions/management/roster.actions.ts#getCurrentUserRoleAction": {
    access: "signed-in",
    reason: "Signed-in dancer queries their active role and switcher permissions; falls back gracefully to null role for anonymous visitors.",
  },
  "src/actions/management/roster.actions.ts#updateStudentProgressionAction": {
    access: "staff",
    reason: "Staff only instructor promotion of student levels and syllabus tracking.",
  },
  "src/actions/management/roster.actions.ts#createClassSessionAction": {
    access: "staff",
    reason: "Staff only scheduling of new class sessions on studio timetable.",
  },
  "src/actions/management/roster.actions.ts#analyzeSubmissionWithAiAction": {
    access: "staff",
    reason: "Staff only AI rubric evaluation copilot for pending student video assessments.",
  },
  "src/actions/management/roster.actions.ts#updateMyDanceRolePreferenceAction": {
    access: "signed-in",
    reason: "Signed-in dancer updates their preferred dance role (Lead/Follow/Solo); scopes update strictly to user.id.",
  },
  "src/actions/management/roster.actions.ts#cancelClassSessionWithRefundsAction": {
    access: "staff",
    reason: "Staff only class cancellation releasing bookings and notifying attending dancers.",
  },
  "src/actions/management/roster.actions.ts#updateClassSessionCapacityAction": {
    access: "staff",
    reason: "Staff only class capacity and room adjustment on studio schedule.",
  },

  // src/actions/management/weekly-sessions.actions.ts
  "src/actions/management/weekly-sessions.actions.ts#createUpcomingWeeklyClassesAction": {
    access: "staff",
    reason: "Staff only generation of rolling upcoming 4-week timetable sessions.",
  },

  // src/actions/move-review.actions.ts
  "src/actions/move-review.actions.ts#checkMoveVideoOembedAction": {
    access: "staff",
    reason: "Staff only validation of move YouTube and Instagram demonstration videos via requireRole(STAFF_ROLES).",
  },

  // src/actions/notifications.actions.ts
  "src/actions/notifications.actions.ts#getAdminNotificationsAction": {
    access: "staff",
    reason: "Staff only polling of pending video reviews, coaching requests, and desk alerts.",
  },

  // src/actions/practice-stats.actions.ts
  "src/actions/practice-stats.actions.ts#recordPracticeEventAction": {
    access: "public",
    reason: "Public practice telemetry logging section loops and replays on /music; protected by withRateLimit.",
  },
  "src/actions/practice-stats.actions.ts#getPracticeHotspotsAction": {
    access: "staff",
    reason: "Staff only aggregate telemetry inspection of tricky song sections via requireRole(STAFF_ROLES).",
  },

  // src/actions/recap.actions.ts
  "src/actions/recap.actions.ts#generateRecapUploadUrlAction": {
    access: "staff",
    reason: "Staff only signed upload URL generator for class recap videos via requireRole(STAFF_ROLES).",
  },
  "src/actions/recap.actions.ts#attachClassRecapAction": {
    access: "staff",
    reason: "Staff only publishing of recap video and syllabus figure tags via requireRole(STAFF_ROLES).",
  },
  "src/actions/recap.actions.ts#getMyAttendedClassRecapsAction": {
    access: "signed-in",
    reason: "Signed-in dancer queries recaps of classes they attended; scopes query strictly to user.id.",
  },
  "src/actions/recap.actions.ts#getAllPublishedClassRecapsAction": {
    access: "signed-in",
    reason: "Signed-in dancer queries all published class recaps; requires authenticated user session.",
  },

  // src/actions/song-progress.actions.ts
  "src/actions/song-progress.actions.ts#getMySongProgressAction": {
    access: "signed-in",
    reason: "Signed-in dancer queries mastered sections for a timba song; scopes query to user.id.",
  },
  "src/actions/song-progress.actions.ts#getMyProgressSummaryAction": {
    access: "signed-in",
    reason: "Signed-in dancer queries their total mastered sections summary; scopes query to user.id.",
  },
  "src/actions/song-progress.actions.ts#setSongSectionMasteredAction": {
    access: "signed-in",
    reason: "Signed-in dancer toggles mastery status of a song section; scopes upsert strictly to user.id.",
  },

  // src/actions/submission.actions.ts
  "src/actions/submission.actions.ts#generateSignedUploadUrlAction": {
    access: "signed-in",
    reason: "Signed-in dancer requests signed video upload URL; enforces path prefix strictly to `${user.id}/`.",
  },
  "src/actions/submission.actions.ts#createVideoSubmissionAction": {
    access: "signed-in",
    reason: "Signed-in dancer submits level-up video assessment; scopes submission strictly to user.id.",
  },

  // src/actions/viewer.actions.ts
  "src/actions/viewer.actions.ts#getMyPrivateLessonBookingsAction": {
    access: "signed-in",
    reason: "Signed-in dancer queries their private coaching bookings without fallback provisioning; scopes query to user.id.",
  },
};
