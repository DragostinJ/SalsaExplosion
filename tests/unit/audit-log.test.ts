import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditAction, Role } from "@prisma/client";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(
    new Map([
      ["x-forwarded-for", "203.0.113.195, 70.41.3.18"],
      ["x-real-ip", "203.0.113.195"],
    ])
  ),
}));

import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit-log";

describe("A6: Forensic Audit Trail & AuditLog Model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully persists an audit log entry with resolved client IP and metadata", async () => {
    const mockCreated = {
      id: "audit-log-123",
      actorId: "admin-user-id",
      action: AuditAction.ROLE_CHANGE,
      targetType: "USER",
      targetId: "admin-user-id",
      metadata: { previousRole: Role.STUDENT, newRole: Role.ADMIN },
      ip: "203.0.113.195",
      createdAt: new Date(),
    };

    vi.mocked(prisma.auditLog.create).mockResolvedValue(
      mockCreated as unknown as Awaited<ReturnType<typeof prisma.auditLog.create>>
    );

    const result = await recordAuditLog({
      actorId: "admin-user-id",
      action: AuditAction.ROLE_CHANGE,
      targetType: "USER",
      targetId: "admin-user-id",
      metadata: { previousRole: Role.STUDENT, newRole: Role.ADMIN },
    });

    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "admin-user-id",
        action: AuditAction.ROLE_CHANGE,
        targetType: "USER",
        targetId: "admin-user-id",
        ip: "203.0.113.195",
      }),
    });
    expect(result?.id).toBe("audit-log-123");
  });

  it("handles database logger errors gracefully without throwing to protect core transactional flow", async () => {
    vi.mocked(prisma.auditLog.create).mockRejectedValue(new Error("DB connection timeout"));

    const result = await recordAuditLog({
      actorId: "instructor-1",
      action: AuditAction.CREDIT_ADJUSTMENT,
      targetType: "USER",
      targetId: "student-1",
      metadata: { delta: 10, reason: "Courtesy top-up" },
    });

    expect(result).toBeNull();
  });

  it("supports all required sensitive operation audit action types", () => {
    const requiredActions: AuditAction[] = [
      AuditAction.ROLE_CHANGE,
      AuditAction.CREDIT_ADJUSTMENT,
      AuditAction.LEVEL_PROMOTION,
      AuditAction.CSV_EXPORT,
      AuditAction.EVENT_MUTATION,
      AuditAction.REFUND,
    ];

    expect(requiredActions).toHaveLength(6);
    expect(Object.values(AuditAction)).toEqual(expect.arrayContaining(requiredActions));
  });
});
