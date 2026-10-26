import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { DanceRole } from "@prisma/client";
import { isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";

const { mockFallbackUser } = vi.hoisted(() => ({
  mockFallbackUser: {
    id: "fallback-user_test",
    clerkId: "user_test",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "STUDENT" as const,
    currentLevel: "BEGINNER" as const,
    preferredRole: "LEAD" as const,
    classCredits: 5,
  },
}));

vi.mock("@/lib/auth-user", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/auth-user")>();
  return {
    ...mod,
    getOrProvisionCurrentUser: vi.fn().mockResolvedValue(mockFallbackUser),
  };
});

describe("M1: Fallback User Guard for Mutating Server Actions", () => {
  it("correctly identifies fallback users by prefix", () => {
    expect(isFallbackUser({ id: "fallback-user_123" })).toBe(true);
    expect(isFallbackUser({ id: "fallback-clerk_abc" })).toBe(true);
    expect(isFallbackUser({ id: "cuid1234567890" })).toBe(false);
    expect(isFallbackUser({ id: "usr_9999" })).toBe(false);
    expect(typeof SERVICE_UNAVAILABLE_MESSAGE).toBe("string");
  });

  it("statically verifies all mutating actions guard against fallback users", () => {
    const actionsDir = path.resolve(__dirname, "../../src/actions");

    function getFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getFiles(fullPath));
        } else if (entry.name.endsWith(".ts")) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const allActionFiles = getFiles(actionsDir);
    expect(allActionFiles.length).toBeGreaterThan(5);

    for (const filePath of allActionFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("getOrProvisionCurrentUser(")) {
          // Check preceding 3 lines or succeeding 25 lines
          const startLine = Math.max(0, i - 3);
          const endLine = Math.min(lines.length, i + 25);
          const windowText = lines.slice(startLine, endLine).join("\n");

          const hasGuardMarker =
            windowText.includes("// fallback-guard") ||
            windowText.includes("// fallback-guard-exempt");

          expect(
            hasGuardMarker,
            `Expected fallback marker around line ${i + 1} in ${path.relative(actionsDir, filePath)}`
          ).toBe(true);

          if (!windowText.includes("// fallback-guard-exempt")) {
            expect(
              windowText.includes("isFallbackUser("),
              `Expected isFallbackUser call around line ${i + 1} in ${path.relative(actionsDir, filePath)}`
            ).toBe(true);
          }
        }
      }
    }
  });

  describe("behavioural failure on fallback user", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("blocks class booking when user is fallback", async () => {
      const { bookClassAction } = await import("@/actions/booking.actions");
      const res = await bookClassAction({
        classSessionId: "class-1",
        danceRole: DanceRole.LEAD,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
        expect(res.error.message).toContain("can't reach our booking system");
      }
    });

    it("blocks cancel booking when user is fallback", async () => {
      const { cancelBookingAction } = await import("@/actions/booking.actions");
      const res = await cancelBookingAction({ bookingId: "b-1" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
      }
    });

    it("blocks checkout session creation when user is fallback", async () => {
      const { createCheckoutSessionAction } = await import("@/actions/checkout.actions");
      const res = await createCheckoutSessionAction({ packageId: "PACK_SINGLE" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
      }
    });

    it("blocks event registration when user is fallback", async () => {
      const { registerForEventTierAction } = await import("@/actions/management/events.actions");
      const res = await registerForEventTierAction({
        eventId: "event-1",
        ticketTierId: "tier-1",
        role: DanceRole.LEAD,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("SERVICE_UNAVAILABLE");
      }
    });
  });
});
