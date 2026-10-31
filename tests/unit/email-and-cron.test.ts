import { describe, it, expect, vi, afterEach } from "vitest";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { buildUnsubscribeUrl, signUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/email/unsubscribe-token";
import { classReminderEmail, escapeHtml, formatChange, ownerDigestEmail, type DigestNumbers } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send-email";

const KEY = "a-long-test-secret-0123456789";

describe("cron auth", () => {
  it("only accepts the exact bearer secret and fails closed without one", () => {
    expect(isAuthorizedCronRequest(`Bearer ${KEY}`, KEY)).toBe(true);
    expect(isAuthorizedCronRequest(`Bearer ${KEY}x`, KEY)).toBe(false);
    expect(isAuthorizedCronRequest(null, KEY)).toBe(false);
    expect(isAuthorizedCronRequest("Bearer ", "")).toBe(false);
    expect(isAuthorizedCronRequest("Bearer short", "short")).toBe(false);
  });
});

describe("unsubscribe links", () => {
  it("are signed per user and can't be reused for someone else", () => {
    const token = signUnsubscribeToken("user-1", KEY)!;
    expect(verifyUnsubscribeToken("user-1", token, KEY)).toBe(true);
    expect(verifyUnsubscribeToken("user-2", token, KEY)).toBe(false);
    expect(verifyUnsubscribeToken("user-1", token, "another-long-secret-987654")).toBe(false);
    expect(verifyUnsubscribeToken("user-1", "", KEY)).toBe(false);
  });

  it("can't be made without a strong secret", () => {
    expect(signUnsubscribeToken("user-1", null)).toBeNull();
    expect(buildUnsubscribeUrl("https://x.test/", "user-1", null)).toBeNull();
    expect(buildUnsubscribeUrl("https://x.test/", "user 1", KEY)).toMatch(/^https:\/\/x\.test\/api\/email\/unsubscribe\?u=user%201&t=/);
  });
});

describe("email templates", () => {
  it("escapes everything that came from the database", () => {
    expect(escapeHtml(`<script>"x" & 'y'</script>`)).toBe("&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;");
    const email = classReminderEmail({
      firstName: "<b>Ana</b>",
      classTitle: "Casino & Rueda",
      startTime: new Date("2026-11-05T20:00:00Z"),
      room: "Studio A",
      instructorName: "Mario Ruiz",
      songs: [{ id: "me-dicen-cuba", title: "Me Dicen Cuba", artist: "Havana D'Primera", style: "Timba" }],
      appUrl: "https://salsaexplosion.co.uk/",
      unsubscribeUrl: "https://salsaexplosion.co.uk/api/email/unsubscribe?u=1&t=abc",
    });
    expect(email.html).not.toContain("<b>Ana</b>");
    expect(email.html).toContain("Casino &amp; Rueda");
    expect(email.html).toContain("https://salsaexplosion.co.uk/music/me-dicen-cuba");
    expect(email.text).toContain("Pay at the door");
    expect(email.text).not.toMatch(/stripe|checkout/i);
    expect(email.subject).toBe("Thursday 20:00: Casino & Rueda");
    expect(email.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });

  it("describes week-on-week change", () => {
    expect(formatChange(12, 10)).toBe("+20%");
    expect(formatChange(5, 10)).toBe("-50%");
    expect(formatChange(3, 0)).toBe("new");
    expect(formatChange(0, 0)).toBe("same");
  });

  it("builds the owner digest with revenue in pounds and practice hotspots", () => {
    const numbers: DigestNumbers = {
      classesHeld: 4,
      checkIns: 42,
      uniqueDancers: 30,
      newSignUps: 5,
      festivalTickets: 3,
      festivalRevenueCents: 23500,
    };
    const email = ownerDigestEmail({
      periodLabel: "2 Nov – 9 Nov",
      current: numbers,
      previous: { ...numbers, checkIns: 35 },
      hotspots: [
        { songId: "tremenda-pinta", songTitle: "Tremenda Pinta", sectionId: "tp-seg-6", sectionName: "Despelote", startTimeSeconds: 175, loops: 5, replays: 1 },
      ],
      appUrl: "https://salsaexplosion.co.uk",
    });
    expect(email.subject).toBe("Salsa Explosion weekly: 42 check-ins (+20% vs last week)");
    expect(email.text).toContain("Festival ticket revenue: £235 (same)");
    expect(email.html).toContain("/music/tremenda-pinta?section=tp-seg-6");
  });
});

describe("sending", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is a dry run without RESEND_API_KEY (nothing leaves the server)", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await sendEmail({ to: "a@b.c", subject: "s", html: "h", text: "t" });
    expect(result).toEqual({ sent: false, reason: "dry-run" });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
