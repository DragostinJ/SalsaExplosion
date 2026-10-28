# System Architecture & Technical Specifications

This document outlines the architectural decisions, design patterns, data flow, and security mechanisms implemented in **Salsa Explosion (RitmoFlow)**.

---

## 1. High-Level System Architecture

```
                          +------------------------------------------+
                          |             Client Layer                 |
                          | (React 19 / Next.js 16 App Router)       |
                          +--------------------+---------------------+
                                               |
                                     HTTPS / Fetch / Actions
                                               |
                                               v
                          +------------------------------------------+
                          |            Edge & Middleware             |
                          |  - Clerk Session Verification            |
                          |  - CSP & Security Headers                |
                          |  - Route Guards & Role Protection        |
                          +--------------------+---------------------+
                                               |
                                               v
                          +------------------------------------------+
                          |         Server Action & API Layer        |
                          |  - Zod Runtime Schema Validation         |
                          |  - Fail-Soft User Provisioning           |
                          |  - IDOR & Tenant Boundary Enforcement    |
                          +--------------------+---------------------+
                                               |
                         +---------------------+---------------------+
                         |                                           |
                         v                                           v
      +-------------------------------------+     +-------------------------------------+
      |           Prisma ORM Layer          |     |          Third-Party Services       |
      | - Connection Pooling (Supavisor)    |     | - Stripe API & Webhook Verification |
      | - PostgreSQL (Supabase)             |     | - Clerk Management API              |
      +-------------------------------------+     +-------------------------------------+
```

---

## 2. Server / Client Boundary Rules

To maximize performance, SEO, and maintainability, the application strictly adheres to the following component boundaries:

1. **Server Components by Default:**
   - All page layouts, data fetches, editorial cards, and static marketing sections are React Server Components (RSC).
   - Server components fetch directly via Prisma with zero client-side waterfall requests.
2. **Push `"use client"` to the Leaves:**
   - Client components are strictly restricted to interactive leaf nodes:
     - Real-time Web Audio Synthesizer controls (`CubanRhythmSynth`).
     - Interactive video scrubbers and timecode trackers.
     - Modal dialogs, drawer menus, and filter toolbars.
3. **Optimistic Updates & Progressive Enhancement:**
   - Server Actions handle all state transitions, utilizing `revalidatePath` to trigger instant server cache invalidation.

---

## 3. Security Architecture & Threat Modeling

### A. IDOR (Insecure Direct Object Reference) Prevention
- Every transactional query checks ownership against the authenticated Clerk user (`session.userId`).
- Dancers cannot inspect, modify, or cancel tickets, bookings, or video submissions belonging to another user.
- Verified in `tests/unit/idor-ownership.test.ts`.

### B. Multi-Tenant Role Isolation & Privilege Escalation Guards
- Roles are strictly partitioned into `STUDENT`, `INSTRUCTOR`, and `ADMIN`.
- Server actions operating on studio finances, syllabus grading, or attendee check-ins verify the caller's role against the database (not client cookies or client headers).
- Verified in `tests/unit/auth-role-escalation.test.ts` and `tests/unit/management-actions-guard.test.ts`.

### C. Webhook Cryptographic Verification
- Clerk and Stripe webhooks require valid cryptographic signatures (`svix` and `stripe.webhooks.constructEvent`).
- Production builds explicitly fail if placeholder or missing webhook secrets are detected.
- Verified in `tests/unit/webhook-safeguards.test.ts`.

---

## 4. Real-Time Web Audio Engine (`CubanRhythmSynth`)

Instead of streaming bulky MP3 or WAV audio files over the network, RitmoFlow utilizes the browser's native **Web Audio API**:

- **Clave Sound Synthesis:** Generates high-frequency woodblock / clave resonant clicks using an `OscillatorNode` running through an exponential decay `GainNode`.
- **Zero Bandwidth Overhead:** Costs £0/month in bandwidth and operates 100% offline.
- **Microsecond Precision:** Leverages `AudioContext.currentTime` for sample-accurate metronome synchronization rather than jittery `setInterval` clocks.

---

## 5. Performance & Asset Budgeting

- **Zero Cumulative Layout Shift (CLS):** Every photographic asset is registered in `src/lib/media-manifest.ts` with explicit aspect ratios (`16/10`, `4/3`, `4/5`, `16/9`), preventing layout jumping while images stream in.
- **Component Size Budget:** Key interactive components must stay under 25KB to preserve rapid client bundle parsing. Monitored via `tests/unit/component-budget.test.ts`.
- **Automated Ergonomics Audit:** `scripts/visual-audit.mjs` enforces mobile touch targets (`>= 40px`), font-size discipline, and horizontal overflow checks across both desktop and mobile form factors.
