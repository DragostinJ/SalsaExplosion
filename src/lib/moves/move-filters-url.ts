/**
 * The /moves search and filters live in the address (?q=dame&level=Improver&family=Rueda+call),
 * so the phone's back button, a reload or the "All moves" link brings the dancer's list back.
 */

export interface MoveFilters<Level extends string, Family extends string> {
  query: string;
  level: "ALL" | Level;
  family: "ALL" | Family;
  /** Families opened with "Show all as posters". */
  open: Family[];
}

/** Long enough for any move name; stops a pasted essay ending up in the address. */
export const MAX_QUERY_LENGTH = 80;

const isOneOf = <T extends string>(options: readonly T[], value: string | null): value is T =>
  value !== null && (options as readonly string[]).includes(value);

/** Reads the filters from a query string, dropping anything that isn't a real level or family. */
export function parseMoveFilters<Level extends string, Family extends string>(
  search: string,
  levels: readonly Level[],
  families: readonly Family[]
): MoveFilters<Level, Family> {
  const params = new URLSearchParams(search);
  const level = params.get("level");
  const family = params.get("family");
  const open = (params.get("open") ?? "").split(",").filter((name): name is Family => isOneOf(families, name));
  return {
    query: (params.get("q") ?? "").slice(0, MAX_QUERY_LENGTH),
    level: isOneOf(levels, level) ? level : "ALL",
    family: isOneOf(families, family) ? family : "ALL",
    open: [...new Set(open)],
  };
}

/** The query string for a set of filters: "" when nothing is filtered, so the plain /moves address stays clean. */
export function moveFiltersSearch<Level extends string, Family extends string>(filters: MoveFilters<Level, Family>): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query.slice(0, MAX_QUERY_LENGTH));
  if (filters.level !== "ALL") params.set("level", filters.level);
  if (filters.family !== "ALL") params.set("family", filters.family);
  if (filters.open.length > 0) params.set("open", filters.open.join(","));
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** Session storage key for the dancer's last /moves address, used by "All moves" on each move page. */
export const MOVES_LIST_URL_KEY = "moves:list-url";

/** Only a /moves address is accepted back from storage for the "All moves" link. */
export function safeMovesListUrl(value: string | null): string {
  return value && /^\/moves(\?[^#]*)?$/.test(value) ? value : "/moves";
}
