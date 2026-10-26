import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

let lastPruneTimestamp = 0;
const PRUNE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour throttle

export function resetHealthCheckPruneThrottleForTests(): void {
  lastPruneTimestamp = 0;
}

export async function GET() {
  const start = performance.now();

  const clerkPub = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "").trim();
  const clerkSec = (process.env.CLERK_SECRET_KEY ?? "").trim();
  const rawAppUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim();

  const clerkPublishableKeyPresent = clerkPub.length > 0;
  const clerkSecretKeyPresent = clerkSec.length > 0;
  const clerkKeyMode: "live" | "test" | "missing" = clerkPub.startsWith("pk_live_")
    ? "live"
    : clerkPub.startsWith("pk_test_")
    ? "test"
    : "missing";

  let appUrlValid = false;
  try {
    if (rawAppUrl) {
      const u = new URL(rawAppUrl.startsWith("http") ? rawAppUrl : `https://${rawAppUrl}`);
      appUrlValid = Boolean(u.hostname);
    }
  } catch {
    appUrlValid = false;
  }

  try {
    // 1. Run raw SQL ping against PostgreSQL to verify connectivity and keep Supabase connection active
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);

    // 2. Storage pruning guard: clean up ProcessedWebhookEvent records older than 60 days
    // Throttled to at most once per hour to prevent table-locking on frequent monitoring pings
    let prunedWebhookEventsCount = 0;
    const now = Date.now();
    if (now - lastPruneTimestamp >= PRUNE_INTERVAL_MS) {
      lastPruneTimestamp = now;
      const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
      try {
        const deleteResult = await prisma.processedWebhookEvent.deleteMany({
          where: {
            createdAt: {
              lt: sixtyDaysAgo,
            },
          },
        });
        prunedWebhookEventsCount = deleteResult.count;
      } catch (pruneErr) {
        console.warn("[HealthCheck] Webhook event cleanup non-critical error:", pruneErr);
      }
    }

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        databaseReachable: true,
        clerkPublishableKeyPresent,
        clerkSecretKeyPresent,
        clerkKeyMode,
        appUrlValid,
        latencyMs,
        tier: "bootstrap-zero-cost",
        prunedWebhookEvents: prunedWebhookEventsCount,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    console.error("[HealthCheck Failed]:", error);

    // In production, NEVER expose internal database connection strings, credentials, or hostnames
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Database connection unavailable"
        : error instanceof Error
        ? error.message
        : "Database connection failed";

    return NextResponse.json(
      {
        status: "degraded",
        database: "unreachable",
        databaseReachable: false,
        clerkPublishableKeyPresent,
        clerkSecretKeyPresent,
        clerkKeyMode,
        appUrlValid,
        latencyMs,
        tier: "bootstrap-zero-cost",
        timestamp: new Date().toISOString(),
        error: errorMessage,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
