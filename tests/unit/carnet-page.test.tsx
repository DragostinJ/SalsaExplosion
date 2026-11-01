import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
}));
vi.mock("@/lib/monitoring", () => ({ reportError: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    eventRegistration: { findMany: vi.fn() },
    booking: { findMany: vi.fn(), count: vi.fn() },
  },
}));

const dancer = { id: "usr_dancer_1", firstName: "Ana", lastName: "Lopez", currentLevel: "IMPROVER" };

describe("Mi carnet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(dancer as unknown as Awaited<ReturnType<typeof getOrProvisionCurrentUser>>);
    vi.mocked(prisma.eventRegistration.findMany).mockResolvedValue([
      {
        id: "reg_1",
        qrCodeHash: "RF-PASS-7F3A9C21",
        role: "FOLLOW",
        ticketTier: { name: "Full Pass" },
        event: { title: "Made in Cuba Weekend", slug: "made-in-cuba", startDate: new Date("2026-12-04T19:00:00Z"), venueName: "BOH Studios" },
      },
    ] as never);
    vi.mocked(prisma.booking.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.booking.count).mockResolvedValue(12);
  });

  it("only ever queries the signed-in dancer's own passes and bookings", async () => {
    const { default: CarnetPage } = await import("@/app/dashboard/carnet/page");
    renderToStaticMarkup(await CarnetPage());

    const calls = [
      ...vi.mocked(prisma.eventRegistration.findMany).mock.calls,
      ...vi.mocked(prisma.booking.findMany).mock.calls,
      ...vi.mocked(prisma.booking.count).mock.calls,
    ];
    expect(calls.length).toBe(4);
    for (const [args] of calls) {
      expect((args as { where: { userId: string } }).where.userId).toBe(dancer.id);
    }
  });

  it("shows each festival pass with a real QR code and the next stamp", async () => {
    const { default: CarnetPage } = await import("@/app/dashboard/carnet/page");
    const html = renderToStaticMarkup(await CarnetPage());

    expect(html).toContain("Made in Cuba Weekend");
    expect(html).toContain('data-testid="scannable-qr-code"');
    expect(html).toContain("RF-PASS-7F3A9C21");
    // 12 classes danced: the 10-class stamp is earned, 13 to go for the 25-class one
    expect(html).toContain("13 more classes to your 25-class stamp.");
    expect(html).toContain(">10<");
  });
});
