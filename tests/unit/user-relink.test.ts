import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique, update } = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique, update } } }));

import { relinkUserByVerifiedEmail } from "@/lib/user-relink";

describe("relinkUserByVerifiedEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("moves an existing account to the new Clerk id, keeping the same row", async () => {
    findUnique.mockResolvedValue({ id: "user_1", clerkId: "old_id", email: "ana@example.com" });
    update.mockResolvedValue({ id: "user_1", clerkId: "new_id" });
    expect(await relinkUserByVerifiedEmail("new_id", "ana@example.com")).toBe(true);
    expect(update).toHaveBeenCalledWith({ where: { id: "user_1" }, data: { clerkId: "new_id" } });
  });

  it("does nothing for someone new", async () => {
    findUnique.mockResolvedValue(null);
    expect(await relinkUserByVerifiedEmail("new_id", "new@example.com")).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("does nothing when the account already has this Clerk id", async () => {
    findUnique.mockResolvedValue({ id: "user_1", clerkId: "same_id" });
    expect(await relinkUserByVerifiedEmail("same_id", "ana@example.com")).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });
});
