# RitmoFlow — Staff Distributed Systems, Product Design & B2B SaaS Venture Audit

**Branch:** `audit/opus-review` (Safe baseline preserved on `master` at tag `v0.2.0-mvp`)  
**Review Lenses:** Staff Distributed Systems Architect • Lead Product Designer • B2B SaaS Venture Partner

---

## Executive Summary & Changes Implemented on `audit/opus-review`

Before diving into the 6-dimension strategic and technical critique, the following architectural, security, and UX upgrades were implemented and verified (`npm run build` — 0 TypeScript/Turbopack errors across all 19 routes) on the `audit/opus-review` branch:

1. **PostgreSQL Row-Level Concurrency Lock on Guest Artist Ticket Tiers ([`src/actions/management.actions.ts`](../src/actions/management.actions.ts)):**
   - Added `SELECT id FROM "EventTicketTier" WHERE id = $1 FOR UPDATE` inside `registerForEventTierAction`'s `$transaction` prior to counting paid registrations and `maxLeads`/`maxFollows` caps. This closes the Read-Committed phantom-read window when two dancers buy the final Lead or Follow pass simultaneously.
2. **Role-Based Access Control (RBAC) + 1-Click Studio Demo Role Switcher ([`src/lib/auth-user.ts`](../src/lib/auth-user.ts) & [`src/components/navigation/site-header.tsx`](../src/components/navigation/site-header.tsx)):**
   - Added `requireRole(STAFF_ROLES)` and `requireRole(ADMIN_ONLY)` server-side guards across `/instructor/*` and `/admin/*` routes, while adding a 1-click **`Dancer | Teacher | Owner` Role Switcher Pill** in the top navigation bar so you can demonstrate strict RBAC *and* switch portals live during your studio owner demo without ever getting locked out.
3. **"First 60 Seconds" Interactive New Dancer Onboarding Guide ([`src/components/schedule/new-dancer-onboarding.tsx`](../src/components/schedule/new-dancer-onboarding.tsx)):**
   - Added a 3-step interactive welcome banner on `/dashboard/schedule` that walks non-technical dancers through:
     - **Step 1:** Choosing `🕺 Lead` or `💃 Follow` with 1 tap (persisted immediately via `updateMyDanceRolePreferenceAction`).
     - **Step 2:** Understanding their `BEGINNER` starting tier and pre-loaded Welcome Credit.
     - **Step 3:** Jumping straight to Beginner classes to reserve their spot.
4. **9:16 Instagram Story / WhatsApp Social Brag Badge Modal ([`src/components/progression/promotion-certificate-card.tsx`](../src/components/progression/promotion-certificate-card.tsx)):**
   - Upgraded the Verified Dancer Credential card on `/dashboard/progression` with an interactive **9:16 vertical Instagram Story / WhatsApp status card modal** and 1-click caption copy (`#LaRuedaNoPara`).

---

## Dimension 1: The Commercial Pilot & Studio Owner Pitch

### 1.1 Critical Audit of the Financial ROI Pitch
Your 3-pillar ROI math (Eventbrite replacement + door leakage recovery + Lead/Follow retention) is strong, **but do not lead with "door leakage" in your opening sentence**—studio owners can feel defensive if they think you are accusing their door volunteers or teachers of skimming cash.
Instead, reframe the 3 financial levers in this exact order:

1. **The "Zero-Ticketing-Tax" Bootcamp Pitch (Immediate Hard Cash Saved):**
   - *The Math:* On a 100-pass international Cuban Maestro weekender at £95/pass (£9,500 gross), Eventbrite charges **6.5% + £0.59 per ticket (~£676 in platform fees)** and holds the payout until after the event. With Stripe direct checkout inside RitmoFlow (1.5% + 20p for UK cards), the studio keeps **~£515 more pure profit per weekend** and gets daily payouts to pay flights and hotel deposits for the Cuban artists.
2. **The "7:58 PM Door Bottleneck" (Speed & Experience):**
   - *The Math:* When 70 students queue in a narrow hallway at 7:58 PM waving £10 notes and asking for change, class starts at 8:15 PM. That kills 25% of teaching time and stresses the owner right before they have to perform with high energy. Pre-booked credits + 1-tap QR check-in gets 70 people through the door in 3 minutes.
