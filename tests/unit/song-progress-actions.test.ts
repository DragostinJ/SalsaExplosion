import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-user", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/auth-user")>();
  return { ...mod, getOrProvisionCurrentUser: vi.fn() };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    songSectionProgress: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { getMySongProgressAction, setSongSectionMasteredAction } from "@/actions/song-progress.actions";

function user(id: string) {
  return {
    id,
    clerkId: `clerk_${id}`,
    email: `${id}@example.com`,
    firstName: "Test",
    lastName: "Dancer",
    role: "STUDENT" as const,
    currentLevel: "BEGINNER" as const,
    preferredRole: "LEAD" as const,
    classCredits: 0,
  } as Awaited<ReturnType<typeof getOrProvisionCurrentUser>>;
}

describe("song section progress actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.songSectionProgress.findMany).mockResolvedValue([
      { sectionId: "mdc-seg-2" },
    ] as never);
  });

  it("signed-out visitors get no progress and cannot save", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(null);
    expect(await getMySongProgressAction("me-dicen-cuba")).toEqual({ signedIn: false, masteredSectionIds: [] });
    const result = await setSongSectionMasteredAction({ songId: "me-dicen-cuba", sectionId: "mdc-seg-2", mastered: true });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("UNAUTHORIZED");
    expect(prisma.songSectionProgress.upsert).not.toHaveBeenCalled();
  });

  it("reads progress scoped to the signed-in user only", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(user("user_a"));
    const snapshot = await getMySongProgressAction("me-dicen-cuba");
    expect(snapshot).toEqual({ signedIn: true, masteredSectionIds: ["mdc-seg-2"] });
    expect(prisma.songSectionProgress.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user_a", songId: "me-dicen-cuba" } })
    );
  });

  it("marks and unmarks a section for the current user", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(user("user_a"));
    const marked = await setSongSectionMasteredAction({ songId: "me-dicen-cuba", sectionId: "mdc-seg-2", mastered: true });
    expect(marked.success).toBe(true);
    expect(prisma.songSectionProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: { userId: "user_a", songId: "me-dicen-cuba", sectionId: "mdc-seg-2" } })
    );

    await setSongSectionMasteredAction({ songId: "me-dicen-cuba", sectionId: "mdc-seg-2", mastered: false });
    expect(prisma.songSectionProgress.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_a", songId: "me-dicen-cuba", sectionId: "mdc-seg-2" },
    });
  });

  it("ignores client-supplied user ids (no IDOR) and rejects unknown sections", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(user("user_a"));
    await setSongSectionMasteredAction({
      songId: "me-dicen-cuba",
      sectionId: "mdc-seg-3",
      mastered: true,
      userId: "victim",
    });
    expect(prisma.songSectionProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ userId: "user_a" }) })
    );

    const unknown = await setSongSectionMasteredAction({ songId: "me-dicen-cuba", sectionId: "nope", mastered: true });
    expect(unknown.success).toBe(false);
    if (!unknown.success) expect(unknown.error.code).toBe("VALIDATION_ERROR");
  });

  it("blocks fallback (degraded auth) users from writing", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(user("fallback-user_x"));
    const result = await setSongSectionMasteredAction({ songId: "me-dicen-cuba", sectionId: "mdc-seg-2", mastered: true });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("SERVICE_UNAVAILABLE");
    expect(prisma.songSectionProgress.upsert).not.toHaveBeenCalled();
  });
});
