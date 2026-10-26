import { describe, it, expect } from "vitest";
import { getValidatedEnv } from "@/lib/env";

describe("H2: Environment Configuration & Security Safeguards", () => {
  it("provides safe development/test defaults when env vars are unpopulated", () => {
    const env = getValidatedEnv({
      NODE_ENV: "test",
    });

    expect(env.NODE_ENV).toBe("test");
    expect(env.STRIPE_SECRET_KEY).toBe("sk_test_placeholder_for_build");
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe("placeholder_service_role_key");
  });

  it("throws descriptive error in production if STRIPE_SECRET_KEY is a placeholder", () => {
    expect(() =>
      getValidatedEnv({
        NODE_ENV: "production",
        STRIPE_SECRET_KEY: "sk_test_placeholder_for_build",
        SUPABASE_SERVICE_ROLE_KEY: "ey_live_supabase_secret_key_12345",
        CLERK_SECRET_KEY: "live_clerk_secret_12345",
        CLERK_WEBHOOK_SECRET: "whsec_live_12345",
        STRIPE_WEBHOOK_SECRET: "whsec_live_12345",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      })
    ).toThrow(/STRIPE_SECRET_KEY must be a valid live secret key in production/);
  });

  it("throws descriptive error in production if SUPABASE_SERVICE_ROLE_KEY is a placeholder", () => {
    expect(() =>
      getValidatedEnv({
        NODE_ENV: "production",
        STRIPE_SECRET_KEY: "sk_live_valid_stripe_key_12345",
        SUPABASE_SERVICE_ROLE_KEY: "placeholder_service_role_key",
        CLERK_SECRET_KEY: "live_clerk_secret_12345",
        CLERK_WEBHOOK_SECRET: "whsec_live_12345",
        STRIPE_WEBHOOK_SECRET: "whsec_live_12345",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      })
    ).toThrow(/SUPABASE_SERVICE_ROLE_KEY cannot be placeholder in production/);
  });

  it("throws descriptive error in production if CLERK_WEBHOOK_SECRET is missing", () => {
    expect(() =>
      getValidatedEnv({
        NODE_ENV: "production",
        STRIPE_SECRET_KEY: "sk_live_valid_stripe_key_12345",
        SUPABASE_SERVICE_ROLE_KEY: "ey_live_supabase_secret_key_12345",
        CLERK_SECRET_KEY: "live_clerk_secret_12345",
        STRIPE_WEBHOOK_SECRET: "whsec_live_12345",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      })
    ).toThrow(/CLERK_WEBHOOK_SECRET is required/);
  });

  it("succeeds in production when all live secrets are configured properly", () => {
    const env = getValidatedEnv({
      NODE_ENV: "production",
      STRIPE_SECRET_KEY: "sk_live_production_key_xyz",
      SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.live",
      CLERK_SECRET_KEY: "sk_live_clerk_abc123",
      CLERK_WEBHOOK_SECRET: "whsec_clerk_valid_live",
      STRIPE_WEBHOOK_SECRET: "whsec_stripe_valid_live",
      NEXT_PUBLIC_SUPABASE_URL: "https://xyzcompany.supabase.co",
    });

    expect(env.NODE_ENV).toBe("production");
    expect(env.STRIPE_SECRET_KEY).toBe("sk_live_production_key_xyz");
  });
});
