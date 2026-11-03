import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email/send-email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/monitoring", () => ({ reportError: vi.fn() }));

import { sendEmail } from "@/lib/email/send-email";
import { classCancelledEmail } from "@/lib/email/templates";
import { notifyClassCancelled } from "@/lib/email/notify-class-cancelled";

const thursday = new Date("2026-11-05T19:00:00Z");
const before = new Date("2026-11-05T12:00:00Z");
const dancers = [
  { email: "ana@example.com", firstName: "Ana" },
  { email: "ben@example.com", firstName: "Ben" },
];

describe("classCancelledEmail", () => {
  it("says which class, when, why, and that nothing needs refunding", () => {
    const email = classCancelledEmail({
      firstName: "Ana",
      classTitle: "Cuban Salsa Beginners Foundation",
      startTime: thursday,
      reason: "Enrique is unwell <get well>",
      appUrl: "https://salsa-explosion.vercel.app/",
    });
    expect(email.subject).toBe("Cancelled: Cuban Salsa Beginners Foundation, Thursday 5 November 19:00");
    expect(email.text).toContain("nothing to refund");
    expect(email.text).toContain("https://salsa-explosion.vercel.app/classes");
    expect(email.html).toContain("Enrique is unwell &lt;get well&gt;");
    expect(email.html).not.toContain("<get well>");
  });
});

describe("notifyClassCancelled", () => {
  afterEach(() => vi.clearAllMocks());

  it("emails everyone who said they were coming", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ sent: true, id: "x" });
    const notice = await notifyClassCancelled({ classTitle: "Class", startTime: thursday, reason: "Ill", dancers, now: before });
    expect(notice).toEqual({ emailed: 2, failed: 0, emailOff: false });
    expect(vi.mocked(sendEmail).mock.calls.map(([e]) => e.to)).toEqual(["ana@example.com", "ben@example.com"]);
  });

  it("says when email isn't set up, so the owner knows to tell them", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ sent: false, reason: "dry-run" });
    const notice = await notifyClassCancelled({ classTitle: "Class", startTime: thursday, reason: "Ill", dancers, now: before });
    expect(notice).toEqual({ emailed: 0, failed: 0, emailOff: true });
  });

  it("emails nobody about a class that already started", async () => {
    const notice = await notifyClassCancelled({
      classTitle: "Class",
      startTime: thursday,
      reason: "Ill",
      dancers,
      now: new Date("2026-11-05T19:30:00Z"),
    });
    expect(notice.emailed).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("counts failures without throwing", async () => {
    vi.mocked(sendEmail).mockResolvedValueOnce({ sent: true, id: "x" }).mockRejectedValueOnce(new Error("network"));
    const notice = await notifyClassCancelled({ classTitle: "Class", startTime: thursday, reason: "Ill", dancers, now: before });
    expect(notice).toEqual({ emailed: 1, failed: 1, emailOff: false });
  });
});

describe("private lesson request email", () => {
  it("lists the request for the owner, escaped, with the studio desk link", async () => {
    const { privateLessonRequestEmail } = await import("@/lib/email/templates");
    const email = privateLessonRequestEmail({
      dancerName: "Ana <b>Lopez</b>",
      dancerEmail: "ana@example.com",
      coachName: "Maestro Enrique",
      packageLabel: "1 hour",
      pricePounds: 45,
      preferredSlot: "Thursday 18:00 (Solo)",
      focusTopic: "Turns",
      notes: null,
      deskUrl: "https://salsa-explosion.vercel.app/admin/operations",
    });
    expect(email.subject).toBe("Private lesson request: Ana <b>Lopez</b> with Maestro Enrique");
    expect(email.html).toContain("Ana &lt;b&gt;Lopez&lt;/b&gt;");
    expect(email.text).toContain("Lesson: 1 hour, £45");
    expect(email.text).not.toContain("Notes:");
    expect(email.text).toContain("https://salsa-explosion.vercel.app/admin/operations");
  });

  it("reads the owner's addresses from ADMIN_EMAILS", async () => {
    const { ownerEmails } = await import("@/lib/email/notify-owner");
    expect(ownerEmails(" enrique@example.com, ,not-an-email, owner@example.com ")).toEqual(["enrique@example.com", "owner@example.com"]);
    expect(ownerEmails("")).toEqual([]);
  });
});
