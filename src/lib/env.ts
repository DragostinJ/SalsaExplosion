import { z } from "zod";

function isPlaceholder(val: string | undefined): boolean {
  if (!val) return true;
  const lower = val.toLowerCase();
  return lower.includes("placeholder") || lower.includes("sk_test_placeholder");
}

function buildServerEnvSchema(isProduction: boolean) {
  return z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().optional(),
    STRIPE_SECRET_KEY: z
      .string()
      .default("sk_test_placeholder_for_build")
      .refine(
        (val) => !isProduction || !isPlaceholder(val),
        "STRIPE_SECRET_KEY must be a valid live secret key in production (cannot be empty or placeholder)"
      ),
    STRIPE_WEBHOOK_SECRET: z
      .string()
      .default("")
      .refine(
        (val) => !isProduction || (!isPlaceholder(val) && val.trim().length > 0),
        "STRIPE_WEBHOOK_SECRET is required and cannot be placeholder in production"
      ),
    CLERK_SECRET_KEY: z
      .string()
      .default("")
      .refine(
        (val) => !isProduction || (!isPlaceholder(val) && val.trim().length > 0),
        "CLERK_SECRET_KEY is required and cannot be placeholder in production"
      ),
    CLERK_WEBHOOK_SECRET: z
      .string()
      .default("")
      .refine(
        (val) => !isProduction || (!isPlaceholder(val) && val.trim().length > 0),
        "CLERK_WEBHOOK_SECRET is required and cannot be placeholder in production"
      ),
    NEXT_PUBLIC_SUPABASE_URL: z
      .string()
      .default("https://placeholder-project.supabase.co")
      .refine(
        (val) => !isProduction || (!isPlaceholder(val) && !val.includes("[")),
        "NEXT_PUBLIC_SUPABASE_URL must be configured in production"
      ),
    SUPABASE_SERVICE_ROLE_KEY: z
      .string()
      .default("placeholder_service_role_key")
      .refine(
        (val) => !isProduction || !isPlaceholder(val),
        "SUPABASE_SERVICE_ROLE_KEY cannot be placeholder in production"
      ),
    ALLOW_DEMO_PAYMENTS: z.string().optional(),
  });
}

export type ServerEnv = z.infer<ReturnType<typeof buildServerEnvSchema>>;

export function getValidatedEnv(customEnv?: Record<string, string | undefined>): ServerEnv {
  const source = customEnv || process.env;
  const isBuildPhase =
    !customEnv &&
    (process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.npm_lifecycle_event === "build");
  const isProduction = source.NODE_ENV === "production" && !isBuildPhase;
  const schema = buildServerEnvSchema(isProduction);
  const result = schema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues || (result.error as unknown as { errors?: Array<{ path: Array<string | number>; message: string }> }).errors || [];
    const errorDetails = issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    throw new Error(`[ENVIRONMENT_CONFIGURATION_ERROR] Invalid environment variables: ${errorDetails}`);
  }

  return result.data;
}

export const env = getValidatedEnv();
