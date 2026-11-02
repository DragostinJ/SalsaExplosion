# Antigravity Report: Door Free Class Redemption & Owner Decisions Alignment

**Date:** 2026-11-02  
**Branch:** `feat/door-free-class`  
**Base:** `origin/feat/enrique-answers`  
**Execution Mode:** Senior Engineering Mentor Autonomous Implementation  
**Status:** All 6 Tasks Completed, 4 Quality Gates Passed, E2E Verified

---

## 1. Executive Summary & Context

Following Maestro Enrique's owner decisions on 2026-11-02, this milestone aligns the RitmoFlow codebase to the true physical reality of the studio:
1. **Classes are paid at the door only (£12 / £14):** Nothing online sells classes. Class reservations ("I'm coming") are free and optional. Dancers never buy passes, class packs, or memberships online.
2. **Bring-a-Friend Free Classes at the Door:** Referral rewards give both the dancer and their invited friend 1 free class credit. When arriving at the studio, the teacher or staff member taps **"Use free class"** directly on the class roster at `/instructor/roster`. The dancer pays £0 that night, 1 credit is decremented with an audit log and ledger entry, and the action is fully idempotent.
3. **Honest Dancer Copy:** All dancer-facing surfaces (`/dashboard/carnet`, `/dashboard/referrals`, `/dashboard/wallet`) now explain explicitly that classes are paid at the door and free classes are redeemed by the teacher at check-in.
4. **Partner Waitlist Removal:** Removed the dormant partner waitlist UI, server actions, and operations tab, while preserving existing database models.
5. **Event Structured Data Standardized:** Unified `/events` and `/events/[slug]` JSON-LD structured data under the shared `buildFestivalEventJsonLd` builder, including performer, organizer, dynamic venue fallback (`VENUE_INFO`), and `SoldOut` status for past events.
6. **Move Library Teacher Approval:** Confirmed that any signed-in `INSTRUCTOR` or `ADMIN` can review and approve moves at `/instructor/moves` and `/instructor/moves/[moveId]`, prefilling the reviewer name from the teacher's profile display name.

---

## 2. Detailed Breakdown by Task & Deliverables

### Task 1: "Use free class" at the Door (Staff Only)
- **Server Action (`src/actions/management/redemption.actions.ts` & `src/actions/management.actions.ts`):**
  - Implemented `redeemFreeClassAction({ bookingId })` conforming strictly to Next.js Turbopack `"use server"` rules, static fallback guard scanner (`tests/unit/fallback-user-guard.test.ts`), and management action exports guard (`tests/unit/management-actions-guard.test.ts`).
  - Modularized into `redemption.actions.ts` to keep `src/actions/management/roster.actions.ts` strictly within the 25,600 byte budget enforced by `tests/unit/component-budget.test.ts`.
  - Enforces `requireRole(STAFF_ROLES)` and blocks fallback demo users.
  - Zod runtime input validation on `{ bookingId: z.string().min(1) }`.
  - Atomic Prisma interactive transaction (`prisma.$transaction`):
    - Loads booking with user and class relation.
    - Refuses if class is cancelled (`Class is cancelled. Free class was not deducted.`).
    - Refuses if dancer has no available credit (`Dancer has no class credits remaining.`).
    - Refuses if booking was already redeemed using idempotency key: `CreditLedger` check for matching `bookingId` and description starting with `"Free class used at the door"`.
    - Decrements credits using conditional atomic update: `where: { id: dancer.id, classCredits: { gte: 1 } }`.
    - Appends `CreditLedger` record with `TransactionType.ADMIN_ADJUSTMENT`, amount `-1`, bookingId reference, and `balanceAfter`.
    - Appends `AuditLog` entry with `AuditAction.CREDIT_ADJUSTMENT` logging actor ID, dancer ID, class details, and balance before/after.
    - Revalidates `/instructor/roster` and `/dashboard/carnet`.
- **Roster UI (`src/app/instructor/roster/page.tsx` & `src/components/instructor/roster/roster-dancer-list.tsx`):**
  - Extended roster query to include dancer's `classCredits` and checked if a redemption ledger row exists for each booking (`freeClassRedeemed`).
  - Added "Free class: N" indicator and high-contrast ICAIC poster styled "Use free class" button (`bg-poster-gold text-ink font-black border-2 border-ink`).
  - Built-in two-step inline confirmation ("Deduct 1 credit? [Yes, redeem] [Cancel]") to avoid accidental taps on mobile without intrusive modal dialogs or `window.confirm`.
  - Disables button and displays "Free class used ✓" once redeemed.
