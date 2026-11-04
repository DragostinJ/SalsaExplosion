/**
 * Management Merch Actions Unit Test Suite
 *
 * Protects:
 * 1. Staff-only fulfillment: Only INSTRUCTOR and ADMIN can update merchandise reservation status;
 *    unauthenticated callers and students are refused with FORBIDDEN.
 * 2. Database degradation resilience: Refuses fallback users with SERVICE_UNAVAILABLE.
 * 3. Validation: Enforces valid reservation status transitions (RESERVED, COLLECTED, CANCELLED) and non-empty ID.
 * 4. Record isolation: Non-existent or arbitrary IDs return NOT_FOUND and cannot mutate unintended records.
 * 5. Forensic audit logging: Writes an EVENT_MUTATION audit record capturing staff ID, target ID, and status transition.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditAction, Role } from "@prisma/client";
import { updateMerchReservationStatusAction } from "@/actions/management/merch.actions";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth-user
const { getOrProvisionCurrentUserMock } = vi.hoisted(() => ({
  getOrProvisionCurrentUserMock: vi.fn(),
}));

vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: getOrProvisionCurrentUserMock,
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
  SERVICE_UNAVAILABLE_MESSAGE:
    "We can't reach our booking system right now. Please try again in a minute.",
}));

// Mock audit-log
const { recordAuditLogMock } = vi.hoisted(() => ({
  recordAuditLogMock: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: recordAuditLogMock,
}));

// Mock Prisma
const { prismaMerchReservationMock } = vi.hoisted(() => ({
  prismaMerchReservationMock: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    merchReservation: prismaMerchReservationMock,
  },
}));

describe("src/actions/management/merch.actions.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses unauthenticated callers and students with FORBIDDEN", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue(null);

    const unauthRes = await updateMerchReservationStatusAction({
      reservationId: "res-1",
      status: "COLLECTED",
    });
    expect(unauthRes.success).toBe(false);
    if (!unauthRes.success) {
      expect(unauthRes.error.code).toBe("FORBIDDEN");
    }

    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "student-1",
      role: Role.STUDENT,
    });

    const studentRes = await updateMerchReservationStatusAction({
      reservationId: "res-1",
      status: "COLLECTED",
    });
    expect(studentRes.success).toBe(false);
    if (!studentRes.success) {
      expect(studentRes.error.code).toBe("FORBIDDEN");
    }
    expect(prismaMerchReservationMock.update).not.toHaveBeenCalled();
  });

  it("refuses fallback users under degraded pooler conditions", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "fallback-staff",
      role: Role.INSTRUCTOR,
    });

    const res = await updateMerchReservationStatusAction({
      reservationId: "res-1",
      status: "COLLECTED",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
    }
    expect(prismaMerchReservationMock.update).not.toHaveBeenCalled();
  });

  it("validates reservationId and status enum", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "staff-1",
      role: Role.INSTRUCTOR,
    });

    const emptyIdRes = await updateMerchReservationStatusAction({
      reservationId: "",
      status: "COLLECTED",
    });
    expect(emptyIdRes.success).toBe(false);
    if (!emptyIdRes.success) {
      expect(emptyIdRes.error.code).toBe("VALIDATION_ERROR");
    }

    const badStatusRes = await updateMerchReservationStatusAction({
      reservationId: "res-1",
      status: "SHIPPED_FEDEX" as unknown as "COLLECTED",
    });
    expect(badStatusRes.success).toBe(false);
    if (!badStatusRes.success) {
      expect(badStatusRes.error.code).toBe("VALIDATION_ERROR");
    }
    expect(prismaMerchReservationMock.update).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when reservation record does not exist", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "staff-1",
      role: Role.ADMIN,
    });
    prismaMerchReservationMock.findUnique.mockResolvedValue(null);

    const res = await updateMerchReservationStatusAction({
      reservationId: "non-existent-res",
      status: "COLLECTED",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("NOT_FOUND");
    }
    expect(prismaMerchReservationMock.update).not.toHaveBeenCalled();
    expect(recordAuditLogMock).not.toHaveBeenCalled();
  });

  it("updates reservation status and writes EVENT_MUTATION audit log", async () => {
    getOrProvisionCurrentUserMock.mockResolvedValue({
      id: "staff-1",
      role: Role.ADMIN,
    });
    prismaMerchReservationMock.findUnique.mockResolvedValue({
      id: "res-101",
      status: "RESERVED",
    });
    prismaMerchReservationMock.update.mockResolvedValue({
      id: "res-101",
      status: "COLLECTED",
    });

    const res = await updateMerchReservationStatusAction({
      reservationId: "res-101",
      status: "COLLECTED",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe("COLLECTED");
    }

    expect(prismaMerchReservationMock.update).toHaveBeenCalledWith({
      where: { id: "res-101" },
      data: { status: "COLLECTED" },
    });

    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "staff-1",
        action: AuditAction.EVENT_MUTATION,
        targetType: "MerchReservation",
        targetId: "res-101",
        metadata: { previousStatus: "RESERVED", newStatus: "COLLECTED" },
      })
    );
  });
});
