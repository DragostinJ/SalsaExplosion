# Salsa Explosion (RitmoFlow): Technical Decisions, Trade-Offs & Senior Interview Defense

This document is your master architectural briefing for technical interviews. It deconstructs every major technology choice, trade-off, security model, and data architecture decision made in the **Salsa Explosion (RitmoFlow)** codebase.

---

## 1. Executive Summary & Pitch (The 60-Second Answer)

> **"What is Salsa Explosion / RitmoFlow?"**
>
> "It is a production-grade dance academy operating system and event ticketing platform built for Bournemouth's premier Cuban Salsa school (led by Maestro Enrique Perez Valdes, a UK Lifetime Achievement Award winner). 
> 
> Unlike generic tutorial SaaS templates, it solves a real-world physical studio challenge: **bridging in-person cash/card door admissions (£12 / £14 pay-at-the-door) with online festival pass commerce, student syllabus skill progression, role-based operations (Dancers, Teachers, Admins), and a browser-native Web Audio API polyrhythmic clave trainer.**
> 
> It is built on Next.js 16 (App Router), TypeScript (zero `any`), Prisma ORM, Supabase PostgreSQL with PgBouncer connection pooling, Clerk v7 authentication, and Stripe. The system is verified by 230 Vitest unit/security tests, Playwright end-to-end testing, and an automated visual/ergonomic critic."

---

## 2. Core Stack Decisions & Architectural Trade-Offs

### A. Next.js 16 (App Router & Server Components) vs. SPA (React + Vite) or Pages Router

| Factor | Next.js 16 App Router (Chosen) | Client-Side SPA (Vite / CRA) | Next.js Pages Router (Legacy) |
| :--- | :--- | :--- | :--- |
| **SEO & Crawling** | **SSR/SSG**: Immediate crawlable HTML for festivals, class schedules, and Google rich results. | Poor initial indexability without SSR hydration plugins. | Strong SEO, but lacks nested layouts and server actions. |
| **Data Security** | DB queries run on the Node/Edge runtime. Connection strings and secrets never leak to the browser. | DB credentials cannot touch the client; requires a separate Express/Nest.js REST API. | Requires `getServerSideProps` boilerplate; code splitting is per-page rather than per-component. |
| **Bundle Size** | **Zero client JS for static sections** (hero banners, venue maps, history). `"use client"` pushed only to leaf nodes. | Entire React bundle + dependencies shipped to every mobile client on 3G/4G. | High client bundle weight due to hydration of entire page component trees. |
| **Mutations** | **Server Actions**: Direct type-safe RPCs with Zod schema validation; no REST endpoint boilerplate. | Requires setting up `fetch`/Axios calls, route handlers, and manual type syncing. | Requires `/api/*` endpoint handlers and manual serialization. |

#### Interview Question: *"Why did you use Next.js App Router instead of a separate React frontend + Express backend?"*
* **The Senior Answer:**
  "A monolithic Next.js App Router architecture eliminates the network and serialization overhead of maintaining a separate Node/Express backend. With React Server Components, components fetch data directly from Prisma on the server with zero client bundle footprint. 
  
  Furthermore, Server Actions provide end-to-end type safety between the UI form and the database mutation without needing OpenAPI/Swagger syncs or duplicate DTO schemas. Where dynamic interactivity was mandatory—such as the Web Audio clave synthesizer or the modal drawer—we pushed `"use client"` down to the absolute leaves of the component tree, keeping our Total Blocking Time (TBT) near zero."

---

## 2. Prisma ORM + PostgreSQL (Supabase) vs. Drizzle ORM vs. Pure SQL vs. MongoDB

| Dimension | Prisma ORM (Chosen) | Drizzle ORM | Raw SQL (`pg`) | MongoDB (NoSQL) |
| :--- | :--- | :--- | :--- | :--- |
| **Type Safety** | Auto-generates TypeScript types directly from `schema.prisma`. Catch schema mismatches at compile time. | Excellent type safety, but requires writing SQL-like TypeScript DSL. | Requires manual interface definitions or external tools (`pgtyped`). | Weak schema validation; runtime type drift is common. |
| **Relational Integrity** | Native foreign keys, cascade deletes, and transaction locks (`$transaction`). | Relational, but manual joins can get verbose. | Native, but high boilerplate for simple CRUD. | No foreign keys; requires denormalization or manual application-level joins. |
| **Developer Velocity** | Migrations, seeding, and introspection work out of the box with `prisma db push` and `prisma migrate`. | Fast, but migration tooling is less mature. | Slowest; manual SQL migration scripts. | Fast initially, catastrophic long-term for multi-tenant financial ledgers. |
| **Connection Pooling** | Integrated with **PgBouncer / Supavisor** using `?pgbouncer=true` and separate `DIRECT_URL`. | Lightweight query builder, minimal pooling overhead. | Lightweight, but requires manual pool connection management. | Connection-heavy, unsuited for transactional bookings. |

