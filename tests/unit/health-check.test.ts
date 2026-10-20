import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
    processedWebhookEvent: {
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET, resetHealthCheckPruneThrottleForTests } from "@/app/api/health/route";

describe("Z1 & Z7: Zero-Cost Keep-Alive & Health Check Safeguards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetHealthCheckPruneThrottleForTests();
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns HTTP 200 with status healthy, connected database, latency, and prunes old webhook events", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ 1: 1 }] as never);
    vi.mocked(prisma.processedWebhookEvent.deleteMany).mockResolvedValue({ count: 4 } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.database).toBe("connected");
    expect(typeof data.latencyMs).toBe("number");
    expect(data.tier).toBe("bootstrap-zero-cost");
    expect(data.prunedWebhookEvents).toBe(4);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.processedWebhookEvent.deleteMany).toHaveBeenCalledTimes(1);
  });

  it("throttles webhook pruning to at most once per hour to prevent frequent ping lockups", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ 1: 1 }] as never);
    vi.mocked(prisma.processedWebhookEvent.deleteMany).mockResolvedValue({ count: 4 } as never);

    // First call prunes
    const res1 = await GET();
    const data1 = await res1.json();
    expect(data1.prunedWebhookEvents).toBe(4);
    expect(prisma.processedWebhookEvent.deleteMany).toHaveBeenCalledTimes(1);

    // Second call immediately after should skip pruning
    const res2 = await GET();
    const data2 = await res2.json();
    expect(data2.prunedWebhookEvents).toBe(0);
    expect(prisma.processedWebhookEvent.deleteMany).toHaveBeenCalledTimes(1);
  });

  it("continues gracefully with HTTP 200 even if webhook pruning rejects", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ 1: 1 }] as never);
    vi.mocked(prisma.processedWebhookEvent.deleteMany).mockRejectedValue(new Error("Table lock timeout") as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.database).toBe("connected");
    expect(data.prunedWebhookEvents).toBe(0);
  });

  it("returns HTTP 503 degraded with error details in development/test", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("P1001: Cannot reach database server"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("degraded");
    expect(data.database).toBe("unreachable");
    expect(data.error).toContain("P1001");
  });

  it("sanitizes HTTP 503 error message in production to prevent leaking database credentials or hostnames", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Connection to postgresql://postgres:secretpw@aws-0-eu-west-2.pooler.supabase.com:6543/postgres failed"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("degraded");
    expect(data.database).toBe("unreachable");
    expect(data.error).toBe("Database connection unavailable");
    expect(data.error).not.toContain("secretpw");
    expect(data.error).not.toContain("supabase.com");
  });
});
