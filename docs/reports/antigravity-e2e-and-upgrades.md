# Playwright E2E & CI Upgrades Quality Report

**Date:** October 31, 2026  
**Branch:** `chore/e2e-and-upgrades`  
**Base Branch:** `origin/feat/player-tools-and-engagement`  
**Target:** Salsa Explosion UK / RitmoFlow  

---

## 1. Table of Modifications

| Task | File Path | Change Description | Engineering Rationale |
| :--- | :--- | :--- | :--- |
| **1. E2E Tests** | `tests/e2e/practice-player-tools.spec.ts` | Created full Playwright test suite covering all 7 requested practice player and security scenarios: mobile row fit & style chips (390×844), section deep-links (`?section=tp-seg-6`), Web Share API fallback to clipboard (`navigator.clipboard`), calibration mode boundary nudging & undo (`?calibrate=1`), localStorage isolation without `?calibrate=1`, cron 401 auth checks, unsubscribe token validation, and instructor route redirection for guests. | Enforces automated browser verification for practice player tools and security boundaries against production builds without touching the live database. |
| **2. CI Actions** | `.github/workflows/ci.yml` | Bumped `actions/checkout` and `actions/setup-node` from `v4` to `v7`. | Matches latest Dependabot core action upgrades for faster runner startup and modern Node runtime compatibility. |
| **2. CI Actions** | `.github/workflows/song-video-check.yml` | Bumped `actions/checkout` and `actions/setup-node` from `v4` to `v7`. | Unifies action versions across scheduled monitoring workflows. |
| **2. CI Actions** | `.github/workflows/db-backup.yml` | Bumped `actions/upload-artifact` from `v4` to `v7`. | Aligns artifact upload actions with Dependabot branch `dependabot/github_actions/actions/upload-artifact-7`. |
| **Documentation** | `AGENTS.md` | Preserved automatic Next.js 16.4.2 agent rule comment block. | Prevents repetitive dirty git trees when starting dev servers. |

---

## 2. E2E Execution & Results (Task 1)

**Command:**
```powershell
$env:PLAYWRIGHT_TEST_BASE_URL="http://localhost:3200"
npx playwright test tests/e2e/practice-player-tools.spec.ts
```

**Results (100% Passed):**
- `ok 1 [chromium] › 1a. /music on 390x844 mobile viewport fits without horizontal overflow and displays style chips (17.6s)`
- `ok 2 [chromium] › 1b. /music/tremenda-pinta?section=tp-seg-6 shows NOW card as Section preview and iframe start=173 (11.2s)`
- `ok 3 [chromium] › 1c. Info sheet contains 'Share this section' and copies link with ?section=<id> to clipboard (10.6s)`
- `ok 4 [chromium] › 1d. /music/me-dicen-cuba?calibrate=1 allows nudging section boundary and undoing changes (20.9s)`
- `ok 5 [chromium] › 1e. Without ?calibrate=1, leftover overrides in localStorage are ignored (10.5s)`
- `ok 6 [chromium] › 1f. /api/cron/daily answers 401 without auth, and /api/email/unsubscribe handles invalid tokens (9.5s)`
- `ok 7 [chromium] › 1g. /instructor/practice-insights and /instructor/song-maps safely redirect signed-out visitors (26.0s)`

**Summary:** 7 passed across 1.9m execution time.

---

## 3. ESLint 10 Trial Findings (Task 3 — Deliberately Deferred / Reverted)

- **Attempted Action:** Tested bumping `eslint` from `^9` to `10.13.0` (`origin/dependabot/npm_and_yarn/eslint-10.13.0`).
- **Conflict Detected:**
  - `npm install eslint@10.13.0 --save-dev` fails with `ERESOLVE could not resolve`:
    - `vitest@5.0.5` specifies `peerOptional @types/node@"^22.0.0 || >=24.0.0"`.
    - Project dependencies (`@google/genai` -> `protobufjs`, `stripe`, and `package.json`) use `@types/node@20.19.43`.
    - `eslint@10.13.0` specifies `engines: { node: "^20.19.0 || ^22.13.0 || >=24" }`.
- **Decision:** In accordance with the prompt directive (*"Never use --force or --legacy-peer-deps to make it fit... If it needs config rewrites, peer-dependency overrides or more than ~10 code changes, revert completely and write what blocked it in the report"*), ESLint 10 was **not applied**. The working tree remains cleanly locked on ESLint 9.39.5, which passes with 0 errors.

---

## 4. Production Build & Client Bundle Size Analysis (Task 4)

### Static Build Route Summary
From `npm run build`:
- `/` (Home): **Static (prerendered)**
- `/music` (Catalog Hub): **Static (prerendered)**
- `/music/[songId]` (Player routes, 13 static pages): **SSG (prerendered with `generateStaticParams`)**
- `/instructor/roster`: **Dynamic (server-rendered on demand behind role guard)**

### Top 3 Largest Client Chunks for `/music/[songId]`
Inspected from `.next/static/chunks/` loaded by `music/me-dicen-cuba.html`:

| Chunk File | Unminified / Wire Size | Primary Module Contents | Optimization Suggestion |
| :--- | :--- | :--- | :--- |
| `2nii411saqstq.js` | **202.38 KB** | React 19 DOM runtime & core framework dependencies | Standard shared framework chunk; Next.js 16 optimizes this automatically via `optimizePackageImports`. |
| `0chscbjvo5wym.js` | **128.43 KB** | Clerk client-side authentication SDK & session management | Consider lazy-loading auth hooks (`UserButton`, role switcher) on public player routes until the user clicks "Sign In" or "Got It". |
| `1w97lml2b8kab.js` | **122.55 KB** | Timba anatomy catalog constants, section mappings, & curriculum move definitions | Extract curriculum skill explanations into a dynamic Server Action or deferred JSON chunk loaded only when opening the moves disclosure accordion. |

---

## 5. Mandatory Quality Gates Final Status

All 5 quality gates + the new Playwright E2E spec verified green:

| Quality Gate | Command | Result | Details |
| :--- | :--- | :---: | :--- |
| **1. Strict TypeScript** | `npx tsc --noEmit` | **✅ PASS** | 0 type errors, 0 `any` types |
| **2. Vitest Test Suite** | `npm test` | **✅ PASS** | 53 test suites / 348 unit tests passing (100%) |
| **3. ESLint Code Check** | `npm run lint` | **✅ PASS** | 0 errors |
| **4. Next.js Production Build** | `npm run build` | **✅ PASS** | 53 routes compiled cleanly |
| **5. Visual & Ergonomic Critic** | `npm run audit:design` (port 3200) | **✅ PASS** | All 6 routes passed on Desktop & Mobile (100dvh zero-scroll verified on `/music/me-dicen-cuba`) |
| **6. New E2E Suite** | `npx playwright test practice-player-tools.spec.ts` | **✅ PASS** | 7/7 tests passed against production server |