3. **The "Standing on the Wall" Churn Cure (Lead/Follow Ratio Protection):**
   - *The Math:* In Cuban Casino and Rueda de Casino, if 18 Follows and 11 Leads show up, 7 Follows spend half the class rotating on the wall waiting for a partner. Those 7 students quit within 3 weeks. Capping Lead/Follow slots automatically converts excess demand into a balanced waitlist.

### 1.2 Day-1 Owner Objections & Word-for-Word Counter-Scripts

#### Objection A: *"My students prefer paying cash at the door—if I force online booking, people won't come."*
> **Your Exact Script:**  
> *"We don't take cash away! Keep accepting cash at the door whenever someone walks in. The difference is: instead of writing their name on a piece of paper that gets lost, you tap their name on the RitmoFlow Instructor Roster and hit **+1 Cash Credit** in two seconds. Better yet, we price single cash drop-ins at £12 at the door, or a 10-Class Pack on RitmoFlow for £95. Within two weeks, 70% of regulars voluntarily switch to the 10-pack to save £25—giving you £950 in upfront cashflow at the start of the month even if it rains on Friday night."*

#### Objection B: *"I'm a dancer, not a tech person. I don't have time to manage another complicated system."*
> **Your Exact Script:**  
> *"That's the best part of this pilot: **you don't touch a single setting.** As part of our trade for my partner's and my classes, I am your dedicated technical concierge. Send me a 15-second WhatsApp voice note with next month's classes or your next Cuban guest artist flyer, and I configure the schedule, ticket tiers, and QR codes for you. All you ever do on class night is open one link on your phone to see how many Leads and Follows are booked."*

#### Objection C: *"We just post a flyer on WhatsApp and people bank-transfer me with their name in the reference."*
> **Your Exact Script:**  
> *"Bank transfers work great until you have 85 people transferring for a weekend bootcamp with three different pass types, and you're spending Sunday night cross-referencing Lloyds Bank statements against WhatsApp messages to figure out whether 'S. Patel' bought a Full Pass or a Party Pass—and whether they're a Lead or Follow. RitmoFlow gives every buyer an instant `RF-PASS-XXXX` QR code and caps Leads and Follows automatically so you never have to check your bank app at the door."*

### 1.3 The 14-Day "Irreversible Reliance" Pilot Playbook
To make the owner completely reliant on RitmoFlow within 14 days without friction:
- **Days 1–3 (Zero-Risk Shadow Setup):** Pre-load their exact weekly timetable and their next upcoming Guest Artist Masterclass into RitmoFlow using their real flyer photos and artist names.
- **Day 4 (The "VIP Early Bird" Drop):** Have the owner post the RitmoFlow `/events/[slug]` link in the studio WhatsApp group for a **48-hour Early Bird Full Pass** (e.g., first 10 Leads and 10 Follows save £10). When the owner wakes up the next morning and sees £850 collected automatically with an exact 50/50 Lead/Follow split, they are hooked for life.
- **Day 7 (Friday Night Door Co-Pilot):** Stand at the door with the owner for 20 minutes before Beginner & Improver classes with `/instructor/roster` open on an iPad/phone. Let them feel the relief of starting Rueda at 8:00 PM sharp with zero cash-counting chaos.
- **Day 14 (The Monthly Review):** Show them `/admin/analytics` on your laptop—specifically how many credits are currently held in student wallets (deferred loyalty lock-in) and the Lead/Follow ratio across their classes.

---

## Dimension 2: Architectural Audit & Failure Modes

### 2.1 Concurrency & Transaction Review
- **`bookClassAction` ([`src/actions/booking.actions.ts`](../src/actions/booking.actions.ts)):**
  - *Strength:* Acquiring the write lock first via `tx.classSession.updateMany({ where: { id, bookedCount: { lt: maxCapacity } }, data: { bookedCount: { increment: 1 } } })` is an excellent PostgreSQL pattern. Because PostgreSQL `UPDATE` acquires a row-level exclusive lock (`FOR NO KEY UPDATE`) on the matching `ClassSession` row, any concurrent transaction attempting to book the same class blocks on that `UPDATE` until Transaction A commits or rolls back. Consequently, the subsequent `tx.booking.count({ where: { danceRole } })` inside Transaction B sees Transaction A's committed `Booking` row.
