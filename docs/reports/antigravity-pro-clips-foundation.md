# Antigravity Report: Pro Clips Foundation & Signed-In Safety Sweeps

**Date:** 2026-11-03  
**Branch:** `feat/pro-clips-foundation`  
**Base:** `origin/fix/mobile-menu-signed-in`  
**Execution Mode:** Senior Engineering Mentor Autonomous Implementation  
**Status:** All 6 Tasks Completed, 4 Quality Gates Passed, Full E2E Verified (110 passed, 4 skipped)

---

## 1. Executive Summary & Context

This milestone delivers two tightly integrated engineering objectives:
1. **Closing Production Gaps:** Guarding against signed-in crashes, character encoding corruption (mojibake), and runtime positional index errors across the application.
2. **Staff Pro Clips Pipeline:** Establishing the foundation for YouTube dance video breakdowns curated via AI Studio Move Mapper. Teachers review, verify, and confirm each figure against the video at `/instructor/clips`, and verified clips are saved into `src/lib/moves/data/pro-clips.json` via an idempotent review report CLI script.

Strict system and boundary constraints were preserved throughout:
- `prisma/schema.prisma` was untouched (0 DB pushes, 0 SQL migrations; clips live in structured JSON like the move library).
- Dancer-facing `/moves/**` pages were untouched (reserved for Claude).
- Stripe, checkout actions, and webhooks were untouched.
- `public/images/editorial/*.jfif` files were preserved uncommitted.
- All files written as UTF-8 without BOM.
- Full compliance with YouTube Terms of Service (`youtube-nocookie` iframe, player >= 200x200, never overlaid, no scraping or direct video downloading).

---

## 2. Deliverables by Task

### Task 1: Signed-In Test Coverage (`tests/e2e/authenticated.spec.ts`)
- **Mobile Menu Crash Prevention:** Added an authenticated mobile viewport test at 390x844 (iPhone 14). Signs in via the existing Clerk testing flow, iterates over core routes (`/`, `/music`, `/classes`, `/events`, and `/dashboard/carnet`), opens the mobile menu sheet, and verifies:
  - Menu dialog becomes visible.
  - No `pageerror` event fires and no `"Application error"` text appears.
  - Critical navigation links exist: `/dashboard/wallet` and `/dashboard/progression`.
  - Sheet closes cleanly via `"Close menu"` before transitioning to the next route.
