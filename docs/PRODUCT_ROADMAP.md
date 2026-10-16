# RitmoFlow Product Roadmap & Commercial Strategy

## 1. Executive Summary & Value Proposition
RitmoFlow is an all-in-one operating system engineered specifically for dance academies, social dance communities, and masterclass organizers, starting with Cuban Salsa (Casino & Rueda de Casino).

Unlike generic tools (Mindbody, Momence, Eventbrite), RitmoFlow solves dance-specific problems:
1. **Dynamic Lead/Follow Capacity Balancing:** Prevents gender/role imbalances that ruin dance classes.
2. **High-Ticket Guest Artist & Workshop Ticketing:** Tiered ticketing (Full Pass, Party Pass, VIP Masterclass) with zero Eventbrite gouging.
3. **Structured Cuban Salsa Syllabus Progression:** Video submission assessments verified by instructors.
4. **Frictionless QR Attendance:** Fast door check-ins with automated payment fallback.

---

## 2. The Financial Pitch for the Studio Owner
When pitching to the first dance studio owner, present the **hard financial ROI**:

### Revenue Bleed #1: "Pay at the Door" Cash Leakage
* **Problem:** 15–20% of drop-in students promise to transfer money via bank app or pay next time, and forget. Cash collected at the door is prone to miscounting or theft.
* **RitmoFlow Solution:** Upfront frictionless booking (Apple Pay / Google Pay / Card via Stripe). Zero unpaid walk-ins.
* **Financial Impact:** Recovers £300 – £800/month in previously uncollected class fees.

### Revenue Bleed #2: Eventbrite Ticketing Fees for International Guest Artists
* **Problem:** When the studio brings international artists for a 2-day bootcamp, Eventbrite charges **~6.5% + £0.59 per ticket**.
  * On a £10,000 weekend bootcamp (100 passes @ £100), Eventbrite takes **£709+** right off the top.
* **RitmoFlow Solution:** Native Stripe processing (only ~1.5% + 20p UK card fee).
* **Financial Impact:** Puts an extra **£500 – £700 directly into the owner's pocket** on every single international artist event.

### Revenue Bleed #3: The Lead/Follow Student Churn
* **Problem:** Classes with 15 Follows and 4 Leads cause frustration. Unmatched dancers spend half the class sitting on the sidelines, leading to high drop-out rates after 3 weeks.
* **RitmoFlow Solution:** Concurrency-safe role caps. If Follow spots are full, additional Follows are waitlisted until more Leads register.
* **Financial Impact:** Dramatically improves 90-day student retention, increasing Lifetime Value (LTV).

---

## 3. High-Ticket Event Engine Architecture (International Workshops)
For large events, workshops, and multi-day masterclasses:

### Data Model Requirements:
* `Event`: `title`, `description`, `slug`, `startDate`, `endDate`, `venueAddress`, `coverImageUrl`, `guestInstructors` (array of artist names/bios).
* `EventTicketTier`: `name` (e.g., "Full Pass", "Early Bird", "Saturday Bootcamp Only", "Sunday Party Only"), `priceInCents`, `totalCapacity`, `maxLeads`, `maxFollows`, `salesEndAt`.
* `EventOrder`: Linked to `User`, `StripeSessionId`, `amountPaid`, `qrVerificationHash`, `status` (`CONFIRMED`, `REFUNDED`, `CHECKED_IN`).

### Check-in Flow at the Venue:
1. Student buys pass on RitmoFlow -> Receives email with Apple Wallet / Google Wallet compatible QR pass.
2. Door volunteer opens `/events/[id]/scanner` on mobile.
3. Scans QR in 1 second -> Screen flashes green ("FULL PASS - LEAD - PAID").
4. Door speed: 150 people checked in under 15 minutes.

---

## 4. 4-Week Phased Milestones

### Phase 1: Local Studio Validation (Completed)
- [x] Next.js 16 App Router + Turbopack foundation
- [x] Lead/Follow capacity row locks (`booking.actions.ts`)
- [x] Supabase Storage private video upload pipeline
- [x] Stripe Checkout & Webhook credit ledger idempotency
- [x] Universal 3-Portal Navigation (`SiteHeader`, `InstructorNav`, `AdminNav`, `BackButton`)
- [x] Mobile QR Attendance Check-in & Live Roster for weekly classes (`/instructor/roster` & `/checkin/[sessionId]`)
- [x] Instructor Student Progression & Credit Directory (`/instructor/students`)
- [x] Studio Owner Executive Dashboard (Revenue, Attendance counts, Lead/Follow ratios, Syllabus funnel at `/admin/analytics`)
- [x] Weekly Class Schedule Manager (`/admin/classes`)

### Phase 2: International Event & Workshop Ticketing Engine (Completed)
- [x] Schema extensions: `Event`, `EventTicketTier`, `EventRegistration`
- [x] Public Event Landing Page with guest artist showcase (`/events` & `/events/[slug]`)
- [x] Multi-tier ticket selector with real-time Lead/Follow capacity countdown & instant QR pass generation (`EventPassSelector`)
- [x] Door volunteer mobile QR scanner & Event Creator (`/admin/events`)

### Phase 3: AI Video Grading Co-Pilot & Viral Flywheel (Completed)
- [x] AI Dance Co-Pilot Cuban Salsa Rubric analysis (Clave timing, circular frame tension, Guapea/Dile Que No/Setenta scoring in `/instructor/submissions`)
- [x] Pre-filled rubric draft for instructor 1-click approval
- [x] Verified Dancer Milestone Badge & social celebration card (`/dashboard/progression`)

### Phase 4: Multi-Tenant B2B Scale (Next Sprint)
- [ ] Multi-tenant isolation (`studioId`)
- [ ] Custom domain/subdomain routing (`cubanflow.ritmoflow.com`)
- [ ] Stripe Connect onboarding (Platform fee revenue model)