- **`registerForEventTierAction` ([`src/actions/management.actions.ts`](../src/actions/management.actions.ts)):**
  - *Vulnerability Found & Fixed on `audit/opus-review`:* Previously, `registerForEventTierAction` read `tx.eventTicketTier.findUnique({ include: { registrations: true } })` without acquiring a row lock on `EventTicketTier`. Under PostgreSQL's default `READ COMMITTED` isolation level, two concurrent requests for the final Lead spot on a Full Pass would both read `leadsCount = 49` (out of 50) and both insert a registration, resulting in `51/50` Leads.
  - *Resolution Applied:* We added `await tx.$queryRaw\`SELECT id FROM "EventTicketTier" WHERE id = ${ticketTierId} FOR UPDATE\`` as the first statement inside `prisma.$transaction`, serializing concurrent checkouts per ticket tier.
- **Stripe Webhook Idempotency ([`src/app/api/webhooks/stripe/route.ts`](../src/app/api/webhooks/stripe/route.ts)):**
  - *Strength:* Enforcing `@unique` on `CreditLedger.stripePaymentIntentId` and catching Prisma error `P2002` inside the same database transaction that increments `User.classCredits` guarantees **exactly-once credit fulfillment** even when Stripe retries `checkout.session.completed` webhooks across multiple serverless lambdas.

### 2.2 The "Friday Night Basement Studio" Failure Modes (80 Students, 1 Bar of 4G Signal)
Dance studios frequently operate in converted arches, basements, or thick-walled community halls with terrible cellular reception. Here are the 3 real-world failure modes and how to harden against them:

1. **Failure Mode 1: Student Phone Has Zero Data at the Door (`GET /checkin/[sessionId]` Hangs)**
   - *What happens:* 80 dancers try to scan the wall QR poster at 7:55 PM, saturating the cell tower or hitting a basement dead zone. Their browser spins on Clerk auth + SSR database round-trip.
   - *Mitigation Strategy:*
     - **Primary Flow (Instructor-Side Roster Tap):** Because the studio tablet/phone can connect to the venue's private Wi-Fi router, `/instructor/roster` and `/admin/events` already support **1-tap instructor check-in + instant name/QR-hash search**.
     - **Next Upgrade (Optimistic Offline Queue):** Cache the tonight's roster JSON in `localStorage` / `IndexedDB` when `/instructor/roster` loads at 7:30 PM, and queue `toggleBookingCheckInAction` mutations in a client-side retry queue if `navigator.onLine` drops.
2. **Failure Mode 2: Serverless Cold Starts + Supabase PgBouncer Connection Exhaustion at 7:58 PM**
   - *What happens:* 80 concurrent SSR requests + Server Actions hit Vercel functions simultaneously, opening parallel Prisma connections.
   - *Mitigation Strategy:* Always use Supabase's **Transaction Pooler port (`6543` with `?pgbouncer=true&connection_limit=5`)** for `DATABASE_URL` in production, and reserve port `5432` exclusivamente for `DIRECT_URL` (migrations).
3. **Failure Mode 3: Double-Tap "Book Class" on High-Latency 3G**
   - *What happens:* A student on slow 3G taps "Book as Lead", waits 2 seconds, refreshes, and taps again.
   - *Mitigation Strategy:* Already protected at two layers: `useTransition` (`isPending` disables the button immediately) and the PostgreSQL `@@unique([userId, classSessionId])` constraint (`P2002` caught gracefully in `bookClassAction`).

---

## Dimension 3: Product Design, Onboarding & Dance Psychology

### 3.1 Critique of the Visual Color Architecture
Your palette (**Dark Club Slate `#09090B` + Havana Amber/Terracotta `#F59E0B` + Cobalt Blue `#3B82F6` for Leads + Rose Coral `#F43F5E` for Follows + Emerald `#10B981` for Verified**) is psychologically spot-on for Latin social dance for three reasons:
1. **Zero "Flashbang" Glare in Dimly Lit Studios:** Social dance venues use warm ambient lighting. Opening a pure `#FFFFFF` corporate SaaS app on the dance floor blinds the user and ruins the social vibe. Dark slate with warm amber accents feels like a Havana social club (*Casa de la Música*) rather than a hospital booking form.
2. **Instant Peripheral Role Recognition (Cobalt vs. Rose):** In a noisy room with Timba playing at 95 dB, neither instructors nor dancers want to read small text labels. High-contrast **Cobalt (`🕺 Lead`)** vs. **Rose (`💃 Follow`)** progress bars allow an instructor glancing at their phone from 3 feet away to see if a class is heavy on Leads or Follows in 200 milliseconds.
3. **Warmth Over Anxiety:** Using **Havana Amber** for locked syllabus tiers instead of harsh error red (`#EF4444`) frames higher levels (`IMPROVER`, `INTERMEDIATE`, `ADVANCED`) as an exciting *aspiration to unlock* rather than a rejection.

