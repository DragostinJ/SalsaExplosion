# Salsa Explosion (RitmoFlow) 🇨🇺
### Senior Engineering Case Study: Multi-Tenant Dance Academy Operating System & Real-Time Polyrhythmic Audio Engine

[![CI Pipeline](https://github.com/DragostinJ/SalsaExplosion/actions/workflows/ci.yml/badge.svg)](https://github.com/DragostinJ/SalsaExplosion/actions/workflows/ci.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.1_(Turbopack)-black?logo=next.js)](https://nextjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0_(Strict,_0_any)-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)](https://supabase.com/)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk_v7-6C47FF?logo=clerk)](https://clerk.com/)
[![Vitest](https://img.shields.io/badge/Unit_Tests-230_Passed-6E9F18?logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Visual_Critic-Playwright-45BA4B?logo=playwright)](https://playwright.dev/)

> **🌐 Live Production Platform:** [salsa-explosion-bkgf.vercel.app](https://salsa-explosion-bkgf.vercel.app/)  
> **📍 Flagship Residency:** BOH Studios, 104 Commercial Rd, Bournemouth, UK  
> **🏆 Client Heritage:** Maestro Enrique Perez Valdes (Havana master instructor, UK Lifetime Achievement Award winner, 25+ years UK teaching heritage, 4,200+ dancers mentored).

---

## 📖 Executive Case Study Overview

**Salsa Explosion (RitmoFlow)** is a production-grade, multi-tenant workspace application engineered to modernize physical dance studio operations. Designed around the real-world operational rhythm of Bournemouth's premier Cuban Salsa academy, the system resolves a classic physical-to-digital friction: **bridging in-person cash/card door ticketing (£12 / £14 pay-at-the-door) with online festival commerce, student syllabus progression, real-time polyrhythmic audio training, and multi-persona role governance.**

Built as a senior engineering portfolio showcase, the repository demonstrates end-to-end full-stack craftsmanship: strict TypeScript typing (zero `any`), App Router server/client boundary discipline, browser-native Web Audio API synthesis, zero layout shift media architecture, and an automated Playwright visual design critic operating alongside 230 Vitest unit and security tests.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    Client["Dancer / Teacher / Owner Client"] -->|HTTPS / Next.js 16 App Router| Edge["Vercel Edge & Middleware"]
    Edge -->|Clerk Session Guard| AuthGuard["Authentication & RBAC Barrier"]
    AuthGuard -->|Tenant & IDOR Guard| ActionLayer["Server Actions (Zod Schema Validated)"]
    ActionLayer -->|Prisma Connection Pooler (PgBouncer)| DB[("Supabase PostgreSQL")]
    ActionLayer -->|Secure Checkout & Webhooks| Stripe["Stripe API & Webhook Verification"]
    ActionLayer -->|Fail-Soft User Provisioning| ClerkAPI["Clerk Backend SDK"]
    Edge -->|Browser-Native Web Audio API| AudioEngine["Client-Side Clave Synth & HUD"]
    Edge -->|Playwright Visual Critic (scripts/visual-audit.mjs)| VisualAudit["Multi-Viewport Visual & Ergonomics Gate"]
```

### Architectural Principles
1. **Server Components by Default:** Push `"use client"` strictly to the interactive leaves of the DOM tree (audio waveform scrubbers, modal sheets, and filter bars), minimizing client JavaScript bundle size and guaranteeing ultra-low Total Blocking Time (TBT).
2. **Server Actions with Runtime Zod Schemas:** All state mutations (event purchases, QR attendance check-ins, student submissions) are processed via server actions with exhaustive Zod input validation, eliminating parameter tampering.
3. **Database Connection Pooling:** Managed with PgBouncer/Supavisor to eliminate serverless connection exhaustion on high-concurrency event drops.
4. **Fail-Soft User Provisioning:** Integrated fallback handlers that provision and reconcile user database records even during third-party webhook latency or rate limits.

---

## 💎 Key Engineering Deep-Dives

### 1. Real-Time Polyrhythmic Audio Synthesizer & Telemetry HUD (`/music`)
- **Zero-Asset Web Audio API Synthesizer (`CubanRhythmSynth`):** Generates authentic 2-3 Son, 3-2 Son, 2-3 Rumba, and 6/8 Afro-Bembé clave pulses dynamically in the browser using Web Audio API oscillators and gain envelopes. Zero audio files downloaded (£0/month asset bandwidth, microsecond timing precision).
- **Bi-Directional Video Telemetry:** Synchronizes YouTube masterclass video streams with a live **Dancer HUD**, providing:
  - **3-Zone Body Telemetry:** Real-time physiological breakdowns for **Chest** (contra-body torso isolation), **Hips** (Cuban pelvic weight transfers), and **Feet** (guapea / son timing).
  - **Havana Caller Hand Signals:** Displays exact hand gestures (e.g., finger signals for *Enchufla*, ear tugs for *Dile Que No*, and Orisha gestures for *Oggún* and *Yemayá*).
  - **Dynamic Clave Indicator:** Visual flashing pulse aligned with the active clave polarity.
- **`100dvh` Zero-Scroll Mobile Discipline:** The entire audio training suite operates within a strict single-screen mobile viewport, ensuring dancers never lose view of the scrubber or telemetry while training.

### 2. Brutalist Gallery UI Inspired by *The Place* London
- **Aesthetic Direction:** Replaces generic SaaS cards with a refined editorial aesthetic inspired by *The Place* (London Contemporary Dance School) and international arts galleries.
- **Deep Theatre Obsidian Canvas (`#080706`):** Natural stage contrast paired with Warm Ivory (`#F5F2EB`), Havana Crimson (`#DC2626`), and Subtle Amber accents.
- **Zero Layout Shift (CLS = 0) Media Pipeline:** Centralized media manifest ([`src/lib/media-manifest.ts`](src/lib/media-manifest.ts)) defining canonical aspect ratios, intrinsic dimensions, and responsive loading behaviors for all photography.

### 3. Single Source of Truth Domain Architecture
- **Academy Specifications & Operating Schedule:** Centralized in [`src/lib/academy-data.ts`](src/lib/academy-data.ts) and [`src/lib/constants/`](src/lib/constants/). Venue specifications, weekly class timetables, door pricing, instructor bios, and festival pass tiers originate from one single data contract.
- **Polyrhythmic Timba Anatomy Registry:** Defined in [`src/lib/constants/timba-song-anatomy.ts`](src/lib/constants/timba-song-anatomy.ts), cataloging complete multi-gear progression maps for benchmark tracks (*Me Dicen Cuba*, *La Cosa Mala*, *Agua Pa' Yemayá*, and Marc Anthony's *Aguanile*).

### 4. AI-Augmented Quality Engineering & Automated Visual Critic
- **Automated Visual & Ergonomics Critic ([`scripts/visual-audit.mjs`](scripts/visual-audit.mjs)):** An in-tree Playwright audit tool executing against Desktop (`1440x900`) and Mobile (`390x844`) viewports that programmatically evaluates:
  - **Typography Entropy:** Asserts that no route exceeds 9 distinct font-size combinations.
  - **Color Bleed:** Detects computed colors falling outside approved Obsidian, Ivory, and Crimson design tokens.
  - **Mobile Overflow:** Validates `scrollWidth === innerWidth` on 390px mobile viewports.
  - **Touch Target Ergonomics:** Flags interactive buttons smaller than the 40px mobile thumb comfort standard.
  - **Faculty Visibility & Zero Voids:** Proves all instructor cards render with computed `opacity: 1` and `height > 150px`.

---

## 🛡️ Role-Based Access Control (RBAC) & Security Model

The platform enforces three distinct operational personas with zero credential or data leakage:

| Persona | Capabilities | Security Boundary |
| :--- | :--- | :--- |
| **Dancer (Student)** | Timetable, class progression, QR wallet passes, song analyzer, event pass checkout | Strict IDOR guards prevent reading or modifying other students' data |
| **Teacher (Instructor)** | Mobile QR class scanner, student level progression, submission grading, attendance | Scoped to assigned classes; cannot view global financials |
| **Owner (Admin)** | Studio operations workspace, revenue analytics, door check-ins, coach assignment, audit logs | Protected by admin session validation and forensic audit logging |

- **IDOR Prevention:** Validated via unit tests (`tests/unit/idor-ownership.test.ts`) proving students cannot read or cancel tickets belonging to another user.
- **Secret Hygiene Guard:** Production builds immediately abort if `CLERK_WEBHOOK_SECRET` or `STRIPE_WEBHOOK_SECRET` contain dummy placeholder values.
- **Production Role Lock:** The demo role switcher is hard-locked in production via `ALLOW_DEMO_ROLE_SWITCHING=false`.

---

## 🗄️ Database Schema (Supabase PostgreSQL & Prisma)

| Model | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`User`** | Unified account entity linked to Clerk identity | `Role`, `Bookings`, `Attendances`, `Submissions`, `Referrals` |
| **`ClassSession`** | Weekly Thursday/Sunday studio sessions at BOH Studios | `Instructor`, `Attendances`, `Level` |
| **`Event`** | Special congresses, weekenders & costume parties | `TicketTiers`, `Bookings`, `Venue` |
| **`Booking`** | Online pass purchases with Stripe payment intent tracking | `User`, `Event`, `TicketTier` |
| **`Attendance`** | Physical door check-ins and QR-scanned admissions | `User`, `ClassSession` |
| **`StudentSubmission`** | Video submissions for syllabus skill accreditation | `User`, `Instructor`, `Skill` |
| **`AuditLog`** | Forensic security log recording critical actions and role changes | `ActorId`, `Action`, `Metadata` |

---

## 🧪 Comprehensive Testing Suite (38 Suites, 230 Tests)

```bash
# 1. Run Vitest Unit & Security Test Suite
npm test

# 2. Run TypeScript Strict Compilation Check
npx tsc --noEmit

# 3. Run Production Next.js Build
npm run build

# 4. Run Playwright Automated Visual Critic & Ergonomics Audit
npm run audit:design
```

### Critical Security & Invariant Test Suites:
- `tests/unit/idor-ownership.test.ts` — Proves tenant isolation across bookings, passes, and submissions.
- `tests/unit/auth-role-escalation.test.ts` — Proves non-admins cannot invoke administrative server actions.
- `tests/unit/webhook-safeguards.test.ts` — Proves webhook verification fails securely with placeholder secrets.
- `tests/unit/media-manifest.test.ts` — Asserts all photography assets exist on disk, exceed 10KB, and eliminate CLS.
- `tests/unit/timba-song-anatomy.test.ts` — Validates frame-accurate timing segments and clave metadata across all songs.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database (local or Supabase connection pool)
- Clerk API keys
- Stripe API test keys

### 1. Clone & Install
```bash
git clone https://github.com/DragostinJ/SalsaExplosion.git
cd SalsaExplosion
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database connection string, Clerk credentials, and Stripe test keys.

### 3. Generate Prisma Client & Run Migrations
```bash
npx prisma generate
npm run db:push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📱 Core Application Routes

- `/` — Split Hero (`hero-social.jpg`), Architectural Gateways, What's On Posters, Faculty Roster, Inside the Cuban Circle, BOH Studios Venue Guide.
- `/music` — Interactive Timba Song Anatomy Player, Web Audio Clave Synthesizer, 3-Zone Body Telemetry, and BPM guide.
- `/events` — Online ticket box office for flagship festivals (*Made in Cuba Dance Weekend 2026*, *Halloween Party*, *SB&K Nights*).
- `/dashboard/schedule` — Weekly Thursday & Sunday timetable, door pricing guide (£12 / £14), and BOH Studios arrival planner.
- `/dashboard/rueda` — Comprehensive Havana Rueda de Casino call dictionary with caller hand gestures and 4-tier syllabus breakdown.
- `/about` — Academy heritage, Maestro Enrique Perez Valdes biography, and BOH Studios Canadian sprung maple floor specifications.
- `/admin/operations` — Studio owner dashboard: real-time attendee roster, revenue analytics, coaching requests, and forensic audit logs.

---

## 🤖 AI Governance & Development Methodology

This repository is governed under the **[`AGENTS.md`](AGENTS.md)** engineering protocol. Every feature, refactor, and bug fix follows a strict pre-merge verification pipeline:
1. Architectural alignment with single-source-of-truth registries.
2. Preservation of weekly class door pricing invariants.
3. 100% green status across all 38 Vitest suites (230 tests) and production build.
4. Visual critic approval across Desktop and Mobile screenshots.

---

## 📄 License & Credits

Built for **Salsa Explosion UK** and **BOH Studios Bournemouth**. All rights reserved.  
Architected and developed by **Dragostin J.** as a demonstration of production-grade full-stack web engineering.
