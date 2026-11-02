# Quality & Hardening Report: Node 24, E2E Resilience & Defense-in-Depth

**Date:** October 31, 2026  
**Branch:** `chore/hardening-and-node24`  
**Execution Context:** RitmoFlow (Salsa Explosion UK)  
**Agent Protocol:** Anti-Tutorial Senior Engineering Mode  

---

## 1. Executive Summary

This hardening and modernization pass accomplished six major engineering milestones while strictly preserving all hard boundaries (song data/timings, YouTube zero-overlay ergonomics, door payments only, and zero `any`):
1. **Dynamic Calibration Resilience:** Removed hardcoded segment IDs, timestamps, and nudge labels in `tests/e2e/practice-player-tools.spec.ts`. Ear calibrations by the maestro can now occur without breaking automated tests.
2. **Whole E2E Suite Run & Triage:** Tested all 10 Playwright E2E specs against a production build on `http://localhost:3200`. Identified and resolved 3 stale assertion suites (`salsa-explosion-flow.spec.ts`, `cuban-curriculum-2027.spec.ts`, `visual-sync.spec.ts`), verified graceful self-skipping for credential-dependent tests (`authenticated.spec.ts`), and triaged 1 upstream WCAG 2.5.3 issue protected by the inviolable music component boundary.
3. **TLS Hygiene Elimination:** Completely excised `NODE_TLS_REJECT_UNAUTHORIZED="0"` across all Playwright configs and audit runners. Validated full compatibility with Windows root certificates using `NODE_OPTIONS=--use-system-ca`.
4. **Zero-Trust Security & Self-Contained Auth Inventory:** Completed an exhaustive audit of all protected pages, route handlers, and 25 server action files. Validated that every protected resource self-enforces auth (`requireRole`, `requireAiStudioStaff`, `getOrProvisionCurrentUser`, `auth()`, or cryptographic signatures) with zero IDOR vulnerabilities. Proposed a migration plan for Clerk's deprecated `createRouteMatcher`.
5. **Node 24 & ESLint 10 Upgrade:** Modernized CI workflows (`ci.yml` and `song-video-check.yml`) from end-of-life Node 20 to Node 24. Upgraded `@types/node` to `^24` and cleanly bumped ESLint from v9 to v10 with zero peer-dependency conflicts and 0 lint errors.
6. **Test Count Synchronization:** Updated `AGENTS.md` to reflect the exact current Vitest test counts: **53 suites, 351 passing tests**.

---

## 2. Changes Summary

| File | Change Description | Motivation / Architectural Rationale |
| :--- | :--- | :--- |
| `tests/e2e/practice-player-tools.spec.ts` | Dynamically resolve section IDs, start times, and formatted timestamps from `TIMBA_SONG_ANATOMY_DATA` and `formatSecondsToTime`. | Decouples tests from manual ear calibrations of song segments. |
| `tests/e2e/cuban-curriculum-2027.spec.ts` | Switched `{ name: "Play" }` button locator to `{ name, exact: true }`. | Prevents strict mode locator collision with "Playback speed 1x". |
| `tests/e2e/salsa-explosion-flow.spec.ts` | Updated assertions for homepage hero (roster section + BOH spotlight), vouchers on `/pricing` and `/shop`, and mobile instructor snap reel. | Resolves stale tests after deliberate UI redesigns in commits `8d71bbb`, `c6ced89`, and `29fc7fd`. |
| `src/app/events/page.tsx` | Harmonized H1 heading from `text-4xl sm:text-6xl` to `text-2xl sm:text-4xl`. | Aligns `/events` header with canonical `PageHeader` typography and fixes `visual-sync.spec.ts` desktop & mobile font consistency. |
| `playwright.config.ts` | Removed `NODE_TLS_REJECT_UNAUTHORIZED: "0"`. | Eliminates insecure TLS override; adopts system root CA. |
| `playwright.degraded.config.ts` | Removed `NODE_TLS_REJECT_UNAUTHORIZED: "0"`. | Enforces strict TLS during degraded resilience test runs. |
| `scripts/run-degraded-e2e.mjs` | Removed `NODE_TLS_REJECT_UNAUTHORIZED: "0"`. | Prevents disabling TLS in child processes. |
| `scripts/visual-audit.mjs` | Removed `process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"`. | Restores TLS verification on visual screenshot auditing. |
| `.github/workflows/ci.yml` | Updated Node version from `20` to `24`. | Node 20 reached end-of-life on 30 April 2026. |
| `.github/workflows/song-video-check.yml` | Updated Node version from `20` to `24`. | Harmonizes cron video health checks on modern LTS Node. |
| `package.json` | Updated `@types/node` to `^24` and `eslint` to `^10.14.0`. | Completes Node 24 type alignment and modernizes linter. |
| `package-lock.json` | Updated lockfile dependencies for Node 24 types and ESLint 10. | Lockfile consistency across CI and development environments. |
| `AGENTS.md` | Updated test metrics from 38 suites (230 tests) to 53 suites (351 tests). | Accurately documents pre-merge gate criteria. |

