# Database Security Plan: Row Level Security (RLS) Enablement for RitmoFlow

## 1. Executive Summary & Context

Supabase Security Advisor currently reports that Row Level Security (RLS) is disabled across all 19 public tables in the PostgreSQL database.

In Supabase, PostgreSQL tables in the `public` schema are automatically exposed via the PostgREST HTTP REST API endpoint (`https://<project-ref>.supabase.co/rest/v1/*`). When RLS is disabled on a table:
- Anyone holding the public anonymous API key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, which is embedded in client bundles or public repositories) can read, insert, modify, or delete rows directly via HTTP requests, bypassing application logic.
- This creates severe data exfiltration and integrity risks across student profiles (`User`), attendance records (`Booking`), payments (`CreditLedger`, `Subscription`), and audit trails (`AuditLog`).

This document details an audit of all Supabase touchpoints across RitmoFlow, evaluates the database connection architecture, and presents a zero-downtime, zero-regression remediation plan.

---

## 2. Supabase Integration Audit: Non-Prisma Usage

We conducted an exhaustive codebase search for `@supabase/supabase-js`, `createClient`, `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_*`, `.from(`, `storage`, and `realtime`.

### Findings:
1. **No Client-Side Supabase Client:**
   - There are zero client-side Supabase client initializations anywhere in `src/app/**` or `src/components/**`.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not imported, validated, or exposed in `src/lib/env.ts`.
   - The browser never communicates with the Supabase PostgREST endpoint or Supabase Realtime websockets.
2. **Server-Side Storage Only (`src/lib/storage.ts`):**
   - `@supabase/supabase-js` is used exclusively in `src/lib/storage.ts` via `getSupabaseAdmin()`.
   - It connects using `SUPABASE_SERVICE_ROLE_KEY` (a privileged server secret).
   - It strictly interacts with Supabase Storage buckets (`student-submissions` for signed video upload/view URLs and `event-posters` for public flyer CDN images):
     ```typescript
     supabaseAdmin.storage.from(bucket)...
     ```
   - **Zero table queries:** `getSupabaseAdmin().from(...)` is **never** invoked.
3. **Database Access Exclusively via Prisma:**
   - 100% of data reads, writes, mutations, transactions, and foreign key relations are executed via Prisma Client (`src/lib/prisma.ts`) within Next.js Server Components, Server Actions (`src/actions/**`), and route handlers (`src/app/api/**`).

---

## 3. Database Connection Role & RLS Bypass Verification

In `prisma/schema.prisma` and `.env.example`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```
- Connection strings follow the format:
  `postgresql://postgres.<project-ref>:<password>@<host>:6543/postgres?pgbouncer=true`
- **Database Role:** `postgres` (the database superuser / table owner created during Supabase project provisioning).

### PostgreSQL RLS Mechanics for `postgres`:
Under PostgreSQL standard specification:
> *"Row security does not apply to the table owner, superusers, or roles with the BYPASSRLS attribute, unless FORCE ROW LEVEL SECURITY is set on the table."*

Because:
1. The `postgres` user is the owner of all tables created by Prisma migrations.
2. The `postgres` user inherently possesses the `BYPASSRLS` role attribute.
3. None of our tables specify `FORCE ROW LEVEL SECURITY`.

**Conclusion:** Prisma queries running as `postgres` completely bypass RLS. Enabling RLS on the public tables has zero impact on Prisma queries.

---

## 4. Impact Analysis: Can RLS Be Enabled on All 19 Tables with Zero Policies?

### YES.
Enabling RLS without explicit `CREATE POLICY` statements creates a **Default Deny** posture:
- **For PostgREST (`anon` and `authenticated` roles):** Any direct HTTP request to `/rest/v1/<Table>` will be denied immediately (returns HTTP 401/403 or empty `[]` array). The public anon key can no longer read or write a single byte from the database.
- **For RitmoFlow Application (Prisma / `postgres` role):** Prisma queries continue executing normally with zero latency impact, zero permission errors, and zero functional regression.
- **For Supabase Storage (`service_role`):** Storage operations operate within the `storage` schema and use `SUPABASE_SERVICE_ROLE_KEY`, which also possesses `BYPASSRLS`.

Because the application never uses PostgREST or the `anon` key to query SQL tables, **no custom policies are required**. A clean `ENABLE ROW LEVEL SECURITY` across all 19 tables completely hardens the database.