- **Unit Tests (`tests/unit/redeem-free-class.test.ts`):**
  - 6 comprehensive unit tests covering:
    1. Student role refusal (403).
    2. Fallback user refusal (403).
    3. Dancer with 0 credits refused, nothing written.
    4. Second redemption of same booking rejected as idempotent conflict.
    5. Success: credits decremented by 1, `CreditLedger` written with `bookingId`, `AuditLog` written.
    6. Cancelled class refused without deducting credit.

### Task 2: Honest Dancer Copy for Credits
- **Mi Carnet (`src/app/dashboard/carnet/page.tsx`):**
  - Replaced ambiguous "credits" text with an honest physical voucher banner when `classCredits > 0`:
    > *"N free class credit(s) available. Tell the door when you arrive — a teacher marks it on the roster."*
  - Hides completely when `classCredits === 0` (no clutter).
- **Referrals Page & Dashboard (`src/app/dashboard/referrals/page.tsx` & `src/components/referrals/referral-dashboard-client.tsx`):**
  - Updated headings and hero copy: *"Give a Free Class, Get a Free Class"*.
  - Explicit explanation: *"Your friend gets a free class, and so do you, when they join with your code. Use it at the door: the teacher marks it on the roster."*
  - Removed all obsolete copy referencing "digital studio wallet" and passes/memberships.
- **Wallet (`src/app/dashboard/wallet/page.tsx`):**
  - Renamed "Available Credits" card to "Free Classes".
  - Subtext: *"Tell the teacher at the door — marked on the class roster."*
- **Schedule Notice (`src/components/schedule/free-class-notice.tsx`):**
  - Updated booking notice clarifying that reservations are free and credits are marked at the door.

### Task 3: Remove Dormant Partner Waitlist
- **Removed Files:**
  - Deleted `src/components/admin/operations/partner-waitlist-tab.tsx`.
  - Deleted `src/actions/waitlist.actions.ts`.
  - Deleted `src/actions/management/waitlist.actions.ts`.
- **Refactored Files:**
  - `src/components/admin/studio-operations-workspace.tsx`: Removed `PartnerWaitlistTab` component import, tab trigger, and `waitlistCount` badge.
  - `src/app/admin/operations/page.tsx`: Removed partner waitlist database queries and metrics computation.
  - `src/actions/management.actions.ts`: Removed `cancelWaitlistEntryAction` and `processWaitlistOfferAction` barrel re-exports.
- **Updated Test Suites:**
  - `tests/unit/waitlist.test.ts`: Preserved schema tests; deleted tests for removed server actions.
  - `tests/unit/operations-roster-a11y.test.tsx`: Updated operations tab accessibility assertions to reflect 3 tabs (`roster`, `room`, `instructors`).
  - `tests/unit/component-budget.test.ts`: Removed deleted action files from size budget checks.
  - `tests/unit/management-actions-guard.test.ts`: Removed deleted waitlist actions from export check.

### Task 4: Standardize Event Structured Data
- **Structured Data Engine (`src/lib/seo/event-jsonld.ts`):**
  - Extended `buildFestivalEventJsonLd` with:
    - Dynamic venue address fallback sourced from `VENUE_INFO` (`104 Commercial Rd, Bournemouth, BH2 5LR`) without hardcoded string literals.
    - `isFinished` boolean checking `new Date() > new Date(event.endDate)`.
    - Conditional `eventStatus` (`EventScheduled` vs `EventMovedOnline` or finished status) and `offers.availability`: sets `https://schema.org/SoldOut` when finished or capacity reached, else `https://schema.org/InStock`.
    - Performer structured array support (`PerformingGroup` / `Person`).
    - Organizer attribution with `@type: Organization`, name, and official URL.
- **Pages Converted:**
  - `src/app/events/page.tsx`: Now maps all active events via `buildFestivalEventJsonLd(event)`.
  - `src/app/events/[slug]/page.tsx`: Replaced inline schema generator with `buildFestivalEventJsonLd(event)`.
- **Unit Tests (`tests/unit/event-jsonld.test.ts`):**
  - Added 6 test cases verifying venue fallback, performers, organizer, InStock availability for upcoming events, and SoldOut availability for past events.

### Task 5: Teachers Approve Moves
- **Authorization Verification:**
  - Verified `src/app/instructor/moves/page.tsx` and `src/app/instructor/moves/[moveId]/page.tsx` invoke `await requireRole(STAFF_ROLES)`.
  - `STAFF_ROLES = [Role.ADMIN, Role.INSTRUCTOR]` in `src/lib/constants/auth.ts`.
  - Any user signed in with `Role.INSTRUCTOR` has full access to view, edit, count, and approve moves.