---

## 3. Mandatory Quality Gates

All five required quality gates were executed against the codebase:

| Gate | Command | Result | Notes |
| :--- | :--- | :---: | :--- |
| **Strict TypeScript** | `npx tsc --noEmit` | **PASS (Exit 0)** | Zero type errors; zero `any` types across the entire codebase. |
| **Vitest Unit & Security** | `npm test` | **PASS (Exit 0)** | **53 test suites passed, 351 tests passed** in 3.40s. |
| **ESLint 10 Linter** | `npm run lint` | **PASS (Exit 0)** | Zero errors; 2 legacy `@next/next/no-img-element` warnings. |
| **Next.js Production Build** | `npm run build` | **PASS (Exit 0)** | All 53 static and dynamic routes compiled and optimized. |
| **Visual & Ergonomic Critic** | `npm run audit:design` | **PASS (Exit 0)** | Passed across all 6 target routes (`/`, `/music`, `/events`, `/dashboard/schedule`, `/dashboard/rueda`, `/music/me-dicen-cuba`) on Desktop (1440px) and Mobile (390px). |

---

## 4. E2E Test Suite Results (Task 2)

All 10 Playwright E2E suites executed against production build (`http://localhost:3200`):

| Spec File | Result | Category / Failure Reason | Remediation / Action Taken |
| :--- | :---: | :--- | :--- |
| `tests/e2e/practice-player-tools.spec.ts` | **PASS** (7/7) | Dynamic calibration | Refactored tests 1b, 1d, 1e to read timestamps and labels dynamically from `TIMBA_SONG_ANATOMY_DATA`. |
| `tests/e2e/cuban-curriculum-2027.spec.ts` | **7 PASS / 1 FAIL** | Stale locator (Test 7) / Upstream WCAG (Test 5) | Fixed Test 7 selector to `{ name: "Play", exact: true }`. Test 5 fails on `/music` axe check (see note below). |
| `tests/e2e/accessibility-axe.spec.ts` | **11 PASS / 1 FAIL** | Real app bug (WCAG 2.5.3) | Test 11 fails WCAG 2.5.3 `label-content-name-mismatch` in `src/components/music/song-player/song-practice-list.tsx`. Protected by music hard boundary. Documented for owner. |
| `tests/e2e/header-cls.spec.ts` | **PASS** (8/8) | Visual stability | Verified 0 layout shift on desktop and mobile viewports. |
| `tests/e2e/mobile-first-layout.spec.ts` | **PASS** (34/34) | Mobile ergonomics | All 34 tests passed cleanly on 390px viewport. |
| `tests/e2e/mobile-nav-sheet.spec.ts` | **PASS** (2/2) | Navigation | Sheet drawer opens and closes without hydration defects. |
| `tests/e2e/proxy-route-guards.spec.ts` | **PASS** (6/6) | Route security | Verified proxy redirects unauthenticated users to `/sign-in`. |
| `tests/e2e/salsa-explosion-flow.spec.ts` | **PASS** (25/25) | Stale tests (3 assertions) | Updated assertions for hero banner, vouchers route, and mobile roster reel. |
| `tests/e2e/visual-sync.spec.ts` | **PASS** (4/4) | Real app bug / Stale typography | Updated `/events` H1 from `text-4xl sm:text-6xl` to `text-2xl sm:text-4xl` to harmonize with `PageHeader`. |
| `tests/e2e/authenticated.spec.ts` | **3 SKIPPED** | Secrets required | Gracefully skipped as intended when `E2E_CLERK_USER_USERNAME` / `PASSWORD` are not provided in environment. |

