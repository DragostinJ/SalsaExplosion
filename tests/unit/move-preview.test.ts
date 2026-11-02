import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getAllMoves,
  getPublishedMoves,
  getVisibleMoves,
  isDraftPreviewEnabled,
} from "@/lib/moves/move-library";

describe("move library local preview", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows approved moves only by default", () => {
    vi.stubEnv("MOVE_LIBRARY_PREVIEW", "");
    expect(isDraftPreviewEnabled()).toBe(false);
    expect(getVisibleMoves()).toEqual(getPublishedMoves());
  });

  it("never shows drafts in a production build, even with the switch set", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MOVE_LIBRARY_PREVIEW", "drafts");
    expect(isDraftPreviewEnabled()).toBe(false);
    expect(getVisibleMoves()).toEqual(getPublishedMoves());
  });

  it("lists the drafts too in local development with the switch set", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MOVE_LIBRARY_PREVIEW", "drafts");
    expect(isDraftPreviewEnabled()).toBe(true);
    expect(getVisibleMoves().length).toBe(getAllMoves().length);
  });
});
