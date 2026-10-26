# Running Authenticated Playwright E2E Tests (M14)

The Salsa Explosion Playwright test suite includes automated tests for authenticated student workflows and post-login WCAG 2.1 AA accessibility audits (`tests/e2e/authenticated.spec.ts`).

By default, these tests are **automatically skipped** so that local builds and CI/CD pipelines without live credentials remain completely green.

---

## Setting Up a Test User in Clerk (Development Instance)

1. Open the **Clerk Dashboard** for your development instance.
2. Navigate to **Users** and click **Create User**:
   - Provide an email address or username dedicated to testing (e.g., `e2e-dancer@salsaexplosion.test`).
   - Set a strong password.
   - Verify the account directly in the dashboard without requiring email delivery.
3. In `ritmoflow/.env.local` (or your local environment), add the following credentials:
   ```bash
   E2E_CLERK_USER_USERNAME=your_test_user_email_or_username
   E2E_CLERK_USER_PASSWORD=your_test_user_password
   ```

---

## Running the Authenticated Suite

Once the environment variables are set in `.env.local`:

```bash
# Run authenticated suite only
npx playwright test tests/e2e/authenticated.spec.ts

# Or run the full Playwright test suite
npx playwright test
```

The tests will:
- Sign in through `/sign-in`.
- Visit `/`, `/dashboard/schedule`, `/dashboard/wallet`, `/dashboard/progression`, `/events`, and `/pricing`.
- Verify the header renders the Clerk account button.
- Ensure zero server 500 errors, zero React 19 minified #441 stream aborts, and zero unhandled exceptions.
- Run Axe accessibility scans across the signed-in `/dashboard/schedule` and `/dashboard/wallet` interfaces.
