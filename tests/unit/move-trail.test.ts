import { describe, expect, it } from "vitest";
import { MAX_TRAIL, nextTrail, parseTrail, previousStop, type TrailStop } from "@/lib/moves/move-trail";

const abajo: TrailStop = { id: "abajo-y-arriba", name: "Abajo y arriba" };
const basico: TrailStop = { id: "paso-basico", name: "Paso básico" };
const guapea: TrailStop = { id: "guapea", name: "Guapea" };

describe("move trail: 'Back to …' between move pages", () => {
  it("adds the move when the dancer tapped a 'learn first' link on the previous move", () => {
    const trail = nextTrail([abajo], basico, { kind: "from-move", moveId: abajo.id });
    expect(trail).toEqual([abajo, basico]);
    expect(previousStop(trail)).toEqual(abajo);
  });

  it("starts afresh when the move was opened from the list, a song or a shared link", () => {
    const trail = nextTrail([abajo, basico], guapea, { kind: "fresh" });
    expect(trail).toEqual([guapea]);
    expect(previousStop(trail)).toBeNull();
  });

  it("does not offer a stale 'Back to' when an old trail move is reopened from the list", () => {
    expect(nextTrail([abajo, basico], basico, { kind: "fresh" })).toEqual([basico]);
  });

  it("steps back along the trail on the back button, keeping the earlier moves", () => {
    const trail = nextTrail([abajo, basico, guapea], basico, { kind: "history" });
    expect(trail).toEqual([abajo, basico]);
    expect(previousStop(trail)).toEqual(abajo);
  });

  it("keeps the trail on a reload", () => {
    expect(nextTrail([abajo, basico], basico, { kind: "history" })).toEqual([abajo, basico]);
  });

  it("follows loops (A → B → A) so back always means the page before", () => {
    const loop = nextTrail([abajo, basico], abajo, { kind: "from-move", moveId: basico.id });
    expect(loop).toEqual([abajo, basico, abajo]);
    expect(previousStop(loop)).toEqual(basico);
    // Back from the second Abajo lands on Paso básico, whose own back is the first Abajo
    expect(nextTrail(loop, basico, { kind: "history" })).toEqual([abajo, basico]);
  });

  it("branches from where the dancer actually was after going back", () => {
    // Abajo → Paso básico, back to Abajo, then a different link from Abajo
    const back = nextTrail([abajo, basico], abajo, { kind: "history" });
    expect(nextTrail(back, guapea, { kind: "from-move", moveId: abajo.id })).toEqual([abajo, guapea]);
  });

  it("caps the trail length", () => {
    let trail: TrailStop[] = [{ id: "m-0", name: "Move 0" }];
    for (let i = 1; i < MAX_TRAIL + 5; i++) {
      trail = nextTrail(trail, { id: `m-${i}`, name: `Move ${i}` }, { kind: "from-move", moveId: `m-${i - 1}` });
    }
    expect(trail).toHaveLength(MAX_TRAIL);
    expect(trail.at(-1)?.id).toBe(`m-${MAX_TRAIL + 4}`);
  });

  it("reads only well-formed stops back from storage", () => {
    expect(parseTrail(null)).toEqual([]);
    expect(parseTrail("not json")).toEqual([]);
    expect(parseTrail('{"id":"x"}')).toEqual([]);
    expect(
      parseTrail(JSON.stringify([abajo, { id: "javascript:alert(1)", name: "x" }, { id: "guapea" }, basico]))
    ).toEqual([abajo, basico]);
  });
});
