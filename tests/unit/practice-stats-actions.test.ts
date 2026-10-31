import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-user", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/auth-user")>();
  return { ...mod, requireRole: vi.fn() };
});

vi.mock("@/lib/ratelimit", () => ({
  getRateLimitIdentifier: vi.fn().mockResolvedValue("ip:test"),
  withRateLimit: vi.fn((_id: string, _action: string, fn: () => Promise<unknown>) => fn()),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    practiceSectionStat: {
      upsert: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import { requireRole } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { getPracticeHotspotsAction, recordPracticeEventAction } from "@/actions/practice-stats.actions";

describe("practice hotspots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.practiceSectionStat.upsert).mockResolvedValue({} as never);
  });

  it("counts a loop or replay for a real section, keyed by day, with no user data", async () => {
    expect(await recordPracticeEventAction({ songId: "me-dicen-cuba", sectionId: "mdc-seg-2", kind: "loop" })).toEqual({
      recorded: true,
    });
    const call = vi.mocked(prisma.practiceSectionStat.upsert).mock.calls[0][0];
    expect(call.update).toEqual({ loops: { increment: 1 } });
    expect(call.create).toMatchObject({ songId: "me-dicen-cuba", sectionId: "mdc-seg-2", loops: 1, replays: 0 });
    expect(Object.keys(call.create).sort()).toEqual(["day", "loops", "replays", "sectionId", "songId"]);
    expect((call.create.day as Date).getUTCHours()).toBe(0);
  });

  it("ignores unknown songs/sections and bad input without touching the database", async () => {
    expect((await recordPracticeEventAction({ songId: "nope", sectionId: "mdc-seg-2", kind: "loop" })).recorded).toBe(false);
    expect((await recordPracticeEventAction({ songId: "me-dicen-cuba", sectionId: "nope", kind: "replay" })).recorded).toBe(false);
    expect(
      (await recordPracticeEventAction({ songId: "me-dicen-cuba", sectionId: "mdc-seg-2", kind: "hack" as "loop" })).recorded
    ).toBe(false);
    expect(prisma.practiceSectionStat.upsert).not.toHaveBeenCalled();
  });

  it("never throws to the player when the database fails", async () => {
    vi.mocked(prisma.practiceSectionStat.upsert).mockRejectedValue(new Error("db down"));
    expect(await recordPracticeEventAction({ songId: "me-dicen-cuba", sectionId: "mdc-seg-2", kind: "replay" })).toEqual({
      recorded: false,
    });
  });

  it("ranks hotspots by loops + replays and names the sections", async () => {
    vi.mocked(requireRole).mockResolvedValue({ id: "t", role: "INSTRUCTOR" } as Awaited<ReturnType<typeof requireRole>>);
    vi.mocked(prisma.practiceSectionStat.groupBy).mockResolvedValue([
      { songId: "me-dicen-cuba", sectionId: "mdc-seg-2", _sum: { loops: 1, replays: 1 } },
      { songId: "tremenda-pinta", sectionId: "tp-seg-6", _sum: { loops: 5, replays: 2 } },
      { songId: "removed", sectionId: "x", _sum: { loops: 99, replays: 0 } },
    ] as never);
    const hotspots = await getPracticeHotspotsAction(30);
    expect(hotspots.map((spot) => spot.sectionId)).toEqual(["tp-seg-6", "mdc-seg-2"]);
    expect(hotspots[0]).toMatchObject({ songTitle: "Tremenda Pinta", loops: 5, replays: 2, startTimeSeconds: 175 });
  });
});
