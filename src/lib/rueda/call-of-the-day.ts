import { RUEDA_CALLS, type RuedaCall } from "@/lib/rueda/rueda-calls-dictionary";

/**
 * "La llamada del día": one rueda call per Bournemouth calendar day, the same for everyone that
 * day, cycling through the whole dictionary before any call repeats.
 */
export function callOfTheDay(now: Date = new Date(), calls: readonly RuedaCall[] = RUEDA_CALLS): RuedaCall {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(now); // YYYY-MM-DD
  const day = Math.floor(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) / 86_400_000);
  return calls[day % calls.length];
}
