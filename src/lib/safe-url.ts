/**
 * Safely resolves an application URL for metadataBase or absolute canonical links.
 * Normalizes missing protocols (e.g. "salsaexplosion.co.uk" -> "https://salsaexplosion.co.uk"),
 * strips leading/trailing quotes and spaces, and gracefully falls back to default without throwing.
 */
export function getSafeAppUrl(
  rawUrl?: string | null,
  fallback = "https://salsaexplosion.co.uk"
): URL {
  const fallbackUrl = new URL(fallback);
  if (!rawUrl) return fallbackUrl;

  const trimmed = rawUrl.trim().replace(/^["']+|["']+$/g, "");
  if (!trimmed) return fallbackUrl;

  try {
    const withProto =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    return new URL(withProto);
  } catch {
    return fallbackUrl;
  }
}

/**
 * The site's public origin, e.g. "https://salsa-explosion.vercel.app". Canonical tags, the sitemap,
 * JSON-LD, door QR codes, posters and emails all use it.
 *
 * On the live Vercel deployment, Vercel's production domain wins: it is always a domain attached to
 * the project, and it moves by itself when a custom domain is added. A typed NEXT_PUBLIC_APP_URL can
 * go stale, and a wrong one once pointed all of the above, and paying customers, at a 404.
 * Everywhere else it is NEXT_PUBLIC_APP_URL, then Vercel's production domain, then the school's domain.
 */
export function getSiteOrigin(): string {
  const vercelDomain =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const isLiveVercel = (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV) === "production";
  if (isLiveVercel && vercelDomain) return getSafeAppUrl(vercelDomain).origin;
  return getSafeAppUrl(process.env.NEXT_PUBLIC_APP_URL || vercelDomain).origin;
}

/**
 * Where Stripe sends a buyer back to after checkout. The live site uses the same address as every
 * other link; a preview deployment returns to itself, so a test purchase stays on the preview.
 */
export function getCheckoutBaseUrl(): string {
  if (process.env.VERCEL_ENV === "production") return getSiteOrigin();
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** An absolute link to a page on this site, e.g. siteUrl("/checkin/abc"). */
export function siteUrl(path: string): string {
  return `${getSiteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Determines whether an error thrown during render is a Next.js internal control-flow signal
 * (such as a redirect, notFound, or dynamic rendering bailout) that MUST be rethrown.
 */
export function isNextControlFlowError(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("digest" in err)) {
    return false;
  }
  const digest = String((err as { digest?: unknown }).digest || "");
  return (
    digest === "DYNAMIC_SERVER_USAGE" ||
    digest === "BAILOUT_TO_CLIENT_SIDE_RENDERING" ||
    digest === "NEXT_NOT_FOUND" ||
    digest.startsWith("NEXT_REDIRECT") ||
    digest.startsWith("NEXT_HTTP_ERROR_FALLBACK") ||
    digest.includes("HANGING_PROMISE_REJECTION")
  );
}