#### Trade-Off Acknowledgment:
"Prisma has a slightly heavier query-engine overhead compared to Drizzle or Kysely. However, in our domain—where students, class sessions, attendance check-ins, event bookings, and audit logs are deeply relational—Prisma's strict declarative schema, zero-boilerplate relations, and migration tooling outweighed raw microsecond latency differences. To prevent connection exhaustion in serverless environments, we routed all transactional traffic through Supabase's PgBouncer pooler while preserving `DIRECT_URL` for schema migrations."

---

## 3. Clerk Authentication vs. NextAuth / Auth.js vs. Supabase Auth

* **Why Clerk?**
  1. **Turnkey Multi-Role RBAC:** Supports user public/private metadata for role assignments (`DANCER`, `TEACHER`, `OWNER`) without managing JWT cookie encryption or refresh token rotation manually.
  2. **Security Hardening:** Enterprise session management, active session revocation, device fingerprinting, and bot protection probes out of the box.
  3. **Webhook Reconciliation:** Synchronizes user registration, role updates, and deletions via cryptographic Svix signatures (`api/webhooks/clerk`).
* **The Trade-Off & Defense:**
  - *Vendor Lock-in & Third-Party Outages:* If Clerk has an outage or rate limit, your application could fail.
  - *Our Architectural Solution:* We implemented a **Fail-Soft User Provisioning Guard** (`src/lib/auth-user.ts`). If the Clerk API experiences transient rate limits or latency during sign-in, our database-level fallback handler provisions or retrieves the user record safely from PostgreSQL without throwing an unhandled 500 exception.

---

## 4. Stripe Checkout vs. Custom Embedded Elements

* **The Business Context:**
  - Weekly Thursday/Sunday studio classes are strictly **£12 / £14 pay-at-the-door** (cash/card on arrival).
  - Online checkout is reserved **exclusively** for high-ticket Festival Passes and Congress Weekenders (*Made in Cuba 2026*, *Halloween Party*).
* **Why Hosted Stripe Checkout Sessions?**
  1. **Zero PCI-DSS Compliance Burden:** Credit card numbers never touch our servers or client DOM.
  2. **Mobile Payment Optimization:** Native Apple Pay and Google Pay support without extra client bundle overhead.
  3. **Idempotency & Webhook Verification:** Payment completion is confirmed asynchronously via `api/webhooks/stripe` with raw body signature verification, preventing double-ticketing even if the user closes their browser before the redirect returns.

---

## 5. Real-Time Web Audio API & Telemetry Engine (`/music`)

This is your flagship technical differentiator. Most junior portfolios show generic CRUD apps. You built a **browser-native polyrhythmic synthesizer and bi-directional video telemetry engine**.

```mermaid
flowchart LR
    YouTube["YouTube IFrame Player"] -->|Timecode Pulse (250ms)| Controller["Sync Controller"]
    Controller -->|Active Segment ID| Store["Zustand / State Store"]
    Store -->|Gear Shift / Hand Signals| HUD["Dancer Telemetry HUD"]
    Store -->|Clave Polarity (2-3 vs 3-2)| Synth["Web Audio API Engine (CubanRhythmSynth)"]
    Synth -->|OscillatorNode + GainNode| AudioContext["AudioContext Destination (Speakers)"]
```

### Key Technical Talking Points:
1. **Zero-Asset Web Audio Synthesis:**
   - Instead of streaming large `.mp3` or `.wav` samples over the network (£0/month asset bandwidth), the sound of the Cuban *Clave* and *Cowbell* (Campana) is synthesized mathematically in real-time.
   - We instantiate native `OscillatorNode` instances (tuned between 800Hz and 2200Hz) combined with rapid exponential decay `GainNode` envelopes (`gain.exponentialRampToValueAtTime(0.001, endTime)`).
