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
