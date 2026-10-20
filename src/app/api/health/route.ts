import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = performance.now();
  try {
    // 1. Run raw SQL ping against PostgreSQL to verify connectivity and keep Supabase connection active
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);

    // 2. Storage pruning guard: clean up ProcessedWebhookEvent records older than 60 days
    // to preserve free-tier 500MB storage limit over time.
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    let prunedWebhookEventsCount = 0;
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

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
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
    return NextResponse.json(
      {
        status: "degraded",
        database: "unreachable",
        latencyMs,
        tier: "bootstrap-zero-cost",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Database connection failed",
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