2. **Bi-Directional Video Telemetry:**
   - Reads YouTube timecodes and matches them against our curated song progression map (`src/lib/constants/timba-song-anatomy.ts`).
   - Automatically switches gears (*Introducción* -> *Cuerpo* -> *Montuno* -> *Mambo* -> *Despelote*) and displays:
     - **3-Zone Body Telemetry:** Real-time physiological coaching cues for **Chest** (contra-body isolation), **Hips** (weight transfer), and **Feet** (guapea/casino timing).
     - **Havana Caller Hand Signals:** Displays exact hand gestures used by Rueda callers in Cuba (finger counts, ear tugs, hand rotations).
3. **`100dvh` Viewport Discipline:**
   - Implemented a strict zero-scroll mobile viewport using dynamic viewport units (`100dvh`). Mobile dancers can prop their phone on a dance studio speaker and train without the player jumping or scrolling out of reach.

---

## 6. Multi-Tenant Security & Threat Modeling

Interviewers love testing candidates on security edge cases:

### A. Insecure Direct Object References (IDOR)
* **The Vulnerability:** A malicious dancer modifies the ticket ID in a URL or server action to access another student's QR pass or cancel their booking.
* **Our Defense:** All server actions check tenancy and ownership against the authenticated user's session:
  ```typescript
  // Example IDOR Guard Pattern
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: authenticatedUser.id, // Strictly scoped to session
    },
  });
  if (!booking) throw new Error("Unauthorized or booking not found");
  ```
* **Verification:** Validated by `tests/unit/idor-ownership.test.ts`.

### B. Role Escalation Prevention
* **The Vulnerability:** A standard dancer attempts to execute owner-level administrative actions (e.g., editing class schedules or viewing revenue analytics).
* **Our Defense:** Server actions verify `role === "OWNER"` on the server before executing mutations. The client-side demo role switcher is locked out in production using the environment guard `ALLOW_DEMO_ROLE_SWITCHING=false`.
* **Verification:** Validated by `tests/unit/auth-role-escalation.test.ts`.

### C. Webhook Secret Hygiene
* **The Vulnerability:** An application starts in production with missing or dummy placeholder webhook secrets, allowing attackers to forge payment events.
* **Our Defense:** Startup guards verify that `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` are not null or dummy strings, throwing an immediate error in production if misconfigured.
* **Verification:** Validated by `tests/unit/webhook-safeguards.test.ts`.

---

## 7. UI/UX & Automated Visual Critic (`scripts/visual-audit.mjs`)

### The In-Tree Playwright Visual Critic
We built an automated visual and ergonomic critic script (`scripts/visual-audit.mjs`) that inspects both Desktop (`1440x900`) and Mobile (`390x844`) captures:

1. **Typography Entropy:** Evaluates computed font sizes across headings, paragraphs, and buttons. Flags routes exceeding 9 distinct sizes to preserve editorial discipline.
2. **Horizontal Overflow Guard:** Programmatically verifies `scrollWidth === innerWidth` on mobile viewports to prevent awkward side-scrolling.
3. **Touch Target Ergonomics:** Detects interactive elements smaller than the 40px mobile thumb comfort standard (`min-h-[40px]`).
4. **Zero Cumulative Layout Shift (CLS):** Uses a centralized media manifest (`src/lib/media-manifest.ts`) with fixed aspect ratios and responsive sizing rules.
5. **Obsidian Canvas Palette:** Replaces generic SaaS greys with an arts-gallery aesthetic inspired by *The Place* London Contemporary Dance School:
   - Obsidian Canvas: `#080706`
   - Warm Ivory: `#F5F2EB`
   - Havana Crimson: `#DC2626`
   - Subtle Amber: `#F59E0B`

---

## 8. Top 10 Technical Interview Questions & Model Answers

### Q1: "How do you handle multi-tenant data isolation?"
> "Every entity in our Prisma schema that belongs to a student or workspace contains a foreign key to the tenant or user. In Server Actions and API queries, we never query by resource ID alone; every query enforces a compound predicate: `where: { id: resourceId, userId: currentUser.id }`. We backed this with automated Vitest suites (`idor-ownership.test.ts`) that attempt cross-user deletions and assert that HTTP 403 / unauthorized errors are returned."

