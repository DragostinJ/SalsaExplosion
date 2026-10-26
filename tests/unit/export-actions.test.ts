import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role } from "@prisma/client";
import {
  exportRevenueLedgerCsvAction,
  exportStudentRosterCsvAction,
} from "@/actions/export.actions";
import { requireRole } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth-user", () => ({
  requireRole: vi.fn(),
  ADMIN_ONLY: [Role.ADMIN],
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/ratelimit", () => ({
  withRateLimit: vi.fn((_id: string, _action: string, fn: () => Promise<unknown>) => fn()),
  getRateLimitIdentifier: vi.fn().mockResolvedValue("test-admin-id"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    creditLedger: {
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    eventRegistration: {
      findMany: vi.fn(),
    },
    privateLessonBooking: {
      findMany: vi.fn(),
    },
    merchReservation: {
      findMany: vi.fn(),
    },
  },
}));

describe("H2: Admin Export Actions Authorization & Zod Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-admin users attempting to export revenue ledger", async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error("Unauthorized: ADMIN role required"));

    await expect(exportRevenueLedgerCsvAction()).rejects.toThrow(
      "Unauthorized: ADMIN role required"
    );
  });

  it("rejects non-admin users attempting to export student roster", async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error("Unauthorized: ADMIN role required"));

    await expect(exportStudentRosterCsvAction()).rejects.toThrow(
      "Unauthorized: ADMIN role required"
    );
  });

  it("rejects invalid input options that violate the zod schema", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "admin_123",
      email: "enrique@salsaexplosion.co.uk",
      role: Role.ADMIN,
    } as unknown as Awaited<ReturnType<typeof requireRole>>);

    // Pass invalid format (only "csv" is permitted)
    await expect(
      exportRevenueLedgerCsvAction({ format: "xml" as unknown as "csv" })
    ).rejects.toThrow();
  });

  it("allows verified admin to export student roster with sanitized CSV headers", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "admin_123",
      email: "enrique@salsaexplosion.co.uk",
      role: Role.ADMIN,
    } as unknown as Awaited<ReturnType<typeof requireRole>>);

    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: "usr_1",
        firstName: "Maria",
        lastName: "Perez",
        email: "maria@example.com",
        role: Role.STUDENT,
        currentLevel: "IMPROVER",
        preferredRole: "FOLLOWER",
        classCredits: 5,
        subscription: null,
        createdAt: new Date("2026-01-15T12:00:00Z"),
      } as unknown as Awaited<ReturnType<typeof prisma.user.findMany>>[0],
    ]);

    const result = await exportStudentRosterCsvAction();
    expect(result.success).toBe(true);
    expect(result.filename).toMatch(/^salsa-explosion-student-roster-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(result.csvContent).toContain('"User ID","First Name","Last Name","Email Address"');
    expect(result.csvContent).toContain('"Maria"');
  });
});
