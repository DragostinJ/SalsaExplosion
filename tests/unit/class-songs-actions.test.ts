import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/auth-user", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/auth-user")>();
  return { ...mod, requireRole: vi.fn() };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    classSession: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { requireRole } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { setClassPracticeSongsAction } from "@/actions/class-songs.actions";
import { MAX_CLASS_PRACTICE_SONGS, summarizeClassSongs } from "@/lib/music/class-songs";

function staff(id: string, role: "INSTRUCTOR" | "ADMIN") {
  return { id, role } as Awaited<ReturnType<typeof requireRole>>;
}

describe("tonight's songs (class practice songs)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.classSession.findUnique).mockResolvedValue({ id: "class-1", instructorId: "teacher-1" } as never);
    vi.mocked(prisma.classSession.update).mockResolvedValue({} as never);
  });

  it("lets the class's own teacher save up to 3 known songs", async () => {
    vi.mocked(requireRole).mockResolvedValue(staff("teacher-1", "INSTRUCTOR"));
    const result = await setClassPracticeSongsAction({
      classSessionId: "class-1",
      songIds: ["me-dicen-cuba", "tremenda-pinta"],
    });
    expect(result.success).toBe(true);
    expect(prisma.classSession.update).toHaveBeenCalledWith({
      where: { id: "class-1" },
      data: { practiceSongIds: ["me-dicen-cuba", "tremenda-pinta"] },
    });
  });

  it("stops a teacher editing someone else's class, but lets an admin", async () => {
    vi.mocked(requireRole).mockResolvedValue(staff("teacher-2", "INSTRUCTOR"));
    const denied = await setClassPracticeSongsAction({ classSessionId: "class-1", songIds: ["me-dicen-cuba"] });
    expect(denied.success).toBe(false);
    if (!denied.success) expect(denied.error.code).toBe("FORBIDDEN");

    vi.mocked(requireRole).mockResolvedValue(staff("owner", "ADMIN"));
    const allowed = await setClassPracticeSongsAction({ classSessionId: "class-1", songIds: ["me-dicen-cuba"] });
    expect(allowed.success).toBe(true);
  });

  it("rejects unknown, duplicate or too many songs without touching the database", async () => {
    vi.mocked(requireRole).mockResolvedValue(staff("teacher-1", "INSTRUCTOR"));
    const cases = [
      ["not-a-song"],
      ["me-dicen-cuba", "me-dicen-cuba"],
      ["me-dicen-cuba", "la-cosa-mala", "aguanile", "pasaporte"].slice(0, MAX_CLASS_PRACTICE_SONGS + 1),
    ];
    for (const songIds of cases) {
      const result = await setClassPracticeSongsAction({ classSessionId: "class-1", songIds });
      expect(result.success, songIds.join(",")).toBe(false);
    }
    expect(prisma.classSession.update).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND for a missing class", async () => {
    vi.mocked(requireRole).mockResolvedValue(staff("owner", "ADMIN"));
    vi.mocked(prisma.classSession.findUnique).mockResolvedValue(null);
    const result = await setClassPracticeSongsAction({ classSessionId: "nope", songIds: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("NOT_FOUND");
  });

  it("summaries keep the teacher's order, clean titles and skip removed songs", () => {
    const songs = summarizeClassSongs(["tremenda-pinta", "removed-song", "me-dicen-cuba"]);
    expect(songs.map((song) => song.id)).toEqual(["tremenda-pinta", "me-dicen-cuba"]);
    expect(songs[0].title).toBe("Tremenda Pinta");
    expect(songs[1]).toEqual({ id: "me-dicen-cuba", title: "Me Dicen Cuba", artist: expect.any(String), style: "Timba" });
  });
});
