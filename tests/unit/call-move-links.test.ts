import { describe, expect, it } from "vitest";
import { callSlug, moveIdForCall } from "@/lib/rueda/call-move-links";
import { RUEDA_CALLS } from "@/lib/rueda/rueda-calls-dictionary";
import { getVisibleMoves } from "@/lib/moves/move-library";

describe("rueda dictionary -> move library links", () => {
  const ids = new Set(getVisibleMoves().map((m) => m.id));

  it("slugs call names the way move ids are written", () => {
    expect(callSlug("Enchufla (Enchufe)")).toBe("enchufla");
    expect(callSlug("Príncipe Bueno / Príncipe Malo")).toBe("principe-bueno-principe-malo");
    expect(callSlug("Pa'Fuera (Casino Afuera)")).toBe("pa-fuera");
  });

  it("links calls the library combines into one entry", () => {
    expect(moveIdForCall("El Uno", ids)).toBe("dedo-el-uno-el-dos");
    expect(moveIdForCall("Siete Loco", ids)).toBe("siete-y-siete-loco");
  });

  it("only ever links to a move page that exists", () => {
    for (const call of RUEDA_CALLS) {
      const id = moveIdForCall(call.name, ids);
      if (id) expect(ids.has(id)).toBe(true);
    }
    expect(moveIdForCall("Not a call", ids)).toBeNull();
  });

  it("links most of the dictionary", () => {
    const linked = RUEDA_CALLS.filter((call) => moveIdForCall(call.name, ids)).length;
    expect(linked).toBeGreaterThanOrEqual(30);
  });
});
