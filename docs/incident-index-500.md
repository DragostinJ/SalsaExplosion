# Incident Report: Production HTTP 500 / React Error #441 ("Application Error")

## Executive Summary
Visitors to the production deployment encountered a full-screen "SALSA EXPLOSION BOURNEMOUTH — APPLICATION ERROR" accompanied by console error:
`Failed to load resource: the server responded with a status of 500 () (index):1`
`Error: Minified React error #441`

## Root Cause Analysis
### 1. `metadataBase` Invalid URL Exception in `src/app/layout.tsx`
- **Location:** `src/app/layout.tsx` (L36-38)
- **Code:**
  ```ts
  export const metadata: Metadata = {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://salsaexplosion.co.uk"
    ),
  ```
- **Trigger Condition:**
  In Vercel production environments, `NEXT_PUBLIC_APP_URL` is frequently configured without the `https://` protocol prefix (e.g., `salsaexplosion.co.uk` or `salsa-explosion.vercel.app`) or wrapped in quotes (`"https://..."`).
  In Node.js, `new URL("salsaexplosion.co.uk")` throws an uncaught `TypeError: Invalid URL`.
  Because `metadataBase` is evaluated at the root module level, this immediately crashes the server-side rendering of the root layout for all routes (`HTTP 500`).

### 2. Clerk Key Environment & Production Domain Mismatch
- **Location:** `src/app/layout.tsx` (`<ClerkProvider>`, `await auth()`) & `src/proxy.ts` (`clerkMiddleware`)
- **Trigger Condition:**
  The browser console reports: `Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production.`
  When a development key (`pk_test_...`) is deployed to a custom production domain (`salsaexplosion.co.uk`), Clerk development instances reject requests or throw unless running in localhost/dev-browser mode. Furthermore, if `CLERK_SECRET_KEY` is omitted or mismatched in the Vercel dashboard, Server Components render crashes with error #441.

### 3. Missing Root Layout Fail-Soft Boundary & Segment Fallbacks
- **Location:** `src/app/layout.tsx` and route segments
- **Trigger Condition:**
  Without segment-level `error.tsx` boundaries on `/` and core routes, any failure in layout data fetching or metadata cascades directly to `global-error.tsx`.
  `global-error.tsx` previously did not render the `error.digest` hash on the screen, hiding crucial server log reference IDs from screenshots.

## Remediation Plan (Milestones I2 - I4)
1. **Defensive URL Normalizer:** Implement safe URL parsing in `src/app/layout.tsx` that strips quotes and prepends `https://` if protocol is missing, falling back to `https://salsaexplosion.co.uk` without throwing.
2. **Fail-Soft Layout Auth:** Ensure `layout.tsx` auth and role resolution defaults gracefully to guest/signed-out state when Clerk or Prisma is degraded.
3. **Reference Code in `global-error.tsx`:** Display `error.digest` as a reference code so production logs can be cross-referenced instantly.
4. **Segment Error Boundaries:** Add segment-level `error.tsx` to `/dashboard`, `/admin`, `/instructor`, `/events`, and `/schedule`.
5. **Config Diagnostics in `/api/health`:** Expose sanitized boolean health checks for Clerk, DB, and URL validity.
