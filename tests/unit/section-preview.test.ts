import { describe, it, expect } from "vitest";
import {
  resolveSwipeDirection,
  stepPreviewIndex,
  SWIPE_MIN_DISTANCE_PX,
} from "@/lib/music/section-preview";

describe("NOW card swipe-to-preview", () => {
  it("swiping left previews the next section, swiping right the previous", () => {
    expect(resolveSwipeDirection(-80, 5)).toBe(1);
    expect(resolveSwipeDirection(80, -5)).toBe(-1);
  });

  it("ignores short drags and mostly-vertical scrolls of the card", () => {
    expect(resolveSwipeDirection(-(SWIPE_MIN_DISTANCE_PX - 1), 0)).toBe(0);
    expect(resolveSwipeDirection(-70, 60)).toBe(0); // diagonal scroll
    expect(resolveSwipeDirection(5, 200)).toBe(0); // vertical scroll
  });

  it("steps from the live section when not previewing", () => {
    expect(stepPreviewIndex(null, 3, 1, 9)).toBe(4);
    expect(stepPreviewIndex(null, 3, -1, 9)).toBe(2);
  });

  it("keeps stepping from the previewed section", () => {
    expect(stepPreviewIndex(5, 3, 1, 9)).toBe(6);
    expect(stepPreviewIndex(5, 3, -1, 9)).toBe(4);
  });

  it("returns to live (null) when a step lands on the live section", () => {
    expect(stepPreviewIndex(4, 3, -1, 9)).toBeNull();
    expect(stepPreviewIndex(2, 3, 1, 9)).toBeNull();
  });

  it("clamps at the first and last sections", () => {
    expect(stepPreviewIndex(8, 3, 1, 9)).toBe(8);
    expect(stepPreviewIndex(0, 3, -1, 9)).toBe(0);
    // Live in the last section: swiping forward stays live
    expect(stepPreviewIndex(null, 8, 1, 9)).toBeNull();
  });
});