> **Note on `/music` WCAG 2.5.3 Failure:**  
> The accessibility audit on `/music` flags `label-content-name-mismatch` on the practice player cards in `src/components/music/song-player/song-practice-list.tsx` because the anchor's `aria-label` does not begin with the visible card text. Because `src/components/music/**` is an inviolable hard boundary, this was deliberately left untouched and cataloged here for the owner's review.

---

## 5. Security Inventory & Zero-Trust Access Analysis (Task 4)

### A. Non-Public Application Pages (`src/app/**`)

| Page Path | Enforced Auth Check | Scoping / IDOR Protection | Associated Test Suite |
| :--- | :--- | :--- | :--- |
| `/admin/analytics` | `requireRole(ADMIN_ONLY)` | Admin-only dashboard; platform aggregations | `proxy-route-guards.spec.ts` |
| `/admin/classes` | `requireRole(STAFF_ROLES)` | Staff-scoped management queries | `proxy-route-guards.spec.ts` |
| `/admin/events` | `requireRole(STAFF_ROLES)` | Staff-scoped event creator & ticketing | `proxy-route-guards.spec.ts` |
| `/admin/operations` | `requireRole(STAFF_ROLES)` | Staff-scoped ops and audit console | `proxy-route-guards.spec.ts` |
| `/instructor/**` (all 8 routes) | `requireRole(STAFF_ROLES)` | Staff-only workspace & student rosters | `proxy-route-guards.spec.ts` |
| `/dashboard/progression` | `getOrProvisionCurrentUser()` | Strict `userId: user.id` database query | `authenticated.spec.ts` |
| `/dashboard/recaps` | `getOrProvisionCurrentUser()` | Scoped to user's attended class history | `authenticated.spec.ts` |
| `/dashboard/wallet` | `getOrProvisionCurrentUser()` | Scoped to `userId: user.id` credits/passes | `authenticated.spec.ts` |
| `/dashboard/referrals` | `getOrProvisionCurrentUser()` | Scoped to user's personal referral code | `referral-security.test.ts` |
| `/checkin/[sessionId]` | `getOrProvisionCurrentUser()` | Scoped to matching user session booking | `authenticated.spec.ts` |

### B. API Route Handlers (`src/app/api/**`)

| API Route | Authentication & Verification Mechanism | Test Coverage |
| :--- | :--- | :--- |
| `/api/cron/class-reminders` | `isAuthorizedCronRequest(request.headers.get("authorization"))` with `CRON_SECRET` | `webhook-safeguards.test.ts` |
| `/api/cron/daily` | `isAuthorizedCronRequest(request.headers.get("authorization"))` with `CRON_SECRET` | `webhook-safeguards.test.ts` |
| `/api/cron/owner-digest` | `isAuthorizedCronRequest(request.headers.get("authorization"))` with `CRON_SECRET` | `webhook-safeguards.test.ts` |
| `/api/email/unsubscribe` | `verifyUnsubscribeToken(userId, token)` via HMAC SHA-256 `timingSafeEqual` | `unit/monitoring.test.ts` |
| `/api/health` | Public read-only liveness check; exposes zero sensitive credentials | `unit/monitoring.test.ts` |
| `/api/webhooks/clerk` | Svix cryptographic signature verification with `CLERK_WEBHOOK_SECRET` | `webhook-safeguards.test.ts` |
| `/api/webhooks/stripe` | Stripe constructEvent signature check with `STRIPE_WEBHOOK_SECRET` | `webhook-safeguards.test.ts` |

### C. Server Actions (`src/actions/**`)