- **Auto-Prefill Reviewer Display Name:**
  - In `src/app/instructor/moves/[moveId]/page.tsx`, fetched the authenticated user's display name (`user.name` or `user.email`).
  - Passed `currentUserName` to `MoveReviewDetailConsole` in `src/components/instructor/move-review/move-review-detail-console.tsx`.
  - Pre-populates the "Reviewed by" form field while leaving it editable if the instructor wishes to sign with an artist name (e.g. "Maestro Enrique").
- **Unit Test (`tests/unit/moves-teacher-auth.test.ts`):**
  - Added test suite confirming `Role.INSTRUCTOR` and `Role.ADMIN` are both authorized under `STAFF_ROLES`, while `Role.STUDENT` is refused.

### Task 6: Checks, Housekeeping & E2E
- **E2E Assertions (`tests/e2e/salsa-explosion-flow.spec.ts`):**
  - Verified footer contains NO "Recaps" link.
  - Verified mobile navigation menu contains NO "Recaps" link.
  - Verified Made in Cuba festival page contains NO "Upgrade Your Pass" dialog.
- **CLS Layout Shift Fix (`src/app/layout.tsx` & `src/app/dashboard/schedule/page.tsx`):**
  - Added `min-h-screen` to the main container wrapper to prevent footer vertical displacement on fast client-side hydration.
  - Verified `tests/e2e/header-cls.spec.ts` achieves CLS < 0.02 across all 4 benchmark routes on both mobile (390px) and desktop (1280px).
- **AGENTS.md Updated:**
  - Updated Section 4 quality gate test counts to match actual suite totals (71 files, 473 tests).

---

## 3. Quality Gate Results

| Gate | Target / Threshold | Command | Result | Status |
|---|---|---|---|---|
| **Gate 1: TypeScript** | Zero errors | `npx tsc --noEmit` | `0 errors` | ✅ PASSED |
| **Gate 2: Vitest Suite** | 100% pass | `npm test` | **71 test files passed, 473 unit tests passed** | ✅ PASSED |
| **Gate 3: Production Build** | Static & SSG compile | `npm run build` | **68 routes compiled**, zero errors | ✅ PASSED |
| **Gate 4: Visual Design Audit** | Port 3200 (mobile & desktop) | `npm run audit:design` | 100% pass across all routes, 0 visual defects | ✅ PASSED |
| **Gate 5: Playwright E2E** | Port 3200 suite | `npx playwright test` | **109 passed, 3 skipped** (authenticated live clerk tests) | ✅ PASSED |

---

## 4. Hard Boundaries & Invariants Preserved

- **Prisma Schema:** Absolutely NO modifications to `prisma/schema.prisma`. No database migrations or SQL pushes were executed.
- **Stripe & Checkout:** Zero changes to `src/actions/checkout.actions.ts` or Stripe webhooks. Classes remain completely unpurchasable online.
- **Original Media:** `public/images/editorial/*.jfif` files were untouched and strictly excluded from git staging.
- **Security & A11y:** Auth guards (`requireRole(STAFF_ROLES)`), fallback demo account guards, and WCAG 2.1 AA accessibility standards were rigorously maintained.

---

## 5. Owner Hand-Testing Instructions (for Maestro Enrique)

When testing locally or in the staging environment while signed in as a teacher or admin:

1. **Open the Class Roster:**
   - Navigate to `/instructor/roster` (or tap the **Roster** tab from the studio dashboard).
   - Select an upcoming or active class session.
2. **Locate an Eligible Dancer:**
   - Look for a dancer row where the dancer has available free class credits (granted via Bring-a-Friend referral).
   - You will see the gold indicator: **`Free class: 1`** and the button **`Use free class`**.
3. **Redeem at the Door:**
   - Tap **`Use free class`**.
   - Notice the inline confirmation prompt: **`Deduct 1 credit? [Yes, redeem] [Cancel]`** (designed for touch screens so accidental taps never deduct credit).
   - Tap **`Yes, redeem`**.
   - The button transitions to a disabled state with **`Free class used ✓`**.
4. **Test Idempotency & Protection:**
   - Attempt to click the button again — it is disabled.
   - Refresh the page: the row retains the **`Free class used ✓`** status because the ledger row permanently tracks that this booking was redeemed.
5. **Verify the Dancer's Carnet:**
   - Switch to the dancer's account (or visit `/dashboard/carnet`).
   - The dancer's available credits count is decremented by 1.
   - The credit ledger audit trail records: *"Free class used at the door - [Class Name]"*.
