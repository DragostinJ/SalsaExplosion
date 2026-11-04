import { describe, expect, it } from "vitest";
import { clampDescription, moveTitle } from "@/lib/seo/search-snippets";
import { getVisibleMoves } from "@/lib/moves/move-library";

describe("move page titles and descriptions for search results", () => {
  it("keeps the brand when it fits, drops it before the move name", () => {
    expect(moveTitle("Dile Que No").absolute).toBe("Dile Que No: how to dance it | Salsa Explosion");
    expect(moveTitle("Rueda de Casino Level 1 Essentials").absolute).toBe("Rueda de Casino Level 1 Essentials: how to dance it");
    expect(moveTitle("Mid-Figure Rhythm Reversals & Son/Casino Contrapunto Explained").absolute).toBe(
      "Mid-Figure Rhythm Reversals & Son/Casino Contrapunto Explained"
    );
  });

  it("fits every short-enough move name in 60 characters", () => {
    for (const move of getVisibleMoves()) {
      const name = move.spanishName ?? move.name;
      if (name.length <= 60) expect(moveTitle(name).absolute.length).toBeLessThanOrEqual(60);
    }
  });

  it("cuts descriptions at a whole word", () => {
    const long = "Casino figure · Beginner. " + "The leader guides the follower across the slot ".repeat(6);
    const out = clampDescription(long);
    expect(out.length).toBeLessThanOrEqual(155);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
    expect(clampDescription("Short and sweet.")).toBe("Short and sweet.");
  });
});
