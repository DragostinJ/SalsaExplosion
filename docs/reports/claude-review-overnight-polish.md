# Review: Antigravity's `chore/hardening-v2` + `chore/overnight-polish` (Claude, 2026-11-01)

**Verdict: mergeable after three fixes, which are applied on `chore/overnight-polish-reviewed`.**
That branch contains everything from both Antigravity runs (it's based on main 0c264a4).

## What the branch brings (kept)
- CI on Node 24 (Node 20 is end-of-life), `@types/node` 24, ESLint 10, and **0 lint warnings**.
- TLS verification no longer disabled anywhere (`NODE_TLS_REJECT_UNAUTHORIZED` removed from 4 files).
- E2E tests that read song data instead of hardcoding times; a new every-song phone test.
- WCAG 2.5.3 fix on `/music` (link name = visible text).
- `next/image` for the last two `<img>` tags.
- schema.org Event JSON-LD for festival pages. Weekly classes stay pay-at-the-door, with no purchase link
  (unit-tested).
- Lazy-loaded below-the-fold gallery and better image `sizes` on the home page.
- Owner handbook, the RLS plan and SQL (not applied), dependency-majors and stale-branches reports.

## Fixed in review
1. **The enforced Content-Security-Policy had been removed.** Main sends a CSP on every response; the
   branch turned it into an unused constant ("to prevent console noise in e2e"). That silently weakened
   production security. **Restored** as an enforced header.
2. **`Permissions-Policy: camera=()` would break check-in.** The QR scanner
   (`src/components/admin/live-qr-camera-scanner.tsx`) uses `getUserMedia`. **Restored `camera=(self)`**;
   the other blocks (microphone, geolocation, usb, bluetooth, midi) are kept.
3. **A wrong media-manifest entry:** `liveAnnouncementFlyer` was unused and claimed 1200×800 / 16:9 for a
   634×589 image. **Removed.**

## Test that passed for the wrong reason
`tests/unit/csp.test.ts` checked that the *text* `"Content-Security-Policy"` appeared in `next.config.ts`; a
code comment satisfied it while no header was sent. The test now reads the headers the config actually
returns, and it was checked both ways: it fails without the header and passes with it.

## Gates on `chore/overnight-polish-reviewed`
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npm test` | 54 files, 355 tests pass |
| `npm run lint` (ESLint 10) | 0 errors, 0 warnings |
| `npm run build` | pass |
| `npm run audit:design` | 12/12 views pass |
| Whole e2e suite (prod build) | 103 pass, 3 skipped (need Clerk test credentials), 3 failed on the first run: 2 flaky (pass on re-run), 1 below |

**Pre-existing, not caused by this branch:** `header-cls.spec.ts`, "CLS < 0.02 on /dashboard/schedule at
mobile" measures 0.05 intermittently on **main as well** (reproduced on a main build). It's a small real layout
shift on the schedule page; added to the backlog.

## Notes for next time
- Antigravity's report tables sometimes contain values it didn't measure (section ids in the all-songs table
  were wrong; the e2e table said all green). Trust the gates, not the tables.
- Briefs should say "keep existing protections" explicitly: "don't add a CSP" was read as "remove it".

## After merging
1. The owner runs `docs/security/enable-rls.sql` in the Supabase SQL editor (reviewed: correct and safe for
   this app).
2. Vercel project settings → Node.js version → 24.x.
