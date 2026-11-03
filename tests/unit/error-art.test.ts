import { describe, expect, it } from "vitest";
import { ERROR_ART } from "@/lib/error-art";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

describe("error page art", () => {
  it("matches the media manifest entry it copies", () => {
    const { src, width, height } = MEDIA_MANIFEST.mockupGraphics.dizzyDrum;
    expect(ERROR_ART).toEqual({ src, width, height });
  });
});
