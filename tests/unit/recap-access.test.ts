import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ user: null as null | { id: string; role: "STUDENT" } }));

vi.mock("@/lib/auth-user", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/auth-user")>();
  return { ...mod, getOrProvisionCurrentUser: async () => session.user };
});

vi.mock("@/lib/prisma", () => ({
  prisma: { classSession: { findMany: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { getAllPublishedClassRecapsAction } from "@/actions/recap.actions";

// Server actions are public endpoints: the recap list must check sign-in itself,
// not rely on /dashboard/recaps being behind sign-in.
describe("getAllPublishedClassRecapsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.classSession.findMany).mockResolvedValue([] as never);
  });

  it("refuses someone signed out without touching the database", async () => {
    session.user = null;
    const res = await getAllPublishedClassRecapsAction();
    expect(res).toMatchObject({ success: false, error: { code: "UNAUTHORIZED" } });
    expect(prisma.classSession.findMany).not.toHaveBeenCalled();
  });

  it("lists published recaps for a signed-in dancer", async () => {
    session.user = { id: "dancer-1", role: "STUDENT" };
    const res = await getAllPublishedClassRecapsAction();
    expect(res).toEqual({ success: true, data: [] });
    expect(prisma.classSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ recapPublished: true }) })
    );
  });
});