---

## 5. Affected Tables (All 19 Public Tables)

| # | Table Name | Business Sensitivity | PostgREST Threat if RLS Disabled |
|---|---|---|---|
| 1 | `"User"` | Critical (PII, Clerk IDs, Roles) | Unauthorized profile harvest / role tampering |
| 2 | `"ClassSession"` | High (Attendance, Teacher schedules) | Schedule tampering / capacity spoofing |
| 3 | `"Booking"` | Critical (Student attendance, Check-ins) | Fake check-ins / booking cancellation |
| 4 | `"VideoSubmission"` | High (Student coaching clips, Feedback) | Unauthorized viewing of unlisted student videos |
| 5 | `"Subscription"` | Critical (Stripe customer IDs, Status) | Billing status manipulation |
| 6 | `"CreditLedger"` | Critical (Class credit balance history) | Balance tampering / credit injection |
| 7 | `"Event"` | Medium (Congress/Workshop details) | Unauthorized event mutation |
| 8 | `"EventTicketTier"` | High (Ticket pricing, Quantities) | Price tampering / sold-out bypassing |
| 9 | `"EventRegistration"` | Critical (Paid tickets, QR tokens) | QR pass forging / ticket theft |
| 10 | `"ProcessedWebhookEvent"` | High (Stripe/Clerk idempotency log) | Replay attack vulnerability |
| 11 | `"PartnerWaitlistEntry"` | Medium (Contact info, Lead/Follow role) | Student contact scraping |
| 12 | `"PrivateLessonBooking"` | High (Private coaching requests) | Schedule manipulation |
| 13 | `"MerchReservation"` | Low (T-shirt/merch reservations) | Reservation tampering |
| 14 | `"AnonymousQuestion"` | Medium (Student dance floor inquiries) | Question deletion / spoofing |
| 15 | `"PostClassFeedback"` | High (Teacher ratings, Honest feedback) | Rating manipulation |
| 16 | `"AuditLog"` | Critical (Forensic security trail) | Audit trail alteration / deletion |
| 17 | `"PublishedAnnouncement"` | Medium (Public studio notices) | Announcement defacement |
| 18 | `"SongSectionProgress"` | Low (Student mastered section tracker) | Progress spoofing |
| 19 | `"PracticeSectionStat"` | Low (Song practice hotspot analytics) | Analytics pollution |

---

## 6. Execution & Verification Procedure

> **SAFETY NOTICE:** In accordance with repository boundaries, this script has **NOT** been executed automatically. It is staged in `docs/security/enable-rls.sql` for the project owner to review and apply.

### Steps to Apply:
1. Open the Supabase Dashboard -> **SQL Editor**.
2. Paste and run `docs/security/enable-rls.sql`.
3. Verify RLS status using the verification query:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN (
       'User', 'ClassSession', 'Booking', 'VideoSubmission',
       'Subscription', 'CreditLedger', 'Event', 'EventTicketTier',
       'EventRegistration', 'ProcessedWebhookEvent', 'PartnerWaitlistEntry',
       'PrivateLessonBooking', 'MerchReservation', 'AnonymousQuestion',
       'PostClassFeedback', 'AuditLog', 'PublishedAnnouncement',
       'SongSectionProgress', 'PracticeSectionStat'
     );
   ```
   *Expected Result: All 19 rows report `rowsecurity = true`.*
4. Verify PostgREST lockdown:
   Execute a test request using curl with the anon key:
   ```bash
   curl -i -H "apikey: <ANON_KEY>" https://<project-ref>.supabase.co/rest/v1/User
   ```
   *Expected Result: `[]` (empty JSON array) or `401/403 Unauthorized`, confirming data cannot be extracted.*
5. Run application verification:
   - Run `npm test` (all 350 unit and integration tests pass).
   - Test class check-in on `/admin/operations` or `/checkin/<id>`.
   - Test student practice progress on `/music/me-dicen-cuba`.

### Rollback Plan:
If unexpected behavior occurs, execute the commented rollback script at the bottom of `docs/security/enable-rls.sql`:
```sql
ALTER TABLE public."User" DISABLE ROW LEVEL SECURITY;
-- (and the remaining 18 tables)
```
This immediately restores tables to their prior unconstrained state.
