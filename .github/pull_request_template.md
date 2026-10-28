## 📋 Summary of Changes & Architectural Impact

<!-- Briefly describe the feature, refactor, or fix introduced in this pull request. -->
### What was changed?
- 

### Architectural Impact & Invariants
- [ ] Preserves single source of truth (`src/lib/academy-data.ts`, `src/lib/constants/timba-song-anatomy.ts`, `src/lib/media-manifest.ts`).
- [ ] Respects weekly class door pricing (£12/£14) vs online event ticketing invariants.
- [ ] Maintains strict server/client boundaries (Server Components by default; `"use client"` pushed to leaves).
- [ ] Strictly typed with zero `any` and Zod-validated mutations.

---

## 🚦 Verification Gates

Ensure all automated quality gates pass locally before requesting review:

- [ ] `npx tsc --noEmit` — 0 TypeScript compilation errors.
- [ ] `npm test` — All 38 Vitest suites (230 tests) passing green.
- [ ] `npm run build` — Production Next.js build exits with code 0 (36 static routes optimized).
- [ ] `npm run audit:design` — Visual & ergonomics critic passes without font entropy, color bleed, or touch-target errors.

---

## 📱 Multi-Viewport Visual Audit Confirmation

- [ ] **Desktop (`1440x900`):** Inspected in `.audit-screenshots/home-desktop-fold.png` and `.audit-screenshots/home-desktop-full.png`. Verified natural color fidelity, zero layout shifts, and no blank element voids.
- [ ] **Mobile (`390x844`):** Inspected in `.audit-screenshots/home-mobile-fold.png` and `.audit-screenshots/music-mobile-fold.png`. Verified unclipped brand header, zero horizontal scroll overflow (`scrollWidth === innerWidth`), and `min-h-[40px]` touch targets.
- [ ] **Interactive Music Engine (`/music`):** Maintained strict `100dvh` zero-scroll mobile viewport discipline.