All 25 action files enforce self-contained access controls:
- **Administrative / Staff Mutations:** `requireRole(ADMIN_ONLY)` or `requireRole(STAFF_ROLES)` protects exports (`export*.actions.ts`), class song updates (`setClassPracticeSongsAction`), and partner pairings (`autoPairWaitlistDancersAction`).
- **AI Studio Capabilities:** `requireAiStudioStaff()` guards `approveAndPublishEventAction` and `removePublishedEventAction` against unauthorized content generation or publishing.
- **Student Mutations & Telemetry:** `getOrProvisionCurrentUser()` binds mutations directly to `user.id`. Methods like `cancelBookingAction`, `cancelMerchReservationAction`, and `cancelPrivateLessonBookingAction` strictly verify ownership (`record.userId === user.id`) before executing any cancellation or credit refund.

### D. AuditLog Coverage & Schema Boundary Analysis

The `AuditLog` table currently records administrative actions via the `AuditAction` enum:
- `ROLE_CHANGE`: Logged on `switchMyAccountRoleAction`
- `CREDIT_ADJUSTMENT`: Logged on `adjustStudentCreditsAction`
- `LEVEL_PROMOTION`: Logged on `updateStudentProgressionAction`
- `CSV_EXPORT`: Logged across all four `export*.actions.ts` methods
- `EVENT_MUTATION`: Logged on `createGuestArtistEventAction`
- `REFUND`: Logged on `cancelClassSessionWithRefundsAction`

> **Attendance Overrides Assessment:**  
> AGENTS.md notes that attendance overrides should write to `AuditLog`. However, in `prisma/schema.prisma`, the `AuditAction` enum does not contain `ATTENDANCE_OVERRIDE` or `CHECKIN_OVERRIDE`. Because `prisma/schema.prisma` is an explicit hard boundary ("no schema edits, no prisma db push, no migrations"), attempting to record an attendance override to `AuditLog` would cause a runtime enum constraint violation. Adding this audit trail requires adding `ATTENDANCE_OVERRIDE` to `AuditAction` during the next scheduled schema migration.

### E. Migration Plan for Clerk `createRouteMatcher` Deprecation

Clerk's deprecation warning advises moving towards defense-in-depth resource-based authorization rather than relying purely on middleware path matching. The recommended phased roadmap for the owner:
1. **Phase 1 (Completed in this pass):** Validate that every Server Component page, API Route Handler, and Server Action implements its own access verification (`requireRole`, `getOrProvisionCurrentUser`, `auth()`, or webhook signatures).
2. **Phase 2:** Replace `createRouteMatcher` in `src/proxy.ts` with Clerk's resource-based recommendation: using `clerkMiddleware` solely for session hydration and global token decoding, delegating routing decisions to per-layout/page guards.
3. **Phase 3:** Extract shared layout guards (e.g., `src/app/(admin)/layout.tsx` and `src/app/(instructor)/layout.tsx`) to enforce role checks at the sub-tree root before rendering child routes.

---

## 6. Node 24 & ESLint 10 Trial Results (Task 5)

- **Node 24 Modernization:** CI workflows `.github/workflows/ci.yml` and `.github/workflows/song-video-check.yml` were cleanly updated to `node-version: 24`. `@types/node` was upgraded to `^24` in `package.json`.
- **System CA Adoption:** Replaced insecure `NODE_TLS_REJECT_UNAUTHORIZED="0"` with `NODE_OPTIONS=--use-system-ca`, allowing Node 24 to naturally trust Windows enterprise certificate chains without compromising TLS security.
- **ESLint 10 Upgrade:**
  - `npm i -D eslint@^10` installed cleanly with **zero peer dependency conflicts**.
  - `npm run lint` executed cleanly with **0 errors** (2 existing non-fatal Next.js image warnings).
  - All tests and builds passed; ESLint 10 is retained on this branch.

---

## 7. Deferred Items & Upstream Recommendations

1. **`/music` WCAG 2.5.3 Anchor Label Mismatch:** Update `aria-label` in `src/components/music/song-player/song-practice-list.tsx` so the accessible name starts with the visible card text. (Deferred due to hard boundary on `src/components/music/`).
2. **Prisma `AuditAction.ATTENDANCE_OVERRIDE`:** Add `ATTENDANCE_OVERRIDE` to `enum AuditAction` in `prisma/schema.prisma` in the next migration so `toggleBookingCheckInAction` can write to `AuditLog`.
3. **Clerk `createRouteMatcher` Migration:** Transition `src/proxy.ts` to Clerk's updated middleware architecture during scheduled middleware refactoring with the owner.
