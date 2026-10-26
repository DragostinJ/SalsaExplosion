/**
 * Structured Redacting Error Reporter Seam (M12)
 *
 * Safe to import in both Server and Client Components (dependency-free).
 * Automatically redacts database connection strings, Stripe keys, webhook secrets,
 * and Bearer authentication tokens before emitting structured JSON logs.
 */

const REDACTION_PATTERNS: RegExp[] = [
  /postgres(ql)?:\/\/[^\s"'`]+/gi,
  /sk_(live|test)_[A-Za-z0-9]+/gi,
  /whsec_[A-Za-z0-9]+/gi,
  /Bearer\s+[A-Za-z0-9._-]+/gi,
];

function redactSensitiveData(raw: string): string {
  let cleaned = raw;
  for (const pattern of REDACTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[REDACTED_SECRET]");
  }
  return cleaned;
}

export function reportError(
  scope: string,
  err: unknown,
  context?: Record<string, string | number | boolean | null>
): void {
  try {
    let message = "Unknown error";
    let name = "Error";
    let stack: string | undefined = undefined;
    let digest: string | undefined = undefined;

    if (err instanceof Error) {
      message = err.message;
      name = err.name;
      stack = err.stack;
      if ("digest" in err && typeof (err as { digest?: unknown }).digest === "string") {
        digest = (err as { digest: string }).digest;
      }
    } else if (err && typeof err === "object") {
      if ("message" in err && typeof (err as { message?: unknown }).message === "string") {
        message = (err as { message: string }).message;
      } else {
        message = String(err);
      }
      if ("name" in err && typeof (err as { name?: unknown }).name === "string") {
        name = (err as { name: string }).name;
      }
      if ("digest" in err && typeof (err as { digest?: unknown }).digest === "string") {
        digest = (err as { digest: string }).digest;
      }
    } else {
      message = String(err);
    }

    const payload = {
      level: "error",
      scope,
      message: redactSensitiveData(message),
      name,
      ...(digest ? { digest } : {}),
      ...(stack ? { stack: redactSensitiveData(stack) } : {}),
      ...(context ? { context } : {}),
      ts: new Date().toISOString(),
    };

    // FUTURE: forward to Sentry here (e.g. Sentry.captureException(err, { extra: payload }))

    try {
      console.error(JSON.stringify(payload));
    } catch {
      // Fallback if circular reference or non-serializable object
      console.error(
        JSON.stringify({
          level: "error",
          scope,
          message: redactSensitiveData(message),
          name,
          ts: payload.ts,
        })
      );
    }
  } catch {
    // Fail completely safe without crashing caller
  }
}
