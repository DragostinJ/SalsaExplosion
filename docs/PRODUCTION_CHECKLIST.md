# Salsa Explosion Production Readiness Checklist (M13)

This checklist provides the exact deployment procedures and environment variable names required to transition the Salsa Explosion (RitmoFlow) platform to production on Vercel.

> [!IMPORTANT]
> **Secret Hygiene:** Never write or commit plaintext secrets to this repository. Only reference environment variable names and dashboard configuration locations.

---

## 1. Clerk Authentication Configuration

1. In the Clerk Dashboard, create or promote your application to a **Production instance**.
2. Configure Environment Variables in the Vercel Project Settings:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Set to the live publishable key starting with `pk_live_...`.
   - `CLERK_SECRET_KEY`: Set to the live secret key starting with `sk_live_...`.
3. In **Clerk Dashboard → Configure → Domains**:
   - Add your primary Vercel production deployment domain (e.g. `salsa-explosion-bkgf.vercel.app`).
   - Add your canonical custom domain (`salsaexplosion.co.uk`) and ensure DNS verification records are active.
4. In **Clerk Dashboard → Configure → Webhooks**:
   - Add an endpoint pointing to `https://salsaexplosion.co.uk/api/webhooks/clerk`.
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`.
   - Copy the webhook signing secret and set `CLERK_WEBHOOK_SECRET` (`whsec_...`) in Vercel.

---

## 2. PostgreSQL & Database Connection Pooler (Supabase)

1. In the Supabase project dashboard, navigate to **Settings → Database → Connection Pooling**:
   - Set **Mode** to `Transaction`.
   - Use Port `6543`.
2. Configure Vercel Database Environment Variables:
   - `DATABASE_URL`: Transaction pooler URL pointing to `aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=15`.
   - `DIRECT_URL`: Direct session connection URL on port `5432` reserved exclusively for running Prisma schema migrations and initial database setup.
3. Verify database connectivity:
   - Request `https://salsaexplosion.co.uk/api/health`.
   - Ensure the JSON response reports `"status": "healthy"`, `"database": "connected"`, and `"clerkKeyMode": "live"`.

---

## 3. Stripe Payments Integration

1. In the Stripe Dashboard:
   - Toggle to **Live mode**.
   - Create products and recurring price tiers corresponding to the PASS_PRICING specifications.
2. Configure Vercel Stripe Environment Variables:
   - `STRIPE_SECRET_KEY`: Set to live secret key starting with `sk_live_...`.
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Set to live publishable key starting with `pk_live_...`.
   - `STRIPE_WEBHOOK_SECRET`: Add endpoint for `https://salsaexplosion.co.uk/api/webhooks/stripe` listening to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. Set secret starting with `whsec_...`.
   - `STRIPE_PRICE_ID_PACK_5`, `STRIPE_PRICE_ID_PACK_10`, `STRIPE_PRICE_ID_MONTHLY`: Set to live Stripe Price IDs (`price_...`).

---

## 4. Feature Flags & Demo Settings (Owner Pitch Policy)

> [!NOTE]
> During the studio owner pitch and live demonstration, the role switcher and demo features are **intentionally left enabled**:
> - `ALLOW_DEMO_ROLE_SWITCHING=true`
> - `DEMO_SWITCHER_EMAILS=enrique@salsaexplosion.co.uk,demo@salsaexplosion.co.uk,...`
> - `ALLOW_DEMO_PAYMENTS=true`
> - `ALLOW_DEMO_EVENT_REGISTRATION=true`

### After the Owner Pitch is Completed:
1. Turn off role-switching capabilities for security:
   - Set `ALLOW_DEMO_ROLE_SWITCHING="false"` (or remove the variable).
   - Review and clear `DEMO_SWITCHER_EMAILS`.
2. Disable synthetic demo payment bypass:
   - Set `ALLOW_DEMO_PAYMENTS="false"`.
   - Set `ALLOW_DEMO_EVENT_REGISTRATION="false"`.
3. Confirm that the UI header role selector only appears for verified staff or disappears entirely in production.

---

## 5. Deployment Verification & Health Check

1. In Vercel, trigger a fresh deployment:
   - Select **Redeploy** and ensure the **"Use existing Build Cache"** checkbox is **unchecked**.
2. Visit `https://salsaexplosion.co.uk/api/health` in a browser or via `curl`:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "databaseReachable": true,
     "clerkPublishableKeyPresent": true,
     "clerkSecretKeyPresent": true,
     "clerkKeyMode": "live",
     "appUrlValid": true,
     "latencyMs": 42
   }
   ```
3. Confirm `clerkKeyMode` returns `"live"`.

---

## 6. Future Architecture & Maintenance

- **Clerk `createRouteMatcher` Deprecation:** Migrate middleware matcher checks to defense-in-depth layout and page server checks per Clerk Next.js SDK v7 recommendations.
- **Nonce-Based Content Security Policy:** Once static prerendering is decoupled or partial prerendering (PPR) is enabled, introduce cryptographic request nonces.
- **Sentry Integration:** Plug live Sentry telemetry into the `reportError` seam in `src/lib/monitoring.ts`.
