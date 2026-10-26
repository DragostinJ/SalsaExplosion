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
});
