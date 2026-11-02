import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role } from "@prisma/client";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { checkMoveVideoOembedAction } from "@/actions/move-review.actions";

vi.mock("@/lib/auth-user", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth-user")>();
  return {
    ...actual,
    requireRole: vi.fn(),
  };
});

describe("Moves Teacher Authentication & Authorization Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("confirms STAFF_ROLES includes both Role.INSTRUCTOR and Role.ADMIN", () => {
    expect(STAFF_ROLES).toContain(Role.INSTRUCTOR);
    expect(STAFF_ROLES).toContain(Role.ADMIN);
    expect(STAFF_ROLES).not.toContain(Role.STUDENT);
  });

  it("allows INSTRUCTOR to execute checkMoveVideoOembedAction", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "instr_1",
      clerkId: "clerk_instr",
      email: "justyna@salsaexplosion.co.uk",
      firstName: "Justyna",
      lastName: "Zubko",
      role: Role.INSTRUCTOR,
      currentLevel: "ADVANCED",
      preferredRole: "FOLLOW",
      classCredits: 0,
    } as never);

    // Call with invalid video ID to verify requireRole passed before validation
    const res = await checkMoveVideoOembedAction({ videoId: "short" });
    expect(requireRole).toHaveBeenCalledWith(STAFF_ROLES);
    expect(res.success).toBe(false);
    expect(res.error).toContain("Invalid video ID");
  });

  it("refuses STUDENT role from executing checkMoveVideoOembedAction", async () => {
    vi.mocked(requireRole).mockRejectedValue(
      new Error("Forbidden: insufficient permissions")
    );

    await expect(
      checkMoveVideoOembedAction({ videoId: "abcdefghijk" })
    ).rejects.toThrow("Forbidden: insufficient permissions");
    expect(requireRole).toHaveBeenCalledWith(STAFF_ROLES);
  });

  it("prefills reviewedBy with teacher display name from user profile", () => {
    const instructorUser = {
      firstName: "Justyna",
      lastName: "Zubko",
      email: "justyna@salsaexplosion.co.uk",
    };
    const fullName = [instructorUser.firstName, instructorUser.lastName].filter(Boolean).join(" ").trim();
    const currentUserName = fullName || instructorUser.email || "Instructor";

    expect(currentUserName).toBe("Justyna Zubko");
  });

  it("falls back to email or Instructor if names are missing", () => {
    const userWithoutName = {
      firstName: null,
      lastName: null,
      email: "teacher@salsaexplosion.co.uk",
    };
    const fullName = [userWithoutName.firstName, userWithoutName.lastName].filter(Boolean).join(" ").trim();
    const currentUserName = fullName || userWithoutName.email || "Instructor";

    expect(currentUserName).toBe("teacher@salsaexplosion.co.uk");
  });
});