- **Mi Carnet Route Sweep:** Added `/dashboard/carnet` to the authenticated student route audit list.
- **Authentication Prerequisites:** The test suite gracefully skips when `E2E_CLERK_USER_USERNAME` and `E2E_CLERK_USER_PASSWORD` are not configured in the environment, following [docs/E2E_AUTH.md](file:///d:/saas%20learning/ritmoflow/docs/E2E_AUTH.md).

### Task 2: Mojibake Guard (`tests/unit/no-mojibake.test.ts`)
- **Automated Text File Encoding Audit:** Added a dedicated unit test that executes `git ls-files` across `src/`, `tests/`, `scripts/`, `docs/`, `AGENTS.md`, and `README.md` (filtering out binaries, fonts, and images).
- **Detection Patterns:** Scans for 18 UTF-8-read-as-Windows-1251 and UTF-8-read-as-CP1252 sequences (the list lives only in `tests/unit/no-mojibake.test.ts`; writing them anywhere else, this report included, fails the guard).
- **Failure Feedback:** Any corrupted character immediately fails the test with the exact file path, line number, and offending substring.
- **Current Tree Status:** Clean scan across all tracked repository files (0 mojibake occurrences).

### Task 3: Positional-Pick Refactoring & `--noUncheckedIndexedAccess` Audit
- **Elimination of Fragile Array Indexing:** Replaced hardcoded positional indexing (`list[index]`) on fixed UI element collections with explicit named constants:
  - `src/components/review/review-booster-client.tsx`: `DEFAULT_FAVORITE_ASPECT`, `DEFAULT_INSTRUCTOR_HIGHLIGHT` and `DEFAULT_DANCER_LEVEL`, typed as members of their option lists.
  - `src/components/venues/venue-arrival-planner.tsx`: one named constant per venue (`BOH_STUDIOS_DESTINATION`, `BOH_STUDIO_2_DESTINATION`, `NEPTUNE_HALL_DESTINATION`, `ROUNDHOUSE_DESTINATION`) and `DEFAULT_DESTINATION`.
  - `src/components/lessons/private-lessons-client.tsx` and `src/lib/constants/coaching.ts`: `DEFAULT_COACHING_TOPIC`.
  - `src/components/progression/cuban-dance-gears-matrix.tsx`: `DEFAULT_TIMBA_SONG_PHASE` (found by name, "Tema").
  - Claude checked that every default is the same value the old index picked, so nothing changes for users. (This list was corrected in review: the first version named constants that don't exist.)
- **`--noUncheckedIndexedAccess` Audit:**
  Executed experimental `npx tsc --noEmit --noUncheckedIndexedAccess` without modifying `tsconfig.json`. Found 267 total type errors across the project:
  - `.next/`: 8 errors
  - `src/actions/`: 2 errors
  - `src/app/`: 14 errors
  - `src/components/`: 49 errors
  - `src/lib/`: 43 errors
  - `tests/`: 151 errors

### Task 4: Clip Breakdown Schema, Strict Parser & Validator (`src/lib/moves/pro-clips.ts`)
- **Schema (`ClipBreakdownSchema`):**
  - Strict Zod schema enforcing `kind: "ritmoflow-clip-breakdown"`, `version: 1`, kebab-case `id`, 11-char YouTube ID, `dancers` (1-6 strings), and optional `songId` verified against `TIMBA_SONG_ANATOMY_DATA`.
  - Up to 200 breakdown rows with `start`, `end`, `type`, `mechanics` (20-1200 characters), `moveIds`, `match` (`same` | `variation` | `not-in-library`), `confidence` (`high` | `medium` | `low`), optional `musicalMoment`, and optional `newMove`.
- **Validation Rules with Human-Friendly Error Messages:**
  - `start < end` timestamp validation.
  - Chronological ordering and non-overlapping constraint (`prevEnd <= currStart`).
  - Library ID verification: every `moveId` must exist in `getAllMoves()`; unknown IDs are listed in error outputs rather than silently stripped.
  - Matches of type `"same"` or `"variation"` require at least one valid `moveId`.
  - `newMove` is permitted only when `match === "not-in-library"`.
- **Strict Timestamp Parser (`parseClipTimestamp`):**
  - Accepts `M:SS`, `MM:SS`, `H:MM:SS` (with optional decimal fractions).
  - Explicitly rejects invalid formatting, negative values, and illegal minutes/seconds (`118`, `1:78`).
- **Markdown-Safe Input Parser (`parseClipBreakdownInput`):**
  - Gracefully extracts JSON from markdown fenced code blocks (` ```json ... ``` `) generated by AI Studio.
  - Returns `{ ok: true, clip }` or `{ ok: false, errors: string[] }` without throwing unhandled exceptions.
- **Data File:** Initialized `src/lib/moves/data/pro-clips.json` as `[]`.
- **Unit Tests:** Built comprehensive fixtures and assertions in `tests/unit/pro-clips.test.ts`.

### Task 5: Staff Clip Review Desk (`/instructor/clips`)
- **Route Guard & Security:**
  - `src/app/instructor/clips/page.tsx`: Server component calling `requireRole(STAFF_ROLES)`.
  - Prefills reviewer name from the signed-in instructor's display name.
  - Zero server actions: review state remains in-memory until exported.
- **Interactive Review Console (`src/components/instructor/clip-review/clip-review-console.tsx`):**
  - Paste breakdown JSON and validate on the fly with granular error messages.
  - Official `youtube-nocookie` player embed (player dimensions >= 200x200, no overlays, unobscured).
  - Row inspector displaying timestamps, type, mechanics, confidence, match type, and musicality notes, with clickable links to `/moves/[id]`.
  - "Play this row" button that re-keys the iframe with `start` and `end` parameters and autoplays only upon direct user request.
  - Granular row controls: Confirm, Unsure, Reject buttons with `aria-pressed`, editable move ID inputs validated live against `getAllMoves()`, and review notes.
  - "Copy report" button enabled only when every row has a decision, exporting the canonical `ritmoflow-clip-review` JSON.
- **Staff Navigation:** Added "Pro clips" link alongside "Import" in `src/components/instructor/move-review/move-review-list-console.tsx`.
- **E2E Guard:** Updated `tests/e2e/move-review-guards.spec.ts` to assert that signed-out visits to `/instructor/clips` redirect to `/sign-in`.

### Task 6: Apply Script & Read Helpers (`scripts/apply-clip-review.ts`, `src/lib/moves/pro-clips.ts`)
- **Report Schema & Store Schema:**
  - `ClipReviewReportSchema` and `StoredProClipSchema` enforcing strict storage structure.
  - Only confirmed rows are persisted, with timestamps converted to seconds (`startSeconds`, `endSeconds`).
  - Teacher-edited move IDs take precedence over AI suggestions.
- **Apply Script (`scripts/apply-clip-review.ts`):**
  - Operates in dry-run mode by default; applies changes only when `--write` is specified. Supports stdin (`-`).
  - Outputs summary of confirmed, unsure, and rejected rows.
  - Enforces idempotency: re-applying a clip replaces the existing entry by ID.
  - Saves formatted 2-space JSON with trailing newline, sorted alphabetically by clip ID.
- **Read Helpers:**
  - `getProClips()`: Returns all stored clips with confirmed rows.
  - `getProClipsForMove(moveId)`: Returns clips containing confirmed rows for the specified move.
  - `getProClipsForSong(songId)`: Returns clips matched to a specific song anatomy ID.

---

## 3. Verification & Quality Gates

All 4 required quality gates from `AGENTS.md` plus full Playwright end-to-end testing passed:

| Gate | Check | Command | Result | Notes |
|---|---|---|---|---|
| **Gate 1** | Strict TypeScript | `npx tsc --noEmit` | **PASSED** | 0 errors |
| **Gate 2** | Vitest Test Suite | `npm test` | **PASSED** | 76 test files, 495 tests passing (100%) |
| **Gate 3** | Production Build | `npm run build` | **PASSED** | 254 routes compiled cleanly, 0 warnings |
| **Gate 4** | Design System Audit | `npm run audit:design` | **PASSED** | 0 visual defects against port-3200 server |
| **Gate 5** | Full E2E Suite | `npx playwright test` | **PASSED** | 110 passed, 4 skipped (authenticated suite), 0 failed (24.1m runtime) |

---

## 4. How Teachers Hand-Test the Pro Clips Review Desk

Maestro Enrique or any instructor can test the complete review pipeline:

### Step 1: Open the Review Desk
1. Navigate to `/instructor/clips` in the browser (sign in as an instructor or admin).
2. Observe that "Reviewed by" defaults to your instructor display name.

### Step 2: Paste the Breakdown Fixture
Copy and paste this AI Studio breakdown into the input area:
```json
{
  "kind": "ritmoflow-clip-breakdown",
  "version": 1,
  "id": "hand-test-do-not-save",
  "youtubeVideoId": "Wh1zERcDWGM",
  "title": "Paolo & Alina [Homenaje a la Música Cubana - Orq. Mercadonegro] Salsa @WorldLatinCongress",
  "channelTitle": "World Latin Congress",
  "dancers": ["Paolo", "Alina"],
  "songId": "homenaje-a-la-musica-cubana",
  "analysis": {
    "model": "hand test",
    "fps": 1,
    "notes": "A made-up breakdown for testing the desk. Never save it."
  },
  "rows": [
    {
      "start": "0:00",
      "end": "0:14",
      "type": "figure",
      "mechanics": "Leader initiates basic guapea step with open hand hold, shifting weight on 1-2-3 and tapping on 4.",
      "moveIds": ["guapea"],
      "match": "same",
      "confidence": "high",
      "musicalMoment": "Intro piano montuno groove before vocals enter."
    },
    {
      "start": "0:14",
      "end": "0:28",
      "type": "figure",
      "mechanics": "Leader transitions into open break and leads follower into right turn exhibela pattern.",
      "moveIds": ["exhibela"],
      "match": "same",
      "confidence": "high",
      "musicalMoment": "Brass horn section hit on count 1."
    },
    {
      "start": "0:28",
      "end": "0:42",
      "type": "figure",
      "mechanics": "Closed position: he leads her across in front of him on 1-3 and they open out on 5-7 (dile que no).",
      "moveIds": ["dile-que-no"],
      "match": "same",
      "confidence": "high"
    }
  ]
}
```

### Step 3: Validate and Review
1. Click **"Validate breakdown"**.
2. Confirm the YouTube player appears and the three breakdown rows render.
3. Click **"Play this row"** on Row 1: verify the video seeks to 0:00 and loops/stops at 0:14.
4. Set decisions:
   - Row 1: Click **Confirm**.
   - Row 2: In the Move IDs field, type `setentaa` (a typo): the row shows "Unknown move ID(s)" and Copy stays disabled. Correct it to `setenta`, then click **Confirm**.
   - Row 3: Click **Reject** and add an optional note (*"Not a clean Dile Que No"*).

### Step 4: Export and dry-run the review (never --write this fixture)
1. Once all rows have a decision, click **"Copy report"**.
2. Save the copied JSON to a local file outside the repo, e.g. `Desktop\test-review.json`.
3. In your terminal, run the dry run:
   ```bash
   npx tsx scripts/apply-clip-review.ts test-review.json
   ```
   Verify it reports: `2 confirmed, 0 unsure, 1 rejected`, and that it modified no files.
4. Do NOT add `--write` for this fixture. It is made up, and anything saved to `src/lib/moves/data/pro-clips.json` shows on the move pages ("Bailado por los pros"). Use `--write` only for real breakdowns a teacher checked against the video.

---

## 5. Branch & Commit History

Branch: `feat/pro-clips-foundation`  
Base: `origin/fix/mobile-menu-signed-in`

Commits:
1. `d761749` - `test(e2e): add signed-in mobile nav sweep and include carnet in portal audit`
2. `e9a537c` - `test(unit): add mojibake guard scanning tracked text files`
3. `fe995c6` - `refactor(ui): replace positional indexing of fixed UI lists with named constants`
4. `9eeafb1` - `feat(pro-clips): define clip breakdown schema, strict timestamp parser and validator`
5. `d83c4e2` - `feat(instructor): build pro clips review desk at /instructor/clips and staff navigation`
6. `6eb140e` - `feat(pro-clips): build apply-clip-review script, review report schema and read helpers`
7. *(This commit)* - `docs: add antigravity pro clips foundation report and update AGENTS.md test counts`

---

## 6. Claude's review (2026-11-03, branch `feat/pro-clips-reviewed`)

Reviewed commit by commit and merged with `feat/move-mapper-v2` (the AI Studio Move Mapper kit that produces these breakdowns). The work stayed inside the brief: no schema, Stripe, song or move-data changes, and nothing dancer-facing. Fixed in review:

- **Applying a report could drop rows quietly.** A decision for a row past the end, a row decided twice, or an undecided row (counted as "unsure") went through. Now every row needs exactly one decision or nothing is applied.
- **The clip inside a review report was not re-checked.** A wrong song id or overlapping rows were saved. The whole-clip rules now live in `clipTimelineErrors()`, used by both the parser and the apply step.
- **`apply-clip-review.ts` could erase the data file.** If `pro-clips.json` couldn't be read or parsed, it said "Starting empty", and `--write` would then overwrite every stored clip. Now it starts empty only when the file doesn't exist, validates the file with `StoredProClipSchema`, and otherwise stops.
- **Copy report worked with unknown move ids typed in.** The warning showed but did not block, and the apply script would refuse the report later. Copy is now disabled until they are fixed, and the bar says which rows.
- Hard-coded `#161311` shadows and `bg-black` became the ink token. Two unused type imports were removed.
- The hand-test no longer tells the teacher to `--write` a made-up fixture (it would have appeared on the move pages). Its header now uses the video's real title and channel, and its third row uses Cuban terms. Section 3's list of renamed constants was corrected.
- The Move Mapper kit now takes its row types, match and confidence values from `pro-clips.ts`, and a test checks that what the mapper asks Gemini for is exactly what this importer accepts.

Added by Claude: "Bailado por los pros" on move pages (`src/components/moves/pro-clips-section.tsx`). It lists teacher-confirmed moments from `pro-clips.json` with the official embed and credit, and shows nothing while the file is empty.