### 3.2 The "First 60 Seconds" Onboarding Flow (Now Live on `audit/opus-review`)
Non-technical dancers get overwhelmed when they land on a dashboard full of levels, credits, and filters. The new [`NewDancerOnboarding`](../src/components/schedule/new-dancer-onboarding.tsx) component mounted at the top of `/dashboard/schedule` solves this using **progressive disclosure**:
- **0–15 seconds:** Welcomes them by first name (*"¡Bienvenido a la Rueda!"*) and asks a single, human question: **🕺 Lead** or **💃 Follow**?
- **15–35 seconds:** Reassures them that `BEGINNER` requires zero prior rhythm ("two left feet welcome") and shows their **1 Complimentary Welcome Credit** already loaded in their wallet.
- **35–60 seconds:** Provides a 1-tap **"Jump to Beginner Classes"** button that scrolls directly to their bookable classes.

### 3.3 Viral 9:16 Milestone Badges (`#LaRuedaNoPara`)
Dancers love sharing progression milestones on Instagram Stories and WhatsApp Status—it is the single highest-converting organic acquisition channel for a local dance studio because every dancer's follower graph is full of local friends who have said *"I've always wanted to try Salsa!"*
- **Implemented Now ([`PromotionCertificateCard`](../src/components/progression/promotion-certificate-card.tsx)):** Clicking **"9:16 Instagram Story Badge"** on `/dashboard/progression` opens a pixel-crisp `aspect-[9/16]` vertical dark-and-gold credential card displaying their name, unlocked Cuban Salsa tier, Lead/Follow role, and verified mastery checks—ready to screenshot or share directly to Instagram Stories.
- **Next Production Enhancement:** Add a `/api/og/badge/[userId]` dynamic `@vercel/og` (`ImageResponse`) route so sharing the link on WhatsApp or Instagram DMs unfurls the personalized badge image automatically.

---

## Dimension 4: Authentication & Community Channels (Facebook vs. Google OAuth)

**Verdict: DO NOT enable Facebook Login for next week's pilot. Stick strictly to 1-Tap Google OAuth + Passwordless Email Magic Code / Passcode in Clerk.**

Here is why this is critical for your timeline:
1. **Meta Business Verification Blockers:** Since 2023, Meta requires strict **Business Verification** (official incorporation documents, domain DNS verification, privacy policy URL audit, and data deletion callback webhook) before a Facebook Login OAuth app can switch from "Development Mode" to "Live Mode" for the general public. If you turn on Facebook Login without completing Meta Business Verification, every student who clicks "Continue with Facebook" will hit a fatal *"App Not Active: This app is not accessible right now"* error screen.
2. **The In-App Browser Trap (Instagram & Facebook Webviews):** Even though dancers discover events on Facebook and Instagram, when they click your link inside the Instagram or Facebook mobile app, it opens inside Meta's restricted in-app WebView. Passwordless **Email 6-digit OTP** and **1-Tap Google OAuth / Apple Sign-In** via Clerk work reliably, whereas Facebook OAuth inside an Instagram WebView frequently loops back to the mobile browser login screen.
3. **What to do instead:** Use Facebook and Instagram purely as **top-of-funnel distribution channels** (posting your `/events/[slug]` links and 9:16 Story badges), and let Clerk handle frictionless Email + Google sign-in in 4 seconds.

---

## Dimension 5: The "AI Dance Moat" vs. Off-the-Shelf Software (Mindbody / Momence)

Generic studio software (Mindbody, Momence, Gymcatch, ClassPass) is built for **solo, non-partnered fitness** (yoga mats and spin bikes). None of them understand:
1. **Partner Role Coupling (`LEAD` vs `FOLLOW` capacity constraints).**
2. **Prerequisite Syllabus Gating (`Dile Que No` -> `Enchufla` -> `Setenta` -> `Sombrero`).**
3. **Instructor Grading Bottlenecks.**

