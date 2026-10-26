/**
 * Serverless / Supabase Connection Pool Parameter Helper (M11)
 *
 * In production on serverless environments (e.g. Vercel), connections to Supabase transaction poolers
 * (port 6543 or pooler.supabase.com) must configure pgbouncer=true, connection_limit=1, and pool_timeout=15
 * to prevent exhausting serverless connection quotas across ephemeral lambdas.
 */
export function withServerlessPoolParams(
  rawUrl: string | undefined,
  env: { NODE_ENV?: string; VERCEL?: string } = {}
): string | undefined {
  if (!rawUrl || typeof rawUrl !== "string") {
    return rawUrl;
  }

  const isProduction = env.NODE_ENV === "production" || process.env.NODE_ENV === "production";
  if (!isProduction) {
    return rawUrl;
  }

  try {
    const parsed = new URL(rawUrl);
    const isSupabasePooler =
      parsed.hostname.includes("pooler.supabase.com") || parsed.port === "6543";

    if (!isSupabasePooler) {
      return rawUrl;
    }

    if (!parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", "1");
    }
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "15");
    }

    return parsed.toString();
  } catch {
    // If URL parsing fails, return original rawUrl safely
    return rawUrl;
  }
}
