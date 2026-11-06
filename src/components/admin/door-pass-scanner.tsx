"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { LiveQrCameraScanner } from "@/components/admin/live-qr-camera-scanner";
import { toggleEventRegistrationCheckInAction, verifyEventPassAction } from "@/actions/management.actions";
import { defaultDoorEventId, type DoorPassVerdict } from "@/lib/events/door-pass";
import { POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

interface DoorEvent {
  id: string;
  title: string;
  startDateIso: string;
  endDateIso: string;
}

interface DoorPassScannerProps {
  events: readonly DoorEvent[];
  onCheckedIn: (registrationId: string) => void;
}

function arrivalTime(iso: string | null): string {
  if (!iso) return "";
  const time = new Date(iso).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
  return ` at ${time}`;
}

const VERDICT_STYLE = {
  good: "border-poster-teal bg-poster-teal text-ink",
  warn: "border-poster-mustard bg-poster-mustard text-ink",
  bad: "border-poster-red bg-poster-red text-ink",
};

/** One scan, one clear answer: let them in, or say why not. */
export function DoorPassScanner({ events, onCheckedIn }: DoorPassScannerProps) {
  const [eventId, setEventId] = useState(() => defaultDoorEventId(events, new Date()));
  const [typedCode, setTypedCode] = useState("");
  const [verdict, setVerdict] = useState<DoorPassVerdict | null>(null);
  const [letIn, setLetIn] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const verify = (code: string) => {
    const clean = code.trim();
    if (!clean || !eventId) return;
    setProblem(null);
    setLetIn(null);
    startTransition(async () => {
      const res = await verifyEventPassAction({ code: clean, eventId });
      if (res.success) {
        setVerdict(res.data);
        setTypedCode("");
      } else {
        setVerdict(null);
        setProblem(res.error.message);
      }
    });
  };

  const checkIn = (registrationId: string, dancerName: string) => {
    setProblem(null);
    startTransition(async () => {
      const res = await toggleEventRegistrationCheckInAction({ registrationId, checkedIn: true });
      if (res.success) {
        setVerdict(null);
        setLetIn(dancerName);
        onCheckedIn(registrationId);
      } else {
        setProblem(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-3" data-testid="door-pass-scanner">
      <label className="block space-y-1 text-xs font-bold">
        <span>Door for</span>
        <select
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value);
            setVerdict(null);
            setLetIn(null);
          }}
          className="min-h-[44px] w-full border-2 border-ink bg-paper px-3 text-sm font-semibold text-ink"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </label>

      <LiveQrCameraScanner onDetected={verify} continuous buttonLabel="Open Camera Pass Scanner" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(typedCode);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          aria-label="Type the code from a dancer's pass"
          value={typedCode}
          onChange={(e) => setTypedCode(e.target.value)}
          placeholder="Or type the code: RF-PASS-..."
          autoCapitalize="characters"
          className="min-h-[44px] w-full min-w-0 border-2 border-ink bg-paper px-3 font-mono text-sm text-ink"
        />
        <button type="submit" disabled={isPending} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} min-h-[44px] shrink-0 px-4 text-xs`}>
          Check
        </button>
      </form>

      <div role="status" aria-live="polite" className="space-y-2">
        {isPending && (
          <p className="flex items-center gap-2 text-xs font-bold">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking…
          </p>
        )}

        {letIn && (
          <p className={`border-4 p-4 font-bold ${VERDICT_STYLE.good}`} data-testid="door-result">
            {letIn} is checked in. Scan the next one.
          </p>
        )}

        {problem && (
          <p className={`border-4 p-4 font-bold ${VERDICT_STYLE.bad}`} data-testid="door-result">
            {problem}
          </p>
        )}

        {verdict?.kind === "valid" && (
          <div className={`space-y-3 border-4 p-4 ${VERDICT_STYLE.good}`} data-testid="door-result">
            <p className="font-display text-3xl leading-none">Valid pass</p>
            <p className="font-bold">
              {verdict.dancerName} · {verdict.tierName}
            </p>
            <button
              type="button"
              disabled={isPending}
              onClick={() => checkIn(verdict.registrationId, verdict.dancerName)}
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} w-full text-sm`}
            >
              Let in
            </button>
          </div>
        )}

        {verdict?.kind === "already_in" && (
          <div className={`space-y-1 border-4 p-4 ${VERDICT_STYLE.bad}`} data-testid="door-result">
            <p className="font-display text-3xl leading-none">Already used</p>
            <p className="font-bold">
              {verdict.dancerName} · {verdict.tierName} came in{arrivalTime(verdict.checkedInAtIso)}.
            </p>
          </div>
        )}

        {verdict?.kind === "wrong_event" && (
          <div className={`space-y-1 border-4 p-4 ${VERDICT_STYLE.bad}`} data-testid="door-result">
            <p className="font-display text-3xl leading-none">Wrong event</p>
            <p className="font-bold">
              {verdict.dancerName}&apos;s pass is for {verdict.eventTitle}.
            </p>
          </div>
        )}

        {verdict?.kind === "not_paid" && (
          <div className={`space-y-1 border-4 p-4 ${VERDICT_STYLE.bad}`} data-testid="door-result">
            <p className="font-display text-3xl leading-none">Not paid</p>
            <p className="font-bold">
              {verdict.dancerName}&apos;s pass is {verdict.paymentStatus === "REFUNDED" ? "refunded" : "still waiting for payment"}.
            </p>
          </div>
        )}

        {verdict?.kind === "not_found" && (
          <div className={`space-y-1 border-4 p-4 ${VERDICT_STYLE.warn}`} data-testid="door-result">
            <p className="font-display text-3xl leading-none">No pass found</p>
            <p className="break-all font-mono text-sm font-bold">{verdict.code}</p>
          </div>
        )}
      </div>
    </div>
  );
}
