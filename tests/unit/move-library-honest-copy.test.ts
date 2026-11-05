import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getPublishedMoves, isTeacherChecked } from "@/lib/moves/move-library";

/**
 * The /moves page used to promise "counts and videos, checked by the teachers" while no move had
 * a video and no teacher had checked one. These promises may come back once the library earns them.
 */
describe("the /moves page only promises what the library has", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src/app/moves/page.tsx"), "utf8");
  const moves = getPublishedMoves();

  it("does not promise videos until a move has one", () => {
    if (moves.some((move) => move.videos.length > 0)) return;
    expect(page).not.toMatch(/\bvideos?\b/i);
  });

  it("does not say the moves are checked by the teachers until every one is", () => {
    if (moves.every((move) => isTeacherChecked(move))) return;
    expect(page).not.toMatch(/checked by (the )?teachers/i);
  });
});
