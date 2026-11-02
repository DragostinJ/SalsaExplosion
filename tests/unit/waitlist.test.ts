import { describe, it, expect } from "vitest";

describe("Partner Waitlist Retirement Guard", () => {
  it("verifies partner waitlist actions have been retired (everyone dances)", async () => {
    const managementActions = await import("@/actions/management.actions");
    expect((managementActions as Record<string, unknown>).updatePartnerWaitlistStatusAction).toBeUndefined();
    expect((managementActions as Record<string, unknown>).autoPairWaitlistDancersAction).toBeUndefined();
  });
});
