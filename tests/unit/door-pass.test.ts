import { describe, expect, it } from "vitest";
import QRCode from "qrcode";
import { classifyDoorPass, defaultDoorEventId, type DoorPassRecord } from "@/lib/events/door-pass";
import { decodeQrFromRgba } from "@/lib/qr/decode-frame";

const pass: DoorPassRecord = {
  id: "reg-1",
  eventId: "sbk",
  eventTitle: "SB&K Night",
  tierName: "Workshops + Party",
  dancerName: "Ana Lopez",
  role: "FOLLOW",
  paymentStatus: "PAID",
  checkedIn: false,
  checkedInAt: null,
};

describe("classifyDoorPass", () => {
  it("lets a paid pass for tonight's event in", () => {
    expect(classifyDoorPass(pass, "sbk", "RF-PASS-1")).toMatchObject({ kind: "valid", registrationId: "reg-1", dancerName: "Ana Lopez" });
  });

  it("says when a code isn't a pass at all", () => {
    expect(classifyDoorPass(null, "sbk", "RF-PASS-NOPE")).toEqual({ kind: "not_found", code: "RF-PASS-NOPE" });
  });

  it("turns away a pass for a different event, and says which", () => {
    expect(classifyDoorPass(pass, "made-in-cuba", "RF-PASS-1")).toMatchObject({ kind: "wrong_event", eventTitle: "SB&K Night" });
  });

  it("catches a pass that's already been used, with the time", () => {
    const used = { ...pass, checkedIn: true, checkedInAt: new Date("2026-11-14T20:15:00Z") };
    expect(classifyDoorPass(used, "sbk", "RF-PASS-1")).toMatchObject({ kind: "already_in", checkedInAtIso: "2026-11-14T20:15:00.000Z" });
  });

  it.each(["PENDING", "REFUNDED"])("doesn't let a %s pass in", (paymentStatus) => {
    expect(classifyDoorPass({ ...pass, paymentStatus }, "sbk", "RF-PASS-1")).toMatchObject({ kind: "not_paid", paymentStatus });
  });
});

describe("defaultDoorEventId", () => {
  const events = [
    { id: "cuba", startDateIso: "2026-12-04T18:00:00Z", endDateIso: "2026-12-06T23:00:00Z" },
    { id: "sbk", startDateIso: "2026-11-14T20:00:00Z", endDateIso: "2026-11-15T01:00:00Z" },
  ];

  it("picks the next event", () => {
    expect(defaultDoorEventId(events, new Date("2026-11-06T12:00:00Z"))).toBe("sbk");
  });

  it("stays on a party until well after it ends", () => {
    expect(defaultDoorEventId(events, new Date("2026-11-15T00:30:00Z"))).toBe("sbk");
  });

  it("stays on a weekender on its second day", () => {
    expect(defaultDoorEventId(events, new Date("2026-12-05T20:00:00Z"))).toBe("cuba");
  });

  it("falls back to the last event once all have passed", () => {
    expect(defaultDoorEventId(events, new Date("2027-06-01T12:00:00Z"))).toBe("cuba");
  });
});

describe("decodeQrFromRgba", () => {
  it("reads back the same code the pass QR shows", () => {
    const code = "RF-PASS-1A2B3C4D";
    const { modules } = QRCode.create(code, { errorCorrectionLevel: "M" });
    const scale = 6;
    const quiet = 4 * scale;
    const size = modules.size * scale + quiet * 2;
    const data = new Uint8ClampedArray(size * size * 4).fill(255);
    for (let row = 0; row < modules.size; row++) {
      for (let col = 0; col < modules.size; col++) {
        if (!modules.get(row, col)) continue;
        for (let y = 0; y < scale; y++) {
          for (let x = 0; x < scale; x++) {
            const at = ((quiet + row * scale + y) * size + quiet + col * scale + x) * 4;
            data[at] = 0;
            data[at + 1] = 0;
            data[at + 2] = 0;
          }
        }
      }
    }
    expect(decodeQrFromRgba(data, size, size)).toBe(code);
  });

  it("returns nothing for a frame with no code in it", () => {
    expect(decodeQrFromRgba(new Uint8ClampedArray(64 * 64 * 4).fill(255), 64, 64)).toBeNull();
  });
});
