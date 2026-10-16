# RitmoFlow: System Architecture & Business Review Packet

---

## 1. Executive Summary & Domain Context

**RitmoFlow** is a specialized operating system engineered for dance academies, masterclass organizers, and social dance communities, specialized initially in **Cuban Salsa (Casino & Rueda de Casino)**.

### The Real-World Domain Problems Solved:
1. **The Lead / Follow Floor Imbalance:** In partner dancing, classes with 16 Follows and 4 Leads cause frustration, sideline fatigue, and high student drop-out after 3–4 weeks. Standard studio software (Mindbody, Momence) lacks dynamic role-based locking. RitmoFlow enforces strict transactional role caps.
2. **"Pay-at-the-Door" Cash Leakage:** Dance studios lose 15%–20% of drop-in revenue to forgotten bank transfers and cash miscounting. RitmoFlow enforces frictionless digital booking (Apple Pay / Google Pay via Stripe).
3. **High-Ticket Guest Artist Event Fees (The Eventbrite Killer):** Studios regularly host visiting Cuban maestros for weekend bootcamps (£70–£120 passes). Eventbrite takes **~6.5% + £0.59** per ticket (£700+ lost on a £10,000 weekend). RitmoFlow processes these directly via native Stripe (~1.5% + 20p), keeping £500+ extra profit in the owner's pocket.
4. **Subjective Progression & Instructor Time Sink:** Assessing student technique takes hours. RitmoFlow pairs a structured 4-tier Cuban Salsa syllabus (Guapea, Dile Que No, Setenta, Vacilala) with private video uploads and an AI Dance Co-Pilot to pre-screen timing and circular frame mechanics.

---

## 2. Technology Stack & Architectural Decisions

* **Framework:** Next.js 16 (App Router) + Turbopack + React 19.
* **Language & Typing:** TypeScript (Strict Mode, 0 `any`, full Zod 4 runtime schemas).
* **Database & ORM:** PostgreSQL on Supabase (pooled via PgBouncer on port 6543, direct migrations on port 5432) managed with Prisma ORM 6.
* **Authentication & RBAC:** Clerk Auth (integrated with PostgreSQL via user auto-provisioning and role sync across `STUDENT`, `INSTRUCTOR`, and `ADMIN`).
* **Payments & Ledger:** Stripe Checkout, Customer Billing Portal, and Webhooks with immutable `CreditLedger` audit entries and P2002 idempotency guards.
* **Storage:** Supabase Storage private bucket (`assessments`) with scoped signed upload URLs (PUT) and time-limited signed playback URLs (GET).
* **Styling & Primitives:** Tailwind CSS v4, Radix UI Slot primitives, Lucide React icons, native SVG chart visualizers.

---

## 3. Complete Database Schema (Prisma DDL)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
}

enum DanceLevel {
  BEGINNER
  IMPROVER
  INTERMEDIATE
  ADVANCED
}

enum DanceStyle {
  CUBAN_SALSA
}

enum DanceRole {
  LEAD
  FOLLOW
  SOLO
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
  ATTENDED
  NO_SHOW
  WAITLISTED
}

enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  INCOMPLETE
}

enum TransactionType {
  CREDIT_PACK_PURCHASE
  SUBSCRIPTION_RENEWAL
  CLASS_BOOKING_DEDUCTION
  CLASS_CANCELLATION_REFUND
  ADMIN_ADJUSTMENT
}

enum EventStatus {
  DRAFT
  PUBLISHED
  COMPLETED
  CANCELLED
}

enum TicketPaymentStatus {
  PENDING
  PAID
  REFUNDED
}

model User {
  id                 String              @id @default(cuid())
  clerkId            String              @unique
  email              String              @unique
  firstName          String
  lastName           String
  avatarUrl          String?
  role               Role                @default(STUDENT)
  currentLevel       DanceLevel          @default(BEGINNER)
  preferredRole      DanceRole           @default(LEAD)
  classCredits       Int                 @default(0)
  stripeCustomerId   String?             @unique

  taughtClasses      ClassSession[]      @relation("InstructorClasses")
  bookings           Booking[]
  submissions        VideoSubmission[]   @relation("StudentSubmissions")
  reviews            VideoSubmission[]   @relation("InstructorReviews")
  subscription       Subscription?
  transactions       CreditLedger[]
  eventRegistrations EventRegistration[]

  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  @@index([clerkId])
  @@index([role])
}

