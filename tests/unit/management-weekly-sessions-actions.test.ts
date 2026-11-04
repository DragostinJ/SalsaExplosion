/**
 * Weekly Sessions Management Action Unit Suite
 *
 * Protects:
 * 1. Role enforcement & resilience: Refuses dancers (STUDENT) and fallback users; permits INSTRUCTOR and ADMIN.
 * 2. Accurate operational feedback: Distinct success messages for "added N" vs "all already there".
 * 3. Forensic audit logging: Writes an AuditLog record only when new sessions are actually created.
 * 4. Error handling: Graceful handling of missing faculty and unexpected runtime exceptions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditAction, Role } from "@prisma/client";
import { createUpcomingWeeklyClassesAction } from "@/actions/management/weekly-sessions.actions";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth-user module
vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
  SERVICE_UNAVAILABLE_MESSAGE: "We can't reach our booking system right now. Please try again in a minute.",
}));

// Mock audit-log
const { recordAuditLogMock } = vi.hoisted(() => ({
  recordAuditLogMock: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: recordAuditLogMock,
}));

// Mock monitoring
const { reportErrorMock } = vi.hoisted(() => ({
  reportErrorMock: vi.fn(),
}));

vi.mock("@/lib/monitoring", () => ({
  reportError: reportErrorMock,
}));

// Mock ensureWeeklySessions
const { ensureWeeklySessionsMock } = vi.hoisted(() => ({
  ensureWeeklySessionsMock: vi.fn(),
}));

vi.mock("@/lib/schedule/ensure-weekly-sessions", () => ({
  ensureWeeklySessions: ensureWeeklySessionsMock,
}));

import { revalidatePath } from "next/cache";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";

describe("management/weekly-sessions.actions: Authorization & Resilience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses unauthenticated callers with FORBIDDEN", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(null);

    const res = await createUpcomingWeeklyClassesAction();
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("FORBIDDEN");
      expect(res.error.message).toMatch(/Only teachers and the owner/i);
    }
    expect(ensureWeeklySessionsMock).not.toHaveBeenCalled();
  });

  it("refuses dancers (STUDENT role) with FORBIDDEN", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "student-1",
      role: Role.STUDENT,
    } as never);

    const res = await createUpcomingWeeklyClassesAction();
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("FORBIDDEN");
    }
    expect(ensureWeeklySessionsMock).not.toHaveBeenCalled();
  });

  it("refuses fallback users with SERVICE_UNAVAILABLE", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "fallback-admin-1",
      role: Role.ADMIN,
    } as never);

    const res = await createUpcomingWeeklyClassesAction();
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
    }
    expect(ensureWeeklySessionsMock).not.toHaveBeenCalled();
  });
});

describe("management/weekly-sessions.actions: Execution, Messages & Audit Logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue({
      id: "admin-enrique",
      role: Role.ADMIN,
    } as never);
  });

  it("adds N classes, emits AuditLog, revalidates paths, and formats success message", async () => {
    ensureWeeklySessionsMock.mockResolvedValue({
      created: 20,
      alreadyThere: 0,
      planned: 20,
      createdTitles: ["Cuban Salsa Beginners Foundation"],
      skipped: [],
      until: new Date("2026-12-03T00:00:00Z"),
    });

    const res = await createUpcomingWeeklyClassesAction();

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toEqual({ created: 20, alreadyThere: 0, skipped: 0 });
      expect(res.message).toBe("Added 20 classes from the timetable.");
    }

    // Emits audit log entry
    expect(recordAuditLogMock).toHaveBeenCalledWith({
      actorId: "admin-enrique",
      action: AuditAction.EVENT_MUTATION,
      targetType: "CLASS_SESSION",
      metadata: expect.objectContaining({
        mutation: "CREATE_WEEKLY_FROM_TIMETABLE",
        created: 20,
      }),
    });

    // Revalidates public schedule and admin pages
    expect(revalidatePath).toHaveBeenCalledWith("/classes");
    expect(revalidatePath).toHaveBeenCalledWith("/instructor/roster");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/classes");
  });

  it("reports 'all already there' and writes NO audit log when created is 0", async () => {
    ensureWeeklySessionsMock.mockResolvedValue({
      created: 0,
      alreadyThere: 20,
      planned: 20,
      createdTitles: [],
      skipped: [],
      until: new Date("2026-12-03T00:00:00Z"),
    });

    const res = await createUpcomingWeeklyClassesAction();

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toEqual({ created: 0, alreadyThere: 20, skipped: 0 });
      expect(res.message).toBe("All 20 classes for the next 4 weeks are already there.");
    }

    // Must NOT write an audit log if nothing was created
    expect(recordAuditLogMock).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("includes skipped notes when festival or party overlaps studio slots", async () => {
    ensureWeeklySessionsMock.mockResolvedValue({
      created: 19,
      alreadyThere: 0,
      planned: 20,
      createdTitles: ["Cuban Salsa Beginners Foundation"],
      skipped: [{ title: "Sunday Masterclass", reason: "overlaps festival" }],
      until: new Date("2026-12-03T00:00:00Z"),
    });

    const res = await createUpcomingWeeklyClassesAction();

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.skipped).toBe(1);
      expect(res.message).toContain("1 skipped because a festival or party uses the hall that night.");
    }
  });

  it("handles NO_STAFF error gracefully when database has no instructor accounts", async () => {
    ensureWeeklySessionsMock.mockResolvedValue({
      created: 0,
      alreadyThere: 0,
      planned: 0,
      createdTitles: [],
      skipped: [],
      error: "No teacher or owner account in database",
    });

    const res = await createUpcomingWeeklyClassesAction();

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("NO_STAFF");
      expect(res.error.message).toMatch(/No teacher/i);
    }
    expect(recordAuditLogMock).not.toHaveBeenCalled();
  });

  it("catches unexpected exceptions, reports error to monitoring, and returns INTERNAL_ERROR", async () => {
    ensureWeeklySessionsMock.mockRejectedValue(new Error("Database connection dropped"));

    const res = await createUpcomingWeeklyClassesAction();

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("INTERNAL_ERROR");
      expect(res.error.message).toMatch(/Couldn't create the classes/i);
    }
    expect(reportErrorMock).toHaveBeenCalledWith(
      "action:createUpcomingWeeklyClasses",
      expect.any(Error)
    );
  });
});
