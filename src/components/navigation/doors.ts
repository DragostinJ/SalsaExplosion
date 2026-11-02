/**
 * The app's three doors (plus your own carnet). Everything a dancer needs sits behind one of
 * them: Clases (timetable, door prices, venue), Canciones (song practice, rueda calls, moves),
 * Fiestas (festivals and special events, the only things paid online) and Mi carnet (your pass).
 */
export interface Door {
  id: "clases" | "canciones" | "fiestas" | "carnet";
  label: string;
  english: string;
  href: string;
  /** Path prefixes that belong to this door */
  matches: readonly string[];
}

export const DOORS: readonly Door[] = [
  { id: "clases", label: "Clases", english: "Classes", href: "/classes", matches: ["/classes", "/schedule", "/venues", "/pricing"] },
  { id: "canciones", label: "Canciones", english: "Songs & practice", href: "/music", matches: ["/music", "/rueda", "/moves"] },
  { id: "fiestas", label: "Fiestas", english: "Festivals & parties", href: "/events", matches: ["/events"] },
  { id: "carnet", label: "Mi carnet", english: "My pass", href: "/dashboard/carnet", matches: ["/dashboard/carnet", "/dashboard/wallet", "/dashboard/progression"] },
];

export function isDoorActive(door: Door, pathname: string): boolean {
  return door.matches.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
