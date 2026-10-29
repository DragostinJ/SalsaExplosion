# Career & Engineering Execution Roadmap (2026 – 2027)
### Master Daily Operating Manual & Strategic Milestone Plan: Oct 29, 2026 – Jan 31, 2027

> **Target Outcome:** Remote Junior Full-Stack Engineer role secured by January 2027 + £1,000–£2,000/mo recurring digital nomad / freelance AI studio income.  
> **Flagship Production Reference:** [salsa-explosion-bkgf.vercel.app](https://salsa-explosion-bkgf.vercel.app/)  
> **Codebase:** Next.js 16 (App Router), TypeScript (Strict, 0 `any`), Prisma ORM, Supabase PostgreSQL, Clerk v7, Stripe, Web Audio API, Vitest (230 tests), Playwright.

---

## 🌅 Section 1: The Morning Wake-Up Protocol (Daily Checklist)

Execute this sequence every morning before writing a single line of production code:

- [ ] **01. Gratitude & Mindset (2 mins):** Write 3 specific things on my gratitude list before touching code. Prime the mind with calm, abundance, and senior engineering clarity.
- [ ] **02. Check Today's Single Engineering Target (3 mins):** Open `CAREER_ROADMAP_2027.md`, locate today's week/day block, and pick **ONE** primary deliverable. Do not juggle 5 tasks; execute 1 cleanly to completion.
- [ ] **03. Branch First, Never Main (1 min):** Create a dedicated feature branch for every session:
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feat/<task-name>  # or fix/<task-name>
  ```
- [ ] **04. AI Role Discipline (Anti-Tutorial / Anti-Chaos Protocol):**
  - 🧠 **Architect (Gemini Chat):** Plan data structures, review screenshot audits, break down edge cases, and write surgical prompts. Never blindly accept generated code.
  - 🛠️ **Builder (Antigravity / Cursor):** Execute 1 tightly-scoped prompt at a time. Run `/compact` or start a fresh turn once a milestone is verified to keep context pristine.
  - 🛡️ **Gatekeeper (Terminal):** Never commit without local verification:
    ```bash
    npm test && npm run build && npm run audit:design
    ```
- [ ] **05. Physical Reset (Daily Non-Negotiable):**
  - Beach bars calisthenics (pull-ups, dips, core + lower back).
  - Sea dip / cold exposure.
  - Thursday / Sunday evening Salsa & Bachata immersion at BOH Studios Bournemouth.

---

## 🗺️ Section 2: Week-by-Week Strategic Execution Map

### Phase 1: RitmoFlow AI Flagship & BOH Studios Live Testing (Oct 29 – Nov 15, 2026)

#### 🎯 Days 1–3 (Oct 29 – Oct 31, 2026): CI Hardening & Field Testing
- [x] **CI Reliability:** Fix `.github/workflows/ci.yml` and `.github/workflows/db-backup.yml` to achieve 100% green GitHub Actions status on every push.
- [ ] **Halloween & Thursday Testing:** Attend Thursday class (18:45) and Saturday Halloween Fancy Dress Party at BOH Studios. Test the live site on mobile (390px) and demonstrate the `"Aguanile"` Song Trainer to teachers/dancers on-site.
- [ ] **Client Validation:** Gather Maestro Enrique's reaction to the WhatsApp pitch and note any requested flyer or event copy adjustments.

#### 🎯 Week 1 (Nov 1 – Nov 7, 2026): AI Feature #1 — Instructor Syllabus & Musicality Copilot (`/instructor`)
- [ ] **Install Google GenAI SDK:** Add `@google/genai` dependency and configure server-side environment variables.
- [ ] **Zod Structured Output Schema:** Define strict output contracts for lesson plans (`drills`, `claveCue`, `tempoProgression`, `feedbackNote`, `commonMistakes`).
- [ ] **Server Action & RBAC Guard:** Build `generateInstructorDrillAction` protected by `role === "TEACHER" || role === "OWNER"`.
- [ ] **Unit Tests:** Add Vitest suite verifying Zod schema parsing and unauthorized role rejection.
- [ ] **UI Integration:** Add a sleek "Generate 4-Gear Musicality Drill" drawer inside the Instructor Portal.

#### 🎯 Week 2 (Nov 8 – Nov 15, 2026): AI Feature #2 — "BOH Studios AI Receptionist & Dance Concierge"
- [ ] **Domain Knowledge Grounding:** Ground the prompt strictly on `src/lib/academy-data.ts` (door pricing £12/£14, Thursday 18:45 / Sunday 18:15 schedules, BOH Studios parking at BH2 5LR, Rueda call definitions, and festival ticket links).
- [ ] **Zero-Hallucination Guardrails:** Strict prompt boundaries instructing the model to decline answering out-of-scope queries and direct unknown questions to Maestro Enrique's WhatsApp.
- [ ] **Floating Concierge UI:** Build a responsive, accessible floating drawer/pill widget in the bottom-right corner.
- [ ] **Productization Blueprint:** Abstract the concierge architecture into a standalone, reusable template for local businesses.

---

### Phase 2: Reusable AI Agency Engine & Developer Hub (Nov 16 – Dec 6, 2026)

#### 🎯 Week 3 (Nov 16 – Nov 22, 2026): Personal Developer & AI Studio Portfolio (`dragostin.dev`)
- [ ] **Portfolio Architecture:** Create a high-converting, brutalist developer portfolio using Next.js 16 + Tailwind CSS.
- [ ] **Flagship Case Study Showcase:** Feature **RitmoFlow / Salsa Explosion** prominently:
  - 230+ automated Vitest tests badge.
  - Interactive Web Audio API clave synth demo embed.
  - Custom Playwright visual design critic breakdown.
  - Gemini-powered instructor copilot and studio concierge.
- [ ] **Live URL & Domain:** Deploy to custom domain (`dragostin.dev` or equivalent) with 100/100 Lighthouse performance scores.

#### 🎯 Week 4 (Nov 23 – Nov 29, 2026): Project #2 — Universal Local Business AI Concierge Template
- [ ] **Core Engine:** Build a universal multi-tenant template for local service businesses (dental clinics, yoga/gym studios, boutique restaurants, salons).
- [ ] **Features:** Instant AI FAQ answering, appointment waitlist capture, opening hours lookup, and WhatsApp escalation hook.
- [ ] **One-Click Rebranding:** Single JSON/TypeScript configuration file to rebrand for any client in under 20 minutes.

#### 🎯 Week 5 (Nov 30 – Dec 6, 2026): Portfolio & Profile Polish
- [ ] **Architecture Decision Records (ADRs):** Write 3 clear ADRs in `docs/ADR/` (ADR-001: Next.js App Router vs SPA; ADR-002: Web Audio API vs Audio Files; ADR-003: Postgres Connection Pooling with PgBouncer).
- [ ] **GitHub Profile Optimization:** Pin `SalsaExplosion` and `AI-Concierge-Engine` with live demo badges, clean descriptions, and interactive GIFs.
- [ ] **LinkedIn & CV Refresh:** Align headline and experience: *"Full-Stack Software Engineer | Next.js, TypeScript, PostgreSQL, AI Systems"*.

---

### Phase 3: Client Acquisition & Remote Job Blitz (Dec 7, 2026 – Jan 31, 2027)

#### 🎯 Weeks 6–7 (Dec 7 – Dec 20, 2026): Local Business Outreach & First Retainers
- [ ] **Prospect List:** Research 15 local Bournemouth & UK health, wellness, and fitness businesses with outdated static websites.
- [ ] **Loom Video Demos:** Record 60-second personalized screen recordings demonstrating a custom AI Concierge answering their specific pricing/parking FAQs.
- [ ] **Close 1–2 Clients:** Secure first freelance contracts (£800–£1,500 build fee + £50–£100/mo hosting/AI retainer).

#### 🎯 Weeks 8–10 (Dec 21, 2026 – Jan 10, 2027): Remote Application Pipeline
- [ ] **Application Cadence:** Submit 15 high-quality, tailored applications per week targeting Remote Junior/Mid Full-Stack Engineer roles in the UK, Europe, and global remote companies.
- [ ] **Application Package:** Include direct links to:
  - Live production deployment (`salsa-explosion-bkgf.vercel.app`).
  - Technical Interview Defense Guide (`TECHNICAL_INTERVIEW_DEFENSE.md`).
  - Architecture breakdown (`ARCHITECTURE.md`).
- [ ] **Client Project Delivery:** Ship client deliverables from Weeks 6–7 and establish recurring monthly retainer billing.

#### 🎯 Weeks 11–13 (Jan 11 – Jan 31, 2027): Interview Execution & Offer Negotiation
- [ ] **Technical Interview Drills:** Rehearse the 10 core questions from `TECHNICAL_INTERVIEW_DEFENSE.md` out loud every day.
- [ ] **Live Coding Mastery:** Practice live pairing on App Router server actions, Zod schemas, and Prisma relationship queries.
- [ ] **Offer Selection:** Accept full-time remote engineering position + maintain recurring freelance retainers for location independence.

---

## 🛠️ Section 3: Engineering Command Cheat Sheet

Always run these commands locally before pushing:

```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Run All 38 Unit & Security Test Suites (230 tests)
npm test

# 3. Production Build Optimization (All 36 Static Routes)
npm run build

# 4. Automated Visual Design & Ergonomics Critic (Playwright)
npm run audit:design

# 5. Git Commit & Push (with Windows SSL bypass if needed)
git add .
git commit -m "feat(scope): descriptive conventional commit"
git -c http.sslVerify=false push origin <branch-name>
```

---

## 🔒 Section 4: Golden Rules & Invariants

1. **Anti-Tutorial Rule:** Never accept code without understanding the data flow from Server Action -> Zod -> Prisma -> PostgreSQL -> UI.
2. **Strict TypeScript:** Zero `any`. Always use runtime Zod schemas for all mutation payloads.
3. **Multi-Tenant Scoping:** Every Prisma query accessing user resources must enforce `where: { id, userId: currentUser.id }`.
4. **Door vs Online Pricing Invariant:** Weekly Thursday/Sunday studio classes are strictly **£12 / £14 pay-at-the-door**; Stripe checkout is reserved exclusively for Festivals and Congress Passes.
5. **Obsidian Palette:** Deep Theatre Obsidian (`#080706`), Warm Ivory (`#F5F2EB`), Havana Crimson (`#DC2626`), and Subtle Amber (`#F59E0B`). Max 9 font sizes per route.
