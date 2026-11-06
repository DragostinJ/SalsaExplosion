/**
 * What the door scanner tells the person on the door. Pure, so the action and the tests share it.
 * Every answer comes from the database at the moment of the scan, so a pass bought a minute ago works.
 */

export interface DoorPassRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  tierName: string;
  dancerName: string;
  role: string;
  paymentStatus: string;
  checkedIn: boolean;
  checkedInAt: Date | null;
}

export type DoorPassVerdict =
  | { kind: "not_found"; code: string }
  | { kind: "wrong_event"; eventTitle: string; dancerName: string }
  | { kind: "not_paid"; dancerName: string; paymentStatus: string }
  | { kind: "already_in"; registrationId: string; dancerName: string; tierName: string; checkedInAtIso: string | null }
  | { kind: "valid"; registrationId: string; dancerName: string; tierName: string; role: string };

export function classifyDoorPass(pass: DoorPassRecord | null, doorEventId: string, code: string): DoorPassVerdict {
  if (!pass) return { kind: "not_found", code };
  if (pass.eventId !== doorEventId) return { kind: "wrong_event", eventTitle: pass.eventTitle, dancerName: pass.dancerName };
  if (pass.paymentStatus !== "PAID") return { kind: "not_paid", dancerName: pass.dancerName, paymentStatus: pass.paymentStatus };
  if (pass.checkedIn) {
    return {
      kind: "already_in",
      registrationId: pass.id,
      dancerName: pass.dancerName,
      tierName: pass.tierName,
      checkedInAtIso: pass.checkedInAt ? pass.checkedInAt.toISOString() : null,
    };
  }
  return { kind: "valid", registrationId: pass.id, dancerName: pass.dancerName, tierName: pass.tierName, role: pass.role };
}

/** The event the door is most likely for: the one running now or next. A party runs past midnight, so allow 6 hours after its end. */
export function defaultDoorEventId(events: readonly { id: string; startDateIso: string; endDateIso: string }[], now: Date): string {
  const sixHours = 6 * 60 * 60 * 1000;
  const sorted = [...events].sort((a, b) => Date.parse(a.startDateIso) - Date.parse(b.startDateIso));
  const current = sorted.find((event) => Date.parse(event.endDateIso) + sixHours >= now.getTime());
  return (current ?? sorted.at(-1))?.id ?? "";
}
