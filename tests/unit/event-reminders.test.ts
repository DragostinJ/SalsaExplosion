import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: { event: { findMany: vi.fn() } } }));
vi.mock("@/lib/email/send-email", () => ({ sendEmail: vi.fn(), isEmailConfigured: () => true }));
vi.mock("@/lib/email/unsubscribe-token", () => ({ buildUnsubscribeUrl: (app: string, id: string) => `${app}/u?u=${id}` }));
vi.mock("@/lib/monitoring", () => ({ reportError: vi.fn() }));

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send-email";
import { eventReminderEmail } from "@/lib/email/templates";
import { GET } from "@/app/api/cron/event-reminders/route";

const authed = () => new Request("http://x/api/cron/event-reminders", { headers: { authorization: "Bearer test-cron-secret" } });

describe("festival reminders", () => {
  beforeEach(() => vi.stubEnv("CRON_SECRET", "test-cron-secret"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("refuses without the cron secret", async () => {
    const res = await GET(new Request("http://x/api/cron/event-reminders"));
    expect(res.status).toBe(401);
  });

  it("looks only at published events starting 36 to 60 hours from now", async () => {
    vi.mocked(prisma.event.findMany).mockResolvedValue([] as never);
    const before = Date.now();
    await GET(authed());
    const where = vi.mocked(prisma.event.findMany).mock.calls[0][0]?.where as { startDate: { gte: Date; lt: Date }; status: string };
    expect(where.status).toBe("PUBLISHED");
    expect(Math.round((where.startDate.gte.getTime() - before) / 3_600_000)).toBe(36);
    expect(Math.round((where.startDate.lt.getTime() - before) / 3_600_000)).toBe(60);
  });

  it("sends one email per dancer listing all their passes", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ sent: true, id: "x" });
    vi.mocked(prisma.event.findMany).mockResolvedValue([
      {
        slug: "made-in-cuba",
        title: "Made in Cuba",
        startDate: new Date("2026-12-04T18:00:00Z"),
        venueName: "BOH Studios",
        venueAddress: "104 Commercial Rd",
        registrations: [
          { user: { id: "u1", email: "ana@example.com", firstName: "Ana" }, ticketTier: { name: "Full Pass" } },
          { user: { id: "u1", email: "ana@example.com", firstName: "Ana" }, ticketTier: { name: "Party Pass" } },
          { user: { id: "u2", email: "ben@example.com", firstName: "Ben" }, ticketTier: { name: "Party Pass" } },
        ],
      },
    ] as never);

    const body = await (await GET(authed())).json();
    expect(body).toMatchObject({ events: 1, sent: 2, failed: 0 });
    const toAna = vi.mocked(sendEmail).mock.calls.find(([e]) => e.to === "ana@example.com")?.[0];
    expect(toAna?.text).toContain("Your passes: Full Pass, Party Pass.");
  });
});

describe("eventReminderEmail", () => {
  it("gives the day, time, venue, passes and links, escaped", () => {
    const email = eventReminderEmail({
      firstName: "Ana",
      eventTitle: "SB&K <Night>",
      startDate: new Date("2026-11-14T19:30:00Z"),
      venueName: "BOH Studios",
      venueAddress: "104 Commercial Rd",
      passNames: ["Party Pass"],
      appUrl: "https://salsa-explosion.vercel.app/",
      eventSlug: "sbk-night",
      unsubscribeUrl: "https://salsa-explosion.vercel.app/u",
    });
    expect(email.subject).toBe("SB&K <Night>: Saturday 14 November at 19:30");
    expect(email.html).toContain("SB&amp;K &lt;Night&gt;");
    expect(email.text).toContain("https://salsa-explosion.vercel.app/events/sbk-night");
    expect(email.text).toContain("Your pass: Party Pass.");
    expect(email.headers["List-Unsubscribe"]).toBe("<https://salsa-explosion.vercel.app/u>");
  });
});