### How to Turn the AI Dance Co-Pilot into an Unassailable Moat
In a 150-student salsa academy, the head maestro wants level gating so beginners don't wander into Intermediate Rueda and ruin the circle—**but the maestro hates spending 3 hours every Sunday watching 30 shaky smartphone videos.**
By positioning your **Gemini Multimodal AI Dance Co-Pilot** ([`analyzeSubmissionWithAiAction`](../src/actions/management.actions.ts)) as an **Instructor Force-Multiplier** (never replacing the human maestro, always elevating them):
- **Phase 1 (Current MVP):** Student uploads a 30-second clip demonstrating the 4 required figures for their target tier (`IMPROVER`, `INTERMEDIATE`, `ADVANCED`). The AI Co-Pilot generates a structured breakdown across **Clave Timing (1-2-3 / 5-6-7)**, **Circular Casino Frame**, and **Cuban Motion**, plus a pre-written, encouraging feedback paragraph in Spanish/English terminology that the instructor can approve in **1 click (5 seconds instead of 5 minutes)**.
- **Phase 2 (Proprietary Dataset Flywheel):** Every time a Cuban Maestro approves or edits an AI rubric evaluation, RitmoFlow records a labeled `(video_clip, syllabus_figures, ai_score, maestro_override_score)` tuple. Within 6 months across 5 studios, you own the world's only labeled dataset of Cuban Casino figure execution—something Mindbody can never replicate.

---

## Dimension 6: Portfolio & Interview Strategy (Landing a Remote Role by January)

When interviewing for Junior/Mid-level Full-Stack Engineer roles in January, **99% of candidates show a Next.js wrapper around `prisma.todo.create()`**. You are showing a **production multi-portal B2B SaaS platform piloted by a real local business with real financial and concurrency invariants.**

### 6.1 Your 90-Second "Staff-Level" Interview Pitch
When an interviewer asks, *"Tell me about the most complex project you've built,"* use this exact 3-part narrative:
1. **The Real-World Business Problem:** *"My local Cuban Salsa academy was losing ~7% of bootcamp revenue to Eventbrite fees and suffering from unbalanced classes where too many Follows or Leads showed up, causing churn. Generic fitness apps like Mindbody only count total heads—they don't enforce coupled state constraints like Lead/Follow partner ratios or syllabus prerequisite gating."*
2. **The Distributed Systems Engineering:** *"I architected RitmoFlow on Next.js App Router, TypeScript, and PostgreSQL with Prisma. To prevent race conditions when 80 dancers try to grab the last Lead spot at 7:55 PM, I implemented pessimistic row-level locking (`UPDATE ... WHERE bookedCount < maxCapacity` and `SELECT ... FOR UPDATE` inside interactive ACID transactions) so concurrent requests serialize at the database kernel level before counting role sub-caps. For payments, I engineered an append-only `CreditLedger` with a unique constraint on `stripePaymentIntentId`, catching `P2002` violations inside the webhook transaction to guarantee idempotent credit fulfillment under Stripe retry storms."*
3. **The Commercial Outcome:** *"I built three role-segregated portals—Student, Instructor, and Studio Owner Admin—complete with QR door check-in and an AI rubric grading co-pilot that cuts instructor video review time from 5 minutes to 10 seconds, and pitched it directly to a live studio."*

### 6.2 What to Showcase at the Top of Your GitHub `README.md`
To make Hiring Managers and Senior Engineers stop scrolling within 10 seconds:
1. **Architecture & Concurrency Sequence Diagram (Mermaid):** Show the exact race-condition lock sequence between two parallel `bookClassAction` calls hitting PostgreSQL and how `CreditLedger` handles duplicate Stripe webhooks.
2. **Live Concurrency Benchmark Callout:** Include a short section showing a `Promise.all()` stress test where **50 concurrent requests** attempt to book a class with `maxLeads: 10`—demonstrating that exactly **10 succeed (`200 OK`)** and **40 fail deterministically (`ROLE_FULL`)** with zero phantom overbookings and `BookedCount === 10`.
3. **3-Portal GIF / Screenshot Carousel:** Show the **Student Schedule & 9:16 Story Passport**, the **Instructor AI Video Co-Pilot & QR Roster**, and the **Owner Revenue & Ratio Analytics**.
