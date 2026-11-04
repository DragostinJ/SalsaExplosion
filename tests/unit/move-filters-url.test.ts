import { describe, expect, it } from "vitest";
import { MAX_QUERY_LENGTH, moveFiltersSearch, parseMoveFilters, safeMovesListUrl } from "@/lib/moves/move-filters-url";

const LEVELS = ["Beginner", "Improver", "Intermediate", "Advanced"] as const;
const FAMILIES = ["Casino figure", "Rueda call", "Shine"] as const;

describe("/moves filters in the address", () => {
  it("is a clean /moves when nothing is filtered", () => {
    expect(moveFiltersSearch({ query: "", level: "ALL", family: "ALL", open: [] })).toBe("");
    expect(parseMoveFilters("", LEVELS, FAMILIES)).toEqual({ query: "", level: "ALL", family: "ALL", open: [] });
  });

  it("round-trips a search, level, family and opened families", () => {
    const filters = { query: "dame", level: "Improver", family: "Rueda call", open: ["Shine", "Casino figure"] } as const;
    const search = moveFiltersSearch({ ...filters, open: [...filters.open] });
    expect(search).toBe("?q=dame&level=Improver&family=Rueda+call&open=Shine%2CCasino+figure");
    expect(parseMoveFilters(search, LEVELS, FAMILIES)).toEqual({ ...filters, open: [...filters.open] });
  });

  it("keeps accents and spaces in the search", () => {
    const search = moveFiltersSearch({ query: "vacílala dos", level: "ALL", family: "ALL", open: [] });
    expect(parseMoveFilters(search, LEVELS, FAMILIES).query).toBe("vacílala dos");
  });

  it("drops levels and families that don't exist", () => {
    expect(parseMoveFilters("?level=Expert&family=Tango&open=Tango,Shine,Shine", LEVELS, FAMILIES)).toEqual({
      query: "",
      level: "ALL",
      family: "ALL",
      open: ["Shine"],
    });
  });

  it("caps a very long search", () => {
    const parsed = parseMoveFilters(`?q=${"a".repeat(500)}`, LEVELS, FAMILIES);
    expect(parsed.query).toHaveLength(MAX_QUERY_LENGTH);
  });

  it("only sends 'All moves' back to a /moves address", () => {
    expect(safeMovesListUrl("/moves?q=dame")).toBe("/moves?q=dame");
    expect(safeMovesListUrl("/moves")).toBe("/moves");
    expect(safeMovesListUrl(null)).toBe("/moves");
    expect(safeMovesListUrl("https://evil.example/moves")).toBe("/moves");
    expect(safeMovesListUrl("//evil.example")).toBe("/moves");
    expect(safeMovesListUrl("/movesevil")).toBe("/moves");
  });
});
