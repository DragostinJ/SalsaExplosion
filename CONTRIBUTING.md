# Contributing & Engineering Guidelines

Thank you for your interest in contributing to **Salsa Explosion (RitmoFlow)**. To maintain high code quality, security standards, and zero visual regressions, all contributions must adhere to the engineering protocols outlined below.

---

## 1. Engineering Principles

1. **Strict TypeScript (No `any`):**
   - All code must be strictly typed. Never use `any` or loose type assertions. Use explicit interfaces, generic utilities, and runtime Zod schemas.
2. **Server/Client Boundaries:**
   - Prefer React Server Components (RSC) by default.
   - Push `"use client"` strictly to leaf components requiring user interactions or browser APIs.
3. **Data Integrity & Multi-Tenant Isolation:**
   - Always verify the authenticated user ID and role before modifying or returning sensitive records.
   - Guard against Insecure Direct Object References (IDOR).
4. **Zero Cumulative Layout Shift (CLS):**
   - All new imagery must be defined in `src/lib/media-manifest.ts` with explicit dimensions and aspect ratios before rendering.

---

## 2. Development Workflow

### Branching & Commit Conventions
Follow the Conventional Commits specification:
- `feat(...)`: New features or capabilities.
- `fix(...)`: Bug fixes or defect resolutions.
- `refactor(...)`: Code refactoring without behavioral changes.
- `test(...)`: Unit or end-to-end test enhancements.
- `docs(...)`: Documentation updates.

### Verification Checklist Before Submitting a PR
Before submitting a pull request, ensure the following commands pass with zero errors:

```bash
# 1. Typecheck & lint
npm run lint

# 2. Run all unit tests (must pass 100%)
npm test

# 3. Build production bundle (must pass with 0 errors)
npm run build

# 4. Run automated visual audit & ergonomics inspector
npm run audit:design
```

---

## 3. Code Review & Security Gates

All pull requests will be audited for:
- [ ] Multi-tenant isolation and ownership checks on database queries.
- [ ] Webhook signature verification and secret hygiene.
- [ ] Mobile ergonomics (touch targets `>= 40px`, zero horizontal overflow).
- [ ] Test coverage for new server actions and critical workflows.
