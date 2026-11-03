import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: { classSession: { findMany: vi.fn() } } }));
vi.mock("@/lib/email/send-email", () => ({ sendEmail: vi.fn(), isEmailConfigured: () => true }));
vi.mock("@/lib/email/unsubscribe-token", () => ({ buildUnsubscribeUrl: (app: string, id: string) => `${app}/u?u=${id}` }));
vi.mock("@/lib/monitoring", () => ({ reportError: vi.fn() }));

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send-email";
import { recapNudgeEmail } from "@/lib/email/templates";
import { GET } from "@/app/api/cron/recap-nudges/route";

const authed = () => new Request("http://x/api/cron/recap-nudges", { headers: { authorization: "Bearer test-cron-secret" } });
const teacher = (id: string, firstName: string) => ({ id, email: `${id}@example.com`, firstName });

describe("recap nudges", () => {
  beforeEach(() => vi.stubEnv("CRON_SECRET", "test-cron-secret"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("refuses without the cron secret", async () => {
    expect((await GET(new Request("http://x/api/cron/recap-nudges"))).status).toBe(401);
  });

  it("asks only about classes that ended in the last day, have no recap and weren't cancelled", async () => {
    vi.mocked(prisma.classSession.findMany).mockResolvedValue([] as never);
    const before = Date.now();
    await GET(authed());
    const where = vi.mocked(prisma.classSession.findMany).mock.calls[0][0]?.where as {
      isCancelled: boolean;
      recapRecordedAt: null;
      endTime: { gte: Date; lt: Date };
    };
    expect(where.isCancelled).toBe(false);
    expect(where.recapRecordedAt).toBeNull();
    expect(Math.round((before - where.endTime.gte.getTime()) / 3_600_000)).toBe(24);
  });

  it("sends each teacher one email listing their classes", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ sent: true, id: "x" });
    vi.mocked(prisma.classSession.findMany).mockResolvedValue([
      { title: "Solo Salsa", startTime: new Date("2026-11-05T19:00:00Z"), instructor: teacher("moe", "Moe"), _count: { bookings: 6 } },
      { title: "Intermediates", startTime: new Date("2026-11-05T20:15:00Z"), instructor: teacher("moe", "Moe"), _count: { bookings: 0 } },
      { title: "Beginners", startTime: new Date("2026-11-05T19:00:00Z"), instructor: teacher("enrique", "Enrique"), _count: { bookings: 9 } },
    ] as never);
    const body = await (await GET(authed())).json();
    expect(body).toMatchObject({ classes: 3, teachers: 2, sent: 2 });
    const toMoe = vi.mocked(sendEmail).mock.calls.find(([e]) => e.to === "moe@example.com")?.[0];
    expect(toMoe?.subject).toBe("Add the recaps for 2 classes");
    expect(toMoe?.text).toContain("Solo Salsa (Thursday 19:00, 6 checked in)");
    expect(toMoe?.text).toContain("/dashboard/recaps");
  });
});

describe("recapNudgeEmail", () => {
  it("names the one class in the subject and escapes it", () => {
    const email = recapNudgeEmail({
      firstName: "Justyna",
      classes: [{ title: "Improvers <Partnerwork>", startTime: new Date("2026-11-05T20:15:00Z"), checkedIn: 0 }],
      recapsUrl: "https://salsa-explosion.vercel.app/dashboard/recaps",
      unsubscribeUrl: "https://salsa-explosion.vercel.app/u",
    });
    expect(email.subject).toBe("Add the recap: Improvers <Partnerwork>");
    expect(email.html).toContain("Improvers &lt;Partnerwork&gt;");
    expect(email.text).not.toContain("checked in");
  });
});