model ClassSession {
  id             String       @id @default(cuid())
  title          String
  description    String?
  style          DanceStyle   @default(CUBAN_SALSA)
  minLevel       DanceLevel   @default(BEGINNER)
  startTime      DateTime
  endTime        DateTime
  room           String       @default("Studio A")
  maxCapacity    Int
  maxLeads       Int?
  maxFollows     Int?
  bookedCount    Int          @default(0)
  creditCost     Int          @default(1)
  isCancelled    Boolean      @default(false)
  instructorId   String

  instructor     User         @relation("InstructorClasses", fields: [instructorId], references: [id])
  bookings       Booking[]

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([startTime, style, minLevel])
  @@index([instructorId])
}

model Booking {
  id             String        @id @default(cuid())
  userId         String
  classSessionId String
  danceRole      DanceRole
  status         BookingStatus @default(CONFIRMED)
  checkedInAt    DateTime?
  cancelledAt    DateTime?

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  classSession   ClassSession  @relation(fields: [classSessionId], references: [id], onDelete: Cascade)

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@unique([userId, classSessionId])
  @@index([classSessionId, status])
  @@index([userId, status])
}

model VideoSubmission {
  id             String           @id @default(cuid())
  studentId      String
  instructorId   String?
  style          DanceStyle       @default(CUBAN_SALSA)
  currentLevel   DanceLevel
  targetLevel    DanceLevel
  videoUrl       String
  studentNotes   String?          @db.Text
  status         SubmissionStatus @default(PENDING)
  feedback       String?          @db.Text
  reviewedAt     DateTime?

  student        User             @relation("StudentSubmissions", fields: [studentId], references: [id], onDelete: Cascade)
  instructor     User?            @relation("InstructorReviews", fields: [instructorId], references: [id], onDelete: SetNull)

  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  @@index([studentId, status])
  @@index([status, createdAt])
}

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  stripeSubscriptionId String             @unique
  stripePriceId        String
  status               SubscriptionStatus
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean            @default(false)

  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
}

model CreditLedger {
  id                    String          @id @default(cuid())
  userId                String
  amount                Int
  balanceAfter          Int
  type                  TransactionType
  description           String?
  stripePaymentIntentId String?         @unique
  bookingId             String?

  user                  User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt             DateTime        @default(now())

  @@index([userId, createdAt])
}

model Event {
  id            String              @id @default(cuid())
  slug          String              @unique
  title         String
  description   String              @db.Text
  coverImageUrl String?
  venueName     String
  venueAddress  String
  startDate     DateTime
  endDate       DateTime
  guestArtists  String[]
  status        EventStatus         @default(DRAFT)

  ticketTiers   EventTicketTier[]
  registrations EventRegistration[]

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@index([status, startDate])
}

model EventTicketTier {
  id            String              @id @default(cuid())
  eventId       String
  name          String
  description   String?
  priceInCents  Int
  totalCapacity Int
  maxLeads      Int?
  maxFollows    Int?
  salesStartAt  DateTime            @default(now())
  salesEndAt    DateTime

  event         Event               @relation(fields: [eventId], references: [id], onDelete: Cascade)
  registrations EventRegistration[]

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@index([eventId])
}

