# AI-Augmented Engineering Governance (`AGENTS.md`)

This repository is developed and maintained using systematic, AI-augmented software engineering practices. All autonomous and semi-autonomous coding agents (including Google Antigravity, Claude, Cursor, and GitHub Copilot) operating within this codebase are bound by the architectural contracts, domain invariants, and quality gates defined below.

---

## 🏛️ 1. Architecture & Single Sources of Truth

Every agent must respect canonical data registries. **Never duplicate, hardcode, or scatter business data across UI components.**

1. **Academy Specifications & Operating Schedule:**
   - **File:** [`src/lib/academy-data.ts`](src/lib/academy-data.ts) (with supporting constants in [`src/lib/constants/`](src/lib/constants/))
   - Canonical home for venue specifications, weekly class timetables, door pricing, instructor roster biographies, and festival pass tiers.
2. **Polyrhythmic Timba Anatomy & Telemetry:**
   - **File:** [`src/lib/constants/timba-song-anatomy.ts`](src/lib/constants/timba-song-anatomy.ts)
   - Canonical repository for benchmark salsa/timba track progression segments, clave patterns (`2-3 Son`, `3-2 Son`, `2-3 Rumba`, `6/8 Afro-Bembé`), 3-zone body telemetry (Chest, Hips, Feet), and Rueda caller hand gestures.
3. **Media Pipeline & Zero Cumulative Layout Shift (CLS):**
   - **File:** [`src/lib/media-manifest.ts`](src/lib/media-manifest.ts)
   - Every photograph, hero visual, and poster must be cataloged with canonical aspect ratios, intrinsic dimensions, and responsive loading behaviors before rendering in JSX.

---

## 💼 2. Business Model Invariants (Non-Negotiable)

The commercial model reflects the real-world operational requirements of Salsa Explosion UK and BOH Studios Bournemouth:

1. **Weekly Classes at BOH Studios:**
   - **Pricing:** Strictly **£12 for 1 Class** or **£14 for 2 Classes** (Classes + Free Social).
   - **Payment Channel:** Strictly **Pay at the Door** (Cash or Card on arrival).
   - **Invariant:** Agents must **never** wire Stripe checkout buttons or payment gateways for weekly Thursday or Sunday classes. That includes class-credit packs, memberships and subscriptions: they were retired on 2026-11-01 and `createCheckoutSessionAction` always refuses. Class credits are gone too (2026-11-02): no welcome credit, no bring-a-friend reward, no free-class redemption. The `classCredits` column and `CreditLedger` table stay in the database but nothing reads or writes them.
   - **Reservations:** booking a class only tells the teachers who is coming. Enrique's rule: everyone dances, even when the class is busy or uneven, so Lead/Follow is information for the teachers and never a limit (classes and festivals alike). It is free and takes no credits; dancers pay at the door, so cancelling never refunds anything.
2. **Festivals & Special Events:**
   - Online advance ticketing (Full Passes, Day Passes, Party Passes) is reserved **exclusively** for festivals and special events: the weekenders and the parties (e.g., *Made in Cuba Dance Weekend*, *SB&K Night*, the Xmas and NYE parties), through `createEventCheckoutSessionAction`.
   - All online transactions route through secure Stripe Checkout sessions with Zod-validated server actions.
3. **Multi-Role RBAC & Zero Privilege Escalation:**
   - Three distinct operational personas: `DANCER`, `TEACHER`, and `OWNER`.
   - Role switching via demo UI is strictly locked in production (`ALLOW_DEMO_ROLE_SWITCHING=false`).
   - Every database query accessing student data must be scoped to the authenticated tenant/user ID to prevent Insecure Direct Object References (IDOR).

---

## 🎨 3. Design System & Ergonomic Gates

The visual language is the **ICAIC Poster** direction (1960s–70s Cuban film posters), chosen by Enrique on 2026-11-01. The approved mock-up lives at `/mockups/icaic`.

1. **Two surfaces, one token set (`src/app/globals.css`):**
   - **Paper** is the default: canvas `#F1E6D0`, ink text `#161311`.
   - **Ink** (`.theme-ink` on a subtree) is the night poster: canvas `#161311`, paper text. The practice player, the footer and ink sections on home use it.
   - Both scopes expose the same semantic tokens (`canvas`, `surface-1..3`, `line`, `ivory` = text, `ivory-muted`, `gold` = accent, `brand`, `success`, `warning`, `danger`, `info`), so components never pick a surface's hex.
   - Tailwind's palette ladders are mirrored on paper (`scripts/icaic-palette.mjs`), so dark-first classes like `text-amber-300` and `bg-white/5` keep their contrast. `text-white` means "the contrast ink" (ink on paper, warm white on ink).
