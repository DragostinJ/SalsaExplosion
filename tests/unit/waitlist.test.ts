import { describe, it, expect, vi, beforeEach } from "vitest";
import { DanceRole } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    partnerWaitlistEntry: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth-user", () => ({
  getOrProvisionCurrentUser: vi.fn(),
  isFallbackUser: vi.fn((user: { id: string }) => user.id.startsWith("fallback-")),
  SERVICE_UNAVAILABLE_MESSAGE: "We can't reach our booking system right now. Please try again in a minute.",
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { invitePartnerBypassAction } from "@/actions/waitlist.actions";

describe("P3: Multi-Tenant Waitlist & Referral Abuse Guards", () => {
  const mockUser = {
    id: "user-lead-1",
    clerkId: "clerk_lead_1",
    email: "dancer.lead@salsaexplosion.co.uk",
    role: "STUDENT" as const,
    classCredits: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects partner invitation if the user enters their own email address", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockUser as never);

    const result = await invitePartnerBypassAction({
      partnerEmail: "dancer.lead@salsaexplosion.co.uk",
      role: DanceRole.LEAD,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("You cannot invite your own email address as a dance partner.");
    expect(prisma.partnerWaitlistEntry.create).not.toHaveBeenCalled();
  });

  it("handles case-insensitive and trimmed self-invitation attempts", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockUser as never);

    const result = await invitePartnerBypassAction({
      partnerEmail: "  DANCER.LEAD@SALSAEXPLOSION.CO.UK  ",
      role: DanceRole.LEAD,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("You cannot invite your own email address as a dance partner.");
    expect(prisma.partnerWaitlistEntry.create).not.toHaveBeenCalled();
  });

  it("returns idempotent active reservation if partner is already PAIRED", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.partnerWaitlistEntry.findFirst).mockResolvedValue({
      id: "existing-entry-123",
      userId: mockUser.id,
      partnerEmail: "partner.follow@gmail.com",
      status: "PAIRED",
      role: DanceRole.LEAD,
    } as never);

    const result = await invitePartnerBypassAction({
      partnerEmail: "partner.follow@gmail.com",
      role: DanceRole.LEAD,
    });

    expect(result.success).toBe(true);
    expect(result.data?.entryId).toBe("existing-entry-123");
    expect(result.message).toContain("already have an active paired reservation");
    expect(prisma.partnerWaitlistEntry.create).not.toHaveBeenCalled();
  });

  it("successfully creates a PAIRED waitlist entry when inviting a valid external partner", async () => {
    vi.mocked(getOrProvisionCurrentUser).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.partnerWaitlistEntry.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.partnerWaitlistEntry.create).mockResolvedValue({
      id: "new-entry-456",
      userId: mockUser.id,
      partnerEmail: "partner.follow@gmail.com",
      role: DanceRole.LEAD,
      status: "PAIRED",
    } as never);

    const result = await invitePartnerBypassAction({
      partnerEmail: "partner.follow@gmail.com",
      role: DanceRole.LEAD,
    });

    expect(result.success).toBe(true);
    expect(result.data?.entryId).toBe("new-entry-456");
    expect(result.data?.partnerEmail).toBe("partner.follow@gmail.com");
    expect(prisma.partnerWaitlistEntry.create).toHaveBeenCalledWith({
      data: {
        userId: mockUser.id,
        role: DanceRole.LEAD,
        partnerEmail: "partner.follow@gmail.com",
        status: "PAIRED",
      },
    });
  });
});