model EventRegistration {
  id                 String              @id @default(cuid())
  userId             String
  eventId            String
  ticketTierId       String
  role               DanceRole           @default(LEAD)
  qrCodeHash         String              @unique @default(cuid())
  paymentStatus      TicketPaymentStatus @default(PAID)
  amountPaidInCents  Int
  checkedIn          Boolean             @default(false)
  checkedInAt        DateTime?
  stripeSessionId    String?             @unique

  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  event              Event               @relation(fields: [eventId], references: [id], onDelete: Cascade)
  ticketTier         EventTicketTier     @relation(fields: [ticketTierId], references: [id], onDelete: Cascade)

  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  @@index([userId])
  @@index([eventId, role])
  @@index([ticketTierId])
  @@index([qrCodeHash])
}
```

---

## 4. Current Core Workflows & Edge-Case Defenses

### 1. Concurrency-Safe Class Booking (`booking.actions.ts`)
* Uses Prisma `$transaction` with row-level locks on `ClassSession.bookedCount`.
* Checks for monotonic prerequisite levels (`user.currentLevel >= session.minLevel`).
* Checks for double bookings (`@@unique([userId, classSessionId])`).
* Enforces role quotas (`maxLeads` and `maxFollows`) atomically to prevent race conditions during rush hours.
* Credits deducted atomically with an audit row written to `CreditLedger`.

### 2. Stripe Webhook & Payment Idempotency (`api/webhooks/stripe/route.ts`)
* Validates Stripe webhook signatures with `stripe.webhooks.constructEvent`.
* Checks `CreditLedger.stripePaymentIntentId` with a unique constraint. If a webhook retries, PostgreSQL throws a `P2002` duplicate key error, which the handler catches cleanly to prevent double-crediting accounts.

### 3. Video Assessment & Signed URLs (`submission.actions.ts` & `grading.actions.ts`)
* Uploads bypass the Node/Next.js server via Supabase Storage signed upload URLs (`createSignedUploadUrl`).
* Videos are stored in a private bucket (`assessments`).
* Instructors view videos via 1-hour time-limited signed playback URLs (`createSignedUrl`).
* Monotonic promotion rule enforced: students can only apply for `LEVEL_WEIGHT[target] === LEVEL_WEIGHT[current] + 1`. Only one PENDING submission permitted at a time.

### 4. AI Dance Co-Pilot Video Pre-Grader (`management.actions.ts`)
* Analyzes student notes and target syllabus figures (e.g. *Guapea*, *Dile Que No*, *Setenta*, *Vacilala*).
* Returns structured rubric breakdown: Clave Timing (1-2-3 / 5-6-7), Circular Frame Tension, Cuban Motion, and drafts a constructive instructor critique.

### 5. Live QR Attendance & Mobile Check-in Desk (`/instructor/roster` & `/checkin/[sessionId]`)
* Renders real-time Leads vs Follows on dance floor meters.
* Displays class QR code for self-service mobile check-in.
* Supports 1-tap walk-in instant booking and check-in.

### 6. High-Ticket Guest Artist Event Engine (`/events/[slug]` & `/admin/events`)
* Multi-tier ticket passes (Full Weekend Pass, Saturday Bootcamp, Party Pass).
* Real-time Lead/Follow capacity countdown.
* Instant generation of cryptographic QR passes (`RF-PASS-...`).
* Mobile QR scanner and attendee verification table for door volunteers.

---

## 5. Conscious Engineering Trade-offs & Current Constraints

1. **Multi-Tenancy Model:** Currently configured as a single-studio pilot instance. Tenant isolation foreign keys (`studioId`) and subdomain routing (`[studio].ritmoflow.com`) are deliberately scheduled for Phase 4 to validate the product with the first physical studio owner before abstracting.
2. **Video Transcoding:** Client uploads directly to Supabase Storage (100MB MP4/MOV limit). Video is played back directly via signed URLs rather than chunked HLS/DASH streaming through Mux or Cloudflare Stream.
3. **Cache Invalidation:** Next.js `revalidatePath` is used directly in Server Actions. No Redis or distributed caching layer yet.

---

## 6. Commercial Model & Owner Pitch Numbers

* **Target Pilot Studio:** Local Cuban Salsa / Rueda dance academy in the UK.
* **The Offer:** 100% free pilot for 30 days in exchange for feedback and free classes for the founder and partner.
* **The ROI Value Proposition for the Studio Owner:**
  * **Eventbrite Fee Savings:** On a 100-person weekend masterclass with international artists (£10,000 gross), Eventbrite takes **~£709**. RitmoFlow uses native Stripe (~1.5% + 20p), putting **£500+ back into the owner's bank account per event**.
  * **Cash Leakage Recovery:** Captures ~15% of previously lost drop-in revenue (£300–£800/month).
  * **Retention:** Eliminates the Lead/Follow mismatch that causes beginners to quit after 3 weeks.