2. **Poster inks (identical on both surfaces):** `paper`, `ink`, `poster-red #E8462F`, `poster-mustard #F4B41A`, `poster-teal #12938F`, `poster-blue #22418F`, `poster-pink #EE7BA0`, `poster-plum #5B2A6E`. Use them for solid blocks, song-map fills (`DANCE_GEAR_LEGEND`) and illustrations, never for small text on a surface they fail contrast on.
3. **Type:** Anton (`font-display`, all `h1`/`h2`, always uppercase, one weight) for headlines; Archivo for everything else. Poster building blocks live in `src/components/poster/` (`TYPE`, `KICKER`, `POSTER_BUTTON`, `halftone`, `SongStripes`).
4. **Shape:** square corners (radius tokens are 0; only `rounded-full` survives for circles and pills), 4px ink rules and borders, hard offset shadows instead of glows.
5. **Zero Bleed:** no random hex codes, no stark white cards, no stage glows or glass effects.
6. **Typography Scale Discipline:**
   - **Maximum 9 distinct font-size combinations per route** to prevent typography entropy.
   - Enforced by `scripts/visual-audit.mjs`.
7. **Touch Target Ergonomics:**
   - Interactive elements (buttons, nav items, accordion triggers, tab selectors) must meet a minimum touch target height of **`min-h-[40px]`** on mobile viewports.
8. **Mobile Audio Discipline (`/music/[songId]` practice player):**
   - `/music` is the song list; each song opens the full-screen practice player at `/music/[songId]`, which must keep a strict **`100dvh` zero-scroll** layout on mobile (enforced by the `zeroScroll` route in `scripts/visual-audit.mjs`). Video, song map, NOW/NEXT cards and the thumb-zone controls stay on one screen; extra detail goes behind disclosure (moves accordion, details sheet, swipe-to-preview).
   - **Timing is sacred:** section cues are driven only by the media clock (`src/lib/music/`), never a simulated timer. Song timings come from Argus and are validated with the `/instructor/song-maps` importer; never invent or "adjust" timestamps without Argus output or calibration data.
   - **YouTube terms:** player viewport ≥ 200×200px, nothing overlaid on it, never hidden while playing, no extra audio mixed over it. Features that need those (clave over the music, background audio) require `licensedAudio`.

---

## 🚦 4. Mandatory Quality Gates (Pre-Merge Protocol)

No commit or pull request generated by an AI agent shall be accepted without 100% green verification across all four automated quality gates:

```bash
# 1. Strict TypeScript Compilation (Zero 'any', zero type errors)
npx tsc --noEmit

# 2. Vitest Unit & Security Test Suite (101 files, 629 passing tests as of 2026-11-04)
npm test

# 3. Next.js Production Build (0 warnings, all static routes optimized)
npm run build

# 4. Multi-Viewport Automated Visual & Ergonomic Critic
npm run audit:design
```

### Automated Visual Critic Verification (`scripts/visual-audit.mjs`):
Before reporting task completion, agents must run the visual audit script to inspect Desktop (`1440x900`) and Mobile (`390x844`) captures, verifying:
- **Zero Horizontal Overflow:** `scrollWidth === innerWidth` on `390px` mobile devices.
- **Brand Integrity:** Header logo lockup width `>= 140px` and unclipped.
- **Faculty Visibility:** Zero empty voids; all instructor cards rendered with computed `opacity: 1` and `height > 150px`.
- **Natural Color Fidelity:** Photography rendered in full natural color without artificial greyscale desaturation.

---

## 🛡️ 5. Security & Threat Modeling Directives

- **Zero `any` in TypeScript:** All server inputs, API payloads, and webhook events must be validated with runtime Zod schemas.
- **Secret Hygiene:** Webhook secrets (`CLERK_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET`) must be verified at startup; production builds must abort immediately if dummy or placeholder values are detected.
- **Fail-Soft User Provisioning:** Third-party auth failures (e.g., Clerk API rate limits) must degrade gracefully with database-level provisioning fallbacks.
- **Audit Logging:** Administrative actions, role switches, and attendance overrides must emit forensic entries to `AuditLog`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