### Q2: "What is your strategy for state management between Server and Client Components?"
> "We minimize client state. Data fetching, pagination, and sorting parameters are driven by URL search params, allowing the server to handle rendering and caching cleanly. Where interactive client state was required—such as the real-time audio playback scrubber, active clave polarity, and mobile drawer toggles—we used lightweight React state and custom hooks scoped strictly to leaf components. This eliminates global state bloat like unnecessary Redux stores."

### Q3: "How does the Stripe webhook handle race conditions?"
> "When a customer finishes checkout, the browser redirects to a success page, but the source of truth is always the asynchronous Stripe webhook (`checkout.session.completed`). The webhook validates the raw cryptographic signature using Svix/Stripe SDK. In the database, we handle the fulfillment inside an atomic Prisma `$transaction`. We check if the booking has already been marked as `PAID`. If so, we safely exit idempotently, preventing duplicate tickets or double confirmation emails."

### Q4: "Why use Web Audio API instead of playing an MP3 audio file?"
> "Latency and asset overhead. An MP3 audio file requires an HTTP fetch, memory decoding, and suffers from mobile audio playback lag. For a polyrhythmic dance trainer where dancers need instant, sub-millisecond beat synchronization, the Web Audio API provides hardware-accelerated oscillators. We synthesize clave wood-block clicks and cowbell resonances directly in the browser with zero network transfer and zero audio asset hosting costs."

### Q5: "How do you prevent database connection pool exhaustion in Next.js on Vercel?"
> "Serverless functions spin up and down dynamically, which can quickly saturate PostgreSQL's default connection limits. To solve this, we configured Supabase with PgBouncer connection pooling using transaction mode on port 6543 (`?pgbouncer=true`). For Prisma schema migrations (`prisma migrate`), which require session-level locking, we maintain a separate `DIRECT_URL` pointing directly to port 5432."

### Q6: "How did you ensure zero Cumulative Layout Shift (CLS) with dynamic images?"
> "We created a centralized `media-manifest.ts` file that serves as a single source of truth for all photography. Every image has predefined aspect ratios (e.g., `aspect-[16/10]`, `aspect-[4/5]`) and responsive `sizes` attributes mapped to Tailwind breakpoints. Next.js `<Image>` containers reserve DOM dimensions before the image bytes download, preventing layout shifts when slow networks hydrate."

### Q7: "What is Content Security Policy (CSP) and why did you configure it?"
> "CSP is an HTTP response header that restricts the resources (scripts, styles, connections, iframes) the browser is allowed to load for a given page, mitigating Cross-Site Scripting (XSS) and clickjacking. We configured strict directives in `next.config.ts`, restricting script execution to approved domains (Vercel, Clerk, Stripe, YouTube) and explicitly whitelisting Clerk's bot detection endpoints across specialized ports (`:8443`, `:18443`, `:2082`, `:992`) to keep production telemetry clean."

### Q8: "How do you test your application?"
> "We employ a three-tier testing strategy:
> 1. **Unit & Security Layer (Vitest, 230 tests):** Fast in-memory tests verifying business logic invariants, RBAC authorization boundaries, IDOR ownership checks, and secret hygiene.
> 2. **Integration / Build Layer:** TypeScript strict compilation (`tsc --noEmit`) and Next.js production build optimizing all 36 routes.
> 3. **Visual & Ergonomics Layer (Playwright):** Automated multi-viewport audits checking mobile touch targets (>= 40px), font scale consistency, unclipped headers, and zero horizontal scroll overflow."

### Q9: "Why not use microservices for this project?"
> "For this scale and operational rhythm, microservices would introduce distributed systems complexity (network latency, eventual consistency, distributed tracing, and high hosting bills) without tangible benefit. A modular monolith built with Next.js App Router and Prisma gives us strong domain boundaries, atomic database transactions, and unified deployment on Vercel with zero DevOps maintenance overhead for the client."

### Q10: "If the client's traffic increased 50x tomorrow, what would you optimize first?"
> "First, we would leverage Next.js Incremental Static Regeneration (ISR) and Edge caching for public routes (`/`, `/events`, `/dashboard/schedule`), serving pre-rendered HTML from Vercel's global CDN. Second, we would add an Upstash Redis caching layer in front of repetitive database queries (like teacher rosters and venue specs). Third, we would scale the Supabase compute instance and increase PgBouncer pool sizes."
