/**
 * The first part of every page and API address the app has (one per folder in src/app).
 * proxy.ts only asks for sign-in on these: any other address isn't a page, so it gets the
 * normal "page not found" instead of a sign-in wall. tests/unit/route-segments.test.ts fails
 * when a folder is added without being listed here, so a new private page can't slip through.
 */
export const APP_ROUTE_SEGMENTS: ReadonlySet<string> = new Set([
  "about",
  "admin",
  "api",
  "cartel",
  "checkin",
  "classes",
  "dashboard",
  "events",
  "how-it-works",
  "instructor",
  "llms.txt",
  "mockups",
  "moves",
  "music",
  "pricing",
  "private-lessons",
  "review",
  "rueda",
  "schedule",
  "shop",
  "sign-in",
  "sign-up",
  "terms",
  "venues",
]);

/** True when the address can't be any page of the app (its first part matches no route folder). */
export function isUnknownRoute(pathname: string): boolean {
  const first = pathname.split("/")[1] ?? "";
  return first !== "" && !APP_ROUTE_SEGMENTS.has(first);
}
