import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock Clerk and Prisma modules before importing auth-user
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, canSwitchRoles, isBootstrapAdmin } from "@/lib/auth-user";
import { getCurrentUserRoleAction } from "@/actions/management.actions";
import { buildUser } from "./helpers/build-user";

describe("L3: User Provisioning Resilience & Fail-Soft Auth", () => {
  const mockedAuth = vi.mocked(auth);
  const mockedCurrentUser = vi.mocked(currentUser);
  const mockedPrismaUser = vi.mocked(prisma.user);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when Clerk auth() returns no user session", async () => {
    mockedAuth.mockResolvedValueOnce({ userId: null } as unknown as Awaited<ReturnType<typeof auth>>);

    const user = await getOrProvisionCurrentUser();
    expect(user).toBeNull();
  });

  it("catches Clerk auth() unexpected throw and returns null gracefully", async () => {
    mockedAuth.mockRejectedValueOnce(new Error("Clerk API network timeout"));

    const user = await getOrProvisionCurrentUser();
    expect(user).toBeNull();
  });

  it("returns in-memory fallback user when Prisma findUnique throws connection error", async () => {
    mockedAuth.mockResolvedValueOnce({ userId: "user_test123" } as unknown as Awaited<ReturnType<typeof auth>>);
    mockedPrismaUser.findUnique.mockRejectedValueOnce(new Error("P1001: Can't reach database server"));

    const user = await getOrProvisionCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.clerkId).toBe("user_test123");
    expect(user?.firstName).toBe("Dancer");
    expect(user?.role).toBe("STUDENT");
    expect(user?.stripeCustomerId).toBeNull();
  });

  it("returns in-memory fallback user when Prisma upsert throws during first-time login", async () => {
    mockedAuth.mockResolvedValueOnce({ userId: "user_new456" } as unknown as Awaited<ReturnType<typeof auth>>);
    mockedPrismaUser.findUnique.mockResolvedValueOnce(null);
    mockedCurrentUser.mockResolvedValueOnce({
      id: "user_new456",
      firstName: "Maria",
      lastName: "Rodriguez",
      imageUrl: "https://img.clerk.com/maria",
      primaryEmailAddress: { emailAddress: "maria@example.com" },
      emailAddresses: [{ emailAddress: "maria@example.com" }],
    } as unknown as Awaited<ReturnType<typeof currentUser>>);

    mockedPrismaUser.upsert.mockRejectedValueOnce(new Error("P1008: Operations timed out"));

    const user = await getOrProvisionCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.clerkId).toBe("user_new456");
    expect(user?.role).toBe("STUDENT");
  });

  it("handles currentUser() failure gracefully and still provisions user", async () => {
    mockedAuth.mockResolvedValueOnce({ userId: "user_sync789" } as unknown as Awaited<ReturnType<typeof auth>>);
    mockedPrismaUser.findUnique.mockResolvedValueOnce(null);
    mockedCurrentUser.mockRejectedValueOnce(new Error("Clerk currentUser rate limited"));

    const mockCreatedUser = {
      id: "db-user-789",
      clerkId: "user_sync789",
      email: "user_sync789@salsaexplosion.local",
      firstName: "Dancer",
      lastName: "",
      avatarUrl: null,
      bio: null,
      specialty: null,
      yearsDancing: 8,
      role: "STUDENT" as const,
      currentLevel: "BEGINNER" as const,
      preferredRole: "LEAD" as const,
      classCredits: 1,
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: null,
    };

    mockedPrismaUser.upsert.mockResolvedValueOnce(mockCreatedUser);

    const user = await getOrProvisionCurrentUser();
    expect(user).toEqual(mockCreatedUser);
    expect(mockedPrismaUser.upsert).toHaveBeenCalled();
  });

  it("ensures canSwitchRoles safely fails closed on null, undefined, or empty values", () => {
    expect(canSwitchRoles(null)).toBe(false);
    expect(canSwitchRoles(undefined)).toBe(false);
    expect(canSwitchRoles("")).toBe(false);
    expect(canSwitchRoles("unknown@example.com")).toBe(false);
  });

  it("ensures isBootstrapAdmin safely fails closed on null or undefined", () => {
    expect(isBootstrapAdmin(null)).toBe(false);
    expect(isBootstrapAdmin(undefined)).toBe(false);
  });

  describe("getCurrentUserRoleAction (Client Header Role Resolution)", () => {
    it("returns null role and canSwitchRoles: false when no user is logged in", async () => {
      mockedAuth.mockResolvedValueOnce({ userId: null } as unknown as Awaited<ReturnType<typeof auth>>);
      const res = await getCurrentUserRoleAction();
      expect(res).toEqual({ role: null, canSwitchRoles: false });
    });

    it("returns active student role when authenticated student logs in", async () => {
      mockedAuth.mockResolvedValueOnce({ userId: "student_user_1" } as unknown as Awaited<ReturnType<typeof auth>>);
      mockedPrismaUser.findUnique.mockResolvedValueOnce(
        buildUser({
          id: "student-db-1",
          clerkId: "student_user_1",
          email: "dancer@bournemouth.co.uk",
          firstName: "Carlos",
          lastName: "Valdes",
          role: "STUDENT",
        }) as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>
      );

      const res = await getCurrentUserRoleAction();
      expect(res.role).toBe("STUDENT");
      expect(res.canSwitchRoles).toBe(false);
    });

    it("identifies bootstrap admin role accurately", async () => {
      vi.stubEnv("ADMIN_EMAILS", "enrique@salsaexplosion.co.uk");
      mockedAuth.mockResolvedValueOnce({ userId: "admin_user_1" } as unknown as Awaited<ReturnType<typeof auth>>);
      mockedPrismaUser.findUnique.mockResolvedValueOnce(
        buildUser({
          id: "admin-db-1",
          clerkId: "admin_user_1",
          email: "enrique@salsaexplosion.co.uk",
          firstName: "Enrique",
          lastName: "Perez Valdes",
          role: "ADMIN",
        }) as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>
      );

      const res = await getCurrentUserRoleAction();
      expect(res.role).toBe("ADMIN");
      expect(mockedPrismaUser.upsert).not.toHaveBeenCalled();
      expect(mockedCurrentUser).not.toHaveBeenCalled();
    });

    it("returns canSwitchRoles: true and stored role for whitelisted demo switcher email", async () => {
      vi.stubEnv("ALLOW_DEMO_ROLE_SWITCHING", "true");
      vi.stubEnv("DEMO_SWITCHER_EMAILS", "pitch@studio.com");
      mockedAuth.mockResolvedValueOnce({ userId: "demo_user_1" } as unknown as Awaited<ReturnType<typeof auth>>);
      mockedPrismaUser.findUnique.mockResolvedValueOnce(
        buildUser({
          id: "demo-db-1",
          clerkId: "demo_user_1",
          email: "pitch@studio.com",
          firstName: "Pitch",
          lastName: "Owner",
          role: "INSTRUCTOR",
        }) as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>
      );

      const res = await getCurrentUserRoleAction();
      expect(res).toEqual({ role: "INSTRUCTOR", canSwitchRoles: true });
      expect(mockedPrismaUser.upsert).not.toHaveBeenCalled();
      expect(mockedCurrentUser).not.toHaveBeenCalled();
    });

    it("returns null role and canSwitchRoles: false on database rejection", async () => {
      mockedAuth.mockResolvedValueOnce({ userId: "error_user_1" } as unknown as Awaited<ReturnType<typeof auth>>);
      mockedPrismaUser.findUnique.mockRejectedValueOnce(new Error("DB connection terminated"));

      const res = await getCurrentUserRoleAction();
      expect(res).toEqual({ role: null, canSwitchRoles: false });
    });

    it("returns null role and canSwitchRoles: false for unknown user (no row in DB)", async () => {
      mockedAuth.mockResolvedValueOnce({ userId: "unprovisioned_clerk_id" } as unknown as Awaited<ReturnType<typeof auth>>);
      mockedPrismaUser.findUnique.mockResolvedValueOnce(null);

      const res = await getCurrentUserRoleAction();
      expect(res).toEqual({ role: null, canSwitchRoles: false });
    });
  });
});
